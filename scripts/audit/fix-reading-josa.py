#!/usr/bin/env python3
"""독해 데이터의 «낱말+조사» 받침 불일치를 고친다(의사은→의사는, 소년가→소년이, 소방차을→소방차를).

이 파일은 이름 칸에 낱말을 끼워 넣어 만든 문장이 많아 조사가 낱말 받침과 따로 논다
(2026-10-12 GPT·Grok 전수검수가 같은 꼴을 수십 건씩 지적).
오탐 방지(셋 다 만족할 때만 고친다):
  ① 낱말이 두 글자 이상(«먹는»·«있는» 같은 한 글자 줄기는 건드리지 않는다)
  ② 고친 꼴(낱말+맞는 조사)이 같은 파일 안 어딘가에 실제로 쓰였다
  ③ «음악가·탐험가»처럼 «가»로 끝나는 낱말, «소아과»처럼 «과»로 끝나는 낱말은 제외
  python3 scripts/audit/fix-reading-josa.py [--apply] [FILE]
"""
import re, sys, collections

PATH = next((a for a in sys.argv[1:] if not a.startswith("--")), "src/lib/curriculum/korean-reading-data.ts")
APPLY = "--apply" in sys.argv

def jong(ch):
    c = ord(ch) - 0xAC00
    return c % 28 if 0 <= c <= 11171 else -1

PAIR = {"은": "는", "는": "은", "이": "가", "가": "이", "을": "를", "를": "을", "과": "와", "와": "과"}
WITH_B = {"은", "이", "을", "과"}
NO_FIX_SUFFIX_NOUNS = {"음악가", "예술가", "탐험가", "전문가", "작곡가", "건축가", "사진가", "소설가", "무용가", "정치가",
                       "사업가", "평론가", "발명가", "모험가", "등산가", "애호가", "운동가", "작가", "화가", "만화가", "조각가",
                       "영양가", "춘향가", "심청가", "흥부가", "수궁가", "적벽가", "애국가", "응원가", "자장가", "주제가", "교가", "축가", "찬송가", "물가", "주가", "원가", "정가", "대가", "단가", "평가", "휴가", "부가", "시가",
                       "소아과", "내과", "외과", "치과", "안과", "학과", "교과", "결과", "효과", "사과"}
TOK = re.compile(r"([가-힣]{2,})(은|는|이|가|을|를|과|와)(?=[\s.,!?\"'’”)~]|$)")

src = open(PATH, encoding="utf-8").read()
# 문자열 리터럴 안만 본다
LIT = re.compile(r'"(?:[^"\\\n]|\\.)*"')
present = set()
for m in LIT.finditer(src):
    for t in re.findall(r"[가-힣]+", m.group(0)):
        present.add(t)

fixes = collections.Counter()
def fix_lit(m):
    s = m.group(0)
    def rep(t):
        w, j = t.group(1), t.group(2)
        if w + j in NO_FIX_SUFFIX_NOUNS:
            return t.group(0)
        b = jong(w[-1]) > 0
        want = j if (b == (j in WITH_B)) else PAIR[j]
        if want == j:
            return t.group(0)
        if (w + want) not in present:
            return t.group(0)
        fixes[f"{w}{j}→{w}{want}"] += 1
        return w + want
    return TOK.sub(rep, s)

out = LIT.sub(fix_lit, src)
tot = sum(fixes.values())
print(f"고칠 곳 {tot}건 · 종류 {len(fixes)}")
for k, v in fixes.most_common(60):
    print(f"  {v:4d}  {k}")
if APPLY and tot:
    open(PATH, "w", encoding="utf-8").write(out)
    print("✅ 적용")
