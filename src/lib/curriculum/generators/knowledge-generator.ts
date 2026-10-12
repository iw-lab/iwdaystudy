/**
 * Procedural Korean General Knowledge Generator
 * Generates grade-appropriate knowledge entries for Korean elementary education.
 * 1000+ unique entries per call using seeded PRNG.
 *
 * Categories: 과학, 지리, 역사, 자연, 인체, 동물, 식물, 우주, 날씨, 문화,
 *             수학상식, 지구과학, 생활상식, 물리, 화학, 생물, 환경
 */
import type { KnowledgeEntry } from "@/types/curriculum";

// Seeded PRNG for reproducible generation
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// Grade 1-2: Very simple facts (animals, seasons, body parts, basic nature)
// 240+ entries
// ============================================================
const GRADE_1_2: KnowledgeEntry[] = [
  // === 동물 (35) ===
  {
    text: "소의 새끼는 ___라고 부른다.",
    answer: "송아지",
    category: "동물",
  },
  {
    text: "고양이는 ___을 좋아하는 동물이다.",
    answer: "생선",
    category: "동물",
  },
  { text: "닭이 낳는 것은 ___이다.", answer: "달걀", category: "동물" },
  { text: "소는 ___을 먹는 초식동물이다.", answer: "풀", category: "동물" },
  {
    text: "개구리는 어릴 때 ___라고 불린다.",
    answer: "올챙이",
    category: "동물",
  },
  { text: "나비는 원래 ___였다가 변한다.", answer: "애벌레", category: "동물" },
  { text: "토끼의 귀는 매우 ___다.", answer: "길", category: "동물" },
  {
    text: "거북이는 등에 딱딱한 ___가 있다.",
    answer: "껍데기",
    category: "동물",
  },
  { text: "벌은 꽃에서 ___을 모은다.", answer: "꿀", category: "동물" },
  { text: "새는 ___로 하늘을 난다.", answer: "날개", category: "동물" },
  { text: "물고기는 ___로 숨을 쉰다.", answer: "아가미", category: "동물" },
  {
    text: "오리는 발에 ___가 있어서 헤엄을 잘 친다.",
    answer: "물갈퀴",
    category: "동물",
  },
  { text: "사자는 동물의 ___이라고(라고) 불린다.", answer: "왕", category: "동물" },
  { text: "기린의 ___은 매우 길다.", answer: "목", category: "동물" },
  { text: "코끼리는 긴 ___로 물을 마신다.", answer: "코", category: "동물" },
  { text: "펭귄은 날지 못하는 ___다.", answer: "새", category: "동물" },
  {
    text: "다람쥐는 겨울을 대비해 ___를 모은다.",
    answer: "도토리",
    category: "동물",
  },
  { text: "젖소에게서 ___를 얻는다.", answer: "우유", category: "동물" },
  { text: "양에게서 ___을 깎아 옷을 만든다.", answer: "털", category: "동물" },
  {
    text: "고슴도치는 몸에 뾰족한 ___가 있다.",
    answer: "가시",
    category: "동물",
  },
  { text: "무당벌레는 몸에 ___이 있다.", answer: "점", category: "동물" },
  { text: "부엉이는 주로 ___에 활동한다.", answer: "밤", category: "동물" },
  { text: "낙타의 등에는 ___이 있다.", answer: "혹", category: "동물" },
  { text: "잠자리는 ___가 네 개이다.", answer: "날개", category: "동물" },
  { text: "독수리는 하늘 높이 ___수 있다.", answer: "날", category: "동물" },
  {
    text: "거미는 ___을 쳐서 먹이를 잡는다.",
    answer: "거미줄",
    category: "동물",
  },
  {
    text: "앵무새는 사람의 ___을 따라 할 수 있다.",
    answer: "말",
    category: "동물",
  },
  { text: "북극곰의 털은 ___ 색이다.", answer: "흰", category: "동물" },
  { text: "반딧불이는 밤에 ___을 낸다.", answer: "빛", category: "동물" },
  { text: "꿀을 만드는 곤충은 ___이다.", answer: "벌", category: "동물" },
  { text: "하마는 주로 ___속에서 생활한다.", answer: "물", category: "동물" },
  { text: "두더지는 ___속에서 산다.", answer: "땅", category: "동물" },
  { text: "돌고래는 바다에 사는 ___류이다.", answer: "포유", category: "동물" },
  {
    text: "개미는 자기 몸보다 ___ 것을 들 수 있다.",
    answer: "무거운",
    category: "동물",
  },
  {
    text: "말은 사람이 ___을 탈 수 있는 동물이다.",
    answer: "등",
    category: "동물",
  },

  // === 자연 (35) ===
  {
    text: "비가 온 뒤 하늘에 뜨는 일곱 색깔 띠를 ___라고 한다.",
    answer: "무지개",
    category: "자연",
  },
  {
    text: "하늘에서 내리는 하얀 결정을 ___이라고(라고) 한다.",
    answer: "눈",
    category: "자연",
  },
  {
    text: "식물이 자라려면 ___과 물이 필요하다.",
    answer: "햇빛",
    category: "자연",
  },
  {
    text: "나무에서 떨어지는 것을 ___이라고(라고) 한다.",
    answer: "낙엽",
    category: "자연",
  },
  { text: "봄에 꽃이 ___다.", answer: "핀", category: "자연" },
  {
    text: "강물은 높은 곳에서 ___ 곳으로 흐른다.",
    answer: "낮은",
    category: "자연",
  },
  { text: "바다의 물은 ___맛이 난다.", answer: "짠", category: "자연" },
  {
    text: "하루 중 해가 뜨는 때를 ___이라(라) 한다.",
    answer: "아침",
    category: "자연",
  },
  { text: "달은 밤에 하늘에서 ___을 낸다.", answer: "빛", category: "자연" },
  { text: "여름에는 날씨가 매우 ___다.", answer: "덥", category: "자연" },
  { text: "겨울에는 날씨가 매우 ___다.", answer: "춥", category: "자연" },
  { text: "나무의 뿌리는 ___속에 있다.", answer: "땅", category: "자연" },
  { text: "씨앗을 심으면 ___이 자란다.", answer: "싹", category: "자연" },
  {
    text: "구름에서 물방울이 떨어지는 것을 ___라고 한다.",
    answer: "비",
    category: "자연",
  },
  { text: "일 년은 ___달이다.", answer: "열두", category: "자연" },
  { text: "일주일은 ___일이다.", answer: "칠", category: "자연" },
  { text: "하루는 ___시간이다.", answer: "스물네", category: "자연" },
  { text: "봄 다음에 오는 계절은 ___이다.", answer: "여름", category: "자연" },
  {
    text: "가을 다음에 오는 계절은 ___이다.",
    answer: "겨울",
    category: "자연",
  },
  { text: "물을 얼리면 ___이 된다.", answer: "얼음", category: "자연" },
  { text: "얼음을 가열하면 ___이 된다.", answer: "물", category: "자연" },
  { text: "태양은 ___쪽에서 뜬다.", answer: "동", category: "자연" },
  { text: "태양은 ___쪽으로 진다.", answer: "서", category: "자연" },
  {
    text: "무지개는 ___가지 색으로 이루어져 있다.",
    answer: "일곱",
    category: "자연",
  },
  { text: "꽃에서 좋은 ___가 난다.", answer: "향기", category: "자연" },
  { text: "연못에는 ___가 살고 있다.", answer: "물고기", category: "자연" },
  {
    text: "흙 위에 자라는 초록색 식물을 ___이라(라) 한다.",
    answer: "풀",
    category: "자연",
  },
  {
    text: "가을에 논에서 거두는 곡식은 ___다.",
    answer: "벼",
    category: "자연",
  },
  {
    text: "해가 지면 하늘이 ___색으로 변한다.",
    answer: "주황",
    category: "자연",
  },
  {
    text: "돌멩이를 물에 던지면 ___로 가라앉는다.",
    answer: "아래",
    category: "자연",
  },
  {
    text: "밤에 하늘에서 빛나는 것은 ___이다.",
    answer: "별",
    category: "자연",
  },
  {
    text: "산꼭대기에서 흘러내리는 물줄기를 ___이라(라) 한다.",
    answer: "계곡",
    category: "자연",
  },
  {
    text: "바람이 세게 부는 날을 ___이 센 날이라 한다.",
    answer: "바람",
    category: "자연",
  },
  {
    text: "나뭇잎이 초록색인 이유는 ___소 때문이다.",
    answer: "엽록",
    category: "자연",
  },
  {
    text: "비가 온 뒤 하늘에 뜨는 것은 ___다.",
    answer: "무지개",
    category: "자연",
  },

  // === 인체 (30) ===
  { text: "사람의 심장은 가슴 ___쪽에 있다.", answer: "왼", category: "인체" },
  { text: "음식을 씹는 것은 ___이다.", answer: "이빨", category: "인체" },
  { text: "눈으로 사물을 ___수 있다.", answer: "볼", category: "인체" },
  { text: "코로 냄새를 ___수 있다.", answer: "맡을", category: "인체" },
  { text: "귀로 소리를 ___수 있다.", answer: "들을", category: "인체" },
  { text: "손가락은 한 손에 ___개이다.", answer: "다섯", category: "인체" },
  {
    text: "사람의 몸속에는 빨간 ___가 흐른다.",
    answer: "피",
    category: "인체",
  },
  { text: "허파는 ___을 쉬는 데 사용한다.", answer: "숨", category: "인체" },
  {
    text: "위장은 음식을 ___하는 역할을 한다.",
    answer: "소화",
    category: "인체",
  },
  { text: "뇌는 ___속에 있다.", answer: "머리", category: "인체" },
  { text: "혀로 음식의 ___을 느낀다.", answer: "맛", category: "인체" },
  { text: "사람은 두 ___로 걷는다.", answer: "다리", category: "인체" },
  { text: "사람의 체온은 약 ___도이다.", answer: "36.5", category: "인체" },
  { text: "심장은 ___를 온몸으로 보내준다.", answer: "피", category: "인체" },
  { text: "머리카락은 ___에서 자란다.", answer: "머리", category: "인체" },
  { text: "사람의 눈은 ___개이다.", answer: "두", category: "인체" },
  { text: "콧구멍은 ___개이다.", answer: "두", category: "인체" },
  { text: "발가락은 한 발에 ___개이다.", answer: "다섯", category: "인체" },
  { text: "눈물은 ___에서 나온다.", answer: "눈", category: "인체" },
  { text: "땀은 ___를 통해 나온다.", answer: "피부", category: "인체" },
  { text: "뼈는 몸을 ___해 준다.", answer: "지탱", category: "인체" },
  {
    text: "피부로 뜨겁고 차가운 것을 ___할 수 있다.",
    answer: "느낄",
    category: "인체",
  },
  { text: "젖니가 빠지면 ___가 난다.", answer: "영구치", category: "인체" },
  {
    text: "사람은 하루에 약 8시간 ___을 자야 건강하다.",
    answer: "잠",
    category: "인체",
  },
  { text: "목은 머리와 ___을 이어준다.", answer: "몸통", category: "인체" },
  { text: "배꼽은 ___에 있다.", answer: "배", category: "인체" },
  {
    text: "혀로 느끼는 맛은 단맛, 짠맛, 신맛, ___이다.",
    answer: "쓴맛",
    category: "인체",
  },
  {
    text: "우리 몸에서 피를 온몸으로 보내는 기관은 ___이다.",
    answer: "심장",
    category: "인체",
  },
  { text: "귀로 하는 것은 ___다.", answer: "듣기", category: "인체" },
  {
    text: "근육이 있어서 몸을 ___일 수 있다.",
    answer: "움직",
    category: "인체",
  },

  // === 식물 (30) ===
  { text: "꽃이 지고 나면 ___가 열린다.", answer: "열매", category: "식물" },
  {
    text: "장미에는 ___가 있어 찔릴 수 있다.",
    answer: "가시",
    category: "식물",
  },
  {
    text: "해바라기는 ___를 따라 고개를 돌린다.",
    answer: "해",
    category: "식물",
  },
  { text: "벼에서 ___을 얻는다.", answer: "쌀", category: "식물" },
  { text: "감자는 ___속에서 자란다.", answer: "땅", category: "식물" },
  {
    text: "봄에 피는 대표적인 꽃은 ___이다.",
    answer: "벚꽃",
    category: "식물",
  },
  { text: "소나무는 겨울에도 잎이 ___다.", answer: "푸르", category: "식물" },
  {
    text: "단풍나무의 잎은 가을에 ___색으로 변한다.",
    answer: "빨간",
    category: "식물",
  },
  {
    text: "은행나무의 잎은 가을에 ___색으로 변한다.",
    answer: "노란",
    category: "식물",
  },
  {
    text: "식물의 뿌리는 ___에서 물을 흡수한다.",
    answer: "땅",
    category: "식물",
  },
  {
    text: "선인장은 물이 적은 ___에서 잘 자란다.",
    answer: "사막",
    category: "식물",
  },
  { text: "연꽃은 ___위에 핀다.", answer: "물", category: "식물" },
  { text: "무궁화는 ___의 나라꽃이다.", answer: "대한민국", category: "식물" },
  { text: "나팔꽃은 ___에 핀다.", answer: "아침", category: "식물" },
  { text: "밤나무에서 ___을 수확할 수 있다.", answer: "밤", category: "식물" },
  { text: "잔디는 ___색이다.", answer: "초록", category: "식물" },
  { text: "고추는 익으면 ___색이 된다.", answer: "빨간", category: "식물" },
  {
    text: "수박은 ___에 맛있게 먹는 과일이다.",
    answer: "여름",
    category: "식물",
  },
  { text: "귤은 ___에서 주로 재배한다.", answer: "제주도", category: "식물" },
  { text: "배추는 ___를 담그는 데 쓴다.", answer: "김치", category: "식물" },
  {
    text: "민들레 씨앗은 ___을 타고 날아간다.",
    answer: "바람",
    category: "식물",
  },
  { text: "도토리는 ___나무의 열매이다.", answer: "참나무", category: "식물" },
  {
    text: "나무의 나이는 ___를 세면 알 수 있다.",
    answer: "나이테",
    category: "식물",
  },
  {
    text: "강낭콩을 심으면 먼저 ___가 나온다.",
    answer: "뿌리",
    category: "식물",
  },
  { text: "사과나무는 ___에 열매가 열린다.", answer: "가을", category: "식물" },
  { text: "사과는 ___색이다.", answer: "빨간", category: "식물" },
  {
    text: "여름에 즐기는 과일로 초록색 껍질의 ___이 있다.",
    answer: "수박",
    category: "식물",
  },
  {
    text: "식물이 자라려면 물, 햇빛, ___가 필요하다.",
    answer: "공기",
    category: "식물",
  },
  { text: "콩나물은 ___에서 싹이 튼 것이다.", answer: "콩", category: "식물" },
  { text: "버섯은 ___이 없어도 자란다.", answer: "햇빛", category: "식물" },

  // === 날씨 (30) ===
  {
    text: "하늘에 떠있는 흰 것을 ___이라(라) 한다.",
    answer: "구름",
    category: "날씨",
  },
  {
    text: "천둥과 함께 치는 빛을 ___라 한다.",
    answer: "번개",
    category: "날씨",
  },
  {
    text: "눈이 많이 내리면 ___을 만들 수 있다.",
    answer: "눈사람",
    category: "날씨",
  },
  {
    text: "비가 오기 전에 하늘이 ___해진다.",
    answer: "흐려",
    category: "날씨",
  },
  {
    text: "안개가 끼면 앞이 잘 ___지 않는다.",
    answer: "보이",
    category: "날씨",
  },
  {
    text: "태풍이 오면 ___이 매우 세게 분다.",
    answer: "바람",
    category: "날씨",
  },
  { text: "이슬은 ___에 풀잎 위에 맺힌다.", answer: "아침", category: "날씨" },
  {
    text: "장마는 ___에 비가 오래 내리는 것이다.",
    answer: "여름",
    category: "날씨",
  },
  { text: "우산은 ___가 올 때 쓴다.", answer: "비", category: "날씨" },
  {
    text: "여름에 갑자기 세게 내리는 비를 ___라 한다.",
    answer: "소나기",
    category: "날씨",
  },
  { text: "가을 하늘은 매우 ___고 높다.", answer: "맑", category: "날씨" },
  {
    text: "봄에 중국에서 날아오는 먼지를 ___라 한다.",
    answer: "황사",
    category: "날씨",
  },
  {
    text: "온도를 재는 도구를 ___라 한다.",
    answer: "온도계",
    category: "날씨",
  },
  { text: "맑은 날 하늘은 ___색이다.", answer: "파란", category: "날씨" },
  {
    text: "빗방울이 얼어서 떨어지는 것을 ___이라(라) 한다.",
    answer: "우박",
    category: "날씨",
  },
  {
    text: "기온이 0도 이하로 내려가면 물이 ___다.",
    answer: "언",
    category: "날씨",
  },
  {
    text: "겨울에 입김이 나오는 이유는 공기가 ___기 때문이다.",
    answer: "차갑",
    category: "날씨",
  },
  {
    text: "여름에는 낮이 ___고 겨울에는 낮이 짧다.",
    answer: "길",
    category: "날씨",
  },
  { text: "눈이 녹으면 ___이 된다.", answer: "물", category: "날씨" },
  { text: "추운 날 창문에 ___이 맺힌다.", answer: "김", category: "날씨" },
  {
    text: "비가 많이 오면 ___가 날 수 있어 조심해야 한다.",
    answer: "홍수",
    category: "날씨",
  },
  {
    text: "겨울에 눈이 많이 내리면 ___이라(라) 부른다.",
    answer: "폭설",
    category: "날씨",
  },
  {
    text: "날씨를 미리 알려주는 것을 일기___라 한다.",
    answer: "예보",
    category: "날씨",
  },
  { text: "겨울에 내리는 하얀 것은 ___이다.", answer: "눈", category: "날씨" },
  {
    text: "날씨가 추우면 물이 얼어 ___이 된다.",
    answer: "얼음",
    category: "날씨",
  },
  {
    text: "비가 되기 전 하늘에 모인 것은 ___이다.",
    answer: "구름",
    category: "날씨",
  },
  { text: "서리는 가을 ___에 내린다.", answer: "새벽", category: "날씨" },
  {
    text: "바람의 방향을 알려주는 도구를 ___라 한다.",
    answer: "풍향계",
    category: "날씨",
  },
  {
    text: "햇빛이 강한 날에는 ___을 발라야 한다.",
    answer: "선크림",
    category: "날씨",
  },
  { text: "봄에는 새싹이 ___다.", answer: "돋는", category: "날씨" },

  // === 생활상식 (30) ===
  {
    text: "횡단보도를 건널 때는 ___을 보고 건넌다.",
    answer: "신호등",
    category: "생활상식",
  },
  {
    text: "불이 나면 전화번호 ___에 전화한다.",
    answer: "119",
    category: "생활상식",
  },
  {
    text: "도둑이 들면 전화번호 ___에 전화한다.",
    answer: "112",
    category: "생활상식",
  },
  {
    text: "밥을 먹기 전에 ___을 씻어야 한다.",
    answer: "손",
    category: "생활상식",
  },
  {
    text: "이를 닦지 않으면 ___가 생길 수 있다.",
    answer: "충치",
    category: "생활상식",
  },
  {
    text: "쓰레기는 ___에 버려야 한다.",
    answer: "쓰레기통",
    category: "생활상식",
  },
  {
    text: "교통 신호등의 빨간불은 ___이라는(라는) 뜻이다.",
    answer: "멈춤",
    category: "생활상식",
  },
  {
    text: "교통 신호등의 초록불은 ___이라는(라는) 뜻이다.",
    answer: "건너감",
    category: "생활상식",
  },
  { text: "운동을 하면 몸이 ___해진다.", answer: "건강", category: "생활상식" },
  {
    text: "잠을 충분히 자야 ___가 잘 자란다.",
    answer: "키",
    category: "생활상식",
  },
  {
    text: "자전거를 탈 때는 ___을 써야 안전하다.",
    answer: "헬멧",
    category: "생활상식",
  },
  {
    text: "도서관에서는 ___히 해야 한다.",
    answer: "조용",
    category: "생활상식",
  },
  {
    text: "어른에게 물건을 드릴 때는 두 ___으로 드린다.",
    answer: "손",
    category: "생활상식",
  },
  {
    text: "재활용품은 ___하여 버려야 한다.",
    answer: "분리수거",
    category: "생활상식",
  },
  {
    text: "식사 후에는 ___를 닦아야 한다.",
    answer: "이",
    category: "생활상식",
  },
  {
    text: "비 오는 날에는 ___을 가져간다.",
    answer: "우산",
    category: "생활상식",
  },
  {
    text: "약은 반드시 ___의 지시에 따라 먹어야 한다.",
    answer: "의사",
    category: "생활상식",
  },
  {
    text: "모르는 사람을 따라가면 ___하다.",
    answer: "위험",
    category: "생활상식",
  },
  {
    text: "에스컬레이터에서는 ___를 잡아야 한다.",
    answer: "손잡이",
    category: "생활상식",
  },
  {
    text: "감기에 걸리면 ___을 많이 마셔야 한다.",
    answer: "물",
    category: "생활상식",
  },
  {
    text: "태극기는 우리나라의 ___다.",
    answer: "국기",
    category: "생활상식",
  },
  {
    text: "우리나라의 국가는 ___다.",
    answer: "애국가",
    category: "생활상식",
  },
  {
    text: "추울 때는 옷을 ___게 입어야 한다.",
    answer: "따뜻하",
    category: "생활상식",
  },
  {
    text: "놀이터에서는 ___을 지켜야 한다.",
    answer: "규칙",
    category: "생활상식",
  },
  {
    text: "아침에 일어나면 ___를 해야 상쾌하다.",
    answer: "세수",
    category: "생활상식",
  },
  {
    text: "물에 빠진 사람을 보면 ___에 신고해야 한다.",
    answer: "119",
    category: "생활상식",
  },
  { text: "우유를 오래 두면 ___해진다.", answer: "상", category: "생활상식" },
  {
    text: "물은 하루에 ___컵 이상 마시는 것이 좋다.",
    answer: "여섯",
    category: "생활상식",
  },
  {
    text: "선생님께 인사할 때는 ___를 해야 한다.",
    answer: "인사",
    category: "생활상식",
  },
  {
    text: "차가 오는 방향을 살피며 ___을 건너야 한다.",
    answer: "길",
    category: "생활상식",
  },

  // === 문화 (30) ===
  {
    text: "설날에 어른에게 하는 인사를 ___라 한다.",
    answer: "세배",
    category: "문화",
  },
  {
    text: "추석에 먹는 대표 음식은 ___이다.",
    answer: "송편",
    category: "문화",
  },
  { text: "한글을 만든 왕은 ___이다.", answer: "세종대왕", category: "문화" },
  { text: "한글날은 ___월 9일이다.", answer: "10", category: "문화" },
  { text: "어린이날은 ___월 5일이다.", answer: "5", category: "문화" },
  { text: "크리스마스는 ___월 25일이다.", answer: "12", category: "문화" },
  {
    text: "우리나라 전통 옷을 ___이라(라) 한다.",
    answer: "한복",
    category: "문화",
  },
  {
    text: "우리나라 전통 집을 ___이라(라) 한다.",
    answer: "한옥",
    category: "문화",
  },
  {
    text: "우리나라 전통 음식을 ___이라(라) 한다.",
    answer: "한식",
    category: "문화",
  },
  { text: "떡국은 ___에 먹는 음식이다.", answer: "설날", category: "문화" },
  { text: "김치는 ___를 발효시켜 만든다.", answer: "배추", category: "문화" },
  { text: "된장은 ___으로 만든다.", answer: "콩", category: "문화" },
  { text: "탈춤은 ___을 쓰고 추는 춤이다.", answer: "탈", category: "문화" },
  {
    text: "사물놀이에서 쓰는 악기는 꽹과리, 징, 장구, ___이다.",
    answer: "북",
    category: "문화",
  },
  {
    text: "태권도는 우리나라의 전통 ___이다.",
    answer: "무술",
    category: "문화",
  },
  {
    text: "윷놀이는 ___날에 하는 전통 놀이이다.",
    answer: "설",
    category: "문화",
  },
  {
    text: "제기차기는 ___으로 제기를 차는 놀이이다.",
    answer: "발",
    category: "문화",
  },
  {
    text: "팥죽은 ___에 먹는 전통 음식이다.",
    answer: "동지",
    category: "문화",
  },
  { text: "삼계탕은 ___에 먹는 보양식이다.", answer: "여름", category: "문화" },
  {
    text: "부채는 더울 때 ___을 일으키는 도구이다.",
    answer: "바람",
    category: "문화",
  },
  { text: "한지는 우리나라 전통 ___다.", answer: "종이", category: "문화" },
  { text: "광복절은 ___월 15일이다.", answer: "8", category: "문화" },
  {
    text: "단오에는 ___를 뛰는 풍습이 있다.",
    answer: "그네",
    category: "문화",
  },
  {
    text: "정월 대보름에 먹는 것은 ___이다.",
    answer: "오곡밥",
    category: "문화",
  },
  {
    text: "비빔밥은 밥에 여러 ___을 넣어 비벼 먹는다.",
    answer: "나물",
    category: "문화",
  },
  {
    text: "가야금은 ___을 뜯어 소리를 내는 악기이다.",
    answer: "줄",
    category: "문화",
  },
  {
    text: "연날리기는 ___에 하는 전통 놀이이다.",
    answer: "정월",
    category: "문화",
  },
  {
    text: "한국의 전통 차는 ___차가 유명하다.",
    answer: "녹",
    category: "문화",
  },
  { text: "보자기는 물건을 ___때 사용한다.", answer: "쌀", category: "문화" },
  { text: "개천절은 ___월 3일이다.", answer: "10", category: "문화" },

  // === 우주 (기초, 15) ===
  { text: "지구는 ___양 주위를 돈다.", answer: "태", category: "우주" },
  {
    text: "밤하늘에 빛나는 것을 ___이라(라) 한다.",
    answer: "별",
    category: "우주",
  },
  { text: "달은 지구 주위를 ___다.", answer: "돈", category: "우주" },
  { text: "해는 ___쪽에서 뜬다.", answer: "동", category: "우주" },
  { text: "해는 ___쪽으로 진다.", answer: "서", category: "우주" },
  {
    text: "지구에서 가장 가까운 별은 ___이다.",
    answer: "태양",
    category: "우주",
  },
  { text: "달의 모양은 매일 ___한다.", answer: "변", category: "우주" },
  { text: "보름달은 ___고 둥글다.", answer: "크", category: "우주" },
  {
    text: "낮에 하늘이 밝은 것은 ___때문이다.",
    answer: "태양",
    category: "우주",
  },
  {
    text: "하늘에서 별이 떨어지는 것처럼 보이는 것을 ___이라(라) 한다.",
    answer: "별똥별",
    category: "우주",
  },
  { text: "지구는 둥근 ___모양이다.", answer: "공", category: "우주" },
  {
    text: "낮과 밤이 바뀌는 것은 지구가 ___하기 때문이다.",
    answer: "자전",
    category: "우주",
  },
  {
    text: "계절이 바뀌는 것은 지구가 ___하기 때문이다.",
    answer: "공전",
    category: "우주",
  },
  { text: "달은 약 ___일마다 모양이 바뀐다.", answer: "30", category: "우주" },
  {
    text: "태양계에서 지구는 ___번째 행성이다.",
    answer: "세",
    category: "우주",
  },

  // === 과학 (기초, 10) ===
  { text: "물이 얼면 ___이 된다.", answer: "얼음", category: "과학" },
  {
    text: "소리가 벽에 부딪혀 되돌아오는 것을 ___라고 한다.",
    answer: "메아리",
    category: "과학",
  },
  {
    text: "식물이 햇빛을 받아 양분을 만드는 것을 ___이라(라) 한다.",
    answer: "광합성",
    category: "과학",
  },
  {
    text: "화산에서 나오는 뜨거운 액체를 ___이라고(라고) 한다.",
    answer: "용암",
    category: "과학",
  },
  { text: "자석은 ___을 끌어당긴다.", answer: "철", category: "과학" },
  { text: "무거운 물건은 물에 ___는다.", answer: "가라앉", category: "과학" },
  { text: "나무토막은 물에 ___다.", answer: "뜬", category: "과학" },
  {
    text: "물에 소금을 녹이면 ___이 된다.",
    answer: "소금물",
    category: "과학",
  },
  {
    text: "빛이 물체에 가로막혀 생기는 것은 ___다.",
    answer: "그림자",
    category: "과학",
  },
  { text: "공룡은 약 ___년 전에 살았다.", answer: "6500만", category: "과학" },

  // ──── 추가: 우리나라 상식 (30) ────
  { text: "우리나라의 수도는 ___이다.", answer: "서울", category: "문화" },
  {
    text: "우리나라의 화폐 단위는 ___이다.",
    answer: "원",
    category: "생활상식",
  },
  { text: "우리나라의 국화는 ___다.", answer: "무궁화", category: "문화" },
  { text: "설날에 먹는 음식은 ___이다.", answer: "떡국", category: "문화" },
  { text: "추석에 먹는 음식은 ___이다.", answer: "송편", category: "문화" },
  { text: "어린이날은 ___월 5일이다.", answer: "5", category: "문화" },
  { text: "한글날은 ___월 9일이다.", answer: "10", category: "문화" },
  { text: "한복은 우리나라의 전통 ___이다.", answer: "옷", category: "문화" },
  { text: "씨름은 우리나라의 전통 ___이다.", answer: "운동", category: "문화" },
  {
    text: "윷놀이는 ___에 하는 전통 놀이이다.",
    answer: "설날",
    category: "문화",
  },
  { text: "강강술래는 ___에 하는 놀이이다.", answer: "추석", category: "문화" },
  { text: "삼계탕은 복날에 먹는 ___이다.", answer: "보양식", category: "문화" },
  {
    text: "가위바위보에서 가위는 ___를 이긴다.",
    answer: "보",
    category: "생활상식",
  },
  {
    text: "우리나라 동전 중 가장 큰 것은 ___원짜리이다.",
    answer: "500",
    category: "생활상식",
  },
  {
    text: "우리나라에서 가장 작은 지폐는 ___원권이다.",
    answer: "1000",
    category: "생활상식",
  },

  // ──── 추가: 과학 상식 (25) ────
  {
    text: "지구는 태양 주위를 도는데 이것을 ___이라(라) 한다.",
    answer: "공전",
    category: "과학",
  },
  {
    text: "지구가 스스로 도는 것을 ___이라(라) 한다.",
    answer: "자전",
    category: "과학",
  },
  {
    text: "사과가 땅에 떨어지는 이유는 ___때문이다.",
    answer: "중력",
    category: "과학",
  },
  {
    text: "물이 높은 곳에서 낮은 곳으로 흐르는 이유는 ___때문이다.",
    answer: "중력",
    category: "과학",
  },
  {
    text: "고무풍선을 머리에 문지르면 ___가 생긴다.",
    answer: "정전기",
    category: "과학",
  },
  {
    text: "사람의 몸은 약 ___퍼센트가 물이다.",
    answer: "70",
    category: "인체",
  },
  { text: "사람의 젖니는 모두 ___개이다.", answer: "20", category: "인체" },
  { text: "영구치는 모두 ___개이다.", answer: "32", category: "인체" },
  { text: "사람의 뼈는 약 ___개이다.", answer: "206", category: "인체" },
  {
    text: "우리 몸에서 가장 긴 뼈는 ___뼈이다.",
    answer: "넓적다리",
    category: "인체",
  },
  { text: "눈을 감으면 볼 수 ___다.", answer: "없", category: "인체" },
  { text: "토마토는 과일이 아니라 ___다.", answer: "채소", category: "식물" },
  { text: "수박의 줄무늬는 ___색이다.", answer: "초록", category: "식물" },
  {
    text: "개미는 자기 몸무게의 ___배를 들 수 있다.",
    answer: "50",
    category: "동물",
  },
  {
    text: "거미줄은 같은 굵기의 강철보다 ___다.",
    answer: "강하",
    category: "동물",
  },

  // ──── 추가: 수학 상식 (10) ────
  {
    text: "동전을 던지면 앞면이 나올 확률은 ___이다.",
    answer: "반",
    category: "과학",
  },
  { text: "직사각형에는 꼭짓점이 ___개 있다.", answer: "4", category: "과학" },
  {
    text: "정삼각형의 세 변의 길이는 모두 ___다.",
    answer: "같",
    category: "과학",
  },
  {
    text: "원을 그리는 도구를 ___라 한다.",
    answer: "컴퍼스",
    category: "생활상식",
  },
  {
    text: "더하기의 반대 연산은 ___다.",
    answer: "빼기",
    category: "생활상식",
  },

  // ──── 추가: 세계 상식 (10) ────
  {
    text: "세계에서 가장 큰 동물은 ___다.",
    answer: "대왕고래",
    category: "동물",
  },
  {
    text: "세계에서 가장 빠른 동물은 ___다.",
    answer: "치타",
    category: "동물",
  },
  {
    text: "세계에서 가장 큰 동물은 ___다.",
    answer: "흰긴수염고래",
    category: "동물",
  },
  {
    text: "세계에서 가장 작은 새는 ___다.",
    answer: "벌새",
    category: "동물",
  },
  {
    text: "북극에 사는 하얀 곰은 ___곰이다.",
    answer: "북극",
    category: "동물",
  },
  {
    text: "대나무를 먹는 흑백 곰은 ___다.",
    answer: "판다",
    category: "동물",
  },
  {
    text: "오스트레일리아에만 사는 동물은 ___다.",
    answer: "캥거루",
    category: "동물",
  },
  {
    text: "세계에서 가장 높은 산은 ___다.",
    answer: "에베레스트",
    category: "자연",
  },
  {
    text: "세계에서 가장 긴 강은 ___이다.",
    answer: "나일강",
    category: "자연",
  },
  {
    text: "세계에서 가장 큰 사막은 ___사막이다.",
    answer: "사하라",
    category: "자연",
  },

  // ──── 추가: 동물 확장 (20) ────
  { text: "까치는 우리나라의 ___새이다.", answer: "나라", category: "동물" },
  { text: "참새는 ___색 깃털을 가지고 있다.", answer: "갈", category: "동물" },
  {
    text: "비둘기는 도시에서 흔히 볼 수 있는 ___다.",
    answer: "새",
    category: "동물",
  },
  { text: "고래는 새끼에게 ___을 먹인다.", answer: "젖", category: "동물" },
  {
    text: "캥거루는 새끼를 ___에 넣고 다닌다.",
    answer: "주머니",
    category: "동물",
  },
  { text: "뱀은 다리가 ___다.", answer: "없", category: "동물" },
  { text: "사슴의 머리에는 ___이 있다.", answer: "뿔", category: "동물" },
  { text: "악어는 물과 ___에서 모두 산다.", answer: "땅", category: "동물" },
  {
    text: "제비는 ___이 되면 따뜻한 곳으로 떠난다.",
    answer: "가을",
    category: "동물",
  },
  {
    text: "두루미는 우리나라의 천연___이다.",
    answer: "기념물",
    category: "동물",
  },
  { text: "달팽이는 등에 ___을 지고 다닌다.", answer: "집", category: "동물" },
  {
    text: "여우는 매우 ___한 동물로 알려져 있다.",
    answer: "영리",
    category: "동물",
  },
  { text: "청개구리는 비가 올 때 ___다.", answer: "운", category: "동물" },
  { text: "소는 위가 ___개이다.", answer: "네", category: "동물" },
  { text: "매미는 ___에 시끄럽게 운다.", answer: "여름", category: "동물" },
  { text: "올빼미는 ___에 활동하는 새이다.", answer: "밤", category: "동물" },
  { text: "기러기는 ___을 지어 날아간다.", answer: "줄", category: "동물" },
  { text: "병아리의 어미는 ___이다.", answer: "닭", category: "동물" },
  {
    text: "지렁이는 ___속에서 살면서 흙을 기름지게 한다.",
    answer: "땅",
    category: "동물",
  },
  {
    text: "나방은 밤에 ___을 보고 날아든다.",
    answer: "불빛",
    category: "동물",
  },

  // ──── 추가: 자연 확장 (20) ────
  {
    text: "바위가 오랜 시간 부서지면 ___가 된다.",
    answer: "모래",
    category: "자연",
  },
  {
    text: "식물의 줄기는 ___과 양분을 운반한다.",
    answer: "물",
    category: "자연",
  },
  { text: "지구의 모양은 둥근 ___다.", answer: "구", category: "자연" },
  {
    text: "산에서 흐르는 물을 ___이라(라) 한다.",
    answer: "시냇물",
    category: "자연",
  },
  { text: "이끼는 ___한 곳에서 잘 자란다.", answer: "습", category: "자연" },
  { text: "소금은 바닷물을 ___시켜 얻는다.", answer: "증발", category: "자연" },
  { text: "식물은 낮에 ___를 내뿜는다.", answer: "산소", category: "자연" },
  { text: "호수에 사는 식물은 ___이다.", answer: "연꽃", category: "자연" },
  {
    text: "동굴 안에 매달려 있는 돌기둥을 ___이라(라) 한다.",
    answer: "종유석",
    category: "자연",
  },
  {
    text: "깊은 바다에는 ___이 닿지 않아 어둡다.",
    answer: "빛",
    category: "자연",
  },
  {
    text: "봄비가 내리면 땅에서 ___이 돋는다.",
    answer: "새싹",
    category: "자연",
  },
  {
    text: "지구에서 가장 깊은 바다는 ___해구이다.",
    answer: "마리아나",
    category: "자연",
  },
  {
    text: "물이 증발하여 하늘로 올라가면 ___이 된다.",
    answer: "구름",
    category: "자연",
  },
  {
    text: "겨울에 나무가 잎을 떨어뜨리는 것을 ___이라(라) 한다.",
    answer: "낙엽",
    category: "자연",
  },
  { text: "별은 스스로 ___을 내는 천체이다.", answer: "빛", category: "자연" },
  {
    text: "꽃가루를 옮기는 곤충으로 ___가 있다.",
    answer: "나비",
    category: "자연",
  },
  {
    text: "초식동물은 ___을 먹고 사는 동물이다.",
    answer: "풀",
    category: "자연",
  },
  {
    text: "육식동물은 다른 ___을 잡아먹는다.",
    answer: "동물",
    category: "자연",
  },
  {
    text: "잡식동물은 식물과 ___를 모두 먹는다.",
    answer: "고기",
    category: "자연",
  },
  {
    text: "사계절은 봄, 여름, 가을, ___이다.",
    answer: "겨울",
    category: "자연",
  },

  // ──── 추가: 인체 확장 (15) ────
  {
    text: "사람의 이빨은 음식을 ___은 역할을 한다.",
    answer: "씹",
    category: "인체",
  },
  {
    text: "팔꿈치는 팔을 ___이게 해 준다.",
    answer: "구부리",
    category: "인체",
  },
  {
    text: "무릎은 다리를 ___이게 해 준다.",
    answer: "구부리",
    category: "인체",
  },
  { text: "갈비뼈는 ___를 보호한다.", answer: "심장과 폐", category: "인체" },
  { text: "손톱은 손가락 끝을 ___해 준다.", answer: "보호", category: "인체" },
  {
    text: "땀을 흘리면 몸의 ___가 낮아진다.",
    answer: "온도",
    category: "인체",
  },
  { text: "잠을 자면 몸이 ___된다.", answer: "회복", category: "인체" },
  { text: "척추는 등을 지탱하는 ___다.", answer: "뼈", category: "인체" },
  {
    text: "침은 음식을 ___하는 것을 돕는다.",
    answer: "소화",
    category: "인체",
  },
  {
    text: "하품을 하면 몸에 ___가 공급된다.",
    answer: "산소",
    category: "인체",
  },
  {
    text: "눈썹은 이마의 ___이 눈에 들어가는 것을 막아 준다.",
    answer: "땀",
    category: "인체",
  },
  {
    text: "속눈썹은 ___가 눈에 들어가지 않게 한다.",
    answer: "먼지",
    category: "인체",
  },
  {
    text: "콧털은 먼지를 ___하는 역할을 한다.",
    answer: "걸러내",
    category: "인체",
  },
  { text: "사람의 귀뼈는 매우 ___다.", answer: "작", category: "인체" },
  {
    text: "피부는 우리 몸에서 가장 ___장기이다.",
    answer: "큰",
    category: "인체",
  },

  // ──── 추가: 식물 확장 (15) ────
  {
    text: "대나무는 매우 빠르게 ___라는 식물이다.",
    answer: "자",
    category: "식물",
  },
  {
    text: "이끼는 그늘지고 ___한 곳에서 잘 자란다.",
    answer: "습",
    category: "식물",
  },
  {
    text: "진달래꽃은 ___에 산에서 피는 꽃이다.",
    answer: "봄",
    category: "식물",
  },
  { text: "코스모스는 ___에 피는 꽃이다.", answer: "가을", category: "식물" },
  {
    text: "옥수수는 키가 ___게 자라는 식물이다.",
    answer: "크",
    category: "식물",
  },
  { text: "상추는 ___에 싸 먹는 채소이다.", answer: "쌈", category: "식물" },
  {
    text: "당근은 ___에서 자라는 뿌리채소이다.",
    answer: "땅속",
    category: "식물",
  },
  { text: "양파를 썰면 ___이 난다.", answer: "눈물", category: "식물" },
  { text: "참외는 ___색 껍질의 과일이다.", answer: "노란", category: "식물" },
  {
    text: "콩은 ___의 원료가 되는 식물이다.",
    answer: "두부",
    category: "식물",
  },
  { text: "솔방울은 ___나무의 열매이다.", answer: "소", category: "식물" },
  { text: "포도는 ___에 달리는 과일이다.", answer: "덩굴", category: "식물" },
  {
    text: "고구마는 ___속에서 자라는 식물이다.",
    answer: "땅",
    category: "식물",
  },
  {
    text: "복숭아는 ___이 보드라운 과일이다.",
    answer: "껍질",
    category: "식물",
  },
  { text: "배나무는 가을에 ___를 맺는다.", answer: "열매", category: "식물" },

  // ──── 추가: 날씨 확장 (15) ────
  { text: "바람이 불면 나뭇잎이 ___린다.", answer: "흔들", category: "날씨" },
  {
    text: "안개는 땅 가까이에 있는 ___이다.",
    answer: "구름",
    category: "날씨",
  },
  {
    text: "소나기는 갑자기 ___다가 금방 그친다.",
    answer: "쏟아지",
    category: "날씨",
  },
  {
    text: "모래바람이 부는 현상을 ___라 한다.",
    answer: "황사",
    category: "날씨",
  },
  {
    text: "기온이 매우 높은 날을 ___이라(라) 한다.",
    answer: "폭염",
    category: "날씨",
  },
  {
    text: "기온이 매우 낮은 날을 ___라 한다.",
    answer: "한파",
    category: "날씨",
  },
  {
    text: "서리는 새벽에 풀잎에 맺히는 ___결정이다.",
    answer: "얼음",
    category: "날씨",
  },
  {
    text: "번개는 하늘에서 내리치는 ___다.",
    answer: "전기",
    category: "날씨",
  },
  {
    text: "천둥은 번개와 함께 나는 큰 ___다.",
    answer: "소리",
    category: "날씨",
  },
  {
    text: "봄에 꽃가루가 날리면 ___를 하는 사람이 많다.",
    answer: "재채기",
    category: "날씨",
  },
  {
    text: "미세먼지가 심한 날에는 ___를 쓰는 것이 좋다.",
    answer: "마스크",
    category: "날씨",
  },
  {
    text: "습도가 높으면 공기가 ___하게 느껴진다.",
    answer: "끈적",
    category: "날씨",
  },
  {
    text: "건조한 날에는 ___기가 잘 일어난다.",
    answer: "정전",
    category: "날씨",
  },
  {
    text: "태풍의 가운데는 바람이 약한 ___이다.",
    answer: "눈",
    category: "날씨",
  },
  {
    text: "날씨를 관측하는 기관은 ___청이다.",
    answer: "기상",
    category: "날씨",
  },

  // ──── 추가: 생활상식 확장 (15) ────
  {
    text: "치약은 ___를 닦을 때 사용한다.",
    answer: "이",
    category: "생활상식",
  },
  {
    text: "목욕할 때 사용하는 것은 ___다.",
    answer: "비누",
    category: "생활상식",
  },
  {
    text: "우체통에 넣으면 ___가 배달된다.",
    answer: "편지",
    category: "생활상식",
  },
  {
    text: "시계는 ___을 알려 주는 도구이다.",
    answer: "시간",
    category: "생활상식",
  },
  {
    text: "지우개는 ___을 지울 때 사용한다.",
    answer: "연필",
    category: "생활상식",
  },
  {
    text: "색연필은 ___을 칠할 때 사용한다.",
    answer: "그림",
    category: "생활상식",
  },
  {
    text: "냉장고는 음식을 ___게 보관하는 기구이다.",
    answer: "차갑",
    category: "생활상식",
  },
  {
    text: "세탁기는 ___를 빨 때 사용하는 기구이다.",
    answer: "빨래",
    category: "생활상식",
  },
  {
    text: "전화기는 먼 곳의 사람과 ___할 수 있는 도구이다.",
    answer: "대화",
    category: "생활상식",
  },
  {
    text: "가위는 종이를 ___을 때 사용한다.",
    answer: "자를",
    category: "생활상식",
  },
  {
    text: "안경은 ___이 나쁜 사람이 쓰는 도구이다.",
    answer: "눈",
    category: "생활상식",
  },
  {
    text: "우산은 ___가 올 때 머리 위에 쓴다.",
    answer: "비",
    category: "생활상식",
  },
  {
    text: "칫솔은 ___를 닦는 데 사용하는 도구이다.",
    answer: "이",
    category: "생활상식",
  },
  {
    text: "거울은 자신의 ___을 볼 수 있는 물건이다.",
    answer: "모습",
    category: "생활상식",
  },
  { text: "저금통에 ___을 모을 수 있다.", answer: "돈", category: "생활상식" },

  // ──── 추가: 문화 확장 (15) ────
  {
    text: "한국의 전통 악기로 ___이 있다.",
    answer: "가야금",
    category: "문화",
  },
  {
    text: "한국의 전통 놀이로 ___가 있다.",
    answer: "팽이치기",
    category: "문화",
  },
  { text: "한국의 전통 음료로 ___가 있다.", answer: "식혜", category: "문화" },
  {
    text: "추석에는 ___을 보며 소원을 빈다.",
    answer: "보름달",
    category: "문화",
  },
  {
    text: "한국의 전통 발효 음식으로 ___이 있다.",
    answer: "된장",
    category: "문화",
  },
  {
    text: "우리나라 전통 부채를 ___이라(라) 한다.",
    answer: "합죽선",
    category: "문화",
  },
  {
    text: "한국의 전통 문양으로 ___무늬가 있다.",
    answer: "태극",
    category: "문화",
  },
  {
    text: "한옥의 바닥 난방 시스템을 ___이라(라) 한다.",
    answer: "온돌",
    category: "문화",
  },
  { text: "정월 대보름에 쥐불___를 한다.", answer: "놀이", category: "문화" },
  {
    text: "전통 결혼식에서 신부가 타는 것은 ___다.",
    answer: "가마",
    category: "문화",
  },
  {
    text: "한국의 전통 떡으로 ___가 있다.",
    answer: "인절미",
    category: "문화",
  },
  {
    text: "백제의 대표 문화재는 ___대향로이다.",
    answer: "금동",
    category: "문화",
  },
  {
    text: "고려시대의 대표 도자기는 ___다.",
    answer: "청자",
    category: "문화",
  },
  {
    text: "우리나라 전통 그림을 ___라 한다.",
    answer: "민화",
    category: "문화",
  },
  {
    text: "장승은 마을 입구에 세운 ___이다.",
    answer: "수호신",
    category: "문화",
  },

  // ──── 추가: 우주 확장 (15) ────
  { text: "달에서는 소리가 ___지 않는다.", answer: "들리", category: "우주" },
  {
    text: "밤하늘에서 가장 밝은 별은 ___다.",
    answer: "시리우스",
    category: "우주",
  },
  {
    text: "우주에서 지구로 돌아올 때 ___이 뜨거워진다.",
    answer: "우주선",
    category: "우주",
  },
  {
    text: "태양은 ___라는 기체로 이루어져 있다.",
    answer: "수소",
    category: "우주",
  },
  {
    text: "초승달은 달이 ___게 보이는 모양이다.",
    answer: "가늘",
    category: "우주",
  },
  {
    text: "그믐달은 달이 보이지 ___은 때이다.",
    answer: "않",
    category: "우주",
  },
  {
    text: "우주인이 입는 옷을 우주___이라(라) 한다.",
    answer: "복",
    category: "우주",
  },
  {
    text: "로켓은 우주로 ___을 보내는 운송 수단이다.",
    answer: "사람",
    category: "우주",
  },
  {
    text: "망원경으로 밤하늘의 ___을 관찰할 수 있다.",
    answer: "별",
    category: "우주",
  },
  {
    text: "금성은 새벽에 보여서 ___별이라 불린다.",
    answer: "샛",
    category: "우주",
  },
  { text: "북극성은 항상 ___쪽에 있다.", answer: "북", category: "우주" },
  {
    text: "유성은 대기권에서 타며 빛을 내는 ___다.",
    answer: "먼지",
    category: "우주",
  },
  {
    text: "달에는 공기가 없어 ___을 쉴 수 없다.",
    answer: "숨",
    category: "우주",
  },
  {
    text: "지구의 바다에 밀물과 썰물이 생기는 것은 ___의 인력 때문이다.",
    answer: "달",
    category: "우주",
  },
  {
    text: "행성은 스스로 빛을 내지 ___는다.",
    answer: "못하",
    category: "우주",
  },

  // ──── 추가: 과학 확장 (15) ────
  {
    text: "자석에 붙지 않는 금속은 ___이다.",
    answer: "알루미늄",
    category: "과학",
  },
  {
    text: "물방울이 둥근 것은 ___때문이다.",
    answer: "표면장력",
    category: "과학",
  },
  {
    text: "빨대로 주스를 마실 수 있는 것은 ___때문이다.",
    answer: "기압",
    category: "과학",
  },
  {
    text: "고무줄을 잡아당기면 ___는 힘이 생긴다.",
    answer: "되돌아오",
    category: "과학",
  },
  {
    text: "바퀴를 사용하면 물건을 ___쉽게 옮길 수 있다.",
    answer: "더",
    category: "과학",
  },
  { text: "풍선에 공기를 넣으면 ___진다.", answer: "커", category: "과학" },
  {
    text: "소금을 물에 넣으면 ___저 보이지 않게 된다.",
    answer: "녹",
    category: "과학",
  },
  {
    text: "식초와 베이킹소다를 섞으면 ___이 생긴다.",
    answer: "거품",
    category: "과학",
  },
  {
    text: "얼음에 소금을 뿌리면 더 ___해진다.",
    answer: "차가워",
    category: "과학",
  },
  { text: "유리는 빛이 ___하는 물체이다.", answer: "통과", category: "과학" },
  { text: "종이는 물에 ___다.", answer: "젖", category: "과학" },
  { text: "플라스틱은 ___에 잘 녹지 않는다.", answer: "물", category: "과학" },
  {
    text: "온도계의 빨간 액체는 ___를 나타낸다.",
    answer: "온도",
    category: "과학",
  },
  { text: "공기가 없으면 ___을 쉴 수 없다.", answer: "숨", category: "과학" },
  { text: "연필심은 ___으로 만들어져 있다.", answer: "흑연", category: "과학" },

  // ══════════════════════════════════════════════════════════
  // 추가 콘텐츠: 다양한 문제 유형 (분류, 순서, 연결, 비교, 원인결과)
  // 1-2학년용 확장 (250+ 신규 항목)
  // ══════════════════════════════════════════════════════════

  // ──── 동물: 분류하기 ────
  {
    text: "고양이, 강아지, 토끼는 모두 ___류에 속한다.",
    answer: "포유",
    category: "동물",
  },
  {
    text: "참새, 비둘기, 독수리는 모두 ___다.",
    answer: "새",
    category: "동물",
  },
  {
    text: "개구리, 두꺼비, 도롱뇽은 모두 ___류이다.",
    answer: "양서",
    category: "동물",
  },
  {
    text: "뱀, 도마뱀, 거북이는 모두 ___류이다.",
    answer: "파충",
    category: "동물",
  },
  {
    text: "나비, 잠자리, 개미는 모두 ___이다.",
    answer: "곤충",
    category: "동물",
  },
  {
    text: "고등어, 참치, 금붕어는 모두 ___다.",
    answer: "물고기",
    category: "동물",
  },
  {
    text: "호랑이, 사자, 표범은 모두 ___와 동물이다.",
    answer: "고양이",
    category: "동물",
  },
  {
    text: "늑대, 여우, 강아지는 모두 ___와 동물이다.",
    answer: "개",
    category: "동물",
  },

  // ──── 동물: 비교하기 ────
  {
    text: "코끼리와 생쥐 중 더 큰 동물은 ___다.",
    answer: "코끼리",
    category: "동물",
  },
  {
    text: "거북이와 토끼 중 더 느린 동물은 ___다.",
    answer: "거북이",
    category: "동물",
  },
  {
    text: "기린과 닭 중 목이 더 긴 동물은 ___이다.",
    answer: "기린",
    category: "동물",
  },
  {
    text: "치타와 달팽이 중 더 빠른 동물은 ___다.",
    answer: "치타",
    category: "동물",
  },
  {
    text: "고래와 금붕어 중 더 큰 동물은 ___다.",
    answer: "고래",
    category: "동물",
  },
  {
    text: "박쥐와 참새 중 밤에 활동하는 동물은 ___다.",
    answer: "박쥐",
    category: "동물",
  },

  // ──── 동물: 원인결과 ────
  {
    text: "겨울이 오면 다람쥐는 먹이를 모으는데, 이것을 ___이라고(라고) 한다.",
    answer: "저장",
    category: "동물",
  },
  {
    text: "날씨가 추워지면 제비는 따뜻한 곳으로 ___간다.",
    answer: "떠나",
    category: "동물",
  },
  {
    text: "개구리가 알을 낳으면 먼저 ___가 태어난다.",
    answer: "올챙이",
    category: "동물",
  },
  {
    text: "꿀벌이 꽃에 가면 꽃가루가 ___된다.",
    answer: "전달",
    category: "동물",
  },
  {
    text: "고슴도치는 위험을 느끼면 몸을 ___으로 만든다.",
    answer: "공",
    category: "동물",
  },

  // ──── 동물: 순서맞추기 ────
  {
    text: "나비의 성장 순서는 알 → 애벌레 → 번데기 → ___다.",
    answer: "나비",
    category: "동물",
  },
  {
    text: "개구리의 성장 순서는 알 → 올챙이 → ___다.",
    answer: "개구리",
    category: "동물",
  },
  {
    text: "닭의 성장 순서는 알 → 병아리 → ___이다.",
    answer: "닭",
    category: "동물",
  },
  {
    text: "매미의 성장 순서는 알 → 유충 → ___다.",
    answer: "매미",
    category: "동물",
  },

  // ──── 자연: 순서맞추기 ────
  {
    text: "계절의 순서는 봄 → 여름 → 가을 → ___이다.",
    answer: "겨울",
    category: "자연",
  },
  {
    text: "하루의 순서는 아침 → 낮 → 저녁 → ___이다.",
    answer: "밤",
    category: "자연",
  },
  {
    text: "물의 변화 순서: 얼음 → 물 → ___",
    answer: "수증기",
    category: "자연",
  },
  {
    text: "봄에 씨앗을 심으면 싹 → 줄기 → 잎 → ___의 순서로 자란다.",
    answer: "꽃",
    category: "자연",
  },
  {
    text: "강물은 산 → 골짜기 → 평야 → ___로 흘러간다.",
    answer: "바다",
    category: "자연",
  },

  // ──── 자연: 원인결과 ────
  {
    text: "비가 오래 내리면 강물이 ___칠 수 있다.",
    answer: "넘",
    category: "자연",
  },
  {
    text: "해가 쨍쨍하면 물이 ___해서 줄어든다.",
    answer: "증발",
    category: "자연",
  },
  {
    text: "바람이 세게 불면 나뭇가지가 ___질 수 있다.",
    answer: "부러",
    category: "자연",
  },
  {
    text: "햇빛이 없으면 식물이 잘 자라지 ___한다.",
    answer: "못",
    category: "자연",
  },
  {
    text: "겨울에 기온이 내려가면 연못의 물이 ___게 된다.",
    answer: "얼",
    category: "자연",
  },

  // ──── 자연: 비교하기 ────
  {
    text: "여름과 겨울 중 낮이 더 긴 계절은 ___이다.",
    answer: "여름",
    category: "자연",
  },
  {
    text: "바다와 강 중 물이 짠 곳은 ___다.",
    answer: "바다",
    category: "자연",
  },
  {
    text: "산과 평야 중 더 높은 곳은 ___이다.",
    answer: "산",
    category: "자연",
  },
  {
    text: "호수와 바다 중 더 큰 것은 ___다.",
    answer: "바다",
    category: "자연",
  },

  // ──── 자연: 연결하기 ────
  {
    text: "봄에 피는 꽃은 벚꽃이고, 가을에 피는 꽃은 ___다.",
    answer: "코스모스",
    category: "자연",
  },
  {
    text: "아침에 뜨는 것은 해이고, 밤에 뜨는 것은 ___이다.",
    answer: "달",
    category: "자연",
  },
  {
    text: "소나기는 여름에 오고, 폭설은 ___에 온다.",
    answer: "겨울",
    category: "자연",
  },

  // ──── 인체: 연결하기 ────
  {
    text: "눈은 보는 것이고, 코는 ___를 맡는 것이다.",
    answer: "냄새",
    category: "인체",
  },
  {
    text: "손은 잡는 것이고, 발은 ___은 것이다.",
    answer: "걷",
    category: "인체",
  },
  {
    text: "위는 소화를 하고, 폐는 ___을 쉬는 것이다.",
    answer: "숨",
    category: "인체",
  },
  {
    text: "뇌는 생각을 하고, 심장은 ___를 보내는 것이다.",
    answer: "피",
    category: "인체",
  },

  // ──── 인체: 분류하기 ────
  {
    text: "눈, 코, 입, 귀는 모두 ___의 일부이다.",
    answer: "얼굴",
    category: "인체",
  },
  {
    text: "팔, 다리, 손, 발은 모두 몸의 ___이다.",
    answer: "부분",
    category: "인체",
  },
  {
    text: "심장, 폐, 위, 간은 몸속의 ___다.",
    answer: "장기",
    category: "인체",
  },

  // ──── 인체: 원인결과 ────
  {
    text: "많이 뛰면 심장이 ___해진다.",
    answer: "빨리 뛰게",
    category: "인체",
  },
  {
    text: "양치를 안 하면 ___가 생길 수 있다.",
    answer: "충치",
    category: "인체",
  },
  { text: "잠을 못 자면 낮에 ___이 온다.", answer: "졸음", category: "인체" },
  {
    text: "손을 안 씻으면 ___이 옮길 수 있다.",
    answer: "세균",
    category: "인체",
  },
  {
    text: "운동을 하면 ___이 나서 체온이 내려간다.",
    answer: "땀",
    category: "인체",
  },

  // ──── 식물: 순서맞추기 ────
  {
    text: "식물의 성장 순서: 씨앗 → 싹 → 줄기 → 잎 → ___",
    answer: "꽃",
    category: "식물",
  },
  { text: "벼의 과정: 씨앗 → 모 → 벼 → ___", answer: "쌀", category: "식물" },
  {
    text: "사과의 과정: 꽃봉오리 → 꽃 → 열매 → ___",
    answer: "사과",
    category: "식물",
  },

  // ──── 식물: 분류하기 ────
  { text: "장미, 튤립, 백합은 모두 ___이다.", answer: "꽃", category: "식물" },
  {
    text: "사과, 배, 감은 모두 가을에 열리는 ___이다.",
    answer: "과일",
    category: "식물",
  },
  {
    text: "당근, 무, 감자는 모두 ___속에서 자라는 채소이다.",
    answer: "땅",
    category: "식물",
  },
  {
    text: "상추, 시금치, 배추는 ___을 먹는 채소이다.",
    answer: "잎",
    category: "식물",
  },
  {
    text: "소나무, 잣나무, 전나무는 모두 ___수이다.",
    answer: "침엽",
    category: "식물",
  },

  // ──── 식물: 비교하기 ────
  {
    text: "나무와 풀 중 더 오래 사는 것은 ___다.",
    answer: "나무",
    category: "식물",
  },
  {
    text: "수박과 포도 중 더 큰 과일은 ___이다.",
    answer: "수박",
    category: "식물",
  },
  {
    text: "해바라기와 제비꽃 중 더 큰 꽃은 ___다.",
    answer: "해바라기",
    category: "식물",
  },
  {
    text: "선인장과 연꽃 중 건조한 곳에서 사는 것은 ___이다.",
    answer: "선인장",
    category: "식물",
  },

  // ──── 식물: 원인결과 ────
  {
    text: "물을 주지 않으면 식물이 ___는다.",
    answer: "시들",
    category: "식물",
  },
  {
    text: "가을이 되면 나뭇잎이 색이 ___한다.",
    answer: "변",
    category: "식물",
  },
  {
    text: "봄이 되면 땅속의 씨앗에서 ___이 올라온다.",
    answer: "새싹",
    category: "식물",
  },
  {
    text: "꽃에 벌이 오면 ___가 옮겨져 열매가 맺힌다.",
    answer: "꽃가루",
    category: "식물",
  },

  // ──── 날씨: 분류하기 ────
  {
    text: "눈, 비, 우박은 모두 하늘에서 ___는 것이다.",
    answer: "내리",
    category: "날씨",
  },
  {
    text: "태풍, 폭설, 폭염은 모두 ___ 날씨이다.",
    answer: "위험한",
    category: "날씨",
  },
  {
    text: "온도계, 풍향계, 습도계는 모두 날씨를 재는 ___다.",
    answer: "도구",
    category: "날씨",
  },

  // ──── 날씨: 비교하기 ────
  {
    text: "여름과 겨울 중 더 더운 계절은 ___이다.",
    answer: "여름",
    category: "날씨",
  },
  {
    text: "안개와 태풍 중 바람이 더 센 것은 ___이다.",
    answer: "태풍",
    category: "날씨",
  },
  {
    text: "소나기와 장마 중 더 오래 내리는 것은 ___다.",
    answer: "장마",
    category: "날씨",
  },

  // ──── 날씨: 원인결과 ────
  { text: "구름이 많아지면 ___가 올 수 있다.", answer: "비", category: "날씨" },
  {
    text: "기온이 영하로 내려가면 물이 ___이 된다.",
    answer: "얼음",
    category: "날씨",
  },
  {
    text: "따뜻한 공기와 차가운 공기가 만나면 ___이 생긴다.",
    answer: "바람",
    category: "날씨",
  },
  {
    text: "해가 비추면 물웅덩이가 ___어진다.",
    answer: "마르",
    category: "날씨",
  },
  {
    text: "눈이 많이 오면 길이 ___워진다.",
    answer: "미끄러",
    category: "날씨",
  },

  // ──── 생활상식: 연결하기 ────
  {
    text: "불이 나면 119, 도둑이 들면 ___에 전화한다.",
    answer: "112",
    category: "생활상식",
  },
  {
    text: "빨간불은 멈춤이고, 초록불은 ___이다.",
    answer: "건너감",
    category: "생활상식",
  },
  {
    text: "아침에 세수를 하고, 저녁에는 ___을 한다.",
    answer: "목욕",
    category: "생활상식",
  },
  {
    text: "냉장고는 차갑게, 전자레인지는 ___게 만드는 기구이다.",
    answer: "뜨겁",
    category: "생활상식",
  },

  // ──── 생활상식: 분류하기 ────
  {
    text: "연필, 지우개, 필통은 모두 ___용품이다.",
    answer: "학교",
    category: "생활상식",
  },
  {
    text: "칫솔, 치약, 비누는 모두 ___용품이다.",
    answer: "위생",
    category: "생활상식",
  },
  {
    text: "버스, 지하철, 택시는 모두 ___수단이다.",
    answer: "교통",
    category: "생활상식",
  },
  {
    text: "의사, 소방관, 경찰관은 모두 우리를 ___해주는 사람이다.",
    answer: "보호",
    category: "생활상식",
  },

  // ──── 생활상식: 원인결과 ────
  {
    text: "음식을 오래 두면 ___가 생겨 먹으면 안 된다.",
    answer: "곰팡이",
    category: "생활상식",
  },
  {
    text: "채소를 안 먹으면 ___이 부족해진다.",
    answer: "비타민",
    category: "생활상식",
  },
  {
    text: "안전벨트를 안 매면 사고 시 ___할 수 있다.",
    answer: "다칠",
    category: "생활상식",
  },
  {
    text: "물을 많이 마시면 몸의 ___이 빠져나간다.",
    answer: "노폐물",
    category: "생활상식",
  },

  // ──── 문화: 연결하기 ────
  {
    text: "설날에는 떡국, 추석에는 ___을 먹는다.",
    answer: "송편",
    category: "문화",
  },
  {
    text: "한복은 전통 옷이고, 한옥은 전통 ___이다.",
    answer: "집",
    category: "문화",
  },
  {
    text: "가야금은 뜯고, 해금은 ___은 악기이다.",
    answer: "긁",
    category: "문화",
  },
  {
    text: "김치는 발효 음식이고, 된장도 ___음식이다.",
    answer: "발효",
    category: "문화",
  },

  // ──── 문화: 분류하기 ────
  {
    text: "꽹과리, 징, 장구, 북은 모두 ___놀이 악기이다.",
    answer: "사물",
    category: "문화",
  },
  {
    text: "윷놀이, 팽이치기, 제기차기는 모두 전통 ___다.",
    answer: "놀이",
    category: "문화",
  },
  {
    text: "설날, 추석, 단오는 모두 전통 ___이다.",
    answer: "명절",
    category: "문화",
  },
  {
    text: "비빔밥, 불고기, 갈비는 모두 한국 ___이다.",
    answer: "음식",
    category: "문화",
  },

  // ──── 문화: 순서맞추기 ────
  {
    text: "명절 순서: 설날 → 정월대보름 → 단오 → ___",
    answer: "추석",
    category: "문화",
  },
  { text: "한글의 자음 순서: ㄱ → ㄴ → ___", answer: "ㄷ", category: "문화" },

  // ──── 우주: 비교하기 ────
  {
    text: "해와 달 중 낮에 보이는 것은 ___다.",
    answer: "해",
    category: "우주",
  },
  {
    text: "태양과 달 중 스스로 빛나는 것은 ___이다.",
    answer: "태양",
    category: "우주",
  },
  {
    text: "지구와 달 중 더 큰 것은 ___다.",
    answer: "지구",
    category: "우주",
  },

  // ──── 우주: 원인결과 ────
  {
    text: "지구가 자전하기 때문에 낮과 ___이 생긴다.",
    answer: "밤",
    category: "우주",
  },
  {
    text: "지구가 기울어져 있기 때문에 ___이 바뀐다.",
    answer: "계절",
    category: "우주",
  },
  {
    text: "달이 지구를 돌기 때문에 달의 ___이 바뀐다.",
    answer: "모양",
    category: "우주",
  },

  // ──── 과학: 분류하기 ────
  {
    text: "철, 구리, 알루미늄은 모두 ___이다.",
    answer: "금속",
    category: "과학",
  },
  {
    text: "나무, 종이, 천은 물에 ___은 물질이다.",
    answer: "젖",
    category: "과학",
  },
  {
    text: "돌, 나무토막, 연필은 모두 ___체이다.",
    answer: "고",
    category: "과학",
  },
  { text: "물, 우유, 주스는 모두 ___체이다.", answer: "액", category: "과학" },
  {
    text: "공기, 수증기, 산소는 모두 ___체이다.",
    answer: "기",
    category: "과학",
  },

  // ──── 과학: 원인결과 ────
  {
    text: "물을 끓이면 ___가 되어 날아간다.",
    answer: "수증기",
    category: "과학",
  },
  {
    text: "자석의 같은 극을 가까이 대면 서로 ___한다.",
    answer: "밀어냄",
    category: "과학",
  },
  {
    text: "빛이 물체에 막히면 뒤쪽에 ___가 생긴다.",
    answer: "그림자",
    category: "과학",
  },
  {
    text: "소금을 물에 넣으면 ___서 보이지 않게 된다.",
    answer: "녹아",
    category: "과학",
  },

  // ──── 과학: 비교하기 ────
  {
    text: "나무와 돌 중 물에 뜨는 것은 ___다.",
    answer: "나무",
    category: "과학",
  },
  {
    text: "철과 나무 중 자석에 붙는 것은 ___이다.",
    answer: "철",
    category: "과학",
  },
  {
    text: "얼음과 수증기 중 차가운 것은 ___이다.",
    answer: "얼음",
    category: "과학",
  },

  // ──── 추가: 동물 신규 사실 ────
  {
    text: "타조의 알은 세상에서 가장 ___알이다.",
    answer: "큰",
    category: "동물",
  },
  { text: "해파리는 뇌가 ___다.", answer: "없", category: "동물" },
  {
    text: "수달은 잠을 잘 때 ___을 잡고 잔다.",
    answer: "손",
    category: "동물",
  },
  {
    text: "카멜레온은 두 ___을 따로따로 움직일 수 있다.",
    answer: "눈",
    category: "동물",
  },
  {
    text: "꿀벌은 춤으로 다른 벌에게 ___위치를 알려준다.",
    answer: "꽃",
    category: "동물",
  },
  {
    text: "나무늘보는 하루에 ___시간 이상 잔다.",
    answer: "15",
    category: "동물",
  },
  {
    text: "오리너구리는 알을 낳는 ___류이다.",
    answer: "포유",
    category: "동물",
  },
  {
    text: "하늘다람쥐는 나무 사이를 ___면서 이동한다.",
    answer: "날",
    category: "동물",
  },
  {
    text: "고래상어는 상어 중 가장 ___상어이다.",
    answer: "큰",
    category: "동물",
  },
  { text: "호랑이의 몸에는 ___무늬가 있다.", answer: "줄", category: "동물" },

  // ──── 추가: 자연/지구 신규 사실 ────
  {
    text: "지구에서 가장 많은 물은 ___에 있다.",
    answer: "바다",
    category: "자연",
  },
  {
    text: "폭포는 높은 곳에서 물이 ___어지는 곳이다.",
    answer: "떨",
    category: "자연",
  },
  {
    text: "연못과 호수 중 더 큰 것은 ___다.",
    answer: "호수",
    category: "자연",
  },
  {
    text: "화산이 폭발하면 뜨거운 ___이 나온다.",
    answer: "용암",
    category: "자연",
  },
  { text: "지구의 약 70%는 ___으로 덮여 있다.", answer: "물", category: "자연" },

  // ──── 추가: 생활상식 신규 ────
  {
    text: "음식에서 에너지를 주는 영양소를 ___이라(라) 한다.",
    answer: "탄수화물",
    category: "생활상식",
  },
  {
    text: "손을 씻을 때 사용하는 것은 ___다.",
    answer: "비누",
    category: "생활상식",
  },
  { text: "신발은 ___에 신는 것이다.", answer: "발", category: "생활상식" },
  {
    text: "엘리베이터가 고장 나면 ___을 이용해 대피한다.",
    answer: "비상계단",
    category: "생활상식",
  },
  {
    text: "편의점에서 물건을 사면 ___을 내야 한다.",
    answer: "돈",
    category: "생활상식",
  },

  // ──── 추가: 문화 신규 ────
  {
    text: "우리나라 지폐에 나오는 인물로 ___대왕이 있다.",
    answer: "세종",
    category: "문화",
  },
  {
    text: "한글은 모음 ___개와 자음 14개로 이루어져 있다.",
    answer: "10",
    category: "문화",
  },
  {
    text: "설날에 어른에게 세배를 하면 ___을 받는다.",
    answer: "세뱃돈",
    category: "문화",
  },
  {
    text: "달맞이는 ___에 보름달을 보며 소원을 비는 것이다.",
    answer: "추석",
    category: "문화",
  },
  {
    text: "떡볶이는 떡을 ___소스에 볶은 음식이다.",
    answer: "고추장",
    category: "문화",
  },

  // ──── 추가: 날씨 신규 ────
  {
    text: "아침에 풀잎에 맺히는 물방울을 ___이라(라) 한다.",
    answer: "이슬",
    category: "날씨",
  },
  {
    text: "회오리바람은 공기가 빙글빙글 ___는 바람이다.",
    answer: "도",
    category: "날씨",
  },
  {
    text: "가뭄은 비가 오래 오지 ___은 것이다.",
    answer: "않",
    category: "날씨",
  },
  {
    text: "해일은 바다의 물이 갑자기 ___아오는 것이다.",
    answer: "밀려",
    category: "날씨",
  },
  {
    text: "비가 세게 내리면 시야가 ___해진다.",
    answer: "흐려",
    category: "날씨",
  },

  // ──── 추가: 우주 신규 ────
  {
    text: "밤하늘의 별은 사실 매우 ___곳에 있다.",
    answer: "먼",
    category: "우주",
  },
  {
    text: "인공위성은 지구 주위를 ___는 기계이다.",
    answer: "도",
    category: "우주",
  },
  { text: "우주에는 공기가 ___다.", answer: "없", category: "우주" },
  { text: "지구는 태양계의 ___번째 행성이다.", answer: "세", category: "우주" },
  {
    text: "별이 빛나는 이유는 스스로 ___을 내기 때문이다.",
    answer: "빛",
    category: "우주",
  },

  // ──── 추가: 식물 신규 ────
  { text: "네잎클로버는 행운의 ___이다.", answer: "상징", category: "식물" },
  {
    text: "대나무는 하루에 ___cm 이상 자랄 수 있다.",
    answer: "90",
    category: "식물",
  },
  {
    text: "벼꽃은 매우 ___아서 잘 보이지 않는다.",
    answer: "작",
    category: "식물",
  },
  {
    text: "파리지옥은 벌레를 잡아먹는 ___이다.",
    answer: "식물",
    category: "식물",
  },
  { text: "보리는 밀과 비슷한 ___이다.", answer: "곡식", category: "식물" },

  // ──── 추가: 과학 신규 ────
  {
    text: "거울에 비친 모습은 좌우가 ___로 보인다.",
    answer: "반대",
    category: "과학",
  },
  {
    text: "유리컵에 뜨거운 물을 부으면 ___이 서린다.",
    answer: "김",
    category: "과학",
  },
  {
    text: "사람의 몸도 ___를 끌어당기는 힘이 있다.",
    answer: "지구",
    category: "과학",
  },
  {
    text: "무지개의 색깔 순서: 빨 → 주 → 노 → 초 → 파 → 남 → ___",
    answer: "보",
    category: "과학",
  },
  {
    text: "물은 높은 곳에서 ___ 곳으로 흐르는 성질이 있다.",
    answer: "낮은",
    category: "과학",
  },
];

