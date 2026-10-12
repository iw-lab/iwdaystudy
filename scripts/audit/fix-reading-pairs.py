#!/usr/bin/env python3
"""검수자가 짚은 «낱말+조사» 고침(삼촌가→삼촌이)을 쌍으로 뽑아 독해 데이터 전체에 적용한다.
지적 원문(quote)과 고친 말(fix)을 어절 단위로 맞대어 «앞 낱말 같고 끝 조사만 다른» 어절만 쌍으로 인정한다
(문장을 통째로 바꾼 제안은 쓰지 않는다). 받침 규칙에 맞는 쌍만 남긴다.
  python3 scripts/audit/fix-reading-pairs.py [--apply]"""
import json, os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, "src/lib/curriculum/korean-reading-data.ts")
APPLY = "--apply" in sys.argv
def jong(ch):
    c = ord(ch) - 0xAC00
    return c % 28 if 0 <= c <= 11171 else -1
J = ["으로", "은", "는", "이", "가", "을", "를", "과", "와", "로"]
def ok(w, j):
    b = jong(w[-1])
    if j == "으로": return b > 0 and b != 8
    if j == "로": return b <= 0 or b == 8
    return (b > 0) == (j in ("은", "이", "을", "과"))
PART = {"은": "는", "는": "은", "이": "가", "가": "이", "을": "를", "를": "을", "과": "와", "와": "과", "으로": "로", "로": "으로"}
def split(t):
    for j in J:
        if t.endswith(j) and len(t) > len(j): return t[:-len(j)], j
    return None
pairs = collections.Counter()
for l in open(os.path.join(ROOT, "scripts/audit/out/findings.jsonl"), encoding="utf-8"):
    r = json.loads(l)
    if "korean-reading" not in r["file"]: continue
    q = re.findall(r"[가-힣]+", r["quote"]); f = re.findall(r"[가-힣]+", r["fix"])
    sm = __import__("difflib").SequenceMatcher(None, q, f)
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op != "replace" or a2 - a1 != 1 or b2 - b1 != 1: continue
        x, y = split(q[a1]), split(f[b1])
        if x and y and x[0] == y[0] and PART[x[1]] == y[1] and len(x[0]) >= 2 and not ok(*x) and ok(*y):
            pairs[(q[a1], f[b1])] += 1
src = open(P, encoding="utf-8").read(); out = src; tot = 0
for (a, b), _ in pairs.most_common():
    rx = re.compile(r"(?<![가-힣])" + re.escape(a) + r"(?=[\s.,!?\"'”)~\\]|$)")
    out, k = rx.subn(b, out); tot += k
    print(f"  {a}→{b} ×{k}")
print(f"쌍 {len(pairs)} · 고친 곳 {tot}")
if APPLY: open(P, "w", encoding="utf-8").write(out)
