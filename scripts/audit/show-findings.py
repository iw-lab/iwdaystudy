#!/usr/bin/env python3
"""판정용 보기: 원문이 확인된 지적을 파일·줄 순으로, 실제 줄 내용과 함께 보여 준다(같은 줄 지적은 묶음).
  python3 scripts/audit/show-findings.py <파일 일부> [--from N] [--to N]"""
import json, sys, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
key = sys.argv[1]
fr = int(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else 0
to = int(sys.argv[sys.argv.index("--to") + 1]) if "--to" in sys.argv else 10**9
rows = [json.loads(l) for l in open(os.path.join(ROOT, "scripts/audit/out/findings.jsonl"))]
rows = [r for r in rows if key in r["file"] and r["verified"] and fr <= r["line"] <= to]
by = collections.defaultdict(list)
for r in rows: by[(r["file"], r["line"])].append(r)
cache = {}
for (f, ln) in sorted(by):
    if f not in cache: cache[f] = open(os.path.join(ROOT, f), encoding="utf-8").read().split("\n")
    L = cache[f]; src = L[ln - 1].strip(); k = ln
    while "}" not in src and k < len(L) and k < ln + 6:
        src += " " + L[k].strip(); k += 1
    print(f"■ {ln}: {src[:260]}")
    for r in by[(f, ln)]:
        print(f"    [{r['lane'][:2]}|{r['type'][:4]}] «{r['quote'][:50]}» ⇒ {r['fix'][:90]}  — {r['why'][:70]}")
print(f"({len(by)}줄 · {len(rows)}건)")
