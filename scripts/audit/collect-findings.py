#!/usr/bin/env python3
"""외부 AI 전수검수 결과(gpt/*.json · grok/*.json · xv/*/gemini.raw)를 한 표로 모은다.
  python3 scripts/audit/collect-findings.py [--md out.md]  → out/findings.jsonl
각 지적은 파일:줄 · 원문(quote) · 종류 · 고칠 말 · 레인. 원문이 그 줄에 실제로 없으면 «unverified» 로 표시(환각 거르기).
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "scripts", "audit", "out")
REV = os.path.join(OUT, "review")
idx = {c["chunk"].replace(".txt", ""): c for c in json.load(open(os.path.join(OUT, "chunks", "index.json")))}


def arrays(text):
    """답 안의 JSON 배열(여러 개·조각 섞임)을 객체 단위로 긁는다."""
    dec = json.JSONDecoder()
    out, i = [], 0
    while True:
        j = text.find("[", i)
        if j < 0:
            break
        try:
            v, end = dec.raw_decode(text[j:])
            if isinstance(v, list):
                out.extend(x for x in v if isinstance(x, dict))
            i = j + end
        except Exception:
            i = j + 1
    if not out:  # 배열이 깨졌으면 객체만이라도
        for m in re.finditer(r"\{[^{}]*\}", text):
            try:
                out.append(json.loads(m.group(0)))
            except Exception:
                pass
    return out


rows = []
def add(chunk, lane, items):
    c = idx.get(chunk)
    if not c:
        return
    for it in items:
        line = it.get("line")
        where = it.get("where") or ""
        m = re.search(r":(\d+)", str(where))
        if line is None and m:
            line = int(m.group(1))
        try:
            line = int(line)
        except Exception:
            line = None
        rows.append({
            "file": c["file"], "line": line, "chunk": chunk, "lane": lane,
            "quote": str(it.get("quote") or "")[:200], "type": str(it.get("type") or it.get("sev") or ""),
            "why": str(it.get("why") or "")[:200], "fix": str(it.get("fix") or "")[:300],
        })

for f in glob.glob(os.path.join(REV, "gpt", "*.json")):
    add(os.path.basename(f)[:-5], "gpt", arrays(open(f, encoding="utf-8").read()))
for f in glob.glob(os.path.join(REV, "grok", "*.json")):
    try:
        for r in json.load(open(f, encoding="utf-8")):
            add(str(r.get("id")), "grok", arrays(r.get("answer") or ""))
    except Exception:
        pass
for d in glob.glob(os.path.join(REV, "xv", "*")):
    g = os.path.join(d, "gemini.raw")
    if os.path.exists(g):
        add(os.path.basename(d), "gemini", arrays(open(g, encoding="utf-8").read()))

# 원문 확인: 지적한 줄(±2) 에 quote 가 실제로 있는가
cache = {}
for r in rows:
    path = os.path.join(ROOT, r["file"])
    if path not in cache:
        cache[path] = open(path, encoding="utf-8").read().split("\n")
    L = cache[path]
    q = r["quote"].strip().strip("'\"")
    ok = False
    if r["line"] and q:
        for k in range(max(1, r["line"] - 2), min(len(L), r["line"] + 2) + 1):
            if q[:25] in L[k - 1]:
                ok = True
                r["line"] = k
                break
    r["verified"] = ok

with open(os.path.join(OUT, "findings.jsonl"), "w", encoding="utf-8") as w:
    for r in rows:
        w.write(json.dumps(r, ensure_ascii=False) + "\n")
by = {}
for r in rows:
    by.setdefault(r["lane"], [0, 0])
    by[r["lane"]][0] += 1
    by[r["lane"]][1] += r["verified"]
print(f"지적 {len(rows)}건 · 원문 확인 {sum(r['verified'] for r in rows)}건 ·", {k: f'{v[1]}/{v[0]}' for k, v in by.items()})
