#!/usr/bin/env python3
"""판정이 끝난 내용 수정을 적용한다. 입력 = TSV 줄: 파일(curriculum/ 기준)\t줄\t원문\t새말
원문은 그 줄 ±3 안에(줄 0 이면 파일 전체에서) 정확히 한 번 있어야 한다(아니면 실패로 알리고 건너뛴다). 적용 내역은 out/applied-edits.tsv 에 쌓는다.
  python3 scripts/audit/apply-edits.py edits.tsv [--apply]"""
import sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = sys.argv[1]; apply = "--apply" in sys.argv
files = {}; bad = 0; ok = 0
for raw in open(src, encoding="utf-8"):
    if not raw.strip() or raw.startswith("#"): continue
    f, ln, old, new = raw.rstrip("\n").split("\t")
    p = os.path.join(ROOT, "src/lib/curriculum", f)
    L = files.setdefault(p, open(p, encoding="utf-8").read().split("\n"))
    ln = int(ln)
    # 새말이 문자열 리터럴이면 안쪽에 맨 따옴표가 있으면 안 된다(검수자 fix 에 객체째 들어온 사고 · 2026-10-12)
    inner = lambda x: x.startswith('"') and x.endswith('"') and '"' in x[1:-1].replace('\\"', '')
    if inner(new) and not inner(old):
        print(f"❌ {f}:{ln} 새말 안에 따옴표 «{new[:60]}»"); bad += 1; continue
    # 줄 0 = 파일 전체에서 딱 한 곳(줄이 밀린 뒤 고칠 때)
    rng = range(len(L)) if ln == 0 else range(max(0, ln - 4), min(len(L), ln + 3))
    hit = [k for k in rng if L[k].count(old) == 1]
    if len(hit) != 1:
        print(f"❌ {f}:{ln} «{old}» 찾음 {len(hit)}"); bad += 1; continue
    L[hit[0]] = L[hit[0]].replace(old, new); ok += 1
if apply:
    for p, L in files.items(): open(p, "w", encoding="utf-8").write("\n".join(L))
    with open(os.path.join(ROOT, "scripts/audit/out/applied-edits.tsv"), "a", encoding="utf-8") as w:
        w.write(open(src, encoding="utf-8").read())
print(f"성공 {ok} · 실패 {bad}" + (" · 적용" if apply else " · 미리보기"))
