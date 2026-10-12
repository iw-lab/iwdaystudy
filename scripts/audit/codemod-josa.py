#!/usr/bin/env python3
"""`${식}조사` 를 `${withJosa(String(식), "종류")}` 로 바꾼다(템플릿 문자열 안).
분수 `${a}/${b}조사` 는 분자 기준으로 읽는다 → withJosa(`${a}/${b}`, 종류, String(a)).
python3 scripts/audit/codemod-josa.py FILE… [--dry]
"""
import re, sys
KIND = {"는": "은/는", "은": "은/는", "이": "이/가", "가": "이/가", "을": "을/를", "를": "을/를",
        "과": "과/와", "와": "과/와", "으로": "으로/로", "로": "으로/로", "라는": "이라는/라는", "이라는": "이라는/라는",
        "라고": None, "이라고": None}
JOSA = "이라는|라는|으로|는|은|이|가|을|를|과|와|로"
# 분수: ${A}/${B}조사
FRAC = re.compile(r"\$\{([^{}]+)\}/\$\{([^{}]+)\}(" + JOSA + r")(?=[ `,.\n'\"?!)])")
ONE = re.compile(r"(?<![/}])\$\{([^{}]+)\}('?)(" + JOSA + r")(?=[ `,.\n'\"?!)])")
dry = "--dry" in sys.argv
for f in [a for a in sys.argv[1:] if not a.startswith("--")]:
    s = open(f, encoding="utf-8").read()
    n = 0
    out = []
    for line in s.split("\n"):
        if "`" not in line or "withJosa" in line or line.strip().startswith("//"):
            out.append(line); continue
        def frac(m):
            global n
            n += 1
            return f'${{withJosa(`${{{m.group(1)}}}/${{{m.group(2)}}}`, "{KIND[m.group(3)]}", String({m.group(1)}))}}'
        def one(m):
            global n
            k = KIND.get(m.group(3))
            if not k: return m.group(0)
            n += 1
            q = m.group(2)
            inner = f"`${{{m.group(1)}}}{q}`" if q else f"String({m.group(1)})"
            read = f", String({m.group(1)})" if q else ""
            return f'${{withJosa({inner}, "{k}"{read})}}'
        line2 = FRAC.sub(frac, line)
        line2 = ONE.sub(one, line2)
        out.append(line2)
    s2 = "\n".join(out)
    if n and "withJosa" not in s.split("\n", 40)[0:40].__str__():
        if 'from "@/lib/korean-josa"' in s2:
            s2 = re.sub(r'import \{([^}]*)\} from "@/lib/korean-josa";', lambda m: m.group(0) if "withJosa" in m.group(1) else f'import {{{m.group(1).rstrip()}, withJosa }} from "@/lib/korean-josa";', s2, count=1)
        else:
            s2 = re.sub(r"^(import [^\n]+\n)", r'\1import { withJosa } from "@/lib/korean-josa";\n', s2, count=1, flags=re.M)
    print(f"{f}: {n}곳")
    if not dry: open(f, "w", encoding="utf-8").write(s2)
