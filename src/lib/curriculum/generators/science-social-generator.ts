/**
 * Procedural Science & Social Studies Problem Generator
 * Generates grade-appropriate knowledge entries for Korean elementary curriculum.
 */
import type { KnowledgeEntry } from "@/types/curriculum";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── SCIENCE DATA ───────────────────────────────────────────

interface ScienceItem {
  text: string;
  answer: string;
  category: string;
  gradeGroup: "lower" | "upper" | "both";
  unit?: string;
}

const SCIENCE_ITEMS: ScienceItem[] = [
  // ── 물리 (Physics) ──
  {
    text: "용수철처럼 원래 모양으로 되돌아오려는 힘을 ___이라(라) 한다.",
    answer: "탄성력",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "물체가 얼마나 빠르게 움직이는지를 ___라 한다.",
    answer: "빠르기",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "물체의 빠르기를 재는 단위로 ___를 사용한다.",
    answer: "km/h",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "지구가 물체를 끌어당기는 힘을 ___이라(라) 한다.",
    answer: "중력",
    category: "물리",
    gradeGroup: "both",
  },
  {
    text: "물체가 운동 방향과 반대로 받는 힘을 ___이라(라) 한다.",
    answer: "마찰력",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "움직이는 물체는 계속 움직이려 하고, 멈춘 물체는 계속 멈추려 하는 성질을 ___이라(라) 한다.",
    answer: "관성",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "작은 힘으로 무거운 물체를 들어 올리는 도구를 ___라 한다.",
    answer: "지레",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "지레에서 받침점, 힘점, ___의 세 점이 있다.",
    answer: "작용점",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "물체를 비탈면 위로 올리면 힘은 작아지지만 ___는 길어진다.",
    answer: "거리",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "도르래를 사용하면 힘의 ___을 바꿀 수 있다.",
    answer: "방향",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "움직도르래를 하나 사용하면 힘이 ___으로 줄어든다.",
    answer: "절반",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "물체의 무게는 ___저울로 측정할 수 있다.",
    answer: "용수철",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "물체의 무게(힘)를 나타내는 단위로 ___을 사용한다.",
    answer: "N",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "수평잡기에서 무거운 쪽이 ___로 기운다.",
    answer: "아래",
    category: "물리",
    gradeGroup: "lower",
  },
  {
    text: "같은 무게의 물체라도 접촉면이 넓으면 ___이 줄어든다.",
    answer: "압력",
    category: "물리",
    gradeGroup: "upper",
  },
  {
    text: "물체의 운동 상태를 변화시키는 원인을 ___이라(라) 한다.",
    answer: "힘",
    category: "물리",
    gradeGroup: "lower",
  },

  // ── 화학 (Chemistry) ──
  {
    text: "물이 끓어서 수증기로 바뀌는 현상을 ___이라(라) 한다.",
    answer: "끓음",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "물질이 산소와 빠르게 반응하여 빛과 열을 내는 현상을 ___라 한다.",
    answer: "연소",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "연소 후 촛불에서 생기는 기체는 ___다.",
    answer: "이산화탄소",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "산성 용액에 리트머스 종이를 넣으면 ___색으로 변한다.",
    answer: "붉은",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "염기성 용액에 리트머스 종이를 넣으면 ___색으로 변한다.",
    answer: "푸른",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "식초는 ___성 용액이다.",
    answer: "산",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "비누물은 ___성 용액이다.",
    answer: "염기",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "소금이 물에 녹아 보이지 않게 되는 현상을 ___라 한다.",
    answer: "용해",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "용해에서 녹이는 액체(예: 물)를 ___라 한다.",
    answer: "용매",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "용해에서 녹는 물질(예: 소금)을 ___이라(라) 한다.",
    answer: "용질",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "용질이 용매에 녹아 만들어진 액체(예: 소금물)를 ___이라(라) 한다.",
    answer: "용액",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "물질의 세 가지 상태는 고체, 액체, ___다.",
    answer: "기체",
    category: "화학",
    gradeGroup: "lower",
  },
  {
    text: "얼음과 같은 고체가 열을 받아 액체로 바뀌는 현상을 ___라 한다.",
    answer: "융해",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "물이 얼어서 얼음이 되는 것처럼 액체가 고체로 바뀌는 현상을 ___라 한다.",
    answer: "응고",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "수증기가 차가운 유리컵 표면에서 물방울로 맺히는 현상을 ___라 한다.",
    answer: "액화",
    category: "화학",
    gradeGroup: "upper",
  },
  {
    text: "물질이 타고 난 뒤 남는 검은 물질을 ___라 한다.",
    answer: "재",
    category: "화학",
    gradeGroup: "lower",
  },
  {
    text: "물에 설탕을 넣고 저으면 설탕이 ___된다.",
    answer: "용해",
    category: "화학",
    gradeGroup: "lower",
  },
  {
    text: "철이 공기 중의 산소와 반응하여 붉게 변하는 현상을 ___이라(라) 한다.",
    answer: "부식",
    category: "화학",
    gradeGroup: "upper",
  },

  // ── 생물 (Biology) ──
  {
    text: "식물이 빛을 이용하여 양분을 만드는 과정을 ___이라(라) 한다.",
    answer: "광합성",
    category: "생물",
    gradeGroup: "upper",
  },
  {
    text: "광합성에 필요한 기체는 ___다.",
    answer: "이산화탄소",
    category: "생물",
    gradeGroup: "upper",
  },
  {
    text: "광합성의 결과 만들어지는 기체는 ___다.",
    answer: "산소",
    category: "생물",
    gradeGroup: "upper",
  },
  {
    text: "식물의 잎에서 물이 수증기로 빠져나가는 작용을 ___작용이라 한다.",
    answer: "증산",
    category: "생물",
    gradeGroup: "upper",
  },
  {
    text: "동물의 알이 깨어나 새끼가 되는 것을 ___라 한다.",
    answer: "부화",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "배추흰나비의 한살이 순서는 알→애벌레→번데기→___다.",
    answer: "어른벌레",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "개구리처럼 올챙이에서 모습이 크게 바뀌는 것을 ___이라(라) 한다.",
    answer: "탈바꿈",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "씨가 싹을 틔우는 것을 ___라 한다.",
    answer: "발아",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "꽃의 수술에서 만들어지는 가루를 ___라 한다.",
    answer: "꽃가루",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "꽃가루가 암술머리에 붙는 것을 ___라 한다.",
    answer: "꽃가루받이",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "꽃가루받이 후 씨방이 자라서 ___가 된다.",
    answer: "열매",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "동물이 겨울을 나기 위해 긴 잠을 자는 것을 ___이라(라) 한다.",
    answer: "겨울잠",
    category: "생물",
    gradeGroup: "lower",
  },
  {
    text: "생물이 살고 있는 환경에서 잘 살아남도록 생김새와 생활 방식이 알맞게 바뀌는 것을 ___이라(라) 한다.",
    answer: "적응",
    category: "생물",
    gradeGroup: "upper",
  },

  // ── 지구과학 (Earth Science) ──
  {
    text: "지구의 표면을 이루는 딱딱한 층을 ___이라(라) 한다.",
    answer: "지각",
    category: "지구과학",
    gradeGroup: "upper",
  },
  {
    text: "흐르는 물에 의해 바위가 깎이는 현상을 ___이라(라) 한다.",
    answer: "침식",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "깎인 돌과 흙이 다른 곳에 쌓이는 것을 ___이라(라) 한다.",
    answer: "퇴적",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "모래, 진흙 등이 쌓여 굳어진 암석을 ___암이라 한다.",
    answer: "퇴적",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "마그마가 식어서 만들어진 암석을 ___암이라 한다.",
    answer: "화성",
    category: "지구과학",
    gradeGroup: "upper",
  },
  {
    text: "열과 압력을 받아 성질이 변한 암석을 ___암이라 한다.",
    answer: "변성",
    category: "지구과학",
    gradeGroup: "upper",
  },
  {
    text: "화산이 폭발할 때 나오는 녹은 돌을 ___이라(라) 한다.",
    answer: "용암",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "땅속에서 녹아 있는 돌을 ___라 한다.",
    answer: "마그마",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "땅이 갑자기 흔들리는 현상을 ___이라(라) 한다.",
    answer: "지진",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "지진의 세기를 나타내는 단위를 ___라 한다.",
    answer: "규모",
    category: "지구과학",
    gradeGroup: "upper",
  },
  {
    text: "지층에서 발견되는 옛날 생물의 흔적을 ___이라(라) 한다.",
    answer: "화석",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "화석을 통해 과거 지구의 ___을 알 수 있다.",
    answer: "환경",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "흙은 바위가 오랜 시간 ___작용을 받아 만들어진다.",
    answer: "풍화",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "강 하류에서는 퇴적이 잘 일어나 ___가 만들어진다.",
    answer: "평야",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "바닷물이 육지 쪽으로 들어오는 것을 ___이라(라) 한다.",
    answer: "밀물",
    category: "지구과학",
    gradeGroup: "lower",
  },
  {
    text: "바닷물이 빠져나가는 것을 ___이라(라) 한다.",
    answer: "썰물",
    category: "지구과학",
    gradeGroup: "lower",
  },

  // ── 환경 (Environment) ──
  {
    text: "생물과 환경이 서로 영향을 주고받는 것을 ___라 한다.",
    answer: "생태계",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "생태계에서 스스로 양분을 만드는 생물을 ___자라 한다.",
    answer: "생산",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "생태계에서 다른 생물을 먹는 생물을 ___자라 한다.",
    answer: "소비",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "죽은 생물을 분해하는 생물을 ___자라 한다.",
    answer: "분해",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "먹이 관계가 사슬처럼 연결된 것을 ___이라(라) 한다.",
    answer: "먹이사슬",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "먹이사슬이 복잡하게 얽힌 것을 ___이라(라) 한다.",
    answer: "먹이그물",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "지구의 평균 기온이 올라가는 현상을 ___라 한다.",
    answer: "지구온난화",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "쓰레기를 다시 사용하는 것을 ___이라(라) 한다.",
    answer: "재활용",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "자연 속 미생물에 의해 썩어서 사라지는 물질을 ___되는 물질이라 한다.",
    answer: "분해",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "대기 중 이산화탄소가 열을 가두는 효과를 ___라 한다.",
    answer: "온실효과",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "수도꼭지를 잘 잠그고 짧게 샤워해서 물을 아껴 쓰는 것을 ___이라(라) 한다.",
    answer: "물 절약",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "동식물이 사라져 더 이상 볼 수 없게 되는 것을 ___이라(라) 한다.",
    answer: "멸종",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "사라질 위기에 있는 동식물을 ___ 생물이라 한다.",
    answer: "멸종위기",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "환경을 보호하기 위해 에너지를 아끼는 것을 ___이라(라) 한다.",
    answer: "절약",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "음식물 쓰레기를 발효시켜 만든 거름을 ___라 한다.",
    answer: "퇴비",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "산과 들에 나무를 많이 심어 가꾸는 일을 ___라 한다.",
    answer: "나무 심기",
    category: "환경",
    gradeGroup: "upper",
  },

  // ── 에너지 (Energy) ──
  {
    text: "태양에서 오는 에너지를 ___에너지라 한다.",
    answer: "태양",
    category: "에너지",
    gradeGroup: "both",
  },
  {
    text: "바람을 이용하여 전기를 만드는 것을 ___발전이라 한다.",
    answer: "풍력",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "물의 힘으로 전기를 만드는 것을 ___발전이라 한다.",
    answer: "수력",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "열에너지는 온도가 높은 곳에서 ___은 곳으로 이동한다.",
    answer: "낮",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "전기를 만들어내는 장치를 ___기라 한다.",
    answer: "발전",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "전지에서 전기 에너지로 바뀌는 에너지는 ___에너지이다.",
    answer: "화학",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "석탄, 석유, 천연가스를 ___연료라 한다.",
    answer: "화석",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "다시 사용할 수 있는 에너지를 ___에너지라 한다.",
    answer: "재생",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "움직이는 물체가 가지는 에너지를 ___에너지라 한다.",
    answer: "운동",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "높은 곳에 있는 물체가 가지는 에너지를 ___에너지라 한다.",
    answer: "위치",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "에너지는 형태가 바뀔 수 있는데 이를 에너지 ___이라(라) 한다.",
    answer: "전환",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "전구에서 전기에너지가 ___에너지로 바뀐다.",
    answer: "빛",
    category: "에너지",
    gradeGroup: "lower",
  },
  {
    text: "선풍기는 전기에너지를 ___에너지로 바꾼다.",
    answer: "운동",
    category: "에너지",
    gradeGroup: "lower",
  },
  {
    text: "건전지 2개를 직렬로 연결하면 전구가 더 ___게 빛난다.",
    answer: "밝",
    category: "에너지",
    gradeGroup: "lower",
  },
  {
    text: "햇빛을 이용하여 전기를 만드는 것을 ___발전이라 한다.",
    answer: "태양광",
    category: "에너지",
    gradeGroup: "upper",
  },
  {
    text: "우리나라 전기 생산에서 가장 큰 비중을 차지하는 것은 ___발전이다.",
    answer: "화력",
    category: "에너지",
    gradeGroup: "upper",
  },

  // ── 인체 (Human Body) ──
  {
    text: "음식물을 잘게 부수는 기관은 ___이다.",
    answer: "이",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "폐에서 산소와 이산화탄소를 교환하는 것을 ___이라(라) 한다.",
    answer: "호흡",
    category: "인체",
    gradeGroup: "upper",
  },
  {
    text: "심장이 혈액을 온몸으로 보내는 것을 ___이라(라) 한다.",
    answer: "혈액순환",
    category: "인체",
    gradeGroup: "upper",
  },
  {
    text: "뼈와 뼈가 만나는 부분을 ___이라(라) 한다.",
    answer: "관절",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "소화된 영양소를 흡수하는 기관은 ___이다.",
    answer: "소장",
    category: "인체",
    gradeGroup: "upper",
  },
  {
    text: "몸에서 노폐물을 걸러내는 기관은 ___이다.",
    answer: "콩팥",
    category: "인체",
    gradeGroup: "upper",
  },
  {
    text: "우리 몸에서 뼈를 움직이게 하는 것은 ___이다.",
    answer: "근육",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "음식물이 위에서 잘게 분해되는 과정을 ___라 한다.",
    answer: "소화",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "피부, 눈, 코, 귀, 혀를 ___기관이라 한다.",
    answer: "감각",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "사람의 체온은 보통 섭씨 약 ___도이다.",
    answer: "36.5",
    category: "인체",
    gradeGroup: "lower",
  },
  {
    text: "들이마신 공기가 지나가는 관을 ___이라(라) 한다.",
    answer: "기관",
    category: "인체",
    gradeGroup: "upper",
  },
  {
    text: "입에서 나오는 소화액을 ___이라(라) 한다.",
    answer: "침",
    category: "인체",
    gradeGroup: "lower",
  },

  // ── 동물 (Animals) ──
  {
    text: "등뼈가 있는 동물을 ___동물이라 한다.",
    answer: "척추",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "등뼈가 없는 동물을 ___동물이라 한다.",
    answer: "무척추",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "알을 낳아 새끼를 번식시키는 방법을 ___이라(라) 한다.",
    answer: "난생",
    category: "동물",
    gradeGroup: "upper",
  },
  {
    text: "새끼를 낳아 젖을 먹이는 동물을 ___류라 한다.",
    answer: "포유",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "물속에서 아가미로 숨을 쉬는 동물을 ___류라 한다.",
    answer: "어",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "어릴 때는 물속, 어른이 되면 땅에서 사는 동물을 ___류라 한다.",
    answer: "양서",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "비늘로 덮여 있고 허파로 숨을 쉬는 동물을 ___류라 한다.",
    answer: "파충",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "곤충의 몸은 머리, 가슴, ___의 세 부분이다.",
    answer: "배",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "곤충의 다리는 모두 ___개이다.",
    answer: "6",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "거미의 다리는 모두 ___개이다.",
    answer: "8",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "꿀벌처럼 여럿이 함께 모여 사는 것을 ___생활이라 한다.",
    answer: "사회",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "새의 몸은 ___으로 덮여 있다.",
    answer: "깃털",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "고래와 박쥐는 젖을 먹이므로 ___류이다.",
    answer: "포유",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "겨울이 오면 따뜻한 곳으로 이동하는 새를 ___새라 한다.",
    answer: "철",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "나비의 입은 빨대처럼 생긴 ___이다.",
    answer: "대롱",
    category: "동물",
    gradeGroup: "lower",
  },
  {
    text: "사마귀처럼 다른 곤충을 잡아먹는 곤충을 ___곤충이라 한다.",
    answer: "육식",
    category: "동물",
    gradeGroup: "lower",
  },

  // ── 식물 (Plants) ──
  {
    text: "식물의 뿌리가 땅속으로 뻗어 물과 ___을 흡수한다.",
    answer: "양분",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "줄기의 역할은 물과 양분을 ___하는 것이다.",
    answer: "운반",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "잎이 초록색으로 보이는 것은 ___라는 초록색 색소 때문이다.",
    answer: "엽록소",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "떡잎이 한 장인 식물을 ___잎식물이라 한다.",
    answer: "외떡",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "두 장의 떡잎을 가진 식물을 ___잎식물이라 한다.",
    answer: "쌍떡",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "씨가 아닌 포자로 번식하는 식물에는 고사리와 ___가 있다.",
    answer: "이끼",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "소나무처럼 겉씨가 드러나는 식물을 ___식물이라 한다.",
    answer: "겉씨",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "사과나무처럼 씨가 열매 속에 있는 식물을 ___식물이라 한다.",
    answer: "속씨",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "식물이 빛이 오는 쪽으로 굽어 자라는 성질을 ___이라(라) 한다.",
    answer: "굴광성",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "뿌리가 중력 방향인 아래쪽으로 자라는 성질을 ___이라(라) 한다.",
    answer: "굴중성",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "꽃에서 벌과 나비를 유인하는 부분은 ___이다.",
    answer: "꽃잎",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "식물의 줄기에서 물이 이동하는 것을 확인하려면 ___물 실험을 한다.",
    answer: "색소",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "선인장의 잎이 가시로 변한 이유는 물이 빠져나가는 것을 줄이기 위해서이다. 맞으면 O, 틀리면 X.",
    answer: "O",
    category: "식물",
    gradeGroup: "upper",
  },
  {
    text: "연꽃처럼 물에서 사는 식물을 ___식물이라 한다.",
    answer: "수생",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "식물의 씨앗이 퍼지는 방법에는 바람, 동물, ___이 있다.",
    answer: "물",
    category: "식물",
    gradeGroup: "lower",
  },
  {
    text: "가을에 나뭇잎이 색이 변하는 것을 ___이라(라) 한다.",
    answer: "단풍",
    category: "식물",
    gradeGroup: "lower",
  },

  // ── 날씨 (Weather) ──
  {
    text: "공기 중의 수증기가 하늘에서 작은 물방울이 된 것을 ___이라(라) 한다.",
    answer: "구름",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "구름 속 물방울이 커져서 떨어지는 것을 ___라 한다.",
    answer: "비",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "겨울에 구름 속 물방울이 얼어서 내리는 것을 ___이라(라) 한다.",
    answer: "눈",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "공기가 이동하는 것을 ___이라(라) 한다.",
    answer: "바람",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "바람은 기압이 ___은 곳에서 낮은 곳으로 분다.",
    answer: "높",
    category: "날씨",
    gradeGroup: "upper",
  },
  {
    text: "공기 중에 포함된 수증기의 양을 ___라 한다.",
    answer: "습도",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "시간이나 양의 변화를 선으로 이어 그린 그래프를 ___그래프라 한다.",
    answer: "꺾은선",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "기온을 재는 도구는 ___다.",
    answer: "온도계",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "습도를 재는 도구는 ___다.",
    answer: "습도계",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "바람의 세기를 재는 도구는 ___다.",
    answer: "풍속계",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "바람의 방향을 알려주는 도구는 ___다.",
    answer: "풍향계",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "아침에 풀잎에 맺히는 물방울을 ___이라(라) 한다.",
    answer: "이슬",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "지표면 가까이에 생기는 작은 물방울을 ___라 한다.",
    answer: "안개",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "번개가 칠 때 나는 소리를 ___이라(라) 한다.",
    answer: "천둥",
    category: "날씨",
    gradeGroup: "lower",
  },
  {
    text: "일정 지역의 오랜 기간 평균 날씨를 ___라 한다.",
    answer: "기후",
    category: "날씨",
    gradeGroup: "upper",
  },
  {
    text: "태풍은 열대 바다에서 발생하는 강한 ___이다.",
    answer: "저기압",
    category: "날씨",
    gradeGroup: "upper",
  },

  // ── 우주 (Space) ──
  {
    text: "태양계의 중심에 있는 별은 ___이다.",
    answer: "태양",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "태양에서 가장 가까운 행성은 ___이다.",
    answer: "수성",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "태양계에서 가장 큰 행성은 ___이다.",
    answer: "목성",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "아름다운 고리를 가진 행성은 ___이다.",
    answer: "토성",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "지구의 위성은 ___이다.",
    answer: "달",
    category: "우주",
    gradeGroup: "lower",
  },
  {
    text: "달이 스스로 빛을 내지 못하고 ___빛을 반사한다.",
    answer: "태양",
    category: "우주",
    gradeGroup: "lower",
  },
  {
    text: "달의 모양이 변하는 주기는 약 ___일이다.",
    answer: "29.5",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "지구가 태양 주위를 도는 것을 ___이라(라) 한다.",
    answer: "공전",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "지구가 스스로 도는 것을 ___이라(라) 한다.",
    answer: "자전",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "지구의 자전 때문에 낮과 ___이 바뀐다.",
    answer: "밤",
    category: "우주",
    gradeGroup: "lower",
  },
  {
    text: "지구의 공전 때문에 ___이 바뀐다.",
    answer: "계절",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "별이 모여 이루는 모양을 ___라 한다.",
    answer: "별자리",
    category: "우주",
    gradeGroup: "lower",
  },
  {
    text: "북쪽 하늘에서 항상 같은 자리에 보이는 별은 ___이다.",
    answer: "북극성",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "태양계 행성 중 생명체가 사는 곳은 ___다.",
    answer: "지구",
    category: "우주",
    gradeGroup: "lower",
  },
  {
    text: "태양계 행성의 수는 ___개이다.",
    answer: "8",
    category: "우주",
    gradeGroup: "upper",
  },
  {
    text: "화성은 표면이 붉은색이어서 ___행성이라 불린다.",
    answer: "붉은",
    category: "우주",
    gradeGroup: "upper",
  },

  // ── 물질 (Matter) ──
  {
    text: "우리 주위의 모든 것을 이루고 있는 것을 ___이라(라) 한다.",
    answer: "물질",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "자석에 붙지 않는 물질로 만든 것에는 종이, 나무, ___ 등이 있다.",
    answer: "플라스틱",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "나무, 쇠, 플라스틱, 유리 등은 물체를 만드는 ___다.",
    answer: "재료",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "자석에 붙는 물질은 ___으로 만든 것이다.",
    answer: "철",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "자석의 양 끝을 ___이라(라) 한다.",
    answer: "극",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "자석의 같은 극끼리는 서로 ___한다.",
    answer: "밀어낸다",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "자석의 다른 극끼리는 서로 ___한다.",
    answer: "끌어당긴다",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "나침반의 바늘은 항상 ___쪽을 가리킨다.",
    answer: "북",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "고체는 모양과 부피가 ___하다.",
    answer: "일정",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "액체는 담는 그릇에 따라 ___이 변한다.",
    answer: "모양",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "기체는 모양과 부피가 모두 ___하지 않다.",
    answer: "일정",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "여러 가지 물질이 섞여 있는 것을 ___이라(라) 한다.",
    answer: "혼합물",
    category: "물질",
    gradeGroup: "upper",
  },
  {
    text: "혼합물에서 각 물질을 나누는 것을 ___라 한다.",
    answer: "분리",
    category: "물질",
    gradeGroup: "upper",
  },
  {
    text: "거름 장치를 이용하여 고체와 액체를 분리하는 것을 ___라 한다.",
    answer: "거르기",
    category: "물질",
    gradeGroup: "upper",
  },
  {
    text: "소금물을 증발시키면 ___만 남는다.",
    answer: "소금",
    category: "물질",
    gradeGroup: "lower",
  },
  {
    text: "물질이 열에 의해 부피가 커지는 현상을 ___이라(라) 한다.",
    answer: "열팽창",
    category: "물질",
    gradeGroup: "upper",
  },

  // ── 전기 (Electricity) ──
  {
    text: "전기가 흐르는 길을 ___라 한다.",
    answer: "전기회로",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전기 회로에서 전기의 흐름을 ___라 한다.",
    answer: "전류",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전지, 전선, 전구를 연결한 것을 ___라 한다.",
    answer: "전기회로",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "구리, 철처럼 전기가 잘 통하는 물질을 ___라 한다.",
    answer: "도체",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "플라스틱, 유리처럼 전기가 통하지 않는 물질을 ___라 한다.",
    answer: "부도체",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전구 2개를 한 줄로 연결하는 것을 ___연결이라 한다.",
    answer: "직렬",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전구 2개를 나란히 연결하는 것을 ___연결이라 한다.",
    answer: "병렬",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전기 회로를 끊거나 연결하는 장치를 ___라 한다.",
    answer: "스위치",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전기를 모아 두었다가 쓰는 장치를 ___라 한다.",
    answer: "배터리",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전선에 전류가 흐르면 주위에 ___의 성질이 나타난다.",
    answer: "자석",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "전자석은 전류가 흐를 때만 ___의 성질을 갖는다.",
    answer: "자석",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "집에서 사용하는 전기는 ___소에서 만들어 보내준다.",
    answer: "발전",
    category: "전기",
    gradeGroup: "lower",
  },
  {
    text: "정전기는 서로 다른 물체를 문지를 때 물체에 ___가 쌓여 생긴다.",
    answer: "전기",
    category: "전기",
    gradeGroup: "upper",
  },
  {
    text: "겨울에 옷을 벗을 때 따끔한 것은 ___때문이다.",
    answer: "정전기",
    category: "전기",
    gradeGroup: "lower",
  },

  // ── 힘과운동 (Force and Motion) ──
  {
    text: "물체의 위치가 시간에 따라 변하는 것을 ___이라(라) 한다.",
    answer: "운동",
    category: "힘과운동",
    gradeGroup: "lower",
  },
  {
    text: "일정한 빠르기로 움직이는 운동을 ___운동이라 한다.",
    answer: "등속",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "물체가 원 모양의 경로를 따라 도는 운동을 ___운동이라 한다.",
    answer: "원",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "물체가 떨어질 때 점점 빨라지는 것은 ___때문이다.",
    answer: "중력",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "물속에서 물체가 뜨는 힘을 ___이라(라) 한다.",
    answer: "부력",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "거리를 시간으로 나눈 것을 ___이라(라) 한다.",
    answer: "속력",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "같은 시간에 더 먼 거리를 간 물체가 더 ___다.",
    answer: "빠르",
    category: "힘과운동",
    gradeGroup: "lower",
  },
  {
    text: "공을 비스듬히 던지면 곡선을 그리며 날아가는 운동을 ___운동이라 한다.",
    answer: "포물선",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "그네가 왔다 갔다 하는 운동을 ___운동이라 한다.",
    answer: "진자",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "바퀴를 사용하면 ___력을 줄일 수 있다.",
    answer: "마찰",
    category: "힘과운동",
    gradeGroup: "lower",
  },
  {
    text: "경사면을 이용하면 적은 ___으로 물체를 올릴 수 있다.",
    answer: "힘",
    category: "힘과운동",
    gradeGroup: "lower",
  },
  {
    text: "자동차 안전벨트는 급정지 시 ___을 막아준다.",
    answer: "관성",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "로켓이 뜨거운 가스를 뒤로 뿜어내면 로켓은 반대 방향인 ___으로 날아간다.",
    answer: "앞",
    category: "힘과운동",
    gradeGroup: "upper",
  },
  {
    text: "미끄럼틀에서 빠르게 내려오는 것은 ___때문이다.",
    answer: "중력",
    category: "힘과운동",
    gradeGroup: "lower",
  },
  {
    text: "수영할 때 물을 뒤로 밀면 몸이 ___으로 나아간다.",
    answer: "앞",
    category: "힘과운동",
    gradeGroup: "lower",
  },

  // ── 빛과소리 (Light and Sound) ──
  {
    text: "빛이 직진하는 성질 때문에 ___가 생긴다.",
    answer: "그림자",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "빛이 거울에 부딪쳐 되돌아오는 것을 ___라 한다.",
    answer: "반사",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "빛이 물속으로 들어갈 때 꺾이는 현상을 ___이라(라) 한다.",
    answer: "굴절",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "흰색 빛을 프리즘에 통과시키면 ___색으로 나뉜다.",
    answer: "무지개",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "소리는 물체의 ___에 의해 발생한다.",
    answer: "진동",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "소리의 높낮이는 물체가 1초 동안 떨리는 횟수인 ___에 따라 달라진다.",
    answer: "진동수",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "소리의 크기는 물체가 떨리는 폭인 ___에 따라 달라진다.",
    answer: "진폭",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "소리가 벽에 부딪쳐 되돌아오는 것을 ___라 한다.",
    answer: "메아리",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "빛이 없으면 물체를 볼 수 ___다.",
    answer: "없",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "볼록 렌즈는 빛을 모아 ___을 만든다.",
    answer: "초점",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "오목 렌즈는 빛을 ___시킨다.",
    answer: "발산",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "소리는 진공 속에서 전달되지 ___다.",
    answer: "않는",
    category: "빛과소리",
    gradeGroup: "upper",
  },
  {
    text: "그림자의 크기는 물체와 빛 사이의 ___에 따라 달라진다.",
    answer: "거리",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "빛이 곧게 나아가는 성질을 빛의 ___이라(라) 한다.",
    answer: "직진",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "무지개는 비온 뒤 ___에 의해 빛이 분해되어 나타난다.",
    answer: "물방울",
    category: "빛과소리",
    gradeGroup: "lower",
  },
  {
    text: "실전화기는 실의 ___을 이용해 소리를 전달한다.",
    answer: "진동",
    category: "빛과소리",
    gradeGroup: "lower",
  },
];

