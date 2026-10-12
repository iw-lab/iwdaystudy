#!/usr/bin/env python3
"""원천 문항 파일을 외부 AI 검수용 조각으로 자른다(줄번호 유지 → 지적을 파일:줄로 되짚는다).

  python3 scripts/audit/build-review-chunks.py [--kb 20]
  → scripts/audit/out/chunks/<번호>-<파일>-L<시작>.txt  ·  chunks/index.json

들여쓰기·빈 줄·주석 줄은 빼서 크기를 줄인다(줄번호는 원본 기준).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "src", "lib", "curriculum")
OUT = os.path.join(ROOT, "scripts", "audit", "out", "chunks")
KB = int(sys.argv[sys.argv.index("--kb") + 1]) if "--kb" in sys.argv else 20

FILES = [
    "grade1.ts", "grade2.ts", "grade3.ts", "grade3_suffix.ts", "grade4.ts", "grade5.ts", "grade6.ts",
    "korean-reading-data.ts",
    "generators/math-generator.ts", "generators/spelling-generator.ts", "generators/vocab-generator.ts",
    "generators/hanja-generator.ts", "generators/english-generator.ts", "generators/knowledge-generator.ts",
    "generators/science-social-generator.ts", "generators/safety-generator.ts",
    "generators/writing-creative-generator.ts", "generators/reading-generator.ts", "generators/adj-predicative.ts",
]
HANGUL = re.compile(r"[가-힣]")


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    index = []
    n = 0
    for rel in FILES:
        path = os.path.join(SRC, rel)
        lines = open(path, encoding="utf-8").read().split("\n")
        buf, size, start = [], 0, None
        def flush():
            nonlocal buf, size, start, n
            if not buf:
                return
            n += 1
            name = f"{n:03d}-{os.path.basename(rel).replace('.ts','')}-L{start}.txt"
            head = f"# 파일 src/lib/curriculum/{rel} · 줄 {start}~{last}\n"
            open(os.path.join(OUT, name), "w", encoding="utf-8").write(head + "\n".join(buf) + "\n")
            index.append({"chunk": name, "file": f"src/lib/curriculum/{rel}", "from": start, "to": last, "bytes": size})
            buf, size, start = [], 0, None
        last = 0
        pend, pend_start = [], None
        def emit(row_start, text):
            nonlocal buf, size, start, last
            row = f"{row_start}: {text}"
            if start is None:
                start = row_start
            buf.append(row)
            size += len(row.encode()) + 1
            last = row_start
            if size >= KB * 1024:
                flush()
        for i, ln in enumerate(lines, 1):
            t = ln.strip()
            if not t or t.startswith("//") or t.startswith("*") or t.startswith("/*"):
                continue
            if not HANGUL.search(t) and len(t) > 100:
                t = t[:100] + "…"
            # 여러 줄 객체는 한 줄로 합친다(닫는 괄호에서 끊는다)
            if pend_start is None:
                pend_start = i
            pend.append(t)
            joined = " ".join(pend)
            if re.search(r"[}\]],?$|;$|\)$", t) or len(joined) > 700 or not t.endswith(("{", "[", ",", "(", ":")):
                if len(joined) > 700 or re.search(r"[}\]],?$|;$|\)$|[\"'`],?$", t) or not t.endswith(("{", "[", ",", "(")):
                    emit(pend_start, joined)
                    pend, pend_start = [], None
        if pend:
            emit(pend_start, " ".join(pend))
        flush()
    json.dump(index, open(os.path.join(OUT, "index.json"), "w"), ensure_ascii=False, indent=1)
    tot = sum(x["bytes"] for x in index)
    print(f"조각 {len(index)}개 · {tot // 1024}KB")


if __name__ == "__main__":
    main()
