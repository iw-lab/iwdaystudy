#!/usr/bin/env python3
"""문제 은행 전수검수 — entries-g<학년>.jsonl 항목을 묶어 «8way 외부 레인»에 나눠 맡겨 판정받는다.

판정 = 학년·성취기준 적합 / 정답이 맞고 하나뿐인가 / 주어진 것만으로 풀 수 있는가 / 문장이 바른가 / 오답 보기.
결과는 묶음마다 verdicts/b<학년군>/<풀>-agy-<첫키>.json 로 남는다(이미 판정받은 항목은 키로 빼고 묶는다 — 끊겨도 이어서).

🔴 검수는 8way 레인으로 (사용자 2026-10-26 «검수같은 작업은 8way로 이용하는걸로 코드에 박아» · «검수에 클로드 쓰지마»).
   레인 = agy(Gemini CLI)·codex(GPT, codex-validate.sh)·grok(xAI CLI, grok-validate.sh)·gptweb·geminiweb·grokweb·meta(Llama).
   레인마다 일꾼이 큐에서 묶음을 하나씩 가져간다(묶음 하나 = 레인 하나). 실패한 레인은 쉬게 하고 묶음은 다른 레인이 받는다.
   Claude(claude -p)는 이 하네스에서 부를 길이 없다 — 레인 이름에 claude 가 오면 시작하지 않는다.

  python3 scripts/audit/review/run-review.py --bands 2 --pools knowledge --limit 1 --lanes agy   # 시범 한 묶음
  python3 scripts/audit/review/run-review.py                                                     # 전부(기본 레인 풀)
"""
import argparse, json, os, re, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "verdicts"
H = Path.home() / ".claude"
VPY = str(H / "venvs/vibes/bin/python")
EIGHTWAY = {"agy", "codex", "grok", "gptweb", "geminiweb", "grokweb", "meta"}  # Claude 제외 8way 레인
DEFAULT_LANES = "agy,agy,codex,gptweb,geminiweb,grokweb,meta"
MODEL = subprocess.run([str(H / "bin/model-pin.py"), "agy"], capture_output=True, text=True).stdout.strip() or "agy-default"
WD = Path(os.environ.get("TMPDIR", "/tmp")) / "araharu-review-lanes"  # 레인 일꾼마다 빈 폴더(같은 폴더면 agy 가 서로 막혔다 — 2026-10-26 실측 13분 정지)
WEB_INSTR = "첨부 파일 맨 앞의 지시대로, 파일 안 항목 전부를 판정해 JSON 배열 하나만 답하라. 다른 말은 쓰지 마라."


def _files(wid, user):
    d = WD / wid
    d.mkdir(parents=True, exist_ok=True)
    bundle = d / "bundle.txt"
    bundle.write_text(SYSTEM + "\n\n" + user, encoding="utf-8")
    raw = d / "raw.txt"
    raw.unlink(missing_ok=True)
    return d, bundle, raw