// ─── SOCIAL STUDIES DATA ────────────────────────────────────

interface SocialItem {
  text: string;
  answer: string;
  category: string;
  gradeGroup: "lower" | "upper" | "both";
}

const SOCIAL_ITEMS: SocialItem[] = [
  // ── 지리 (Geography) ──
  {
    text: "대한민국의 수도는 ___이다.",
    answer: "서울",
    category: "지리",
    gradeGroup: "both",
  },
  {
    text: "우리나라에서 가장 큰 섬은 ___도이다.",
    answer: "제주",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라에서 가장 높은 산은 ___산이다.",
    answer: "백두",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라에서 가장 긴 강은 ___강이다.",
    answer: "낙동",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "서울을 가로지르는 강은 ___강이다.",
    answer: "한",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 동쪽 바다를 ___해라 한다.",
    answer: "동",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 서쪽 바다를 서해 또는 ___해라고 한다.",
    answer: "황",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 남쪽 바다를 ___해라 한다.",
    answer: "남",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라는 아시아 대륙의 ___쪽에 위치해 있다.",
    answer: "동",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 영토에서 가장 북쪽 지역은 ___도이다.",
    answer: "함경북",
    category: "지리",
    gradeGroup: "upper",
  },
  {
    text: "지도에서 높낮이를 나타내는 선을 ___선이라 한다.",
    answer: "등고",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "지도에서 실제 거리를 줄인 비율을 ___이라(라) 한다.",
    answer: "축척",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "지도에서 방위를 나타내는 표시를 ___표라 한다.",
    answer: "방위",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "백두산은 우리나라와 ___의 국경에 있다.",
    answer: "중국",
    category: "지리",
    gradeGroup: "upper",
  },
  {
    text: "독도는 우리나라의 가장 ___쪽에 있는 섬이다.",
    answer: "동",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "우리나라는 반도 국가로, 삼면이 ___로 둘러싸여 있다.",
    answer: "바다",
    category: "지리",
    gradeGroup: "lower",
  },
  {
    text: "도시에 사람이 몰리는 현상을 ___화라 한다.",
    answer: "도시",
    category: "지리",
    gradeGroup: "upper",
  },

  // ── 역사 (History) ──
  {
    text: "우리나라 최초의 국가는 ___이다.",
    answer: "고조선",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "고조선을 세운 인물은 ___이다.",
    answer: "단군왕검",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "삼국시대의 세 나라는 고구려, 백제, ___다.",
    answer: "신라",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "삼국을 통일한 나라는 ___다.",
    answer: "신라",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "고려를 세운 인물은 ___이다.",
    answer: "왕건",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "조선을 세운 인물은 ___다.",
    answer: "이성계",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "한글을 만든 왕은 ___이다.",
    answer: "세종대왕",
    category: "역사",
    gradeGroup: "both",
  },
  {
    text: "한글이 처음 만들어졌을 때의 이름은 ___이다.",
    answer: "훈민정음",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "임진왜란 때 바다에서 활약한 장군은 ___이다.",
    answer: "이순신",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "이순신 장군이 사용한 배는 ___이다.",
    answer: "거북선",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "우리나라가 일본에게 빼앗긴 해는 ___년이다.",
    answer: "1910",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "광복절은 ___월 15일이다.",
    answer: "8",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "6·25 전쟁이 일어난 해는 ___년이다.",
    answer: "1950",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "대한민국 정부가 수립된 해는 ___년이다.",
    answer: "1948",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "고구려의 전성기를 이끈 왕은 ___왕이다.",
    answer: "광개토대",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "백제의 수도였던 도시는 ___다.",
    answer: "부여",
    category: "역사",
    gradeGroup: "upper",
  },
  {
    text: "신라의 수도였던 도시는 ___다.",
    answer: "경주",
    category: "역사",
    gradeGroup: "upper",
  },

  // ── 경제 (Economy) ──
  {
    text: "물건을 사고파는 활동을 ___라 한다.",
    answer: "거래",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "사람들이 원하는 것에 비해 자원이 부족한 것을 ___이라(라) 한다.",
    answer: "희소성",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "물건을 사는 사람을 ___자라 한다.",
    answer: "소비",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "물건을 만드는 사람을 ___자라 한다.",
    answer: "생산",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "물건의 값을 ___이라(라) 한다.",
    answer: "가격",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "나라와 나라 사이에 물건을 사고파는 것을 ___이라(라) 한다.",
    answer: "무역",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "다른 나라에 물건을 파는 것을 ___이라(라) 한다.",
    answer: "수출",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "다른 나라에서 물건을 사 오는 것을 ___이라(라) 한다.",
    answer: "수입",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "은행에 돈을 맡기는 것을 ___이라(라) 한다.",
    answer: "저축",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "물건의 가격이 계속 오르는 현상을 ___이라(라) 한다.",
    answer: "인플레이션",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "일한 대가로 받는 돈을 ___이라(라) 한다.",
    answer: "임금",
    category: "경제",
    gradeGroup: "lower",
  },
  {
    text: "물건을 만드는 데 드는 돈을 ___이라(라) 한다.",
    answer: "비용",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "한정된 자원을 어디에 쓸지 결정하는 것을 경제적 ___이라(라) 한다.",
    answer: "선택",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "시장에서 물건을 사려는 양을 ___라 한다.",
    answer: "수요",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "시장에서 물건을 팔려는 양을 ___이라(라) 한다.",
    answer: "공급",
    category: "경제",
    gradeGroup: "upper",
  },
  {
    text: "돈의 가치가 떨어지면 물건 가격이 ___한다.",
    answer: "상승",
    category: "경제",
    gradeGroup: "upper",
  },

  // ── 정치 (Politics) ──
  {
    text: "대한민국의 대통령은 국민의 ___로 선출된다.",
    answer: "투표",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "법을 만드는 국가 기관은 ___다.",
    answer: "국회",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "법에 따라 재판하는 국가 기관은 ___이다.",
    answer: "법원",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "나라의 살림을 맡아 하는 기관은 ___부이다.",
    answer: "행정",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "국가의 최고 법을 ___이라(라) 한다.",
    answer: "헌법",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "국회의원을 뽑는 선거를 ___선거라 한다.",
    answer: "총",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "만 ___세 이상 국민에게 선거권이 주어진다.",
    answer: "18",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "국민이 나라의 주인이 되는 정치를 ___주의라 한다.",
    answer: "민주",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "지방의 일을 스스로 처리하는 제도를 ___제라 한다.",
    answer: "지방자치",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "도를 대표하는 사람을 ___라 한다.",
    answer: "도지사",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "국민의 기본적인 권리를 ___이라(라) 한다.",
    answer: "기본권",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "대통령의 임기는 ___년이다.",
    answer: "5",
    category: "정치",
    gradeGroup: "upper",
  },
  {
    text: "나라를 다스리는 기본 원리를 ___라 한다.",
    answer: "정치",
    category: "정치",
    gradeGroup: "lower",
  },
  {
    text: "학교에서 학급 대표를 뽑는 것도 ___의 한 방법이다.",
    answer: "선거",
    category: "정치",
    gradeGroup: "lower",
  },
  {
    text: "여러 사람의 의견을 모아 결정하는 것을 ___라 한다.",
    answer: "회의",
    category: "정치",
    gradeGroup: "lower",
  },
  {
    text: "다수의 의견을 따르되 소수 의견도 존중하는 것을 ___이라(라) 한다.",
    answer: "다수결",
    category: "정치",
    gradeGroup: "lower",
  },

  // ── 문화 (Culture) ──
  {
    text: "우리나라의 전통 의복을 ___이라(라) 한다.",
    answer: "한복",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 전통 음식을 ___이라(라) 한다.",
    answer: "한식",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "설날에 어른에게 하는 인사를 ___라 한다.",
    answer: "세배",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "추석에 먹는 전통 음식은 ___이다.",
    answer: "송편",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라 전통 집을 ___이라(라) 한다.",
    answer: "한옥",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "한옥의 바닥 난방 방식을 ___이라(라) 한다.",
    answer: "온돌",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라 전통 종이를 ___라 한다.",
    answer: "한지",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라 전통 악기 중 현악기에는 가야금과 ___가 있다.",
    answer: "거문고",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "탈을 쓰고 노래와 춤을 하는 전통 놀이를 ___이라(라) 한다.",
    answer: "탈춤",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "김치를 담그는 문화는 유네스코 ___에 등재되었다.",
    answer: "무형문화유산",
    category: "문화",
    gradeGroup: "upper",
  },
  {
    text: "우리나라의 국기는 ___다.",
    answer: "태극기",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 국화는 ___다.",
    answer: "무궁화",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라의 국가(노래)는 ___다.",
    answer: "애국가",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "음력 1월 1일을 ___이라(라) 한다.",
    answer: "설날",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "음력 8월 15일을 ___이라(라) 한다.",
    answer: "추석",
    category: "문화",
    gradeGroup: "lower",
  },
  {
    text: "단오에 하는 전통 놀이는 ___타기이다.",
    answer: "그네",
    category: "문화",
    gradeGroup: "lower",
  },

  // ── 법 (Law) ──
  {
    text: "사회 구성원이 지켜야 할 강제적 규칙을 ___이라(라) 한다.",
    answer: "법",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "법을 어기면 받는 불이익을 ___이라(라) 한다.",
    answer: "처벌",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "어린이를 보호하기 위한 법을 ___법이라 한다.",
    answer: "아동복지",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "교통 규칙을 정한 법을 ___법이라 한다.",
    answer: "도로교통",
    category: "법",
    gradeGroup: "lower",
  },
  {
    text: "학교에서 지켜야 할 규칙을 ___이라(라) 한다.",
    answer: "교칙",
    category: "법",
    gradeGroup: "lower",
  },
  {
    text: "모든 국민은 법 앞에 ___하다.",
    answer: "평등",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "다른 사람의 물건을 훔치는 것은 ___죄이다.",
    answer: "절도",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "법을 위반했는지 판단하는 사람을 ___라 한다.",
    answer: "판사",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "피고인의 권리를 지켜주는 사람을 ___라 한다.",
    answer: "변호사",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "범죄를 수사하는 사람을 ___라 한다.",
    answer: "검사",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "사회 질서를 유지하기 위해 법이 ___하다.",
    answer: "필요",
    category: "법",
    gradeGroup: "lower",
  },
  {
    text: "어린이는 ___세 미만의 사람을 말한다.",
    answer: "18",
    category: "법",
    gradeGroup: "lower",
  },
  {
    text: "법 중에서 가장 높은 법은 ___이다.",
    answer: "헌법",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "국민의 의무에는 납세, 국방, 교육, ___의 의무가 있다.",
    answer: "근로",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "재판을 받을 수 있는 권리를 ___권이라 한다.",
    answer: "재판청구",
    category: "법",
    gradeGroup: "upper",
  },
  {
    text: "환경을 보호하기 위한 법을 ___법이라 한다.",
    answer: "환경보전",
    category: "법",
    gradeGroup: "upper",
  },

  // ── 환경 (Social Environment) ──
  {
    text: "사람과 자연이 어울려 사는 발전을 ___발전이라 한다.",
    answer: "지속가능한",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "쓰레기를 줄이고 다시 쓰는 것을 ___이라(라) 한다.",
    answer: "재활용",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "공장에서 나오는 오염 물질이 공기를 더럽히는 것을 ___이라(라) 한다.",
    answer: "대기오염",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "깨끗한 물을 지키기 위해 오염을 줄이는 활동을 ___보전이라 한다.",
    answer: "수질",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "자연재해에 대비하기 위해 만든 계획을 ___계획이라 한다.",
    answer: "방재",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "숲이 줄어드는 현상을 ___화라 한다.",
    answer: "사막",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "에너지를 아껴 쓰는 것을 에너지 ___이라(라) 한다.",
    answer: "절약",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "물건을 오래 사용하는 것도 환경 ___에 도움이 된다.",
    answer: "보호",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "탄소 배출을 줄이는 생활을 ___탄소 생활이라 한다.",
    answer: "저",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "일회용품 사용을 줄이면 ___을 보호할 수 있다.",
    answer: "환경",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "자연을 보호하기 위해 지정한 지역을 ___공원이라 한다.",
    answer: "국립",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "미세먼지가 심할 때는 ___를 착용해야 한다.",
    answer: "마스크",
    category: "환경",
    gradeGroup: "lower",
  },
  {
    text: "물부족 문제를 해결하기 위해 ___을 건설한다.",
    answer: "댐",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "폐수를 깨끗하게 만드는 시설을 ___장이라 한다.",
    answer: "하수처리",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "바다에 버려진 쓰레기를 ___쓰레기라 한다.",
    answer: "해양",
    category: "환경",
    gradeGroup: "upper",
  },
  {
    text: "지구의 기온이 올라가는 현상을 ___라 한다.",
    answer: "지구온난화",
    category: "환경",
    gradeGroup: "upper",
  },

  // ── 세계 (World) ──
  {
    text: "세계에서 가장 큰 대륙은 ___다.",
    answer: "아시아",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "세계에서 가장 큰 바다는 ___양이다.",
    answer: "태평",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "세계에서 가장 인구가 많은 나라는 ___다.",
    answer: "인도",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "세계에서 면적이 가장 큰 나라는 ___다.",
    answer: "러시아",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "피라미드가 있는 나라는 ___다.",
    answer: "이집트",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "에펠탑이 있는 나라는 ___다.",
    answer: "프랑스",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "세계 여러 나라가 모인 국제기구를 ___이라(라) 한다.",
    answer: "유엔",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "지구는 ___개의 대륙으로 이루어져 있다.",
    answer: "6",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "적도 근처는 일 년 내내 ___다.",
    answer: "덥",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "세계의 시간 차이가 나는 이유는 지구가 ___하기 때문이다.",
    answer: "자전",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "일본의 수도는 ___다.",
    answer: "도쿄",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "미국의 수도는 ___이다.",
    answer: "워싱턴 D.C.",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "중국의 수도는 ___이다.",
    answer: "베이징",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "영국의 수도는 ___이다.",
    answer: "런던",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "지구 위의 가로선을 ___라 한다.",
    answer: "위도",
    category: "세계",
    gradeGroup: "upper",
  },
  {
    text: "지구 위의 세로선을 ___라 한다.",
    answer: "경도",
    category: "세계",
    gradeGroup: "upper",
  },

  // ── 한국사 (Korean History) ──
  {
    text: "고려 시대에 만든 금속 활자를 ___이라(라) 한다.",
    answer: "직지심체요절",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "세계 최초의 금속 활자 인쇄본은 ___이다.",
    answer: "직지심체요절",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "조선 시대의 신분 제도에서 가장 높은 신분은 ___이다.",
    answer: "양반",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "독립운동가로 안중근 의사가 쏜 사람은 ___다.",
    answer: "이토 히로부미",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "3·1 운동이 일어난 해는 ___년이다.",
    answer: "1919",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "대한민국 임시정부가 세워진 도시는 ___다.",
    answer: "상하이",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "경복궁을 지은 왕조는 ___이다.",
    answer: "조선",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "고려의 수도는 ___이다.",
    answer: "개경",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "조선 시대 과거 시험은 ___를 뽑기 위한 것이었다.",
    answer: "관리",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "을사늑약으로 빼앗긴 것은 ___권이다.",
    answer: "외교",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "일제 강점기에 우리말을 지키려 한 단체는 ___회이다.",
    answer: "조선어학",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "고구려의 고분 벽화로 유명한 것은 ___총이다.",
    answer: "무용",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "신라의 화랑들이 지킨 다섯 가지 덕목을 ___라 한다.",
    answer: "세속오계",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "조선 시대 학문을 연구하던 곳을 ___이라(라) 한다.",
    answer: "성균관",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "고려 시대에 몽골의 침입을 막으며 만든 것은 ___이다.",
    answer: "팔만대장경",
    category: "한국사",
    gradeGroup: "upper",
  },
  {
    text: "석굴암과 불국사가 있는 도시는 ___다.",
    answer: "경주",
    category: "한국사",
    gradeGroup: "upper",
  },

  // ── 인권 (Human Rights) ──
  {
    text: "사람이 태어나면서부터 가지는 권리를 ___이라(라) 한다.",
    answer: "인권",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "모든 사람은 ___하게 태어났다.",
    answer: "평등",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "어린이의 권리를 보장하는 국제 협약을 ___이라(라) 한다.",
    answer: "아동권리협약",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "남녀가 동등한 기회를 갖는 것을 ___평등이라 한다.",
    answer: "양성",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "장애인이 불편 없이 생활할 수 있는 시설을 ___시설이라 한다.",
    answer: "편의",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "친구를 따돌리거나 괴롭히는 것은 학교 ___이다.",
    answer: "폭력",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "사람의 생각을 자유롭게 말할 수 있는 권리를 ___의 자유라 한다.",
    answer: "표현",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "자신의 종교를 자유롭게 믿을 수 있는 권리를 ___의 자유라 한다.",
    answer: "종교",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "교육을 받을 수 있는 권리를 ___권이라 한다.",
    answer: "교육",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "건강하게 살 수 있는 권리를 ___권이라 한다.",
    answer: "건강",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "어린이날은 ___월 5일이다.",
    answer: "5",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "세계 인권 선언은 ___년에 발표되었다.",
    answer: "1948",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "차별 없이 모든 사람을 존중하는 것을 ___이라(라) 한다.",
    answer: "존엄",
    category: "인권",
    gradeGroup: "upper",
  },
  {
    text: "학교에서 친구를 왕따시키는 것은 ___에 해당한다.",
    answer: "학교폭력",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "노인을 공경하는 것을 ___이라(라) 한다.",
    answer: "경로효친",
    category: "인권",
    gradeGroup: "lower",
  },
  {
    text: "이웃과 서로 돕고 사는 것을 ___라 한다.",
    answer: "상부상조",
    category: "인권",
    gradeGroup: "lower",
  },

  // ── 민주주의 (Democracy) ──
  {
    text: "국민이 주인인 정치 제도를 ___주의라 한다.",
    answer: "민주",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "다수결의 원칙에서도 ___의 의견을 존중해야 한다.",
    answer: "소수",
    category: "민주주의",
    gradeGroup: "lower",
  },
  {
    text: "민주주의에서 가장 중요한 가치는 ___다.",
    answer: "자유",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "선거에서 한 사람이 한 표를 행사하는 원칙을 ___선거라 한다.",
    answer: "평등",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "비밀투표는 자신이 누구를 뽑았는지 ___으로 하는 것이다.",
    answer: "비밀",
    category: "민주주의",
    gradeGroup: "lower",
  },
  {
    text: "학급 회의에서 의견을 말하는 것은 ___에 참여하는 것이다.",
    answer: "민주주의",
    category: "민주주의",
    gradeGroup: "lower",
  },
  {
    text: "시위나 집회에 참여할 수 있는 권리를 ___의 자유라 한다.",
    answer: "집회",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "언론이 자유롭게 보도할 수 있는 것을 ___의 자유라 한다.",
    answer: "언론",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "국민이 직접 대표를 뽑는 민주주의를 ___민주주의라 한다.",
    answer: "대의",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "국민이 직접 정책을 결정하는 민주주의를 ___민주주의라 한다.",
    answer: "직접",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "우리나라 최초의 민주화 운동 중 하나는 4·19 ___이다.",
    answer: "혁명",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "5·18 민주화 운동이 일어난 도시는 ___다.",
    answer: "광주",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "민주주의에서 권력을 나누는 것을 ___분립이라 한다.",
    answer: "삼권",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "삼권분립에서 세 가지 권력은 입법, 행정, ___이다.",
    answer: "사법",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "대한민국은 ___공화국이다.",
    answer: "민주",
    category: "민주주의",
    gradeGroup: "upper",
  },
  {
    text: "국민의 뜻을 모아 나라를 이끄는 것을 ___라 한다.",
    answer: "민주정치",
    category: "민주주의",
    gradeGroup: "lower",
  },

  // ── 전통문화 (Traditional Culture) ──
  {
    text: "설날에 먹는 전통 음식은 ___이다.",
    answer: "떡국",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "정월 대보름에 먹는 견과류를 ___이라(라) 한다.",
    answer: "부럼",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "김치를 함께 담그는 문화를 ___이라(라) 한다.",
    answer: "김장",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라 전통 무술을 ___라 한다.",
    answer: "태권도",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "전통 현악기 중 12줄로 된 악기는 ___이다.",
    answer: "가야금",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "우리나라 전통 놀이 중 새해에 하는 것은 ___다.",
    answer: "윷놀이",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "명절에 조상에게 드리는 의식을 ___라 한다.",
    answer: "차례",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "한옥의 여름철 시원한 마루를 ___라 한다.",
    answer: "대청마루",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "전통 그림에서 호랑이와 까치를 그린 그림을 ___도라 한다.",
    answer: "민화",
    category: "전통문화",
    gradeGroup: "upper",
  },
  {
    text: "우리나라 전통 도자기인 푸른빛 자기를 ___라 한다.",
    answer: "청자",
    category: "전통문화",
    gradeGroup: "upper",
  },
  {
    text: "조선 시대 하얀 도자기를 ___라 한다.",
    answer: "백자",
    category: "전통문화",
    gradeGroup: "upper",
  },
  {
    text: "전통 혼례에서 신부가 타는 것을 ___라 한다.",
    answer: "가마",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "판소리에서 노래를 부르는 사람을 ___이라(라) 한다.",
    answer: "소리꾼",
    category: "전통문화",
    gradeGroup: "upper",
  },
  {
    text: "판소리에서 북을 치는 사람을 ___라 한다.",
    answer: "고수",
    category: "전통문화",
    gradeGroup: "upper",
  },
  {
    text: "우리나라 전통 춤 중 부채를 사용하는 춤은 ___이다.",
    answer: "부채춤",
    category: "전통문화",
    gradeGroup: "lower",
  },
  {
    text: "한복에서 여자 윗옷을 ___라 한다.",
    answer: "저고리",
    category: "전통문화",
    gradeGroup: "lower",
  },

  // ── 사회문제 (Social Issues) ──
  {
    text: "태어나는 아이의 수가 줄어드는 현상을 ___화라 한다.",
    answer: "저출산",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "노인 인구가 늘어나는 현상을 ___화라 한다.",
    answer: "고령",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "여러 나라 사람들이 함께 어울려 사는 사회를 ___사회라 한다.",
    answer: "다문화",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "일자리가 부족하여 일할 수 없는 상태를 ___이라(라) 한다.",
    answer: "실업",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "가난한 사람과 부자의 차이가 큰 것을 ___격차라 한다.",
    answer: "빈부",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "인터넷에서 거짓 정보가 퍼지는 것을 ___뉴스라 한다.",
    answer: "가짜",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "스마트폰을 지나치게 사용하는 것을 ___이라(라) 한다.",
    answer: "중독",
    category: "사회문제",
    gradeGroup: "lower",
  },
  {
    text: "교통사고를 줄이기 위해 ___을 지켜야 한다.",
    answer: "교통규칙",
    category: "사회문제",
    gradeGroup: "lower",
  },
  {
    text: "자연재해로 인한 피해를 줄이는 활동을 ___활동이라 한다.",
    answer: "방재",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "정보를 안전하게 보호하는 것을 ___보호라 한다.",
    answer: "개인정보",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "사이버 공간에서의 예절을 ___이라(라) 한다.",
    answer: "네티켓",
    category: "사회문제",
    gradeGroup: "lower",
  },
  {
    text: "안전한 먹거리를 위한 관리를 ___안전이라 한다.",
    answer: "식품",
    category: "사회문제",
    gradeGroup: "lower",
  },
  {
    text: "지역 간 발전 차이를 ___격차라 한다.",
    answer: "지역",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "에너지를 아끼고 환경을 생각하는 생활을 ___생활이라 한다.",
    answer: "녹색",
    category: "사회문제",
    gradeGroup: "upper",
  },
  {
    text: "학교 주변에서 어린이를 보호하는 구역을 ___ 보호 구역이라 한다.",
    answer: "어린이",
    category: "사회문제",
    gradeGroup: "lower",
  },
  {
    text: "불이 났을 때를 대비해 밖으로 피하는 연습을 ___ 훈련이라 한다.",
    answer: "대피",
    category: "사회문제",
    gradeGroup: "lower",
  },

  // ── 직업 (Jobs) ──
  {
    text: "아픈 사람을 치료하는 사람을 ___라 한다.",
    answer: "의사",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "건물을 설계하는 사람을 ___라 한다.",
    answer: "건축가",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "비행기를 조종하는 사람을 ___라 한다.",
    answer: "조종사",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "학생을 가르치는 사람을 ___라 한다.",
    answer: "교사",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "불을 끄고 사람을 구하는 사람을 ___이라(라) 한다.",
    answer: "소방관",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "나라를 지키는 사람을 ___이라(라) 한다.",
    answer: "군인",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "범인을 잡는 사람을 ___이라(라) 한다.",
    answer: "경찰",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "요리를 전문으로 하는 사람을 ___라 한다.",
    answer: "요리사",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "농작물을 기르는 사람을 ___라 한다.",
    answer: "농부",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "바다에서 물고기를 잡는 사람을 ___라 한다.",
    answer: "어부",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "컴퓨터 프로그램을 만드는 사람을 ___라 한다.",
    answer: "프로그래머",
    category: "직업",
    gradeGroup: "upper",
  },
  {
    text: "새로운 것을 연구하는 사람을 ___라 한다.",
    answer: "과학자",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "사진을 찍는 것을 직업으로 하는 사람을 ___라 한다.",
    answer: "사진작가",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "현장을 취재해 뉴스 기사를 쓰는 사람을 ___라 한다.",
    answer: "기자",
    category: "직업",
    gradeGroup: "lower",
  },
  {
    text: "환경을 연구하고 보호하는 사람을 ___라 한다.",
    answer: "환경전문가",
    category: "직업",
    gradeGroup: "upper",
  },
  {
    text: "우주를 탐험하는 사람을 ___라 한다.",
    answer: "우주비행사",
    category: "직업",
    gradeGroup: "lower",
  },

  // ── 지역사회 (Local Community) ──
  {
    text: "시골 마을에서 주민을 대표해 일하는 사람을 ___이라(라) 한다.",
    answer: "이장",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "지역의 문제를 해결하기 위해 모이는 곳을 ___라 한다.",
    answer: "주민센터",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "동네에서 책을 빌려 볼 수 있는 곳은 ___이다.",
    answer: "도서관",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "아픈 사람을 치료하는 곳은 ___이다.",
    answer: "병원",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "물건을 사고파는 장소를 ___이라(라) 한다.",
    answer: "시장",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "우편물을 보내는 곳은 ___이다.",
    answer: "우체국",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "돈을 맡기거나 빌리는 곳은 ___이다.",
    answer: "은행",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "범죄를 신고하는 곳은 ___다.",
    answer: "경찰서",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "불이 났을 때 신고하는 곳은 ___다.",
    answer: "소방서",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "화재 신고 전화번호는 ___다.",
    answer: "119",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "범죄 신고 전화번호는 ___다.",
    answer: "112",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "지역의 환경을 깨끗하게 유지하는 것을 ___라 한다.",
    answer: "환경미화",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "이웃끼리 서로 돕는 것을 ___이라(라) 한다.",
    answer: "이웃사촌",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "지역 축제에 참여하면 지역의 ___를 알 수 있다.",
    answer: "문화",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "주민이 함께 사용하는 시설을 ___시설이라 한다.",
    answer: "공공",
    category: "지역사회",
    gradeGroup: "lower",
  },
  {
    text: "도시와 농촌이 서로 도우며 교류하는 것을 ___교류라 한다.",
    answer: "도농",
    category: "지역사회",
    gradeGroup: "upper",
  },
];

