#!/usr/bin/env python3
"""문제 은행 전수검수 — entries-g<학년>.jsonl 항목을 묶어 Claude(구독 CLI)에게 판정받는다.

판정 = 학년·성취기준 적합 / 정답이 맞고 하나뿐인가 / 주어진 것만으로 풀 수 있는가 / 문장이 바른가 / 오답 보기.
결과는 묶음마다 verdicts/g<학년>/<풀>-<번호>.json 로 남는다(이미 있으면 건너뛴다 — 끊겨도 이어서).

  python3 scripts/audit/review/run-review.py --grades 4 --pools knowledge --limit 1      # 시범 한 묶음
  python3 scripts/audit/review/run-review.py --jobs 6                                    # 전부
  REVIEW_MODEL=opus python3 ... (기본 sonnet — CLI 별칭)
"""
import argparse, concurrent.futures as cf, json, os, re, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "verdicts"
MODEL = os.environ.get("REVIEW_MODEL", "sonnet")
SKIP_POOLS = {"koreanReading", "math"}  # 독해 = 주제 단위 검수(review-reading.py), 수학 = 기계검증(verify-math) + 틀 검수
BATCH = {"writing": 120, "spelling": 60, "english": 50}
DEFAULT_BATCH = 60

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
    "spelling": "맞춤법. q1·q2 두 문장 중 answer 번(1 또는 2)이 맞춤법이 바른 문장이다. 다른 하나는 틀린 문장이어야 한다.",
    "writing": "글쓰기 주제. 아이가 50자 이상 쓴다.",
    "synonymPairs": "비슷한말 짝 고르기.",
    "antonymPairs": "반대말 짝 고르기.",
    "idioms": "관용 표현(expression)·예문(example)을 보고 뜻(meaning)을 4지선다로 고른다.",
    "multiMeaningWords": "여러 뜻을 가진 낱말 — 뜻과 예문(낱말은 빈칸)을 보고 낱말을 고른다.",
    "wordPuzzles": "뜻·글자 수·첫 글자·끝 글자를 보고 낱말을 고른다.",
}
NEEDS_X = {"knowledge", "safety", "creative", "science", "social", "korean", "vocab", "english"}

SYSTEM = """당신은 한국 초등학교 교사이자 2022 개정 교육과정 성취기준 검수자입니다. 아침활동 학습 앱의 문항 은행을 항목 단위로 검수합니다.
각 항목마다 아래를 판정하세요.
1. 정답이 사실로 맞고, 하나뿐인가 (다른 답도 맞을 수 있으면 문제)
2. 주어진 정보만으로 그 학년 아이가 풀 수 있는가 (빈칸이 정답을 그대로 드러내거나, 문장 안에 답이 이미 보이면 문제)
3. 학년 적합: 이 학년(또는 그 이전 학년) 교육과정·성취기준 범위인가. 상위 학년·중학교 내용이거나 이 학년 아이가 모를 낱말·개념이면 too_hard. 이 학년보다 두 학년 이상 아래 수준으로 지나치게 쉬우면 too_easy.
4. 문장이 자연스럽고 바른 한국어인가 (빈칸에 정답을 넣은 문장까지)
5. 초등학생에게 부적절한 내용이 없는가

판정 v:
- "keep": 문제없음
- "fix": 고치면 쓸 수 있음 — p 에 고친 필드만 넣는다(원래 필드 이름 그대로, 예: {"text": "...", "answer": "..."}). 빈칸 문장은 ___ 를 그대로 쓴다.
- "drop": 못 씀 (정답 오류를 고칠 수 없음, 풀 수 없음, too_hard, too_easy, 부적절 등)
why: 문제 종류 코드 배열 — wrong, ambiguous, unsolvable, leak, too_hard, too_easy, grammar, inappropriate, other. keep 이면 [].
note: 한 줄 설명(한국어, keep 이면 생략).
x: 오답 보기 3개 — 요청된 경우에만, keep·fix 항목에 대해. 정답과 같은 종류·같은 꼴(낱말이면 비슷한 길이의 낱말, 수면 수, 사람이면 사람)이고 그 학년 아이에게 그럴듯하지만 분명히 틀린 것. 빈칸에 넣었을 때 문법은 맞아야 한다. 정답과 뜻이 같은 말, 정답이 될 수도 있는 말 금지. 글자 조각·무의미한 말 금지.

반드시 JSON 배열 하나만 출력하세요. 항목마다 {"k": 키, "v": ..., "why": [...], "note": "...", "p": {...}, "x": [...]} . 입력 항목 수와 같은 개수, 순서대로."""