def call_lane(lane, wid, user):
    """레인 하나에 묶음 하나를 묻는다 → 답 글자. 실패면 예외."""
    d, bundle, raw = _files(wid, user)
    if lane == "agy":
        r = subprocess.run(["agy", "-p", SYSTEM + "\n\n" + user, "--model", MODEL, "--mode", "plan", "--output-format", "json",
                            "--print-timeout", "900s"], capture_output=True, text=True, timeout=1000, cwd=d)
        j = json.loads(r.stdout)
        if j.get("status") != "SUCCESS":
            raise ValueError(f"agy {j.get('status')}")
        return j.get("response", "")
    if lane == "codex":
        r = subprocess.run([str(H / "bin/codex-validate.sh"), "--prose", "--timeout", "900", "--instr", SYSTEM, "--cwd", str(d)],
                           input=user, capture_output=True, text=True, timeout=1000)
        if r.returncode != 0:
            raise ValueError(f"codex rc={r.returncode} {r.stderr[-200:]}")
        return r.stdout
    if lane == "grok":  # CLI 는 큰 입력을 스스로 잘라 가짜 초록을 낸다 → 7KB 아래로 쪼개 묻고 합친다
        parts, cur = [], []
        for line in user.split("\n"):
            cur.append(line)
            if sum(len(x.encode()) for x in cur) > 3500:  # 지시(~3KB)와 합쳐 7KB 아래
                parts.append("\n".join(cur)); cur = []
        if cur:
            parts.append("\n".join(cur))
        head = user.split("\n항목")[0]
        out = []
        for i, part in enumerate(parts):
            body = part if i == 0 else head + "\n항목(이어서):\n" + part
            # GROK_RAW=1 — 브릿지 자체 렌즈(사실·수치 검수 산문)를 빼고 우리 지시+재료만 보낸다(안 그러면 JSON 대신 산문이 온다)
            r = subprocess.run([str(H / "bin/grok-validate.sh"), "--fast", "--timeout", "600", "--instr", SYSTEM],
                               input=body, capture_output=True, text=True, timeout=700, env={**os.environ, "GROK_RAW": "1"})
            (d / f"grok-{i}.out").write_text(r.stdout + "\n---\n" + r.stderr[-2000:], encoding="utf-8")  # 실패 원인 보관
            if r.returncode != 0:
                raise ValueError(f"grok rc={r.returncode} {r.stderr[-200:]}")
            out.extend(parse(r.stdout))
        return json.dumps(out, ensure_ascii=False)
    if lane in ("gptweb", "geminiweb"):
        jl = d / "job.jsonl"
        jl.write_text(json.dumps({"name": "review", "prompt": WEB_INSTR, "out": str(raw), "files": [str(bundle)]}, ensure_ascii=False) + "\n")
        br = "gpt-web.py" if lane == "gptweb" else "gemini-web.py"
        env = {**os.environ, "GPTWEB_BUSY_AFTER": "30", "GEMINIWEB_NO_AGY": "1"}  # agy 는 따로 일꾼이 있다(같은 통 이중 금지)
        r = subprocess.run([VPY, str(H / "bin" / br), "--batch", str(jl), "--min-chars", "2", "--timeout", "900"],
                           capture_output=True, text=True, timeout=1100, env=env)
        if r.returncode != 0 or not raw.exists():
            raise ValueError(f"{lane} rc={r.returncode} {r.stderr[-200:]}")
        return raw.read_text(encoding="utf-8")
    if lane == "grokweb":
        r = subprocess.run([VPY, str(H / "bin/grok-web.py"), "--file", str(bundle), "--out", str(raw), "--timeout", "600", WEB_INSTR],
                           capture_output=True, text=True, timeout=800, env={**os.environ, "GROKWEB_BUSY_AFTER": "30"})
        if r.returncode != 0 or not raw.exists():
            raise ValueError(f"grokweb rc={r.returncode} {r.stderr[-200:]}")
        return raw.read_text(encoding="utf-8")
    if lane == "meta":
        prof = os.environ.get("VIBES_PROFILE", str(Path.home() / ".vibeflow/profile"))
        if subprocess.run(["python3", str(H / "bin/meta-paid-profiles.py"), "--check", prof]).returncode != 0:
            raise ValueError("meta 무료 프로필 — 유료만")
        r = subprocess.run([VPY, str(H / "bin/meta-ask.py"), "--timeout", "900", "--expect", r"\[", "--file", str(bundle), "--instr", WEB_INSTR],
                           capture_output=True, text=True, timeout=1000)
        if r.returncode != 0:
            raise ValueError(f"meta rc={r.returncode} {r.stderr[-200:]}")
        return r.stdout
    raise SystemExit(f"레인 {lane} 은 8way 검수 레인이 아니다({sorted(EIGHTWAY)}) — Claude 검수 금지(사용자 2026-10-26)")


SKIP_POOLS = {"koreanReading", "math"}  # 독해 = 주제 단위 검수(review-reading.py), 수학 = 기계검증(verify-math) + 틀 검수
BATCH = {"koreanReading": 20, "writing": 80, "spelling": 40, "english": 40, "safety": 40}
DEFAULT_BATCH = 40  # agy 는 프롬프트가 ~18KB 를 넘으면 헤맨다