// ─── GENERATOR FUNCTIONS ────────────────────────────────────

function filterByGrade(
  items: readonly (ScienceItem | SocialItem)[],
  grade: number,
): (ScienceItem | SocialItem)[] {
  const isLower = grade <= 4;
  return items.filter((item) => {
    if (item.gradeGroup === "both") return true;
    if (isLower && item.gradeGroup === "lower") return true;
    if (!isLower && item.gradeGroup === "upper") return true;
    // For upper grades, also include lower grade items at reduced weight handled by duplication below
    if (!isLower && item.gradeGroup === "lower") return true;
    return false;
  });
}

function buildPool(
  items: readonly (ScienceItem | SocialItem)[],
  grade: number,
  seed: number,
  targetSize: number,
  difficulty: 1 | 2 | 3 = 2,
): KnowledgeEntry[] {
  const rng = seededRandom(seed);
  let eligible = filterByGrade(items, grade);

  // Filter by difficulty: slice the eligible entries array
  if (difficulty === 1) {
    // Easy: use first 40% of entries (basic/observable facts)
    eligible = eligible.slice(0, Math.ceil(eligible.length * 0.4));
  } else if (difficulty === 3) {
    // Hard: use last 40% of entries (abstract/analytical facts)
    eligible = eligible.slice(Math.floor(eligible.length * 0.6));
  }
  // difficulty === 2: no filtering (current behavior)

  // Weight: for grades 5-6, duplicate upper-grade items to bias toward them
  const weighted: (ScienceItem | SocialItem)[] = [];
  for (const item of eligible) {
    if (grade >= 5 && item.gradeGroup === "upper") {
      weighted.push(item, item, item); // 3x weight for advanced content
    } else if (grade >= 5 && item.gradeGroup === "both") {
      weighted.push(item, item);
    } else {
      weighted.push(item);
    }
  }

  // Expand to target size by cycling through shuffled pool
  const shuffled = shuffle(weighted, rng);
  const pool: KnowledgeEntry[] = [];
  const seen = new Set<string>();

  // First pass: add all unique items
  for (const item of shuffled) {
    const key = item.text + "|" + item.answer;
    if (!seen.has(key)) {
      seen.add(key);
      const entry: KnowledgeEntry = {
        text: item.text,
        answer: item.answer,
        category: item.category,
        gradeGroup: item.gradeGroup,
      };
      if ((item as ScienceItem).unit) entry.unit = (item as ScienceItem).unit;
      pool.push(entry);
    }
  }

  // If pool is empty after filtering, return empty
  if (pool.length === 0) return [];

  // If we still need more, create variation entries by combining with grade context
  let round = 0;
  while (pool.length < targetSize) {
    round++;
    const extraRng = seededRandom(seed + round * 9999);
    const reshuffled = shuffle([...pool], extraRng);
    for (const entry of reshuffled) {
      if (pool.length >= targetSize) break;
      pool.push({ ...entry });
    }
  }

  // Final shuffle and trim
  const finalPool = shuffle(pool, seededRandom(seed + 7777));
  return finalPool.slice(0, targetSize);
}