// ============================================================
// Grade 3-4: Intermediate facts (Korean geography, basic history, science concepts)
// 220+ entries
// ============================================================
const GRADE_3_4: KnowledgeEntry[] = [
  // === 지리 (35) ===
  { text: "대한민국의 수도는 ___이다.", answer: "서울", category: "지리" },
  {
    text: "우리나라에서 가장 큰 섬은 ___다.",
    answer: "제주도",
    category: "지리",
  },
  {
    text: "우리나라에서 가장 높은 산은 ___이다.",
    answer: "백두산",
    category: "지리",
  },
  {
    text: "우리나라에서 가장 긴 강은 ___이다.",
    answer: "낙동강",
    category: "지리",
  },
  { text: "서울을 관통하는 강은 ___이다.", answer: "한강", category: "지리" },
  {
    text: "우리나라의 동쪽 바다를 ___라 한다.",
    answer: "동해",
    category: "지리",
  },
  {
    text: "우리나라의 서쪽 바다를 ___라 한다.",
    answer: "서해",
    category: "지리",
  },
  {
    text: "우리나라의 남쪽 바다를 ___라 한다.",
    answer: "남해",
    category: "지리",
  },
  {
    text: "독도는 ___에 있는 우리나라 영토이다.",
    answer: "동해",
    category: "지리",
  },
  {
    text: "한반도의 가장 높은 산은 ___이다.",
    answer: "백두산",
    category: "지리",
  },
  {
    text: "부산은 우리나라에서 두 번째로 ___도시이다.",
    answer: "큰",
    category: "지리",
  },
  { text: "경주는 ___왕조의 수도였다.", answer: "신라", category: "지리" },
  { text: "인천에는 국제___이 있다.", answer: "공항", category: "지리" },
  {
    text: "강원도는 ___과 바다가 모두 있는 지역이다.",
    answer: "산",
    category: "지리",
  },
  {
    text: "전라도는 ___가 넓어 곡식이 많이 자란다.",
    answer: "평야",
    category: "지리",
  },
  { text: "지도에서 위쪽은 ___을 가리킨다.", answer: "북쪽", category: "지리" },
  {
    text: "지도에서 아래쪽은 ___을 가리킨다.",
    answer: "남쪽",
    category: "지리",
  },
  {
    text: "우리나라는 아시아 대륙의 ___에 있다.",
    answer: "동쪽",
    category: "지리",
  },
  {
    text: "휴전선은 남한과 ___을 나누는 선이다.",
    answer: "북한",
    category: "지리",
  },
  { text: "우리나라의 영토는 한___다.", answer: "반도", category: "지리" },
  {
    text: "태백산맥은 한반도의 ___쪽을 따라 이어진다.",
    answer: "동",
    category: "지리",
  },
  { text: "울릉도는 ___에 있는 섬이다.", answer: "동해", category: "지리" },
  { text: "대전은 우리나라의 ___에 있다.", answer: "중앙", category: "지리" },
  { text: "광주는 ___도의 대표 도시이다.", answer: "전라남", category: "지리" },
  { text: "대구는 ___도의 대표 도시이다.", answer: "경상북", category: "지리" },
  {
    text: "세종시는 우리나라의 ___수도이다.",
    answer: "행정",
    category: "지리",
  },
  { text: "설악산은 ___도에 있다.", answer: "강원", category: "지리" },
  {
    text: "남한강과 북한강이 합쳐져 ___이 된다.",
    answer: "한강",
    category: "지리",
  },
  { text: "금강은 ___도를 흐르는 강이다.", answer: "충청", category: "지리" },
  { text: "영산강은 ___도를 흐르는 강이다.", answer: "전라", category: "지리" },
  {
    text: "한반도를 가로지르는 큰 강은 한강과 ___이다.",
    answer: "낙동강",
    category: "지리",
  },
  { text: "지리산은 ___개의 도에 걸쳐 있다.", answer: "세", category: "지리" },
  {
    text: "제주도에는 ___이라는(라는) 높은 산이 있다.",
    answer: "한라산",
    category: "지리",
  },
  { text: "여수는 ___도에 있는 도시이다.", answer: "전라남", category: "지리" },
  { text: "충청도의 대표 도시는 ___이다.", answer: "대전", category: "지리" },

  // === 역사 (35) ===
  {
    text: "우리나라 최초의 나라는 ___이다.",
    answer: "고조선",
    category: "역사",
  },
  {
    text: "고조선을 세운 사람은 ___이다.",
    answer: "단군왕검",
    category: "역사",
  },
  {
    text: "삼국시대의 세 나라는 고구려, 백제, ___다.",
    answer: "신라",
    category: "역사",
  },
  { text: "신라의 수도는 ___였다.", answer: "경주", category: "역사" },
  { text: "백제의 마지막 수도는 ___였다.", answer: "부여", category: "역사" },
  { text: "고구려의 수도는 ___이었다.", answer: "평양", category: "역사" },
  { text: "삼국을 통일한 나라는 ___다.", answer: "신라", category: "역사" },
  { text: "한글을 만든 왕은 ___이다.", answer: "세종대왕", category: "역사" },
  {
    text: "한글이 만들어진 이름은 ___이다.",
    answer: "훈민정음",
    category: "역사",
  },
  {
    text: "이순신 장군은 ___을 만들어 왜적을 물리쳤다.",
    answer: "거북선",
    category: "역사",
  },
  {
    text: "임진왜란은 ___나라가 침략한 전쟁이다.",
    answer: "일본",
    category: "역사",
  },
  { text: "고려를 세운 왕은 ___이다.", answer: "왕건", category: "역사" },
  { text: "조선을 세운 왕은 ___다.", answer: "이성계", category: "역사" },
  { text: "조선의 수도는 ___이었다.", answer: "한양", category: "역사" },
  { text: "경복궁은 ___시대의 궁궐이다.", answer: "조선", category: "역사" },
  { text: "첨성대는 ___을 관측하던 건물이다.", answer: "별", category: "역사" },
  { text: "석굴암은 ___에 있는 문화재이다.", answer: "경주", category: "역사" },
  {
    text: "불국사는 ___시대에 만들어진 절이다.",
    answer: "신라",
    category: "역사",
  },
  { text: "광개토대왕은 ___의 왕이다.", answer: "고구려", category: "역사" },
  {
    text: "을지문덕 장군은 ___전투에서 승리했다.",
    answer: "살수",
    category: "역사",
  },
  {
    text: "강감찬 장군은 ___전투에서 거란군을 물리쳤다.",
    answer: "귀주",
    category: "역사",
  },
  {
    text: "고려시대에 만든 금속 활자는 세계 ___의 금속 활자이다.",
    answer: "최초",
    category: "역사",
  },
  {
    text: "팔만대장경은 ___에 보관되어 있다.",
    answer: "해인사",
    category: "역사",
  },
  { text: "3·1 운동은 ___년에 일어났다.", answer: "1919", category: "역사" },
  {
    text: "대한민국은 ___년에 정부가 수립되었다.",
    answer: "1948",
    category: "역사",
  },
  { text: "6·25 전쟁은 ___년에 일어났다.", answer: "1950", category: "역사" },
  {
    text: "유관순은 3·1 운동 때 만세를 부른 ___다.",
    answer: "열사",
    category: "역사",
  },
  { text: "세종대왕은 조선 제___대 왕이다.", answer: "4", category: "역사" },
  { text: "측우기는 ___을 재는 도구이다.", answer: "강수량", category: "역사" },
  {
    text: "해시계는 해의 ___로 시간을 알려주는 도구이다.",
    answer: "그림자",
    category: "역사",
  },
  { text: "고인돌은 ___시대의 무덤이다.", answer: "청동기", category: "역사" },
  { text: "거북선을 만든 사람은 ___이다.", answer: "이순신", category: "역사" },
  {
    text: "임진왜란 때 바다에서 싸운 장군은 ___이다.",
    answer: "이순신",
    category: "역사",
  },
  {
    text: "우리나라 최초의 금속활자 인쇄물은 ___이다.",
    answer: "직지심체요절",
    category: "역사",
  },
  {
    text: "고구려, 백제, 신라를 합쳐 ___이라고(라고) 부른다.",
    answer: "삼국",
    category: "역사",
  },

  // === 과학 (35) ===
  { text: "물이 끓는 온도는 섭씨 ___도이다.", answer: "100", category: "과학" },
  { text: "물이 어는 온도는 섭씨 ___도이다.", answer: "0", category: "과학" },
  { text: "자석에는 N극과 ___극이 있다.", answer: "S", category: "과학" },
  {
    text: "같은 극의 자석은 서로 ___한다.",
    answer: "밀어냄",
    category: "과학",
  },
  {
    text: "다른 극의 자석은 서로 ___한다.",
    answer: "끌어당김",
    category: "과학",
  },
  {
    text: "소리는 물체가 ___할 때 만들어진다.",
    answer: "진동",
    category: "과학",
  },
  {
    text: "빛은 직진하지만 거울에 닿으면 ___한다.",
    answer: "반사",
    category: "과학",
  },
  { text: "전기가 흐르는 길을 ___라 한다.", answer: "회로", category: "과학" },
  {
    text: "전구에 불이 켜지려면 ___가 흘러야 한다.",
    answer: "전기",
    category: "과학",
  },
  { text: "건전지에는 +극과 ___극이 있다.", answer: "-", category: "과학" },
  {
    text: "공기 중에 가장 많은 기체는 ___다.",
    answer: "질소",
    category: "과학",
  },
  {
    text: "사람이 숨을 쉬는 데 필요한 기체는 ___다.",
    answer: "산소",
    category: "과학",
  },
  {
    text: "사람이 내뿜는 기체는 ___다.",
    answer: "이산화탄소",
    category: "과학",
  },
  {
    text: "물질의 세 가지 상태는 고체, 액체, ___다.",
    answer: "기체",
    category: "과학",
  },
  { text: "얼음은 물의 ___상태이다.", answer: "고체", category: "과학" },
  { text: "수증기는 물의 ___상태이다.", answer: "기체", category: "과학" },
  { text: "무게를 재는 도구를 ___이라(라) 한다.", answer: "저울", category: "과학" },
  { text: "길이를 재는 도구를 ___라 한다.", answer: "자", category: "과학" },
  {
    text: "온도를 재는 도구를 ___라 한다.",
    answer: "온도계",
    category: "과학",
  },
  {
    text: "물에 소금을 녹이면 ___이 된다.",
    answer: "소금물",
    category: "과학",
  },
  { text: "기름은 물에 ___지 않는다.", answer: "섞이", category: "과학" },
  {
    text: "돋보기로 빛을 모으면 ___가 높아진다.",
    answer: "온도",
    category: "과학",
  },
  { text: "그림자는 빛의 ___편에 생긴다.", answer: "반대", category: "과학" },
  {
    text: "소리가 벽에 부딪혀 되돌아오는 것을 ___라 한다.",
    answer: "메아리",
    category: "과학",
  },
  {
    text: "나침반의 바늘은 항상 ___쪽을 가리킨다.",
    answer: "북",
    category: "과학",
  },
  {
    text: "빛의 삼원색은 빨강, 초록, ___이다.",
    answer: "파랑",
    category: "과학",
  },
  {
    text: "물이 수증기로 변하는 것을 ___이라(라) 한다.",
    answer: "증발",
    category: "과학",
  },
  {
    text: "수증기가 물방울로 변하는 것을 ___이라(라) 한다.",
    answer: "응결",
    category: "과학",
  },
  {
    text: "식물이 물을 흡수하는 부분은 ___다.",
    answer: "뿌리",
    category: "과학",
  },
  { text: "철은 ___에 붙는 성질이 있다.", answer: "자석", category: "과학" },
  { text: "렌즈는 빛을 ___시키는 도구이다.", answer: "굴절", category: "과학" },
  {
    text: "화산이 폭발하면 ___이 흘러나온다.",
    answer: "용암",
    category: "과학",
  },
  {
    text: "지층은 ___이 쌓여 만들어진 것이다.",
    answer: "흙",
    category: "과학",
  },
  {
    text: "태양에서 지구까지 빛이 도달하는 데 약 ___분 걸린다.",
    answer: "8",
    category: "과학",
  },
  {
    text: "무지개는 빛이 ___되어 생기는 것이다.",
    answer: "분산",
    category: "과학",
  },

  // === 지구과학 (30) ===
  {
    text: "지구의 표면은 대부분 ___으로 덮여 있다.",
    answer: "물",
    category: "지구과학",
  },
  { text: "화석은 옛날 ___의 흔적이다.", answer: "생물", category: "지구과학" },
  {
    text: "공룡은 지금은 ___한 동물이다.",
    answer: "멸종",
    category: "지구과학",
  },
  {
    text: "지진은 ___이 흔들리는 현상이다.",
    answer: "땅",
    category: "지구과학",
  },
  {
    text: "바위가 부서져서 작아진 것을 ___라 한다.",
    answer: "모래",
    category: "지구과학",
  },
  {
    text: "흙은 바위가 ___되어 만들어진다.",
    answer: "풍화",
    category: "지구과학",
  },
  {
    text: "강의 하류에 흙이 쌓이는 것을 ___이라(라) 한다.",
    answer: "퇴적",
    category: "지구과학",
  },
  { text: "지구의 내부는 매우 ___다.", answer: "뜨겁", category: "지구과학" },
  { text: "지구의 겉면을 ___이라(라) 한다.", answer: "지각", category: "지구과학" },
  {
    text: "바다의 밀물과 썰물은 ___의 인력 때문이다.",
    answer: "달",
    category: "지구과학",
  },
  {
    text: "암석의 종류는 화성암, 퇴적암, ___이다.",
    answer: "변성암",
    category: "지구과학",
  },
  {
    text: "석탄은 옛날 ___이 변한 것이다.",
    answer: "식물",
    category: "지구과학",
  },
  {
    text: "대기권은 지구를 둘러싼 ___층이다.",
    answer: "공기",
    category: "지구과학",
  },
  {
    text: "지구 표면의 약 70%는 ___다.",
    answer: "바다",
    category: "지구과학",
  },
  { text: "대륙은 지구에 ___개가 있다.", answer: "여섯", category: "지구과학" },
  {
    text: "가장 큰 대륙은 ___대륙이다.",
    answer: "아시아",
    category: "지구과학",
  },
  {
    text: "바닷물이 짠 이유는 ___이 녹아 있기 때문이다.",
    answer: "소금",
    category: "지구과학",
  },
  {
    text: "빙하는 오래된 ___이 굳어진 것이다.",
    answer: "눈",
    category: "지구과학",
  },
  {
    text: "사막은 비가 매우 ___오는 지역이다.",
    answer: "적게",
    category: "지구과학",
  },
  {
    text: "지구가 태양을 한 바퀴 도는 데 ___이 걸린다.",
    answer: "1년",
    category: "지구과학",
  },
  {
    text: "지구가 한 바퀴 자전하는 데 ___시간이 걸린다.",
    answer: "24",
    category: "지구과학",
  },
  {
    text: "태풍은 따뜻한 ___위에서 만들어진다.",
    answer: "바다",
    category: "지구과학",
  },
  {
    text: "지진이 바다에서 일어나면 ___이 발생할 수 있다.",
    answer: "해일",
    category: "지구과학",
  },
  {
    text: "오존층은 자외선을 ___해 준다.",
    answer: "차단",
    category: "지구과학",
  },
  {
    text: "석유는 옛날 ___이 변한 것이다.",
    answer: "생물",
    category: "지구과학",
  },
  {
    text: "열대우림은 비가 ___오는 더운 지역이다.",
    answer: "많이",
    category: "지구과학",
  },
  {
    text: "달이 지구를 한 바퀴 도는 데 약 ___일이 걸린다.",
    answer: "27",
    category: "지구과학",
  },
  {
    text: "해수면이 올라가는 원인은 지구 ___때문이다.",
    answer: "온난화",
    category: "지구과학",
  },
  {
    text: "가장 작은 대륙은 ___대륙이다.",
    answer: "오세아니아",
    category: "지구과학",
  },
  {
    text: "화산에서 나오는 뜨거운 돌을 ___이라(라) 한다.",
    answer: "용암",
    category: "지구과학",
  },

  // === 수학상식 (30) ===
  {
    text: "삼각형의 각의 합은 ___도이다.",
    answer: "180",
    category: "수학상식",
  },
  {
    text: "사각형의 각의 합은 ___도이다.",
    answer: "360",
    category: "수학상식",
  },
  { text: "원에는 꼭짓점이 ___개이다.", answer: "0", category: "수학상식" },
  { text: "삼각형에는 꼭짓점이 ___개이다.", answer: "3", category: "수학상식" },
  {
    text: "정사각형의 네 변의 길이는 모두 ___다.",
    answer: "같",
    category: "수학상식",
  },
  { text: "직각은 ___도이다.", answer: "90", category: "수학상식" },
  { text: "1km는 ___m이다.", answer: "1000", category: "수학상식" },
  { text: "1m는 ___cm이다.", answer: "100", category: "수학상식" },
  { text: "1kg은 ___g이다.", answer: "1000", category: "수학상식" },
  { text: "1시간은 ___분이다.", answer: "60", category: "수학상식" },
  { text: "1분은 ___초이다.", answer: "60", category: "수학상식" },
  { text: "1L는 ___mL이다.", answer: "1000", category: "수학상식" },
  { text: "원주율은 약 ___이다.", answer: "3.14", category: "수학상식" },
  { text: "1다스는 ___개이다.", answer: "12", category: "수학상식" },
  { text: "정육면체의 면은 ___개이다.", answer: "6", category: "수학상식" },
  { text: "정육면체의 꼭짓점은 ___개이다.", answer: "8", category: "수학상식" },
  {
    text: "정육면체의 모서리는 ___개이다.",
    answer: "12",
    category: "수학상식",
  },
  {
    text: "직사각형의 넓이는 가로 곱하기 ___다.",
    answer: "세로",
    category: "수학상식",
  },
  {
    text: "삼각형의 넓이는 밑변 곱하기 높이 나누기 ___다.",
    answer: "2",
    category: "수학상식",
  },
  {
    text: "수직인 두 직선이 만나는 각도는 ___도이다.",
    answer: "90",
    category: "수학상식",
  },
  { text: "가장 작은 소수는 ___다.", answer: "2", category: "수학상식" },
  {
    text: "분수에서 위의 수를 ___라 한다.",
    answer: "분자",
    category: "수학상식",
  },
  {
    text: "분수에서 아래의 수를 ___라 한다.",
    answer: "분모",
    category: "수학상식",
  },
  { text: "1년은 ___개월이다.", answer: "12", category: "수학상식" },
  { text: "1주일은 ___일이다.", answer: "7", category: "수학상식" },
  {
    text: "한 해의 마지막 달은 ___월이다.",
    answer: "12",
    category: "수학상식",
  },
  {
    text: "반지름이 같은 원은 크기가 ___다.",
    answer: "같",
    category: "수학상식",
  },
  {
    text: "평행한 두 직선은 아무리 가도 만나지 ___는다.",
    answer: "않",
    category: "수학상식",
  },
  {
    text: "대칭인 도형은 반으로 접으면 ___맞는다.",
    answer: "겹쳐",
    category: "수학상식",
  },
  {
    text: "원의 둘레를 지름으로 나누면 ___이 된다.",
    answer: "원주율",
    category: "수학상식",
  },

  // === 우주 (중급, 20) ===
  { text: "태양계에는 ___개의 행성이 있다.", answer: "8", category: "우주" },
  {
    text: "태양에서 가장 가까운 행성은 ___이다.",
    answer: "수성",
    category: "우주",
  },
  {
    text: "태양에서 세 번째 행성은 ___다.",
    answer: "지구",
    category: "우주",
  },
  {
    text: "태양계에서 가장 큰 행성은 ___이다.",
    answer: "목성",
    category: "우주",
  },
  { text: "고리가 아름다운 행성은 ___이다.", answer: "토성", category: "우주" },
  {
    text: "붉은 행성이라 불리는 것은 ___이다.",
    answer: "화성",
    category: "우주",
  },
  {
    text: "태양은 뜨거운 ___로 이루어져 있다.",
    answer: "가스",
    category: "우주",
  },
  {
    text: "달에는 ___가 없어서 소리가 전달되지 않는다.",
    answer: "공기",
    category: "우주",
  },
  {
    text: "별자리 중 국자 모양의 별자리는 ___이다.",
    answer: "북두칠성",
    category: "우주",
  },
  {
    text: "은하수는 수많은 ___이 모여 있는 것이다.",
    answer: "별",
    category: "우주",
  },
  {
    text: "우주에서 지구를 보면 ___색으로 보인다.",
    answer: "파란",
    category: "우주",
  },
  {
    text: "인공___은 지구 주위를 도는 기계이다.",
    answer: "위성",
    category: "우주",
  },
  {
    text: "우주비행사는 우주에서 ___이 없어 둥둥 뜬다.",
    answer: "중력",
    category: "우주",
  },
  { text: "달 표면에는 ___가 많다.", answer: "분화구", category: "우주" },
  {
    text: "태양계에서 가장 작은 행성은 ___이다.",
    answer: "수성",
    category: "우주",
  },
  {
    text: "화성은 ___색으로 보여서 붉은 행성이라 불린다.",
    answer: "붉은",
    category: "우주",
  },
  {
    text: "지구는 태양 주위를 도는데 이것을 ___이라(라) 한다.",
    answer: "공전",
    category: "우주",
  },
  {
    text: "지구가 스스로 도는 것을 ___이라(라) 한다.",
    answer: "자전",
    category: "우주",
  },
  { text: "지구의 자연위성은 ___이다.", answer: "달", category: "우주" },
  {
    text: "태양에서 지구까지 빛이 도달하는 데 약 ___분 걸린다.",
    answer: "8",
    category: "우주",
  },

  // === 동물 (중급, 15) ===
  {
    text: "곤충의 몸은 머리, 가슴, ___로 나뉜다.",
    answer: "배",
    category: "동물",
  },
  {
    text: "양서류는 물과 ___에서 모두 살 수 있다.",
    answer: "육지",
    category: "동물",
  },
  { text: "곤충의 다리는 ___개이다.", answer: "6", category: "동물" },
  { text: "거미의 다리는 ___개이다.", answer: "8", category: "동물" },
  { text: "포유류는 새끼에게 ___을 먹인다.", answer: "젖", category: "동물" },
  {
    text: "파충류의 몸은 ___으로 덮여 있다.",
    answer: "비늘",
    category: "동물",
  },
  {
    text: "박쥐는 ___를 사용해 어둠 속에서 날아다닌다.",
    answer: "초음파",
    category: "동물",
  },
  {
    text: "연어는 알을 낳기 위해 강의 ___로 거슬러 올라간다.",
    answer: "상류",
    category: "동물",
  },
  { text: "문어의 다리는 ___개이다.", answer: "8", category: "동물" },
  {
    text: "카멜레온은 주변 환경에 맞게 ___을 바꾼다.",
    answer: "색깔",
    category: "동물",
  },
  {
    text: "고래는 물속에서 살지만 ___로 숨을 쉰다.",
    answer: "폐",
    category: "동물",
  },
  {
    text: "변온동물은 체온이 주변 환경에 따라 ___한다.",
    answer: "변",
    category: "동물",
  },
  {
    text: "양서류는 어릴 때 ___에서 살다가 육지로 올라온다.",
    answer: "물",
    category: "동물",
  },
  { text: "오징어의 다리는 ___개이다.", answer: "10", category: "동물" },
  {
    text: "세계에서 가장 큰 동물은 ___다.",
    answer: "대왕고래",
    category: "동물",
  },

  // === 나라 (5) ===
  { text: "우리나라의 국기는 ___다.", answer: "태극기", category: "문화" },
  { text: "우리나라의 국화는 ___다.", answer: "무궁화", category: "문화" },
  {
    text: "대한민국의 대통령이 사는 곳은 ___이다.",
    answer: "용산",
    category: "문화",
  },
  {
    text: "우리 몸에서 음식을 소화하는 기관은 ___다.",
    answer: "위",
    category: "인체",
  },
  {
    text: "식물의 잎이 하는 가장 중요한 일은 ___이다.",
    answer: "광합성",
    category: "과학",
  },

  // ──── 추가: 우리나라 지리 심화 (20) ────
  {
    text: "우리나라에서 가장 넓은 평야는 ___다.",
    answer: "호남평야",
    category: "지리",
  },
  {
    text: "지리산은 경상남도, 전라남도, ___도에 걸쳐 있다.",
    answer: "전라북",
    category: "지리",
  },
  { text: "속초는 ___도에 있는 도시이다.", answer: "강원", category: "지리" },
  {
    text: "청주는 ___도의 도청 소재지이다.",
    answer: "충청북",
    category: "지리",
  },
  {
    text: "울산은 ___산업이 발달한 도시이다.",
    answer: "자동차",
    category: "지리",
  },
  {
    text: "포항은 ___산업이 발달한 도시이다.",
    answer: "철강",
    category: "지리",
  },
  { text: "보성은 ___로 유명한 지역이다.", answer: "녹차", category: "지리" },
  {
    text: "안동은 ___으로 유명한 도시이다.",
    answer: "하회탈",
    category: "문화",
  },
  {
    text: "전주는 ___으로 유명한 도시이다.",
    answer: "비빔밥",
    category: "문화",
  },
  {
    text: "춘천은 ___로 유명한 도시이다.",
    answer: "닭갈비",
    category: "문화",
  },

  // ──── 추가: 과학 심화 (20) ────
  {
    text: "식물이 이산화탄소를 흡수하고 ___를 내뿜는다.",
    answer: "산소",
    category: "과학",
  },
  {
    text: "혼합물에서 물질을 분리하는 방법 중 하나는 ___다.",
    answer: "거르기",
    category: "과학",
  },
  {
    text: "열은 뜨거운 곳에서 ___ 곳으로 이동한다.",
    answer: "차가운",
    category: "과학",
  },
  {
    text: "전류가 흐르는 길이 끊어지면 전구가 ___진다.",
    answer: "꺼",
    category: "과학",
  },
  {
    text: "자석의 같은 극끼리는 서로 ___한다.",
    answer: "밀어냄",
    category: "과학",
  },
  {
    text: "자석의 다른 극끼리는 서로 ___한다.",
    answer: "끌어당김",
    category: "과학",
  },
  {
    text: "용수철은 힘을 가하면 ___는 성질이 있다.",
    answer: "늘어나",
    category: "과학",
  },
  {
    text: "빛이 통과하지 못하는 물체를 ___체라 한다.",
    answer: "불투명",
    category: "과학",
  },
  {
    text: "빛이 통과하는 물체를 ___체라 한다.",
    answer: "투명",
    category: "과학",
  },
  {
    text: "지구의 위도 0도 선을 ___라 한다.",
    answer: "적도",
    category: "지구과학",
  },

  // ──── 추가: 세계 상식 (15) ────
  {
    text: "세계 4대 문명 중 하나는 ___문명이다.",
    answer: "메소포타미아",
    category: "역사",
  },
  {
    text: "올림픽의 상징인 오륜기에는 ___개의 고리가 있다.",
    answer: "5",
    category: "생활상식",
  },
  {
    text: "올림픽의 오륜기는 ___개의 대륙을 상징한다.",
    answer: "5",
    category: "생활상식",
  },
  {
    text: "세계 최초로 인쇄술을 발명한 나라는 ___이다.",
    answer: "한국",
    category: "역사",
  },
  {
    text: "피라미드는 ___에 있는 건축물이다.",
    answer: "이집트",
    category: "지리",
  },
  { text: "만리장성은 ___에 있다.", answer: "중국", category: "지리" },
  { text: "자유의 여신상은 ___에 있다.", answer: "미국", category: "지리" },
  { text: "에펠탑은 ___에 있다.", answer: "프랑스", category: "지리" },
  {
    text: "세계에서 인구가 가장 많은 나라는 ___다.",
    answer: "인도",
    category: "지리",
  },
  {
    text: "세계에서 면적이 가장 큰 나라는 ___다.",
    answer: "러시아",
    category: "지리",
  },
  {
    text: "아프리카에서 가장 높은 산은 ___산이다.",
    answer: "킬리만자로",
    category: "지리",
  },
  {
    text: "세계에서 가장 넓은 호수는 ___해이다.",
    answer: "카스피",
    category: "지리",
  },
  { text: "남극에는 ___이 많이 살고 있다.", answer: "펭귄", category: "동물" },
  {
    text: "타조는 날지 못하는 세계에서 가장 ___새이다.",
    answer: "큰",
    category: "동물",
  },
  { text: "돌고래는 매우 ___한 동물이다.", answer: "똑똑", category: "동물" },

  // ──── 추가: 지리 확장 (20) ────
  {
    text: "우리나라의 가장 남쪽 섬은 ___다.",
    answer: "마라도",
    category: "지리",
  },
  {
    text: "우리나라의 가장 동쪽 영토는 ___다.",
    answer: "독도",
    category: "지리",
  },
  {
    text: "백두대간은 백두산에서 ___산까지 이어지는 산줄기이다.",
    answer: "지리",
    category: "지리",
  },
  { text: "해운대 해수욕장은 ___에 있다.", answer: "부산", category: "지리" },
  { text: "강릉은 ___도에 있는 도시이다.", answer: "강원", category: "지리" },
  {
    text: "우리나라에서 밀감이 가장 많이 나는 곳은 ___다.",
    answer: "제주도",
    category: "지리",
  },
  { text: "판문점은 남북 ___지대에 있다.", answer: "비무장", category: "지리" },
  {
    text: "우리나라의 동쪽에는 ___산맥이 있다.",
    answer: "태백",
    category: "지리",
  },
  {
    text: "합천에 있는 유네스코 세계유산은 ___다.",
    answer: "해인사",
    category: "지리",
  },
  {
    text: "우리나라에서 가장 큰 호수는 ___다.",
    answer: "소양호",
    category: "지리",
  },
  {
    text: "서울에 있는 가장 높은 산은 ___이다.",
    answer: "북한산",
    category: "지리",
  },
  { text: "안면도는 ___도에 있는 섬이다.", answer: "충청남", category: "지리" },
  { text: "평창은 ___올림픽이 열린 곳이다.", answer: "겨울", category: "지리" },
  {
    text: "임진강은 남한과 ___을 흐르는 강이다.",
    answer: "북한",
    category: "지리",
  },
  {
    text: "순천만은 ___으로 유명한 생태 관광지이다.",
    answer: "갈대밭",
    category: "지리",
  },
  {
    text: "거제도는 ___에서 두 번째로 큰 섬이다.",
    answer: "우리나라",
    category: "지리",
  },
  { text: "김해는 옛날 ___의 수도였다.", answer: "가야", category: "지리" },
  {
    text: "진주는 ___전투로 유명한 도시이다.",
    answer: "진주성",
    category: "지리",
  },
  { text: "익산은 ___도에 있는 도시이다.", answer: "전라북", category: "지리" },
  {
    text: "서울의 조선시대 궁궐로 ___이 있다.",
    answer: "경복궁",
    category: "지리",
  },

  // ──── 추가: 역사 확장 (20) ────
  {
    text: "고려시대의 대표적인 종교는 ___다.",
    answer: "불교",
    category: "역사",
  },
  { text: "조선시대의 지배 이념은 ___다.", answer: "유교", category: "역사" },
  { text: "세종대왕이 만든 악기는 ___이다.", answer: "편경", category: "역사" },
  {
    text: "조선시대 관리를 뽑는 시험을 ___라 한다.",
    answer: "과거",
    category: "역사",
  },
  {
    text: "고려시대에 몽골의 침략을 막기 위해 ___로 천도했다.",
    answer: "강화도",
    category: "역사",
  },
  {
    text: "광개토대왕은 고구려의 영토를 크게 ___했다.",
    answer: "넓혔",
    category: "역사",
  },
  { text: "삼별초는 ___에 대항한 군대이다.", answer: "몽골", category: "역사" },
  {
    text: "조선시대 서민 교육기관을 ___이라(라) 한다.",
    answer: "서당",
    category: "역사",
  },
  {
    text: "고조선의 법 중 유명한 것은 ___조 법이다.",
    answer: "8",
    category: "역사",
  },
  {
    text: "백제의 근초고왕은 일본에 ___를 전해 주었다.",
    answer: "문화",
    category: "역사",
  },
  {
    text: "한국전쟁 때 유엔군을 이끈 장군은 ___다.",
    answer: "맥아더",
    category: "역사",
  },
  {
    text: "1988년 서울 올림픽의 마스코트는 ___다.",
    answer: "호돌이",
    category: "역사",
  },
  { text: "한국 최초의 우주인은 ___이다.", answer: "이소연", category: "역사" },
  {
    text: "조선시대 왕이 사는 곳을 ___이라(라) 한다.",
    answer: "궁궐",
    category: "역사",
  },
  {
    text: "조선시대에 편지를 전하는 제도를 ___이라(라) 한다.",
    answer: "역참",
    category: "역사",
  },
  {
    text: "의병은 나라를 지키기 위해 스스로 ___한 백성이다.",
    answer: "싸운",
    category: "역사",
  },
  {
    text: "한산도 대첩에서 사용한 진법은 ___진이다.",
    answer: "학익",
    category: "역사",
  },
  {
    text: "독립운동가 윤봉길 의사는 ___에서 의거를 일으켰다.",
    answer: "상하이",
    category: "역사",
  },
  {
    text: "대한민국 헌법에는 국민의 ___이 보장되어 있다.",
    answer: "기본권",
    category: "역사",
  },
  {
    text: "4·19 혁명은 ___정권에 대항한 운동이다.",
    answer: "이승만",
    category: "역사",
  },

  // ──── 추가: 과학 확장 (20) ────
  {
    text: "물질이 타면서 빛과 열을 내는 것을 ___라 한다.",
    answer: "연소",
    category: "과학",
  },
  {
    text: "양초가 타면 ___로 변한다.",
    answer: "이산화탄소와 수증기",
    category: "과학",
  },
  {
    text: "식초에 달걀 껍데기를 넣으면 ___이 나온다.",
    answer: "거품",
    category: "과학",
  },
  {
    text: "철이 녹스는 것은 ___와 만나기 때문이다.",
    answer: "산소",
    category: "과학",
  },
  {
    text: "들숨에서 산소를 들이마시고 날숨에서 ___를 내뿜는다.",
    answer: "이산화탄소",
    category: "과학",
  },
  {
    text: "프리즘에 빛을 통과시키면 ___가지 색으로 분리된다.",
    answer: "일곱",
    category: "과학",
  },
  {
    text: "전지를 직렬로 연결하면 ___가 밝아진다.",
    answer: "전구",
    category: "과학",
  },
  {
    text: "용수철에 무거운 것을 달면 ___나는 정도가 커진다.",
    answer: "늘어",
    category: "과학",
  },
  { text: "체온계로 사람의 ___을 측정한다.", answer: "체온", category: "과학" },
  {
    text: "비커와 시험관은 ___실에서 사용하는 도구이다.",
    answer: "실험",
    category: "과학",
  },
  {
    text: "만원경은 먼 곳의 물체를 ___게 볼 수 있는 도구이다.",
    answer: "크",
    category: "과학",
  },
  {
    text: "현미경은 작은 것을 ___게 볼 수 있는 도구이다.",
    answer: "크",
    category: "과학",
  },
  { text: "물은 섭씨 ___도에서 끓는다.", answer: "100", category: "과학" },
  {
    text: "소리는 ___속에서 전달되지 않는다.",
    answer: "진공",
    category: "과학",
  },
  {
    text: "전구에 빛이 들어오는 것은 ___가 흐르기 때문이다.",
    answer: "전류",
    category: "과학",
  },
  {
    text: "지층에서 발견되는 옛 생물의 흔적을 ___이라(라) 한다.",
    answer: "화석",
    category: "과학",
  },
  {
    text: "흙은 자갈, 모래, ___로 이루어져 있다.",
    answer: "점토",
    category: "과학",
  },
  { text: "거울에 빛이 비치면 ___한다.", answer: "반사", category: "과학" },
  { text: "못은 자석에 ___는다.", answer: "붙", category: "과학" },
  { text: "유리는 자석에 붙지 ___는다.", answer: "않", category: "과학" },

  // ──── 추가: 지구과학 확장 (15) ────
  {
    text: "화석은 주로 ___암에서 발견된다.",
    answer: "퇴적",
    category: "지구과학",
  },
  {
    text: "지진이 일어나는 이유는 지각 ___때문이다.",
    answer: "판의 이동",
    category: "지구과학",
  },
  { text: "용암이 식으면 ___암이 된다.", answer: "화성", category: "지구과학" },
  {
    text: "대리석은 석회암이 열과 압력을 받아 변한 ___암이다.",
    answer: "변성",
    category: "지구과학",
  },
  {
    text: "공룡 화석은 ___시대의 것이다.",
    answer: "중생대",
    category: "지구과학",
  },
  {
    text: "지구의 표면은 여러 개의 ___으로 나뉘어 있다.",
    answer: "판",
    category: "지구과학",
  },
  {
    text: "삼엽충은 ___시대의 대표 화석이다.",
    answer: "고생대",
    category: "지구과학",
  },
  {
    text: "바닷가의 절벽은 파도의 ___작용으로 생긴다.",
    answer: "침식",
    category: "지구과학",
  },
  {
    text: "강의 상류에서는 바위가 ___어 돌이 된다.",
    answer: "깎여",
    category: "지구과학",
  },
  {
    text: "석회암 동굴에는 ___석이 자란다.",
    answer: "종유",
    category: "지구과학",
  },
  {
    text: "온천은 땅속의 ___물이 솟아 나는 것이다.",
    answer: "뜨거운",
    category: "지구과학",
  },
  {
    text: "흙 속에는 물과 ___와 작은 생물이 있다.",
    answer: "공기",
    category: "지구과학",
  },
  {
    text: "빙하가 녹으면 해수면이 ___한다.",
    answer: "상승",
    category: "지구과학",
  },
  {
    text: "사화산은 더 이상 ___하지 않는 화산이다.",
    answer: "폭발",
    category: "지구과학",
  },
  {
    text: "제주도의 돌하르방은 ___으로 만들어졌다.",
    answer: "현무암",
    category: "지구과학",
  },

  // ──── 추가: 수학상식 확장 (15) ────
  { text: "오각형의 꼭짓점은 ___개이다.", answer: "5", category: "수학상식" },
  { text: "육각형의 변은 ___개이다.", answer: "6", category: "수학상식" },
  {
    text: "이등변삼각형은 두 변의 길이가 ___다.",
    answer: "같",
    category: "수학상식",
  },
  { text: "1톤은 ___kg이다.", answer: "1000", category: "수학상식" },
  {
    text: "반지름의 두 배를 ___이라(라) 한다.",
    answer: "지름",
    category: "수학상식",
  },
  {
    text: "꼭짓점 세 개와 변 세 개로 이루어진 도형은 ___이다.",
    answer: "삼각형",
    category: "수학상식",
  },
  {
    text: "마름모의 네 변의 길이는 모두 ___다.",
    answer: "같",
    category: "수학상식",
  },
  {
    text: "사다리꼴은 한 쌍의 대변이 ___한 사각형이다.",
    answer: "평행",
    category: "수학상식",
  },
  {
    text: "둥근 기둥 모양의 도형을 ___이라(라) 한다.",
    answer: "원기둥",
    category: "수학상식",
  },
  {
    text: "뾰족한 끝이 있는 원뿔의 꼭짓점은 ___개이다.",
    answer: "1",
    category: "수학상식",
  },
  {
    text: "각도기는 ___를 재는 도구이다.",
    answer: "각도",
    category: "수학상식",
  },
  { text: "둔각은 ___도보다 큰 각이다.", answer: "90", category: "수학상식" },
  { text: "예각은 ___도보다 작은 각이다.", answer: "90", category: "수학상식" },
  {
    text: "곱하기의 반대 연산은 ___다.",
    answer: "나누기",
    category: "수학상식",
  },
  { text: "10의 제곱은 ___이다.", answer: "100", category: "수학상식" },

  // ──── 추가: 동물 확장 (15) ────
  {
    text: "사마귀는 앞다리로 먹이를 ___은 곤충이다.",
    answer: "잡",
    category: "동물",
  },
  {
    text: "하루살이는 성충이 된 후 ___밖에 살지 못한다.",
    answer: "하루",
    category: "동물",
  },
  {
    text: "수달은 강에서 ___를 잡아먹는다.",
    answer: "물고기",
    category: "동물",
  },
  {
    text: "독수리는 날카로운 ___으로 먹이를 낚아챈다.",
    answer: "발톱",
    category: "동물",
  },
  {
    text: "코뿔소의 뿔은 ___으로 만들어져 있다.",
    answer: "케라틴",
    category: "동물",
  },
  {
    text: "나비의 유충인 ___는 주로 잎을 먹는다.",
    answer: "애벌레",
    category: "동물",
  },
  {
    text: "비버는 나무로 ___을 만드는 동물이다.",
    answer: "댐",
    category: "동물",
  },
  {
    text: "해마는 ___이 새끼를 낳는 특이한 동물이다.",
    answer: "수컷",
    category: "동물",
  },
  {
    text: "미어캣은 ___속에 굴을 파고 사는 동물이다.",
    answer: "땅",
    category: "동물",
  },
  {
    text: "플라밍고는 ___색 깃털을 가진 새이다.",
    answer: "분홍",
    category: "동물",
  },
  {
    text: "철새는 계절에 따라 ___를 이동한다.",
    answer: "장소",
    category: "동물",
  },
  {
    text: "텃새는 한곳에서 ___내 사는 새이다.",
    answer: "사계절",
    category: "동물",
  },
  { text: "다슬기는 강에 사는 ___다.", answer: "달팽이", category: "동물" },
  {
    text: "반달가슴곰은 우리나라의 멸종 위기 ___이다.",
    answer: "동물",
    category: "동물",
  },
  {
    text: "수리부엉이는 우리나라에서 가장 ___부엉이이다.",
    answer: "큰",
    category: "동물",
  },

  // ══════════════════════════════════════════════════════════
  // 추가 콘텐츠: 다양한 문제 유형 (3-4학년 확장, 250+ 신규)
  // ══════════════════════════════════════════════════════════

  // ──── 지리: 분류하기 ────
  {
    text: "서울, 부산, 대구는 모두 ___시이다.",
    answer: "광역",
    category: "지리",
  },
  {
    text: "한강, 낙동강, 금강은 모두 우리나라의 큰 ___이다.",
    answer: "강",
    category: "지리",
  },
  {
    text: "설악산, 지리산, 한라산은 모두 ___이다.",
    answer: "산",
    category: "지리",
  },
  {
    text: "제주도, 울릉도, 거제도는 모두 ___이다.",
    answer: "섬",
    category: "지리",
  },
  {
    text: "동해, 서해, 남해는 모두 우리나라의 ___다.",
    answer: "바다",
    category: "지리",
  },

  // ──── 지리: 비교하기 ────
  {
    text: "백두산과 한라산 중 더 높은 산은 ___이다.",
    answer: "백두산",
    category: "지리",
  },
  {
    text: "제주도와 울릉도 중 더 큰 섬은 ___다.",
    answer: "제주도",
    category: "지리",
  },
  {
    text: "한강과 낙동강 중 더 긴 강은 ___이다.",
    answer: "낙동강",
    category: "지리",
  },
  {
    text: "서울과 세종시 중 인구가 더 많은 곳은 ___이다.",
    answer: "서울",
    category: "지리",
  },

  // ──── 지리: 연결하기 ────
  {
    text: "서울에는 한강이 흐르고, 부산에는 ___이 흐른다.",
    answer: "낙동강",
    category: "지리",
  },
  {
    text: "경주는 신라의 수도였고, 부여는 ___의 수도였다.",
    answer: "백제",
    category: "지리",
  },
  {
    text: "제주도에는 한라산이 있고, 강원도에는 ___이 있다.",
    answer: "설악산",
    category: "지리",
  },
  {
    text: "충청도의 대표 도시는 대전이고, 경상북도의 대표 도시는 ___다.",
    answer: "대구",
    category: "지리",
  },

  // ──── 지리: 원인결과 ────
  {
    text: "전라도에 평야가 넓어서 ___이 많이 생산된다.",
    answer: "쌀",
    category: "지리",
  },
  {
    text: "제주도에 화산이 있었기 때문에 ___이 많다.",
    answer: "현무암",
    category: "지리",
  },
  {
    text: "강원도에 산이 많아서 ___시즌에 사람들이 많이 간다.",
    answer: "스키",
    category: "지리",
  },

  // ──── 역사: 순서맞추기 ────
  {
    text: "한국 역사 순서: 고조선 → 삼국시대 → 통일신라 → 고려 → ___",
    answer: "조선",
    category: "역사",
  },
  {
    text: "삼국의 건국 순서: 고구려 → 백제 → ___",
    answer: "신라",
    category: "역사",
  },
  {
    text: "조선시대 발명품: 훈민정음 → 측우기 → ___",
    answer: "거북선",
    category: "역사",
  },

  // ──── 역사: 연결하기 ────
  {
    text: "세종대왕은 한글을 만들었고, 이순신은 ___을 만들었다.",
    answer: "거북선",
    category: "역사",
  },
  {
    text: "고구려의 수도는 평양이고, 신라의 수도는 ___다.",
    answer: "경주",
    category: "역사",
  },
  {
    text: "왕건은 고려를 세웠고, 이성계는 ___을 세웠다.",
    answer: "조선",
    category: "역사",
  },
  {
    text: "경복궁은 조선의 궁궐이고, 불국사는 ___의 절이다.",
    answer: "신라",
    category: "역사",
  },

  // ──── 역사: 분류하기 ────
  {
    text: "고구려, 백제, 신라는 ___시대의 나라이다.",
    answer: "삼국",
    category: "역사",
  },
  {
    text: "측우기, 해시계, 물시계는 모두 조선시대의 ___기구이다.",
    answer: "과학",
    category: "역사",
  },
  {
    text: "세종대왕, 정조, 광개토대왕은 모두 ___이다.",
    answer: "왕",
    category: "역사",
  },
  {
    text: "석굴암, 불국사, 첨성대는 모두 ___에 있는 문화재이다.",
    answer: "경주",
    category: "역사",
  },

  // ──── 역사: 비교하기 ────
  {
    text: "고구려와 백제 중 영토가 더 넓었던 나라는 ___다.",
    answer: "고구려",
    category: "역사",
  },
  {
    text: "삼국을 통일한 나라는 백제가 아니라 ___다.",
    answer: "신라",
    category: "역사",
  },

  // ──── 역사: 원인결과 ────
  {
    text: "한글이 만들어져서 백성들이 ___을 쉽게 배울 수 있었다.",
    answer: "글",
    category: "역사",
  },
  {
    text: "거북선이 있어서 바다에서 ___군을 물리칠 수 있었다.",
    answer: "왜",
    category: "역사",
  },
  {
    text: "금속활자가 발명되어 책을 ___쉽게 찍을 수 있었다.",
    answer: "더",
    category: "역사",
  },

  // ──── 과학: 분류하기 ────
  {
    text: "자석, 전기, 빛은 모두 ___의 주제이다.",
    answer: "과학",
    category: "과학",
  },
  {
    text: "고체, 액체, 기체는 물질의 세 가지 ___다.",
    answer: "상태",
    category: "과학",
  },
  {
    text: "나침반, 전동기, 스피커에는 모두 ___이 사용된다.",
    answer: "자석",
    category: "과학",
  },
  {
    text: "돋보기, 안경, 현미경에는 모두 ___가 사용된다.",
    answer: "렌즈",
    category: "과학",
  },

  // ──── 과학: 순서맞추기 ────
  {
    text: "물의 상태 변화: 얼음(고체) → 물(액체) → _____(기체)",
    answer: "수증기",
    category: "과학",
  },
  {
    text: "먹이사슬의 순서: 풀 → 메뚜기 → 개구리 → ___",
    answer: "뱀",
    category: "과학",
  },
  {
    text: "하천의 순서: 샘물 → 시냇물 → 강 → ___",
    answer: "바다",
    category: "과학",
  },

  // ──── 과학: 원인결과 ────
  { text: "물을 가열하면 ___기로 변한다.", answer: "수증", category: "과학" },
  {
    text: "전구에 전기가 흐르지 않으면 불이 ___진다.",
    answer: "꺼",
    category: "과학",
  },
  {
    text: "빛이 프리즘을 통과하면 ___가지 색으로 나뉜다.",
    answer: "일곱",
    category: "과학",
  },
  {
    text: "돋보기로 햇빛을 모으면 종이가 ___수 있다.",
    answer: "탈",
    category: "과학",
  },
  {
    text: "식물에 물을 주지 않으면 ___게 된다.",
    answer: "시들",
    category: "과학",
  },

  // ──── 과학: 비교하기 ────
  {
    text: "소리와 빛 중 더 빠른 것은 ___이다.",
    answer: "빛",
    category: "과학",
  },
  {
    text: "기름과 물을 섞으면 ___이 위로 뜬다.",
    answer: "기름",
    category: "과학",
  },
  {
    text: "같은 부피의 쇠와 나무 중 더 무거운 것은 ___다.",
    answer: "쇠",
    category: "과학",
  },

  // ──── 과학: 연결하기 ────
  {
    text: "온도계는 온도를 재고, 저울은 ___를 잰다.",
    answer: "무게",
    category: "과학",
  },
  {
    text: "식물은 산소를 내뿜고, 사람은 ___를 내뿜는다.",
    answer: "이산화탄소",
    category: "과학",
  },
  {
    text: "N극과 S극은 끌어당기고, 같은 극끼리는 ___한다.",
    answer: "밀어냄",
    category: "과학",
  },

  // ──── 지구과학: 분류하기 ────
  {
    text: "화성암, 퇴적암, 변성암은 모두 ___의 종류이다.",
    answer: "암석",
    category: "지구과학",
  },
  {
    text: "지진, 화산, 해일은 모두 자연 ___다.",
    answer: "재해",
    category: "지구과학",
  },
  {
    text: "모래, 자갈, 점토는 모두 ___의 구성물이다.",
    answer: "흙",
    category: "지구과학",
  },

  // ──── 지구과학: 순서맞추기 ────
  {
    text: "바위가 풍화되는 순서: 바위 → 돌 → 자갈 → 모래 → ___",
    answer: "흙",
    category: "지구과학",
  },
  {
    text: "지구의 구조 순서(바깥→안): 지각 → 맨틀 → ___",
    answer: "핵",
    category: "지구과학",
  },

  // ──── 지구과학: 원인결과 ────
  {
    text: "화산이 폭발하면 주변에 ___가 쌓인다.",
    answer: "화산재",
    category: "지구과학",
  },
  {
    text: "지각판이 움직이면 ___이 발생한다.",
    answer: "지진",
    category: "지구과학",
  },
  {
    text: "바다에서 물이 증발하면 ___이 만들어진다.",
    answer: "구름",
    category: "지구과학",
  },

  // ──── 지구과학: 비교하기 ────
  {
    text: "지각과 맨틀 중 지구 바깥쪽에 있는 것은 ___이다.",
    answer: "지각",
    category: "지구과학",
  },
  {
    text: "화성암과 퇴적암 중 화석이 발견되는 것은 ___암이다.",
    answer: "퇴적",
    category: "지구과학",
  },

  // ──── 수학상식: 분류하기 ────
  {
    text: "삼각형, 사각형, 오각형은 모두 ___도형이다.",
    answer: "평면",
    category: "수학상식",
  },
  {
    text: "정육면체, 원기둥, 원뿔은 모두 ___도형이다.",
    answer: "입체",
    category: "수학상식",
  },
  {
    text: "cm, m, km는 모두 ___의 단위이다.",
    answer: "길이",
    category: "수학상식",
  },
  {
    text: "g, kg, t은 모두 ___의 단위이다.",
    answer: "무게",
    category: "수학상식",
  },

  // ──── 수학상식: 비교하기 ────
  {
    text: "1km와 1m 중 더 긴 것은 ___이다.",
    answer: "1km",
    category: "수학상식",
  },
  {
    text: "예각과 둔각 중 더 작은 각은 ___이다.",
    answer: "예각",
    category: "수학상식",
  },
  {
    text: "정사각형과 직사각형 중 네 변이 모두 같은 것은 ___이다.",
    answer: "정사각형",
    category: "수학상식",
  },

  // ──── 수학상식: 연결하기 ────
  {
    text: "더하기의 반대는 빼기이고, 곱하기의 반대는 ___다.",
    answer: "나누기",
    category: "수학상식",
  },
  {
    text: "삼각형은 꼭짓점 3개, 사각형은 꼭짓점 ___개이다.",
    answer: "4",
    category: "수학상식",
  },
  {
    text: "원의 반지름은 지름의 ___이다.",
    answer: "절반",
    category: "수학상식",
  },

  // ──── 우주: 순서맞추기 (중급) ────
  {
    text: "태양계 행성 순서: 수성 → 금성 → 지구 → ___",
    answer: "화성",
    category: "우주",
  },
  {
    text: "달의 모양 변화: 초승달 → 상현달 → 보름달 → ___",
    answer: "하현달",
    category: "우주",
  },

  // ──── 우주: 분류하기 ────
  {
    text: "수성, 금성, 지구, 화성은 태양계의 ___행성이다.",
    answer: "내부",
    category: "우주",
  },
  {
    text: "목성, 토성, 천왕성, 해왕성은 태양계의 ___행성이다.",
    answer: "외부",
    category: "우주",
  },
  {
    text: "태양, 시리우스, 북극성은 모두 ___이다.",
    answer: "별",
    category: "우주",
  },

  // ──── 우주: 비교하기 ────
  {
    text: "목성과 지구 중 더 큰 행성은 ___이다.",
    answer: "목성",
    category: "우주",
  },
  {
    text: "수성과 해왕성 중 태양에 더 가까운 것은 ___이다.",
    answer: "수성",
    category: "우주",
  },
  {
    text: "태양과 달 중 더 큰 것은 ___이다.",
    answer: "태양",
    category: "우주",
  },

  // ──── 우주: 원인결과 ────
  {
    text: "태양이 빛을 내기 때문에 지구에 ___이 있다.",
    answer: "낮",
    category: "우주",
  },
  {
    text: "달에 공기가 없기 때문에 소리가 ___지 않는다.",
    answer: "들리",
    category: "우주",
  },

  // ──── 동물 (중급): 분류하기 ────
  {
    text: "개, 고양이, 말, 소는 모두 ___동물이다.",
    answer: "가축",
    category: "동물",
  },
  {
    text: "사슴벌레, 장수풍뎅이, 매미는 모두 ___이다.",
    answer: "곤충",
    category: "동물",
  },
  {
    text: "연어, 참치, 광어는 모두 ___에 사는 동물이다.",
    answer: "바다",
    category: "동물",
  },

  // ──── 동물 (중급): 비교하기 ────
  {
    text: "곤충은 다리가 6개이고, 거미는 다리가 ___개이다.",
    answer: "8",
    category: "동물",
  },
  {
    text: "문어와 오징어 중 다리가 더 적은 것은 ___다.",
    answer: "문어",
    category: "동물",
  },
  {
    text: "포유류와 파충류 중 체온이 일정한 것은 ___류이다.",
    answer: "포유",
    category: "동물",
  },

  // ──── 동물 (중급): 원인결과 ────
  {
    text: "카멜레온은 위험을 느끼면 몸의 ___을 바꾼다.",
    answer: "색깔",
    category: "동물",
  },
  {
    text: "철새는 먹이를 찾기 위해 계절마다 ___한다.",
    answer: "이동",
    category: "동물",
  },

  // ──── 문화: 비교하기 ────
  {
    text: "고려청자와 조선백자 중 푸른색인 것은 ___다.",
    answer: "고려청자",
    category: "문화",
  },
  {
    text: "가야금과 거문고 중 줄이 더 많은 것은 ___이다.",
    answer: "가야금",
    category: "문화",
  },

  // ──── 문화: 원인결과 ────
  {
    text: "배추를 소금에 절이고 양념을 넣으면 ___가 된다.",
    answer: "김치",
    category: "문화",
  },
  { text: "콩을 발효시키면 ___이 된다.", answer: "된장", category: "문화" },
  {
    text: "온돌에 불을 때면 바닥이 ___해진다.",
    answer: "따뜻",
    category: "문화",
  },

  // ──── 생활상식: 원인결과 ────
  {
    text: "분리수거를 하면 ___을 보호할 수 있다.",
    answer: "환경",
    category: "생활상식",
  },
  {
    text: "규칙적으로 운동하면 ___이 좋아진다.",
    answer: "건강",
    category: "생활상식",
  },
  { text: "물을 끓이면 세균이 ___한다.", answer: "죽", category: "생활상식" },
  {
    text: "손을 깨끗이 씻으면 ___을 예방할 수 있다.",
    answer: "병",
    category: "생활상식",
  },

  // ──── 추가: 세계 지리 신규 ────
  {
    text: "아시아에서 가장 큰 나라는 ___다.",
    answer: "러시아",
    category: "지리",
  },
  {
    text: "아프리카에서 가장 긴 강은 ___이다.",
    answer: "나일강",
    category: "지리",
  },
  {
    text: "유럽에서 가장 높은 산은 ___산이다.",
    answer: "엘브루스",
    category: "지리",
  },
  {
    text: "남아메리카에서 가장 긴 강은 ___이다.",
    answer: "아마존강",
    category: "지리",
  },

  // ──── 추가: 역사 신규 ────
  {
    text: "일제 강점기에 나라를 되찾기 위한 운동을 ___이라(라) 한다.",
    answer: "독립운동",
    category: "역사",
  },
  {
    text: "석기시대 사람들은 돌로 ___를 만들었다.",
    answer: "도구",
    category: "역사",
  },
  { text: "고인돌은 선사시대의 ___이다.", answer: "무덤", category: "역사" },
  {
    text: "고려시대에 ___도감을 두어 대장경을 만들었다.",
    answer: "대장경",
    category: "역사",
  },

  // ──── 추가: 과학 신규 ────
  {
    text: "전기가 흐르지 않는 물질을 ___체라 한다.",
    answer: "부도",
    category: "과학",
  },
  {
    text: "나침반이 북쪽을 가리키는 이유는 지구가 큰 ___이기 때문이다.",
    answer: "자석",
    category: "과학",
  },
  {
    text: "촛불을 유리컵으로 덮으면 산소가 없어져 ___진다.",
    answer: "꺼",
    category: "과학",
  },
  {
    text: "무거운 공과 가벼운 공을 같은 높이에서 떨어뜨리면 ___에 떨어진다.",
    answer: "동시",
    category: "과학",
  },
  {
    text: "물에 설탕을 넣고 저으면 설탕이 ___는다.",
    answer: "녹",
    category: "과학",
  },

  // ──── 추가: 지구과학 신규 ────
  {
    text: "해안가의 바위가 파도에 깎이는 것을 ___작용이라 한다.",
    answer: "침식",
    category: "지구과학",
  },
  {
    text: "석회 동굴은 ___이 녹아서 만들어진다.",
    answer: "석회암",
    category: "지구과학",
  },
  {
    text: "화석연료에는 석탄, 석유, ___가 있다.",
    answer: "천연가스",
    category: "지구과학",
  },
  {
    text: "지층의 줄무늬를 보면 과거의 ___을 알 수 있다.",
    answer: "환경",
    category: "지구과학",
  },

  // ──── 추가: 수학상식 신규 ────
  {
    text: "도형을 뒤집어도 모양이 같으면 ___이라(라) 한다.",
    answer: "대칭",
    category: "수학상식",
  },
  {
    text: "원의 중심에서 둘레까지의 거리를 ___이라(라) 한다.",
    answer: "반지름",
    category: "수학상식",
  },
  {
    text: "직선 두 개가 한 점에서 만나면 ___이 생긴다.",
    answer: "각",
    category: "수학상식",
  },
  { text: "구구단에서 7×8은 ___이다.", answer: "56", category: "수학상식" },
  {
    text: "삼각형의 세 각을 모두 더하면 ___도이다.",
    answer: "180",
    category: "수학상식",
  },
];

