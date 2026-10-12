#!/usr/bin/env python3
"""외부 검수 지적에서 «빈칸 문장» 수정 후보를 자동으로 만든다(판정은 사람이 — 후보만 낸다).
검수자는 정답을 넣은 «고친 문장»을 준다 → 그 안의 정답 자리를 다시 ___ 로 바꿔 새 text 를 만든다.
정답이 고친 문장에 없으면(정답 자체를 바꿔야 하는 경우) 후보를 만들지 않고 «수동» 으로 남긴다.
  python3 scripts/audit/propose-edits.py <파일 일부>  → out/proposals-<키>.tsv  (번호·파일·줄·옛 text·새 text)
"""
import json, os, re, sys, difflib, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
key = sys.argv[1]
rows = [json.loads(l) for l in open(os.path.join(ROOT, "scripts/audit/out/findings.jsonl"))]
rows = [r for r in rows if key in r["file"] and r["verified"]]
cache = {}
out, manual = [], []
seen = set()
for r in sorted(rows, key=lambda r: (r["file"], r["line"])):
    f = r["file"]
    if f not in cache: cache[f] = open(os.path.join(ROOT, f), encoding="utf-8").read().split("\n")
    L = cache[f]
    blob = " ".join(x.strip() for x in L[r["line"] - 1: r["line"] + 4])
    m = re.search(r'text:\s*"([^"]*___[^"]*)"\s*,\s*answer:\s*"([^"]*)"', blob)
    if not m:
        manual.append(r); continue
    text, ans = m.group(1), m.group(2)
    if (f, text) in seen: continue
    fix = r["fix"].strip().strip("'\"«»")
    fix = re.sub(r"^.*?[:：]\s*", "", fix) if ("수정" in fix[:12] or "→" in fix) else fix
    fix = fix.split(" → ")[-1].strip().strip("'\"")
    if "___" in fix:
        new = fix
    elif ans and fix.count(ans) == 1:
        new = fix.replace(ans, "___", 1)
    else:
        manual.append(r); continue
    if new == text or new.count("___") != 1 or '"' in new or "text:" in new: continue
    sim = difflib.SequenceMatcher(None, text, new).ratio()
    seen.add((f, text))
    out.append((f, r["line"], text, new, ans, sim, r["lane"]))
tsv = os.path.join(ROOT, "scripts/audit/out", f"proposals-{key.replace('/', '_').replace('.ts', '')}.tsv")
with open(tsv, "w", encoding="utf-8") as w:
    for i, (f, ln, text, new, ans, sim, lane) in enumerate(out, 1):
        w.write(f"{i}\t{os.path.basename(f)}\t{ln}\t\"{text}\"\t\"{new}\"\n")
for i, (f, ln, text, new, ans, sim, lane) in enumerate(out, 1):
    print(f"{i:3d} {ln:5d} [{ans}] {text}\n          ⇒ {new}")
print(f"\n후보 {len(out)} · 수동 {len(manual)} → {tsv}")