// ─── EXTRA SCIENCE (compact tuples) ──────────────────────────
const SCI_X: [string, string, string, "lower" | "upper" | "both"][] = [
  [
    "개구리의 성장 과정에서 올챙이가 모습이 크게 바뀌는 것을 ___이라(라) 한다.",
    "탈바꿈",
    "생물",
    "lower",
  ],
  ["식물의 꽃에서 꿀을 만드는 부분을 ___이라(라) 한다.", "꿀샘", "생물", "lower"],
  [
    "동물의 몸 온도가 주변에 따라 변하면 ___동물이라 한다.",
    "변온",
    "생물",
    "both",
  ],
  ["포유류는 새끼에게 ___을 먹여 키운다.", "젖", "생물", "lower"],
  ["거미는 곤충이 아닌 ___류에 속한다.", "거미", "생물", "lower"],
  ["상어는 뼈가 ___으로 되어 있다.", "연골", "생물", "upper"],
  ["조류의 몸은 ___으로 덮여 있다.", "깃털", "생물", "lower"],
  ["파충류의 몸은 ___으로 덮여 있다.", "비늘", "생물", "lower"],
  ["양서류는 어릴 때 ___로 숨을 쉰다.", "아가미", "생물", "lower"],
  ["식물의 광합성은 ___에서 일어난다.", "잎", "생물", "both"],
  [
    "식물의 잎이 초록색인 이유는 ___라는 물질 때문이다.",
    "엽록소",
    "생물",
    "upper",
  ],
  ["식물의 꽃가루가 암술에 닿는 것을 ___이라(라) 한다.", "수분", "생물", "lower"],
  ["열매 안에 들어있는 것을 ___이라(라) 한다.", "씨앗", "생물", "lower"],
  ["지구의 표면은 여러 개의 ___으로 나뉘어 있다.", "판", "지구", "upper"],
  ["지진의 세기를 나타내는 단위를 ___라 한다.", "규모", "지구", "upper"],
  ["화산이 폭발할 때 나오는 가스를 ___라 한다.", "화산가스", "지구", "upper"],
  ["퇴적암 중 모래가 굳어진 것을 ___암이라 한다.", "사", "지구", "upper"],
  ["변성암은 열과 ___을 받아 변한 암석이다.", "압력", "지구", "upper"],
  ["달의 바다라 불리는 어두운 부분은 사실 ___이다.", "평원", "우주", "upper"],
  [
    "별자리 중 북쪽 하늘의 국자 모양은 ___자리이다.",
    "북두칠성",
    "우주",
    "lower",
  ],
  ["태양은 스스로 빛을 내는 ___이다.", "별", "우주", "lower"],
  ["달처럼 행성 주위를 도는 천체를 ___이라(라) 한다.", "위성", "우주", "lower"],
  ["혜성의 꼬리는 태양과 ___방향으로 생긴다.", "반대", "우주", "upper"],
  ["날씨를 예보하는 기관을 ___이라(라) 한다.", "기상청", "날씨", "lower"],
  ["습도가 높으면 빨래가 ___마른다.", "천천히", "날씨", "lower"],
  ["안개는 지표면 가까이에 생긴 ___이다.", "구름", "날씨", "lower"],
  ["이슬은 수증기가 ___되어 생긴다.", "응결", "날씨", "lower"],
  [
    "전기 회로에서 전류가 흐르려면 회로가 ___되어야 한다.",
    "연결",
    "물리",
    "lower",
  ],
  ["전선이 끊어지면 ___회로라 한다.", "개방", "물리", "lower"],
  ["전구 두 개를 나란히 연결하면 ___연결이라 한다.", "병렬", "물리", "upper"],
  ["전구 두 개를 이어서 연결하면 ___연결이라 한다.", "직렬", "물리", "upper"],
  ["건전지에 저장된 에너지는 ___에너지이다.", "화학", "물리", "upper"],
  ["떨어지는 물체는 ___에너지가 증가한다.", "운동", "물리", "upper"],
  ["높은 곳에 있는 물체는 ___에너지가 크다.", "위치", "물리", "upper"],
  ["소리가 벽에 부딪혀 되돌아오는 것을 ___라 한다.", "메아리", "물리", "lower"],
  ["소리의 높낮이는 ___에 따라 달라진다.", "진동수", "물리", "upper"],
  ["렌즈로 빛을 모으면 ___가 높아진다.", "온도", "물리", "lower"],
  ["무지개의 색 순서는 빨주노초파남___다.", "보", "물리", "lower"],
  ["프리즘으로 햇빛을 분리하면 ___가지 색이 나온다.", "7", "물리", "lower"],
  ["볼록렌즈는 빛을 한 곳으로 ___시킨다.", "모음", "물리", "upper"],
  ["오목렌즈는 빛을 ___시킨다.", "퍼지게", "물리", "upper"],
  [
    "물속에서 동전이 실제보다 ___보이는 것은 굴절 때문이다.",
    "가깝게",
    "물리",
    "upper",
  ],
  ["체온계의 원리는 물질의 ___팽창이다.", "열", "물리", "lower"],
  ["음식물이 상하는 것을 ___라 한다.", "부패", "생물", "lower"],
  ["우유를 높은 온도로 가열하는 것을 ___이라(라) 한다.", "살균", "화학", "upper"],
  ["탄산음료에 들어있는 기체는 ___다.", "이산화탄소", "화학", "upper"],
  // ── 물리 추가 ──
  ["물체가 빠르게 움직일수록 ___에너지가 크다.", "운동", "물리", "lower"],
  [
    "시소에서 무거운 사람이 받침점에 ___가 앉으면 균형이 맞는다.",
    "가까",
    "물리",
    "lower",
  ],
  ["물체를 밀거나 당기는 것을 ___이라(라) 한다.", "힘", "물리", "lower"],
  [
    "두 물체가 접촉하면 운동을 방해하는 ___이 생긴다.",
    "마찰력",
    "물리",
    "upper",
  ],
  ["물 위에 동전이 뜨는 것은 ___장력 때문이다.", "표면", "물리", "upper"],
  [
    "빛이 다른 물질로 들어갈 때 방향이 바뀌는 것을 ___이라(라) 한다.",
    "굴절",
    "물리",
    "upper",
  ],
  ["물체가 진동하면 ___가 발생한다.", "소리", "물리", "lower"],
  ["진동이 빠를수록 소리가 ___아진다.", "높", "물리", "lower"],
  ["진공 속에서 소리가 전달되지 ___는다.", "않", "물리", "upper"],
  ["열은 온도가 높은 곳에서 ___은 곳으로 이동한다.", "낮", "물리", "upper"],
  ["깃털과 돌을 진공에서 떨어뜨리면 동시에 ___한다.", "도착", "물리", "upper"],
  [
    "스프링의 늘어난 길이는 매단 물체의 ___에 비례한다.",
    "무게",
    "물리",
    "lower",
  ],
  ["같은 무게라도 접촉 면적이 작으면 ___이 커진다.", "압력", "물리", "upper"],
  [
    "고무줄을 늘렸다 놓으면 원래대로 돌아오는 힘을 ___이라(라) 한다.",
    "튕기는 힘",
    "물리",
    "lower",
  ],
  [
    "전지에서 +극에서 -극으로 전기가 흐르는 것을 ___라 한다.",
    "전류",
    "물리",
    "upper",
  ],
  [
    "물풍선이 터지면 물이 사방으로 퍼지는 것은 ___때문이다.",
    "압력",
    "물리",
    "lower",
  ],
  ["소리는 고체, 액체, 기체 중 ___에서 가장 빠르다.", "고체", "물리", "upper"],
  ["빛의 삼원색은 빨강, 초록, ___이다.", "파랑", "물리", "upper"],
  ["색의 삼원색은 빨강, 노랑, ___이다.", "파랑", "물리", "lower"],
  [
    "정지해 있는 물체는 힘을 가하지 않으면 계속 ___해 있다.",
    "정지",
    "물리",
    "lower",
  ],
  // ── 화학 추가 ──
  ["물이 0도에서 얼어서 단단해지는 것은 ___변화이다.", "상태", "화학", "lower"],
  ["물을 전기분해하면 수소와 ___가 나온다.", "산소", "화학", "upper"],
  ["레몬즙은 ___맛이 나는 산성 물질이다.", "신", "화학", "lower"],
  ["베이킹소다는 ___성 물질이다.", "염기", "화학", "upper"],
  [
    "설탕을 가열하면 갈색으로 변하는 것을 ___라 한다.",
    "캐러멜화",
    "화학",
    "lower",
  ],
  [
    "알코올 온도계에서 빨간 액체가 올라가는 것은 ___때문이다.",
    "열팽창",
    "화학",
    "lower",
  ],
  ["물은 4도에서 부피가 가장 ___다.", "작", "화학", "upper"],
  ["얼음이 물에 뜨는 이유는 부피가 ___기 때문이다.", "커지", "화학", "lower"],
  [
    "철에 녹이 스는 것은 철과 ___가 반응하기 때문이다.",
    "산소",
    "화학",
    "upper",
  ],
  [
    "불이 타려면 연료, 산소, ___의 세 가지가 필요하다.",
    "점화온도",
    "화학",
    "upper",
  ],
  ["소화기는 산소를 차단하여 불을 ___는 도구이다.", "끄", "화학", "lower"],
  ["식초와 베이킹소다를 섞으면 ___가 발생한다.", "이산화탄소", "화학", "lower"],
  ["소금물을 증발시키면 ___이 남는다.", "소금", "화학", "lower"],
  ["기름과 물을 섞으면 서로 ___지 않는다.", "섞이", "화학", "lower"],
  ["세제를 넣으면 기름과 물이 ___게 된다.", "섞이", "화학", "lower"],
  [
    "물에 잉크를 떨어뜨리면 퍼지는 현상을 ___이라(라) 한다.",
    "확산",
    "화학",
    "upper",
  ],
  // ── 생물 추가 ──
  ["사람의 뼈는 약 ___개이다.", "206", "생물", "upper"],
  ["사람의 이(치아)는 영구치 기준 ___개이다.", "32", "생물", "upper"],
  [
    "식물의 뿌리 끝에서 물을 흡수하는 것을 ___이라(라) 한다.",
    "뿌리털",
    "생물",
    "lower",
  ],
  ["곰팡이와 버섯은 ___류에 속한다.", "균", "생물", "upper"],
  ["혈액이 흐르는 관을 ___이라(라) 한다.", "혈관", "생물", "lower"],
  ["눈의 검은 부분을 ___라 한다.", "눈동자", "생물", "lower"],
  [
    "식물이 계절에 따라 잎을 떨어뜨리는 것을 ___이라(라) 한다.",
    "낙엽",
    "생물",
    "lower",
  ],
  ["민들레 씨앗은 ___을 이용해 퍼진다.", "바람", "생물", "lower"],
  ["도꼬마리 씨앗은 ___의 몸에 붙어 퍼진다.", "동물", "생물", "lower"],
  ["고구마는 ___로 번식할 수 있다.", "줄기", "생물", "lower"],
  ["감자의 먹는 부분은 ___가 변한 것이다.", "줄기", "생물", "lower"],
  ["당근의 먹는 부분은 ___가 변한 것이다.", "뿌리", "생물", "lower"],
  [
    "미생물 중에서 유산균은 ___를 만드는 데 쓰인다.",
    "요구르트",
    "생물",
    "lower",
  ],
  ["사람의 혈액형은 A형, B형, AB형, ___형이 있다.", "O", "생물", "upper"],
  ["심장은 1분에 약 ___번 뛴다.", "70", "생물", "upper"],
  ["꿀벌이 꽃가루를 옮기는 것을 ___라 한다.", "화분매개", "생물", "both"],
  ["낙타의 혹에는 ___이 저장되어 있다.", "지방", "생물", "lower"],
  ["카멜레온은 주변 환경에 맞게 ___을 바꾼다.", "색", "생물", "lower"],
  // ── 지구 추가 ──
  ["지구의 나이는 약 ___억 년이다.", "46", "지구", "upper"],
  ["지층은 ___에서 위로 순서대로 쌓인다.", "아래", "지구", "lower"],
  [
    "석회암 동굴에서 천장에 매달린 것을 ___이라(라) 한다.",
    "종유석",
    "지구",
    "upper",
  ],
  ["석회암 동굴에서 바닥에서 자란 것을 ___이라(라) 한다.", "석순", "지구", "upper"],
  ["바닷물이 증발하면 ___이 남는다.", "소금", "지구", "lower"],
  [
    "강 상류에서는 바위가 깎여 V자 모양의 ___이 만들어진다.",
    "계곡",
    "지구",
    "lower",
  ],
  ["화석 연료가 만들어지는 데는 수___만 년이 걸린다.", "백", "지구", "upper"],
  ["화산에서 분출되는 작은 돌 조각을 ___라 한다.", "화산재", "지구", "lower"],
  ["토양은 바위가 ___작용을 받아 잘게 부서진 것이다.", "풍화", "지구", "lower"],
  // ── 날씨 추가 ──
  ["기압이 낮은 곳에서는 날씨가 ___다.", "흐리", "날씨", "upper"],
  ["기압이 높은 곳에서는 날씨가 ___다.", "맑", "날씨", "upper"],
  [
    "따뜻한 공기가 찬 공기 위로 올라가면 ___이 만들어진다.",
    "구름",
    "날씨",
    "lower",
  ],
  ["우박은 구름 속에서 물방울이 ___된 것이다.", "얼음", "날씨", "lower"],
  ["황사는 중국과 몽골의 ___에서 날아온다.", "사막", "날씨", "both"],
  ["장마는 ___에 비가 오랫동안 내리는 현상이다.", "여름", "날씨", "lower"],
  ["태풍의 중심을 ___이라(라) 한다.", "눈", "날씨", "upper"],
  ["기온이 0도 이하로 내려가면 ___이 내린다.", "눈", "날씨", "lower"],
  ["해풍은 낮에 ___에서 육지로 부는 바람이다.", "바다", "날씨", "upper"],
  ["육풍은 밤에 ___에서 바다로 부는 바람이다.", "육지", "날씨", "upper"],
  ["하루 중 기온이 가장 높은 때는 오후 ___시경이다.", "2", "날씨", "lower"],
  ["하루 중 기온이 가장 낮은 때는 해 뜨기 ___이다.", "직전", "날씨", "lower"],
  ["구름의 종류에는 적운, 층운, ___운이 있다.", "권", "날씨", "upper"],
  ["비의 양을 재는 기구를 ___라 한다.", "우량계", "날씨", "lower"],
  ["천둥 번개가 칠 때는 높은 곳에 ___으면 안 된다.", "서", "날씨", "lower"],
  [
    "무지개는 비가 온 후 ___빛이 물방울에 굴절되어 나타난다.",
    "햇",
    "날씨",
    "lower",
  ],
  ["봄에 부는 건조한 바람을 ___라 한다.", "꽃샘추위", "날씨", "lower"],
  ["눈이 많이 내린 것을 ___이라(라) 한다.", "폭설", "날씨", "lower"],
  ["비가 매우 많이 오는 것을 ___라 한다.", "폭우", "날씨", "lower"],
  ["겨울철 한파가 오면 수도관이 ___할 수 있다.", "동파", "날씨", "both"],
  // ── 우주 추가 ──
  ["태양계에서 두 번째로 큰 행성은 ___이다.", "토성", "우주", "upper"],
  ["태양에서 가장 먼 행성은 ___이다.", "해왕성", "우주", "upper"],
  ["금성은 ___의 여신 이름에서 따온 별이다.", "사랑", "우주", "lower"],
  ["태양계에서 가장 뜨거운 행성은 ___이다.", "금성", "우주", "upper"],
  ["태양계에서 지구 바로 안쪽 행성은 ___이다.", "금성", "우주", "upper"],
  ["태양계에서 지구 바로 바깥 행성은 ___이다.", "화성", "우주", "upper"],
  ["우리 은하의 이름은 ___다.", "은하수", "우주", "lower"],
  ["달의 표면에 있는 큰 구덩이를 ___라 한다.", "크레이터", "우주", "upper"],
  ["인류 최초로 달에 간 사람은 ___이다.", "닐 암스트롱", "우주", "upper"],
  ["별이 반짝이는 이유는 ___의 흔들림 때문이다.", "대기", "우주", "upper"],
  ["태양은 주로 ___로 이루어져 있다.", "수소", "우주", "upper"],
  ["일식은 달이 ___을 가릴 때 일어난다.", "태양", "우주", "both"],
  ["월식은 지구가 ___의 빛을 가릴 때 일어난다.", "달", "우주", "both"],
  ["북극성은 ___자리에 속해 있다.", "작은곰", "우주", "upper"],
  [
    "유성이 대기에서 타며 빛을 내는 것을 ___이라(라) 한다.",
    "별똥별",
    "우주",
    "lower",
  ],
  ["소행성은 주로 화성과 ___사이에 있다.", "목성", "우주", "upper"],
  ["태양의 흑점 수가 많으면 태양 활동이 ___하다.", "활발", "우주", "upper"],
  ["국제우주정거장의 약자는 ___이다.", "ISS", "우주", "upper"],
  ["밤하늘에서 가장 밝은 별은 ___다.", "시리우스", "우주", "upper"],
  ["천왕성은 ___으로 누워서 공전한다.", "옆", "우주", "upper"],
  ["수성에는 ___가 거의 없어 기온차가 매우 크다.", "대기", "우주", "upper"],
  ["목성의 큰 빨간 점은 거대한 ___이다.", "폭풍", "우주", "upper"],
  // ── 추가 물리/화학/생물/지구/날씨/우주 ──
  ["빗방울이 떨어지는 것은 ___때문이다.", "중력", "물리", "lower"],
  [
    "엘리베이터가 올라갈 때 몸이 무겁게 느껴지는 것은 ___때문이다.",
    "관성",
    "물리",
    "upper",
  ],
  ["자전거 바퀴에 공기를 넣으면 ___이 높아진다.", "기압", "물리", "lower"],
  ["물을 가열하면 수증기가 되는 것은 ___변화이다.", "상태", "화학", "lower"],
  ["구리와 주석을 섞으면 ___이 된다.", "청동", "화학", "upper"],
  ["물에 소금을 넣으면 끓는점이 ___아진다.", "높", "화학", "upper"],
  ["나방은 밤에 활동하는 ___성 곤충이다.", "야행", "생물", "lower"],
  [
    "식물의 줄기가 위로 자라는 것은 아래로 자라는 성질의 ___다.",
    "반대",
    "생물",
    "upper",
  ],
  ["겨울에 곰이 긴 잠을 자는 것을 ___이라(라) 한다.", "동면", "생물", "lower"],
  ["바닷물의 약 ___퍼센트가 소금이다.", "3.5", "지구", "upper"],
  ["지구에서 물이 가장 많은 곳은 ___다.", "바다", "지구", "lower"],
  [
    "사계절이 생기는 이유는 지구의 ___이 기울어져 있기 때문이다.",
    "자전축",
    "우주",
    "upper",
  ],
  [
    "보름달에서 다음 보름달까지의 기간은 약 ___일이다.",
    "29.5",
    "우주",
    "upper",
  ],

  // ══════════════════════════════════════════════════════════════
  // ── NEW SCIENCE ITEMS (200+) ──────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  // ── 동물의 생활 (lower, 3-4학년) ──
  ["개미는 땅속에 ___을 만들어 산다.", "집", "생물", "lower"],
  ["잠자리는 날개가 ___개이다.", "4", "생물", "lower"],
  ["무당벌레는 등에 ___이 있다.", "점", "생물", "lower"],
  ["달팽이는 등에 ___를 지고 다닌다.", "껍데기", "생물", "lower"],
  ["지렁이는 ___에서 산다.", "흙속", "생물", "lower"],
  ["메뚜기는 뒷다리가 길어 ___을 잘한다.", "뜀", "생물", "lower"],
  ["반딧불이는 배에서 ___을 낸다.", "빛", "생물", "lower"],
  ["장수풍뎅이의 수컷은 ___이 있다.", "뿔", "생물", "lower"],
  ["소금쟁이는 물 위를 ___수 있다.", "걸을", "생물", "lower"],
  ["까치는 나무 위에 ___를 짓는다.", "둥지", "생물", "lower"],
  [
    "기린의 목이 긴 이유는 높은 나무의 ___을 먹기 위해서이다.",
    "잎",
    "생물",
    "lower",
  ],
  ["코끼리는 ___로 물을 빨아 마신다.", "코", "생물", "lower"],
  ["펭귄은 날지 못하고 ___을 잘한다.", "수영", "생물", "lower"],
  ["돌고래는 물속에서 살지만 ___로 숨을 쉰다.", "폐", "생물", "lower"],
  ["올빼미는 ___에 활동하는 새이다.", "밤", "생물", "lower"],
  ["토끼의 귀가 긴 이유는 ___를 잘 듣기 위해서이다.", "소리", "생물", "lower"],
  [
    "고양이 눈이 어둠 속에서 빛나는 이유는 빛을 ___하기 때문이다.",
    "반사",
    "생물",
    "lower",
  ],
  ["강아지는 꼬리를 흔들어 ___을 표현한다.", "기분", "생물", "lower"],
  ["햄스터는 볼 주머니에 ___를 넣어 나른다.", "먹이", "생물", "lower"],
  ["금붕어는 ___로 숨을 쉰다.", "아가미", "생물", "lower"],

  // ── 식물의 생활 (lower, 3-4학년) ──
  ["해바라기는 ___를 향해 꽃이 핀다.", "해", "생물", "lower"],
  ["봉숭아 씨앗은 ___면 씨가 터져 나온다.", "만지", "생물", "lower"],
  ["소나무는 겨울에도 잎이 ___다.", "푸르", "생물", "lower"],
  ["벚나무는 ___에 꽃이 핀다.", "봄", "생물", "lower"],
  ["코스모스는 ___에 꽃이 핀다.", "가을", "생물", "lower"],
  ["은행나무 열매는 ___가 고약하다.", "냄새", "생물", "lower"],
  ["장미에는 ___가 있어 조심해야 한다.", "가시", "생물", "lower"],
  ["수박은 ___과일이다.", "여름", "생물", "lower"],
  ["사과 나무는 ___이 되면 열매를 맺는다.", "가을", "생물", "lower"],
  ["잔디는 줄기가 옆으로 ___어 퍼진다.", "뻗", "생물", "lower"],
  [
    "식물의 뿌리가 물을 빨아올리는 것은 ___때문이다.",
    "모세관현상",
    "생물",
    "upper",
  ],
  [
    "식물의 꽃잎이 화려한 이유는 곤충을 ___하기 위해서이다.",
    "유인",
    "생물",
    "lower",
  ],

  // ── 물질의 성질 (lower, 3-4학년) ──
  ["유리는 ___해서 안이 보인다.", "투명", "물질", "lower"],
  ["나무는 물에 ___는다.", "뜨", "물질", "lower"],
  ["돌은 물에 ___는다.", "가라앉", "물질", "lower"],
  ["고무는 잡아당기면 ___어진다.", "늘", "물질", "lower"],
  ["스펀지는 ___러워서 물을 잘 빨아들인다.", "부드", "물질", "lower"],
  ["쇠는 매우 ___해서 잘 부러지지 않는다.", "단단", "물질", "lower"],
  ["종이는 물에 젖으면 ___어진다.", "찢", "물질", "lower"],
  ["플라스틱은 가볍고 ___하기 어렵다.", "깨지", "물질", "lower"],
  ["도자기는 열에 강하지만 ___면 깨진다.", "떨어지", "물질", "lower"],
  ["면(무명)은 땀을 잘 ___한다.", "흡수", "물질", "lower"],

  // ── 자석 놀이 (lower, 3-4학년) ──
  ["자석은 ___으로 만든 물체를 끌어당긴다.", "철", "물질", "lower"],
  ["나침반 바늘은 자석으로 되어 있어 ___쪽을 가리킨다.", "북", "물질", "lower"],
  ["자석의 힘이 가장 센 곳은 양쪽 ___이다.", "극", "물질", "lower"],
  [
    "냉장고 문에 자석이 붙는 이유는 냉장고가 ___으로 만들어져서이다.",
    "철",
    "물질",
    "lower",
  ],
  ["자석으로 모래 속의 ___가루를 모을 수 있다.", "철", "물질", "lower"],

  // ── 그림자와 빛 (lower, 3-4학년) ──
  ["빛이 물체를 통과하지 못하면 ___가 생긴다.", "그림자", "빛과소리", "lower"],
  ["물체가 빛에 가까이 가면 그림자가 ___진다.", "커", "빛과소리", "lower"],
  ["물체가 빛에서 멀리 가면 그림자가 ___진다.", "작아", "빛과소리", "lower"],
  ["손전등 앞에 색 셀로판지를 대면 ___빛이 나온다.", "색", "빛과소리", "lower"],
  [
    "거울은 빛을 ___해서 자신의 모습을 볼 수 있다.",
    "반사",
    "빛과소리",
    "lower",
  ],

  // ── 소리 만들기 (lower, 3-4학년) ──
  ["북을 세게 치면 소리가 ___진다.", "커", "빛과소리", "lower"],
  ["기타 줄이 굵으면 소리가 ___아진다.", "낮", "빛과소리", "lower"],
  ["기타 줄이 가늘면 소리가 ___아진다.", "높", "빛과소리", "lower"],
  ["병에 물을 많이 넣고 불면 소리가 ___아진다.", "높", "빛과소리", "lower"],
  ["팬 플루트처럼 관이 짧으면 소리가 ___다.", "높", "빛과소리", "lower"],

  // ── 날씨와 계절 (lower, 3-4학년) ──
  ["봄에는 꽃이 ___는 계절이다.", "피", "날씨", "lower"],
  ["여름에는 낮이 ___고 밤이 짧다.", "길", "날씨", "lower"],
  ["가을에는 단풍나무 잎이 ___색으로 변한다.", "빨간", "날씨", "lower"],
  ["겨울에는 기온이 ___아진다.", "낮", "날씨", "lower"],
  [
    "비가 올 때 하늘에서 빛이 번쩍이는 것을 ___라 한다.",
    "번개",
    "날씨",
    "lower",
  ],
  [
    "구름이 많아 해가 보이지 않는 날씨를 ___하다고 한다.",
    "흐리",
    "날씨",
    "lower",
  ],
  ["바람이 세게 부는 것을 ___이라(라) 한다.", "강풍", "날씨", "lower"],
  ["여름에 갑자기 많이 내리는 비를 ___라 한다.", "소나기", "날씨", "lower"],

  // ── 물의 변화 (lower, 3-4학년) ──
  ["물을 냉동실에 넣으면 ___이 된다.", "얼음", "화학", "lower"],
  ["얼음을 꺼내 놓으면 녹아서 ___이 된다.", "물", "화학", "lower"],
  [
    "주전자의 물이 끓으면 김이 나오는데 이것은 ___다.",
    "수증기",
    "화학",
    "lower",
  ],
  [
    "차가운 컵 바깥에 물방울이 맺히는 것은 공기 중 ___가 물로 변한 것이다.",
    "수증기",
    "화학",
    "lower",
  ],
  ["빨래가 마르는 것은 물이 ___로 변하기 때문이다.", "수증기", "화학", "lower"],

  // ── 흙과 바위 (lower, 3-4학년) ──
  ["바위가 깨져서 작은 돌이 되는 것을 ___라 한다.", "풍화", "지구", "lower"],
  ["운동장 흙과 화단 흙은 알갱이의 ___가 다르다.", "크기", "지구", "lower"],
  ["화단의 흙에는 식물이 잘 자라도록 ___이 많다.", "양분", "지구", "lower"],
  ["조개껍데기가 돌에 박혀 있으면 그것은 ___이다.", "화석", "지구", "lower"],
  ["공룡의 뼈가 돌이 된 것도 ___이다.", "화석", "지구", "lower"],

  // ── 동물의 한살이 (lower, 3-4학년) ──
  ["닭의 한살이는 알→___→어른 닭이다.", "병아리", "생물", "lower"],
  [
    "개구리의 한살이는 알→올챙이→___→어른 개구리이다.",
    "뒷다리 올챙이",
    "생물",
    "lower",
  ],
  ["배추흰나비는 알→___→번데기→어른벌레 순서이다.", "애벌레", "생물", "lower"],
  ["잠자리의 애벌레는 물속에서 살며 ___라 불린다.", "수채", "생물", "lower"],
  ["매미는 땅속에서 ___년 이상 애벌레로 산다.", "7", "생물", "lower"],

  // ── 태양계와 별 (upper, 5-6학년) ──
  [
    "태양계 행성 순서: 수성, 금성, 지구, 화성, 목성, 토성, 천왕성, ___",
    "해왕성",
    "우주",
    "upper",
  ],
  ["태양은 지구보다 약 ___만 배 크다.", "109", "우주", "upper"],
  ["달에는 공기가 없어 소리가 ___된다.", "전달 안", "우주", "upper"],
  ["지구에서 달까지의 거리는 약 ___만 km이다.", "38", "우주", "upper"],
  ["지구에서 태양까지의 거리는 약 ___억 km이다.", "1.5", "우주", "upper"],

  // ── 전기 회로 (upper, 5-6학년) ──
  ["전구에 불이 켜지려면 전기 회로가 ___되어야 한다.", "연결", "전기", "upper"],
  [
    "직렬 연결에서 전구 하나가 끊어지면 다른 전구도 ___진다.",
    "꺼",
    "전기",
    "upper",
  ],
  [
    "병렬 연결에서 전구 하나가 끊어져도 다른 전구는 ___있다.",
    "켜져",
    "전기",
    "upper",
  ],
  ["전선의 껍질을 벗기면 안에 ___가 보인다.", "구리", "전기", "upper"],
  ["가정에서 사용하는 전기 콘센트의 전압은 ___V이다.", "220", "전기", "upper"],

  // ── 산과 염기 간단 (upper, 5-6학년) ──
  ["레몬, 식초처럼 신맛이 나는 물질은 ___성이다.", "산", "화학", "upper"],
  [
    "비누, 베이킹소다처럼 미끌미끌한 물질은 ___성이다.",
    "염기",
    "화학",
    "upper",
  ],
  [
    "산성과 염기성을 알아보는 종이를 ___종이라 한다.",
    "리트머스",
    "화학",
    "upper",
  ],
  ["양배추 즙에 산성 물질을 넣으면 ___색이 된다.", "붉은", "화학", "upper"],
  ["붉은 양배추 지시약에 산성 용액을 넣으면 ___ 계열의 색으로 변한다.", "붉은색",
    "화학",
    "upper",
  ],

  // ── 연소와 소화 (upper, 5-6학년) ──
  [
    "불이 타는 데 필요한 세 가지: 탈 것, 산소, ___",
    "높은 온도",
    "화학",
    "upper",
  ],
  ["불을 끄려면 산소를 ___하면 된다.", "차단", "화학", "upper"],
  ["촛불 위에 유리컵을 씌우면 불이 ___진다.", "꺼", "화학", "upper"],
  ["소화기 안에 든, 불을 끄는 가루나 액체를 소화 ___라 한다.", "약제", "화학", "upper"],
  ["화재 시 연기를 피해 ___을 낮추고 이동한다.", "몸", "화학", "upper"],

  // ── 식물의 구조 (upper, 5-6학년) ──
  ["식물의 뿌리 역할은 물과 양분을 ___하는 것이다.", "흡수", "생물", "upper"],
  ["식물의 줄기 역할은 물과 양분을 ___하는 것이다.", "운반", "생물", "upper"],
  ["식물의 잎 역할은 광합성으로 ___을 만드는 것이다.", "양분", "생물", "upper"],
  ["식물의 꽃 역할은 열매와 ___을 만드는 것이다.", "씨앗", "생물", "upper"],
  ["줄기를 자르면 나이테로 나무의 ___를 알 수 있다.", "나이", "생물", "upper"],

  // ── 우리 몸의 구조 간단 (upper, 5-6학년) ──
  ["음식을 삼키면 ___를 지나 위로 간다.", "식도", "인체", "upper"],
  ["위에서 음식이 잘게 부서지며 ___된다.", "소화", "인체", "upper"],
  ["소장에서 영양분이 ___으로 흡수된다.", "혈액", "인체", "upper"],
  ["숨을 들이마시면 공기가 ___로 들어간다.", "폐", "인체", "upper"],
  ["심장은 피를 온몸으로 ___어 준다.", "보내", "인체", "upper"],
  ["뇌는 우리 몸의 모든 활동을 ___하는 곳이다.", "조절", "인체", "upper"],

  // ── 날씨와 기후 (upper, 5-6학년) ──
  ["일기예보에서 기온, 풍속, ___을 알려준다.", "강수량", "날씨", "upper"],
  [
    "우리나라는 봄, 여름, 가을, 겨울의 ___이 뚜렷하다.",
    "사계절",
    "날씨",
    "upper",
  ],
  ["열대 지방은 일 년 내내 ___하다.", "더운", "날씨", "upper"],
  ["극지방은 일 년 내내 ___하다.", "추운", "날씨", "upper"],
  ["비구름은 주로 ___색이다.", "어두운 회", "날씨", "upper"],

  // ── 생태계 (upper, 5-6학년) ──
  ["풀→메뚜기→개구리→뱀→매는 ___의 예이다.", "먹이사슬", "환경", "upper"],
  ["생태계에서 풀과 나무는 ___자이다.", "생산", "환경", "upper"],
  ["생태계에서 토끼와 사슴은 ___자이다.", "소비", "환경", "upper"],
  ["생태계에서 곰팡이와 세균은 ___자이다.", "분해", "환경", "upper"],
  ["외래종이 들어오면 생태계의 ___이 깨질 수 있다.", "균형", "환경", "upper"],
  ["갯벌은 많은 생물이 사는 ___다.", "서식지", "환경", "upper"],
  [
    "습지를 보호해야 하는 이유는 많은 ___이 살기 때문이다.",
    "생물",
    "환경",
    "upper",
  ],

  // ── 물의 순환 (upper, 5-6학년) ──
  ["바다의 물이 증발하여 ___가 된다.", "수증기", "지구", "upper"],
  ["수증기가 하늘에서 물방울이 되어 ___이 된다.", "구름", "지구", "upper"],
  ["구름에서 비나 눈이 내려 다시 땅과 ___로 돌아온다.", "바다", "지구", "upper"],
  ["비가 땅에 스며들어 ___가 된다.", "지하수", "지구", "upper"],
  [
    "물의 순환에서 물은 바다→수증기→구름→비→___로 돌아간다.",
    "바다",
    "지구",
    "upper",
  ],

  // ── 지구와 달 (upper, 5-6학년) ──
  ["달의 모양이 변하는 것을 달의 ___라 한다.", "위상 변화", "우주", "upper"],
  ["초승달은 오른쪽이 ___은 달이다.", "밝", "우주", "upper"],
  ["보름달은 달이 ___둥글게 보이는 것이다.", "완전히", "우주", "upper"],
  ["그믐달은 달이 거의 보이지 ___은 때이다.", "않", "우주", "upper"],
  ["달에는 ___가 없어서 바람이 불지 않는다.", "공기", "우주", "upper"],

  // ── 추가 lower 과학 ──
  ["개구리는 겨울에 ___을 한다.", "겨울잠", "생물", "lower"],
  ["다람쥐는 가을에 ___를 모아둔다.", "도토리", "생물", "lower"],
  [
    "북극곰의 털이 하얀 이유는 눈 속에서 ___기 위해서이다.",
    "숨",
    "생물",
    "lower",
  ],
  ["선인장은 ___이 적은 사막에서 산다.", "물", "생물", "lower"],
  ["무궁화는 우리나라의 ___다.", "국화", "생물", "lower"],
  ["진달래꽃은 ___에 핀다.", "봄", "생물", "lower"],
  ["단풍나무 잎은 가을에 ___색으로 변한다.", "빨간", "생물", "lower"],
  ["은행나무 잎은 가을에 ___색으로 변한다.", "노란", "생물", "lower"],
  ["민들레 홀씨는 ___에 날려 퍼진다.", "바람", "생물", "lower"],
  ["나팔꽃은 아침에 ___다.", "핀", "생물", "lower"],
  ["수련은 ___위에서 꽃이 핀다.", "물", "생물", "lower"],
  ["밤나무의 열매인 밤은 ___껍질에 쌓여 있다.", "가시", "생물", "lower"],
  ["옥수수는 쌀, 밀과 같은 ___이다.", "곡식", "생물", "lower"],
  ["콩나물은 ___에서 기른다.", "어두운 곳", "생물", "lower"],

  // ── 추가 upper 과학 ──
  ["식물이 밤에 하는 작용은 ___이다.", "호흡", "생물", "upper"],
  ["식물도 사람처럼 ___을 쉰다.", "숨", "생물", "upper"],
  ["광합성에 필요한 것은 물, 이산화탄소, ___이다.", "빛", "생물", "upper"],
  ["녹말 검출 실험에 사용하는 약품은 ___이다.", "아이오딘", "생물", "upper"],
  ["물에 뜨는 물체는 물보다 ___가 작다.", "밀도", "물리", "upper"],
  ["물에 가라앉는 물체는 물보다 ___가 크다.", "밀도", "물리", "upper"],
  ["공기의 무게를 측정하면 공기도 ___가 있다.", "무게", "물리", "upper"],
  ["진자의 길이가 길면 왕복 시간이 ___진다.", "길어", "물리", "upper"],
  ["진자의 길이가 짧으면 왕복 시간이 ___진다.", "짧아", "물리", "upper"],
  ["지구 표면의 약 ___퍼센트가 물로 덮여 있다.", "70", "지구", "upper"],
  ["지구 표면의 약 ___퍼센트가 육지이다.", "30", "지구", "upper"],
  ["화산 폭발로 만들어진 섬에는 ___도가 있다.", "제주", "지구", "upper"],
  ["제주도의 돌은 구멍이 많은 ___암이다.", "현무", "지구", "upper"],

  // ── 추가 과학 (lower) - 자석/빛/소리/물/동물 ──
  ["자석을 반으로 잘라도 ___극과 S극이 생긴다.", "N", "물질", "lower"],
  [
    "전자석의 세기를 강하게 하려면 전선을 더 많이 ___면 된다.",
    "감",
    "전기",
    "upper",
  ],
  ["나뭇잎이 떨어지는 것도 ___때문이다.", "중력", "물리", "lower"],
  ["풍선에 바람을 넣으면 ___가 커진다.", "부피", "물리", "lower"],
  ["풍선을 누르면 다른 쪽이 ___어난다.", "튀", "물리", "lower"],
  [
    "빨대로 음료를 마실 수 있는 것은 ___의 차이 때문이다.",
    "기압",
    "물리",
    "upper",
  ],
  ["비눗방울이 둥근 것은 ___장력 때문이다.", "표면", "물리", "upper"],
  ["종이비행기를 세게 던지면 더 ___리 날아간다.", "멀", "물리", "lower"],
  [
    "바닥이 미끄러우면 걷기가 힘든 것은 ___이 적기 때문이다.",
    "마찰력",
    "물리",
    "lower",
  ],
  ["따뜻한 물과 찬물을 섞으면 ___한 물이 된다.", "미지근", "화학", "lower"],
  ["소금물이 민물보다 물체가 잘 ___다.", "뜬", "화학", "upper"],
  ["달걀을 식초에 넣으면 껍데기가 ___진다.", "녹아없어", "화학", "lower"],
  [
    "사이다 뚜껑을 열면 거품이 나는 것은 ___때문이다.",
    "이산화탄소",
    "화학",
    "lower",
  ],
  ["모기는 사람의 ___를 빨아 먹는다.", "피", "생물", "lower"],
  ["두더지는 ___에서 생활한다.", "땅속", "생물", "lower"],
  ["비둘기는 도시에서 볼 수 있는 ___다.", "새", "생물", "lower"],
  [
    "참새의 몸 크기가 작은 이유 중 하나는 뼈가 ___기 때문이다.",
    "가볍",
    "생물",
    "lower",
  ],
  [
    "나무의 나이를 알려면 줄기 단면의 ___를 세면 된다.",
    "나이테",
    "생물",
    "lower",
  ],
  ["씨앗이 싹트려면 물, 공기, 적당한 ___가 필요하다.", "온도", "생물", "lower"],
  ["완두콩 줄기는 다른 물체를 ___고 올라간다.", "감", "생물", "lower"],
  ["제비꽃은 스스로 씨앗을 ___는 방법으로 퍼진다.", "튕기", "생물", "lower"],
  [
    "붕어빵 모양처럼 부모와 자식이 닮는 것을 ___이라(라) 한다.",
    "유전",
    "생물",
    "upper",
  ],
  [
    "봄에 개나리와 진달래가 ___에 피는 이유는 온도 때문이다.",
    "먼저",
    "생물",
    "lower",
  ],
  ["낙엽이 썩으면 ___이 되어 식물에게 양분을 준다.", "거름", "생물", "lower"],
  ["강물이 바위를 깎는 것은 ___의 힘 때문이다.", "물", "지구", "lower"],
  ["빙하는 오랜 시간 눈이 쌓여 ___이 된 것이다.", "얼음", "지구", "upper"],
  [
    "조개가 모래 속에 사는 것은 ___을 피하기 위해서이다.",
    "천적",
    "생물",
    "lower",
  ],
  [
    "제비는 봄에 우리나라에 와서 여름을 보내는 ___새이다.",
    "여름철",
    "생물",
    "lower",
  ],
  ["두루미는 겨울에 우리나라에 오는 ___새이다.", "겨울철", "생물", "lower"],
  ["뻐꾸기는 다른 새의 ___에 알을 낳는다.", "둥지", "생물", "lower"],
  ["식물의 줄기 속에서 물은 위로 ___간다.", "올라", "생물", "upper"],
  ["밤에 꽃이 피는 식물로 ___이 있다.", "달맞이꽃", "생물", "lower"],
  ["지구의 바다에서 가장 깊은 곳은 ___해구이다.", "마리아나", "지구", "upper"],
  [
    "대리석은 석회암이 열과 압력을 받아 변한 ___암이다.",
    "변성",
    "지구",
    "upper",
  ],
  ["모래가 오래 쌓여 단단하게 굳으면 ___암이 된다.", "사", "지구", "upper"],
  ["자갈이 쌓여 굳은 암석을 ___암이라 한다.", "역", "지구", "upper"],
  ["지구의 바다와 육지의 비율은 약 ___대 3이다.", "7", "지구", "upper"],
  [
    "구름이 없는 맑은 밤에 보이는 별의 띠를 ___라 한다.",
    "은하수",
    "우주",
    "lower",
  ],
  ["봄철 대표 별자리는 ___자리이다.", "사자", "우주", "upper"],
  ["여름철 대표 별자리는 ___자리이다.", "전갈", "우주", "upper"],
  ["겨울철 대표 별자리는 ___자리이다.", "오리온", "우주", "upper"],
  [
    "달의 앞면만 보이는 이유는 달의 자전과 공전 주기가 ___기 때문이다.",
    "같",
    "우주",
    "upper",
  ],
  ["우리나라 최초의 인공위성은 ___호이다.", "우리별 1", "우주", "upper"],
  [
    "물이 증발하여 하늘로 올라가 구름이 되고 다시 비로 내리는 것을 물의 ___이라(라) 한다.",
    "순환",
    "지구",
    "upper",
  ],

  // ══════════════════════════════════════════════════════════════
  // ── EXPANDED SCIENCE ITEMS (힘과 운동, 물의 순환, 지구와 달, 식물의 생장, 전기와 자석, 빛과 그림자, 소리, 열전달)
  // ══════════════════════════════════════════════════════════════

  // ── 힘과 운동 추가 (15) ──
  ["자전거 페달을 밟으면 바퀴에 ___이 전달된다.", "힘", "물리", "lower"],
  ["축구공을 세게 차면 더 ___리 날아간다.", "멀", "물리", "lower"],
  ["고무공을 땅에 던지면 ___아 오른다.", "튀", "물리", "lower"],
  ["무거운 상자를 밀려면 큰 ___이 필요하다.", "힘", "물리", "lower"],
  [
    "스케이트를 타면 미끄러지는 것은 마찰력이 ___기 때문이다.",
    "작",
    "물리",
    "lower",
  ],
  [
    "놀이터 시소에서 한쪽이 무거우면 그쪽이 ___로 내려간다.",
    "아래",
    "물리",
    "lower",
  ],
  [
    "용수철을 당기면 원래 길이로 돌아가려는 ___이 생긴다.",
    "복원력",
    "물리",
    "upper",
  ],
  ["가속도는 힘의 크기에 비례하고 ___에 반비례한다.", "질량", "물리", "upper"],
  ["마찰력은 접촉면이 거칠수록 ___진다.", "커", "물리", "upper"],
  [
    "자유 낙하하는 물체의 빠르기는 시간이 지날수록 ___진다.",
    "빨라",
    "물리",
    "upper",
  ],
  [
    "공기 저항이 없으면 모든 물체는 같은 빠르기로 ___한다.",
    "낙하",
    "물리",
    "upper",
  ],
  [
    "원심력은 원운동하는 물체가 바깥으로 ___려는 힘이다.",
    "밀",
    "물리",
    "upper",
  ],
  [
    "에스컬레이터가 올라갈 때 가만히 서 있어도 올라가는 것은 ___때문이다.",
    "기계의 힘",
    "물리",
    "lower",
  ],
  ["자동차가 갑자기 멈추면 몸이 ___으로 쏠린다.", "앞", "물리", "lower"],
  ["회전목마를 타면 바깥쪽으로 ___리는 느낌이 든다.", "밀", "물리", "lower"],

  // ── 물의 순환 추가 (15) ──
  ["강물은 높은 곳에서 ___곳으로 흐른다.", "낮은", "지구", "lower"],
  ["비가 땅속으로 스며드는 것을 ___라 한다.", "침투", "지구", "upper"],
  ["지하수가 솟아나는 곳을 ___이라(라) 한다.", "샘", "지구", "lower"],
  ["호수의 물이 증발하면 ___가 된다.", "수증기", "지구", "lower"],
  ["구름에서 물방울이 커지면 ___가 되어 내린다.", "비", "지구", "lower"],
  ["높은 산에서는 구름 속을 ___할 수 있다.", "걸을", "지구", "lower"],
  [
    "겨울에 논에 물을 가두는 것은 봄에 ___를 하기 위해서이다.",
    "농사",
    "지구",
    "lower",
  ],
  ["바닷물이 증발할 때 ___은 남고 물만 올라간다.", "소금", "지구", "lower"],
  ["폭포는 높은 곳에서 물이 ___지는 곳이다.", "떨어", "지구", "lower"],
  ["빙하가 녹으면 해수면이 ___아진다.", "높", "지구", "upper"],
  ["물은 고체, 액체, 기체로 ___가 변한다.", "상태", "지구", "lower"],
  ["물의 순환은 태양 ___에 의해 일어난다.", "에너지", "지구", "upper"],
  ["습한 공기가 산을 타고 올라가면 ___가 내린다.", "비", "지구", "upper"],
  ["건조한 지역에서는 물의 ___이 느리다.", "순환", "지구", "upper"],
  ["우리가 마시는 물도 물의 ___의 일부이다.", "순환", "지구", "lower"],

  // ── 지구와 달 추가 (15) ──
  ["달은 지구 주위를 약 ___일에 한 바퀴 돈다.", "27", "우주", "upper"],
  ["지구에서 보면 달은 항상 같은 ___만 보인다.", "면", "우주", "upper"],
  ["달의 표면에는 많은 ___가 있다.", "크레이터", "우주", "upper"],
  ["달에는 물이 ___다.", "없", "우주", "lower"],
  ["달의 중력은 지구의 약 ___분의 1이다.", "6", "우주", "upper"],
  ["만조와 간조는 달의 ___때문에 생긴다.", "인력", "우주", "upper"],
  ["상현달은 오른쪽 ___이 밝은 달이다.", "반", "우주", "upper"],
  ["하현달은 왼쪽 ___이 밝은 달이다.", "반", "우주", "upper"],
  ["개기일식 때 달이 태양을 완전히 ___한다.", "가림", "우주", "upper"],
  [
    "달에 발자국이 남는 이유는 ___와 바람이 없기 때문이다.",
    "공기",
    "우주",
    "lower",
  ],
  ["달 탐사 우주선 이름은 아폴로 ___호이다.", "11", "우주", "upper"],
  ["달에서는 소리가 전달되지 ___는다.", "않", "우주", "upper"],
  ["지구에서 달까지 빛이 도달하는 데 약 ___초 걸린다.", "1.3", "우주", "upper"],
  ["음력은 달의 ___를 기준으로 만든 달력이다.", "모양 변화", "우주", "lower"],
  ["보름달이 뜨는 날은 음력 ___일이다.", "15", "우주", "lower"],

  // ── 식물의 생장 추가 (15) ──
  ["씨앗이 싹트는 것을 ___라 한다.", "발아", "생물", "lower"],
  ["식물이 자라려면 물, 빛, ___이 필요하다.", "양분", "생물", "lower"],
  ["식물의 줄기가 굵어지는 것을 ___성장이라 한다.", "비대", "생물", "upper"],
  ["씨앗 속에는 처음 자랄 때 필요한 ___이 들어 있다.", "양분", "생물", "lower"],
  ["햇빛을 많이 받으면 식물이 더 ___자란다.", "잘", "생물", "lower"],
  ["물을 너무 많이 주면 식물의 ___가 썩을 수 있다.", "뿌리", "생물", "lower"],
  ["비료를 주면 식물이 더 ___게 자란다.", "빠르", "생물", "lower"],
  ["화분의 흙이 마르면 식물이 ___든다.", "시", "생물", "lower"],
  ["식물은 밤에도 ___을 한다.", "호흡", "생물", "upper"],
  ["나이테가 넓은 쪽은 ___이 많이 닿는 쪽이다.", "빛", "생물", "upper"],
  [
    "식물 호르몬 중 빛 쪽으로 자라게 하는 것을 ___이라(라) 한다.",
    "옥신",
    "생물",
    "upper",
  ],
  [
    "꺾꽂이는 줄기를 잘라 ___시키는 번식 방법이다.",
    "뿌리를 내리게",
    "생물",
    "upper",
  ],
  ["접붙이기는 두 식물의 ___를 붙이는 방법이다.", "줄기", "생물", "upper"],
  ["잎이 넓은 식물은 빛을 더 많이 ___할 수 있다.", "흡수", "생물", "upper"],
  ["겨울에 잎을 떨어뜨리는 나무를 ___수라 한다.", "낙엽", "생물", "lower"],

  // ── 전기와 자석 추가 (15) ──
  [
    "전자석의 세기를 강하게 하려면 전류를 더 ___게 한다.",
    "세",
    "전기",
    "upper",
  ],
  ["전자석은 전류를 끄면 자석의 성질이 ___진다.", "사라", "전기", "upper"],
  [
    "건전지의 +극과 -극을 전선으로 연결하면 ___가 흐른다.",
    "전류",
    "전기",
    "upper",
  ],
  [
    "전구의 필라멘트가 끊어지면 전기가 ___되지 않는다.",
    "통하지",
    "전기",
    "upper",
  ],
  ["구리, 알루미늄, 철은 전기가 잘 통하는 ___체이다.", "도", "전기", "upper"],
  [
    "고무, 나무, 플라스틱은 전기가 통하지 않는 ___체이다.",
    "부도",
    "전기",
    "upper",
  ],
  ["전자석 크레인은 고철을 ___어 옮긴다.", "들", "전기", "upper"],
  ["스피커는 전자석의 ___을 이용하여 소리를 낸다.", "진동", "전기", "upper"],
  ["모터는 전기 에너지를 ___에너지로 바꾼다.", "운동", "전기", "upper"],
  ["자석 주위에 철가루를 뿌리면 ___이 보인다.", "자기력선", "전기", "upper"],
  [
    "나침반 바늘이 움직이는 것은 지구의 ___때문이다.",
    "자기장",
    "전기",
    "upper",
  ],
  ["풍력 발전기는 바람으로 ___를 돌려 전기를 만든다.", "날개", "전기", "upper"],
  ["태양전지는 ___에너지를 전기 에너지로 바꾼다.", "빛", "전기", "upper"],
  ["정전기는 물체를 문지를 때 ___가 이동하여 생긴다.", "전자", "전기", "upper"],
  ["번개는 구름과 땅 사이에 ___가 흐르는 것이다.", "전기", "전기", "lower"],

  // ── 빛과 그림자 추가 (15) ──
  [
    "투명한 물체는 빛이 ___하여 그림자가 생기지 않는다.",
    "통과",
    "빛과소리",
    "lower",
  ],
  ["반투명한 물체는 빛이 일부만 ___한다.", "통과", "빛과소리", "lower"],
  ["불투명한 물체는 빛이 통과하지 ___한다.", "못", "빛과소리", "lower"],
  ["손전등을 기울이면 그림자의 ___이 달라진다.", "방향", "빛과소리", "lower"],
  [
    "해시계는 빛의 ___을 이용하여 시간을 측정한다.",
    "직진",
    "빛과소리",
    "lower",
  ],
  ["만화경은 거울의 ___를 이용한 장난감이다.", "반사", "빛과소리", "lower"],
  [
    "잠수부가 물속을 볼 때 물체가 실제 위치와 다르게 보이는 것은 빛의 ___때문이다.",
    "굴절",
    "빛과소리",
    "upper",
  ],
  [
    "광섬유는 빛의 ___를 이용하여 정보를 전달한다.",
    "전반사",
    "빛과소리",
    "upper",
  ],
  [
    "눈에 들어오는 빛의 양을 조절하는 부분을 ___라 한다.",
    "홍채",
    "빛과소리",
    "upper",
  ],
  ["카메라의 렌즈는 빛을 ___는 역할을 한다.", "모으", "빛과소리", "upper"],
  ["빛의 세 가지 성질은 직진, 반사, ___이다.", "굴절", "빛과소리", "upper"],
  ["낮에 밖이 밝은 이유는 태양 ___때문이다.", "빛", "빛과소리", "lower"],
  ["그림자 인형극은 빛의 ___성질을 이용한다.", "직진", "빛과소리", "lower"],
  ["색유리를 통해 보면 세상이 그 ___으로 보인다.", "색", "빛과소리", "lower"],
  [
    "거울 두 개를 마주 보게 하면 자신의 모습이 무한히 ___된다.",
    "반복",
    "빛과소리",
    "lower",
  ],

  // ── 소리 추가 (15) ──
  [
    "소리는 공기뿐 아니라 ___와 액체에서도 전달된다.",
    "고체",
    "빛과소리",
    "upper",
  ],
  ["소리의 빠르기는 공기 중에서 약 초속 ___m이다.", "340", "빛과소리", "upper"],
  [
    "물속에서 소리가 공기 중보다 ___빠르게 전달된다.",
    "더",
    "빛과소리",
    "upper",
  ],
  ["북의 가죽을 팽팽하게 하면 소리가 ___아진다.", "높", "빛과소리", "lower"],
  [
    "리코더에서 구멍을 많이 막으면 소리가 ___아진다.",
    "낮",
    "빛과소리",
    "lower",
  ],
  ["트럼펫은 입술의 ___으로 소리를 만든다.", "진동", "빛과소리", "lower"],
  ["방음벽은 소리가 ___되는 것을 막아준다.", "전달", "빛과소리", "upper"],
  ["초음파는 사람이 들을 수 없는 ___소리이다.", "높은", "빛과소리", "upper"],
  ["박쥐는 ___를 이용하여 먹이를 찾는다.", "초음파", "빛과소리", "upper"],
  ["소리의 세기 단위는 ___이다.", "데시벨", "빛과소리", "upper"],
  ["큰 소리를 오래 들으면 ___이 손상될 수 있다.", "청력", "빛과소리", "upper"],
  [
    "실전화기에서 실을 팽팽하게 하면 소리가 더 ___전달된다.",
    "잘",
    "빛과소리",
    "lower",
  ],
  [
    "드럼을 치면 드럼 위의 쌀알이 ___는 것을 볼 수 있다.",
    "튀",
    "빛과소리",
    "lower",
  ],
  ["기타 줄을 짧게 잡으면 소리가 ___아진다.", "높", "빛과소리", "lower"],
  ["종을 치면 종이 ___하여 소리가 난다.", "진동", "빛과소리", "lower"],

  // ── 열전달 추가 (15) ──
  [
    "열은 전도, 대류, ___의 세 가지 방법으로 전달된다.",
    "복사",
    "물리",
    "upper",
  ],
  [
    "금속 숟가락이 뜨거운 국에 닿으면 숟가락도 ___해진다.",
    "뜨거워",
    "물리",
    "lower",
  ],
  ["열이 고체를 통해 전달되는 것을 ___라 한다.", "전도", "물리", "upper"],
  [
    "뜨거운 물이 위로 올라가고 찬 물이 아래로 가는 것을 ___라 한다.",
    "대류",
    "물리",
    "upper",
  ],
  [
    "태양의 열이 지구에 전달되는 것은 ___에 의한 것이다.",
    "복사",
    "물리",
    "upper",
  ],
  ["보온병은 열의 ___을 막아 온도를 유지한다.", "전달", "물리", "upper"],
  [
    "겨울에 두꺼운 옷을 입는 것은 체온이 ___지 않게 하기 위해서이다.",
    "빠져나가",
    "물리",
    "lower",
  ],
  [
    "프라이팬의 손잡이가 나무인 이유는 열이 ___전달되지 않기 때문이다.",
    "잘",
    "물리",
    "lower",
  ],
  [
    "이불을 덮으면 따뜻한 이유는 체온이 밖으로 ___지 않기 때문이다.",
    "나가",
    "물리",
    "lower",
  ],
  ["난로 앞이 따뜻한 것은 열의 ___때문이다.", "복사", "물리", "upper"],
  ["라면 냄비의 물이 위아래로 도는 것은 ___때문이다.", "대류", "물리", "upper"],
  [
    "여름에 아스팔트가 뜨거운 것은 태양 빛을 ___하기 때문이다.",
    "흡수",
    "물리",
    "lower",
  ],
  ["흰색 옷이 시원한 이유는 빛을 ___하기 때문이다.", "반사", "물리", "lower"],
  ["검은색 옷이 더운 이유는 빛을 ___하기 때문이다.", "흡수", "물리", "lower"],
  [
    "에어컨의 찬 바람이 아래로 내려오는 것은 차가운 공기가 ___기 때문이다.",
    "무겁",
    "물리",
    "upper",
  ],

  // ── 환경/생태 추가 (15) ──
  [
    "황소개구리처럼 외국에서 들어온 생물을 ___종이라 한다.",
    "외래",
    "환경",
    "upper",
  ],
  ["생태계에서 개체 수가 가장 많은 것은 ___자이다.", "생산", "환경", "upper"],
  [
    "먹이 피라미드에서 꼭대기에 있는 동물을 ___포식자라 한다.",
    "최상위",
    "환경",
    "upper",
  ],
  ["갯벌에 사는 생물로 게, 조개, ___가 있다.", "갯지렁이", "환경", "lower"],
  ["연못 생태계에서 수초는 ___자 역할을 한다.", "생산", "환경", "upper"],
  ["도시 생태계에서 비둘기와 쥐는 ___자이다.", "소비", "환경", "upper"],
  ["숲에서 낙엽을 분해하는 것은 곰팡이와 ___이다.", "세균", "환경", "upper"],
  ["동물원은 멸종 위기 동물을 ___하는 역할을 한다.", "보호", "환경", "lower"],
  ["국립공원에서는 동식물을 함부로 ___할 수 없다.", "채집", "환경", "lower"],
  [
    "생태 통로는 도로 때문에 끊긴 동물의 ___를 연결한다.",
    "이동로",
    "환경",
    "upper",
  ],
  ["친환경 농법은 농약을 적게 사용하는 ___방법이다.", "농사", "환경", "lower"],
  ["유기농 식품은 화학 비료 없이 ___한 식품이다.", "재배", "환경", "upper"],
  ["미세 플라스틱은 바다 생물에게 ___를 준다.", "피해", "환경", "upper"],
  [
    "탄소 중립은 배출하는 탄소와 흡수하는 탄소를 ___하게 만드는 것이다.",
    "같",
    "환경",
    "upper",
  ],
  ["분리수거를 하면 쓰레기를 ___할 수 있다.", "재활용", "환경", "lower"],

  // ── 인체 추가 (15) ──
  ["음식물이 입→식도→위→소장→___의 순서로 이동한다.", "대장", "인체", "upper"],
  ["위에서 나오는 소화액을 ___이라(라) 한다.", "위액", "인체", "upper"],
  ["적혈구는 ___를 운반하는 역할을 한다.", "산소", "인체", "upper"],
  ["백혈구는 몸에 들어온 ___을 막는 역할을 한다.", "세균", "인체", "upper"],
  [
    "혈소판은 상처가 났을 때 피를 ___게 하는 역할을 한다.",
    "멈추",
    "인체",
    "upper",
  ],
  ["허파꽈리에서 산소와 ___가 교환된다.", "이산화탄소", "인체", "upper"],
  ["대장에서는 주로 ___을 흡수한다.", "수분", "인체", "upper"],
  ["콩팥에서 걸러진 노폐물은 ___이 된다.", "소변", "인체", "upper"],
  ["우리 몸에서 가장 큰 장기는 ___이다.", "간", "인체", "upper"],
  ["간은 해로운 물질을 ___하는 역할을 한다.", "해독", "인체", "upper"],
  ["우리 몸의 뼈는 약 ___개이다.", "206", "인체", "upper"],
  ["심장은 하루에 약 ___번 뛴다.", "10만", "인체", "upper"],
  ["혀에 있는 맛을 느끼는 부분을 ___라 한다.", "미뢰", "인체", "upper"],
  ["사람의 치아 수는 영구치 기준 ___개이다.", "32", "인체", "upper"],
  ["눈의 수정체는 빛을 ___는 역할을 한다.", "모으", "인체", "upper"],

  // ══════════════════════════════════════════════════════════════
  // ── DOUBLED CONTENT: NEW SCIENCE ITEMS (300+) ──────────────────
  // ── 새로운 문제 유형: 실험결과예측, 과정순서, 분류하기, 인과관계 포함
  // ══════════════════════════════════════════════════════════════

  // ── 물리 - 실험결과예측 ──
  ["풍선을 문지른 후 벽에 대면 풍선이 ___에 붙는다.", "벽", "물리", "lower"],
  ["얼음 위에 소금을 뿌리면 얼음이 더 ___게 녹는다.", "빨리", "물리", "lower"],
  [
    "빨간색 셀로판지와 파란색 셀로판지를 겹치면 ___색으로 보인다.",
    "보라",
    "물리",
    "upper",
  ],
  [
    "진공 용기 안에서 초인종을 울리면 소리가 ___다.",
    "안 들린",
    "물리",
    "upper",
  ],
  ["물이 담긴 컵에 연필을 넣으면 연필이 ___보인다.", "꺾여", "물리", "lower"],
  [
    "자석에 클립을 붙이면 클립도 다른 클립을 ___당긴다.",
    "끌어",
    "물리",
    "lower",
  ],
  [
    "뜨거운 물에 찬 숟가락을 넣으면 숟가락이 ___해진다.",
    "뜨거워",
    "물리",
    "lower",
  ],
  ["풍선에 바늘을 꽂으면 풍선이 ___진다.", "터", "물리", "lower"],
  ["진자의 추를 무겁게 바꿔도 왕복 시간은 ___하다.", "같", "물리", "upper"],
  [
    "나무 막대와 쇠 막대를 동시에 물에 넣으면 나무는 ___다.",
    "뜬",
    "물리",
    "lower",
  ],
  [
    "구슬을 높은 곳에서 떨어뜨리면 낮은 곳보다 더 ___이 튄다.",
    "높",
    "물리",
    "lower",
  ],
  [
    "물속에서 손뼉을 치면 공기 중보다 소리가 더 ___전달된다.",
    "빨리",
    "물리",
    "upper",
  ],

  // ── 물리 - 과정순서 ──
  [
    "소리가 전달되는 순서: 진동→공기의 ___→고막의 진동→소리 인식",
    "떨림",
    "물리",
    "lower",
  ],
  ["전기가 흐르는 순서: 전지→전선→___→전선→전지", "전구", "물리", "upper"],
  [
    "빛이 눈에 도달하는 순서: 빛 발생→물체에 반사→___→뇌에서 인식",
    "눈",
    "물리",
    "lower",
  ],

  // ── 물리 - 분류하기 ──
  [
    "쇠, 구리, 알루미늄은 모두 열을 잘 전달하는 ___체이다.",
    "도",
    "물리",
    "upper",
  ],
  [
    "나무, 유리, 플라스틱은 열을 잘 전달하지 ___은 물질이다.",
    "않",
    "물리",
    "upper",
  ],
  [
    "지레, 도르래, 빗면은 모두 ___를 이용한 도구이다.",
    "힘의 원리",
    "물리",
    "upper",
  ],

  // ── 물리 - 인과관계 ──
  ["여름에 레일이 휘는 이유는 열에 의한 ___때문이다.", "팽창", "물리", "upper"],
  [
    "겨울에 유리창에 물방울이 맺히는 이유는 수증기의 ___때문이다.",
    "응결",
    "물리",
    "lower",
  ],
  [
    "높은 산에서 밥이 설익는 이유는 기압이 ___기 때문이다.",
    "낮",
    "물리",
    "upper",
  ],
  [
    "우주에서 깃털과 쇠구슬이 동시에 떨어지는 이유는 공기 ___이 없기 때문이다.",
    "저항",
    "물리",
    "upper",
  ],
  [
    "잠수부가 깊이 들어가면 귀가 아픈 이유는 수압이 ___기 때문이다.",
    "높아지",
    "물리",
    "upper",
  ],

  // ── 화학 - 실험결과예측 ──
  ["식초에 달걀 껍데기를 넣으면 ___가 발생한다.", "거품",
    "화학",
    "lower",
  ],
  ["우유에 식용 색소와 세제를 넣으면 색이 ___다.", "퍼진", "화학", "lower"],
  ["소금물에 달걀을 넣으면 달걀이 ___다.", "뜬", "화학", "lower"],
  ["아이오딘 용액을 감자에 떨어뜨리면 ___색으로 변한다.", "청람",
    "화학",
    "upper",
  ],
  ["BTB 용액에 입김을 불면 ___색으로 변한다.", "노란", "화학", "upper"],
  [
    "페놀프탈레인 용액에 염기성 물질을 넣으면 ___색이 된다.",
    "붉은",
    "화학",
    "upper",
  ],
  ["과산화수소에 이산화망간을 넣으면 ___가 발생한다.", "산소", "화학", "upper"],
  ["석회수에 이산화탄소를 불어넣으면 석회수가 ___ 흐려진다.", "뿌옇게",
    "화학",
    "upper",
  ],

  // ── 화학 - 과정순서 ──
  [
    "양초가 타는 과정: 심지에 불→고체 양초 ___→기체가 됨→연소",
    "녹음",
    "화학",
    "lower",
  ],
  [
    "용해 과정: 용질 투입→용매와 접촉→용질이 ___→용액이 됨",
    "녹음",
    "화학",
    "upper",
  ],
  [
    "증류 과정: 혼합물 가열→기체로 변함→냉각→___로 모음",
    "액체",
    "화학",
    "upper",
  ],

  // ── 화학 - 분류하기 ──
  ["식초, 레몬즙, 탄산수는 모두 ___성 물질이다.", "산", "화학", "upper"],
  ["비누, 표백제, 베이킹소다는 모두 ___성 물질이다.", "염기", "화학", "upper"],
  ["물, 공기, 소금물은 모두 ___에 해당한다.", "혼합물", "화학", "upper"],

  // ── 화학 - 인과관계 ──
  [
    "겨울에 도로에 염화칼슘을 뿌리는 이유는 얼음의 어는점을 ___기 위해서이다.",
    "낮추",
    "화학",
    "upper",
  ],
  [
    "빵이 부풀어 오르는 이유는 이스트가 ___를 내기 때문이다.",
    "이산화탄소",
    "화학",
    "upper",
  ],
  [
    "사과를 자른 후 갈변하는 이유는 공기 중 ___와 반응하기 때문이다.",
    "산소",
    "화학",
    "upper",
  ],

  // ── 생물 - 실험결과예측 ──
  ["콩나물을 어두운 곳에서 기르면 줄기가 ___고 노랗다.", "길", "생물", "lower"],
  ["식물을 빛이 없는 곳에 두면 잎이 ___게 변한다.", "노랗", "생물", "lower"],
  ["식물에 물을 주지 않으면 잎이 ___들어 시든다.", "축", "생물", "lower"],
  [
    "식물의 줄기를 빨간 색소 물에 넣으면 잎맥이 ___게 변한다.",
    "빨갛",
    "생물",
    "lower",
  ],
  ["아이오딘 용액을 광합성한 잎에 떨어뜨리면 ___색으로 변한다.", "청람",
    "생물",
    "upper",
  ],
  [
    "잎의 일부를 호일로 싸고 며칠 후 녹말 검사를 하면 싼 부분은 변하지 ___다.",
    "않는",
    "생물",
    "upper",
  ],

  // ── 생물 - 과정순서 ──
  ["소화 과정 순서: 입→식도→위→___→대장→항문", "소장", "생물", "upper"],
  ["혈액순환 순서: 심장→동맥→모세혈관→___→심장", "정맥", "생물", "upper"],
  ["호흡 과정: 코→기관→기관지→___→산소 교환", "폐", "생물", "upper"],
  ["식물의 한살이 순서: 씨앗→발아→___→꽃→열매→씨앗", "생장", "생물", "lower"],
  ["잠자리의 한살이: 알→___→성충 (불완전 탈바꿈)", "약충", "생물", "lower"],

  // ── 생물 - 분류하기 ──
  ["소, 고래, 박쥐는 모두 ___류에 속한다.", "포유", "생물", "lower"],
  ["독수리, 참새, 펭귄은 모두 ___류에 속한다.", "조", "생물", "lower"],
  ["도마뱀, 거북, 악어는 모두 ___류에 속한다.", "파충", "생물", "lower"],
  ["개구리, 도롱뇽은 모두 ___류에 속한다.", "양서", "생물", "lower"],
  ["장미, 사과나무, 벚나무는 모두 ___잎식물이다.", "쌍떡", "생물", "upper"],
  ["벼, 보리, 옥수수는 모두 ___잎식물이다.", "외떡", "생물", "upper"],
  ["고사리, 이끼는 ___로 번식하는 식물이다.", "포자", "생물", "upper"],

  // ── 생물 - 인과관계 ──
  [
    "겨울에 나무가 잎을 떨어뜨리는 이유는 수분 ___을 줄이기 위해서이다.",
    "손실",
    "생물",
    "upper",
  ],
  [
    "밤에 식물이 이산화탄소를 내놓는 이유는 ___을 하기 때문이다.",
    "호흡",
    "생물",
    "upper",
  ],
  [
    "사막 식물의 잎이 가시인 이유는 ___을 줄이기 위해서이다.",
    "증산",
    "생물",
    "upper",
  ],
  [
    "북극곰의 털이 속이 빈 이유는 ___을 유지하기 위해서이다.",
    "체온",
    "생물",
    "upper",
  ],
  [
    "철새가 이동하는 이유는 먹이와 ___을 찾기 위해서이다.",
    "따뜻한 환경",
    "생물",
    "lower",
  ],

  // ── 지구과학 - 실험결과예측 ──
  [
    "화산 모형에 식초와 베이킹소다를 넣으면 ___이 넘쳐 흐른다.",
    "거품",
    "지구",
    "lower",
  ],
  [
    "모래와 자갈을 물에 넣고 흔들면 무거운 것이 ___에 가라앉는다.",
    "아래",
    "지구",
    "lower",
  ],
  ["흙더미에 물을 부으면 흙이 ___내려간다.", "씻겨", "지구", "lower"],

  // ── 지구과학 - 과정순서 ──
  [
    "퇴적암이 만들어지는 순서: 퇴적물 쌓임→압력→___→퇴적암",
    "굳어짐",
    "지구",
    "upper",
  ],
  [
    "화석이 만들어지는 순서: 생물 죽음→퇴적물에 묻힘→___→화석 발견",
    "돌로 변함",
    "지구",
    "upper",
  ],
  ["풍화 과정: 바위→물과 바람의 작용→___→흙이 됨", "작은 돌", "지구", "lower"],
  [
    "암석의 순환: 마그마→화성암→풍화/침식→퇴적암→열과 압력→___암→마그마",
    "변성",
    "지구",
    "upper",
  ],

  // ── 지구과학 - 분류하기 ──
  ["화강암, 현무암, 유문암은 모두 ___암이다.", "화성", "지구", "upper"],
  ["사암, 셰일, 석회암은 모두 ___암이다.", "퇴적", "지구", "upper"],
  ["대리암, 편마암, 규암은 모두 ___암이다.", "변성", "지구", "upper"],

  // ── 지구과학 - 인과관계 ──
  [
    "지진이 일어나는 이유는 지구 내부의 ___이 움직이기 때문이다.",
    "판",
    "지구",
    "upper",
  ],
  [
    "화산이 폭발하는 이유는 땅속의 ___가 밖으로 나오기 때문이다.",
    "마그마",
    "지구",
    "lower",
  ],
  [
    "해안가에 절벽이 생기는 이유는 파도의 ___작용 때문이다.",
    "침식",
    "지구",
    "lower",
  ],
  [
    "강 하류가 넓어지는 이유는 물이 흙을 ___시키기 때문이다.",
    "퇴적",
    "지구",
    "lower",
  ],

  // ── 날씨 - 실험결과예측 ──
  [
    "차가운 캔을 더운 날에 꺼내놓으면 표면에 ___이 맺힌다.",
    "물방울",
    "날씨",
    "lower",
  ],
  ["뜨거운 물에서 피어오르는 하얀 ___은 수증기가 식어서 생긴 작은 물방울이다.", "김", "날씨", "lower"],
  [
    "따뜻한 공기를 비닐봉지에 넣으면 봉지가 ___올라간다.",
    "위로",
    "날씨",
    "upper",
  ],

  // ── 날씨 - 과정순서 ──
  [
    "비가 내리는 과정: 증발→수증기 상승→___→비가 됨",
    "구름 생성",
    "날씨",
    "lower",
  ],
  [
    "태풍 발생 과정: 열대 바다→수증기 상승→___→태풍 발달",
    "강한 저기압",
    "날씨",
    "upper",
  ],
  [
    "안개 생성 과정: 밤에 기온 하강→수증기 응결→___가 생김",
    "안개",
    "날씨",
    "lower",
  ],

  // ── 날씨 - 분류하기 ──
  ["적운, 층운, 권운은 모두 ___의 종류이다.", "구름", "날씨", "upper"],
  ["비, 눈, 우박, 이슬, 안개는 모두 ___현상이다.", "기상", "날씨", "lower"],
  [
    "온도계, 풍속계, 우량계는 모두 ___를 관측하는 도구이다.",
    "날씨",
    "날씨",
    "lower",
  ],

  // ── 날씨 - 인과관계 ──
  [
    "여름이 겨울보다 더운 이유는 태양 빛을 ___받기 때문이다.",
    "비스듬히 적게/많이",
    "날씨",
    "upper",
  ],
  [
    "산 꼭대기가 평지보다 추운 이유는 ___가 높기 때문이다.",
    "고도",
    "날씨",
    "upper",
  ],
  [
    "해안가가 내륙보다 기온 변화가 적은 이유는 바닷물의 ___때문이다.",
    "비열",
    "날씨",
    "upper",
  ],

  // ── 우주 - 실험결과예측 ──
  ["달에서 공을 던지면 지구보다 더 ___리 날아간다.", "멀", "우주", "upper"],
  ["태양 쪽으로 가면 행성 표면 온도가 ___아진다.", "높", "우주", "upper"],

  // ── 우주 - 과정순서 ──
  [
    "태양계 행성 순서(안→밖): 수성→금성→지구→화성→___→토성→천왕성→해왕성",
    "목성",
    "우주",
    "upper",
  ],
  [
    "달의 위상 변화 순서: 삭(그믐)→초승달→상현달→보름달→___→하현달→그믐",
    "보름 지남달",
    "우주",
    "upper",
  ],
  [
    "별의 일생 순서: 성운→원시별→주계열성→___→최종 단계",
    "적색거성",
    "우주",
    "upper",
  ],

  // ── 우주 - 분류하기 ──
  ["수성, 금성, 지구, 화성은 ___행성(암석형)이다.", "지구형", "우주", "upper"],
  [
    "목성, 토성, 천왕성, 해왕성은 ___행성(가스형)이다.",
    "목성형",
    "우주",
    "upper",
  ],

  // ── 우주 - 인과관계 ──
  [
    "계절이 바뀌는 이유는 지구의 자전축이 ___어져 있기 때문이다.",
    "기울",
    "우주",
    "upper",
  ],
  [
    "달이 항상 같은 면만 보이는 이유는 자전 주기와 공전 주기가 ___기 때문이다.",
    "같",
    "우주",
    "upper",
  ],
  [
    "별이 반짝이는 이유는 지구 ___가 불규칙하기 때문이다.",
    "대기",
    "우주",
    "upper",
  ],

  // ── 환경 - 실험결과예측 ──
  [
    "플라스틱을 땅에 묻으면 수백 년이 지나도 ___지 않는다.",
    "썩",
    "환경",
    "upper",
  ],
  [
    "오염된 물에 물고기를 넣으면 물고기가 ___을 수 있다.",
    "죽",
    "환경",
    "lower",
  ],

  // ── 환경 - 과정순서 ──
  ["먹이사슬 순서: 풀→___→개구리→뱀→매", "메뚜기", "환경", "upper"],
  ["물의 정화 과정: 오염수→침전→___→소독→깨끗한 물", "여과", "환경", "upper"],
  [
    "탄소 순환 과정: 광합성→식물에 저장→동물이 먹음→___→대기 중 CO₂",
    "호흡·분해",
    "환경",
    "upper",
  ],

  // ── 환경 - 분류하기 ──
  ["태양광, 풍력, 수력은 모두 ___에너지이다.", "재생", "환경", "upper"],
  ["석탄, 석유, 천연가스는 모두 ___연료이다.", "화석", "환경", "upper"],
  [
    "종이, 유리, 캔, 플라스틱은 모두 ___할 수 있는 것이다.",
    "재활용",
    "환경",
    "lower",
  ],

  // ── 환경 - 인과관계 ──
  ["오존층이 파괴되면 ___선이 더 많이 지표에 닿는다.", "자외", "환경", "upper"],
  ["열대우림이 줄어들면 이산화탄소 흡수가 ___어진다.", "줄", "환경", "upper"],
  [
    "도시에 녹지가 줄면 여름 기온이 ___아지는 열섬 현상이 생긴다.",
    "높",
    "환경",
    "upper",
  ],

  // ── 인체 - 실험결과예측 ──
  ["운동을 하면 맥박이 ___아진다.", "빨라", "인체", "lower"],
  ["매운 음식을 먹으면 ___이 난다.", "땀", "인체", "lower"],
  ["추운 곳에 있으면 몸이 ___는다.", "떨", "인체", "lower"],

  // ── 인체 - 과정순서 ──
  [
    "소화 순서: 입(씹기)→식도→위(분해)→소장(___흡수)→대장(수분흡수)→배출",
    "영양분",
    "인체",
    "upper",
  ],
  ["호흡 순서: 코→기관→기관지→폐포→산소가 ___으로 이동", "혈액", "인체", "upper"],
  ["반사 행동 순서: 자극→감각기관→___→운동기관→반응", "척수",
    "인체",
    "upper",
  ],

  // ── 인체 - 분류하기 ──
  ["심장, 폐, 위, 간은 모두 ___에 해당한다.", "내장기관", "인체", "upper"],
  ["눈, 코, 귀, 혀, 피부는 모두 ___기관이다.", "감각", "인체", "lower"],
  ["탄수화물, 단백질, 지방은 모두 3대 ___다.", "영양소", "인체", "upper"],

  // ── 인체 - 인과관계 ──
  ["비타민이 부족하면 면역력이 ___해진다.", "약", "인체", "upper"],
  ["물을 충분히 마시지 않으면 ___이 날 수 있다.", "탈수증", "인체", "upper"],
  ["잠을 충분히 자지 않으면 집중력이 ___어진다.", "떨", "인체", "lower"],

  // ── 추가 물리 (lower) ──
  ["고무줄을 세게 튕기면 소리가 ___진다.", "커", "물리", "lower"],
  [
    "무거운 공과 가벼운 공을 같은 힘으로 밀면 ___공이 더 빨리 간다.",
    "가벼운",
    "물리",
    "lower",
  ],
  ["물 위에 기름을 부으면 기름이 ___에 뜬다.", "위", "물리", "lower"],
  ["양초에 유리컵을 씌우면 불이 ___진다.", "꺼", "물리", "lower"],
  ["빗면 위에서 공을 굴리면 점점 ___진다.", "빨라", "물리", "lower"],
  ["따뜻한 물에 찬 물을 부으면 온도가 ___진다.", "낮아", "물리", "lower"],

  // ── 추가 화학 (lower) ──
  [
    "빨래가 햇빛에서 빨리 마르는 것은 물이 ___되기 때문이다.",
    "증발",
    "화학",
    "lower",
  ],
  ["식용유를 물에 넣으면 기름이 물 ___에 뜬다.", "위", "화학", "lower"],
  ["녹말가루를 물에 넣고 저으면 물이 ___ 된다.", "뿌옇게", "화학", "lower"],
  ["사탕을 입에 넣고 있으면 침에 ___ 작아진다.", "녹아", "화학", "lower"],
  ["드라이아이스를 놓아두면 직접 ___로 변한다.", "기체", "화학", "upper"],

  // ── 추가 생물 (lower) ──
  ["개미는 먹이를 찾으면 ___를 남겨 다른 개미에게 알린다.", "냄새",
    "생물",
    "lower",
  ],
  [
    "오리의 발에 물갈퀴가 있는 이유는 ___을 잘 하기 위해서이다.",
    "수영",
    "생물",
    "lower",
  ],
  [
    "원숭이의 손이 물건을 잡기 좋은 이유는 ___이 있기 때문이다.",
    "엄지손가락",
    "생물",
    "lower",
  ],
  ["고슴도치는 위험할 때 몸을 ___게 만든다.", "둥글", "생물", "lower"],
  ["문어는 위험할 때 ___을 뿜어 도망친다.", "먹물", "생물", "lower"],
  ["뱀이 혀를 내미는 이유는 ___를 맡기 위해서이다.", "냄새", "생물", "lower"],
  ["벌의 침에 쏘이면 ___고 붓는다.", "아프", "생물", "lower"],
  [
    "식물의 씨앗에 날개가 있으면 ___에 의해 멀리 퍼진다.",
    "바람",
    "생물",
    "lower",
  ],
  ["달팽이가 지나간 자리에 끈적한 ___이 남는다.", "점액", "생물", "lower"],
  [
    "무당벌레의 빨간 색은 ___에게 독이 있다고 경고하는 것이다.",
    "천적",
    "생물",
    "lower",
  ],

  // ── 추가 생물 (upper) ──
  [
    "광합성의 화학식에서 물과 이산화탄소가 필요하고 ___과 산소가 만들어진다.",
    "포도당",
    "생물",
    "upper",
  ],
  ["DNA는 생물의 ___정보를 저장하는 물질이다.", "유전", "생물", "upper"],
  ["세포는 생물을 이루는 가장 작은 ___단위이다.", "구조", "생물", "upper"],
  [
    "식물세포에만 있고 동물세포에 없는 것은 ___이다.",
    "세포벽",
    "생물",
    "upper",
  ],
  ["엽록체가 있는 세포에서만 ___이 일어난다.", "광합성", "생물", "upper"],
  ["줄기에서 물이 올라가는 관을 ___관이라 한다.", "물", "생물", "upper"],
  ["줄기에서 양분이 내려가는 관을 ___관이라 한다.", "체", "생물", "upper"],
  ["뿌리의 삼투압으로 물이 ___올라간다.", "빨려", "생물", "upper"],

  // ── 추가 지구과학 (lower) ──
  [
    "비가 내린 후 무지개가 보이는 방향은 태양의 ___쪽이다.",
    "반대",
    "지구",
    "lower",
  ],
  [
    "밤하늘의 별이 움직이는 것처럼 보이는 이유는 지구가 ___하기 때문이다.",
    "자전",
    "지구",
    "lower",
  ],
  [
    "바닷가에서 주운 둥근 돌은 파도에 의해 ___진 것이다.",
    "깎",
    "지구",
    "lower",
  ],
  [
    "강의 상류에서 돌이 큰 이유는 침식이 ___기 때문이다.",
    "심하",
    "지구",
    "lower",
  ],
  [
    "강의 하류에서 돌이 작은 이유는 오래 ___되었기 때문이다.",
    "운반",
    "지구",
    "lower",
  ],

  // ── 추가 지구과학 (upper) ──
  [
    "판게아는 옛날에 모든 대륙이 하나로 ___있었던 것이다.",
    "붙어",
    "지구",
    "upper",
  ],
  ["지구의 내부 구조는 지각, 맨틀, ___으로 나뉜다.", "핵", "지구", "upper"],
  ["지구의 자기장은 ___극과 S극이 있다.", "N", "지구", "upper"],
  ["조석 현상은 달과 태양의 ___때문에 일어난다.", "인력", "지구", "upper"],
  ["엘니뇨 현상은 태평양 수온이 ___아지는 현상이다.", "높", "지구", "upper"],

  // ── 추가 날씨 (lower) ──
  [
    "비 온 뒤 공기가 맑은 이유는 빗물이 먼지를 ___기 때문이다.",
    "씻어내",
    "날씨",
    "lower",
  ],
  ["봄에 꽃이 피는 이유는 ___이 올라가기 때문이다.", "기온", "날씨", "lower"],
  [
    "겨울에 입김이 보이는 이유는 수증기가 ___되기 때문이다.",
    "응결",
    "날씨",
    "lower",
  ],
  ["우산을 쓰는 이유는 비가 ___에서 떨어지기 때문이다.", "하늘",
    "날씨",
    "lower",
  ],
  ["눈사람이 녹는 이유는 ___이 올라가기 때문이다.", "기온", "날씨", "lower"],

  // ── 추가 날씨 (upper) ──
  [
    "단열 팽창은 공기가 올라가면서 ___가 내려가는 것이다.",
    "온도",
    "날씨",
    "upper",
  ],
  ["포화 수증기량은 온도가 높으면 ___아진다.", "많", "날씨", "upper"],
  [
    "이슬점은 공기 중 수증기가 ___되기 시작하는 온도이다.",
    "응결",
    "날씨",
    "upper",
  ],
  [
    "편서풍은 우리나라의 날씨가 ___에서 동으로 바뀌게 한다.",
    "서",
    "날씨",
    "upper",
  ],
  ["한랭전선이 지나가면 기온이 갑자기 ___아진다.", "낮", "날씨", "upper"],

  // ── 추가 우주 (lower) ──
  [
    "밤하늘에서 움직이지 않는 것처럼 보이는 별은 ___이다.",
    "북극성",
    "우주",
    "lower",
  ],
  [
    "보름달이 가장 밝은 이유는 태양 빛을 가장 많이 ___하기 때문이다.",
    "반사",
    "우주",
    "lower",
  ],
  ["별이 아주 많이 모인 것을 ___라 한다.", "은하", "우주", "lower"],
  ["밤하늘에 빛을 내며 떨어지는 별똥별을 다른 말로 ___이라(라) 한다.", "유성",
    "우주",
    "lower",
  ],

  // ── 추가 우주 (upper) ──
  ["블랙홀은 빛도 빠져나올 수 ___은 천체이다.", "없", "우주", "upper"],
  ["빛의 속도는 초속 약 ___만 km이다.", "30", "우주", "upper"],
  ["1광년은 빛이 ___년 동안 가는 거리이다.", "1", "우주", "upper"],
  ["우주 공간은 거의 ___상태이다.", "진공", "우주", "upper"],
  [
    "인공위성이 지구 주위를 도는 것은 ___과 관성의 균형 때문이다.",
    "중력",
    "우주",
    "upper",
  ],

  // ── 추가 환경 (lower) ──
  [
    "나무 한 그루가 하루에 만드는 산소로 사람 ___명이 숨을 쉴 수 있다.",
    "4",
    "환경",
    "lower",
  ],
  [
    "바다의 산호가 하얗게 변하는 것을 산호 ___라 한다.",
    "백화",
    "환경",
    "upper",
  ],
  ["꿀벌이 사라지면 식물의 ___이 어려워진다.", "수분", "환경", "upper"],
  ["숲은 홍수를 막아주는 ___역할을 한다.", "방재", "환경", "lower"],
  [
    "비닐봉지는 바다 동물이 먹이로 착각하여 ___할 수 있다.",
    "삼킬",
    "환경",
    "lower",
  ],

  // ── 추가 전기 (upper) ──
  ["전압의 단위는 ___이다.", "V(볼트)", "전기", "upper"],
  ["전류의 단위는 ___이다.", "A(암페어)", "전기", "upper"],
  ["저항의 단위는 ___이다.", "Ω(옴)", "전기", "upper"],
  ["옴의 법칙에서 전압은 전류 곱하기 ___이다.", "저항", "전기", "upper"],
  ["가정에서 전기 사용량의 단위는 ___이다.", "kWh", "전기", "upper"],
  [
    "전기 안전을 위해 젖은 손으로 ___를 만지면 안 된다.",
    "콘센트",
    "전기",
    "lower",
  ],
  ["감전을 방지하기 위한 장치를 ___차단기라 한다.", "누전", "전기", "upper"],

  // ── 빛과소리 추가 ──
  ["빛은 공기가 없는 우주 공간에서도 ___ 수 있다.", "나아갈", "빛과소리", "upper"],
  ["적외선은 눈에 보이지 않지만 ___을 전달한다.", "열", "빛과소리", "upper"],
  ["자외선은 피부를 ___게 만들 수 있다.", "타", "빛과소리", "upper"],
  ["X선은 몸속의 ___를 찍을 수 있다.", "뼈", "빛과소리", "upper"],
  [
    "도플러 효과는 소리를 내는 물체가 다가오면 소리가 ___아지는 현상이다.",
    "높",
    "빛과소리",
    "upper",
  ],
  [
    "쌍안경은 ___렌즈를 이용하여 먼 것을 크게 본다.",
    "볼록",
    "빛과소리",
    "upper",
  ],
  ["현미경은 작은 것을 ___보는 도구이다.", "크게", "빛과소리", "lower"],
  ["잠망경은 빛의 ___를 이용한 도구이다.", "반사", "빛과소리", "upper"],

  // ── 물질 추가 ──
  ["같은 크기의 쇠와 나무 중 더 무거운 것은 ___다.", "쇠", "물질", "lower"],
  ["유리는 깨지기 ___물질이다.", "쉬운", "물질", "lower"],
  [
    "알루미늄 호일은 얇고 ___서 음식을 쌀 수 있다.",
    "구부러져",
    "물질",
    "lower",
  ],
  [
    "고무줄은 잡아당기면 늘어나고 놓으면 ___돌아온다.",
    "원래대로",
    "물질",
    "lower",
  ],
  ["비닐은 물을 ___지 않는다.", "통과시키", "물질", "lower"],
  ["모래와 쇠가루를 분리할 때 ___을 사용한다.", "자석", "물질", "upper"],
  ["크기가 다른 알갱이를 분리할 때 ___를 사용한다.", "체", "물질", "upper"],
];
const SCIENCE_EXTRA: ScienceItem[] = SCI_X.map(
  ([text, answer, category, gradeGroup]) => ({
    text,
    answer,
    category,
    gradeGroup,
  }),
);

