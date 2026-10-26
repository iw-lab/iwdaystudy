#!/usr/bin/env python3
"""독해 조합형 생성기의 «틀»을 검수한다 — 문항은 주제 표에서 찍혀 나오므로 표를 고치면 수만 문항이 함께 고쳐진다.

  3~4학년 TOPICS_34: 사실·학년 적합 · keyFact 가 지문만으로 풀리는가 · 같은 주제의 그럴듯한 «틀린 문장» 3개(falses)
  5~6학년 TOPICS_56: 사실·학년 적합 · main/detail/meaning 물음이 지문만으로 풀리고 답이 하나인가
  1~2학년 G12: 동물 소리·먹이가 맞는가 · 그 동물에게 어울리는 장소·행동

  python3 scripts/audit/review/review-topics.py   → verdicts/topics/*.json (있으면 건너뜀)
"""
import concurrent.futures as cf, json, os, re, subprocess, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "verdicts" / "topics"
MODEL = os.environ.get("REVIEW_MODEL", "sonnet")
# 검수에 Opus 금지(사용자 2026-10-26 «오푸스 쓰지마 검수에, 토큰 겁나 단다») — 대량 검수는 sonnet 이하만
if "opus" in MODEL.lower() or "fable" in MODEL.lower() or "mythos" in MODEL.lower():
    raise SystemExit(f"REVIEW_MODEL={MODEL} 금지 — 검수는 sonnet/haiku 만(사용자 지시 2026-10-26)")
T = json.load(open(HERE / "reading-topics.json"))

COMMON = """당신은 한국 초등학교 교사이자 2022 개정 교육과정 국어 성취기준 검수자입니다. 아침활동 앱의 독해 문항을 찍어 내는 «주제 표»를 검수합니다.
반드시 JSON 배열 하나만 출력하세요. 입력 주제마다 하나씩, 순서대로."""

P34 = COMMON + """
지문은 이렇게 만들어진다: «(도입) {definition}. 먼저, {features[0]}. 그리고 {features[1]}. 또한 {features[2]}. (마무리)». 도입은 «여러분, {subject}을/를 아시나요?» 같은 문장.
여기서 나오는 물음: ① {subject}에 대한 설명으로 알맞은 것은?(정답 definition) ② {subject}의 특징으로 알맞은 것은?(정답 features 중 하나) ③ keyFact.q(정답 keyFact.a, 보기 keyFact.pool) ④ {subject}의 특징이 아닌 것은?
판정(주제마다):
- v: keep | fix | drop (사실 오류를 고칠 수 없거나 초등에 부적절하면 drop)
- fit: {"3": ok|too_easy|too_hard, "4": ...}
- p: 고칠 필드만 {"definition": "...", "features": [3개]} (문체는 «~요» 그대로, 마침표 없이)
- keyFact: 지문(definition+features)만 읽고 답할 수 있고 보기 중 답이 하나뿐이면 "keep". 아니면 지문으로 풀리게 다시 쓴 {"q","a","pool"(a 포함 4개)} 또는 null(뺀다).
- falses: 이 주제에 대해 «틀린» 문장 3개. 지문 문체(«~요», 마침표 없이), 지문 문장과 비슷한 길이·꼴로 그럴듯하지만 지문과 사실에 비추어 분명히 틀린 것. 다른 주제 이야기를 가져오지 말고 이 주제의 말로. ②의 오답과 ④의 정답으로 쓰인다.
- note: 한 줄(문제 있을 때만)
출력 항목: {"subject","v","fit","p","keyFact","falses","note"}"""

P56 = COMMON + """
지문은 이렇게 만들어진다: «(도입) {lead}. (연결) 먼저, {evidence[0]}. 또한 {evidence[1]}. 그리고 {evidence[2]}. 이러한 점에서 {conclusion}. (마무리)».
여기서 나오는 물음: main.q(정답 main.a, 보기 main.pool) · detail.q(정답 detail.a, 보기 detail.pool) · meaning.q(있으면).
판정(주제마다):
- v: keep | fix | drop · fit: {"5": ok|too_easy|too_hard, "6": ...}
- p: 고칠 필드만. lead/evidence/conclusion 사실 오류, 또는 main/detail/meaning 이 지문만으로 풀리지 않거나 답이 둘 이상이거나 오답이 너무 뻔하면 그 물음 객체 전체를 다시 써서 넣는다({"q","a","pool"(a 포함 4개)}). 물음을 뺄 땐 값을 null.
- note: 한 줄(문제 있을 때만)
출력 항목: {"subject","v","fit","p","note"}"""

