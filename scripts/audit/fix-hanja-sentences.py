#!/usr/bin/env python3
"""한자 예문에 한자가 «낱말 대신» 홀로 박힌 꼴(火가 나면)을 «불(火)이 나면»으로 바꾼다.
뜻 칸 "뫼 산" 의 첫 낱말(훈)을 우리말로 쓰고, 뒤 조사는 훈의 받침에 맞춘다.
한자가 다른 한자와 붙어 한자어를 이루면(家族·五月) 그대로 둔다. 훈이 관형·용언꼴(작을·큰)이면 바꾸지 않고 목록만 낸다.
  python3 scripts/audit/fix-hanja-sentences.py [--apply]"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILES = [f"src/lib/curriculum/grade{g}.ts" for g in (3, 4, 5, 6)]
APPLY = "--apply" in sys.argv
HAN = r"[一-鿿]"
ENT = re.compile(r'character:\s*"(' + HAN + r')"(?P<mid>[^{}]*?)sentence:\s*"(?P<s>[^"]*)"', re.S)
def jong(ch):
    c = ord(ch) - 0xAC00
    return c % 28 if 0 <= c <= 11171 else -1
PAIR = {"은": ("은", "는"), "는": ("은", "는"), "이": ("이", "가"), "가": ("이", "가"), "을": ("을", "를"), "를": ("을", "를"),
        "과": ("과", "와"), "와": ("과", "와")}
HUN_FIX = {"山": "산", "東": "동쪽", "西": "서쪽", "南": "남쪽", "北": "북쪽", "金": "금", "上": "위", "下": "아래", "後": "뒤", "王": "임금", "天": "하늘", "秋": "가을", "子": "아들", "右": "오른쪽", "左": "왼쪽", "日": "날", "色": "색"}
JOSA = "(으로|로|에서|에게|에는|에도|에|의|은|는|이|가|을|를|과|와|도|만|처럼)"
MANUAL = {"小한 것도 소중하다.": "작은 것도 소중하다.", "밤이 되어 暗해졌다.": "밤이 되어 주위가 어두워졌다.",
          "위로 上을 향해 올라가자.": "위(上)를 향해 올라가자.",
          "부모님께 孝도한다.": "부모님께 효도(孝道)한다.", "家族을 愛한다.": "가족(家族)을 사랑(愛)한다.",
          "善한 心을 가지자.": "착한 마음(心)을 가지자.", "오늘은 좋은 日이다.": "오늘은 좋은 날(日)이다."}
done, skipped = 0, []
for f in FILES:
    p = os.path.join(ROOT, f); src = open(p, encoding="utf-8").read()
    def rep(m):
        global done
        ch, mid, s = m.group(1), m.group("mid"), m.group("s")
        mm = re.search(r'meaning:\s*"([^"]*)"', mid); rr = re.search(r'reading:\s*"([^"]*)"', mid)
        if not mm or not rr or not re.search(r"(?<!" + HAN + r"|\()" + re.escape(ch) + r"(?!" + HAN + r"|\))", s):
            return m.group(0)
        parts = mm.group(1).split(); reading = rr.group(1)
        hun = HUN_FIX.get(ch, parts[0] if len(parts) >= 2 else "")
        last = hun[-1:]
        noun = ch in HUN_FIX or bool(hun) and not (jong(last) in (4, 8) and last not in "날말물불길글돌별발칼달살쌀풀벌일설실술줄알얼올월울문손눈") and not hun.endswith(("할", "될"))
        if s in MANUAL:
            ns = MANUAL[s]
        else:
            def sub(t):
                pre = t.string[:t.start()]
                j, after = t.group(1) or "", t.group(2)
                standalone = (not pre or not re.match(r"[가-힣]", pre[-1])) and not re.match(r"[가-힣]", after or "")
                if not standalone:  # 한자어 한 글자 자리(石탑·세종대王) → 우리 글 소리로
                    return reading + j + (after or "")
                word = hun if noun else reading
                lj = word[-1]
                if j in PAIR: j = PAIR[j][0] if jong(lj) > 0 else PAIR[j][1]
                elif j in ("으로", "로"): j = "으로" if jong(lj) > 0 and jong(lj) != 8 else "로"
                return f"{word}({ch}){j}" + (after or "")
            ns = re.sub(r"(?<!" + HAN + r"|\()" + re.escape(ch) + r"(?!" + HAN + r"|\))" + JOSA + r"?(.?)", sub, s)
        if ns == s: return m.group(0)
        done += 1
        print(f"  {s}  →  {ns}")
        return m.group(0).replace(f'sentence: "{s}"', f'sentence: "{ns}"')
    out = ENT.sub(rep, src)
    if APPLY and out != src: open(p, "w", encoding="utf-8").write(out)
print(f"\n바꿈 {done}")