// ─── EXTRA SOCIAL (compact tuples) ──────────────────────────
const SOC_X: [string, string, string, "lower" | "upper" | "both"][] = [
  ["우리나라 국보 1호였던 건물은 ___이다.", "숭례문", "문화", "lower"],
  ["한반도의 동쪽 끝 섬은 ___다.", "독도", "지리", "both"],
  ["우리나라에서 가장 긴 강은 ___이다.", "낙동강", "지리", "lower"],
  ["한라산은 ___도에 있다.", "제주", "지리", "lower"],
  ["설악산은 ___도에 있다.", "강원", "지리", "lower"],
  ["지리산은 전라도와 ___도에 걸쳐 있다.", "경상", "지리", "lower"],
  ["우리나라의 행정 구역은 ___개의 광역시도로 나뉜다.", "17", "지리", "upper"],
  ["조선 시대 과거 시험에서 장원은 ___등을 뜻한다.", "1", "역사", "lower"],
  ["고려 시대에 발명된 인쇄술은 ___활자이다.", "금속", "역사", "lower"],
  ["삼국 통일을 이룬 나라는 ___다.", "신라", "역사", "lower"],
  ["백제의 마지막 왕은 ___이다.", "의자왕", "역사", "upper"],
  ["고구려를 세운 사람은 ___이다.", "주몽", "역사", "lower"],
  ["신라의 수도는 ___였다.", "경주", "역사", "lower"],
  ["고려의 수도는 ___이었다.", "개경", "역사", "lower"],
  ["조선 시대 양반의 집을 ___이라(라) 했다.", "한옥", "문화", "lower"],
  [
    "우리나라 전통 무예인 ___는 올림픽 정식 종목이다.",
    "태권도",
    "문화",
    "both",
  ],
  ["판소리는 ___과 고수 두 사람이 하는 공연이다.", "소리꾼", "문화", "lower"],
  ["한식은 유네스코 ___유산으로 등재되었다.", "무형문화", "문화", "upper"],
  ["김치의 주재료는 ___다.", "배추", "문화", "lower"],
  ["설날에 먹는 대표 음식은 ___이다.", "떡국", "문화", "lower"],
  ["정월대보름에 먹는 음식은 ___이다.", "오곡밥", "문화", "lower"],
  ["국회의원은 ___을 만드는 일을 한다.", "법", "정치", "upper"],
  ["대법원은 ___권에 속한다.", "사법", "정치", "upper"],
  ["헌법재판소는 ___을 위반한 법률을 심판한다.", "헌법", "정치", "upper"],
  ["선거에서 투표할 수 있는 나이는 만 ___세이다.", "18", "정치", "upper"],
  ["민주주의에서 소수의 의견도 ___해야 한다.", "존중", "정치", "both"],
  [
    "시장에서 물건의 가격이 정해지는 것을 ___의 법칙이라 한다.",
    "수요와 공급",
    "경제",
    "upper",
  ],
  ["은행에 돈을 맡기면 받는 것을 ___라 한다.", "이자", "경제", "lower"],
  ["물건을 외국에 파는 것을 ___이라(라) 한다.", "수출", "경제", "upper"],
  ["물건을 외국에서 사오는 것을 ___이라(라) 한다.", "수입", "경제", "upper"],
  ["나라의 살림을 기록한 것을 ___이라(라) 한다.", "예산", "경제", "upper"],
  ["세금으로 운영되는 학교를 ___학교라 한다.", "공립", "경제", "lower"],
  ["유엔(UN)은 세계 ___를 위해 만들어졌다.", "평화", "세계", "both"],
  ["올림픽의 오륜기는 ___개 대륙을 상징한다.", "5", "세계", "lower"],
  [
    "세계 4대 문명 중 메소포타미아는 ___강 유역에서 발생했다.",
    "티그리스·유프라테스",
    "역사",
    "upper",
  ],
  ["프랑스 혁명의 3대 이념은 자유, 평등, ___다.", "박애", "역사", "upper"],
  ["제2차 세계대전이 끝난 해는 ___년이다.", "1945", "역사", "upper"],
  ["간디는 ___의 독립을 이끈 지도자이다.", "인도", "세계", "upper"],
  ["만리장성을 세운 나라는 ___이다.", "중국", "세계", "lower"],
  ["이집트의 유명한 건축물은 ___다.", "피라미드", "세계", "lower"],
  ["자유의 여신상은 ___에 있다.", "미국", "세계", "lower"],
  ["환경 오염을 줄이기 위해 ___에너지를 사용한다.", "재생", "환경", "upper"],
  ["지구 온난화로 ___가 녹고 있다.", "빙하", "환경", "upper"],
  ["미세먼지를 줄이려면 대중___을 이용해야 한다.", "교통", "환경", "both"],
  ["쓰레기를 줄이는 3R은 줄이기, 재사용, ___이다.", "재활용", "환경", "both"],
  ["플라스틱이 분해되는 데 약 ___년이 걸린다.", "500", "환경", "upper"],
  ["멸종 위기 동물을 보호하는 곳을 ___이라(라) 한다.", "보호구역", "환경", "lower"],
  ["비무장지대(DMZ)는 남한과 ___사이에 있다.", "북한", "정치", "both"],
  ["이산가족은 남북 ___으로 헤어진 가족이다.", "분단", "정치", "upper"],
  [
    "평화통일을 위한 남북 정상회담이 처음 열린 해는 ___년이다.",
    "2000",
    "역사",
    "upper",
  ],
  // ── 지리 추가 ──
  ["우리나라의 남쪽 끝 섬은 ___도이다.", "마라", "지리", "lower"],
  ["태백산맥은 우리나라의 ___쪽에 있다.", "동", "지리", "lower"],
  ["금강은 ___도에서 시작하여 서해로 흐른다.", "충청", "지리", "lower"],
  ["영산강은 ___도를 흐르는 강이다.", "전라", "지리", "lower"],
  ["우리나라에서 두 번째로 큰 섬은 ___도이다.", "거제", "지리", "lower"],
  ["부산은 우리나라의 ___쪽에 있는 도시이다.", "남동", "지리", "lower"],
  ["인천은 우리나라의 ___쪽에 있는 도시이다.", "서", "지리", "lower"],
  ["울릉도는 ___해에 있는 섬이다.", "동", "지리", "lower"],
  ["백두산의 꼭대기에 있는 호수를 ___라 한다.", "천지", "지리", "both"],
  ["갯벌은 ___해안에 발달한다.", "서", "지리", "lower"],
  ["우리나라의 동해안은 해안선이 ___하다.", "단조", "지리", "upper"],
  ["우리나라의 서해안은 해안선이 ___하다.", "복잡", "지리", "upper"],
  ["리아스식 해안은 ___해안에서 볼 수 있다.", "서", "지리", "upper"],
  ["평야가 넓은 곳은 주로 ___를 많이 짓는다.", "논농사", "지리", "lower"],
  // ── 역사 추가 ──
  [
    "세종대왕이 만든 비 오는 양을 재는 기구는 ___다.",
    "측우기",
    "역사",
    "both",
  ],
  ["세종대왕이 만든 해시계는 ___다.", "앙부일구", "역사", "upper"],
  ["조선 시대 여성 화가로 유명한 사람은 ___이다.", "신사임당", "역사", "both"],
  ["고려 시대 왕실의 도자기는 ___자이다.", "청", "역사", "lower"],
  ["불국사와 석굴암은 ___시대에 만들어졌다.", "신라", "역사", "lower"],
  ["첨성대는 별을 관측하던 ___다.", "천문대", "역사", "lower"],
  ["조선의 마지막 왕은 ___이다.", "순종", "역사", "upper"],
  ["을사늑약이 체결된 해는 ___년이다.", "1905", "역사", "upper"],
  ["안창호가 세운 독립운동 단체는 ___회이다.", "흥사단", "역사", "upper"],
  ["유관순 열사가 만세 운동을 한 곳은 ___다.", "아우내장터", "역사", "upper"],
  ["발해를 세운 사람은 ___이다.", "대조영", "역사", "upper"],
  ["발해는 고구려를 이은 나라로 ___국이라 불렸다.", "해동성", "역사", "upper"],
  [
    "고려의 문벌 귀족 사회를 무너뜨린 무신정변은 ___년이다.",
    "1170",
    "역사",
    "upper",
  ],
  ["한산도 대첩에서 사용된 전술은 ___진이다.", "학익", "역사", "upper"],
  // ── 문화 추가 ──
  [
    "우리나라 전통 놀이 중 줄을 당기는 놀이는 ___다.",
    "줄다리기",
    "문화",
    "lower",
  ],
  [
    "우리나라 전통 놀이 중 돌을 쌓는 놀이는 ___다.",
    "돌탑쌓기",
    "문화",
    "lower",
  ],
  ["한복에서 남자가 입는 바지를 ___라 한다.", "바지", "문화", "lower"],
  ["한복에서 여자가 입는 치마를 ___라 한다.", "치마", "문화", "lower"],
  ["우리나라 전통 타악기인 큰 북을 ___라 한다.", "장구", "문화", "lower"],
  [
    "사물놀이에 사용되는 네 가지 악기는 꽹과리, 장구, 북, ___이다.",
    "징",
    "문화",
    "both",
  ],
  ["우리나라의 유네스코 세계유산으로 ___이 있다.", "수원화성", "문화", "upper"],
  ["비빔밥의 뜻은 여러 재료를 ___은 밥이다.", "섞", "문화", "lower"],
  ["떡볶이의 주재료는 ___이다.", "떡", "문화", "lower"],
  ["대한민국의 화폐 단위는 ___이다.", "원", "문화", "lower"],
  ["태극기의 가운데 무늬를 ___이라(라) 한다.", "태극", "문화", "lower"],
  ["태극기의 네 모서리에 있는 무늬를 ___라 한다.", "건곤감리", "문화", "upper"],
  // ── 정치 추가 ──
  ["대통령이 법률안에 거부하는 것을 ___이라(라) 한다.", "거부권", "정치", "upper"],
  ["국무총리는 ___이 임명한다.", "대통령", "정치", "upper"],
  ["감사원은 국가의 ___를 감사한다.", "회계", "정치", "upper"],
  ["지방자치단체의 의회를 ___의회라 한다.", "지방", "정치", "upper"],
  ["조례는 ___자치단체에서 만든 규칙이다.", "지방", "정치", "upper"],
  ["주민투표는 지역 주민이 직접 ___하는 것이다.", "결정", "정치", "both"],
  ["국민이 법률안을 제안하는 것을 ___이라(라) 한다.", "국민발안", "정치", "upper"],
  ["정당은 정치적 뜻이 같은 사람들의 ___이다.", "모임", "정치", "upper"],
  // ── 경제 추가 ──
  ["나라에서 거두는 돈을 ___이라(라) 한다.", "세금", "경제", "lower"],
  ["부가가치세는 물건을 살 때 내는 ___이다.", "세금", "경제", "upper"],
  ["월급에서 떼는 세금을 ___세라 한다.", "소득", "경제", "upper"],
  ["돈의 가치가 떨어지면 물가가 ___한다.", "상승", "경제", "upper"],
  ["환율은 다른 나라 돈과 우리나라 돈의 ___비율이다.", "교환", "경제", "upper"],
  [
    "기업이 물건을 만들어 이익을 남기는 것을 ___이라(라) 한다.",
    "이윤",
    "경제",
    "upper",
  ],
  ["물건의 품질이 좋으면 ___가 높아진다.", "수요", "경제", "upper"],
  ["경쟁이 치열하면 물건의 ___이 내려간다.", "가격", "경제", "upper"],
  ["국내에서 생산된 모든 재화의 가치를 ___라 한다.", "GDP", "경제", "upper"],
  [
    "시장에서 판매자끼리 경쟁하는 것을 ___경쟁이라 한다.",
    "가격",
    "경제",
    "upper",
  ],
  ["아이들이 용돈을 모아 쓰는 것을 ___관리라 한다.", "용돈", "경제", "lower"],
  [
    "필요한 것과 원하는 것을 구분하는 것을 합리적 ___라 한다.",
    "소비",
    "경제",
    "lower",
  ],
  // ── 세계 추가 ──
  ["세계에서 가장 높은 산은 ___다.", "에베레스트", "세계", "upper"],
  ["세계에서 가장 긴 강은 ___강이다.", "나일", "세계", "upper"],
  ["아프리카에서 가장 큰 사막은 ___사막이다.", "사하라", "세계", "upper"],
  ["호주의 수도는 ___다.", "캔버라", "세계", "upper"],
  ["이탈리아의 수도는 ___다.", "로마", "세계", "upper"],
  ["독일의 수도는 ___이다.", "베를린", "세계", "upper"],
  ["브라질의 수도는 ___다.", "브라질리아", "세계", "upper"],
  ["인도의 수도는 ___다.", "뉴델리", "세계", "upper"],
  ["캐나다의 수도는 ___다.", "오타와", "세계", "upper"],
  ["올림픽은 ___년마다 열린다.", "4", "세계", "lower"],
  ["세계에서 가장 작은 나라는 ___이다.", "바티칸", "세계", "upper"],
  ["콜로세움이 있는 나라는 ___다.", "이탈리아", "세계", "lower"],
  ["만리장성이 있는 나라는 ___이다.", "중국", "세계", "lower"],
  ["타지마할이 있는 나라는 ___다.", "인도", "세계", "lower"],
  ["아마존 열대우림은 ___대륙에 있다.", "남아메리카", "세계", "upper"],
  ["남극에 사는 대표적인 동물은 ___이다.", "펭귄", "세계", "lower"],
  ["북극에 사는 대표적인 동물은 ___이다.", "북극곰", "세계", "lower"],
  // ── 환경 추가 ──
  ["오존층은 태양의 ___선을 막아준다.", "자외", "환경", "upper"],
  [
    "산성비는 대기 오염 물질이 ___에 녹아 내리는 비이다.",
    "빗물",
    "환경",
    "upper",
  ],
  ["열대우림이 사라지는 것을 ___파괴라 한다.", "산림", "환경", "upper"],
  ["바다에 기름이 유출되면 ___오염이 발생한다.", "해양", "환경", "upper"],
  ["음식물 쓰레기를 줄이면 ___을 보호할 수 있다.", "환경", "환경", "lower"],
  [
    "탄소 발자국은 개인이 배출하는 ___의 양이다.",
    "이산화탄소",
    "환경",
    "upper",
  ],
  ["전기를 아끼면 ___배출을 줄일 수 있다.", "탄소", "환경", "both"],
  ["자전거는 ___가 없는 친환경 교통수단이다.", "배기가스", "환경", "lower"],
  [
    "생태계에서 한 종이 사라지면 다른 종에도 ___을 준다.",
    "영향",
    "환경",
    "both",
  ],
  ["물이 부족한 지역에서는 ___을 절약해야 한다.", "물", "환경", "lower"],
  ["습지는 많은 ___의 서식지이다.", "생물", "환경", "both"],
  ["태양광 발전은 ___을 이용해 전기를 만든다.", "햇빛", "환경", "both"],
  // ── 추가 지리/역사/문화/정치/경제/세계/환경 ──
  ["우리나라에서 가장 넓은 평야는 ___평야이다.", "호남", "지리", "lower"],
  ["경기도의 도청 소재지는 ___이다.", "수원", "지리", "lower"],
  [
    "지도에서 땅의 이용 상태를 나타낸 것을 ___도라 한다.",
    "토지이용",
    "지리",
    "upper",
  ],
  [
    "조선 시대 세계 지도인 ___는 혼일강리역대국도지도이다.",
    "혼일강리역대국도지도",
    "역사",
    "upper",
  ],
  ["정조가 지은 성은 ___이다.", "수원화성", "역사", "upper"],
  [
    "병인양요 때 프랑스가 약탈한 것은 ___도서이다.",
    "외규장각",
    "역사",
    "upper",
  ],
  ["우리나라 전통 음료인 ___는 쌀로 만든다.", "식혜", "문화", "lower"],
  ["전통 떡 중 무지개 색의 떡을 ___이라(라) 한다.", "무지개떡", "문화", "lower"],
  ["국민의 의무에는 국방, 납세, 교육, ___가 있다.", "근로", "정치", "upper"],
  ["대한민국 국회는 ___원제이다.", "단", "정치", "upper"],
  [
    "기회비용은 하나를 선택할 때 포기하는 것의 ___다.",
    "가치",
    "경제",
    "upper",
  ],
  ["용돈 기입장을 쓰면 돈을 ___있게 쓸 수 있다.", "계획", "경제", "lower"],
  ["적도 부근의 기후를 ___기후라 한다.", "열대", "세계", "upper"],
  ["유럽 연합의 약자는 ___이다.", "EU", "세계", "upper"],
  ["분리수거를 하면 ___를 줄일 수 있다.", "쓰레기", "환경", "lower"],

  // ══════════════════════════════════════════════════════════════
  // ── NEW SOCIAL STUDIES ITEMS (100+) ───────────────────────────
  // ══════════════════════════════════════════════════════════════

  // ── 우리 고장의 모습 (lower, 3-4학년) ──
  ["우리 동네의 모습을 그린 그림을 ___라 한다.", "마을 지도", "지리", "lower"],
  ["지도에서 높은 산지는 주로 ___색으로 표시한다.", "갈", "지리", "lower"],
  ["지도에서 물은 ___색으로 표시한다.", "파란", "지리", "lower"],
  [
    "우리 동네의 높은 곳에서 보면 ___을 넓게 볼 수 있다.",
    "마을",
    "지리",
    "lower",
  ],
  ["도시에는 높은 ___이 많다.", "건물", "지리", "lower"],
  ["농촌에는 넓은 ___이 있다.", "논밭", "지리", "lower"],
  ["어촌은 ___가에 있는 마을이다.", "바다", "지리", "lower"],
  ["산촌은 ___에 있는 마을이다.", "산", "지리", "lower"],
  [
    "우리 동네를 소개할 때 ___이 있는 곳을 알려준다.",
    "공공시설",
    "지리",
    "lower",
  ],
  [
    "고장의 이름은 그 지역의 ___에서 유래한 경우가 많다.",
    "자연환경",
    "지리",
    "lower",
  ],

  // ── 지역의 공공기관 (lower, 3-4학년) ──
  [
    "주민센터에서는 주민등록 ___을 발급받을 수 있다.",
    "등본",
    "지역사회",
    "lower",
  ],
  ["보건소에서는 무료로 ___을 받을 수 있다.", "예방접종", "지역사회", "lower"],
  ["거리를 청소하고 쓰레기를 치우는 사람을 ___이라(라) 한다.", "환경미화원",
    "지역사회",
    "lower",
  ],
  ["공공 도서관에서는 책을 무료로 ___수 있다.", "빌릴", "지역사회", "lower"],
  [
    "어린이집과 유치원은 어린 아이를 ___하는 곳이다.",
    "돌봄",
    "지역사회",
    "lower",
  ],
  [
    "구청이나 시청은 지역의 ___을 맡아 하는 곳이다.",
    "행정",
    "지역사회",
    "lower",
  ],
  [
    "체육관이나 수영장은 주민이 ___을 할 수 있는 곳이다.",
    "운동",
    "지역사회",
    "lower",
  ],
  [
    "문화센터에서는 다양한 ___을 배울 수 있다.",
    "프로그램",
    "지역사회",
    "lower",
  ],

  // ── 교통수단과 통신수단의 발달 (lower, 3-4학년) ──
  ["옛날 사람들은 ___을 타고 먼 곳을 갔다.", "말", "문화", "lower"],
  ["1899년 우리나라에 처음 놓인 철도는 서울과 인천을 잇는 ___선이다.", "경인",
    "문화",
    "lower",
  ],
  ["옛날에는 편지를 전하는 사람을 ___이라(라) 했다.", "파발", "문화", "lower"],
  ["전화기를 발명한 사람은 ___이다.", "벨", "문화", "upper"],
  [
    "인터넷이 발달하면서 ___으로 편지를 보낼 수 있게 되었다.",
    "이메일",
    "문화",
    "lower",
  ],
  ["비행기를 발명한 사람은 ___형제이다.", "라이트", "문화", "lower"],
  ["KTX는 우리나라의 ___열차이다.", "고속", "문화", "lower"],
  ["옛날에는 소식을 전할 때 ___를 올렸다.", "봉화", "문화", "lower"],
  ["지하철은 땅 ___을 달리는 기차이다.", "속", "문화", "lower"],
  ["배는 바다나 강 위를 ___는 교통수단이다.", "다니", "문화", "lower"],

  // ── 우리나라의 명절과 문화 (lower, 3-4학년) ──
  ["한식은 ___에 찬 음식을 먹는 명절이다.", "봄", "문화", "lower"],
  ["동지에 먹는 음식은 ___이다.", "팥죽", "문화", "lower"],
  ["정월 대보름에는 ___을 돌리는 풍습이 있다.", "쥐불", "문화", "lower"],
  ["초복, 중복, 말복을 ___이라(라) 한다.", "삼복", "문화", "lower"],
  ["대보름에는 보름달을 보며 ___을 빈다.", "소원", "문화", "lower"],
  ["제기차기는 ___으로 제기를 차는 놀이이다.", "발", "문화", "lower"],
  ["연날리기는 ___을 이용해 연을 날리는 놀이이다.", "바람", "문화", "lower"],
  ["투호는 통에 ___을 던져 넣는 놀이이다.", "화살", "문화", "lower"],
  ["팽이치기는 ___에 하는 전통 놀이이다.", "겨울", "문화", "lower"],
  [
    "씨름에서 이기려면 상대를 ___으로 넘어뜨려야 한다.",
    "모래판",
    "문화",
    "lower",
  ],

  // ── 세계 여러 나라의 문화 (upper, 5-6학년) ──
  ["일본의 전통 의복은 ___다.", "기모노", "세계", "upper"],
  ["중국의 전통 의복은 ___다.", "치파오", "세계", "upper"],
  ["인도 여성의 전통 의복은 ___다.", "사리", "세계", "upper"],
  ["미국의 대표 음식으로 ___가 있다.", "햄버거", "세계", "upper"],
  ["이탈리아의 대표 음식으로 ___가 있다.", "피자", "세계", "upper"],
  ["일본의 대표 음식으로 ___이 있다.", "초밥", "세계", "upper"],
  ["멕시코의 대표 음식으로 ___가 있다.", "타코", "세계", "upper"],
  ["브라질의 유명한 축제는 ___축제이다.", "카니발", "세계", "upper"],
  [
    "스페인의 유명한 축제에서는 ___를 던지는 축제가 있다.",
    "토마토",
    "세계",
    "upper",
  ],
  [
    "태국 사람들은 인사할 때 두 손을 ___으며 인사한다.",
    "합장",
    "세계",
    "upper",
  ],

  // ── 경제생활과 현명한 소비 (lower, 3-4학년) ──
  [
    "물건을 살 때 ___을 비교하면 현명한 소비를 할 수 있다.",
    "가격",
    "경제",
    "lower",
  ],
  ["용돈을 받으면 ___을 세워 쓰는 것이 좋다.", "계획", "경제", "lower"],
  ["꼭 필요한 물건인지 생각한 후 ___하는 것이 좋다.", "구매", "경제", "lower"],
  ["물건을 바꾸어 쓰는 것을 ___시장이라 한다.", "벼룩", "경제", "lower"],
  ["저금통에 동전을 모으는 것을 ___이라(라) 한다.", "저축", "경제", "lower"],
  ["물건을 살 때는 가격표에 적힌 ___을 서로 비교한다.", "값", "경제", "lower"],
  [
    "광고를 보고 무조건 사지 않고 ___을 따져 봐야 한다.",
    "필요성",
    "경제",
    "lower",
  ],
  ["편의점과 마트의 같은 물건도 ___이 다를 수 있다.", "가격", "경제", "lower"],
  [
    "쇼핑할 때 목록을 미리 ___하면 불필요한 구매를 줄일 수 있다.",
    "작성",
    "경제",
    "lower",
  ],
  ["중고 물건을 사면 ___을 아낄 수 있다.", "돈", "경제", "lower"],

  // ── 추가 lower 사회 ──
  ["우리 동네에서 길을 찾을 때 ___를 사용한다.", "지도",
    "지리",
    "lower",
  ],
  ["우리나라의 대표적인 항구 도시는 ___이다.", "부산", "지리", "lower"],
  ["대전은 우리나라의 ___쪽에 있는 도시이다.", "가운데", "지리", "lower"],
  ["광주는 우리나라의 ___쪽에 있는 도시이다.", "남서", "지리", "lower"],
  ["대구는 우리나라의 ___쪽에 있는 도시이다.", "남동", "지리", "lower"],
  ["약속을 잘 지키는 것은 ___있는 행동이다.", "책임", "인권", "lower"],
  ["친구와 싸웠을 때 서로 ___하는 것이 중요하다.", "양보", "인권", "lower"],
  [
    "규칙을 정할 때는 모든 사람의 ___을 들어야 한다.",
    "의견",
    "민주주의",
    "lower",
  ],
  [
    "반장 선거에서 가장 많은 ___를 받은 사람이 당선된다.",
    "표",
    "민주주의",
    "lower",
  ],
  [
    "회의할 때 다른 사람이 말할 때는 ___을 해야 한다.",
    "경청",
    "민주주의",
    "lower",
  ],

  // ── 추가 upper 사회 ──
  [
    "무역에서 우리나라가 가장 많이 수출하는 것은 ___다.",
    "반도체",
    "경제",
    "upper",
  ],
  [
    "우리나라의 대표적인 수출 품목으로 자동차와 ___이 있다.",
    "전자제품",
    "경제",
    "upper",
  ],
  ["ASEAN은 ___아시아 국가 연합이다.", "동남", "세계", "upper"],
  ["아프리카 대륙에서 가장 긴 강은 ___이다.", "나일강", "세계", "upper"],
  ["태평양과 대서양을 연결하는 운하는 ___운하이다.", "파나마", "세계", "upper"],
  [
    "지구본에서 적도는 지구의 ___를 가로지르는 선이다.",
    "가운데",
    "세계",
    "upper",
  ],
  ["유네스코는 교육, 과학, ___를 위한 국제기구이다.", "문화", "세계", "upper"],
  ["월드컵은 ___년마다 열리는 축구 대회이다.", "4", "세계", "upper"],
  [
    "국제적십자사는 전쟁이나 재난 시 ___을 돕는 기구이다.",
    "사람",
    "세계",
    "upper",
  ],
  [
    "우리나라의 유네스코 세계기록유산으로 ___이 있다.",
    "훈민정음",
    "문화",
    "upper",
  ],

  // ── 추가 lower 사회 - 우리 고장/교통/공공기관 ──
  ["지도의 기호를 모아 놓은 것을 ___라 한다.", "범례", "지리", "lower"],
  [
    "우리 동네에서 길을 건널 때 ___등을 보고 건넌다.",
    "신호",
    "지역사회",
    "lower",
  ],
  [
    "횡단보도에서는 초록 불일 때 ___하고 건넌다.",
    "좌우확인",
    "지역사회",
    "lower",
  ],
  ["우리 동네 시장에서는 신선한 ___와 과일을 살 수 있다.", "채소",
    "지역사회",
    "lower",
  ],
  ["버스 정류장에서는 줄을 서서 ___를 기다린다.", "버스", "지역사회", "lower"],
  [
    "지하철 역에서 표를 사거나 ___를 찍고 탄다.",
    "교통카드",
    "지역사회",
    "lower",
  ],
  [
    "옛날에는 가마를 타고 다녔지만 지금은 ___를 탄다.",
    "자동차",
    "문화",
    "lower",
  ],
  ["전화기 대신 요즘은 ___으로 연락한다.", "스마트폰", "문화", "lower"],
  ["옛날에는 말을 타고 소식을 전했지만 지금은 휴대 전화 ___로 보낸다.", "문자",
    "문화",
    "lower",
  ],

  // ── 추가 upper 사회 - 경제/세계/역사 ──
  ["신용카드로 물건을 사면 나중에 ___을 내야 한다.", "대금", "경제", "upper"],
  ["은행에서 돈을 빌리면 ___를 내야 한다.", "이자", "경제", "upper"],
  [
    "경제 활동에서 정직하게 거래하는 것을 ___라 한다.",
    "공정거래",
    "경제",
    "upper",
  ],
  ["소비자 보호를 위한 기관을 ___이라(라) 한다.", "소비자원", "경제", "upper"],
  ["광고는 물건의 ___을 알리기 위해 만든다.", "장점", "경제", "lower"],
  ["독도에는 다양한 ___이 살고 있다.", "해양 생물", "지리", "both"],
  ["한라산 꼭대기에는 ___이라는(라는) 호수가 있다.", "백록담", "지리", "lower"],
  ["우리나라는 사계절이 ___한 나라이다.", "뚜렷", "지리", "lower"],
  ["세계의 3대 종교는 기독교, 이슬람교, ___다.", "불교", "세계", "upper"],
  [
    "영어를 공식 언어로 사용하는 나라 수는 ___개 이상이다.",
    "50",
    "세계",
    "upper",
  ],
  ["세계에서 인구가 두 번째로 많은 나라는 ___이다.", "중국", "세계", "upper"],
  ["아시아에서 가장 넓은 나라는 ___다.", "러시아", "세계", "upper"],
  ["조선 시대 임금이 살던 궁궐은 ___이다.", "경복궁", "역사", "lower"],
  ["고인돌은 ___시대의 무덤이다.", "청동기", "역사", "upper"],
  ["빗살무늬토기는 ___시대에 사용한 그릇이다.", "신석기", "역사", "upper"],
  ["구석기 시대 사람들은 주로 ___에서 살았다.", "동굴", "역사", "lower"],
  ["신석기 시대 사람들은 ___을 짓고 살기 시작했다.", "움집", "역사", "lower"],
  [
    "한강의 기적이란 우리나라의 빠른 ___성장을 말한다.",
    "경제",
    "역사",
    "upper",
  ],
  ["새마을 운동은 ___을 발전시키기 위한 운동이었다.", "농촌", "역사", "upper"],
  ["대한민국의 건국 이념은 ___주의이다.", "민주", "정치", "upper"],
  ["선거 때 투표소에서 사용하는 도장은 ___이다.", "기표도장", "정치", "lower"],
  [
    "우리나라의 국경일에는 3·1절, 광복절, 개천절, ___이 있다.",
    "한글날",
    "문화",
    "both",
  ],

  // ══════════════════════════════════════════════════════════════
  // ── EXPANDED SOCIAL STUDIES ITEMS (한국 지리, 민주주의 원리, 경제 기초, 한국사 주요 사건, 세계 문화)
  // ══════════════════════════════════════════════════════════════

  // ── 한국 지리 추가 (15) ──
  ["우리나라 동해안의 대표적인 도시는 ___이다.", "강릉", "지리", "lower"],
  ["전라남도의 도청 소재지는 ___이다.", "무안", "지리", "lower"],
  ["충청남도의 도청 소재지는 ___이다.", "홍성", "지리", "lower"],
  ["경상북도의 도청 소재지는 ___이다.", "안동", "지리", "lower"],
  ["우리나라에서 가장 넓은 호수는 ___다.", "소양호", "지리", "lower"],
  ["우리나라의 최동단 섬은 ___다.", "독도", "지리", "both"],
  ["우리나라의 최남단 섬은 ___다.", "마라도", "지리", "lower"],
  ["한강은 ___에서 시작하여 서해로 흐른다.", "강원도", "지리", "lower"],
  ["우리나라의 기후는 ___기후에 속한다.", "온대", "지리", "upper"],
  ["우리나라 남부 해안에는 ___이 많이 발달해 있다.", "갯벌", "지리", "lower"],
  [
    "서해안의 갯벌은 밀물 때 바닷물에 ___고 썰물 때 드러난다.",
    "잠기",
    "지리",
    "lower",
  ],
  ["제주도는 화산 활동으로 만들어진 ___섬이다.", "화산", "지리", "lower"],
  ["태백산맥은 우리나라의 ___를 이루고 있다.", "등뼈", "지리", "upper"],
  ["우리나라의 서쪽은 ___가 발달하여 농사에 좋다.", "평야", "지리", "lower"],
  ["동해안은 수심이 ___어 해수욕장이 발달했다.", "깊", "지리", "upper"],

  // ── 민주주의 원리 추가 (15) ──
  [
    "민주주의에서 국민이 주권을 가지는 것을 ___주권이라 한다.",
    "국민",
    "민주주의",
    "upper",
  ],
  [
    "모든 국민이 법 앞에 동등한 대우를 받는 것을 ___이라(라) 한다.",
    "평등",
    "민주주의",
    "lower",
  ],
  [
    "국민의 자유를 보장하는 권리를 ___이라(라) 한다.",
    "자유권",
    "민주주의",
    "upper",
  ],
  [
    "시민이 정치에 직접 참여하는 것을 ___참여라 한다.",
    "정치",
    "민주주의",
    "upper",
  ],
  [
    "선거에서 모든 사람이 한 표씩 행사하는 원칙을 ___선거라 한다.",
    "보통",
    "민주주의",
    "upper",
  ],
  [
    "선거에서 투표 내용을 비밀로 하는 것을 ___투표라 한다.",
    "비밀",
    "민주주의",
    "lower",
  ],
  [
    "국민이 의견을 자유롭게 표현하는 것을 ___의 자유라 한다.",
    "표현",
    "민주주의",
    "upper",
  ],
  [
    "정당은 같은 ___을 가진 사람들의 모임이다.",
    "정치적 뜻",
    "민주주의",
    "upper",
  ],
  [
    "대통령을 국민이 직접 뽑는 것을 ___선거라 한다.",
    "직접",
    "민주주의",
    "upper",
  ],
  [
    "학급 회의에서 발언권을 얻으려면 ___을 들어야 한다.",
    "손",
    "민주주의",
    "lower",
  ],
  [
    "회의에서 찬성과 반대 의견을 모두 듣는 것을 ___이라(라) 한다.",
    "토론",
    "민주주의",
    "lower",
  ],
  [
    "민주주의에서 다수결로 결정하되 소수의 의견도 ___한다.",
    "존중",
    "민주주의",
    "lower",
  ],
  [
    "지방자치에서 주민이 직접 투표하는 것을 ___투표라 한다.",
    "주민",
    "민주주의",
    "upper",
  ],
  [
    "촛불 집회는 국민의 ___을 표현하는 민주적 방법이다.",
    "의견",
    "민주주의",
    "upper",
  ],
  [
    "선거관리위원회는 선거가 ___하게 이루어지도록 관리한다.",
    "공정",
    "민주주의",
    "upper",
  ],

  // ── 경제 기초 추가 (15) ──
  [
    "사람들이 생활에 필요한 것을 만드는 활동을 ___이라(라) 한다.",
    "생산",
    "경제",
    "lower",
  ],
  ["물건을 사서 사용하는 것을 ___라 한다.", "소비", "경제", "lower"],
  ["돈을 벌어서 쓰고 남은 것을 ___이라(라) 한다.", "저축", "경제", "lower"],
  ["물건의 가격은 ___와 공급에 의해 결정된다.", "수요", "경제", "upper"],
  ["물건이 부족하면 가격이 ___한다.", "상승", "경제", "upper"],
  ["물건이 넘치면 가격이 ___한다.", "하락", "경제", "upper"],
  ["우리나라의 화폐에는 ___과 지폐가 있다.", "동전", "경제", "lower"],
  ["카드로 결제하면 나중에 ___에서 돈이 빠져나간다.", "통장", "경제", "lower"],
  ["세금은 국민이 나라에 내는 ___이다.", "돈", "경제", "lower"],
  ["소득세는 번 돈에 대해 내는 ___이다.", "세금", "경제", "upper"],
  ["부가가치세는 물건을 ___때 포함되어 있다.", "살", "경제", "upper"],
  ["경제 성장률이 높으면 나라가 더 ___해진다.", "부유", "경제", "upper"],
  ["실업률이 높으면 일자리가 ___하다는 뜻이다.", "부족", "경제", "upper"],
  [
    "우리나라는 ___를 많이 수출하여 경제가 성장했다.",
    "반도체",
    "경제",
    "upper",
  ],
  ["자유무역협정의 약자는 ___이다.", "FTA", "경제", "upper"],

  // ── 한국사 주요 사건 추가 (15) ──
  ["단군왕검이 고조선을 세운 해는 기원전 ___년이다.", "2333", "역사", "upper"],
  [
    "삼국 중 가장 먼저 불교를 받아들인 나라는 ___다.",
    "고구려",
    "역사",
    "upper",
  ],
  ["신라가 삼국을 통일한 해는 ___년이다.", "676", "역사", "upper"],
  ["고려를 세운 왕건의 수도는 ___이다.", "개경", "역사", "upper"],
  ["조선을 세운 이성계가 수도로 정한 곳은 ___이다.", "한양", "역사", "upper"],
  ["세종대왕이 한글을 만든 해는 ___년이다.", "1443", "역사", "upper"],
  ["임진왜란이 일어난 해는 ___년이다.", "1592", "역사", "upper"],
  ["병자호란 때 조선이 청에 항복한 곳은 ___성이다.", "남한산", "역사", "upper"],
  ["동학 농민 운동이 일어난 해는 ___년이다.", "1894", "역사", "upper"],
  ["일제 강점기는 ___년부터 1945년까지이다.", "1910", "역사", "upper"],
  [
    '3·1 운동 때 사람들이 외친 말은 "___만세"이다.',
    "대한독립",
    "역사",
    "upper",
  ],
  ["윤봉길 의사가 폭탄을 던진 곳은 ___공원이다.", "홍커우", "역사", "upper"],
  ["6·25 전쟁의 정전 협정이 체결된 곳은 ___이다.", "판문점", "역사", "upper"],
  ["1988년 서울에서 열린 국제 행사는 ___올림픽이다.", "서울", "역사", "upper"],
  [
    "2002년 한국에서 열린 국제 행사는 월드컵 ___대회이다.",
    "축구",
    "역사",
    "upper",
  ],

  // ── 세계 문화 추가 (15) ──
  [
    "인도 사람들의 인사법은 두 손을 모아 ___라고 말한다.",
    "나마스테",
    "세계",
    "upper",
  ],
  ["태국에서는 머리를 만지는 것이 ___다.", "실례", "세계", "upper"],
  ["프랑스의 유명한 미술관은 ___다.", "루브르", "세계", "upper"],
  ["미국의 유명한 자유의 여신상은 ___에 있다.", "뉴욕", "세계", "upper"],
  ["중국의 새해를 ___이라(라) 한다.", "춘절", "세계", "upper"],
  ["러시아의 전통 인형은 ___다.", "마트료시카", "세계", "upper"],
  ["영국의 유명한 시계탑은 ___이다.", "빅벤", "세계", "upper"],
  ["호주에 사는 대표적인 동물은 ___다.", "캥거루", "세계", "lower"],
  ["아프리카의 사바나에 사는 동물로 ___가 있다.", "사자", "세계", "lower"],
  ["일본의 전통 무술로 ___가 있다.", "유도", "세계", "upper"],
  ["그리스의 수도는 ___다.", "아테네", "세계", "upper"],
  ["스페인의 수도는 ___다.", "마드리드", "세계", "upper"],
  ["뉴질랜드의 원주민은 ___족이다.", "마오리", "세계", "upper"],
  ["세계 3대 폭포 중 하나는 ___폭포이다.", "나이아가라", "세계", "upper"],
  ["아마존 강은 ___대륙에 있다.", "남아메리카", "세계", "upper"],

  // ══════════════════════════════════════════════════════════════
  // ── DOUBLED CONTENT: NEW SOCIAL STUDIES ITEMS (300+) ───────────
  // ── 새로운 문제 유형: 시대순서, 지도읽기, 분류하기, 인과관계 포함
  // ══════════════════════════════════════════════════════════════

  // ── 역사 - 시대순서 ──
  [
    "한국사 시대 순서: 구석기→신석기→청동기→___→삼국시대",
    "철기",
    "역사",
    "upper",
  ],
  [
    "한국사 시대 순서: 삼국시대→통일신라(남북국)→고려→___→대한민국",
    "조선",
    "역사",
    "upper",
  ],
  [
    "조선 전기 사건 순서: 건국→한글 창제→___→임진왜란",
    "경국대전",
    "역사",
    "upper",
  ],
  [
    "근현대사 순서: 3·1 운동→임시정부→광복→___→6·25 전쟁",
    "정부 수립",
    "역사",
    "upper",
  ],
  [
    "문화유산 순서: 고인돌(청동기)→___탑(신라)→팔만대장경(고려)→한글(조선)",
    "석가",
    "역사",
    "upper",
  ],
  [
    "삼국 건국 순서: 고구려(기원전 37)→___→신라(기원전 57 또는 후)",
    "백제(기원전 18)",
    "역사",
    "upper",
  ],
  [
    "대한민국 민주화 순서: 4·19 혁명→5·18 민주화 운동→___→촛불 집회",
    "6월 민주항쟁",
    "역사",
    "upper",
  ],
  [
    "한국 전쟁 순서: 북한 침공→낙동강 방어→___상륙→중국군 참전",
    "인천",
    "역사",
    "upper",
  ],

  // ── 역사 - 인과관계 ──
  [
    "3·1 운동이 일어난 이유는 일제의 ___때문이었다.",
    "식민 통치",
    "역사",
    "upper",
  ],
  [
    "임진왜란이 일어난 이유는 일본이 ___을 침략했기 때문이다.",
    "조선",
    "역사",
    "upper",
  ],
  [
    "삼국 통일이 가능했던 이유는 신라가 ___와 동맹했기 때문이다.",
    "당나라",
    "역사",
    "upper",
  ],
  [
    "고려가 금속활자를 만든 이유는 ___을 널리 퍼뜨리기 위해서이다.",
    "불교 경전",
    "역사",
    "upper",
  ],
  [
    "조선이 성리학을 중시한 이유는 유교적 ___를 세우기 위해서이다.",
    "질서",
    "역사",
    "upper",
  ],
  ["동학 농민 운동은 백성을 괴롭히던 ___에 대한 불만으로 일어났다.", "탐관오리",
    "역사",
    "upper",
  ],

  // ── 역사 - 분류하기 ──
  ["경복궁, 창덕궁, 덕수궁은 모두 조선의 ___이다.", "궁궐", "역사", "lower"],
  ["고인돌, 비파형 동검은 모두 ___시대의 유물이다.", "청동기", "역사", "upper"],
  [
    "빗살무늬토기, 뼈도구는 모두 ___시대의 유물이다.",
    "신석기",
    "역사",
    "upper",
  ],
  [
    "측우기, 앙부일구, 혼천의는 모두 ___대왕이 만든 과학 기구이다.",
    "세종",
    "역사",
    "upper",
  ],

  // ── 역사 추가 (lower) ──
  [
    "옛날 사람들이 음식을 저장하기 위해 만든 그릇을 ___라 한다.",
    "토기",
    "역사",
    "lower",
  ],
  ["돌을 갈아서 만든 도구를 ___석기라 한다.", "간", "역사", "lower"],
  ["옛날에 나라를 다스리는 사람을 ___이라(라) 했다.", "왕", "역사", "lower"],
  [
    "옛날 사람들은 농사를 짓기 위해 ___가에 모여 살았다.",
    "강",
    "역사",
    "lower",
  ],
  ["경주에 있는 큰 무덤을 ___이라(라) 한다.", "고분", "역사", "lower"],
  ["석굴암 안에 있는 큰 불상을 ___이라(라) 한다.", "본존불", "역사", "lower"],

  // ── 역사 추가 (upper) ──
  ["갑오개혁으로 ___제도가 폐지되었다.", "신분", "역사", "upper"],
  ["조선 시대 실학자 정약용이 만든 기계는 ___다.", "거중기", "역사", "upper"],
  ["대한민국 임시정부의 초대 대통령은 ___이다.", "이승만", "역사", "upper"],
  ["4·19 혁명으로 ___대통령이 물러났다.", "이승만", "역사", "upper"],
  ["5·18 민주화 운동은 ___년에 일어났다.", "1980", "역사", "upper"],
  ["6월 민주항쟁은 ___년에 일어났다.", "1987", "역사", "upper"],
  ["한일강제병합조약이 체결된 해는 ___년이다.", "1910", "역사", "upper"],

  // ── 지리 - 지도읽기 ──
  ["지도에서 위쪽은 ___쪽을 나타낸다.", "북", "지리", "lower"],
  ["지도에서 아래쪽은 ___쪽을 나타낸다.", "남", "지리", "lower"],
  ["지도에서 오른쪽은 ___쪽을 나타낸다.", "동", "지리", "lower"],
  ["지도에서 왼쪽은 ___쪽을 나타낸다.", "서", "지리", "lower"],
  ["등고선 간격이 좁으면 경사가 ___하다.", "급", "지리", "upper"],
  ["등고선 간격이 넓으면 경사가 ___하다.", "완만", "지리", "upper"],
  ["축척이 1:50000이면 지도에서 1cm는 실제 ___m이다.", "500", "지리", "upper"],
  ["지도에서 학교는 한자 ___ 자 모양의 기호로 나타낸다.", "文",
    "지리",
    "lower",
  ],
  ["지도에서 논을 나타내는 기호는 ___모양이다.", "벼이삭", "지리", "lower"],
  ["지도에서 산을 나타내는 기호는 ___모양이다.", "삼각형", "지리", "lower"],
  ["위성 사진으로 땅의 ___을 자세히 볼 수 있다.", "모습", "지리", "lower"],

  // ── 지리 - 분류하기 ──
  ["서울, 부산, 인천, 대구는 모두 ___시이다.", "광역", "지리", "upper"],
  ["세종, 제주는 모두 ___자치시/도이다.", "특별", "지리", "upper"],
  ["경기도, 강원도, 충청도는 모두 ___다.", "도", "지리", "lower"],
  [
    "한강, 낙동강, 금강, 영산강은 모두 우리나라의 ___이다.",
    "4대 강",
    "지리",
    "lower",
  ],
  ["논, 밭, 과수원은 모두 ___에 사용되는 땅이다.", "농업", "지리", "lower"],

  // ── 지리 - 인과관계 ──
  [
    "서해안에 갯벌이 발달한 이유는 해안의 경사가 ___하기 때문이다.",
    "완만",
    "지리",
    "upper",
  ],
  ["동해안에는 고운 ___사장이 많아 해수욕장이 많다.", "모래",
    "지리",
    "upper",
  ],
  [
    "제주도에 돌이 많은 이유는 ___활동으로 만들어졌기 때문이다.",
    "화산",
    "지리",
    "lower",
  ],
  [
    "대도시에 사람이 많이 모이는 이유는 일자리와 편의시설이 ___기 때문이다.",
    "많",
    "지리",
    "upper",
  ],
  [
    "우리나라 서쪽에 평야가 많은 이유는 강이 ___해로 흐르며 흙을 쌓았기 때문이다.",
    "서",
    "지리",
    "upper",
  ],

  // ── 지리 추가 ──
  ["우리나라의 기후 특징은 여름에 덥고 ___하다.", "습", "지리", "upper"],
  ["우리나라의 겨울 기후 특징은 춥고 ___하다.", "건조", "지리", "upper"],
  ["남해안은 ___식 해안으로 섬이 많다.", "다도해", "지리", "upper"],
  ["충청도의 대표적인 평야는 ___평야이다.", "내포", "지리", "upper"],
  ["전라도의 대표적인 평야는 ___평야이다.", "호남", "지리", "lower"],
  ["우리나라 최북단 영토는 ___도이다.", "함경북", "지리", "upper"],
  ["강원도의 특산물로 ___가 유명하다.", "감자", "지리", "lower"],
  ["제주도의 특산물로 ___이 유명하다.", "감귤", "지리", "lower"],

  // ── 경제 - 인과관계 ──
  [
    "물건이 귀하면 가격이 ___아지는 이유는 수요보다 공급이 적기 때문이다.",
    "올라",
    "경제",
    "upper",
  ],
  ["저축을 하면 ___를 받을 수 있다.", "이자", "경제", "lower"],
  [
    "무역을 하는 이유는 나라마다 잘 만드는 물건이 ___기 때문이다.",
    "다르",
    "경제",
    "upper",
  ],
  [
    "세금을 내는 이유는 나라의 ___을 운영하기 위해서이다.",
    "살림",
    "경제",
    "lower",
  ],
  ["환율이 오르면 수입품의 가격이 ___한다.", "상승", "경제", "upper"],
  [
    "경쟁이 있으면 기업이 더 좋은 ___을 만들려고 노력한다.",
    "품질",
    "경제",
    "upper",
  ],

  // ── 경제 - 분류하기 ──
  ["농업, 어업, 광업은 모두 ___산업이다.", "1차", "경제", "upper"],
  ["제조업, 건설업은 모두 ___산업이다.", "2차", "경제", "upper"],
  ["서비스업, 금융업은 모두 ___산업이다.", "3차", "경제", "upper"],
  ["동전, 지폐, 수표는 모두 ___의 종류이다.", "화폐", "경제", "lower"],
  [
    "체크카드, 신용카드, 모바일 페이는 모두 ___결제 수단이다.",
    "전자",
    "경제",
    "upper",
  ],

  // ── 경제 추가 (lower) ──
  ["시장에서 물건의 가격을 깎는 것을 ___이라(라) 한다.", "흥정", "경제", "lower"],
  ["같은 물건이라도 장소에 따라 ___이 다르다.", "가격", "경제", "lower"],
  ["전통 시장에서 물건을 사면 ___이 싸다.", "가격", "경제", "lower"],
  [
    "필요한 것을 먼저 사고 남은 돈으로 원하는 것을 사는 것이 ___적 소비이다.",
    "합리",
    "경제",
    "lower",
  ],

  // ── 경제 추가 (upper) ──
  ["중앙은행이 하는 일은 ___를 발행하는 것이다.", "화폐", "경제", "upper"],
  ["한국은행은 우리나라의 ___은행이다.", "중앙", "경제", "upper"],
  ["주식은 기업의 ___을 나눈 것이다.", "소유권", "경제", "upper"],
  ["보험은 미래의 ___에 대비하는 것이다.", "위험", "경제", "upper"],
  ["창업은 새로운 ___을 만드는 것이다.", "사업", "경제", "upper"],

  // ── 정치 - 인과관계 ──
  [
    "삼권분립이 필요한 이유는 한 곳에 권력이 ___되는 것을 막기 위해서이다.",
    "집중",
    "정치",
    "upper",
  ],
  [
    "투표가 중요한 이유는 국민의 ___을 정치에 반영하기 위해서이다.",
    "의견",
    "정치",
    "upper",
  ],
  [
    "헌법이 최고 법인 이유는 모든 법의 ___가 되기 때문이다.",
    "근거",
    "정치",
    "upper",
  ],
  [
    "지방자치가 필요한 이유는 지역의 ___에 맞는 정치를 하기 위해서이다.",
    "특성",
    "정치",
    "upper",
  ],

  // ── 정치 - 분류하기 ──
  ["입법부, 행정부, 사법부는 ___분립의 세 기관이다.", "삼권", "정치", "upper"],
  [
    "대통령 선거, 총선거, 지방선거는 모두 ___의 종류이다.",
    "선거",
    "정치",
    "upper",
  ],
  [
    "자유권, 평등권, 참정권, 청구권은 모두 ___의 종류이다.",
    "기본권",
    "정치",
    "upper",
  ],
  ["납세, 국방, 교육, 근로는 모두 국민의 ___다.", "의무", "정치", "upper"],

  // ── 정치 추가 ──
  [
    "탄핵은 대통령이 법을 어겼을 때 ___을 물을 수 있는 제도이다.",
    "책임",
    "정치",
    "upper",
  ],
  ["국민청원은 국민이 정부에 ___을 요청하는 것이다.", "정책", "정치", "upper"],
  ["공익은 사회 전체의 ___을 뜻한다.", "이익", "정치", "lower"],
  ["공정한 선거를 위해 선거 운동에는 ___이 있다.", "규칙", "정치", "upper"],

  // ── 문화 - 분류하기 ──
  ["가야금, 거문고, 해금은 모두 ___악기이다.", "현", "문화", "lower"],
  ["대금, 피리, 단소는 모두 ___악기이다.", "관", "문화", "lower"],
  ["장구, 북, 꽹과리, 징은 모두 ___악기이다.", "타", "문화", "lower"],
  [
    "한복, 기모노, 치파오, 사리는 모두 각 나라의 ___의복이다.",
    "전통",
    "문화",
    "lower",
  ],
  ["설날, 추석, 단오는 모두 우리나라의 ___이다.", "전통 명절", "문화", "lower"],

  // ── 문화 - 인과관계 ──
  [
    "한옥에 온돌이 있는 이유는 겨울에 ___게 지내기 위해서이다.",
    "따뜻하",
    "문화",
    "lower",
  ],
  [
    "한옥에 대청마루가 있는 이유는 여름에 ___게 지내기 위해서이다.",
    "시원하",
    "문화",
    "lower",
  ],
  ["김장은 겨울 동안 먹을 ___를 한꺼번에 담그는 일이다.", "김치",
    "문화",
    "lower",
  ],
  [
    "전통 혼례에서 기러기를 주는 이유는 ___을 상징하기 때문이다.",
    "평생의 약속",
    "문화",
    "upper",
  ],

  // ── 문화 추가 ──
  ["농악은 농사를 지으며 연주하는 ___이다.", "음악", "문화", "lower"],
  [
    "풍물놀이에서 상모를 돌리는 것을 ___돌리기라 한다.",
    "상모",
    "문화",
    "lower",
  ],
  ["강강술래는 정월 대보름이나 ___ 밤에 하던 전통 놀이이다.", "추석",
    "문화",
    "lower",
  ],
  [
    "우리나라 전통 그림 중 자연을 그린 것을 ___화라 한다.",
    "산수",
    "문화",
    "upper",
  ],
  ["도자기에 비취색 유약을 입힌 것을 ___자라 한다.", "청", "문화", "upper"],
  ["고려청자의 특별한 기법은 ___기법이다.", "상감", "문화", "upper"],
  ["한글날은 ___월 9일이다.", "10", "문화", "both"],
  ["개천절은 ___월 3일이다.", "10", "문화", "both"],
  ["삼일절은 ___월 1일이다.", "3", "문화", "both"],

  // ── 법 - 인과관계 ──
  ["법이 필요한 이유는 사회 ___를 유지하기 위해서이다.", "질서", "법", "upper"],
  [
    "교통 법규가 있는 이유는 사람들의 ___을 보호하기 위해서이다.",
    "안전",
    "법",
    "lower",
  ],
  [
    "소비자 보호법이 있는 이유는 소비자의 ___를 지키기 위해서이다.",
    "권리",
    "법",
    "upper",
  ],

  // ── 법 추가 ──
  ["국민이 세금을 내는 것은 ___의 의무이다.", "납세", "법", "upper"],
  [
    "어린이 보호구역에서 자동차는 시속 ___km 이하로 달려야 한다.",
    "30",
    "법",
    "lower",
  ],
  [
    "인터넷에서 다른 사람을 욕하는 것은 ___죄에 해당할 수 있다.",
    "모욕",
    "법",
    "upper",
  ],
  ["저작권법은 창작물의 ___를 보호하는 법이다.", "권리", "법", "upper"],

  // ── 인권 추가 ──
  [
    "유엔아동권리협약에서 어린이의 4대 권리는 생존, 보호, 발달, ___다.",
    "참여",
    "인권",
    "upper",
  ],
  ["장애인 차별 금지법은 장애인의 ___을 보호한다.", "인권", "인권", "upper"],
  [
    "성별에 관계없이 동등한 기회를 갖는 것을 ___평등이라 한다.",
    "양성",
    "인권",
    "upper",
  ],
  ["다문화 가정의 어린이도 ___을 받을 권리가 있다.", "교육", "인권", "lower"],
  ["모든 사람은 행복을 추구할 ___가 있다.", "권리", "인권", "lower"],

  // ── 세계 - 지도읽기 ──
  ["세계 지도에서 위쪽은 ___쪽이다.", "북", "세계", "lower"],
  ["세계 지도에서 적도 위쪽을 ___반구라 한다.", "북", "세계", "upper"],
  ["세계 지도에서 적도 아래쪽을 ___반구라 한다.", "남", "세계", "upper"],
  ["본초 자오선 기준 오른쪽을 ___반구라 한다.", "동", "세계", "upper"],
  ["지구본에서 가로선을 ___이라(라) 한다.", "위선", "세계", "upper"],
  ["지구본에서 세로선을 ___이라(라) 한다.", "경선", "세계", "upper"],
  ["적도에 가까울수록 기온이 ___다.", "높", "세계", "upper"],
  ["극지방에 가까울수록 기온이 ___다.", "낮", "세계", "upper"],

  // ── 세계 - 분류하기 ──
  [
    "아시아, 유럽, 아프리카, 북아메리카, 남아메리카, 오세아니아는 ___이다.",
    "6대륙",
    "세계",
    "upper",
  ],
  [
    "태평양, 대서양, 인도양, 북극해, 남극해는 ___이다.",
    "5대양",
    "세계",
    "upper",
  ],
  ["한국, 중국, 일본은 모두 ___아시아의 나라이다.", "동", "세계", "lower"],
  [
    "베트남, 태국, 인도네시아는 모두 ___아시아의 나라이다.",
    "동남",
    "세계",
    "upper",
  ],
  [
    "미국, 캐나다, 멕시코는 모두 ___아메리카의 나라이다.",
    "북",
    "세계",
    "upper",
  ],

  // ── 세계 - 인과관계 ──
  [
    "열대 지방에 열대우림이 발달한 이유는 비가 ___기 때문이다.",
    "많이 오",
    "세계",
    "upper",
  ],
  [
    "사막에 식물이 적은 이유는 비가 거의 ___기 때문이다.",
    "내리지 않",
    "세계",
    "upper",
  ],
  [
    "북극과 남극이 추운 이유는 태양 빛을 ___받기 때문이다.",
    "비스듬히 적게",
    "세계",
    "upper",
  ],
  ["시차가 생기는 이유는 지구가 ___하기 때문이다.", "자전", "세계", "upper"],

  // ── 세계 추가 ──
  ["이집트의 나일강 유역에서 ___문명이 발달했다.", "이집트", "세계", "upper"],
  ["황허강 유역에서 ___문명이 발달했다.", "중국", "세계", "upper"],
  ["인더스강 유역에서 ___문명이 발달했다.", "인더스", "세계", "upper"],
  [
    "메소포타미아 문명은 ___강 유역에서 발달했다.",
    "티그리스·유프라테스",
    "세계",
    "upper",
  ],
  ["아프리카에서 가장 높은 산은 ___산이다.", "킬리만자로", "세계", "upper"],
  ["세계에서 가장 넓은 호수는 ___해이다.", "카스피", "세계", "upper"],
  ["유럽에서 가장 긴 강은 ___강이다.", "볼가", "세계", "upper"],
  ["남극 대륙은 ___으로 덮여 있다.", "얼음", "세계", "lower"],
  ["북극은 대륙이 아니라 ___은 바다이다.", "얼어붙", "세계", "lower"],
  ["뉴질랜드의 수도는 ___이다.", "웰링턴", "세계", "upper"],
  ["멕시코의 수도는 ___시티이다.", "멕시코", "세계", "upper"],
  ["태국의 수도는 ___이다.", "방콕", "세계", "upper"],
  ["이집트의 수도는 ___다.", "카이로", "세계", "upper"],

  // ── 환경 - 인과관계 ──
  ["분리수거를 하면 자원을 다시 ___할 수 있다.", "사용", "환경", "lower"],
  ["대중교통을 이용하면 ___배출을 줄일 수 있다.", "탄소", "환경", "both"],
  [
    "음식을 남기지 않으면 음식물 ___를 줄일 수 있다.",
    "쓰레기",
    "환경",
    "lower",
  ],
  ["나무를 심으면 이산화탄소를 ___할 수 있다.", "흡수", "환경", "both"],
  ["물을 아끼면 수자원을 ___할 수 있다.", "보전", "환경", "lower"],

  // ── 환경 - 분류하기 ──
  ["홍수, 가뭄, 태풍, 지진은 모두 ___재해이다.", "자연", "환경", "lower"],
  ["대기오염, 수질오염, 토양오염은 모두 ___오염이다.", "환경", "환경", "lower"],
  ["종이, 유리, 캔, 플라스틱은 ___수거 대상이다.", "분리", "환경", "lower"],
  [
    "LED등, 고효율 가전, 단열재는 모두 에너지 ___에 도움이 된다.",
    "절약",
    "환경",
    "upper",
  ],

  // ── 환경 추가 ──
  ["텀블러를 사용하면 일회용 ___사용을 줄일 수 있다.", "컵", "환경", "lower"],
  ["장바구니를 사용하면 비닐___사용을 줄일 수 있다.", "봉지", "환경", "lower"],
  [
    "전기를 절약하려면 사용하지 않는 ___를 뽑아야 한다.",
    "플러그",
    "환경",
    "lower",
  ],
  ["빗물을 모아 쓰는 것도 물 ___에 도움이 된다.", "절약", "환경", "lower"],
  ["폐식용유는 ___으로 만들 수 있다.", "바이오디젤", "환경", "upper"],
  ["녹색 건축은 에너지를 ___하는 건물을 짓는 것이다.", "절약", "환경", "upper"],
  [
    "탄소 중립이란 탄소 배출량과 흡수량을 ___게 만드는 것이다.",
    "같",
    "환경",
    "upper",
  ],

  // ── 민주주의 추가 ──
  ["공청회는 시민의 ___을 듣는 자리이다.", "의견", "민주주의", "upper"],
  ["국민참여재판에서 시민이 ___의 역할을 한다.", "배심원", "민주주의", "upper"],
  [
    "정보공개청구는 국민이 정부의 ___를 요청하는 제도이다.",
    "정보",
    "민주주의",
    "upper",
  ],
  [
    "시민단체는 사회 문제를 해결하기 위해 만든 ___다.",
    "단체",
    "민주주의",
    "upper",
  ],
  ["학급 규칙은 모두가 함께 정해야 ___적이다.", "민주", "민주주의", "lower"],
  [
    "갈등을 해결할 때 서로의 입장을 ___하는 것이 중요하다.",
    "이해",
    "민주주의",
    "lower",
  ],

  // ── 사회문제 추가 ──
  ["고령화 사회에서는 노인 복지가 ___해진다.", "중요", "사회문제", "upper"],
  [
    "저출산 문제를 해결하기 위해 ___지원 정책을 시행한다.",
    "양육",
    "사회문제",
    "upper",
  ],
  [
    "다문화 사회에서는 서로의 문화를 ___하는 자세가 필요하다.",
    "존중",
    "사회문제",
    "upper",
  ],
  [
    "디지털 격차는 정보 기술을 사용하는 능력의 ___를 뜻한다.",
    "차이",
    "사회문제",
    "upper",
  ],
  [
    "사이버 폭력은 인터넷에서 다른 사람을 ___하는 것이다.",
    "괴롭히",
    "사회문제",
    "lower",
  ],
  [
    "개인정보를 함부로 공개하면 ___침해에 해당한다.",
    "사생활",
    "사회문제",
    "upper",
  ],

  // ── 지역사회 추가 ──
  [
    "자원봉사는 대가 없이 다른 사람을 ___은 활동이다.",
    "돕",
    "지역사회",
    "lower",
  ],
  [
    "마을 축제는 주민들이 함께 즐기는 ___행사이다.",
    "문화",
    "지역사회",
    "lower",
  ],
  [
    "이웃 간의 분쟁을 해결하는 곳을 ___위원회라 한다.",
    "분쟁조정",
    "지역사회",
    "upper",
  ],
  [
    "공동 육아는 이웃과 함께 아이를 ___하는 것이다.",
    "돌봄",
    "지역사회",
    "lower",
  ],
  [
    "마을 도서관은 주민이 함께 운영하는 ___시설이다.",
    "문화",
    "지역사회",
    "lower",
  ],
  [
    "재활용품 수거일에 맞춰 쓰레기를 ___해야 한다.",
    "분리",
    "지역사회",
    "lower",
  ],

  // ── 직업 추가 ──
  ["약을 조제하는 사람을 ___라 한다.", "약사", "직업", "lower"],
  ["배를 운전하는 사람을 ___라 한다.", "선장", "직업", "lower"],
  ["동물을 치료하는 의사를 ___의사라 한다.", "수", "직업", "lower"],
  ["그림을 그리는 사람을 ___라 한다.", "화가", "직업", "lower"],
  ["영화를 만드는 사람을 ___이라(라) 한다.", "감독", "직업", "lower"],
  [
    "노래를 부르는 것을 직업으로 하는 사람을 ___라 한다.",
    "가수",
    "직업",
    "lower",
  ],
  ["로봇을 만드는 사람을 ___공학자라 한다.", "로봇", "직업", "upper"],
  ["인공지능을 연구하는 사람을 ___연구자라 한다.", "AI", "직업", "upper"],
  ["데이터를 분석하는 사람을 ___분석가라 한다.", "데이터", "직업", "upper"],
  ["환경 문제를 해결하는 직업을 ___전문가라 한다.", "환경", "직업", "upper"],

  // ── 전통문화 추가 ──
  [
    "우리나라 전통 건축에서 기둥 위의 구조를 ___라 한다.",
    "공포",
    "전통문화",
    "upper",
  ],
  ["전통 혼례에서 신랑이 타는 것을 ___이라(라) 한다.", "말", "전통문화", "lower"],
  ["한옥의 지붕에 올리는 것을 ___라 한다.", "기와", "전통문화", "lower"],
  ["전통 장례에서 고인을 모시는 것을 ___라 한다.", "상여", "전통문화", "upper"],
  ["우리나라 전통 염색 기법을 ___이라(라) 한다.", "쪽염색", "전통문화", "upper"],
  ["한지를 이용해 만든 공예품을 ___공예라 한다.", "한지", "전통문화", "lower"],
  ["매듭을 짓는 전통 공예를 ___매듭이라 한다.", "전통", "전통문화", "lower"],
  [
    "전통 놀이 중 4개의 막대를 던지는 놀이는 ___놀이이다.",
    "윷",
    "전통문화",
    "lower",
  ],
  [
    "사물놀이의 네 악기는 각각 바람, 비, 구름, ___을 상징한다.",
    "천둥",
    "전통문화",
    "upper",
  ],
  ["아리랑은 우리나라의 대표적인 ___다.", "민요", "전통문화", "both"],
];
const SOCIAL_EXTRA: ScienceItem[] = SOC_X.map(
  ([text, answer, category, gradeGroup]) => ({
    text,
    answer,
    category,
    gradeGroup,
  }),
);

