#!/usr/bin/env python3
"""검수 판정(verdicts/b*/*.json)을 앱이 읽는 src/lib/content-review-data.json 으로 만든다.

규칙
  drop                          → 그 항목이 나오는 모든 학년에서 "D"
  fit[학년] = too_hard           → 그 학년만 "D"
  fit[학년] = too_easy           → 그 학년·풀에 «쓸 수 있는 항목»이 MIN_LEFT 이상 남을 때만 "D"(문제 반복을 막는다)
  fix                           → p(고친 필드) — 꼴 검사를 통과할 때만. 원문이 틀렸다는 판정(wrong·ambiguous·unsolvable·leak)인데 고침이 무효면 "D"
  x                             → 오답 보기 3개 — 꼴 검사(정답과 같음·포함·중복·빈 값) 통과할 때만
  손지문 독해(koreanReading)    → x 가 오면 choices = [정답]+x 를 정해 둔 순서로 섞어 p 에 넣는다

부산물: verdicts/reviewed-keys.txt(검수한 앱 키 전부 — 게이트가 «검수 안 된 항목» 을 찾는 장부) · verdicts/report.json(통계)
  python3 scripts/audit/review/build-review-data.py
"""
import collections, hashlib, json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DST_DIR = ROOT / "src/lib/content-review"  # 학년마다 g<학년>.json — 앱은 학생 학년 것만 불러온다
MIN_LEFT = 100
BROKEN = {"wrong", "ambiguous", "unsolvable", "leak"}
BLANK_POOLS = {"knowledge", "safety", "creative", "science", "social", "korean"}


def entries():
    """앱 키 → (학년, 풀, 항목)"""
    out = {}
    for g in range(1, 7):
        for name in (f"entries-g{g}.jsonl", f"reading-static-g{g}.jsonl"):
            f = HERE / name
            if not f.exists():
                continue
            for l in open(f):
                r = json.loads(l)
                out[r["key"]] = (r["g"], r["pool"], r["entry"])
    return out


def norm(s):
    return re.sub(r"[\s.,!?·~]", "", str(s))


def main_answer(entry):
    if not isinstance(entry, dict):
        return None
    for k in ("answer", "correct", "word"):
        if k in entry:
            return str(entry[k])
    return None


def valid_x(x, ans):
    if not isinstance(x, list) or len(x) < 3:
        return None
    out = []
    for c in x:
        if not isinstance(c, str) or not c.strip():
            continue
        c = c.strip()
        if ans is not None and (norm(c) == norm(ans) or (len(ans) >= 2 and ans in c) or (len(c) >= 2 and c in ans)):
            continue
        if any(norm(c) == norm(o) for o in out):
            continue
        out.append(c)
    return out[:3] if len(out) >= 3 else None


def valid_p(p, entry, pool):
    if not isinstance(p, dict) or not p:
        return None
    clean = {}
    for k, v in p.items():
        if k not in entry:
            return None  # 없는 필드를 만들면 화면이 못 그린다
        o = entry[k]
        if isinstance(o, str) and not isinstance(v, str):
            return None
        if isinstance(o, list) and not (isinstance(v, list) and all(isinstance(i, str) for i in v)):
            return None
        if isinstance(o, (int, float)) and not isinstance(v, (int, float)):
            return None
        if isinstance(v, str) and not v.strip():
            return None
        clean[k] = v
    new = {**entry, **clean}
    if pool in BLANK_POOLS and "text" in new and "___" in str(entry.get("text", "")) and "___" not in str(new["text"]):
        return None
    if pool == "koreanReading" and "choices" in new and new.get("correct") not in new["choices"]:
        return None
    if pool == "spelling" and new.get("q1") == new.get("q2"):
        return None
    return clean


def shuffle_fixed(items, seed):
    rnd = int(hashlib.sha1(seed.encode()).hexdigest(), 16)
    items = list(items)
    for i in range(len(items) - 1, 0, -1):
        rnd, j = divmod(rnd, i + 1)
        items[i], items[j] = items[j], items[i]
    return items


