#!/usr/bin/env python3
"""한자 예문 속 한자어 뒤에 읽기를 붙인다(學校에서 → 學校(학교)에서) — 아이가 못 읽는 글자를 그대로 두지 않는다.
읽기 = 이 데이터의 character/reading 짝 + 앞 단계 사전. 모르는 글자가 하나라도 있으면 그 문장은 건드리지 않고 알린다.
이미 «字(읽기)» / «우리말(字)» 꼴인 자리는 그대로.
  python3 scripts/audit/hanja-reading-gloss.py [--apply]"""
import re, os, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = "--apply" in sys.argv
HAN = "[一-鿿]"
rd = {}
for f in glob.glob(os.path.join(ROOT, "src/lib/curriculum/**/*.ts"), recursive=True):
    s = open(f, encoding="utf-8").read()
    for m in re.finditer(r'(?:character|hanja|char):\s*"(' + HAN + r'+)"[^{}]*?reading:\s*"([가-힣]+)"', s):
        h, r = m.group(1), m.group(2)
        if len(h) == len(r):
            for a, b in zip(h, r): rd.setdefault(a, b)
# 두음법칙 없이 데이터에 없는 흔한 글자 보충
EXTRA = dict(zip("雪春色赤少弟努歲入校韓努萬節段計樂德第電犬館數活熱世職産技術原結論質問答意味知識常記錄想像試驗劃畫展向利便變交義律制態度國", "설춘색적소제노세입교한노만절단계악덕제전견관수활열세직산기술원결론질문답의미지식상기록상상시험획획전향리편변교의률제태도국"))
EXTRA.update(zip("以件儀元克合境壤季己徵收教服束標樣注滿漢環窮謝賴輩過遵", "이건의원극합경양계기징수교복속표양주만한환궁사뢰배과준"))
for k, v in EXTRA.items(): rd.setdefault(k, v)
WORD = {"六月": "유월", "十月": "시월", "音樂": "음악", "計畫": "계획"}
# 두음법칙 전 본음(낱말 가운데에선 본음이 난다: 男女=남녀·勤勞=근로) — 첫 글자일 때만 dueum() 이 바꾼다
rd.update({"女": "녀", "勞": "로", "力": "력", "理": "리", "禮": "례", "歷": "력", "老": "로", "利": "리", "年": "년",
           "流": "류", "論": "론", "量": "량", "良": "량", "旅": "려", "料": "료", "例": "례", "路": "로", "林": "림", "立": "립"})
def dueum(w):
    """첫소리 두음법칙(理解→이해·歷史→역사·女性→여성·老人→노인) + 不 뒤 ㄷ·ㅈ → 부."""
    def dec(c):
        x = ord(c) - 0xAC00; return x // 588, (x % 588) // 28, x % 28
    def com(a, b, c): return chr(0xAC00 + a * 588 + b * 28 + c)
    cs = list(w)
    a, b, c = dec(cs[0])
    if a == 5:  # ㄹ
        a = 11 if b in (2, 6, 7, 12, 17, 20, 3, 13) else 2  # ㅑㅕㅖㅛㅠㅣ(+ㅒ,ㅞ 근사) → ㅇ, 그 밖 → ㄴ
    elif a == 2 and b in (2, 6, 7, 12, 17, 20):  # ㄴ + ㅑㅕㅖㅛㅠㅣ → ㅇ
        a = 11
    cs[0] = com(a, b, c)
    return "".join(cs)
def read_run(run):
    if run in WORD: return WORD[run]
    out = ""
    for i, ch in enumerate(run):
        r = rd[ch]
        if ch == "不" and i + 1 < len(run):
            nxt = rd.get(run[i + 1], "가")
            if (ord(nxt) - 0xAC00) // 588 in (3, 12): r = "부"
        out += r
    return dueum(out)
RUN = re.compile(r"(?<![(])(" + HAN + r"+)(?![(一-鿿])(?!\))")
miss, n = {}, 0
FILES = [f"src/lib/curriculum/grade{g}.ts" for g in (3, 4, 5, 6)]
for f in FILES:
    p = os.path.join(ROOT, f); src = open(p, encoding="utf-8").read()
    def fix(m):
        global n
        s = m.group(1)
        def one(t):
            run = t.group(1)
            if t.start() > 0 and s[t.start() - 1] == "(":
                return run
            if any(c not in rd for c in run):
                for c in run:
                    if c not in rd: miss[c] = miss.get(c, 0) + 1
                return run
            return f"{run}({read_run(run)})"
        ns = re.sub(r"(?<!\()(" + HAN + r"+)(?!\))", one, s)
        if ns != s: n += 1
        return f'sentence: "{ns}"'
    out = re.sub(r'sentence: "([^"]*)"', fix, src)
    if APPLY and out != src: open(p, "w", encoding="utf-8").write(out)
print("읽기 붙인 문장", n, "· 모르는 글자", "".join(sorted(miss)))