/**
 * Maps a science KnowledgeEntry to a curriculum unit string based on its category and content.
 * Only assigns units for specific textbook units; general items get no unit (always show).
 */
function assignScienceUnit(entry: KnowledgeEntry): string | undefined {
  const text = entry.text;
  const cat = entry.category;

  // 지구과학 mappings
  if (cat === "지구과학" || cat === "지구") {
    if (
      text.includes("지층") ||
      text.includes("화석") ||
      text.includes("퇴적암") ||
      text.includes("암석")
    )
      return "지층과 화석";
    if (
      text.includes("화산") ||
      text.includes("지진") ||
      text.includes("마그마") ||
      text.includes("용암")
    )
      return "화산과 지진";
    if (
      text.includes("태양계") ||
      text.includes("행성") ||
      text.includes("별자리") ||
      text.includes("북극성")
    )
      return "태양계와 별";
    if (
      text.includes("날씨") ||
      text.includes("기압") ||
      text.includes("태풍") ||
      (text.includes("계절") && text.includes("기후"))
    )
      return "날씨와 우리 생활";
    if (
      text.includes("지구") &&
      (text.includes("달") || text.includes("공전") || text.includes("자전"))
    )
      return "지구와 달의 운동";
    if (text.includes("계절") && !text.includes("날씨")) return "계절의 변화";
    if (
      text.includes("지구의 모습") ||
      text.includes("지각") ||
      text.includes("침식") ||
      (text.includes("퇴적") && !text.includes("암"))
    )
      return "지구의 모습";
  }

  // 물리 mappings
  if (cat === "물리") {
    if (
      text.includes("무게") ||
      text.includes("수평") ||
      text.includes("용수철 저울")
    )
      return "물체의 무게";
    if (text.includes("열") && (text.includes("온도") || text.includes("전달")))
      return "온도와 열";
    if (
      text.includes("속력") ||
      (text.includes("운동") &&
        (text.includes("등속") || text.includes("빠르기")))
    )
      return "물체의 운동";
    if (
      text.includes("소리") ||
      text.includes("진동") ||
      text.includes("메아리")
    )
      return "소리의 성질";
    if (
      text.includes("그림자") ||
      text.includes("렌즈") ||
      (text.includes("빛") && (text.includes("굴절") || text.includes("반사")))
    )
      return "그림자와 거울";
    if (text.includes("렌즈") || (text.includes("빛") && text.includes("렌즈")))
      return "빛과 렌즈";
  }

  // 화학 mappings
  if (cat === "화학") {
    if (
      text.includes("혼합물") ||
      text.includes("분리") ||
      text.includes("거르기")
    )
      return "혼합물의 분리";
    if (
      text.includes("상태") ||
      (text.includes("물") &&
        (text.includes("얼음") ||
          text.includes("수증기") ||
          text.includes("끓")))
    )
      return "물의 상태 변화";
    if (
      text.includes("용해") ||
      text.includes("용액") ||
      text.includes("용매") ||
      text.includes("용질")
    )
      return "용해와 용액";
    if (
      (text.includes("산") && text.includes("염기")) ||
      text.includes("리트머스")
    )
      return "산과 염기";
    if (
      text.includes("기체") &&
      (text.includes("산소") ||
        text.includes("이산화탄소") ||
        text.includes("수소"))
    )
      return "여러 가지 기체";
    if (
      text.includes("연소") ||
      text.includes("소화") ||
      (text.includes("불") && (text.includes("산소") || text.includes("탈")))
    )
      return "연소와 소화";
  }

  // 생물 mappings
  if (cat === "생물" || cat === "동물" || cat === "식물") {
    if (
      text.includes("한살이") &&
      (text.includes("나비") ||
        text.includes("개구리") ||
        text.includes("알") ||
        text.includes("번데기"))
    )
      return "동물의 한살이";
    if (
      text.includes("한살이") &&
      (text.includes("씨") ||
        text.includes("싹") ||
        text.includes("꽃") ||
        text.includes("열매"))
    )
      return "식물의 한살이";
    if (
      text.includes("다양한 생물") ||
      text.includes("균류") ||
      text.includes("미생물") ||
      text.includes("곰팡이") ||
      text.includes("세균")
    )
      return "다양한 생물과 우리 생활";
    if (
      text.includes("생물과 환경") ||
      text.includes("생태계") ||
      text.includes("먹이사슬") ||
      text.includes("먹이그물")
    )
      return "생물과 환경";
    if (
      text.includes("식물의 구조") ||
      text.includes("광합성") ||
      text.includes("증산") ||
      text.includes("엽록")
    )
      return "식물의 구조와 기능";
    if (
      text.includes("우리 몸") ||
      text.includes("심장") ||
      text.includes("혈액순환") ||
      text.includes("소화기관") ||
      text.includes("폐") ||
      (text.includes("뼈") && text.includes("근육"))
    )
      return "우리 몸의 구조와 기능";
  }

  // 인체 mappings
  if (cat === "인체" || cat === "몸") {
    return "우리 몸의 구조와 기능"; // 6학년
  }

  // ── category명 기반 보조 매핑 (기존 규칙이 못 잡은 category). ──
  // gradeGroup(lower=3~4, upper=5~6)으로 학년대를 강제해 학년대 오배치를 막는다.
  // 단원명은 SCIENCE_UNIT_SEQUENCE와 정확히 일치해야 filter*ByProgress가 동작한다.
  const upper = entry.gradeGroup === "upper"; // 5~6학년

  // 우주/천체 — 태양계와 별(5학년), 지구와 달의 운동(6학년)
  if (cat === "우주" || cat === "천체") {
    if (
      text.includes("달") &&
      (text.includes("공전") ||
        text.includes("자전") ||
        text.includes("위상") ||
        text.includes("모양"))
    )
      return "지구와 달의 운동";
    return "태양계와 별";
  }
  // 날씨 — 날씨와 우리 생활(5학년)
  if (cat === "날씨") return "날씨와 우리 생활";
  // 전기/자석 — 자석의 이용(3학년) / 전기의 작용(6학년)
  if (cat === "전기" || cat === "자석") {
    if (
      text.includes("자석") ||
      text.includes("나침반") ||
      text.includes("자기")
    )
      return "자석의 이용";
    return "전기의 작용";
  }
  // 환경/생태 — 생물과 환경(5학년)
  if (cat === "환경" || cat === "생태") return "생물과 환경";
  // 빛과 소리 — 소리의 성질(3) / 그림자와 거울(4) / 빛과 렌즈(6)
  if (cat === "빛과소리" || cat === "빛" || cat === "소리") {
    if (
      text.includes("소리") ||
      text.includes("진동") ||
      text.includes("메아리")
    )
      return "소리의 성질";
    if (
      text.includes("렌즈") ||
      text.includes("굴절") ||
      text.includes("볼록") ||
      text.includes("오목")
    )
      return "빛과 렌즈";
    if (
      text.includes("그림자") ||
      text.includes("거울") ||
      text.includes("반사")
    )
      return "그림자와 거울";
    return upper ? "빛과 렌즈" : "그림자와 거울";
  }
  // 힘과 운동 — 물체의 무게(4) / 물체의 운동(5)
  if (cat === "힘과운동" || cat === "힘" || cat === "운동") {
    if (
      text.includes("무게") ||
      text.includes("저울") ||
      text.includes("수평")
    )
      return "물체의 무게";
    return upper ? "물체의 운동" : "물체의 무게";
  }
  // 물질 — 물의 상태 변화·혼합물의 분리(4) / 물질의 성질(3)
  if (cat === "물질") {
    if (
      text.includes("상태") ||
      text.includes("수증기") ||
      text.includes("얼음") ||
      text.includes("증발") ||
      text.includes("응결") ||
      text.includes("끓")
    )
      return "물의 상태 변화";
    if (
      text.includes("혼합") ||
      text.includes("분리") ||
      text.includes("거르")
    )
      return "혼합물의 분리";
    return "물질의 성질";
  }

  return undefined;
}