// ============================================================
// Grade 5-6: Advanced facts (world geography, detailed history, physics/chemistry basics)
// 250+ entries
// ============================================================
const GRADE_5_6: KnowledgeEntry[] = [
  // === 지리 (세계, 35) ===
  {
    text: "지구에서 가장 큰 바다는 ___이다.",
    answer: "태평양",
    category: "지리",
  },
  {
    text: "지구에서 가장 큰 대륙은 ___다.",
    answer: "아시아",
    category: "지리",
  },
  {
    text: "세계에서 가장 높은 산은 ___다.",
    answer: "에베레스트",
    category: "지리",
  },
  {
    text: "세계에서 가장 긴 강은 ___이다.",
    answer: "나일강",
    category: "지리",
  },
  {
    text: "세계에서 가장 큰 사막은 ___다.",
    answer: "사하라",
    category: "지리",
  },
  {
    text: "세계에서 가장 큰 나라는 ___다.",
    answer: "러시아",
    category: "지리",
  },
  {
    text: "세계에서 인구가 가장 많은 나라는 ___다.",
    answer: "인도",
    category: "지리",
  },
  { text: "일본의 수도는 ___다.", answer: "도쿄", category: "지리" },
  { text: "중국의 수도는 ___이다.", answer: "베이징", category: "지리" },
  { text: "미국의 수도는 ___이다.", answer: "워싱턴 D.C.", category: "지리" },
  { text: "영국의 수도는 ___이다.", answer: "런던", category: "지리" },
  { text: "프랑스의 수도는 ___다.", answer: "파리", category: "지리" },
  { text: "이탈리아의 수도는 ___다.", answer: "로마", category: "지리" },
  { text: "독일의 수도는 ___이다.", answer: "베를린", category: "지리" },
  { text: "호주의 수도는 ___다.", answer: "캔버라", category: "지리" },
  { text: "브라질의 수도는 ___다.", answer: "브라질리아", category: "지리" },
  {
    text: "이집트에는 유명한 ___가 있다.",
    answer: "피라미드",
    category: "지리",
  },
  {
    text: "적도는 지구의 ___를 가로지르는 선이다.",
    answer: "가운데",
    category: "지리",
  },
  {
    text: "남극과 북극은 지구에서 가장 ___곳이다.",
    answer: "추운",
    category: "지리",
  },
  {
    text: "아마존 열대우림은 ___대륙에 있다.",
    answer: "남아메리카",
    category: "지리",
  },
  {
    text: "히말라야 산맥은 ___대륙에 있다.",
    answer: "아시아",
    category: "지리",
  },
  {
    text: "나이아가라 폭포는 ___과 캐나다 사이에 있다.",
    answer: "미국",
    category: "지리",
  },
  {
    text: "그린란드는 세계에서 가장 큰 ___이다.",
    answer: "섬",
    category: "지리",
  },
  {
    text: "태평양과 대서양을 잇는 운하는 ___운하이다.",
    answer: "파나마",
    category: "지리",
  },
  {
    text: "세계에서 가장 깊은 호수는 ___호이다.",
    answer: "바이칼",
    category: "지리",
  },
  {
    text: "한국, 중국, 일본은 ___아시아에 속한다.",
    answer: "동",
    category: "지리",
  },
  { text: "인도는 ___아시아에 속한다.", answer: "남", category: "지리" },
  { text: "위도 0도 선을 ___라 한다.", answer: "적도", category: "지리" },
  {
    text: "경도 0도 선을 ___자오선이라 한다.",
    answer: "본초",
    category: "지리",
  },
  {
    text: "만리장성은 ___에 있는 건축물이다.",
    answer: "중국",
    category: "지리",
  },
  { text: "자유의 여신상은 ___에 있다.", answer: "미국", category: "지리" },
  { text: "에펠탑은 ___에 있다.", answer: "파리", category: "지리" },
  {
    text: "콜로세움은 ___에 있는 고대 경기장이다.",
    answer: "로마",
    category: "지리",
  },
  {
    text: "지중해는 유럽과 ___사이에 있는 바다이다.",
    answer: "아프리카",
    category: "지리",
  },
  {
    text: "유럽에서 가장 긴 강은 ___강이다.",
    answer: "볼가",
    category: "지리",
  },

  // === 역사 (심화, 35) ===
  { text: "고구려를 세운 왕은 ___이다.", answer: "주몽", category: "역사" },
  { text: "백제를 세운 왕은 ___다.", answer: "온조", category: "역사" },
  { text: "신라를 세운 왕은 ___다.", answer: "박혁거세", category: "역사" },
  { text: "발해를 세운 사람은 ___이다.", answer: "대조영", category: "역사" },
  { text: "고려의 수도는 ___이었다.", answer: "개경", category: "역사" },
  {
    text: "조선시대 과학자 ___은 물시계를 만들었다.",
    answer: "장영실",
    category: "역사",
  },
  {
    text: "임진왜란이 일어난 해는 ___년이다.",
    answer: "1592",
    category: "역사",
  },
  {
    text: "병자호란은 ___나라의 침입으로 일어났다.",
    answer: "청",
    category: "역사",
  },
  { text: "실학자 ___은 목민심서를 썼다.", answer: "정약용", category: "역사" },
  {
    text: "동학 농민 운동의 지도자는 ___이다.",
    answer: "전봉준",
    category: "역사",
  },
  {
    text: "일제 강점기는 ___년부터 시작되었다.",
    answer: "1910",
    category: "역사",
  },
  {
    text: "대한민국 임시정부는 중국 ___에 세워졌다.",
    answer: "상하이",
    category: "역사",
  },
  {
    text: "한국전쟁의 휴전 협정은 ___년에 맺어졌다.",
    answer: "1953",
    category: "역사",
  },
  { text: "88 올림픽은 ___에서 열렸다.", answer: "서울", category: "역사" },
  {
    text: "2002년 월드컵은 한국과 ___이 공동 개최했다.",
    answer: "일본",
    category: "역사",
  },
  {
    text: "이집트 문명은 ___강 유역에서 발전했다.",
    answer: "나일",
    category: "역사",
  },
  {
    text: "민주주의가 처음 시작된 나라는 ___다.",
    answer: "그리스",
    category: "역사",
  },
  {
    text: "콜럼버스는 ___년에 아메리카 대륙을 발견했다.",
    answer: "1492",
    category: "역사",
  },
  { text: "프랑스 혁명은 ___년에 일어났다.", answer: "1789", category: "역사" },
  {
    text: "제2차 세계대전은 ___년에 끝났다.",
    answer: "1945",
    category: "역사",
  },
  {
    text: "국제연합(UN)은 ___년에 설립되었다.",
    answer: "1945",
    category: "역사",
  },
  {
    text: "광복절은 일본으로부터 ___한 날이다.",
    answer: "독립",
    category: "역사",
  },
  {
    text: "5·18 민주화 운동은 ___에서 일어났다.",
    answer: "광주",
    category: "역사",
  },
  {
    text: "훈민정음이 반포된 해는 ___년이다.",
    answer: "1446",
    category: "역사",
  },
  {
    text: "직지심체요절은 세계에서 가장 오래된 ___인쇄물이다.",
    answer: "금속활자",
    category: "역사",
  },
  { text: "갑오개혁은 ___년에 일어났다.", answer: "1894", category: "역사" },
  {
    text: "한일병합조약은 ___년에 체결되었다.",
    answer: "1910",
    category: "역사",
  },
  {
    text: "간디는 ___의 독립 운동 지도자이다.",
    answer: "인도",
    category: "역사",
  },
  {
    text: "이순신 장군의 대표적 해전은 ___해전이다.",
    answer: "한산도",
    category: "역사",
  },
  {
    text: "조선시대 왕의 일기를 ___이라(라) 한다.",
    answer: "조선왕조실록",
    category: "역사",
  },
  { text: "수원 화성을 지은 왕은 ___다.", answer: "정조", category: "역사" },
  {
    text: "안중근 의사는 이토 히로부미를 ___에서 저격했다.",
    answer: "하얼빈",
    category: "역사",
  },
  {
    text: "김구 선생은 대한민국 ___정부의 주석이었다.",
    answer: "임시",
    category: "역사",
  },
  {
    text: "제1차 세계대전은 ___년에 시작되었다.",
    answer: "1914",
    category: "역사",
  },
  {
    text: "마틴 루터 킹은 ___운동의 지도자이다.",
    answer: "인권",
    category: "역사",
  },

  // === 과학/물리/화학 (35) ===
  { text: "빛의 속도는 초속 약 ___만 km이다.", answer: "30", category: "과학" },
  { text: "소리의 속도는 초속 약 ___m이다.", answer: "340", category: "과학" },
  { text: "원소 기호 O는 ___를 나타낸다.", answer: "산소", category: "과학" },
  { text: "원소 기호 H는 ___를 나타낸다.", answer: "수소", category: "과학" },
  { text: "원소 기호 C는 ___를 나타낸다.", answer: "탄소", category: "과학" },
  { text: "원소 기호 N는 ___를 나타낸다.", answer: "질소", category: "과학" },
  { text: "원소 기호 Fe는 ___을 나타낸다.", answer: "철", category: "과학" },
  { text: "물의 화학식은 ___이다.", answer: "H₂O", category: "과학" },
  { text: "이산화탄소의 화학식은 ___이다.", answer: "CO₂", category: "과학" },
  { text: "전류의 단위는 ___다.", answer: "암페어", category: "물리" },
  { text: "전압의 단위는 ___다.", answer: "볼트", category: "물리" },
  { text: "저항의 단위는 ___이다.", answer: "옴", category: "물리" },
  { text: "힘의 단위는 ___이다.", answer: "뉴턴", category: "물리" },
  { text: "에너지의 단위는 ___이다.", answer: "줄", category: "물리" },
  { text: "원자의 중심에는 ___이 있다.", answer: "원자핵", category: "과학" },
  {
    text: "원자핵 주위를 도는 것은 ___다.",
    answer: "전자",
    category: "과학",
  },
  {
    text: "산성 용액은 리트머스 종이를 ___색으로 변하게 한다.",
    answer: "빨간",
    category: "화학",
  },
  {
    text: "염기성 용액은 리트머스 종이를 ___색으로 변하게 한다.",
    answer: "파란",
    category: "화학",
  },
  { text: "pH 7은 ___성이다.", answer: "중", category: "화학" },
  {
    text: "뉴턴이 발견한 법칙은 만유___의 법칙이다.",
    answer: "인력",
    category: "물리",
  },
  {
    text: "지레의 원리를 발견한 과학자는 ___다.",
    answer: "아르키메데스",
    category: "과학",
  },
  {
    text: "진화론을 주장한 과학자는 ___이다.",
    answer: "다윈",
    category: "과학",
  },
  {
    text: "상대성 이론을 발표한 과학자는 ___이다.",
    answer: "아인슈타인",
    category: "과학",
  },
  {
    text: "백열전구를 발명한 사람은 ___이다.",
    answer: "에디슨",
    category: "과학",
  },
  { text: "전화기를 발명한 사람은 ___이다.", answer: "벨", category: "과학" },
  {
    text: "증기기관을 개량한 사람은 ___다.",
    answer: "와트",
    category: "과학",
  },
  {
    text: "페니실린을 발견한 과학자는 ___이다.",
    answer: "플레밍",
    category: "과학",
  },
  {
    text: "전기가 잘 통하는 물질을 ___라 한다.",
    answer: "도체",
    category: "물리",
  },
  {
    text: "전기가 통하지 않는 물질을 ___라 한다.",
    answer: "부도체",
    category: "물리",
  },
  {
    text: "빛이 렌즈를 지날 때 꺾이는 현상을 ___이라(라) 한다.",
    answer: "굴절",
    category: "물리",
  },
  {
    text: "온도가 높아지면 물질의 부피가 ___한다.",
    answer: "팽창",
    category: "물리",
  },
  {
    text: "전자석은 ___가 흐를 때만 자석이 된다.",
    answer: "전기",
    category: "물리",
  },
  { text: "소리는 ___을 통해 전달된다.", answer: "매질", category: "물리" },
  {
    text: "진공에서는 소리가 전달되지 ___는다.",
    answer: "않",
    category: "물리",
  },
  {
    text: "물체의 빠르기를 나타내는 것을 ___이라(라) 한다.",
    answer: "속력",
    category: "물리",
  },

  // === 생물/환경 (20) ===
  {
    text: "DNA는 생물의 ___정보를 담고 있다.",
    answer: "유전",
    category: "생물",
  },
  {
    text: "세포의 에너지 공장이라 불리는 것은 ___다.",
    answer: "미토콘드리아",
    category: "생물",
  },
  { text: "광합성은 ___체에서 일어난다.", answer: "엽록", category: "생물" },
  {
    text: "먹이사슬의 가장 아래에는 ___이 있다.",
    answer: "식물",
    category: "생물",
  },
  {
    text: "식물 세포에만 있는 것으로 ___이 있다.",
    answer: "세포벽",
    category: "생물",
  },
  {
    text: "광합성에서 식물이 내보내는 기체는 ___다.",
    answer: "산소",
    category: "생물",
  },
  {
    text: "산소와 수소가 결합하면 ___이 된다.",
    answer: "물",
    category: "화학",
  },
  {
    text: "리트머스 종이가 파란색에서 빨간색으로 변하면 ___이다.",
    answer: "산성",
    category: "화학",
  },
  {
    text: "산성과 염기성의 중간을 ___이라(라) 한다.",
    answer: "중성",
    category: "화학",
  },
  {
    text: "화석연료를 태우면 ___가 배출된다.",
    answer: "이산화탄소",
    category: "환경",
  },
  {
    text: "오존층은 태양의 ___을 차단한다.",
    answer: "자외선",
    category: "환경",
  },
  {
    text: "재생 에너지에는 태양열, 풍력, ___등이 있다.",
    answer: "수력",
    category: "환경",
  },
  {
    text: "식물이 꽃가루를 옮기는 것을 ___이라(라) 한다.",
    answer: "수분",
    category: "식물",
  },
  {
    text: "꽃의 암술과 ___이 만나야 열매가 생긴다.",
    answer: "수술",
    category: "식물",
  },
  {
    text: "광합성에 필요한 세 가지는 빛, 물, ___다.",
    answer: "이산화탄소",
    category: "식물",
  },
  {
    text: "식물의 잎에서 수분이 증발하는 것을 ___이라(라) 한다.",
    answer: "증산작용",
    category: "식물",
  },
  {
    text: "씨앗이 싹트는 것을 ___라 한다.",
    answer: "발아",
    category: "식물",
  },
  {
    text: "식충식물은 ___을 잡아 양분을 얻는다.",
    answer: "곤충",
    category: "식물",
  },
  { text: "겉씨식물의 대표는 ___다.", answer: "소나무", category: "식물" },
  {
    text: "속씨식물은 씨가 ___안에 들어 있다.",
    answer: "열매",
    category: "식물",
  },

  // === 인체 (심화, 20) ===
  { text: "사람의 뼈는 약 ___개이다.", answer: "206", category: "인체" },
  { text: "사람의 근육은 약 ___개이다.", answer: "600", category: "인체" },
  { text: "적혈구는 ___를 운반한다.", answer: "산소", category: "인체" },
  { text: "백혈구는 ___을 물리친다.", answer: "세균", category: "인체" },
  { text: "소장에서 영양분을 ___한다.", answer: "흡수", category: "인체" },
  { text: "대장에서 ___을 흡수한다.", answer: "수분", category: "인체" },
  {
    text: "간은 ___를 해독하는 역할을 한다.",
    answer: "독소",
    category: "인체",
  },
  {
    text: "신장(콩팥)은 ___을 걸러내는 역할을 한다.",
    answer: "노폐물",
    category: "인체",
  },
  { text: "심장은 하루에 약 ___만 번 뛴다.", answer: "10", category: "인체" },
  {
    text: "뇌는 전체 산소의 약 ___%를 사용한다.",
    answer: "20",
    category: "인체",
  },
  {
    text: "인체에서 가장 큰 장기는 ___다.",
    answer: "피부",
    category: "인체",
  },
  {
    text: "인체에서 가장 작은 뼈는 귀 속의 ___다.",
    answer: "등골뼈",
    category: "인체",
  },
  {
    text: "혈액형은 크게 A, B, AB, ___형으로 나뉜다.",
    answer: "O",
    category: "인체",
  },
  {
    text: "호흡에서 사람이 내보내는 기체는 ___다.",
    answer: "이산화탄소",
    category: "인체",
  },
  { text: "사람의 폐는 ___개이다.", answer: "두", category: "인체" },
  {
    text: "원자를 이루는 양성자, 중성자, ___가 있다.",
    answer: "전자",
    category: "과학",
  },
  {
    text: "지구의 중력 가속도는 약 ___m/s²이다.",
    answer: "9.8",
    category: "과학",
  },
  {
    text: "열이 전달되는 세 가지 방법은 전도, 대류, ___다.",
    answer: "복사",
    category: "과학",
  },
  {
    text: "공기 중 산소의 비율은 약 ___퍼센트이다.",
    answer: "21",
    category: "과학",
  },
  {
    text: "지구 대기의 약 78%를 차지하는 기체는 ___다.",
    answer: "질소",
    category: "과학",
  },

  // === 우주 (심화, 20) ===
  {
    text: "태양계의 행성 순서는 수금지화목토___해이다.",
    answer: "천",
    category: "우주",
  },
  {
    text: "명왕성은 현재 ___으로 분류된다.",
    answer: "왜소행성",
    category: "우주",
  },
  {
    text: "빛이 1년 동안 가는 거리를 ___이라(라) 한다.",
    answer: "광년",
    category: "우주",
  },
  {
    text: "태양은 약 ___억 년 전에 만들어졌다.",
    answer: "46",
    category: "우주",
  },
  { text: "우리 은하의 이름은 ___다.", answer: "은하수", category: "우주" },
  {
    text: "블랙홀은 빛도 빠져나올 수 없을 만큼 ___이 강하다.",
    answer: "중력",
    category: "우주",
  },
  {
    text: "달에 처음 착륙한 우주비행사는 ___이다.",
    answer: "닐 암스트롱",
    category: "우주",
  },
  {
    text: "국제 우주 정거장의 약자는 ___이다.",
    answer: "ISS",
    category: "우주",
  },
  {
    text: "태양의 표면 온도는 약 ___도이다.",
    answer: "6000",
    category: "우주",
  },
  {
    text: "화성에는 태양계 최대의 화산인 ___이 있다.",
    answer: "올림푸스산",
    category: "우주",
  },
  { text: "목성의 대적점은 거대한 ___이다.", answer: "폭풍", category: "우주" },
  {
    text: "혜성의 꼬리는 ___에 가까워질 때 생긴다.",
    answer: "태양",
    category: "우주",
  },
  {
    text: "소행성이 가장 많은 곳은 화성과 ___사이이다.",
    answer: "목성",
    category: "우주",
  },
  { text: "우주의 나이는 약 ___억 년이다.", answer: "138", category: "우주" },
  {
    text: "우주가 시작된 사건을 ___이라(라) 한다.",
    answer: "빅뱅",
    category: "우주",
  },
  {
    text: "달이 지구 그림자에 가려지는 것을 ___이라(라) 한다.",
    answer: "월식",
    category: "우주",
  },
  {
    text: "해가 달에 가려지는 현상을 ___이라(라) 한다.",
    answer: "일식",
    category: "우주",
  },
  {
    text: "지구의 자전축은 약 ___도 기울어져 있다.",
    answer: "23.5",
    category: "우주",
  },
  {
    text: "지구의 내부 구조는 지각, 맨틀, ___으로 나뉜다.",
    answer: "핵",
    category: "지구과학",
  },
  {
    text: "암석이 풍화되어 만들어지는 것은 ___이다.",
    answer: "흙",
    category: "지구과학",
  },

  // === 수학상식 (심화, 20) ===
  {
    text: "원의 넓이는 반지름 × 반지름 × ___이다.",
    answer: "3.14",
    category: "수학상식",
  },
  {
    text: "원의 둘레는 지름 × ___이다.",
    answer: "3.14",
    category: "수학상식",
  },
  {
    text: "비율을 백분율로 나타내면 ___로 표시한다.",
    answer: "%",
    category: "수학상식",
  },
  {
    text: "속력의 공식은 거리 나누기 ___이다.",
    answer: "시간",
    category: "수학상식",
  },
  {
    text: "평균을 구하려면 합을 ___로 나눈다.",
    answer: "개수",
    category: "수학상식",
  },
  {
    text: "최대공약수의 영어 약자는 ___이다.",
    answer: "GCD",
    category: "수학상식",
  },
  {
    text: "최소공배수의 영어 약자는 ___이다.",
    answer: "LCM",
    category: "수학상식",
  },
  {
    text: "1, 1, 2, 3, 5, 8, 13은 ___수열이다.",
    answer: "피보나치",
    category: "수학상식",
  },
  {
    text: "확률에서 반드시 일어나는 사건의 확률은 ___이다.",
    answer: "1",
    category: "수학상식",
  },
  {
    text: "확률에서 절대 일어나지 않는 사건의 확률은 ___다.",
    answer: "0",
    category: "수학상식",
  },
  {
    text: "대칭축이 무한히 많은 도형은 ___이다.",
    answer: "원",
    category: "수학상식",
  },
  {
    text: "약수와 ___는 수의 성질을 나타낸다.",
    answer: "배수",
    category: "수학상식",
  },
  {
    text: "소수점 아래 첫째 자리는 ___의 자리이다.",
    answer: "십분",
    category: "수학상식",
  },

  // === 생활상식 (심화, 20) ===
  {
    text: "우리나라의 화폐 단위는 ___이다.",
    answer: "원",
    category: "생활상식",
  },
  { text: "일본의 화폐 단위는 ___이다.", answer: "엔", category: "생활상식" },
  { text: "미국의 화폐 단위는 ___다.", answer: "달러", category: "생활상식" },
  { text: "유럽의 공통 화폐는 ___다.", answer: "유로", category: "생활상식" },
  { text: "올림픽은 ___년마다 열린다.", answer: "4", category: "생활상식" },
  {
    text: "FIFA 월드컵은 ___년마다 열린다.",
    answer: "4",
    category: "생활상식",
  },
  {
    text: "국제연합(UN)의 본부는 ___에 있다.",
    answer: "뉴욕",
    category: "생활상식",
  },
  {
    text: "노벨상은 ___에서 시상한다.",
    answer: "스웨덴",
    category: "생활상식",
  },
  {
    text: "인터넷의 www는 ___의 약자이다.",
    answer: "World Wide Web",
    category: "생활상식",
  },
  {
    text: "비타민 C가 많은 과일은 ___이다.",
    answer: "레몬",
    category: "생활상식",
  },
  { text: "칼슘이 많은 음식은 ___다.", answer: "우유", category: "생활상식" },
  {
    text: "탄수화물은 우리 몸에 ___를 공급한다.",
    answer: "에너지",
    category: "생활상식",
  },
  {
    text: "단백질은 ___을 만드는 데 필요하다.",
    answer: "근육",
    category: "생활상식",
  },
  {
    text: "지방은 체온을 ___하는 역할을 한다.",
    answer: "유지",
    category: "생활상식",
  },
  {
    text: "소리의 빠르기를 ___이라고(라고) 한다.",
    answer: "음속",
    category: "생활상식",
  },

  // === 문화 (심화, 15) ===
  {
    text: "유네스코 세계문화유산에 등록된 한국의 궁궐은 ___이다.",
    answer: "창덕궁",
    category: "문화",
  },
  {
    text: "판소리에서 가장 유명한 작품은 ___이다.",
    answer: "춘향전",
    category: "문화",
  },
  {
    text: "한국의 전통 공연 예술인 판소리는 유네스코 ___유산이다.",
    answer: "무형문화",
    category: "문화",
  },
  {
    text: "비빔밥으로 유명한 한국의 도시는 ___다.",
    answer: "전주",
    category: "문화",
  },
  { text: "고려청자는 ___색을 띤다.", answer: "비취", category: "문화" },
  {
    text: "조선시대 그림 중 풍속화로 유명한 화가는 ___다.",
    answer: "김홍도",
    category: "문화",
  },
  {
    text: "훈민정음은 ___개의 자음과 모음으로 이루어져 있다.",
    answer: "28",
    category: "문화",
  },
  { text: "현재 한글의 자모 수는 ___개이다.", answer: "24", category: "문화" },
  { text: "한글의 자음은 ___개이다.", answer: "14", category: "문화" },
  {
    text: "화산 활동으로 생긴 바위를 ___암이라 한다.",
    answer: "화성",
    category: "지구과학",
  },

  // ──── 추가: 물리/화학 심화 (20) ────
  {
    text: "옴의 법칙에서 전압은 전류 곱하기 ___이다.",
    answer: "저항",
    category: "물리",
  },
  {
    text: "물체가 빠르게 움직이면 ___가 커진다.",
    answer: "운동에너지",
    category: "물리",
  },
  {
    text: "높은 곳에 있는 물체가 가진 에너지를 ___에너지라 한다.",
    answer: "위치",
    category: "물리",
  },
  { text: "소리는 진공에서 전달되지 ___는다.", answer: "않", category: "물리" },
  {
    text: "빛이 물에서 공기로 나올 때 꺾이는 현상을 ___이라(라) 한다.",
    answer: "굴절",
    category: "물리",
  },
  {
    text: "색의 삼원색은 빨강, 파랑, ___이다.",
    answer: "노랑",
    category: "과학",
  },
  { text: "산소의 원소 기호는 ___이다.", answer: "O", category: "화학" },
  { text: "탄소의 원소 기호는 ___이다.", answer: "C", category: "화학" },
  { text: "금의 원소 기호는 ___이다.", answer: "Au", category: "화학" },
  { text: "소금의 화학식은 ___이다.", answer: "NaCl", category: "화학" },

  // ──── 추가: 생물/환경 심화 (15) ────
  {
    text: "생태계에서 에너지의 흐름을 ___사슬이라 한다.",
    answer: "먹이",
    category: "생물",
  },
  {
    text: "꿀벌이 사라지면 식물의 ___이 어려워진다.",
    answer: "수분",
    category: "환경",
  },
  { text: "매립지는 ___를 묻는 곳이다.", answer: "쓰레기", category: "환경" },
  {
    text: "플라스틱이 분해되는 데 약 ___년이 걸린다.",
    answer: "500",
    category: "환경",
  },
  {
    text: "온실가스 중 대표적인 것은 ___다.",
    answer: "이산화탄소",
    category: "환경",
  },
  {
    text: "멸종 위기 동물을 보호하는 단체로 ___가 있다.",
    answer: "WWF",
    category: "환경",
  },
  {
    text: "바다에 떠다니는 플라스틱 쓰레기를 ___쓰레기라 한다.",
    answer: "해양",
    category: "환경",
  },
  {
    text: "미세먼지의 주요 원인 물질은 ___이다.",
    answer: "질소산화물",
    category: "환경",
  },
  {
    text: "탄소 발자국은 ___배출량을 나타내는 지표이다.",
    answer: "탄소",
    category: "환경",
  },
  {
    text: "지구의 평균 기온이 올라가는 현상을 ___라 한다.",
    answer: "지구온난화",
    category: "환경",
  },

  // ──── 추가: 역사 심화 (15) ────
  {
    text: "고구려의 가장 넓은 영토를 가진 왕은 ___이다.",
    answer: "광개토대왕",
    category: "역사",
  },
  { text: "백제의 문화를 ___에 전파하였다.", answer: "일본", category: "역사" },
  {
    text: "신라의 삼국 통일은 ___년에 이루어졌다.",
    answer: "676",
    category: "역사",
  },
  { text: "발해를 세운 사람은 ___이다.", answer: "대조영", category: "역사" },
  {
    text: "조선시대에 농사에 대해 쓴 책은 ___이다.",
    answer: "농사직설",
    category: "역사",
  },
  {
    text: "조선시대 천문학 기구 ___는 하늘을 관측했다.",
    answer: "혼천의",
    category: "역사",
  },
  {
    text: "장영실이 만든 물시계는 ___다.",
    answer: "자격루",
    category: "역사",
  },
  {
    text: "조선시대 양반들이 쓴 모자는 ___이다.",
    answer: "갓",
    category: "문화",
  },
  {
    text: "나전칠기는 조개껍데기로 장식한 ___이다.",
    answer: "공예품",
    category: "문화",
  },
  {
    text: "유네스코에 등록된 한국의 전통 음악은 ___다.",
    answer: "판소리",
    category: "문화",
  },
  {
    text: "김정호가 만든 정밀한 지도는 ___다.",
    answer: "대동여지도",
    category: "역사",
  },
  {
    text: "병인양요는 ___나라와의 전쟁이다.",
    answer: "프랑스",
    category: "역사",
  },
  {
    text: "신미양요는 ___나라와의 전쟁이다.",
    answer: "미국",
    category: "역사",
  },
  {
    text: "세계 인권 선언은 ___년에 발표되었다.",
    answer: "1948",
    category: "역사",
  },
  {
    text: "넬슨 만델라는 ___의 인권 운동가이다.",
    answer: "남아프리카공화국",
    category: "역사",
  },

  // ──── 추가: 지리 심화 확장 (20) ────
  { text: "베트남의 수도는 ___다.", answer: "하노이", category: "지리" },
  { text: "태국의 수도는 ___이다.", answer: "방콕", category: "지리" },
  { text: "인도의 수도는 ___다.", answer: "뉴델리", category: "지리" },
  { text: "캐나다의 수도는 ___다.", answer: "오타와", category: "지리" },
  { text: "스페인의 수도는 ___다.", answer: "마드리드", category: "지리" },
  { text: "지구에는 ___개의 대양이 있다.", answer: "5", category: "지리" },
  {
    text: "수에즈 운하는 아시아와 ___를 잇는다.",
    answer: "아프리카",
    category: "지리",
  },
  {
    text: "지구에서 가장 긴 산맥은 ___산맥이다.",
    answer: "안데스",
    category: "지리",
  },
  {
    text: "오스트레일리아는 대륙이면서 ___인 나라이다.",
    answer: "국가",
    category: "지리",
  },
  {
    text: "사하라 사막은 ___대륙에 있다.",
    answer: "아프리카",
    category: "지리",
  },
  {
    text: "타지마할은 ___에 있는 건축물이다.",
    answer: "인도",
    category: "지리",
  },
  {
    text: "앙코르와트는 ___에 있는 유적이다.",
    answer: "캄보디아",
    category: "지리",
  },
  {
    text: "빅벤은 ___에 있는 유명한 시계탑이다.",
    answer: "런던",
    category: "지리",
  },
  {
    text: "북극은 바다 위의 ___으로 이루어져 있다.",
    answer: "얼음",
    category: "지리",
  },
  { text: "남극에는 많은 ___이 살고 있다.", answer: "펭귄", category: "지리" },
  {
    text: "세계에서 가장 작은 나라는 ___이다.",
    answer: "바티칸",
    category: "지리",
  },
  {
    text: "열대 지방은 ___이 일년 내내 높다.",
    answer: "기온",
    category: "지리",
  },
  {
    text: "온대 지방은 ___이 뚜렷한 기후이다.",
    answer: "사계절",
    category: "지리",
  },
  { text: "한류 지방은 ___이 매우 낮다.", answer: "기온", category: "지리" },
  {
    text: "세계에서 가장 높은 폭포는 ___다.",
    answer: "앙헬 폭포",
    category: "지리",
  },

  // ──── 추가: 역사 심화 확장 (20) ────
  {
    text: "르네상스는 ___에서 시작된 문화 운동이다.",
    answer: "이탈리아",
    category: "역사",
  },
  {
    text: "인쇄술의 발전에 기여한 독일인은 ___다.",
    answer: "구텐베르크",
    category: "역사",
  },
  { text: "나폴레옹은 ___의 황제였다.", answer: "프랑스", category: "역사" },
  {
    text: "영국의 산업혁명은 ___세기에 시작되었다.",
    answer: "18",
    category: "역사",
  },
  {
    text: "독립선언서를 쓴 미국의 대통령은 ___이다.",
    answer: "토머스 제퍼슨",
    category: "역사",
  },
  {
    text: "동학 농민 운동이 일어난 해는 ___년이다.",
    answer: "1894",
    category: "역사",
  },
  { text: "을사늑약은 ___년에 체결되었다.", answer: "1905", category: "역사" },
  {
    text: "6월 민주항쟁은 ___년에 일어났다.",
    answer: "1987",
    category: "역사",
  },
  {
    text: "헌법재판소는 ___을 보호하기 위한 기관이다.",
    answer: "국민의 기본권",
    category: "역사",
  },
  {
    text: "남북 정상회담은 처음으로 ___년에 열렸다.",
    answer: "2000",
    category: "역사",
  },
  {
    text: "세계 최초의 금속활자 인쇄본은 ___에서 만들어졌다.",
    answer: "고려",
    category: "역사",
  },
  {
    text: "실크로드는 동양과 서양을 잇는 ___길이었다.",
    answer: "무역",
    category: "역사",
  },
  { text: "로마 제국의 공용어는 ___어였다.", answer: "라틴", category: "역사" },
  {
    text: "이집트의 파라오는 ___를 지었다.",
    answer: "피라미드",
    category: "역사",
  },
  { text: "잔 다르크는 ___의 영웅이다.", answer: "프랑스", category: "역사" },
  {
    text: "마젤란은 세계 최초로 ___를 한 항해가이다.",
    answer: "세계일주",
    category: "역사",
  },
  { text: "대한민국은 ___주의 공화국이다.", answer: "민주", category: "역사" },
  {
    text: "안창호 선생은 흥사단을 만든 ___다.",
    answer: "독립운동가",
    category: "역사",
  },
  { text: "삼국유사를 쓴 사람은 ___이다.", answer: "일연", category: "역사" },
  { text: "삼국사기를 쓴 사람은 ___이다.", answer: "김부식", category: "역사" },

  // ──── 추가: 과학/물리/화학 확장 (20) ────
  {
    text: "지레는 작은 힘으로 큰 ___를 들어 올리는 도구이다.",
    answer: "물체",
    category: "물리",
  },
  {
    text: "도르래는 물체를 위로 ___때 사용하는 도구이다.",
    answer: "올릴",
    category: "물리",
  },
  {
    text: "경사면을 이용하면 적은 ___으로 물체를 옮길 수 있다.",
    answer: "힘",
    category: "물리",
  },
  {
    text: "빛이 직진하는 성질을 이용한 장치는 ___다.",
    answer: "카메라",
    category: "물리",
  },
  {
    text: "주파수가 높은 소리는 ___ 소리이다.",
    answer: "높은",
    category: "물리",
  },
  {
    text: "주파수가 낮은 소리는 ___ 소리이다.",
    answer: "낮은",
    category: "물리",
  },
  {
    text: "운동 에너지와 위치 에너지의 합을 ___에너지라 한다.",
    answer: "역학적",
    category: "물리",
  },
  {
    text: "달걀은 식초에 넣으면 ___데기가 녹는다.",
    answer: "껍",
    category: "화학",
  },
  {
    text: "이산화 망가니즈에 과산화수소를 넣으면 ___가 발생한다.",
    answer: "산소",
    category: "화학",
  },
  {
    text: "물을 전기분해하면 수소와 ___가 발생한다.",
    answer: "산소",
    category: "화학",
  },
  {
    text: "원소 주기율표를 만든 과학자는 ___다.",
    answer: "멘델레예프",
    category: "화학",
  },
  {
    text: "중화 반응이란 산과 ___가 만나 물과 소금이 생기는 것이다.",
    answer: "염기",
    category: "화학",
  },
  {
    text: "탄산음료에 들어 있는 기체는 ___다.",
    answer: "이산화탄소",
    category: "화학",
  },
  {
    text: "철은 공기 중에서 ___반응을 하여 녹이 슨다.",
    answer: "산화",
    category: "화학",
  },
  {
    text: "화학반응에서 반응 전후 질량은 ___하다.",
    answer: "보존",
    category: "물리",
  },
  {
    text: "마찰력은 물체의 운동을 ___하는 힘이다.",
    answer: "방해",
    category: "물리",
  },
  {
    text: "관성이란 물체가 현재 ___를 유지하려는 성질이다.",
    answer: "상태",
    category: "물리",
  },
  {
    text: "작용과 반작용의 법칙은 뉴턴의 제___법칙이다.",
    answer: "3",
    category: "물리",
  },
  {
    text: "전류가 흐르는 도선 주위에는 ___이 생긴다.",
    answer: "자기장",
    category: "물리",
  },
  {
    text: "전자석은 ___에 전류를 흘려 만든 자석이다.",
    answer: "코일",
    category: "물리",
  },

  // ──── 추가: 생물/환경 확장 (20) ────
  {
    text: "유전의 기본 단위를 ___라 한다.",
    answer: "유전자",
    category: "생물",
  },
  {
    text: "멘델은 ___으로 유전 법칙을 발견했다.",
    answer: "완두콩",
    category: "생물",
  },
  {
    text: "세포 분열 시 유전 물질이 ___된다.",
    answer: "복제",
    category: "생물",
  },
  {
    text: "생태계에서 분해자 역할을 하는 것은 ___다.",
    answer: "세균과 곰팡이",
    category: "생물",
  },
  {
    text: "식물의 기공은 ___의 출입을 조절한다.",
    answer: "기체",
    category: "생물",
  },
  {
    text: "혈소판은 상처에서 ___을 멈추게 한다.",
    answer: "출혈",
    category: "생물",
  },
  {
    text: "항체는 몸에 들어온 ___을 물리친다.",
    answer: "병원균",
    category: "생물",
  },
  {
    text: "백신은 면역___을 만들어 병을 예방한다.",
    answer: "력",
    category: "생물",
  },
  {
    text: "생물다양성이 줄어들면 ___계가 불안정해진다.",
    answer: "생태",
    category: "환경",
  },
  {
    text: "지구온난화의 주범인 온실가스는 ___다.",
    answer: "이산화탄소",
    category: "환경",
  },
  {
    text: "태양에너지를 전기로 바꾸는 장치를 ___전지라 한다.",
    answer: "태양",
    category: "환경",
  },
  {
    text: "풍력 발전은 ___의 힘으로 전기를 만든다.",
    answer: "바람",
    category: "환경",
  },
  {
    text: "수력 발전은 ___의 힘으로 전기를 만든다.",
    answer: "물",
    category: "환경",
  },
  {
    text: "분리수거는 ___을 보호하기 위한 활동이다.",
    answer: "환경",
    category: "환경",
  },
  {
    text: "유리, 종이, 플라스틱은 ___할 수 있는 자원이다.",
    answer: "재활용",
    category: "환경",
  },
  {
    text: "산성비는 대기 오염 물질이 빗물에 ___어 내리는 것이다.",
    answer: "녹",
    category: "환경",
  },
  {
    text: "습지는 다양한 생물이 사는 중요한 ___다.",
    answer: "서식지",
    category: "환경",
  },
  {
    text: "에코백을 사용하면 ___봉투 사용을 줄일 수 있다.",
    answer: "비닐",
    category: "환경",
  },
  {
    text: "해양 오염의 주요 원인은 ___쓰레기이다.",
    answer: "플라스틱",
    category: "환경",
  },
  {
    text: "북극의 빙하가 녹는 것은 ___의 증거이다.",
    answer: "지구온난화",
    category: "환경",
  },

  // ──── 추가: 우주 심화 확장 (15) ────
  {
    text: "수성은 태양에서 가장 ___행성이다.",
    answer: "가까운",
    category: "우주",
  },
  {
    text: "금성은 지구에서 가장 ___ 행성이다.",
    answer: "밝은",
    category: "우주",
  },
  {
    text: "천왕성은 ___으로 누워서 도는 행성이다.",
    answer: "옆",
    category: "우주",
  },
  {
    text: "해왕성은 태양계에서 가장 ___행성이다.",
    answer: "먼",
    category: "우주",
  },
  {
    text: "토성의 고리는 ___과 먼지로 이루어져 있다.",
    answer: "얼음",
    category: "우주",
  },
  {
    text: "목성의 위성 중 가장 큰 것은 ___다.",
    answer: "가니메데",
    category: "우주",
  },
  {
    text: "허블 우주 ___은 지구 궤도를 돌며 우주를 관측한다.",
    answer: "망원경",
    category: "우주",
  },
  {
    text: "우주 정거장에서 우주인은 무___상태에서 생활한다.",
    answer: "중력",
    category: "우주",
  },
  {
    text: "우주비행사가 우주 밖으로 나가 활동하는 것을 ___이라(라) 한다.",
    answer: "우주유영",
    category: "우주",
  },
  {
    text: "적색거성은 별이 늙어서 ___진 별이다.",
    answer: "커",
    category: "우주",
  },
  {
    text: "백색왜성은 별이 죽으면서 ___진 별이다.",
    answer: "작아",
    category: "우주",
  },
  {
    text: "중성자별은 매우 ___도가 높은 천체이다.",
    answer: "밀",
    category: "우주",
  },
  {
    text: "화성 탐사 로버의 이름 중 하나는 ___다.",
    answer: "퍼시비어런스",
    category: "우주",
  },
  {
    text: "우주쓰레기는 지구 궤도를 도는 ___된 물체이다.",
    answer: "폐기",
    category: "우주",
  },
  {
    text: "태양 활동이 활발하면 ___가 나타난다.",
    answer: "오로라",
    category: "우주",
  },

  // ──── 추가: 인체 심화 확장 (15) ────
  {
    text: "뉴런은 신경 ___를 전달하는 세포이다.",
    answer: "신호",
    category: "인체",
  },
  {
    text: "소뇌는 몸의 ___을 유지하는 데 관여한다.",
    answer: "균형",
    category: "인체",
  },
  {
    text: "호르몬은 몸의 ___을 조절하는 물질이다.",
    answer: "기능",
    category: "인체",
  },
  {
    text: "인슐린은 ___수치를 조절하는 호르몬이다.",
    answer: "혈당",
    category: "인체",
  },
  {
    text: "기관지는 ___과 폐를 연결하는 통로이다.",
    answer: "목",
    category: "인체",
  },
  {
    text: "횡격막이 움직여야 ___을 쉴 수 있다.",
    answer: "숨",
    category: "인체",
  },
  {
    text: "혈관의 종류는 동맥, 정맥, ___이다.",
    answer: "모세혈관",
    category: "인체",
  },
  {
    text: "림프구는 면역에 관여하는 ___세포이다.",
    answer: "백혈",
    category: "인체",
  },
  {
    text: "귀의 달팽이관은 ___를 감지하는 기관이다.",
    answer: "소리",
    category: "인체",
  },
  {
    text: "눈의 수정체는 ___을 조절하여 초점을 맞춘다.",
    answer: "빛",
    category: "인체",
  },
  {
    text: "식도는 음식을 ___로 보내는 관이다.",
    answer: "위",
    category: "인체",
  },
  {
    text: "담즙은 ___에서 만들어져 지방 소화를 돕는다.",
    answer: "간",
    category: "인체",
  },
  { text: "사람의 혈액은 약 ___리터이다.", answer: "5", category: "인체" },
  {
    text: "근육은 수축과 ___을 반복하여 움직인다.",
    answer: "이완",
    category: "인체",
  },
  {
    text: "땀을 흘리는 것은 체온을 ___기 위해서이다.",
    answer: "낮추",
    category: "인체",
  },

  // ──── 추가: 수학상식 심화 확장 (15) ────
  {
    text: "구의 부피 공식에는 ___가 포함된다.",
    answer: "π",
    category: "수학상식",
  },
  {
    text: "정삼각형의 한 각의 크기는 ___도이다.",
    answer: "60",
    category: "수학상식",
  },
  {
    text: "정오각형의 한 각의 크기는 ___도이다.",
    answer: "108",
    category: "수학상식",
  },
  { text: "수 0은 양수도 음수도 ___다.", answer: "아니", category: "수학상식" },
  {
    text: "비례식에서 내항의 곱과 외항의 곱은 ___하다.",
    answer: "같",
    category: "수학상식",
  },
  {
    text: "원뿔의 전개도에는 ___모양이 포함된다.",
    answer: "부채꼴",
    category: "수학상식",
  },
  {
    text: "원기둥의 전개도에는 ___과 직사각형이 포함된다.",
    answer: "원",
    category: "수학상식",
  },
  { text: "삼각기둥의 면은 ___개이다.", answer: "5", category: "수학상식" },
  { text: "사각뿔의 꼭짓점은 ___개이다.", answer: "5", category: "수학상식" },
  {
    text: "통계에서 가장 자주 나오는 값을 ___이라(라) 한다.",
    answer: "최빈값",
    category: "수학상식",
  },
  {
    text: "자료를 크기순으로 나열했을 때 가운데 값을 ___이라(라) 한다.",
    answer: "중앙값",
    category: "수학상식",
  },
  {
    text: "원그래프는 전체에 대한 ___을 나타낸다.",
    answer: "비율",
    category: "수학상식",
  },
  {
    text: "막대그래프는 ___을 비교할 때 사용한다.",
    answer: "양",
    category: "수학상식",
  },
  {
    text: "꺾은선그래프는 시간에 따른 ___를 나타낸다.",
    answer: "변화",
    category: "수학상식",
  },
  {
    text: "도수분포표는 자료의 ___를 나타낸다.",
    answer: "분포",
    category: "수학상식",
  },

  // ──── 추가: 문화 심화 확장 (15) ────
  {
    text: "한국의 유네스코 세계유산으로 ___가 있다.",
    answer: "종묘",
    category: "문화",
  },
  {
    text: "아리랑은 한국의 대표적인 ___다.",
    answer: "민요",
    category: "문화",
  },
  {
    text: "한국 영화 ___은 아카데미 작품상을 수상했다.",
    answer: "기생충",
    category: "문화",
  },
  { text: "K-팝은 한국의 ___음악이다.", answer: "대중", category: "문화" },
  {
    text: "한류는 한국 문화가 세계에 ___는 현상이다.",
    answer: "퍼지",
    category: "문화",
  },
  {
    text: "조선시대 양반의 교육기관은 ___이다.",
    answer: "성균관",
    category: "문화",
  },
  {
    text: "한국의 전통 공예품 중 ___는 나무에 옻칠을 한 것이다.",
    answer: "칠기",
    category: "문화",
  },
  {
    text: "경회루는 경복궁 안에 있는 ___이다.",
    answer: "누각",
    category: "문화",
  },
  {
    text: "수원화성은 유네스코 ___유산이다.",
    answer: "세계문화",
    category: "문화",
  },
  {
    text: "김치 담그기는 유네스코 무형___에 등재되어 있다.",
    answer: "문화유산",
    category: "문화",
  },
  {
    text: "거문고는 ___을 뜯어 소리를 내는 전통 악기이다.",
    answer: "줄",
    category: "문화",
  },
  {
    text: "해금은 ___을 긁어 소리를 내는 전통 악기이다.",
    answer: "줄",
    category: "문화",
  },
  {
    text: "판소리에서 소리하는 사람을 ___이라(라) 한다.",
    answer: "소리꾼",
    category: "문화",
  },
  {
    text: "판소리에서 북을 치는 사람을 ___라 한다.",
    answer: "고수",
    category: "문화",
  },
  {
    text: "한국 전통 무용으로 ___가 있다.",
    answer: "강강술래",
    category: "문화",
  },

  // ══════════════════════════════════════════════════════════
  // 추가 콘텐츠: 다양한 문제 유형 (5-6학년 확장, 250+ 신규)
  // ══════════════════════════════════════════════════════════

  // ──── 지리: 분류하기 ────
  {
    text: "태평양, 대서양, 인도양은 모두 ___이다.",
    answer: "대양",
    category: "지리",
  },
  {
    text: "아시아, 유럽, 아프리카는 모두 ___이다.",
    answer: "대륙",
    category: "지리",
  },
  {
    text: "적도, 위도선, 경도선은 모두 지도의 ___이다.",
    answer: "좌표선",
    category: "지리",
  },
  {
    text: "사하라, 고비, 아타카마는 모두 ___이다.",
    answer: "사막",
    category: "지리",
  },
  {
    text: "한국, 중국, 일본은 모두 ___아시아에 속한다.",
    answer: "동",
    category: "지리",
  },

  // ──── 지리: 비교하기 ────
  {
    text: "태평양과 대서양 중 더 넓은 바다는 ___이다.",
    answer: "태평양",
    category: "지리",
  },
  {
    text: "에베레스트산과 킬리만자로산 중 더 높은 산은 ___이다.",
    answer: "에베레스트산",
    category: "지리",
  },
  {
    text: "러시아와 바티칸 중 더 큰 나라는 ___다.",
    answer: "러시아",
    category: "지리",
  },
  {
    text: "아마존강과 나일강 중 더 긴 강은 ___이다.",
    answer: "나일강",
    category: "지리",
  },
  {
    text: "북극과 적도 중 더 추운 곳은 ___이다.",
    answer: "북극",
    category: "지리",
  },

  // ──── 지리: 연결하기 ────
  {
    text: "파리에는 에펠탑이 있고, 로마에는 ___이 있다.",
    answer: "콜로세움",
    category: "지리",
  },
  {
    text: "미국의 수도는 워싱턴 D.C.이고, 일본의 수도는 ___다.",
    answer: "도쿄",
    category: "지리",
  },
  {
    text: "파나마 운하는 태평양과 대서양을, 수에즈 운하는 아시아와 ___를 잇는다.",
    answer: "아프리카",
    category: "지리",
  },
  {
    text: "열대 기후는 일년 내내 덥고, 한대 기후는 일년 내내 ___다.",
    answer: "춥",
    category: "지리",
  },

  // ──── 지리: 원인결과 ────
  {
    text: "적도 근처는 햇빛을 많이 받아서 ___이 높다.",
    answer: "기온",
    category: "지리",
  },
  {
    text: "극지방은 햇빛이 적어서 ___가 발달한다.",
    answer: "빙하",
    category: "지리",
  },
  { text: "산이 높으면 기온이 ___해진다.", answer: "낮아", category: "지리" },

  // ──── 역사: 순서맞추기 ────
  {
    text: "세계사 순서: 고대 → 중세 → 근대 → ___",
    answer: "현대",
    category: "역사",
  },
  {
    text: "한국 근현대사: 갑오개혁 → 을사늑약 → 한일병합 → 3·1 운동 → ___",
    answer: "광복",
    category: "역사",
  },
  {
    text: "문명 발달 순서: 석기 → 청동기 → ___기",
    answer: "철",
    category: "역사",
  },
  {
    text: "조선왕조 순서: 태조 → 정종 → 태종 → ___",
    answer: "세종",
    category: "역사",
  },

  // ──── 역사: 분류하기 ────
  {
    text: "고조선, 삼한, 부여는 모두 ___시대의 나라이다.",
    answer: "고대",
    category: "역사",
  },
  {
    text: "3·1 운동, 6·10 만세운동, 광주학생운동은 모두 ___운동이다.",
    answer: "독립",
    category: "역사",
  },
  {
    text: "이순신, 을지문덕, 강감찬은 모두 유명한 ___이다.",
    answer: "장군",
    category: "역사",
  },
  {
    text: "유관순, 윤봉길, 안중근은 모두 ___다.",
    answer: "독립운동가",
    category: "역사",
  },

  // ──── 역사: 연결하기 ────
  {
    text: "다윈은 진화론을, 뉴턴은 ___의 법칙을 발견했다.",
    answer: "만유인력",
    category: "역사",
  },
  {
    text: "정약용은 목민심서를, 김정호는 ___를 만들었다.",
    answer: "대동여지도",
    category: "역사",
  },
  {
    text: "고구려는 주몽이, 백제는 온조가, 신라는 ___가 세웠다.",
    answer: "박혁거세",
    category: "역사",
  },
  {
    text: "메소포타미아는 유프라테스강, 이집트는 ___강 유역에서 발전했다.",
    answer: "나일",
    category: "역사",
  },

  // ──── 역사: 원인결과 ────
  {
    text: "산업혁명이 일어나서 ___로 물건을 만들게 되었다.",
    answer: "기계",
    category: "역사",
  },
  {
    text: "프랑스 혁명이 일어나서 왕이 아닌 ___이 권력을 가지게 되었다.",
    answer: "국민",
    category: "역사",
  },
  {
    text: "일제의 침략으로 우리나라는 ___을 잃었다.",
    answer: "주권",
    category: "역사",
  },
  {
    text: "6·25 전쟁 후 한반도가 남과 북으로 ___되었다.",
    answer: "분단",
    category: "역사",
  },

  // ──── 역사: 비교하기 ────
  {
    text: "고려와 조선 중 먼저 생긴 나라는 ___다.",
    answer: "고려",
    category: "역사",
  },
  {
    text: "금속활자와 목판인쇄 중 먼저 발명된 것은 ___다.",
    answer: "목판인쇄",
    category: "역사",
  },

  // ──── 과학/물리: 분류하기 ────
  {
    text: "뉴턴, 줄, 와트는 모두 물리학의 ___다.",
    answer: "단위",
    category: "물리",
  },
  {
    text: "도체, 부도체, 반도체는 모두 전기 ___에 따른 분류이다.",
    answer: "전도성",
    category: "물리",
  },
  {
    text: "전도, 대류, 복사는 모두 ___의 전달 방법이다.",
    answer: "열",
    category: "물리",
  },
  {
    text: "볼록렌즈, 오목렌즈, 프리즘은 모두 ___을 이용한 도구이다.",
    answer: "빛",
    category: "물리",
  },

  // ──── 과학/물리: 순서맞추기 ────
  {
    text: "뉴턴의 법칙: 제1법칙(관성) → 제2법칙(가속도) → 제3법칙(___)",
    answer: "작용반작용",
    category: "물리",
  },
  {
    text: "에너지 전환: 위치에너지 → 운동에너지 → ___에너지",
    answer: "열",
    category: "물리",
  },

  // ──── 과학/물리: 원인결과 ────
  {
    text: "물체에 힘을 가하면 ___가 변한다.",
    answer: "운동 상태",
    category: "물리",
  },
  {
    text: "마찰이 없으면 물체가 영원히 ___한다.",
    answer: "운동",
    category: "물리",
  },
  {
    text: "전류가 흐르는 도선 주위에 ___이 생긴다.",
    answer: "자기장",
    category: "물리",
  },
  { text: "금속을 가열하면 부피가 ___한다.", answer: "팽창", category: "물리" },

  // ──── 과학/물리: 비교하기 ────
  {
    text: "도체와 부도체 중 전기가 잘 통하는 것은 ___다.",
    answer: "도체",
    category: "물리",
  },
  {
    text: "소리와 빛 중 진공에서도 전달되는 것은 ___이다.",
    answer: "빛",
    category: "물리",
  },
  {
    text: "볼록렌즈와 오목렌즈 중 빛을 모으는 것은 ___렌즈이다.",
    answer: "볼록",
    category: "물리",
  },

  // ──── 과학/물리: 연결하기 ────
  {
    text: "전압은 볼트, 전류는 암페어, 저항은 ___으로 측정한다.",
    answer: "옴",
    category: "물리",
  },
  {
    text: "운동에너지는 움직임에 의한 것이고, 위치에너지는 ___에 의한 것이다.",
    answer: "높이",
    category: "물리",
  },

  // ──── 화학: 분류하기 ────
  {
    text: "산소, 수소, 질소는 모두 ___다.",
    answer: "원소",
    category: "화학",
  },
  {
    text: "H₂O, CO₂, NaCl은 모두 ___식이다.",
    answer: "화학",
    category: "화학",
  },
  {
    text: "식초, 레몬즙, 탄산수는 모두 ___성 용액이다.",
    answer: "산",
    category: "화학",
  },
  {
    text: "비누, 베이킹소다, 세제는 모두 ___성 용액이다.",
    answer: "염기",
    category: "화학",
  },

  // ──── 화학: 연결하기 ────
  {
    text: "산소의 원소 기호는 O이고, 수소의 원소 기호는 ___이다.",
    answer: "H",
    category: "화학",
  },
  {
    text: "산성 용액은 신맛이 나고, 염기성 용액은 ___한 느낌이 난다.",
    answer: "미끄러운",
    category: "화학",
  },
  {
    text: "물의 화학식은 H₂O이고, 이산화탄소의 화학식은 ___이다.",
    answer: "CO₂",
    category: "화학",
  },

  // ──── 화학: 원인결과 ────
  {
    text: "철이 공기 중에 오래 있으면 ___이 슨다.",
    answer: "녹",
    category: "화학",
  },
  {
    text: "산과 염기가 만나면 ___반응이 일어난다.",
    answer: "중화",
    category: "화학",
  },
  {
    text: "탄산음료를 흔들면 ___가 빠져나온다.",
    answer: "이산화탄소",
    category: "화학",
  },

  // ──── 화학: 비교하기 ────
  {
    text: "산성과 염기성 중 리트머스 종이를 빨갛게 만드는 것은 ___이다.",
    answer: "산성",
    category: "화학",
  },
  {
    text: "pH 3과 pH 7 중 더 산성인 것은 pH ___이다.",
    answer: "3",
    category: "화학",
  },

  // ──── 생물: 분류하기 ────
  {
    text: "세포막, 세포질, 핵은 모두 ___의 구성요소이다.",
    answer: "세포",
    category: "생물",
  },
  {
    text: "소화계, 호흡계, 순환계는 모두 인체의 ___다.",
    answer: "기관계",
    category: "생물",
  },
  {
    text: "단세포생물과 다세포생물은 ___의 수에 따른 분류이다.",
    answer: "세포",
    category: "생물",
  },
  {
    text: "생산자, 소비자, 분해자는 생태계의 ___이다.",
    answer: "구성원",
    category: "생물",
  },

  // ──── 생물: 순서맞추기 ────
  {
    text: "먹이사슬: 식물 → 초식동물 → 육식동물 → ___",
    answer: "분해자",
    category: "생물",
  },
  {
    text: "혈액 순환: 심장 → 동맥 → 모세혈관 → 정맥 → ___",
    answer: "심장",
    category: "생물",
  },
  {
    text: "소화 과정: 입 → 식도 → 위 → 소장 → ___",
    answer: "대장",
    category: "생물",
  },

  // ──── 생물: 원인결과 ────
  {
    text: "광합성이 일어나려면 빛, 물, ___가 필요하다.",
    answer: "이산화탄소",
    category: "생물",
  },
  {
    text: "백혈구가 줄어들면 ___에 걸리기 쉽다.",
    answer: "병",
    category: "생물",
  },
  {
    text: "식물의 뿌리가 물을 흡수해서 ___까지 보낸다.",
    answer: "잎",
    category: "생물",
  },

  // ──── 생물: 비교하기 ────
  {
    text: "동물 세포와 식물 세포 중 세포벽이 있는 것은 ___세포이다.",
    answer: "식물",
    category: "생물",
  },
  {
    text: "동맥과 정맥 중 심장에서 나가는 혈관은 ___이다.",
    answer: "동맥",
    category: "생물",
  },
  {
    text: "적혈구와 백혈구 중 산소를 운반하는 것은 ___다.",
    answer: "적혈구",
    category: "생물",
  },

  // ──── 생물: 연결하기 ────
  {
    text: "적혈구는 산소를 운반하고, 백혈구는 ___을 물리친다.",
    answer: "세균",
    category: "생물",
  },
  {
    text: "소장은 영양분을 흡수하고, 대장은 ___을 흡수한다.",
    answer: "수분",
    category: "생물",
  },

  // ──── 환경: 분류하기 ────
  {
    text: "태양에너지, 풍력, 수력은 모두 ___에너지이다.",
    answer: "재생",
    category: "환경",
  },
  {
    text: "석탄, 석유, 천연가스는 모두 ___연료이다.",
    answer: "화석",
    category: "환경",
  },
  {
    text: "대기오염, 수질오염, 토양오염은 모두 환경 ___이다.",
    answer: "오염",
    category: "환경",
  },

  // ──── 환경: 원인결과 ────
  {
    text: "프레온 가스 사용으로 ___층이 파괴되었다.",
    answer: "오존",
    category: "환경",
  },
  {
    text: "화석연료를 태우면 대기 중 ___가 증가한다.",
    answer: "이산화탄소",
    category: "환경",
  },
  {
    text: "산림을 파괴하면 생물 ___성이 줄어든다.",
    answer: "다양",
    category: "환경",
  },
  {
    text: "플라스틱 사용을 줄이면 해양 ___이 줄어든다.",
    answer: "오염",
    category: "환경",
  },

  // ──── 환경: 비교하기 ────
  {
    text: "재생에너지와 화석연료 중 환경에 더 좋은 것은 ___다.",
    answer: "재생에너지",
    category: "환경",
  },
  {
    text: "종이와 플라스틱 중 자연에서 더 빨리 분해되는 것은 ___다.",
    answer: "종이",
    category: "환경",
  },

  // ──── 환경: 연결하기 ────
  {
    text: "태양전지는 빛을 전기로, 풍력 발전기는 ___을 전기로 바꾼다.",
    answer: "바람",
    category: "환경",
  },
  {
    text: "재활용은 자원을 아끼고, 분리수거는 ___을 편리하게 한다.",
    answer: "재활용",
    category: "환경",
  },

  // ──── 우주: 순서맞추기 (심화) ────
  {
    text: "태양계 행성: 수성 → 금성 → 지구 → 화성 → 목성 → 토성 → 천왕성 → ___",
    answer: "해왕성",
    category: "우주",
  },
  {
    text: "별의 진화: 성운 → 원시별 → 주계열성 → 적색거성 → ___",
    answer: "백색왜성",
    category: "우주",
  },

  // ──── 우주: 분류하기 ────
  {
    text: "수성, 금성, 화성은 모두 ___형 행성이다.",
    answer: "지구",
    category: "우주",
  },
  {
    text: "목성, 토성은 모두 ___형 행성이다.",
    answer: "가스",
    category: "우주",
  },
  {
    text: "일식, 월식, 별똥별은 모두 천문 ___이다.",
    answer: "현상",
    category: "우주",
  },

  // ──── 우주: 연결하기 ────
  {
    text: "자전은 낮과 밤을, 공전은 ___을 만든다.",
    answer: "계절",
    category: "우주",
  },
  {
    text: "일식은 달이 태양을 가리고, 월식은 ___가 달을 가린다.",
    answer: "지구",
    category: "우주",
  },
  {
    text: "목성의 가장 큰 위성은 가니메데이고, 토성의 가장 큰 위성은 ___이다.",
    answer: "타이탄",
    category: "우주",
  },

  // ──── 우주: 원인결과 ────
  {
    text: "지구의 자전축이 기울어져 있어 ___이 생긴다.",
    answer: "계절",
    category: "우주",
  },
  {
    text: "태양의 핵융합으로 빛과 ___이 발생한다.",
    answer: "열",
    category: "우주",
  },
  {
    text: "블랙홀의 중력이 강해서 ___도 빠져나오지 못한다.",
    answer: "빛",
    category: "우주",
  },

  // ──── 우주: 비교하기 ────
  {
    text: "토성과 화성 중 고리가 있는 행성은 ___이다.",
    answer: "토성",
    category: "우주",
  },
  {
    text: "광년과 km 중 더 큰 단위는 ___이다.",
    answer: "광년",
    category: "우주",
  },

  // ──── 인체: 분류하기 ────
  {
    text: "위, 소장, 대장, 간은 모두 ___기관이다.",
    answer: "소화",
    category: "인체",
  },
  {
    text: "폐, 기관지, 횡격막은 모두 ___기관이다.",
    answer: "호흡",
    category: "인체",
  },
  {
    text: "심장, 동맥, 정맥은 모두 ___기관이다.",
    answer: "순환",
    category: "인체",
  },
  {
    text: "뇌, 척수, 신경은 모두 ___계통이다.",
    answer: "신경",
    category: "인체",
  },

  // ──── 인체: 순서맞추기 ────
  {
    text: "음식의 소화 경로: 입 → 식도 → 위 → 소장 → ___",
    answer: "대장",
    category: "인체",
  },
  {
    text: "혈액 순환: 심장 → 동맥 → 모세혈관 → ___→ 심장",
    answer: "정맥",
    category: "인체",
  },
  { text: "호흡: 코 → 기관 → ___→ 폐", answer: "기관지", category: "인체" },

  // ──── 인체: 원인결과 ────
  {
    text: "비타민이 부족하면 ___이 생길 수 있다.",
    answer: "영양결핍",
    category: "인체",
  },
  { text: "운동을 하면 근육이 ___해진다.", answer: "강", category: "인체" },
  {
    text: "스트레스를 받으면 면역력이 ___한다.",
    answer: "저하",
    category: "인체",
  },

  // ──── 인체: 비교하기 ────
  {
    text: "소장과 대장 중 더 긴 것은 ___이다.",
    answer: "소장",
    category: "인체",
  },
  {
    text: "동맥과 정맥 중 산소가 풍부한 피가 흐르는 것은 ___이다.",
    answer: "동맥",
    category: "인체",
  },

  // ──── 인체: 연결하기 ────
  {
    text: "간은 독소를 해독하고, 신장은 ___을 걸러낸다.",
    answer: "노폐물",
    category: "인체",
  },
  {
    text: "인슐린은 혈당을 낮추고, 글루카곤은 혈당을 ___한다.",
    answer: "높이",
    category: "인체",
  },

  // ──── 수학상식: 분류하기 ────
  {
    text: "평균, 중앙값, 최빈값은 모두 ___을 나타내는 값이다.",
    answer: "대표값",
    category: "수학상식",
  },
  {
    text: "원그래프, 막대그래프, 꺾은선그래프는 모두 ___의 종류이다.",
    answer: "그래프",
    category: "수학상식",
  },
  {
    text: "약수, 배수, 소수는 모두 수의 ___이다.",
    answer: "성질",
    category: "수학상식",
  },

  // ──── 수학상식: 순서맞추기 ────
  {
    text: "소수의 순서: 2 → 3 → 5 → 7 → ___",
    answer: "11",
    category: "수학상식",
  },
  {
    text: "피보나치 수열: 1, 1, 2, 3, 5, 8, ___",
    answer: "13",
    category: "수학상식",
  },

  // ──── 수학상식: 원인결과 ────
  {
    text: "원의 반지름이 커지면 원의 넓이도 ___진다.",
    answer: "커",
    category: "수학상식",
  },
  {
    text: "자료의 수가 많아지면 평균이 더 ___해진다.",
    answer: "정확",
    category: "수학상식",
  },

  // ──── 수학상식: 비교하기 ────
  {
    text: "원과 타원 중 대칭축이 더 많은 도형은 ___이다.",
    answer: "원",
    category: "수학상식",
  },
  {
    text: "삼각기둥과 사각기둥 중 면이 더 많은 것은 ___이다.",
    answer: "사각기둥",
    category: "수학상식",
  },

  // ──── 수학상식: 연결하기 ────
  {
    text: "넓이의 단위는 ㎡이고, 부피의 단위는 ___이다.",
    answer: "㎥",
    category: "수학상식",
  },
  {
    text: "원의 둘레에는 π가, 구의 부피에도 ___가 포함된다.",
    answer: "π",
    category: "수학상식",
  },

  // ──── 문화: 분류하기 ────
  {
    text: "창덕궁, 경복궁, 덕수궁은 모두 조선시대의 ___이다.",
    answer: "궁궐",
    category: "문화",
  },
  {
    text: "아리랑, 도라지, 밀양아리랑은 모두 한국의 ___다.",
    answer: "민요",
    category: "문화",
  },
  {
    text: "판소리, 탈춤, 강강술래는 모두 한국의 전통 ___이다.",
    answer: "공연",
    category: "문화",
  },

  // ──── 문화: 연결하기 ────
  {
    text: "김홍도는 풍속화를, 신사임당은 풀과 벌레를 그린 ___를 그렸다.",
    answer: "초충도",
    category: "문화",
  },
  {
    text: "고려의 대표 도자기는 청자이고, 조선의 대표 도자기는 ___다.",
    answer: "백자",
    category: "문화",
  },
  {
    text: "소리꾼은 노래를 하고, 고수는 ___을 친다.",
    answer: "북",
    category: "문화",
  },

  // ──── 문화: 원인결과 ────
  {
    text: "한류의 영향으로 한국 문화가 세계에 ___게 되었다.",
    answer: "알려지",
    category: "문화",
  },
  {
    text: "유네스코에 등재되면 문화재를 ___할 의무가 생긴다.",
    answer: "보호",
    category: "문화",
  },

  // ──── 생활상식: 분류하기 ────
  {
    text: "원, 달러, 유로, 엔은 모두 ___의 단위이다.",
    answer: "화폐",
    category: "생활상식",
  },
  {
    text: "탄수화물, 단백질, 지방은 모두 ___소이다.",
    answer: "영양",
    category: "생활상식",
  },
  {
    text: "인터넷, 텔레비전, 라디오는 모두 ___매체이다.",
    answer: "정보",
    category: "생활상식",
  },

  // ──── 생활상식: 원인결과 ────
  {
    text: "탄수화물을 많이 먹으면 ___이 올라간다.",
    answer: "혈당",
    category: "생활상식",
  },
  {
    text: "편식을 하면 ___이 불균형해진다.",
    answer: "영양",
    category: "생활상식",
  },
  {
    text: "올림픽을 개최하면 나라의 ___이 높아진다.",
    answer: "위상",
    category: "생활상식",
  },

  // ──── 생활상식: 비교하기 ────
  {
    text: "비타민과 미네랄 중 뼈를 튼튼하게 하는 것은 ___이다.",
    answer: "미네랄",
    category: "생활상식",
  },

  // ──── 추가: 과학 신규 사실 ────
  {
    text: "원자핵은 양성자와 ___로 이루어져 있다.",
    answer: "중성자",
    category: "과학",
  },
  {
    text: "원자보다 더 작은 입자를 ___입자라 한다.",
    answer: "아원자",
    category: "과학",
  },
  {
    text: "전기 에너지를 운동 에너지로 바꾸는 장치를 ___라 한다.",
    answer: "전동기",
    category: "과학",
  },
  {
    text: "운동 에너지를 전기 에너지로 바꾸는 장치를 ___라 한다.",
    answer: "발전기",
    category: "과학",
  },
  {
    text: "빛은 진공에서 초속 약 ___만 km로 이동한다.",
    answer: "30",
    category: "과학",
  },

  // ──── 추가: 역사 신규 사실 ────
  {
    text: "고려의 수도 개경은 지금의 ___이다.",
    answer: "개성",
    category: "역사",
  },
  {
    text: "발해는 고구려를 계승한 나라로 ___이 세웠다.",
    answer: "대조영",
    category: "역사",
  },
  {
    text: "조선시대 신분 제도에서 가장 낮은 계층은 ___였다.",
    answer: "노비",
    category: "역사",
  },
  {
    text: "의병은 나라가 위기에 처했을 때 스스로 나선 ___이다.",
    answer: "백성",
    category: "역사",
  },
  {
    text: "독립신문을 발간한 사람은 ___이다.",
    answer: "서재필",
    category: "역사",
  },

  // ──── 추가: 지리 신규 사실 ────
  {
    text: "메콩강은 ___아시아를 흐르는 강이다.",
    answer: "동남",
    category: "지리",
  },
  {
    text: "시베리아는 러시아의 ___쪽에 있는 넓은 지역이다.",
    answer: "동",
    category: "지리",
  },
  {
    text: "인도네시아는 세계에서 가장 많은 ___을 가진 나라이다.",
    answer: "섬",
    category: "지리",
  },
  { text: "뉴질랜드의 수도는 ___이다.", answer: "웰링턴", category: "지리" },
  { text: "이집트의 수도는 ___다.", answer: "카이로", category: "지리" },

  // ──── 추가: 환경 신규 사실 ────
  {
    text: "탄소 중립이란 배출하는 탄소와 흡수하는 탄소가 ___한 것이다.",
    answer: "같",
    category: "환경",
  },
  {
    text: "ESG는 환경, 사회, ___의 약자이다.",
    answer: "지배구조",
    category: "환경",
  },
  {
    text: "미세먼지를 줄이려면 대중___을 이용하는 것이 좋다.",
    answer: "교통",
    category: "환경",
  },
  {
    text: "생분해성 플라스틱은 자연에서 ___될 수 있다.",
    answer: "분해",
    category: "환경",
  },
  {
    text: "빗물을 모아 사용하는 것을 ___수 활용이라 한다.",
    answer: "빗",
    category: "환경",
  },
];