def load(g):
    f = HERE / f"entries-g{g}.jsonl"
    return [json.loads(l) for l in open(f)] if f.exists() else []


def chunks(rows, n):
    for i in range(0, len(rows), n):
        yield i // n, rows[i:i + n]


def prompt_for(g, pool, rows):
    items = [{"k": r["key"], **({"학기": r["sem"]} if pool != "writing" else {}), **r["entry"]} for r in rows]
    ask_x = "각 항목에 x(오답 보기 3개)를 넣으세요." if pool in NEEDS_X else "x 는 넣지 마세요."
    return (f"학년: 초등 {g}학년\n풀: {pool} — {HOW.get(pool, '')}\n{ask_x}\n항목 {len(items)}개:\n"
            + "\n".join(json.dumps(it, ensure_ascii=False) for it in items))


def parse(text):
    m = re.search(r"\[.*\]", text, re.S)
    if not m:
        raise ValueError("JSON 배열 없음")
    return json.loads(m.group(0))


def run_batch(g, pool, idx, rows):
    dst = OUT / f"g{g}" / f"{pool}-{idx:04d}.json"
    if dst.exists():
        return "skip"
    dst.parent.mkdir(parents=True, exist_ok=True)
    p = prompt_for(g, pool, rows)
    last = ""
    for attempt in range(3):
        try:
            r = subprocess.run(["claude", "-p", "--model", MODEL, "--tools", "", "--system-prompt", SYSTEM,
                                "--output-format", "json"], input=p, capture_output=True, text=True, timeout=900)
            res = json.loads(r.stdout)
            text = res.get("result", "")
            arr = parse(text)
            keys = [r_["key"] for r_ in rows]
            got = {a.get("k"): a for a in arr if isinstance(a, dict)}
            missing = [k for k in keys if k not in got]
            if len(missing) > len(keys) * 0.1:
                raise ValueError(f"빠진 항목 {len(missing)}/{len(keys)}")
            dst.write_text(json.dumps({"g": g, "pool": pool, "idx": idx, "model": MODEL, "keys": keys,
                                       "verdicts": [got[k] for k in keys if k in got], "missing": missing,
                                       "cost": res.get("total_cost_usd")}, ensure_ascii=False))
            return f"ok {len(got)}/{len(keys)}"
        except Exception as e:  # noqa: BLE001 — 재시도 후 기록
            last = f"{type(e).__name__}: {str(e)[:200]}"
            time.sleep(10 * (attempt + 1))
    (OUT / "errors.log").open("a").write(f"g{g} {pool} {idx} {last}\n")
    return "fail " + last


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--grades", default="1,2,3,4,5,6")
    ap.add_argument("--pools", default="")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--limit", type=int, default=0, help="묶음 수 상한(시범)")
    a = ap.parse_args()
    want = set(filter(None, a.pools.split(",")))
    tasks = []
    for g in map(int, a.grades.split(",")):
        by = {}
        for r in load(g):
            if r["pool"] in SKIP_POOLS or (want and r["pool"] not in want):
                continue
            by.setdefault(r["pool"], []).append(r)
        for pool, rows in sorted(by.items()):
            rows.sort(key=lambda r: r["key"])
            for idx, ch in chunks(rows, BATCH.get(pool, DEFAULT_BATCH)):
                tasks.append((g, pool, idx, ch))
    if a.limit:
        tasks = tasks[:a.limit]
    print(f"묶음 {len(tasks)} · 모델 {MODEL} · 동시 {a.jobs}", flush=True)
    done = 0
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        futs = {ex.submit(run_batch, *t): t for t in tasks}
        for f in cf.as_completed(futs):
            g, pool, idx, _ = futs[f]
            done += 1
            print(f"[{done}/{len(tasks)}] g{g} {pool} {idx}: {f.result()}", flush=True)
    print("REVIEW-RUN-DONE", flush=True)


if __name__ == "__main__":
    main()
