#!/usr/bin/env python3
"""propose-edits 의 후보 중 승인한 번호만 apply-edits 형식(TSV)으로 바꿔 적용한다.
  python3 scripts/audit/accept-proposals.py out/proposals-X.tsv --skip 20,45 [--apply]"""
import sys, os, subprocess
p = sys.argv[1]
skip = set(sys.argv[sys.argv.index("--skip") + 1].split(",")) if "--skip" in sys.argv else set()
rows = [l.rstrip("\n").split("\t") for l in open(p, encoding="utf-8") if l.strip()]
tmp = p + ".accepted"
with open(tmp, "w", encoding="utf-8") as w:
    for n, f, ln, old, new in rows:
        if n in skip: continue
        w.write(f"{f}\t{ln}\t{old}\t{new}\n")
here = os.path.dirname(os.path.abspath(__file__))
args = ["python3", os.path.join(here, "apply-edits.py"), tmp] + (["--apply"] if "--apply" in sys.argv else [])
sys.exit(subprocess.call(args))
