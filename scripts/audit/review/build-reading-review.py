#!/usr/bin/env python3
"""독해 주제 표 검수(verdicts/topics/*.json)를 생성기가 읽는 reading-review.json 으로 만든다.

  python3 scripts/audit/review/build-reading-review.py → src/lib/curriculum/generators/reading-review.json
꼴 검사를 못 넘은 고침은 버리고(원래 표를 쓴다) 그 수를 알린다.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DST = ROOT / "src/lib/curriculum/generators/reading-review.json"
T = json.load(open(HERE / "reading-topics.json"))
NO_SOUND = {"조용히", "", None}


def qa_ok(x):
    return isinstance(x, dict) and isinstance(x.get("q"), str) and isinstance(x.get("a"), str) and isinstance(x.get("pool"), list) \
        and len(x["pool"]) >= 4 and x["a"] in x["pool"] and len(set(x["pool"])) == len(x["pool"])


def main():
    out = {"t34": {}, "t56": {}, "g12": {}}
    bad = []
    by34 = {t["subject"]: t for t in T["TOPICS_34"]}
    by56 = {t["subject"]: t for t in T["TOPICS_56"]}
    by12 = {t["name"]: t for t in T["G12_SUBJECTS"]}
    for f in sorted((HERE / "verdicts" / "topics").glob("*.json")):
        for v in json.load(open(f))["verdicts"]:
            if f.name.startswith("t34"):
                s = v.get("subject")
                if s not in by34:
                    bad.append(f"t34 모르는 주제 {s}"); continue
                r = {"fit": v.get("fit") or {}}
                if v.get("v") == "drop":
                    r["drop"] = True
                p = v.get("p") or {}
                pp = {}
                if isinstance(p.get("definition"), str) and p["definition"].strip():
                    pp["definition"] = p["definition"].strip().rstrip(".")
                if isinstance(p.get("features"), list) and len(p["features"]) == 3 and all(isinstance(x, str) and x.strip() for x in p["features"]):
                    pp["features"] = [x.strip().rstrip(".") for x in p["features"]]
                if pp:
                    r["p"] = pp
                kf = v.get("keyFact")
                if kf == "keep" or kf is None:
                    r["keyFact"] = kf
                elif qa_ok(kf):
                    r["keyFact"] = kf
                else:
                    bad.append(f"t34 {s} keyFact 꼴"); r["keyFact"] = None
                fl = [x.strip().rstrip(".") for x in (v.get("falses") or []) if isinstance(x, str) and x.strip()]
                feats = set(pp.get("features") or by34[s]["features"]) | {pp.get("definition") or by34[s]["definition"]}
                fl = [x for x in fl if x not in feats]
                if len(fl) >= 3:
                    r["falses"] = fl[:3]
                else:
                    bad.append(f"t34 {s} falses {len(fl)}")
                out["t34"][s] = r
            elif f.name.startswith("t56"):
                s = v.get("subject")
                if s not in by56:
                    bad.append(f"t56 모르는 주제 {s}"); continue
                r = {"fit": v.get("fit") or {}}
                if v.get("v") == "drop":
                    r["drop"] = True
                p = v.get("p") or {}
                pp = {}
                for k in ("lead", "conclusion"):
                    if isinstance(p.get(k), str) and p[k].strip():
                        pp[k] = p[k].strip().rstrip(".")
                if isinstance(p.get("evidence"), list) and len(p["evidence"]) == 3 and all(isinstance(x, str) for x in p["evidence"]):
                    pp["evidence"] = [x.strip().rstrip(".") for x in p["evidence"]]
                for k in ("main", "detail", "meaning"):
                    if k in p:
                        if p[k] is None or qa_ok(p[k]):
                            pp[k] = p[k]
                        else:
                            bad.append(f"t56 {s} {k} 꼴")
                if pp:
                    r["p"] = pp
                out["t56"][s] = r
            elif f.name.startswith("g12"):
                n = v.get("name")
                if n not in by12:
                    bad.append(f"g12 모르는 인물 {n}"); continue
                r = {}
                fx = {k: v["fix"][k] for k in ("sound", "food") if isinstance(v.get("fix"), dict) and isinstance(v["fix"].get(k), str) and v["fix"][k].strip()}
                if fx:
                    r["fix"] = fx
                snd = fx.get("sound", by12[n]["sound"])
                if snd in NO_SOUND:
                    r["noSound"] = True
                pl = [x for x in (v.get("places") or []) if x in T["G12_PLACES"]]
                ac = [x for x in (v.get("activities") or []) if x in T["G12_ACTIVITIES"]]
                if len(pl) >= 1:
                    r["places"] = pl
                if len(ac) >= 1:
                    r["activities"] = ac
                out["g12"][n] = r
    DST.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    miss34 = [s for s in by34 if s not in out["t34"]]
    miss56 = [s for s in by56 if s not in out["t56"]]
    miss12 = [s for s in by12 if s not in out["g12"]]
    print(json.dumps({"t34": len(out["t34"]), "t56": len(out["t56"]), "g12": len(out["g12"]),
                      "missing": {"t34": miss34, "t56": miss56, "g12": miss12}, "bad": bad}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
