#!/usr/bin/env python3
"""독해 데이터 정리: ① 같은 학년 배열 안의 «완전히 같은 문항» 중복 제거 ② 초등에 맞지 않는 주제(자살·근친·
윤리 사고실험·양자역학 등 중·고등 개념) 지문 제거. 학년별 남은 개수를 찍는다(너무 줄면 멈춘다).
  python3 scripts/audit/prune-reading.py [--apply]"""
import re, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, "src/lib/curriculum/korean-reading-data.ts")
APPLY = "--apply" in sys.argv
BAN = ["목숨을 끊", "자살", "눈을 찌르", "오이디푸스", "트롤리 딜레마", "불확정성", "이중 슬릿", "파동-입자", "후성유전학",
       "교차성", "페미니즘", "포스트 트루스", "흑인에게", "양심적 병역 거부", "패러다임 전환", "장-뇌 축", "기본 소득제",
       "체르노빌", "네트워크 효과"]
src = open(P, encoding="utf-8").read().split("\n")
out, cur, seen, kept, dropped = [], None, set(), {}, {}
for ln in src:
    m = re.match(r"export const (grade\d)ReadingData", ln)
    if m: cur = m.group(1); seen = set(); kept[cur] = 0; dropped[cur] = [0, 0]
    if cur and ln.lstrip().startswith("{ passage:"):
        key = ln.strip().rstrip(",")
        if key in seen: dropped[cur][0] += 1; continue
        if any(b in ln for b in BAN): dropped[cur][1] += 1; continue
        seen.add(key); kept[cur] += 1
    out.append(ln)
for g in kept: print(f"{g}: 남김 {kept[g]} · 중복 뺌 {dropped[g][0]} · 주제 뺌 {dropped[g][1]}")
if min(kept.values()) < 40: sys.exit("❌ 한 학년이 40문항 밑으로 — 멈춤")
if APPLY: open(P, "w", encoding="utf-8").write("\n".join(out)); print("✅ 적용")