HOW = {
    "knowledge": "상식. text 의 ___ 자리에 answer 가 들어간다. 화면엔 4지선다(정답+오답 3) 또는 O/X(빈칸을 채운 문장의 참·거짓)로 나온다.",
    "safety": "안전. text 의 ___ 자리에 answer. 4지선다 또는 O/X.",
    "creative": "창의(속담·관용어·사자성어·교과 상식 등). text 의 ___ 자리에 answer. 4지선다 또는 O/X.",
    "science": "과학. text 의 ___ 자리에 answer. 4지선다 또는 O/X.",
    "social": "사회. text 의 ___ 자리에 answer. 4지선다 또는 O/X.",
    "korean": "국어(문법·낱말). text 의 ___ 자리에 answer. 4지선다 또는 O/X.",
    "vocab": "어휘. meanings(뜻풀이·힌트)를 보고 answer 낱말을 4지선다로 고른다(반대로 낱말을 보고 뜻을 고르기도 한다).",
    "hanja": "한자. character(한자)·meaning(훈)·reading(음)·words(그 한자가 든 낱말)·sentence(예문). 훈·음 고르기, 한자 고르기, 그 한자가 든 낱말 고르기로 나온다.",
    "english": "영어. sentence 의 word 를 빈칸으로 두고 translation(우리말 뜻)을 보여 주며 4지선다로 영단어를 고른다.",
    "math": "수학. expression(식·문장제)을 풀면 answer. 같은 틀에서 숫자만 바뀌어 여러 번 나오므로 숫자는 예시다 — 틀(물음 방식·단원·성취기준 standard) 기준으로 판정하라. 정답 계산은 별도 기계검증이 있으니 학년·학기 적합, 물음이 분명한가, 답 입력 방식 안내가 분명한가를 본다.",
    "spelling": "맞춤법. q1·q2 두 문장 중 answer 번(1 또는 2)이 맞춤법이 바른 문장이다. 다른 하나는 틀린 문장이어야 한다.",
    "writing": "글쓰기 주제. 아이가 50자 이상 쓴다.",
    "koreanReading": "독해. passage(지문)를 읽고 question 에 답한다. choices 4개 중 correct 가 정답. 정답은 지문에서 찾거나 지문으로 추론할 수 있어야 하고(배경지식만으로 푸는 문제는 unsolvable), 보기 중 정답이 하나뿐이어야 한다. x 를 주면 보기를 [correct]+x 로 바꾼다 — 지문을 읽어야 가려낼 수 있는 같은 주제의 그럴듯한 오답으로.",
    "synonymPairs": "비슷한말 짝 고르기.",
    "antonymPairs": "반대말 짝 고르기.",
    "idioms": "관용 표현(expression)·예문(example)을 보고 뜻(meaning)을 4지선다로 고른다.",
    "multiMeaningWords": "여러 뜻을 가진 낱말 — 뜻과 예문(낱말은 빈칸)을 보고 낱말을 고른다.",
    "wordPuzzles": "뜻·글자 수·첫 글자·끝 글자를 보고 낱말을 고른다.",
}
NEEDS_X = {"koreanReading", "knowledge", "safety", "creative", "science", "social", "korean", "vocab", "english"}