P12 = COMMON + """
1~2학년 독해 지문은 표에서 낱말을 골라 «{name}이/가 {place}에서 {activity}. …» «{name}이/가 "{sound}" 하고 울었어요. {name}은/는 {food}이/가 먹고 싶었나 봐요.» 처럼 만든다.
인물(subjects)마다 판정:
- ok: sound(울음소리)·food(먹이)가 그 동물에 맞으면 true
- fix: 틀렸으면 {"sound": "...", "food": "..."} (고칠 것만)
- places: 주어진 장소 목록(places) 중 이 인물이 있어도 1~2학년이 어색하게 느끼지 않을 곳만(원래 이름 그대로)
- activities: 주어진 행동 목록(activities) 중 이 인물이 해도 자연스러운 것만(원래 문자열 그대로). 동물이 «노래를 불렀어요»처럼 의인화는 그림책 수준이면 허용.
출력 항목: {"name","ok","fix","places","activities","note"}"""


def ask(system, user, n):
    # 하위 세션은 훅을 끈다 — 사용자 전역 Stop 훅이 돌면 마지막 답이 JSON 대신 훅 응답이 된다(2026-10-26 실측)
    last = ""
    for attempt in range(3):
        try:
            r = subprocess.run(["claude", "-p", "--model", MODEL, "--tools", "", "--system-prompt", system, "--output-format", "json",
                                "--settings", json.dumps({"disableAllHooks": True})],  # 하위 세션 훅 끔(전역 Stop 훅이 돌면 답이 JSON 대신 훅 응답이 된다)
                               input=user, capture_output=True, text=True, timeout=1200)
            res = json.loads(r.stdout)
            arr = json.loads(re.search(r"\[.*\]", res.get("result", ""), re.S).group(0))
            if len(arr) < n:
                raise ValueError(f"{len(arr)}/{n}")
            return arr, res.get("total_cost_usd")
        except Exception as e:  # noqa: BLE001
            last = str(e)[:200]
            time.sleep(15 * (attempt + 1))
    raise RuntimeError(last)


def job(name, system, user, n):
    dst = OUT / f"{name}.json"
    if dst.exists():
        return f"{name} skip"
    arr, cost = ask(system, user, n)
    dst.write_text(json.dumps({"name": name, "model": MODEL, "cost": cost, "verdicts": arr}, ensure_ascii=False, indent=1))
    return f"{name} ok {len(arr)}"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = []
    t34 = T["TOPICS_34"]
    for i in range(0, len(t34), 15):
        part = t34[i:i + 15]
        jobs.append((f"t34-{i // 15:02d}", P34, "주제 표(3~4학년):\n" + "\n".join(json.dumps(t, ensure_ascii=False) for t in part), len(part)))
    t56 = T["TOPICS_56"]
    for i in range(0, len(t56), 13):
        part = t56[i:i + 13]
        jobs.append((f"t56-{i // 13:02d}", P56, "주제 표(5~6학년):\n" + "\n".join(json.dumps(t, ensure_ascii=False) for t in part), len(part)))
    g = T["G12_SUBJECTS"]
    jobs.append(("g12-00", P12, json.dumps({"places": T["G12_PLACES"], "activities": T["G12_ACTIVITIES"], "subjects": g}, ensure_ascii=False), len(g)))
    with cf.ThreadPoolExecutor(3) as ex:
        for f in cf.as_completed([ex.submit(job, *j) for j in jobs]):
            try:
                print(f.result(), flush=True)
            except Exception as e:  # noqa: BLE001
                print("FAIL", e, flush=True)
    print("TOPICS-DONE", flush=True)


if __name__ == "__main__":
    main()