export function generateSciencePool(
  grade: number,
  seed: number,
  difficulty: 1 | 2 | 3 = 2,
): KnowledgeEntry[] {
  const pool = buildPool(
    [...SCIENCE_ITEMS, ...SCIENCE_EXTRA],
    grade,
    seed,
    500,
    difficulty,
  );
  // Assign curriculum units to items based on content
  return pool.map((entry) => {
    const unit = assignScienceUnit(entry);
    if (unit) return { ...entry, unit };
    return entry;
  });
}

/**
 * Maps a social studies KnowledgeEntry to a curriculum unit string based on its category.
 * Unit names must match SOCIAL_UNIT_SEQUENCE in curriculum-sequence.ts.
 */
function assignSocialUnit(
  entry: KnowledgeEntry,
  grade: number,
): string | undefined {
  const cat = entry.category;
  // grade 인자로 학년이 확정되므로 category만으로 해당 학년의 단원에 안전히 매핑한다.
  // (단원명은 SOCIAL_UNIT_SEQUENCE와 정확히 일치해야 filterSocialByProgress가 동작)
  if (grade === 5) {
    if (cat === "지리" || cat === "환경") return "국토와 자연환경";
    if (cat === "정치" || cat === "법" || cat === "민주주의" || cat === "인권")
      return "민주주의와 인권";
    if (cat === "경제" || cat === "직업") return "경제생활과 합리적 선택";
    if (
      cat === "역사" ||
      cat === "문화" ||
      cat === "전통문화" ||
      cat === "한국사"
    )
      return "옛사람들의 삶과 문화";
    if (cat === "사회문제" || cat === "세계")
      return "사회 변화와 문화 다양성";
  } else if (grade === 6) {
    if (
      cat === "정치" ||
      cat === "법" ||
      cat === "민주주의" ||
      cat === "인권" ||
      cat === "사회문제"
    )
      return "우리나라의 정치 발전";
    if (cat === "경제" || cat === "직업") return "우리나라의 경제 발전";
    if (
      cat === "지리" ||
      cat === "문화" ||
      cat === "세계" ||
      cat === "환경" ||
      cat === "전통문화"
    )
      return "세계 여러 나라의 자연과 문화";
    if (cat === "역사" || cat === "한국사") return "통일과 한반도의 미래";
  }
  return undefined; // 지역사회(3~4학년 개념) 등은 gradeGroup 필터로 걸러지므로 보류
}

export function generateSocialPool(
  grade: number,
  seed: number,
  difficulty: 1 | 2 | 3 = 2,
): KnowledgeEntry[] {
  const pool = buildPool(
    [...SOCIAL_ITEMS, ...SOCIAL_EXTRA],
    grade,
    seed,
    500,
    difficulty,
  );
  return pool.map((entry) => {
    const unit = assignSocialUnit(entry, grade);
    if (unit) return { ...entry, unit };
    return entry;
  });
}