SYSTEM = """당신은 한국 초등학교 교사이자 2022 개정 교육과정 성취기준 검수자입니다. 아침활동 학습 앱의 문항 은행을 항목 단위로 검수합니다.
각 항목마다 아래를 판정하세요.
1. 정답이 사실로 맞고, 하나뿐인가 (다른 답도 맞을 수 있으면 문제)
2. 주어진 정보만으로 그 학년 아이가 풀 수 있는가 (빈칸이 정답을 그대로 드러내거나, 문장 안에 답이 이미 보이면 문제)
3. 학년 적합(항목의 grades 에 적힌 학년마다 따로): 그 학년(또는 그 이전 학년) 교육과정·성취기준 범위인가. 상위 학년·중학교 내용이거나 그 학년 아이가 모를 낱말·개념이면 too_hard. 그 학년보다 두 학년 이상 아래 수준으로 지나치게 쉬우면 too_easy. 맞으면 ok.
4. 문장이 자연스럽고 바른 한국어인가 (빈칸에 정답을 넣은 문장까지)
5. 초등학생에게 부적절한 내용이 없는가

판정 v:
- "keep": 문제없음
- "fix": 고치면 쓸 수 있음 — p 에 고친 필드만 넣는다(원래 필드 이름 그대로, 예: {"text": "...", "answer": "..."}). 빈칸 문장은 ___ 를 그대로 쓴다.
- "drop": 내용 자체를 못 씀 (정답 오류를 고칠 수 없음, 풀 수 없음, 부적절 등). 학년이 안 맞는 것만으로는 drop 하지 말고 fit 에 적는다.
why: 문제 종류 코드 배열 — wrong, ambiguous, unsolvable, leak, too_hard, too_easy, grammar, inappropriate, other. keep 이면 [].
note: 한 줄 설명(한국어, keep 이면 생략).
x: 오답 보기 3개 — 요청된 경우에만, keep·fix 항목에 대해. 정답과 같은 종류·같은 꼴(낱말이면 비슷한 길이의 낱말, 수면 수, 사람이면 사람)이고 그 학년 아이에게 그럴듯하지만 분명히 틀린 것. 빈칸에 넣었을 때 문법은 맞아야 한다. 정답과 뜻이 같은 말, 정답이 될 수도 있는 말 금지. 글자 조각·무의미한 말 금지.

fit: {"학년": "ok"|"too_easy"|"too_hard"} — grades 의 학년마다(fix 면 고친 뒤 기준). drop 이면 생략.

반드시 JSON 배열 하나만 출력하세요. 항목마다 {"k": 키, "v": ..., "why": [...], "note": "...", "p": {...}, "x": [...], "fit": {...}} . 입력 항목 수와 같은 개수, 순서대로."""


BANDS = {1: (1, 2), 2: (3, 4), 3: (5, 6)}
RECHECK = "--recheck" in sys.argv  # 2차 검수 결과는 recheck- 파일(집계에서 1차를 덮는다)
STATIC_READING = "--static-reading" in sys.argv  # 손으로 쓴 독해 지문(reading-static-g*.jsonl)


def load_band(b):
    """학년군 안에서 같은 항목은 하나로 — k = 항목 내용 해시, keys = [(학년, 앱 키)]"""
    import hashlib
    items = {}
    for g in BANDS[b]:
        f = HERE / (f"reading-static-g{g}.jsonl" if STATIC_READING else f"entries-g{g}.jsonl")
        if not f.exists():
            continue
        for l in open(f):
            r = json.loads(l)
            body = json.dumps(r["entry"], ensure_ascii=False, sort_keys=True)
            k = hashlib.sha1(f"{r['pool']}|{body}".encode()).hexdigest()[:12]
            it = items.setdefault(k, {"key": k, "pool": r["pool"], "entry": r["entry"], "grades": [], "sem": set(), "keys": []})
            if g not in it["grades"]:
                it["grades"].append(g)
            it["sem"].update(r["sem"])
            it["keys"].append([g, r["key"]])
    for it in items.values():
        it["sem"] = sorted(it["sem"])
    return list(items.values())


def chunks(rows, n):
    for i in range(0, len(rows), n):
        yield i // n, rows[i:i + n]


def prompt_for(b, pool, rows):
    body = lambda e: e if isinstance(e, dict) else {"prompt": e}  # 글쓰기 주제는 문자열 하나
    items = [{"k": r["key"], "grades": r["grades"], **({"학기": r["sem"]} if pool != "writing" else {}), **body(r["entry"])} for r in rows]
    ask_x = "각 항목에 x(오답 보기 3개)를 넣으세요." if pool in NEEDS_X else "x 는 넣지 마세요."
    return (f"학년군: 초등 {BANDS[b][0]}~{BANDS[b][1]}학년 (항목마다 grades 에 실제로 나오는 학년)\n풀: {pool} — {HOW.get(pool, '')}\n{ask_x}\n항목 {len(items)}개:\n"
            + "\n".join(json.dumps(it, ensure_ascii=False) for it in items))