def main():
    E = entries()
    # 2차 검수(recheck-)는 1차를 덮어야 하므로 맨 뒤에 읽는다
    verdict_files = sorted((HERE / "verdicts").glob("b*/*.json"), key=lambda f: (f.name.startswith("recheck-"), str(f)))
    per_key = {}  # 앱 키 → (판정, 학년)
    stats = collections.Counter()
    why = collections.Counter()
    easy = collections.defaultdict(list)  # (학년, 풀) → [앱 키]
    usable = collections.Counter()  # (학년, 풀) → 쓸 수 있는 수(too_easy 제외)
    reviewed = set()
    easy_flag = {}  # 키 → 마지막 판정이 too_easy 인가(2차 검수가 덮을 수 있게 집계는 끝에서)
    for f in verdict_files:
        d = json.load(open(f))
        keymap = d["keymap"]
        for v in d["verdicts"]:
            bk = v.get("k")
            if bk not in keymap:
                continue
            for g, key in keymap[bk]:
                if key not in E:
                    continue
                reviewed.add(key)
                _, pool, entry = E[key]
                for w in v.get("why") or []:
                    why[(pool, w)] += 1
                vv = str(v.get("v") or "").strip()  # 레인이 « fix» 처럼 공백을 붙이거나 v 를 빼는 경우가 있다
                if vv not in ("keep", "fix", "drop"):
                    stats["v_missing"] += 1
                    continue  # 판정이 없으면 이 판정은 버린다(1차 판정이 남는다)
                fit = str((v.get("fit") or {}).get(str(g), "ok")).strip()
                if vv == "drop":
                    per_key[key] = "D"; easy_flag.pop(key, None); stats["drop"] += 1; continue
                if fit == "too_hard":
                    per_key[key] = "D"; easy_flag.pop(key, None); stats["too_hard"] += 1; continue
                rec = {}
                if vv == "fix" and not isinstance(entry, dict):
                    vv = "keep"  # 글쓰기 주제(문자열)는 필드를 덮을 수 없다 — 유지/제외만
                if vv == "fix":
                    p = valid_p(v.get("p"), entry, pool)
                    if p is None:
                        if BROKEN & set(v.get("why") or []):
                            per_key[key] = "D"; easy_flag.pop(key, None); stats["fix_invalid_drop"] += 1; continue
                        stats["fix_invalid_ignored"] += 1
                    else:
                        rec["p"] = p; stats["fix"] += 1
                cur = {**entry, **rec.get("p", {})} if isinstance(entry, dict) else {}
                x = valid_x(v.get("x"), main_answer(cur))
                if x:
                    if pool == "koreanReading":
                        rec.setdefault("p", {})["choices"] = shuffle_fixed([cur["correct"], *x], key)
                    else:
                        rec["x"] = x
                    stats["x"] += 1
                easy_flag[key] = fit == "too_easy"
                per_key[key] = rec or None
                stats["keep" if vv == "keep" else "fixed_or_kept"] += 1
    # 손 고침(verdicts/manual.json) — 레인 판정 뒤 말뭉치 게이트가 짚은 몇 건을 사람이 고친 것. 판정을 덮는다.
    mf = HERE / "verdicts" / "manual.json"
    for m in (json.load(open(mf)) if mf.exists() else []):
        hit = 0
        for key, (g, pool, entry) in E.items():
            cur = per_key.get(key)
            final = {**entry, **((cur or {}).get("p") or {})} if isinstance(entry, dict) and cur != "D" else {}
            if pool == m["pool"] and final.get(m["field"]) == m["equals"]:  # 고친 뒤 꼴로 맞춘다(레인 고침이 만든 문장일 수 있다)
                per_key[key] = "D" if m.get("drop") else {**(cur or {}), "p": {**((cur or {}).get("p") or {}), **m["p"]}}
                easy_flag.pop(key, None); hit += 1
        stats["manual"] += hit
        if not hit:
            print("⚠️ 손 고침이 아무 항목에도 안 맞음:", m.get("equals"))
    # 최종 꼴(원문+고침)이 말뭉치 게이트 규칙을 어기면 뺀다 — 레인이 고치면서 새 결함을 만든 경우(R52·R82, 2026-10-26 lint)
    pool_by_id = {id(v[2]): v[1] for v in E.values()}
    pool_of = lambda entry: pool_by_id.get(id(entry))

    LEAK_TAIL = r"(?=[\s.,!?)'\"]|이|가|은|는|을|를|과|와|도|로|으로|에|의|라고|이라고|예요|이에요|$)"

    def word_in(word, text):
        return bool(word) and bool(re.search(rf"(^|[\s'\"(]){re.escape(word)}" + LEAK_TAIL, str(text)))

    def leaks(entry, rec):
        """최종 꼴이 말뭉치 게이트(R52 낱말 뜻에 정답·R82 A(B) 정답)를 어기면 규칙 이름"""
        e = {**entry, **(rec.get("p") or {})} if isinstance(entry, dict) else {}
        if not e:
            return None
        pool = pool_of(entry)
        if pool in ("antonymPairs", "synonymPairs"):  # 짝: 뜻1 에 낱말1, 뜻2 에 낱말2 가 있으면 노출
            for w, m in (("word1", "meaning1"), ("word2", "meaning2")):
                if word_in(e.get(w), e.get(m)) and not re.search("반대말|비슷한 말", str(e.get(m))):
                    return "R52"
            return None
        ans = str(e.get("answer", e.get("word", ""))).strip()
        if not ans:
            return None
        if re.fullmatch(r"[가-힣 ]+\([가-힣A-Za-z ]+\)", ans) and "___" in str(e.get("text", "")):
            return "R82"
        clues = e.get("meanings") or e.get("clues") or ([e["meaning"]] if isinstance(e.get("meaning"), str) and pool in ("wordPuzzles", "multiMeaningWords") else None)
        if isinstance(clues, list) and any(word_in(ans, x) and not re.search("반대말|비슷한 말", str(x)) for x in clues):
            return "R52"
        return None

    for key, v in list(per_key.items()):
        if v == "D" or key not in E:
            continue
        why_rule = leaks(E[key][2], v or {})
        if why_rule:
            if (v or {}).get("p") and not leaks(E[key][2], {}):  # 고침이 만든 노출 — 고침만 버리고 원문을 쓴다
                v2 = {k: x for k, x in v.items() if k != "p"}
                per_key[key] = v2 or None; stats[f"lint_{why_rule}_patch_dropped"] += 1
            else:
                per_key[key] = "D"; easy_flag.pop(key, None); stats[f"lint_{why_rule}_drop"] += 1
    for key, flag in easy_flag.items():
        if per_key.get(key) == "D":
            continue
        g, pool, _ = E[key]
        if flag:
            easy[(g, pool)].append(key)
        else:
            usable[(g, pool)] += 1
    # too_easy: 남는 수가 넉넉한 풀만 뺀다
    easy_report = {}
    for (g, pool), keys in easy.items():
        left = usable[(g, pool)]
        if left >= MIN_LEFT:
            for k in keys:
                per_key[k] = "D"
            easy_report[f"g{g}/{pool}"] = {"too_easy": len(keys), "dropped": True, "left": left}
            stats["too_easy_dropped"] += len(keys)
        else:
            easy_report[f"g{g}/{pool}"] = {"too_easy": len(keys), "dropped": False, "left": left + len(keys)}
            stats["too_easy_kept"] += len(keys)
    # 학년마다 파일 하나: { patches: [고침…], items: { 키: "D" | 고침 번호 } } — 보기만 있는 고침은 배열 그대로
    DST_DIR.mkdir(parents=True, exist_ok=True)
    total_kb = 0
    items_n = 0
    for g in range(1, 7):
        patches, index, items = [], {}, {}
        for k, v in sorted(per_key.items()):
            if v is None or k not in E or E[k][0] != g:
                continue
            if v == "D":
                items[k] = "D"; continue
            rec = v["x"] if set(v) == {"x"} else v
            sig = json.dumps(rec, ensure_ascii=False, sort_keys=True)
            if sig not in index:
                index[sig] = len(patches); patches.append(rec)
            items[k] = index[sig]
        f = DST_DIR / f"g{g}.json"
        f.write_text(json.dumps({"v": 2, "g": g, "patches": patches, "items": items}, ensure_ascii=False, separators=(",", ":")))
        total_kb += f.stat().st_size / 1024
        items_n += len(items)
    (HERE / "verdicts" / "reviewed-keys.txt").write_text("\n".join(sorted(reviewed)) + "\n")
    left = collections.Counter()
    total = collections.Counter()
    for key, (g, pool, _) in E.items():
        if pool == "koreanReading" and key not in reviewed:
            continue  # 조합형 독해는 주제 표로 검수
        total[(g, pool)] += 1
        if per_key.get(key) != "D":
            left[(g, pool)] += 1
    rep = {"stats": stats, "why": {f"{p}/{w}": n for (p, w), n in why.most_common()},
           "too_easy": easy_report,
           "pools": {f"g{g}/{p}": {"total": total[(g, p)], "left": left[(g, p)], "reviewed": sum(1 for k, (gg, pp, _) in E.items() if gg == g and pp == p and k in reviewed)} for (g, p) in sorted(total)},
           "size_kb": round(total_kb)}
    (HERE / "verdicts" / "report.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1))
    print(json.dumps({"stats": stats, "size_kb": rep["size_kb"], "reviewed": len(reviewed), "items": items_n}, ensure_ascii=False))


if __name__ == "__main__":
    main()
