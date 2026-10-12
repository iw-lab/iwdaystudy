#!/usr/bin/env python3
"""독해 «두루뭉술한 물음» 변형(이 글에서 알 수 있는 것은? 등)이 원래 물음의 보기·정답을 그대로 달고 있는 결함을 고친다.
같은 지문·같은 보기 묶음·같은 정답을 가진 «구체적인 물음» 짝이 있으면 그 물음으로 되돌린다
(예: 원래 «세금이 쓰이는 곳이 아닌 것은?» 의 정답 «개인의 장난감 구입» 이 «이 글에서 알 수 있는 것은?» 아래 정답으로 붙어 있었다).
짝이 없으면 손대지 않고 목록만 낸다. 같은 지문·같은 물음·같은 정답이 겹치면 하나만 남긴다.
  python3 scripts/audit/fix-generic-stems.py [--apply]"""
import re, os, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, "src/lib/curriculum/korean-reading-data.ts")
APPLY = "--apply" in sys.argv
GENERIC = {"이 글에서 알 수 있는 것은?", "이 글에 대한 설명으로 맞는 것은?", "이 글의 내용으로 맞는 것은?"}
RX = re.compile(r'\{ passage: "((?:[^"\\]|\\.)*)", question: "((?:[^"\\]|\\.)*)", choices: (\[[^\]]*\]), correct: "((?:[^"\\]|\\.)*)"')
lines = open(P, encoding="utf-8").read().split("\n")
spec = {}
for ln in lines:
    m = RX.search(ln)
    if m and m.group(2) not in GENERIC:
        key = (m.group(1), frozenset(re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(3))), m.group(4))
        spec.setdefault(key, m.group(2))
fixed, orphan, dup = 0, [], 0
out, seen = [], set()
for ln in lines:
    m = RX.search(ln)
    if m:
        q = m.group(2)
        if q in GENERIC:
            key = (m.group(1), frozenset(re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(3))), m.group(4))
            if key in spec:
                ln = ln.replace(f'question: "{q}"', f'question: "{spec[key]}"', 1); q = spec[key]; fixed += 1
            else:
                orphan.append((m.group(1)[:40], q, m.group(4)))
        k2 = (m.group(1), q, m.group(4))
        if k2 in seen: dup += 1; continue
        seen.add(k2)
    out.append(ln)
print(f"되돌림 {fixed} · 겹쳐서 뺌 {dup} · 짝 없는 두루뭉술 물음 {len(orphan)}")
for o in orphan[:40]: print("  ?", o)
if APPLY: open(P, "w", encoding="utf-8").write("\n".join(out)); print("✅ 적용")