def parse(text):
    """답에서 «항목 판정 배열»을 찾는다 — 레인마다 앞뒤 설명·코드펜스·여러 배열이 섞여 온다.
    '[' 자리마다 raw_decode 를 해 보고, k 를 가진 객체가 가장 많은 배열을 고른다.
    살짝 깨진 배열(쉼표 빠짐)은 객체 단위로 건져 낸다."""
    dec = json.JSONDecoder()
    best = []
    for m in re.finditer(r"\[", text):
        try:
            v, _ = dec.raw_decode(text, m.start())
        except ValueError:
            continue
        if isinstance(v, list):
            objs = [x for x in v if isinstance(x, dict) and "k" in x]
            if len(objs) > len(best):
                best = objs
    if not best:  # 객체 단위 구조 — {"k": ...} 로 시작하는 덩어리마다
        for m in re.finditer(r'\{\s*"k"\s*:', text):
            try:
                v, _ = dec.raw_decode(text, m.start())
                if isinstance(v, dict):
                    best.append(v)
            except ValueError:
                continue
    if not best:
        raise ValueError("JSON 배열 없음")
    return best


def run_batch(b, pool, idx, rows, lane, wid):
    """묶음 하나를 레인 하나에 — 성공하면 결과 파일 경로, 실패하면 예외(묶음은 큐로 돌아간다)."""
    dst = OUT / f"b{b}" / f"{'recheck-' if RECHECK else ''}{pool}{'-static' if STATIC_READING else ''}-agy-{rows[0]['key']}.json"  # 이름 = 첫 항목 키
    if dst.exists():
        return "skip"
    dst.parent.mkdir(parents=True, exist_ok=True)
    text = call_lane(lane, wid, prompt_for(b, pool, rows))
    arr = parse(text)
    keys = [r_["key"] for r_ in rows]
    got = {a.get("k"): a for a in arr if isinstance(a, dict)}
    missing = [k for k in keys if k not in got]
    if len(missing) > len(keys) * 0.1:
        raise ValueError(f"빠진 항목 {len(missing)}/{len(keys)}")
    dst.write_text(json.dumps({"band": b, "keymap": {r_["key"]: r_["keys"] for r_ in rows}, "pool": pool, "idx": idx,
                               "model": MODEL if lane == "agy" else lane, "lane": lane, "keys": keys,
                               "verdicts": [got[k] for k in keys if k in got], "missing": missing}, ensure_ascii=False))
    return f"ok {len(got)}/{len(keys)}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bands", default="1,2,3")
    ap.add_argument("--pools", default="")
    ap.add_argument("--lanes", default=DEFAULT_LANES, help="8way 레인 풀(같은 레인을 두 번 쓰면 일꾼 둘)")
    ap.add_argument("--limit", type=int, default=0, help="묶음 수 상한(시범)")
    ap.add_argument("--static-reading", action="store_true")
    ap.add_argument("--recheck", default="", help="이 레인들이 «keep» 한 항목만 다시 묻는다(느슨한 레인 2차 검수, 결과는 recheck- 파일로 덮는다)")
    ap.add_argument("--reverse", action="store_true", help="뒤에서부터(다른 실행과 나눠 맡기 — 겹치면 결과 파일이 있는 묶음은 건너뛴다)")
    a = ap.parse_args()
    want = set(filter(None, a.pools.split(",")))
    # 이미 판정받은 항목(앞선 실행·다른 엔진 결과)은 묶음에서 뺀다 — 묶음 번호가 아니라 항목 키로 센다
    recheck = set(filter(None, a.recheck.split(",")))
    done = set()
    kept_by = set()  # 다시 물을 항목(느슨한 레인이 keep 한 것)
    for f in OUT.glob("b*/*.json"):
        if recheck:
            try:
                d = json.load(open(f))
            except Exception:  # noqa: BLE001
                continue
            if f.name.startswith("recheck-"):
                done.update(f"{d['band']}|{v.get('k')}" for v in d.get("verdicts", []))
            elif (d.get("lane") or d.get("model")) in recheck:
                kept_by.update(f"{d['band']}|{v.get('k')}" for v in d.get("verdicts", []) if v.get("v") == "keep")
            continue
        try:
            d = json.load(open(f))
        except Exception:  # noqa: BLE001
            continue
        if bool(STATIC_READING) != ("-static" in f.name):
            continue
        done.update(f"{d['band']}|{v.get('k')}" for v in d.get("verdicts", []))
    tasks = []
    for g in map(int, a.bands.split(",")):
        by = {}
        for r in load_band(g):
            explicit = r["pool"] in want and r["pool"] != "koreanReading"
            if (r["pool"] in SKIP_POOLS and not STATIC_READING and not explicit) or (want and r["pool"] not in want):
                continue
            if f"{g}|{r['key']}" in done:
                continue
            if recheck and f"{g}|{r['key']}" not in kept_by:
                continue
            by.setdefault(r["pool"], []).append(r)
        for pool, rows in sorted(by.items()):
            rows.sort(key=lambda r: r["key"])
            for idx, ch in chunks(rows, BATCH.get(pool, DEFAULT_BATCH)):
                tasks.append((g, pool, idx, ch))
    if a.reverse:
        tasks = tasks[::-1]
    if a.limit:
        tasks = tasks[:a.limit]
    lanes = [x.strip() for x in a.lanes.split(",") if x.strip()]
    bad = [x for x in lanes if x not in EIGHTWAY]
    if bad:
        raise SystemExit(f"레인 {bad} 금지 — 검수는 8way 외부 레인만({sorted(EIGHTWAY)}). Claude 검수 금지(사용자 2026-10-26)")
    import queue, threading
    q = queue.Queue()
    for t in tasks:
        q.put((t, 0))
    lock = threading.Lock()
    stat = {"done": 0, "fail": 0}
    dead = set()
    print(f"묶음 {len(tasks)} · 레인 {lanes}", flush=True)

    def worker(lane, wid):
        streak = 0
        while True:
            try:
                (g, pool, idx, ch), tries = q.get_nowait()
            except queue.Empty:
                return
            try:
                res = run_batch(g, pool, idx, ch, lane, wid)
                streak = 0
                with lock:
                    stat["done"] += 1
                    print(f"[{stat['done']}/{len(tasks)}] {lane}:{wid} b{g} {pool} {idx}: {res}", flush=True)
            except Exception as e:  # noqa: BLE001 — 묶음은 다른 레인이 다시 받는다
                streak += 1
                msg = f"{type(e).__name__}: {str(e)[:160]}"
                if tries + 1 < 4:
                    q.put(((g, pool, idx, ch), tries + 1))
                else:
                    with lock:
                        stat["fail"] += 1
                    (OUT / "errors.log").open("a").write(f"b{g} {pool} {idx} {lane} {msg}\n")
                print(f"  ✗ {lane}:{wid} b{g} {pool} {idx}: {msg}", flush=True)
                if streak >= 3:  # 연달아 셋 실패한 레인은 이번 실행에서 뺀다(조용히 버티지 않는다)
                    with lock:
                        dead.add(wid)
                    print(f"  ⛔ {lane}:{wid} 연속 실패 3 — 이번 실행에서 뺀다", flush=True)
                    return
                time.sleep(20 * streak)

    th = [threading.Thread(target=worker, args=(ln, f"{ln}{i}"), daemon=True) for i, ln in enumerate(lanes)]
    for t in th:
        t.start()
    for t in th:
        t.join()
    if q.qsize():
        print(f"남은 묶음 {q.qsize()} — 살아 있는 레인이 없다(빠진 레인 {sorted(dead)})", flush=True)
    print(f"끝: 성공 {stat['done']} · 실패 {stat['fail']} · 남음 {q.qsize()}", flush=True)
    print("REVIEW-RUN-DONE", flush=True)


if __name__ == "__main__":
    main()