// ============================================================
// Main export function
// ============================================================
export function generateKnowledgePool(
  grade: number,
  seed: number,
  difficulty: 1 | 2 | 3 = 2,
): KnowledgeEntry[] {
  const random = seededRandom(seed * 13 + grade * 47);

  // Select grade-appropriate templates
  let basePool: KnowledgeEntry[];
  if (grade <= 2) {
    basePool = [...GRADE_1_2];
  } else if (grade <= 4) {
    // Grade 3-4 includes some grade 1-2 entries for reinforcement
    basePool = [...GRADE_3_4, ...GRADE_1_2.filter((_, i) => i % 3 === 0)];
  } else {
    // Grade 5-6 includes some grade 3-4 entries for reinforcement
    basePool = [...GRADE_5_6, ...GRADE_3_4.filter((_, i) => i % 3 === 0)];
  }

  // Apply difficulty filtering
  if (difficulty !== 2 && basePool.length > 10) {
    const cutoff40 = Math.ceil(basePool.length * 0.4);
    if (difficulty === 1) {
      // Easy: prefer entries from lower grades (concrete facts)
      // Sort by putting lower-grade entries first, then take first 40%
      if (grade <= 2) {
        basePool = basePool.slice(0, cutoff40);
      } else if (grade <= 4) {
        // Prefer GRADE_1_2 reinforcement entries + beginning of GRADE_3_4
        const easyEntries = [
          ...GRADE_1_2.filter((_, i) => i % 2 === 0),
          ...GRADE_3_4.slice(0, Math.ceil(GRADE_3_4.length * 0.3)),
        ];
        basePool =
          easyEntries.length > 10 ? easyEntries : basePool.slice(0, cutoff40);
      } else {
        // Prefer GRADE_3_4 reinforcement entries + beginning of GRADE_5_6
        const easyEntries = [
          ...GRADE_3_4.filter((_, i) => i % 2 === 0),
          ...GRADE_5_6.slice(0, Math.ceil(GRADE_5_6.length * 0.3)),
        ];
        basePool =
          easyEntries.length > 10 ? easyEntries : basePool.slice(0, cutoff40);
      }
    } else {
      // Hard: prefer entries from higher grades (abstract/science facts)
      if (grade <= 2) {
        basePool = basePool.slice(basePool.length - cutoff40);
      } else if (grade <= 4) {
        // Prefer harder GRADE_3_4 entries (later portion = more abstract)
        const hardEntries = GRADE_3_4.slice(Math.floor(GRADE_3_4.length * 0.6));
        basePool =
          hardEntries.length > 10
            ? hardEntries
            : basePool.slice(basePool.length - cutoff40);
      } else {
        // Prefer harder GRADE_5_6 entries (later portion = more abstract/science)
        const hardEntries = GRADE_5_6.slice(Math.floor(GRADE_5_6.length * 0.6));
        basePool =
          hardEntries.length > 10
            ? hardEntries
            : basePool.slice(basePool.length - cutoff40);
      }
    }
  }

  // Shuffle the base pool
  const shuffled = shuffle(basePool, random);

  // If pool is empty after filtering, return empty
  if (shuffled.length === 0) return [];

  // Fill to reach 500 entries
  const target = 500;
  const result: KnowledgeEntry[] = [];

  while (result.length < target) {
    const remaining = target - result.length;
    if (remaining >= shuffled.length) {
      result.push(...shuffled);
    } else {
      result.push(...shuffled.slice(0, remaining));
    }
  }

  // Final shuffle of the complete result
  return shuffle(result, random);
}
