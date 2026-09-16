/**
 * Procedural English Vocabulary Generator
 * Generates grade-appropriate English vocabulary entries for Korean elementary students.
 * Follows the Korean national English curriculum (grades 3-6).
 * Combined with seeded PRNG, this provides reproducible yet varied content.
 */
import type { EnglishEntry } from "@/types/curriculum";
import { naturalizeKorean } from "@/lib/korean-josa";
import {
  verbAttributive,
  verbPropositive,
  verbWantTo,
  isVerb,
} from "@/lib/korean-conjugate";
import { ADJ_PRED } from "./adj-predicative";

// Seeded PRNG for reproducible generation
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================
// Compact Word Data Type
// ============================================================
interface W {
  w: string;
  p: string;
  k: string;
  pr: string[];
}

// ============================================================
// Grade 3-4 Word Banks
// ============================================================

const G34_GREETINGS: W[] = [
  { w: "hello", p: "헬로", k: "안녕하세요", pr: ["hi", "hey"] },
  { w: "goodbye", p: "굿바이", k: "안녕히 가세요", pr: ["bye", "see you"] },
  { w: "thank you", p: "땡큐", k: "감사합니다", pr: ["thanks", "appreciate"] },
  { w: "sorry", p: "쏘리", k: "미안해요", pr: ["sad", "regret"] },
  { w: "please", p: "플리즈", k: "제발", pr: ["kindly"] },
  { w: "welcome", p: "웰컴", k: "환영해요", pr: ["greet", "invite"] },
  {
    w: "good morning",
    p: "굿모닝",
    k: "좋은 아침이에요",
    pr: ["good afternoon", "good evening"],
  },
  {
    w: "good night",
    p: "굿나잇",
    k: "잘 자요",
    pr: ["sweet dreams", "sleep well"],
  },
  {
    w: "nice to meet you",
    p: "나이스 투 밋 유",
    k: "만나서 반가워요",
    pr: ["glad to meet you"],
  },
  {
    w: "how are you",
    p: "하우 아 유",
    k: "잘 지내요?",
    pr: ["how is it going"],
  },
  {
    w: "see you later",
    p: "시 유 레이터",
    k: "나중에 봐요",
    pr: ["bye", "see you"],
  },
  {
    w: "excuse me",
    p: "익스큐즈 미",
    k: "실례합니다",
    pr: ["pardon", "sorry"],
  },
  {
    w: "congratulations",
    p: "컨그래츄레이션즈",
    k: "축하해요",
    pr: ["celebrate", "cheer"],
  },
  {
    w: "happy birthday",
    p: "해피 벌스데이",
    k: "생일 축하해요",
    pr: ["cake", "party"],
  },
  {
    w: "bless you",
    p: "블레스 유",
    k: "(재채기 후) 건강하세요",
    pr: ["sneeze", "health"],
  },
  { w: "of course", p: "오브 코스", k: "물론이죠", pr: ["sure", "yes"] },
  {
    w: "you are welcome",
    p: "유 아 웰컴",
    k: "천만에요",
    pr: ["thank you", "please"],
  },
  {
    w: "I am sorry",
    p: "아이 엠 쏘리",
    k: "죄송해요",
    pr: ["forgive", "pardon"],
  },
  {
    w: "have a good day",
    p: "해브 어 굿 데이",
    k: "좋은 하루 보내요",
    pr: ["morning", "bye"],
  },
  { w: "take care", p: "테이크 케어", k: "잘 지내요", pr: ["goodbye", "safe"] },
  { w: "come in", p: "컴 인", k: "들어오세요", pr: ["enter", "door"] },
  { w: "no problem", p: "노 프라블럼", k: "괜찮아요", pr: ["okay", "sure"] },
];

const G34_COLORS: W[] = [
  { w: "red", p: "레드", k: "빨간색", pr: ["pink", "crimson"] },
  { w: "blue", p: "블루", k: "파란색", pr: ["navy", "sky blue"] },
  { w: "yellow", p: "옐로", k: "노란색", pr: ["gold", "lemon"] },
  { w: "green", p: "그린", k: "초록색", pr: ["lime", "emerald"] },
  { w: "orange", p: "오렌지", k: "주황색", pr: ["peach", "tangerine"] },
  { w: "purple", p: "퍼플", k: "보라색", pr: ["violet", "lavender"] },
  { w: "white", p: "화이트", k: "하얀색", pr: ["ivory", "cream"] },
  { w: "black", p: "블랙", k: "검은색", pr: ["dark", "midnight"] },
  { w: "pink", p: "핑크", k: "분홍색", pr: ["rose", "magenta"] },
  { w: "brown", p: "브라운", k: "갈색", pr: ["tan", "chocolate"] },
  { w: "gray", p: "그레이", k: "회색", pr: ["silver", "ash"] },
  { w: "gold", p: "골드", k: "금색", pr: ["golden", "amber"] },
  { w: "silver", p: "실버", k: "은색", pr: ["gray", "shiny"] },
  { w: "navy", p: "네이비", k: "남색", pr: ["blue", "dark"] },
  { w: "beige", p: "베이지", k: "베이지색", pr: ["cream", "light"] },
  { w: "sky blue", p: "스카이 블루", k: "하늘색", pr: ["blue", "light"] },
  { w: "light green", p: "라이트 그린", k: "연두색", pr: ["green", "bright"] },
  { w: "dark blue", p: "다크 블루", k: "진한 파란색", pr: ["navy", "blue"] },
  { w: "ivory", p: "아이보리", k: "아이보리색", pr: ["white", "cream"] },
  { w: "peach", p: "피치", k: "살구색", pr: ["pink", "orange"] },
  { w: "maroon", p: "머룬", k: "밤색", pr: ["brown", "red"] },
];

const G34_NUMBERS: W[] = [
  { w: "one", p: "원", k: "하나", pr: ["first", "single"] },
  { w: "two", p: "투", k: "둘", pr: ["second", "pair"] },
  { w: "three", p: "쓰리", k: "셋", pr: ["third", "triple"] },
  { w: "four", p: "포", k: "넷", pr: ["fourth", "quarter"] },
  { w: "five", p: "파이브", k: "다섯", pr: ["fifth"] },
  { w: "six", p: "식스", k: "여섯", pr: ["sixth"] },
  { w: "seven", p: "세븐", k: "일곱", pr: ["seventh"] },
  { w: "eight", p: "에잇", k: "여덟", pr: ["eighth"] },
  { w: "nine", p: "나인", k: "아홉", pr: ["ninth"] },
  { w: "ten", p: "텐", k: "열", pr: ["tenth", "decade"] },
  { w: "eleven", p: "일레븐", k: "열하나", pr: ["twelfth"] },
  { w: "twelve", p: "트웰브", k: "열둘", pr: ["dozen"] },
  { w: "twenty", p: "트웬티", k: "스물", pr: ["score"] },
  { w: "hundred", p: "헌드레드", k: "백", pr: ["century", "percent"] },
  { w: "thirteen", p: "써틴", k: "열셋", pr: ["fourteen", "teen"] },
  { w: "fourteen", p: "포틴", k: "열넷", pr: ["fifteen", "teen"] },
  { w: "fifteen", p: "피프틴", k: "열다섯", pr: ["sixteen", "teen"] },
  { w: "sixteen", p: "식스틴", k: "열여섯", pr: ["seventeen", "teen"] },
  { w: "seventeen", p: "세븐틴", k: "열일곱", pr: ["eighteen", "teen"] },
  { w: "eighteen", p: "에이틴", k: "열여덟", pr: ["nineteen", "teen"] },
  { w: "nineteen", p: "나인틴", k: "열아홉", pr: ["twenty", "teen"] },
  { w: "thirty", p: "써티", k: "서른", pr: ["forty", "number"] },
  { w: "forty", p: "포티", k: "마흔", pr: ["fifty", "number"] },
  { w: "fifty", p: "피프티", k: "쉰", pr: ["sixty", "half"] },
  { w: "zero", p: "지로", k: "영", pr: ["nothing", "none"] },
  { w: "first", p: "퍼스트", k: "첫 번째", pr: ["second", "one"] },
];

// 수관형사(분류사 앞에 오는 형태): "둘 권"이 아니라 "두 권"이 맞는 한국어 문법.
// 매핑에 없는 값(백/영/첫 번째 등)은 원래 형태를 그대로 사용한다.
const NUMBER_COUNTER_FORM: Record<string, string> = {
  하나: "한",
  둘: "두",
  셋: "세",
  넷: "네",
  다섯: "다섯",
  여섯: "여섯",
  일곱: "일곱",
  여덟: "여덟",
  아홉: "아홉",
  열: "열",
  열하나: "열한",
  열둘: "열두",
  열셋: "열세",
  열넷: "열네",
  열다섯: "열다섯",
  열여섯: "열여섯",
  열일곱: "열일곱",
  열여덟: "열여덟",
  열아홉: "열아홉",
  스물: "스무",
  서른: "서른",
  마흔: "마흔",
  쉰: "쉰",
};

function toCounterForm(k: string): string {
  return NUMBER_COUNTER_FORM[k] ?? k;
}

const G34_ANIMALS: W[] = [
  { w: "dog", p: "도그", k: "개", pr: ["puppy", "bark"] },
  { w: "cat", p: "캣", k: "고양이", pr: ["kitten", "meow"] },
  { w: "bird", p: "버드", k: "새", pr: ["sparrow", "fly"] },
  { w: "fish", p: "피시", k: "물고기", pr: ["goldfish", "swim"] },
  { w: "rabbit", p: "래빗", k: "토끼", pr: ["bunny", "hop"] },
  { w: "bear", p: "베어", k: "곰", pr: ["polar bear", "honey"] },
  { w: "lion", p: "라이언", k: "사자", pr: ["tiger", "king"] },
  { w: "elephant", p: "엘리펀트", k: "코끼리", pr: ["trunk", "big"] },
  { w: "monkey", p: "멍키", k: "원숭이", pr: ["banana", "climb"] },
  { w: "tiger", p: "타이거", k: "호랑이", pr: ["stripes", "jungle"] },
  { w: "cow", p: "카우", k: "소", pr: ["milk", "farm"] },
  { w: "pig", p: "피그", k: "돼지", pr: ["farm", "oink"] },
  { w: "horse", p: "호스", k: "말", pr: ["pony", "ride"] },
  { w: "sheep", p: "쉽", k: "양", pr: ["lamb", "wool"] },
  { w: "duck", p: "덕", k: "오리", pr: ["quack", "pond"] },
  { w: "chicken", p: "치킨", k: "닭", pr: ["rooster", "egg"] },
  { w: "frog", p: "프로그", k: "개구리", pr: ["toad", "jump"] },
  { w: "snake", p: "스네이크", k: "뱀", pr: ["slither", "long"] },
  { w: "turtle", p: "터틀", k: "거북이", pr: ["shell", "slow"] },
  { w: "butterfly", p: "버터플라이", k: "나비", pr: ["caterpillar", "wings"] },
  { w: "penguin", p: "펭귄", k: "펭귄", pr: ["ice", "waddle"] },
  { w: "whale", p: "웨일", k: "고래", pr: ["ocean", "big"] },
  { w: "dolphin", p: "돌핀", k: "돌고래", pr: ["ocean", "smart"] },
  { w: "ant", p: "앤트", k: "개미", pr: ["small", "colony"] },
  { w: "bee", p: "비", k: "벌", pr: ["honey", "sting"] },
  { w: "spider", p: "스파이더", k: "거미", pr: ["web", "legs"] },
  { w: "parrot", p: "패럿", k: "앵무새", pr: ["talk", "colorful"] },
  { w: "owl", p: "아울", k: "부엉이", pr: ["night", "wise"] },
  { w: "deer", p: "디어", k: "사슴", pr: ["antler", "forest"] },
  { w: "fox", p: "폭스", k: "여우", pr: ["clever", "tail"] },
  { w: "giraffe", p: "지래프", k: "기린", pr: ["tall", "neck"] },
  { w: "zebra", p: "지브라", k: "얼룩말", pr: ["stripes", "horse"] },
  { w: "crocodile", p: "크로커다일", k: "악어", pr: ["river", "teeth"] },
  { w: "hamster", p: "햄스터", k: "햄스터", pr: ["pet", "small"] },
  { w: "goldfish", p: "골드피시", k: "금붕어", pr: ["bowl", "pet"] },
  { w: "eagle", p: "이글", k: "독수리", pr: ["fly", "sky"] },
  { w: "hippo", p: "히포", k: "하마", pr: ["river", "big"] },
  { w: "koala", p: "코알라", k: "코알라", pr: ["tree", "sleep"] },
  { w: "panda", p: "판다", k: "판다", pr: ["bamboo", "bear"] },
  { w: "squirrel", p: "스쿼럴", k: "다람쥐", pr: ["nut", "tree"] },
];

const G34_FAMILY: W[] = [
  { w: "mother", p: "마더", k: "엄마", pr: ["mom", "mommy"] },
  { w: "father", p: "파더", k: "아빠", pr: ["dad", "daddy"] },
  { w: "sister", p: "시스터", k: "자매", pr: ["sibling", "girl"] },
  { w: "brother", p: "브라더", k: "형제", pr: ["sibling", "boy"] },
  { w: "grandmother", p: "그랜드마더", k: "할머니", pr: ["grandma", "granny"] },
  { w: "grandfather", p: "그랜드파더", k: "할아버지", pr: ["grandpa"] },
  { w: "baby", p: "베이비", k: "아기", pr: ["infant", "toddler"] },
  { w: "family", p: "패밀리", k: "가족", pr: ["parents", "relatives"] },
  { w: "friend", p: "프렌드", k: "친구", pr: ["buddy", "pal"] },
  { w: "teacher", p: "티처", k: "선생님", pr: ["school", "class"] },
  { w: "student", p: "스튜던트", k: "학생", pr: ["pupil", "learner"] },
  { w: "uncle", p: "엉클", k: "삼촌", pr: ["aunt", "relative"] },
  { w: "aunt", p: "앤트", k: "이모", pr: ["uncle", "relative"] },
  { w: "cousin", p: "커즌", k: "사촌", pr: ["relative", "family"] },
  { w: "neighbor", p: "네이버", k: "이웃", pr: ["next door", "friend"] },
  { w: "classmate", p: "클래스메이트", k: "반 친구", pr: ["school", "friend"] },
  { w: "son", p: "선", k: "아들", pr: ["daughter", "child"] },
  { w: "daughter", p: "도터", k: "딸", pr: ["son", "child"] },
  { w: "parents", p: "페어런츠", k: "부모님", pr: ["mother", "father"] },
  { w: "twin", p: "트윈", k: "쌍둥이", pr: ["sibling", "same"] },
  { w: "nephew", p: "네퓨", k: "조카(남)", pr: ["niece", "uncle"] },
  { w: "niece", p: "니스", k: "조카(여)", pr: ["nephew", "aunt"] },
  { w: "pet", p: "펫", k: "반려동물", pr: ["dog", "cat"] },
  { w: "husband", p: "허즈밴드", k: "남편", pr: ["wife", "marry"] },
  { w: "wife", p: "와이프", k: "아내", pr: ["husband", "marry"] },
  { w: "child", p: "차일드", k: "아이", pr: ["kid", "young"] },
];

const G34_FOOD: W[] = [
  { w: "apple", p: "애플", k: "사과", pr: ["banana", "orange"] },
  { w: "banana", p: "바나나", k: "바나나", pr: ["apple", "mango"] },
  { w: "bread", p: "브레드", k: "빵", pr: ["toast", "sandwich"] },
  { w: "milk", p: "밀크", k: "우유", pr: ["juice", "water"] },
  { w: "rice", p: "라이스", k: "밥", pr: ["noodle", "soup"] },
  { w: "egg", p: "에그", k: "달걀", pr: ["chicken", "breakfast"] },
  { w: "water", p: "워터", k: "물", pr: ["juice", "milk"] },
  { w: "cake", p: "케이크", k: "케이크", pr: ["cookie", "pie"] },
  { w: "pizza", p: "피자", k: "피자", pr: ["pasta", "cheese"] },
  { w: "orange", p: "오렌지", k: "오렌지", pr: ["lemon", "grape"] },
  { w: "grape", p: "그레이프", k: "포도", pr: ["cherry", "peach"] },
  { w: "cheese", p: "치즈", k: "치즈", pr: ["butter", "cream"] },
  { w: "soup", p: "수프", k: "수프", pr: ["stew", "broth"] },
  { w: "candy", p: "캔디", k: "사탕", pr: ["chocolate", "cookie"] },
  { w: "ice cream", p: "아이스크림", k: "아이스크림", pr: ["cake", "candy"] },
  {
    w: "strawberry",
    p: "스트로베리",
    k: "딸기",
    pr: ["blueberry", "raspberry"],
  },
  { w: "cookie", p: "쿠키", k: "쿠키", pr: ["biscuit", "cracker"] },
  { w: "sandwich", p: "샌드위치", k: "샌드위치", pr: ["hamburger", "hotdog"] },
  { w: "salad", p: "샐러드", k: "샐러드", pr: ["vegetable", "lettuce"] },
  { w: "chicken", p: "치킨", k: "치킨", pr: ["beef", "pork"] },
  { w: "tomato", p: "토마토", k: "토마토", pr: ["ketchup", "sauce"] },
  { w: "potato", p: "포테이토", k: "감자", pr: ["fries", "chip"] },
  { w: "carrot", p: "캐럿", k: "당근", pr: ["vegetable", "orange"] },
  { w: "corn", p: "콘", k: "옥수수", pr: ["popcorn", "farm"] },
  { w: "melon", p: "멜론", k: "멜론", pr: ["watermelon", "fruit"] },
  { w: "peach", p: "피치", k: "복숭아", pr: ["plum", "fruit"] },
  { w: "pear", p: "페어", k: "배", pr: ["apple", "fruit"] },
  { w: "lemon", p: "레몬", k: "레몬", pr: ["lime", "sour"] },
  { w: "mango", p: "망고", k: "망고", pr: ["tropical", "sweet"] },
  { w: "pineapple", p: "파인애플", k: "파인애플", pr: ["tropical", "sweet"] },
  { w: "hamburger", p: "햄버거", k: "햄버거", pr: ["fries", "bun"] },
  { w: "noodle", p: "누들", k: "국수", pr: ["soup", "bowl"] },
  { w: "butter", p: "버터", k: "버터", pr: ["bread", "spread"] },
  { w: "jam", p: "잼", k: "잼", pr: ["bread", "sweet"] },
  { w: "cereal", p: "시리얼", k: "시리얼", pr: ["milk", "breakfast"] },
  { w: "sausage", p: "소시지", k: "소시지", pr: ["hotdog", "meat"] },
  { w: "pancake", p: "팬케이크", k: "팬케이크", pr: ["syrup", "breakfast"] },
  { w: "donut", p: "도넛", k: "도넛", pr: ["sweet", "round"] },
  { w: "popcorn", p: "팝콘", k: "팝콘", pr: ["movie", "corn"] },
  { w: "juice", p: "주스", k: "주스", pr: ["orange", "drink"] },
  { w: "onion", p: "어니언", k: "양파", pr: ["garlic", "vegetable"] },
  { w: "mushroom", p: "머쉬룸", k: "버섯", pr: ["vegetable", "forest"] },
];

const G34_BODY: W[] = [
  { w: "head", p: "헤드", k: "머리", pr: ["face", "hair"] },
  { w: "eye", p: "아이", k: "눈", pr: ["nose", "see"] },
  { w: "nose", p: "노즈", k: "코", pr: ["mouth", "smell"] },
  { w: "mouth", p: "마우스", k: "입", pr: ["lip", "tongue"] },
  { w: "ear", p: "이어", k: "귀", pr: ["hear", "sound"] },
  { w: "hand", p: "핸드", k: "손", pr: ["finger", "arm"] },
  { w: "foot", p: "풋", k: "발", pr: ["toe", "leg"] },
  { w: "arm", p: "암", k: "팔", pr: ["hand", "elbow"] },
  { w: "leg", p: "레그", k: "다리", pr: ["knee", "foot"] },
  { w: "hair", p: "헤어", k: "머리카락", pr: ["head", "long"] },
  { w: "finger", p: "핑거", k: "손가락", pr: ["thumb", "hand"] },
  { w: "shoulder", p: "숄더", k: "어깨", pr: ["arm", "neck"] },
  { w: "knee", p: "니", k: "무릎", pr: ["leg", "bend"] },
  { w: "tooth", p: "투스", k: "이", pr: ["teeth", "brush"] },
  { w: "face", p: "페이스", k: "얼굴", pr: ["eye", "nose"] },
  { w: "neck", p: "넥", k: "목", pr: ["head", "shoulder"] },
  { w: "back", p: "백", k: "등", pr: ["spine", "behind"] },
  { w: "stomach", p: "스터먹", k: "배", pr: ["tummy", "belly"] },
  { w: "tongue", p: "텅", k: "혀", pr: ["taste", "mouth"] },
  { w: "thumb", p: "썸", k: "엄지", pr: ["finger", "hand"] },
  { w: "elbow", p: "엘보", k: "팔꿈치", pr: ["arm", "bend"] },
  { w: "wrist", p: "리스트", k: "손목", pr: ["hand", "watch"] },
  { w: "ankle", p: "앵클", k: "발목", pr: ["foot", "leg"] },
  { w: "toe", p: "토", k: "발가락", pr: ["foot", "finger"] },
  { w: "lip", p: "립", k: "입술", pr: ["mouth", "kiss"] },
  { w: "chin", p: "친", k: "턱", pr: ["face", "jaw"] },
  { w: "cheek", p: "칙", k: "볼", pr: ["face", "smile"] },
  { w: "forehead", p: "포헤드", k: "이마", pr: ["head", "face"] },
  { w: "eyebrow", p: "아이브라우", k: "눈썹", pr: ["eye", "face"] },
  { w: "chest", p: "체스트", k: "가슴", pr: ["heart", "body"] },
];

const G34_DAILY: W[] = [
  { w: "eat", p: "잇", k: "먹다", pr: ["drink", "cook"] },
  { w: "drink", p: "드링크", k: "마시다", pr: ["eat", "water"] },
  { w: "sleep", p: "슬립", k: "자다", pr: ["bed", "dream"] },
  { w: "run", p: "런", k: "달리다", pr: ["walk", "jump"] },
  { w: "walk", p: "워크", k: "걷다", pr: ["run", "step"] },
  { w: "read", p: "리드", k: "읽다", pr: ["book", "write"] },
  { w: "write", p: "라이트", k: "쓰다", pr: ["read", "pencil"] },
  { w: "play", p: "플레이", k: "놀다", pr: ["fun", "game"] },
  { w: "sing", p: "싱", k: "노래하다", pr: ["song", "music"] },
  { w: "dance", p: "댄스", k: "춤추다", pr: ["sing", "music"] },
  { w: "swim", p: "스윔", k: "수영하다", pr: ["pool", "water"] },
  { w: "jump", p: "점프", k: "점프하다", pr: ["hop", "leap"] },
  { w: "draw", p: "드로", k: "그리다", pr: ["paint", "color"] },
  { w: "cook", p: "쿡", k: "요리하다", pr: ["bake", "kitchen"] },
  { w: "wash", p: "워시", k: "씻다", pr: ["clean", "soap"] },
  { w: "study", p: "스터디", k: "공부하다", pr: ["learn", "book"] },
  { w: "listen", p: "리슨", k: "듣다", pr: ["hear", "music"] },
  { w: "look", p: "룩", k: "보다", pr: ["see", "watch"] },
  { w: "sit", p: "싯", k: "앉다", pr: ["stand", "chair"] },
  { w: "stand", p: "스탠드", k: "서다", pr: ["sit", "up"] },
  { w: "open", p: "오픈", k: "열다", pr: ["close", "door"] },
  { w: "close", p: "클로즈", k: "닫다", pr: ["open", "shut"] },
  { w: "give", p: "기브", k: "주다", pr: ["take", "share"] },
  { w: "take", p: "테이크", k: "가져가다", pr: ["give", "bring"] },
  { w: "help", p: "헬프", k: "돕다", pr: ["assist", "support"] },
  { w: "make", p: "메이크", k: "만들다", pr: ["build", "create"] },
  { w: "buy", p: "바이", k: "사다", pr: ["sell", "shop"] },
  { w: "fly", p: "플라이", k: "날다", pr: ["bird", "sky"] },
  { w: "cry", p: "크라이", k: "울다", pr: ["sad", "tear"] },
  { w: "laugh", p: "래프", k: "웃다", pr: ["smile", "happy"] },
  { w: "talk", p: "토크", k: "말하다", pr: ["speak", "chat"] },
  { w: "think", p: "싱크", k: "생각하다", pr: ["idea", "mind"] },
  { w: "carry", p: "캐리", k: "나르다", pr: ["hold", "bring"] },
  { w: "throw", p: "쓰로", k: "던지다", pr: ["catch", "ball"] },
  { w: "catch", p: "캐치", k: "잡다", pr: ["throw", "ball"] },
  { w: "push", p: "푸시", k: "밀다", pr: ["pull", "press"] },
  { w: "pull", p: "풀", k: "당기다", pr: ["push", "tug"] },
  { w: "climb", p: "클라임", k: "오르다", pr: ["up", "mountain"] },
  { w: "touch", p: "터치", k: "만지다", pr: ["feel", "hand"] },
  { w: "smile", p: "스마일", k: "미소짓다", pr: ["laugh", "happy"] },
  { w: "clap", p: "클랩", k: "박수치다", pr: ["hand", "cheer"] },
];

const G34_SCHOOL: W[] = [
  { w: "book", p: "북", k: "책", pr: ["notebook", "read"] },
  { w: "pencil", p: "펜슬", k: "연필", pr: ["pen", "eraser"] },
  { w: "eraser", p: "이레이저", k: "지우개", pr: ["pencil", "rubber"] },
  { w: "desk", p: "데스크", k: "책상", pr: ["chair", "table"] },
  { w: "chair", p: "체어", k: "의자", pr: ["desk", "sit"] },
  { w: "bag", p: "백", k: "가방", pr: ["backpack", "school"] },
  { w: "ruler", p: "룰러", k: "자", pr: ["measure", "line"] },
  { w: "clock", p: "클락", k: "시계", pr: ["time", "watch"] },
  { w: "door", p: "도어", k: "문", pr: ["window", "open"] },
  { w: "window", p: "윈도우", k: "창문", pr: ["door", "glass"] },
  { w: "notebook", p: "노트북", k: "공책", pr: ["book", "write"] },
  { w: "crayon", p: "크레용", k: "크레파스", pr: ["color", "draw"] },
  { w: "scissors", p: "시저스", k: "가위", pr: ["cut", "paper"] },
  { w: "glue", p: "글루", k: "풀", pr: ["stick", "paste"] },
  { w: "paper", p: "페이퍼", k: "종이", pr: ["write", "draw"] },
  { w: "blackboard", p: "블랙보드", k: "칠판", pr: ["chalk", "write"] },
  { w: "pen", p: "펜", k: "펜", pr: ["pencil", "write"] },
  { w: "marker", p: "마커", k: "마커펜", pr: ["color", "draw"] },
  { w: "tape", p: "테이프", k: "테이프", pr: ["stick", "glue"] },
  { w: "map", p: "맵", k: "지도", pr: ["country", "world"] },
  { w: "calendar", p: "캘린더", k: "달력", pr: ["date", "month"] },
  { w: "chalk", p: "초크", k: "분필", pr: ["board", "write"] },
  { w: "globe", p: "글로브", k: "지구본", pr: ["world", "map"] },
  { w: "backpack", p: "백팩", k: "배낭", pr: ["bag", "school"] },
  { w: "textbook", p: "텍스트북", k: "교과서", pr: ["study", "class"] },
  { w: "homework", p: "홈워크", k: "숙제", pr: ["study", "school"] },
];

const G34_ADJECTIVES: W[] = [
  { w: "big", p: "빅", k: "큰", pr: ["large", "huge"] },
  { w: "small", p: "스몰", k: "작은", pr: ["little", "tiny"] },
  { w: "happy", p: "해피", k: "행복한", pr: ["glad", "joyful"] },
  { w: "sad", p: "새드", k: "슬픈", pr: ["unhappy", "blue"] },
  { w: "hot", p: "핫", k: "뜨거운", pr: ["warm", "cold"] },
  { w: "cold", p: "콜드", k: "차가운", pr: ["cool", "hot"] },
  { w: "fast", p: "패스트", k: "빠른", pr: ["quick", "slow"] },
  { w: "slow", p: "슬로", k: "느린", pr: ["fast", "quick"] },
  { w: "good", p: "굿", k: "좋은", pr: ["great", "nice"] },
  { w: "bad", p: "배드", k: "나쁜", pr: ["poor", "terrible"] },
  { w: "long", p: "롱", k: "긴", pr: ["short", "tall"] },
  { w: "short", p: "숏", k: "짧은", pr: ["long", "tall"] },
  { w: "new", p: "뉴", k: "새로운", pr: ["old", "fresh"] },
  { w: "old", p: "올드", k: "오래된", pr: ["new", "young"] },
  { w: "pretty", p: "프리티", k: "예쁜", pr: ["beautiful", "cute"] },
  { w: "hungry", p: "헝그리", k: "배고픈", pr: ["thirsty", "full"] },
  { w: "tall", p: "톨", k: "키가 큰", pr: ["short", "high"] },
  { w: "clean", p: "클린", k: "깨끗한", pr: ["dirty", "tidy"] },
  { w: "dirty", p: "더티", k: "더러운", pr: ["clean", "messy"] },
  { w: "strong", p: "스트롱", k: "강한", pr: ["weak", "powerful"] },
  { w: "weak", p: "위크", k: "약한", pr: ["strong", "feeble"] },
  { w: "kind", p: "카인드", k: "친절한", pr: ["nice", "gentle"] },
  { w: "brave", p: "브레이브", k: "용감한", pr: ["bold", "fearless"] },
  { w: "smart", p: "스마트", k: "똑똑한", pr: ["clever", "wise"] },
  { w: "funny", p: "퍼니", k: "재미있는", pr: ["hilarious", "silly"] },
  { w: "quiet", p: "콰이엇", k: "조용한", pr: ["silent", "calm"] },
  { w: "loud", p: "라우드", k: "시끄러운", pr: ["noisy", "quiet"] },
  { w: "soft", p: "소프트", k: "부드러운", pr: ["hard", "gentle"] },
  { w: "hard", p: "하드", k: "딱딱한", pr: ["soft", "tough"] },
  { w: "round", p: "라운드", k: "둥근", pr: ["circle", "ball"] },
  { w: "young", p: "영", k: "어린", pr: ["old", "child"] },
  { w: "bright", p: "브라이트", k: "밝은", pr: ["dark", "light"] },
  { w: "dark", p: "다크", k: "어두운", pr: ["bright", "light"] },
  { w: "heavy", p: "헤비", k: "무거운", pr: ["light", "weight"] },
  { w: "light", p: "라이트", k: "가벼운", pr: ["heavy", "feather"] },
  { w: "thick", p: "씩", k: "두꺼운", pr: ["thin", "wide"] },
  { w: "thin", p: "씬", k: "얇은", pr: ["thick", "slim"] },
  { w: "deep", p: "딥", k: "깊은", pr: ["shallow", "ocean"] },
  { w: "wide", p: "와이드", k: "넓은", pr: ["narrow", "broad"] },
  { w: "sharp", p: "샤프", k: "날카로운", pr: ["dull", "point"] },
];

const G34_CLOTHING: W[] = [
  { w: "shirt", p: "셔츠", k: "셔츠", pr: ["pants", "jacket"] },
  { w: "pants", p: "팬츠", k: "바지", pr: ["shirt", "shorts"] },
  { w: "shoes", p: "슈즈", k: "신발", pr: ["boots", "sneakers"] },
  { w: "hat", p: "햇", k: "모자", pr: ["cap", "head"] },
  { w: "jacket", p: "재킷", k: "재킷", pr: ["coat", "sweater"] },
  { w: "dress", p: "드레스", k: "드레스", pr: ["skirt", "blouse"] },
  { w: "socks", p: "삭스", k: "양말", pr: ["shoes", "feet"] },
  { w: "gloves", p: "글러브즈", k: "장갑", pr: ["mittens", "hands"] },
  { w: "umbrella", p: "엄브렐라", k: "우산", pr: ["rain", "wet"] },
  { w: "scarf", p: "스카프", k: "목도리", pr: ["neck", "warm"] },
  { w: "boots", p: "부츠", k: "부츠", pr: ["shoes", "rain"] },
  { w: "sweater", p: "스웨터", k: "스웨터", pr: ["warm", "winter"] },
  { w: "coat", p: "코트", k: "코트", pr: ["jacket", "warm"] },
  { w: "skirt", p: "스커트", k: "치마", pr: ["dress", "blouse"] },
  { w: "shorts", p: "숏츠", k: "반바지", pr: ["pants", "summer"] },
  { w: "uniform", p: "유니폼", k: "교복", pr: ["school", "wear"] },
  { w: "cap", p: "캡", k: "모자", pr: ["hat", "head"] },
  { w: "pajamas", p: "파자마즈", k: "잠옷", pr: ["sleep", "night"] },
  { w: "sneakers", p: "스니커즈", k: "운동화", pr: ["shoes", "run"] },
  { w: "belt", p: "벨트", k: "벨트", pr: ["pants", "waist"] },
  { w: "raincoat", p: "레인코트", k: "비옷", pr: ["rain", "wet"] },
  { w: "vest", p: "베스트", k: "조끼", pr: ["jacket", "shirt"] },
  { w: "tie", p: "타이", k: "넥타이", pr: ["shirt", "formal"] },
  { w: "blouse", p: "블라우스", k: "블라우스", pr: ["shirt", "dress"] },
  { w: "sandals", p: "샌들즈", k: "샌들", pr: ["shoes", "summer"] },
  { w: "hoodie", p: "후디", k: "후드티", pr: ["sweater", "warm"] },
];

const G34_TRANSPORT: W[] = [
  { w: "bus", p: "버스", k: "버스", pr: ["car", "taxi"] },
  { w: "car", p: "카", k: "자동차", pr: ["bus", "truck"] },
  { w: "bicycle", p: "바이시클", k: "자전거", pr: ["bike", "ride"] },
  { w: "airplane", p: "에어플레인", k: "비행기", pr: ["fly", "airport"] },
  { w: "train", p: "트레인", k: "기차", pr: ["station", "track"] },
  { w: "ship", p: "쉽", k: "배", pr: ["boat", "sail"] },
  { w: "subway", p: "서브웨이", k: "지하철", pr: ["train", "station"] },
  { w: "taxi", p: "택시", k: "택시", pr: ["car", "bus"] },
  { w: "truck", p: "트럭", k: "트럭", pr: ["car", "van"] },
  { w: "helicopter", p: "헬리콥터", k: "헬리콥터", pr: ["fly", "sky"] },
  { w: "motorcycle", p: "모터사이클", k: "오토바이", pr: ["bike", "ride"] },
  { w: "ambulance", p: "앰뷸런스", k: "구급차", pr: ["hospital", "emergency"] },
  { w: "scooter", p: "스쿠터", k: "스쿠터", pr: ["ride", "wheel"] },
  { w: "boat", p: "보트", k: "보트", pr: ["ship", "sail"] },
  { w: "fire truck", p: "파이어 트럭", k: "소방차", pr: ["fire", "rescue"] },
  { w: "police car", p: "폴리스 카", k: "경찰차", pr: ["police", "siren"] },
  { w: "van", p: "밴", k: "밴", pr: ["truck", "car"] },
  { w: "rocket", p: "로켓", k: "로켓", pr: ["space", "fly"] },
  { w: "ferry", p: "페리", k: "여객선", pr: ["boat", "ship"] },
  { w: "tractor", p: "트랙터", k: "트랙터", pr: ["farm", "field"] },
  { w: "cable car", p: "케이블 카", k: "케이블카", pr: ["mountain", "ride"] },
];

const G34_NATURE: W[] = [
  { w: "tree", p: "트리", k: "나무", pr: ["leaf", "forest"] },
  { w: "flower", p: "플라워", k: "꽃", pr: ["rose", "garden"] },
  { w: "sun", p: "선", k: "태양", pr: ["moon", "star"] },
  { w: "moon", p: "문", k: "달", pr: ["sun", "star"] },
  { w: "star", p: "스타", k: "별", pr: ["sun", "moon"] },
  { w: "sky", p: "스카이", k: "하늘", pr: ["cloud", "sun"] },
  { w: "rain", p: "레인", k: "비", pr: ["umbrella", "cloud"] },
  { w: "snow", p: "스노", k: "눈", pr: ["winter", "cold"] },
  { w: "river", p: "리버", k: "강", pr: ["lake", "ocean"] },
  { w: "mountain", p: "마운틴", k: "산", pr: ["hill", "climb"] },
  { w: "garden", p: "가든", k: "정원", pr: ["flower", "plant"] },
  { w: "sea", p: "시", k: "바다", pr: ["ocean", "wave"] },
  { w: "cloud", p: "클라우드", k: "구름", pr: ["sky", "rain"] },
  { w: "wind", p: "윈드", k: "바람", pr: ["blow", "breeze"] },
  { w: "lake", p: "레이크", k: "호수", pr: ["river", "pond"] },
  { w: "forest", p: "포레스트", k: "숲", pr: ["tree", "nature"] },
  { w: "grass", p: "그래스", k: "풀", pr: ["green", "lawn"] },
  { w: "sand", p: "샌드", k: "모래", pr: ["beach", "desert"] },
  { w: "rock", p: "록", k: "바위", pr: ["stone", "hard"] },
  { w: "island", p: "아일랜드", k: "섬", pr: ["ocean", "beach"] },
  { w: "rainbow", p: "레인보", k: "무지개", pr: ["rain", "color"] },
  { w: "waterfall", p: "워터폴", k: "폭포", pr: ["river", "water"] },
  { w: "leaf", p: "리프", k: "잎", pr: ["tree", "green"] },
  { w: "rose", p: "로즈", k: "장미", pr: ["flower", "red"] },
  { w: "pond", p: "폰드", k: "연못", pr: ["lake", "frog"] },
  { w: "cave", p: "케이브", k: "동굴", pr: ["dark", "rock"] },
  { w: "desert", p: "데저트", k: "사막", pr: ["sand", "hot"] },
  { w: "hill", p: "힐", k: "언덕", pr: ["mountain", "climb"] },
  { w: "volcano", p: "볼케이노", k: "화산", pr: ["fire", "mountain"] },
  { w: "field", p: "필드", k: "들판", pr: ["grass", "farm"] },
];

const G34_POSITIONS: W[] = [
  { w: "up", p: "업", k: "위로", pr: ["down", "high"] },
  { w: "down", p: "다운", k: "아래로", pr: ["up", "low"] },
  { w: "in", p: "인", k: "안에", pr: ["out", "inside"] },
  { w: "out", p: "아웃", k: "밖에", pr: ["in", "outside"] },
  { w: "here", p: "히어", k: "여기", pr: ["there", "this"] },
  { w: "there", p: "데어", k: "저기", pr: ["here", "that"] },
  { w: "left", p: "레프트", k: "왼쪽", pr: ["right", "direction"] },
  { w: "right", p: "라이트", k: "오른쪽", pr: ["left", "direction"] },
  { w: "next to", p: "넥스트 투", k: "옆에", pr: ["beside", "near"] },
  { w: "behind", p: "비하인드", k: "뒤에", pr: ["front", "back"] },
  { w: "between", p: "비트윈", k: "사이에", pr: ["middle", "among"] },
  { w: "under", p: "언더", k: "아래에", pr: ["below", "above"] },
  { w: "above", p: "어보브", k: "위에", pr: ["over", "below"] },
  { w: "on", p: "온", k: "위에", pr: ["off", "upon"] },
  { w: "front", p: "프런트", k: "앞에", pr: ["back", "behind"] },
  { w: "near", p: "니어", k: "가까이", pr: ["far", "close"] },
  { w: "far", p: "파", k: "멀리", pr: ["near", "distant"] },
  { w: "inside", p: "인사이드", k: "안쪽", pr: ["outside", "in"] },
  { w: "outside", p: "아웃사이드", k: "바깥쪽", pr: ["inside", "out"] },
  { w: "beside", p: "비사이드", k: "옆에", pr: ["next to", "near"] },
  { w: "around", p: "어라운드", k: "주위에", pr: ["circle", "near"] },
  { w: "across", p: "어크로스", k: "건너편에", pr: ["over", "cross"] },
  { w: "toward", p: "토워드", k: "~쪽으로", pr: ["away", "direction"] },
  { w: "center", p: "센터", k: "가운데", pr: ["middle", "core"] },
  { w: "corner", p: "코너", k: "모퉁이", pr: ["edge", "side"] },
];

const G34_HOUSE: W[] = [
  { w: "house", p: "하우스", k: "집", pr: ["home", "building"] },
  { w: "room", p: "룸", k: "방", pr: ["bedroom", "space"] },
  { w: "kitchen", p: "키친", k: "부엌", pr: ["cook", "food"] },
  { w: "bathroom", p: "배스룸", k: "화장실", pr: ["shower", "wash"] },
  { w: "bedroom", p: "베드룸", k: "침실", pr: ["bed", "sleep"] },
  { w: "living room", p: "리빙 룸", k: "거실", pr: ["sofa", "TV"] },
  { w: "table", p: "테이블", k: "탁자", pr: ["chair", "desk"] },
  { w: "bed", p: "베드", k: "침대", pr: ["sleep", "pillow"] },
  { w: "sofa", p: "소파", k: "소파", pr: ["sit", "living room"] },
  { w: "TV", p: "티비", k: "텔레비전", pr: ["watch", "screen"] },
  { w: "lamp", p: "램프", k: "램프", pr: ["light", "bright"] },
  { w: "mirror", p: "미러", k: "거울", pr: ["reflect", "face"] },
  { w: "cup", p: "컵", k: "컵", pr: ["glass", "drink"] },
  { w: "plate", p: "플레이트", k: "접시", pr: ["dish", "food"] },
  { w: "spoon", p: "스푼", k: "숟가락", pr: ["fork", "knife"] },
  { w: "fork", p: "포크", k: "포크", pr: ["spoon", "knife"] },
  { w: "knife", p: "나이프", k: "칼", pr: ["fork", "cut"] },
  { w: "refrigerator", p: "리프리저레이터", k: "냉장고", pr: ["cold", "food"] },
  { w: "oven", p: "오븐", k: "오븐", pr: ["bake", "cook"] },
  { w: "blanket", p: "블랭킷", k: "이불", pr: ["bed", "warm"] },
  { w: "pillow", p: "필로", k: "베개", pr: ["bed", "sleep"] },
  { w: "towel", p: "타월", k: "수건", pr: ["bath", "dry"] },
  { w: "closet", p: "클로짓", k: "옷장", pr: ["clothes", "room"] },
  { w: "stairs", p: "스테어즈", k: "계단", pr: ["up", "floor"] },
  { w: "roof", p: "루프", k: "지붕", pr: ["house", "top"] },
  { w: "garden", p: "가든", k: "정원", pr: ["flower", "yard"] },
];

// ============================================================
// Grade 3-4 Additional Word Banks (추가)
// ============================================================

const G34_PHONICS: W[] = [
  { w: "cat", p: "캣", k: "고양이 (c-a-t)", pr: ["bat", "hat"] },
  { w: "bat", p: "뱃", k: "방망이 (b-a-t)", pr: ["cat", "hat"] },
  { w: "hat", p: "햇", k: "모자 (h-a-t)", pr: ["cat", "bat"] },
  { w: "mat", p: "맷", k: "깔개 (m-a-t)", pr: ["cat", "sat"] },
  { w: "sat", p: "샛", k: "앉았다 (s-a-t)", pr: ["hat", "mat"] },
  { w: "fan", p: "팬", k: "부채 (f-a-n)", pr: ["man", "can"] },
  { w: "man", p: "맨", k: "남자 (m-a-n)", pr: ["fan", "can"] },
  { w: "can", p: "캔", k: "캔 (c-a-n)", pr: ["fan", "man"] },
  { w: "pen", p: "펜", k: "펜 (p-e-n)", pr: ["hen", "ten"] },
  { w: "hen", p: "헨", k: "암탉 (h-e-n)", pr: ["pen", "ten"] },
  { w: "ten", p: "텐", k: "열 (t-e-n)", pr: ["pen", "hen"] },
  { w: "sun", p: "선", k: "태양 (s-u-n)", pr: ["fun", "run"] },
  { w: "fun", p: "펀", k: "재미 (f-u-n)", pr: ["sun", "run"] },
  { w: "cup", p: "컵", k: "컵 (c-u-p)", pr: ["up", "pup"] },
  { w: "top", p: "탑", k: "꼭대기 (t-o-p)", pr: ["hop", "pop"] },
  { w: "hop", p: "합", k: "깡충 뛰다 (h-o-p)", pr: ["top", "pop"] },
  { w: "pin", p: "핀", k: "핀 (p-i-n)", pr: ["bin", "tin"] },
  { w: "bin", p: "빈", k: "통 (b-i-n)", pr: ["pin", "tin"] },
  { w: "map", p: "맵", k: "지도 (m-a-p)", pr: ["cap", "tap"] },
  { w: "bug", p: "벅", k: "벌레 (b-u-g)", pr: ["mug", "hug"] },
];

const G34_DAILY_ROUTINE: W[] = [
  { w: "wake up", p: "웨이크 업", k: "일어나다", pr: ["get up", "alarm"] },
  {
    w: "brush teeth",
    p: "브러시 티쓰",
    k: "양치하다",
    pr: ["toothpaste", "morning"],
  },
  {
    w: "get dressed",
    p: "겟 드레스드",
    k: "옷을 입다",
    pr: ["clothes", "wear"],
  },
  {
    w: "eat breakfast",
    p: "잇 브렉퍼스트",
    k: "아침을 먹다",
    pr: ["cereal", "toast"],
  },
  { w: "go to school", p: "고 투 스쿨", k: "학교에 가다", pr: ["bus", "walk"] },
  { w: "come home", p: "컴 홈", k: "집에 오다", pr: ["arrive", "return"] },
  {
    w: "do homework",
    p: "두 홈워크",
    k: "숙제를 하다",
    pr: ["study", "write"],
  },
  {
    w: "take a bath",
    p: "테이크 어 배쓰",
    k: "목욕하다",
    pr: ["shower", "wash"],
  },
  {
    w: "go to bed",
    p: "고 투 베드",
    k: "잠자리에 들다",
    pr: ["sleep", "night"],
  },
  { w: "have lunch", p: "해브 런치", k: "점심을 먹다", pr: ["food", "noon"] },
  { w: "watch TV", p: "워치 티비", k: "TV를 보다", pr: ["show", "screen"] },
  {
    w: "play outside",
    p: "플레이 아웃사이드",
    k: "밖에서 놀다",
    pr: ["fun", "park"],
  },
  {
    w: "clean room",
    p: "클린 룸",
    k: "방을 정리하다",
    pr: ["tidy", "organize"],
  },
  { w: "feed pet", p: "피드 펫", k: "반려동물 밥 주다", pr: ["dog", "cat"] },
  { w: "read book", p: "리드 북", k: "책을 읽다", pr: ["story", "library"] },
];

const G34_COMMON_EXPRESSIONS: W[] = [
  {
    w: "I am fine",
    p: "아이 엠 파인",
    k: "나는 괜찮아요",
    pr: ["good", "okay"],
  },
  {
    w: "I don't know",
    p: "아이 돈 노",
    k: "모르겠어요",
    pr: ["question", "think"],
  },
  { w: "I am hungry", p: "아이 엠 헝그리", k: "배고파요", pr: ["food", "eat"] },
  {
    w: "I am thirsty",
    p: "아이 엠 써스티",
    k: "목말라요",
    pr: ["water", "drink"],
  },
  { w: "I am sleepy", p: "아이 엠 슬리피", k: "졸려요", pr: ["tired", "bed"] },
  {
    w: "I am sorry",
    p: "아이 엠 쏘리",
    k: "미안해요",
    pr: ["forgive", "mistake"],
  },
  { w: "I am happy", p: "아이 엠 해피", k: "행복해요", pr: ["glad", "joy"] },
  { w: "let's go", p: "렛츠 고", k: "가자", pr: ["come", "move"] },
  {
    w: "wait a moment",
    p: "웨이트 어 모먼트",
    k: "잠깐만요",
    pr: ["stop", "hold"],
  },
  { w: "help me", p: "헬프 미", k: "도와주세요", pr: ["please", "assist"] },
  {
    w: "what time is it",
    p: "왓 타임 이즈 잇",
    k: "몇 시예요?",
    pr: ["clock", "hour"],
  },
  { w: "how much", p: "하우 머치", k: "얼마예요?", pr: ["price", "cost"] },
  {
    w: "I like it",
    p: "아이 라이크 잇",
    k: "마음에 들어요",
    pr: ["love", "enjoy"],
  },
  { w: "me too", p: "미 투", k: "나도요", pr: ["same", "also"] },
  { w: "good job", p: "굿 잡", k: "잘했어요", pr: ["great", "well done"] },
];

// ============================================================
// Grade 5-6 Word Banks (additional)
// ============================================================

const G56_SUBJECTS: W[] = [
  { w: "math", p: "매쓰", k: "수학", pr: ["science", "number"] },
  { w: "science", p: "사이언스", k: "과학", pr: ["experiment", "lab"] },
  { w: "English", p: "잉글리시", k: "영어", pr: ["Korean", "language"] },
  { w: "music", p: "뮤직", k: "음악", pr: ["art", "sing"] },
  { w: "art", p: "아트", k: "미술", pr: ["draw", "paint"] },
  { w: "history", p: "히스토리", k: "역사", pr: ["past", "event"] },
  { w: "Korean", p: "코리안", k: "국어", pr: ["English", "language"] },
  { w: "PE", p: "피이", k: "체육", pr: ["exercise", "sport"] },
  { w: "computer", p: "컴퓨터", k: "컴퓨터", pr: ["keyboard", "mouse"] },
  {
    w: "social studies",
    p: "소셜 스터디즈",
    k: "사회",
    pr: ["history", "geography"],
  },
  { w: "geography", p: "지오그래피", k: "지리", pr: ["map", "country"] },
  { w: "ethics", p: "에식스", k: "도덕", pr: ["moral", "right"] },
  { w: "biology", p: "바이올로지", k: "생물", pr: ["life", "nature"] },
  { w: "literature", p: "리터러처", k: "문학", pr: ["novel", "poem"] },
  { w: "economics", p: "이코노믹스", k: "경제", pr: ["money", "trade"] },
  { w: "philosophy", p: "필로소피", k: "철학", pr: ["think", "wisdom"] },
  { w: "astronomy", p: "어스트로노미", k: "천문학", pr: ["star", "planet"] },
  { w: "chemistry", p: "케미스트리", k: "화학", pr: ["lab", "element"] },
  { w: "drama", p: "드라마", k: "연극", pr: ["stage", "act"] },
  { w: "technology", p: "테크놀로지", k: "기술", pr: ["computer", "science"] },
  { w: "calligraphy", p: "캘리그래피", k: "서예", pr: ["brush", "write"] },
];

const G56_WEATHER: W[] = [
  { w: "sunny", p: "서니", k: "화창한", pr: ["bright", "clear"] },
  { w: "rainy", p: "레이니", k: "비 오는", pr: ["wet", "umbrella"] },
  { w: "cloudy", p: "클라우디", k: "흐린", pr: ["gray", "overcast"] },
  { w: "snowy", p: "스노이", k: "눈 오는", pr: ["cold", "white"] },
  { w: "windy", p: "윈디", k: "바람 부는", pr: ["breeze", "storm"] },
  { w: "warm", p: "웜", k: "따뜻한", pr: ["hot", "spring"] },
  { w: "cool", p: "쿨", k: "시원한", pr: ["cold", "autumn"] },
  { w: "stormy", p: "스토미", k: "폭풍인", pr: ["thunder", "lightning"] },
  { w: "foggy", p: "포기", k: "안개 낀", pr: ["misty", "hazy"] },
  { w: "humid", p: "휴미드", k: "습한", pr: ["sticky", "moist"] },
  { w: "dry", p: "드라이", k: "건조한", pr: ["wet", "arid"] },
  { w: "freezing", p: "프리징", k: "얼어붙는", pr: ["cold", "ice"] },
  { w: "chilly", p: "칠리", k: "쌀쌀한", pr: ["cold", "cool"] },
  { w: "boiling", p: "보일링", k: "끓는 듯 더운", pr: ["hot", "summer"] },
  { w: "breezy", p: "브리지", k: "산들바람 부는", pr: ["wind", "gentle"] },
  { w: "overcast", p: "오버캐스트", k: "구름 낀", pr: ["cloudy", "gray"] },
  { w: "icy", p: "아이시", k: "얼음처럼 찬", pr: ["cold", "slippery"] },
  { w: "clear", p: "클리어", k: "맑은", pr: ["sunny", "bright"] },
  { w: "thunder", p: "썬더", k: "천둥", pr: ["lightning", "storm"] },
  { w: "lightning", p: "라이트닝", k: "번개", pr: ["thunder", "flash"] },
  { w: "drizzle", p: "드리즐", k: "이슬비", pr: ["rain", "light"] },
];

const G56_HOBBIES: W[] = [
  { w: "soccer", p: "사커", k: "축구", pr: ["basketball", "team"] },
  { w: "basketball", p: "바스켓볼", k: "농구", pr: ["soccer", "court"] },
  { w: "swimming", p: "스위밍", k: "수영", pr: ["pool", "diving"] },
  { w: "reading", p: "리딩", k: "독서", pr: ["book", "library"] },
  { w: "cooking", p: "쿠킹", k: "요리", pr: ["baking", "recipe"] },
  { w: "painting", p: "페인팅", k: "그림 그리기", pr: ["drawing", "brush"] },
  { w: "camping", p: "캠핑", k: "캠핑", pr: ["tent", "hiking"] },
  { w: "fishing", p: "피싱", k: "낚시", pr: ["rod", "lake"] },
  { w: "cycling", p: "사이클링", k: "자전거 타기", pr: ["bicycle", "ride"] },
  { w: "dancing", p: "댄싱", k: "춤", pr: ["ballet", "rhythm"] },
  { w: "singing", p: "싱잉", k: "노래", pr: ["song", "voice"] },
  { w: "hiking", p: "하이킹", k: "등산", pr: ["mountain", "trail"] },
  { w: "skating", p: "스케이팅", k: "스케이트", pr: ["ice", "rink"] },
  { w: "gardening", p: "가드닝", k: "정원 가꾸기", pr: ["plant", "flower"] },
  { w: "baseball", p: "베이스볼", k: "야구", pr: ["bat", "ball"] },
  { w: "tennis", p: "테니스", k: "테니스", pr: ["racket", "court"] },
  { w: "badminton", p: "배드민턴", k: "배드민턴", pr: ["shuttle", "racket"] },
  { w: "photography", p: "포토그래피", k: "사진", pr: ["camera", "picture"] },
  { w: "yoga", p: "요가", k: "요가", pr: ["stretch", "relax"] },
  { w: "chess", p: "체스", k: "체스", pr: ["board", "strategy"] },
  { w: "volleyball", p: "발리볼", k: "배구", pr: ["net", "team"] },
  { w: "table tennis", p: "테이블 테니스", k: "탁구", pr: ["paddle", "ball"] },
  { w: "taekwondo", p: "태권도", k: "태권도", pr: ["kick", "martial arts"] },
  { w: "surfing", p: "서핑", k: "서핑", pr: ["wave", "ocean"] },
  { w: "climbing", p: "클라이밍", k: "클라이밍", pr: ["rock", "wall"] },
  { w: "knitting", p: "니팅", k: "뜨개질", pr: ["yarn", "needle"] },
  { w: "origami", p: "오리가미", k: "종이접기", pr: ["paper", "fold"] },
  { w: "magic", p: "매직", k: "마술", pr: ["trick", "show"] },
  { w: "archery", p: "아처리", k: "양궁", pr: ["arrow", "bow"] },
  { w: "bowling", p: "볼링", k: "볼링", pr: ["pin", "ball"] },
];

const G56_PLACES: W[] = [
  { w: "school", p: "스쿨", k: "학교", pr: ["classroom", "teacher"] },
  { w: "hospital", p: "호스피탈", k: "병원", pr: ["doctor", "nurse"] },
  { w: "library", p: "라이브러리", k: "도서관", pr: ["book", "read"] },
  { w: "park", p: "파크", k: "공원", pr: ["playground", "tree"] },
  { w: "restaurant", p: "레스토랑", k: "식당", pr: ["menu", "food"] },
  { w: "museum", p: "뮤지엄", k: "박물관", pr: ["art", "exhibit"] },
  { w: "airport", p: "에어포트", k: "공항", pr: ["airplane", "travel"] },
  { w: "market", p: "마켓", k: "시장", pr: ["shop", "buy"] },
  { w: "station", p: "스테이션", k: "역", pr: ["train", "bus"] },
  {
    w: "post office",
    p: "포스트 오피스",
    k: "우체국",
    pr: ["letter", "stamp"],
  },
  { w: "bank", p: "뱅크", k: "은행", pr: ["money", "save"] },
  { w: "zoo", p: "주", k: "동물원", pr: ["animal", "lion"] },
  { w: "bookstore", p: "북스토어", k: "서점", pr: ["book", "shop"] },
  { w: "beach", p: "비치", k: "해변", pr: ["sand", "ocean"] },
  { w: "church", p: "처치", k: "교회", pr: ["temple", "pray"] },
  { w: "cinema", p: "시네마", k: "영화관", pr: ["movie", "watch"] },
  { w: "gym", p: "짐", k: "체육관", pr: ["exercise", "sport"] },
  { w: "bakery", p: "베이커리", k: "빵집", pr: ["bread", "cake"] },
  { w: "pharmacy", p: "파머시", k: "약국", pr: ["medicine", "health"] },
  { w: "stadium", p: "스테디엄", k: "경기장", pr: ["sport", "game"] },
  {
    w: "police station",
    p: "폴리스 스테이션",
    k: "경찰서",
    pr: ["police", "officer"],
  },
  {
    w: "fire station",
    p: "파이어 스테이션",
    k: "소방서",
    pr: ["firefighter", "truck"],
  },
  { w: "aquarium", p: "아쿠아리움", k: "수족관", pr: ["fish", "ocean"] },
  {
    w: "amusement park",
    p: "어뮤즈먼트 파크",
    k: "놀이공원",
    pr: ["ride", "fun"],
  },
  { w: "temple", p: "템플", k: "절", pr: ["pray", "mountain"] },
  { w: "castle", p: "캐슬", k: "성", pr: ["king", "queen"] },
  { w: "harbor", p: "하버", k: "항구", pr: ["ship", "ocean"] },
  { w: "farm", p: "팜", k: "농장", pr: ["animal", "crop"] },
  { w: "factory", p: "팩토리", k: "공장", pr: ["make", "machine"] },
  { w: "gallery", p: "갤러리", k: "갤러리", pr: ["art", "painting"] },
];

const G56_EMOTIONS: W[] = [
  { w: "happy", p: "해피", k: "행복한", pr: ["glad", "joyful"] },
  { w: "sad", p: "새드", k: "슬픈", pr: ["unhappy", "upset"] },
  { w: "angry", p: "앵그리", k: "화난", pr: ["mad", "furious"] },
  { w: "scared", p: "스케어드", k: "무서운", pr: ["afraid", "frightened"] },
  { w: "excited", p: "익사이티드", k: "신나는", pr: ["thrilled", "eager"] },
  { w: "tired", p: "타이어드", k: "피곤한", pr: ["sleepy", "exhausted"] },
  { w: "surprised", p: "서프라이즈드", k: "놀란", pr: ["amazed", "shocked"] },
  { w: "bored", p: "보어드", k: "지루한", pr: ["dull", "uninterested"] },
  { w: "nervous", p: "너버스", k: "긴장한", pr: ["anxious", "worried"] },
  { w: "proud", p: "프라우드", k: "자랑스러운", pr: ["confident", "pleased"] },
  { w: "lonely", p: "론리", k: "외로운", pr: ["alone", "isolated"] },
  { w: "confused", p: "컨퓨즈드", k: "혼란스러운", pr: ["puzzled", "lost"] },
  { w: "grateful", p: "그레이트풀", k: "감사한", pr: ["thankful", "blessed"] },
  { w: "jealous", p: "젤러스", k: "질투하는", pr: ["envious", "green"] },
  { w: "curious", p: "큐리어스", k: "궁금한", pr: ["wonder", "interested"] },
  {
    w: "disappointed",
    p: "디스어포인티드",
    k: "실망한",
    pr: ["let down", "upset"],
  },
  { w: "embarrassed", p: "임배러스드", k: "부끄러운", pr: ["shy", "ashamed"] },
  { w: "worried", p: "워리드", k: "걱정되는", pr: ["anxious", "nervous"] },
  { w: "hopeful", p: "호프풀", k: "희망찬", pr: ["positive", "bright"] },
  { w: "cheerful", p: "치어풀", k: "쾌활한", pr: ["happy", "bright"] },
  { w: "calm", p: "캄", k: "차분한", pr: ["peaceful", "quiet"] },
  { w: "shy", p: "샤이", k: "수줍은", pr: ["timid", "quiet"] },
  { w: "amazed", p: "어메이즈드", k: "깜짝 놀란", pr: ["surprised", "wow"] },
  { w: "relieved", p: "릴리브드", k: "안도한", pr: ["safe", "calm"] },
  {
    w: "frustrated",
    p: "프러스트레이티드",
    k: "좌절한",
    pr: ["angry", "upset"],
  },
  { w: "peaceful", p: "피스풀", k: "평화로운", pr: ["calm", "quiet"] },
  { w: "annoyed", p: "어노이드", k: "짜증난", pr: ["angry", "upset"] },
  { w: "determined", p: "디터민드", k: "결심한", pr: ["strong", "will"] },
];

const G56_TIME: W[] = [
  { w: "Monday", p: "먼데이", k: "월요일", pr: ["Tuesday", "weekday"] },
  { w: "Tuesday", p: "튜즈데이", k: "화요일", pr: ["Wednesday", "weekday"] },
  { w: "Wednesday", p: "웬즈데이", k: "수요일", pr: ["Thursday", "weekday"] },
  { w: "Thursday", p: "썰즈데이", k: "목요일", pr: ["Friday", "weekday"] },
  { w: "Friday", p: "프라이데이", k: "금요일", pr: ["Saturday", "weekend"] },
  { w: "Saturday", p: "새터데이", k: "토요일", pr: ["Sunday", "weekend"] },
  { w: "Sunday", p: "선데이", k: "일요일", pr: ["Monday", "weekend"] },
  { w: "morning", p: "모닝", k: "아침", pr: ["afternoon", "evening"] },
  { w: "afternoon", p: "애프터눈", k: "오후", pr: ["morning", "evening"] },
  { w: "evening", p: "이브닝", k: "저녁", pr: ["night", "morning"] },
  { w: "night", p: "나잇", k: "밤", pr: ["day", "dark"] },
  { w: "today", p: "투데이", k: "오늘", pr: ["yesterday", "tomorrow"] },
  { w: "yesterday", p: "예스터데이", k: "어제", pr: ["today", "tomorrow"] },
  { w: "tomorrow", p: "투머로우", k: "내일", pr: ["today", "yesterday"] },
  { w: "noon", p: "눈", k: "정오", pr: ["midday", "twelve"] },
  { w: "midnight", p: "미드나잇", k: "자정", pr: ["night", "twelve"] },
  { w: "weekend", p: "위켄드", k: "주말", pr: ["Saturday", "Sunday"] },
  { w: "weekday", p: "위크데이", k: "평일", pr: ["Monday", "work"] },
  { w: "dawn", p: "돈", k: "새벽", pr: ["early", "sunrise"] },
  { w: "sunset", p: "선셋", k: "일몰", pr: ["evening", "sky"] },
  { w: "sunrise", p: "선라이즈", k: "일출", pr: ["morning", "dawn"] },
  { w: "hour", p: "아워", k: "시간", pr: ["minute", "clock"] },
  { w: "minute", p: "미닛", k: "분", pr: ["second", "hour"] },
  { w: "second", p: "세컨드", k: "초", pr: ["minute", "quick"] },
];

const G56_SEASONS: W[] = [
  { w: "spring", p: "스프링", k: "봄", pr: ["flower", "warm"] },
  { w: "summer", p: "서머", k: "여름", pr: ["hot", "vacation"] },
  { w: "fall", p: "폴", k: "가을", pr: ["leaf", "cool"] },
  { w: "winter", p: "윈터", k: "겨울", pr: ["cold", "snow"] },
  { w: "January", p: "재뉴어리", k: "1월", pr: ["February", "new year"] },
  { w: "February", p: "페브루어리", k: "2월", pr: ["March", "Valentine"] },
  { w: "March", p: "마치", k: "3월", pr: ["April", "spring"] },
  { w: "April", p: "에이프릴", k: "4월", pr: ["May", "rain"] },
  { w: "May", p: "메이", k: "5월", pr: ["June", "family"] },
  { w: "June", p: "준", k: "6월", pr: ["July", "summer"] },
  { w: "July", p: "줄라이", k: "7월", pr: ["August", "vacation"] },
  { w: "August", p: "오거스트", k: "8월", pr: ["September", "hot"] },
  { w: "September", p: "셉템버", k: "9월", pr: ["October", "fall"] },
  { w: "October", p: "옥토버", k: "10월", pr: ["November", "Halloween"] },
  { w: "November", p: "노벰버", k: "11월", pr: ["December", "fall"] },
  { w: "December", p: "디셈버", k: "12월", pr: ["January", "Christmas"] },
  { w: "season", p: "시즌", k: "계절", pr: ["spring", "winter"] },
  { w: "harvest", p: "하비스트", k: "수확", pr: ["fall", "crop"] },
  { w: "blossom", p: "블라썸", k: "꽃이 피다", pr: ["spring", "flower"] },
  { w: "snowflake", p: "스노플레이크", k: "눈송이", pr: ["winter", "snow"] },
  { w: "sunlight", p: "선라이트", k: "햇빛", pr: ["summer", "bright"] },
  { w: "breeze", p: "브리즈", k: "산들바람", pr: ["spring", "wind"] },
  { w: "frost", p: "프로스트", k: "서리", pr: ["winter", "cold"] },
  { w: "pollen", p: "폴렌", k: "꽃가루", pr: ["spring", "allergy"] },
  { w: "heatwave", p: "히트웨이브", k: "폭염", pr: ["summer", "hot"] },
];

const G56_INTERMEDIATE_ADJ: W[] = [
  { w: "taller", p: "톨러", k: "더 큰", pr: ["shorter", "bigger"] },
  { w: "shorter", p: "숏터", k: "더 작은", pr: ["taller", "smaller"] },
  { w: "bigger", p: "비거", k: "더 큰", pr: ["smaller", "larger"] },
  { w: "smaller", p: "스몰러", k: "더 작은", pr: ["bigger", "tinier"] },
  { w: "faster", p: "패스터", k: "더 빠른", pr: ["slower", "quicker"] },
  { w: "slower", p: "슬로어", k: "더 느린", pr: ["faster", "steadier"] },
  { w: "stronger", p: "스트롱거", k: "더 강한", pr: ["weaker", "mightier"] },
  { w: "smarter", p: "스마터", k: "더 똑똑한", pr: ["wiser", "cleverer"] },
  { w: "beautiful", p: "뷰티풀", k: "아름다운", pr: ["pretty", "gorgeous"] },
  {
    w: "important",
    p: "임포턴트",
    k: "중요한",
    pr: ["significant", "valuable"],
  },
  { w: "different", p: "디퍼런트", k: "다른", pr: ["same", "similar"] },
  { w: "popular", p: "파퓰러", k: "인기 있는", pr: ["famous", "well-known"] },
  { w: "difficult", p: "디피컬트", k: "어려운", pr: ["hard", "easy"] },
  { w: "delicious", p: "딜리셔스", k: "맛있는", pr: ["tasty", "yummy"] },
  { w: "dangerous", p: "데인저러스", k: "위험한", pr: ["safe", "risky"] },
  { w: "interesting", p: "인터레스팅", k: "재미있는", pr: ["boring", "fun"] },
  { w: "wonderful", p: "원더풀", k: "멋진", pr: ["amazing", "great"] },
  { w: "terrible", p: "테리블", k: "끔찍한", pr: ["awful", "horrible"] },
  { w: "expensive", p: "익스펜시브", k: "비싼", pr: ["cheap", "costly"] },
  { w: "cheap", p: "칩", k: "싼", pr: ["expensive", "affordable"] },
  { w: "famous", p: "페이머스", k: "유명한", pr: ["well-known", "popular"] },
  { w: "comfortable", p: "컴포터블", k: "편안한", pr: ["cozy", "snug"] },
  { w: "necessary", p: "네세서리", k: "필요한", pr: ["essential", "required"] },
  { w: "possible", p: "파서블", k: "가능한", pr: ["impossible", "able"] },
  { w: "heavier", p: "헤비어", k: "더 무거운", pr: ["lighter", "weight"] },
  { w: "lighter", p: "라이터", k: "더 가벼운", pr: ["heavier", "feather"] },
  { w: "deeper", p: "디퍼", k: "더 깊은", pr: ["shallower", "ocean"] },
  { w: "wider", p: "와이더", k: "더 넓은", pr: ["narrower", "broad"] },
  { w: "excellent", p: "엑설런트", k: "훌륭한", pr: ["great", "superb"] },
  { w: "horrible", p: "호러블", k: "끔찍한", pr: ["terrible", "awful"] },
  { w: "enormous", p: "이노머스", k: "거대한", pr: ["huge", "tiny"] },
  { w: "tiny", p: "타이니", k: "아주 작은", pr: ["small", "little"] },
  { w: "ancient", p: "에인션트", k: "고대의", pr: ["old", "modern"] },
  { w: "modern", p: "모던", k: "현대의", pr: ["ancient", "new"] },
  { w: "colorful", p: "컬러풀", k: "다채로운", pr: ["bright", "vivid"] },
];

const G56_PAST_TENSE: W[] = [
  { w: "went", p: "웬트", k: "갔다", pr: ["go", "came"] },
  { w: "ate", p: "에잇", k: "먹었다", pr: ["eat", "drank"] },
  { w: "saw", p: "쏘", k: "보았다", pr: ["see", "watched"] },
  { w: "made", p: "메이드", k: "만들었다", pr: ["make", "built"] },
  { w: "played", p: "플레이드", k: "놀았다", pr: ["play", "ran"] },
  { w: "studied", p: "스터디드", k: "공부했다", pr: ["study", "learned"] },
  { w: "watched", p: "워치드", k: "봤다", pr: ["watch", "saw"] },
  { w: "helped", p: "헬프드", k: "도왔다", pr: ["help", "assisted"] },
  { w: "visited", p: "비지티드", k: "방문했다", pr: ["visit", "went"] },
  { w: "learned", p: "러닛", k: "배웠다", pr: ["learn", "studied"] },
  { w: "bought", p: "보트", k: "샀다", pr: ["buy", "sold"] },
  { w: "ran", p: "랜", k: "달렸다", pr: ["run", "walked"] },
  { w: "wrote", p: "로트", k: "썼다", pr: ["write", "read"] },
  { w: "sang", p: "생", k: "노래했다", pr: ["sing", "danced"] },
  { w: "swam", p: "스왬", k: "수영했다", pr: ["swim", "dove"] },
  { w: "found", p: "파운드", k: "찾았다", pr: ["find", "lost"] },
  { w: "gave", p: "게이브", k: "주었다", pr: ["give", "took"] },
  { w: "told", p: "톨드", k: "말했다", pr: ["tell", "said"] },
  { w: "caught", p: "코트", k: "잡았다", pr: ["catch", "threw"] },
  { w: "forgot", p: "포갓", k: "잊었다", pr: ["forget", "remembered"] },
  { w: "drew", p: "드루", k: "그렸다", pr: ["draw", "painted"] },
  { w: "spoke", p: "스포크", k: "말했다", pr: ["speak", "talked"] },
  { w: "heard", p: "허드", k: "들었다", pr: ["hear", "listened"] },
  { w: "felt", p: "펠트", k: "느꼈다", pr: ["feel", "touched"] },
  { w: "brought", p: "브로트", k: "가져왔다", pr: ["bring", "carried"] },
  { w: "built", p: "빌트", k: "지었다", pr: ["build", "created"] },
  { w: "chose", p: "초즈", k: "골랐다", pr: ["choose", "picked"] },
  { w: "grew", p: "그루", k: "자랐다", pr: ["grow", "bigger"] },
  { w: "knew", p: "뉴", k: "알았다", pr: ["know", "understood"] },
  { w: "thought", p: "쏘트", k: "생각했다", pr: ["think", "believed"] },
];

const G56_JOBS: W[] = [
  { w: "doctor", p: "닥터", k: "의사", pr: ["nurse", "hospital"] },
  { w: "nurse", p: "너스", k: "간호사", pr: ["doctor", "hospital"] },
  {
    w: "police officer",
    p: "폴리스 오피서",
    k: "경찰관",
    pr: ["law", "safety"],
  },
  { w: "firefighter", p: "파이어파이터", k: "소방관", pr: ["fire", "rescue"] },
  { w: "pilot", p: "파일럿", k: "조종사", pr: ["airplane", "fly"] },
  { w: "chef", p: "셰프", k: "요리사", pr: ["cook", "kitchen"] },
  { w: "scientist", p: "사이언티스트", k: "과학자", pr: ["lab", "experiment"] },
  { w: "farmer", p: "파머", k: "농부", pr: ["farm", "crop"] },
  { w: "artist", p: "아티스트", k: "예술가", pr: ["paint", "draw"] },
  { w: "singer", p: "싱어", k: "가수", pr: ["song", "concert"] },
  { w: "dentist", p: "덴티스트", k: "치과의사", pr: ["tooth", "clinic"] },
  { w: "engineer", p: "엔지니어", k: "공학자", pr: ["build", "design"] },
  { w: "lawyer", p: "로이어", k: "변호사", pr: ["court", "law"] },
  { w: "astronaut", p: "애스트로넛", k: "우주비행사", pr: ["space", "rocket"] },
  { w: "vet", p: "벳", k: "수의사", pr: ["animal", "pet"] },
  {
    w: "programmer",
    p: "프로그래머",
    k: "프로그래머",
    pr: ["code", "computer"],
  },
  { w: "architect", p: "아키텍트", k: "건축가", pr: ["building", "design"] },
  { w: "journalist", p: "저널리스트", k: "기자", pr: ["news", "write"] },
  { w: "athlete", p: "애슬릿", k: "운동선수", pr: ["sport", "compete"] },
  { w: "mechanic", p: "메캐닉", k: "정비사", pr: ["car", "fix"] },
  { w: "baker", p: "베이커", k: "제빵사", pr: ["bread", "cake"] },
  { w: "librarian", p: "라이브레리언", k: "사서", pr: ["book", "library"] },
  {
    w: "photographer",
    p: "포토그래퍼",
    k: "사진작가",
    pr: ["camera", "picture"],
  },
  { w: "translator", p: "트랜슬레이터", k: "번역가", pr: ["language", "word"] },
  { w: "designer", p: "디자이너", k: "디자이너", pr: ["art", "create"] },
];

const G56_TECHNOLOGY: W[] = [
  { w: "computer", p: "컴퓨터", k: "컴퓨터", pr: ["keyboard", "mouse"] },
  { w: "phone", p: "폰", k: "전화기", pr: ["call", "text"] },
  { w: "internet", p: "인터넷", k: "인터넷", pr: ["website", "online"] },
  { w: "robot", p: "로봇", k: "로봇", pr: ["machine", "AI"] },
  { w: "camera", p: "카메라", k: "카메라", pr: ["photo", "picture"] },
  { w: "keyboard", p: "키보드", k: "키보드", pr: ["type", "computer"] },
  { w: "mouse", p: "마우스", k: "마우스", pr: ["click", "computer"] },
  { w: "screen", p: "스크린", k: "화면", pr: ["monitor", "display"] },
  { w: "printer", p: "프린터", k: "프린터", pr: ["print", "paper"] },
  { w: "tablet", p: "태블릿", k: "태블릿", pr: ["screen", "touch"] },
  { w: "battery", p: "배터리", k: "배터리", pr: ["charge", "power"] },
  { w: "headphone", p: "헤드폰", k: "헤드폰", pr: ["listen", "music"] },
  { w: "laptop", p: "랩탑", k: "노트북 컴퓨터", pr: ["computer", "portable"] },
  { w: "smartphone", p: "스마트폰", k: "스마트폰", pr: ["phone", "app"] },
  { w: "speaker", p: "스피커", k: "스피커", pr: ["sound", "music"] },
  { w: "charger", p: "차저", k: "충전기", pr: ["battery", "plug"] },
  { w: "Wi-Fi", p: "와이파이", k: "와이파이", pr: ["internet", "connect"] },
  { w: "USB", p: "유에스비", k: "유에스비", pr: ["cable", "connect"] },
  { w: "microphone", p: "마이크로폰", k: "마이크", pr: ["voice", "record"] },
  { w: "drone", p: "드론", k: "드론", pr: ["fly", "camera"] },
  { w: "GPS", p: "지피에스", k: "지피에스", pr: ["map", "location"] },
  { w: "software", p: "소프트웨어", k: "소프트웨어", pr: ["program", "app"] },
];

// ============================================================
// Grade 3-4 Additional Expansion Word Banks (2차 확장)
// ============================================================

const G34_INSECTS: W[] = [
  { w: "ant", p: "앤트", k: "개미", pr: ["small", "colony"] },
  { w: "bee", p: "비", k: "벌", pr: ["honey", "sting"] },
  { w: "butterfly", p: "버터플라이", k: "나비", pr: ["wing", "flower"] },
  { w: "ladybug", p: "레이디벅", k: "무당벌레", pr: ["red", "spot"] },
  { w: "dragonfly", p: "드래곤플라이", k: "잠자리", pr: ["wing", "pond"] },
  { w: "grasshopper", p: "그래스하퍼", k: "메뚜기", pr: ["jump", "green"] },
  { w: "beetle", p: "비틀", k: "딱정벌레", pr: ["hard", "shell"] },
  { w: "caterpillar", p: "캐터필러", k: "애벌레", pr: ["leaf", "crawl"] },
  { w: "cricket", p: "크리켓", k: "귀뚜라미", pr: ["chirp", "night"] },
  { w: "firefly", p: "파이어플라이", k: "반딧불이", pr: ["light", "night"] },
  { w: "moth", p: "모스", k: "나방", pr: ["light", "night"] },
  { w: "worm", p: "웜", k: "지렁이", pr: ["soil", "dig"] },
  { w: "mosquito", p: "모스키토", k: "모기", pr: ["bite", "buzz"] },
  { w: "fly", p: "플라이", k: "파리", pr: ["buzz", "wing"] },
  { w: "snail", p: "스네일", k: "달팽이", pr: ["shell", "slow"] },
  { w: "spider", p: "스파이더", k: "거미", pr: ["web", "eight"] },
  { w: "centipede", p: "센티피드", k: "지네", pr: ["legs", "many"] },
  { w: "cockroach", p: "카크로치", k: "바퀴벌레", pr: ["dark", "fast"] },
  { w: "cicada", p: "시케이다", k: "매미", pr: ["summer", "loud"] },
  { w: "mantis", p: "맨티스", k: "사마귀", pr: ["green", "pray"] },
];

const G34_OCCUPATIONS_BASIC: W[] = [
  { w: "doctor", p: "닥터", k: "의사", pr: ["hospital", "help"] },
  { w: "teacher", p: "티처", k: "선생님", pr: ["school", "teach"] },
  { w: "farmer", p: "파머", k: "농부", pr: ["farm", "grow"] },
  { w: "driver", p: "드라이버", k: "운전사", pr: ["bus", "car"] },
  { w: "cook", p: "쿡", k: "요리사", pr: ["food", "kitchen"] },
  { w: "singer", p: "싱어", k: "가수", pr: ["song", "stage"] },
  { w: "dancer", p: "댄서", k: "무용가", pr: ["dance", "stage"] },
  { w: "painter", p: "페인터", k: "화가", pr: ["art", "brush"] },
  { w: "builder", p: "빌더", k: "건축가", pr: ["house", "build"] },
  { w: "pilot", p: "파일럿", k: "조종사", pr: ["airplane", "fly"] },
  { w: "police", p: "폴리스", k: "경찰", pr: ["safety", "help"] },
  { w: "nurse", p: "너스", k: "간호사", pr: ["hospital", "care"] },
  { w: "dentist", p: "덴티스트", k: "치과의사", pr: ["tooth", "clean"] },
  { w: "vet", p: "벳", k: "수의사", pr: ["animal", "help"] },
  { w: "baker", p: "베이커", k: "제빵사", pr: ["bread", "oven"] },
  { w: "waiter", p: "웨이터", k: "웨이터", pr: ["food", "serve"] },
  { w: "postman", p: "포스트맨", k: "우체부", pr: ["letter", "deliver"] },
  { w: "firefighter", p: "파이어파이터", k: "소방관", pr: ["fire", "rescue"] },
  { w: "astronaut", p: "애스트로넛", k: "우주비행사", pr: ["space", "rocket"] },
  { w: "scientist", p: "사이언티스트", k: "과학자", pr: ["lab", "discover"] },
];

const G34_FURNITURE: W[] = [
  { w: "sofa", p: "소파", k: "소파", pr: ["sit", "living room"] },
  { w: "table", p: "테이블", k: "탁자", pr: ["eat", "put"] },
  { w: "chair", p: "체어", k: "의자", pr: ["sit", "desk"] },
  { w: "bed", p: "베드", k: "침대", pr: ["sleep", "pillow"] },
  { w: "shelf", p: "쉘프", k: "선반", pr: ["book", "store"] },
  { w: "drawer", p: "드로어", k: "서랍", pr: ["put", "store"] },
  { w: "wardrobe", p: "워드로브", k: "옷장", pr: ["clothes", "hang"] },
  { w: "cabinet", p: "캐비닛", k: "캐비닛", pr: ["store", "kitchen"] },
  { w: "bookcase", p: "북케이스", k: "책장", pr: ["book", "shelf"] },
  { w: "stool", p: "스툴", k: "의자", pr: ["sit", "short"] },
  { w: "rug", p: "러그", k: "깔개", pr: ["floor", "soft"] },
  { w: "curtain", p: "커튼", k: "커튼", pr: ["window", "cover"] },
  { w: "carpet", p: "카펫", k: "카펫", pr: ["floor", "soft"] },
  { w: "fan", p: "팬", k: "선풍기", pr: ["cool", "air"] },
  { w: "clock", p: "클락", k: "시계", pr: ["time", "wall"] },
  { w: "vase", p: "베이스", k: "꽃병", pr: ["flower", "water"] },
  { w: "basket", p: "바스켓", k: "바구니", pr: ["carry", "hold"] },
  { w: "hanger", p: "행어", k: "옷걸이", pr: ["clothes", "hang"] },
  { w: "mirror", p: "미러", k: "거울", pr: ["face", "look"] },
  { w: "frame", p: "프레임", k: "액자", pr: ["picture", "wall"] },
];

const G34_FEELINGS_EXTRA: W[] = [
  { w: "sleepy", p: "슬리피", k: "졸린", pr: ["tired", "bed"] },
  { w: "thirsty", p: "써스티", k: "목마른", pr: ["water", "drink"] },
  { w: "hungry", p: "헝그리", k: "배고픈", pr: ["food", "eat"] },
  { w: "full", p: "풀", k: "배부른", pr: ["eat", "enough"] },
  { w: "sick", p: "식", k: "아픈", pr: ["cold", "doctor"] },
  { w: "well", p: "웰", k: "건강한", pr: ["healthy", "good"] },
  { w: "excited", p: "익사이티드", k: "들뜬", pr: ["happy", "thrilled"] },
  { w: "lucky", p: "럭키", k: "운이 좋은", pr: ["fortune", "happy"] },
  { w: "afraid", p: "어프레이드", k: "두려운", pr: ["scared", "fear"] },
  { w: "sorry", p: "쏘리", k: "미안한", pr: ["sad", "regret"] },
  { w: "comfortable", p: "컴포터블", k: "편안한", pr: ["cozy", "warm"] },
  { w: "confused", p: "컨퓨즈드", k: "혼란스러운", pr: ["lost", "wonder"] },
  { w: "pleased", p: "플리즈드", k: "기쁜", pr: ["happy", "glad"] },
  { w: "upset", p: "업셋", k: "속상한", pr: ["sad", "unhappy"] },
  { w: "amazed", p: "어메이즈드", k: "놀란", pr: ["surprised", "wow"] },
  { w: "relaxed", p: "릴랙스드", k: "편안한", pr: ["calm", "rest"] },
  { w: "energetic", p: "에너제틱", k: "활기찬", pr: ["active", "lively"] },
  { w: "gentle", p: "젠틀", k: "다정한", pr: ["kind", "soft"] },
  { w: "lazy", p: "레이지", k: "게으른", pr: ["slow", "rest"] },
  { w: "patient", p: "페이션트", k: "참을성 있는", pr: ["wait", "calm"] },
];

const G34_PLACES_BASIC: W[] = [
  { w: "school", p: "스쿨", k: "학교", pr: ["study", "teacher"] },
  { w: "home", p: "홈", k: "집", pr: ["family", "room"] },
  { w: "park", p: "파크", k: "공원", pr: ["play", "tree"] },
  { w: "hospital", p: "호스피탈", k: "병원", pr: ["doctor", "sick"] },
  { w: "library", p: "라이브러리", k: "도서관", pr: ["book", "read"] },
  { w: "zoo", p: "주", k: "동물원", pr: ["animal", "visit"] },
  { w: "market", p: "마켓", k: "시장", pr: ["buy", "food"] },
  { w: "church", p: "처치", k: "교회", pr: ["pray", "Sunday"] },
  { w: "restaurant", p: "레스토랑", k: "식당", pr: ["food", "eat"] },
  { w: "bank", p: "뱅크", k: "은행", pr: ["money", "save"] },
  { w: "playground", p: "플레이그라운드", k: "놀이터", pr: ["play", "swing"] },
  { w: "beach", p: "비치", k: "해변", pr: ["sand", "swim"] },
  { w: "cinema", p: "시네마", k: "영화관", pr: ["movie", "watch"] },
  { w: "bakery", p: "베이커리", k: "빵집", pr: ["bread", "cake"] },
  { w: "farm", p: "팜", k: "농장", pr: ["animal", "grow"] },
  { w: "museum", p: "뮤지엄", k: "박물관", pr: ["art", "history"] },
  { w: "station", p: "스테이션", k: "역", pr: ["train", "bus"] },
  { w: "airport", p: "에어포트", k: "공항", pr: ["airplane", "travel"] },
  { w: "gym", p: "짐", k: "체육관", pr: ["exercise", "sport"] },
  { w: "garden", p: "가든", k: "정원", pr: ["flower", "plant"] },
];

const G34_VERBS_EXTRA: W[] = [
  { w: "wake", p: "웨이크", k: "일어나다", pr: ["sleep", "morning"] },
  { w: "brush", p: "브러시", k: "닦다", pr: ["teeth", "hair"] },
  { w: "wear", p: "웨어", k: "입다", pr: ["clothes", "put on"] },
  { w: "carry", p: "캐리", k: "나르다", pr: ["hold", "bring"] },
  { w: "drop", p: "드롭", k: "떨어뜨리다", pr: ["fall", "oops"] },
  { w: "pick", p: "픽", k: "고르다", pr: ["choose", "select"] },
  { w: "wait", p: "웨이트", k: "기다리다", pr: ["stop", "patience"] },
  { w: "learn", p: "런", k: "배우다", pr: ["study", "know"] },
  { w: "teach", p: "티치", k: "가르치다", pr: ["school", "learn"] },
  { w: "share", p: "쉐어", k: "나누다", pr: ["give", "together"] },
  { w: "count", p: "카운트", k: "세다", pr: ["number", "math"] },
  { w: "build", p: "빌드", k: "짓다", pr: ["make", "create"] },
  { w: "break", p: "브레이크", k: "깨다", pr: ["fix", "crack"] },
  { w: "fix", p: "픽스", k: "고치다", pr: ["repair", "mend"] },
  { w: "hide", p: "하이드", k: "숨다", pr: ["seek", "find"] },
  { w: "find", p: "파인드", k: "찾다", pr: ["look", "search"] },
  { w: "guess", p: "게스", k: "추측하다", pr: ["think", "try"] },
  { w: "dream", p: "드림", k: "꿈꾸다", pr: ["sleep", "wish"] },
  { w: "grow", p: "그로", k: "자라다", pr: ["big", "plant"] },
  { w: "clean", p: "클린", k: "청소하다", pr: ["tidy", "wash"] },
];

const G34_OPPOSITES: W[] = [
  { w: "big", p: "빅", k: "큰", pr: ["small", "large"] },
  { w: "small", p: "스몰", k: "작은", pr: ["big", "tiny"] },
  { w: "hot", p: "핫", k: "뜨거운", pr: ["cold", "warm"] },
  { w: "cold", p: "콜드", k: "차가운", pr: ["hot", "cool"] },
  { w: "fast", p: "패스트", k: "빠른", pr: ["slow", "quick"] },
  { w: "slow", p: "슬로", k: "느린", pr: ["fast", "steady"] },
  { w: "tall", p: "톨", k: "키 큰", pr: ["short", "high"] },
  { w: "short", p: "숏", k: "키 작은", pr: ["tall", "low"] },
  { w: "heavy", p: "헤비", k: "무거운", pr: ["light", "weight"] },
  { w: "light", p: "라이트", k: "가벼운", pr: ["heavy", "feather"] },
  { w: "old", p: "올드", k: "오래된", pr: ["new", "young"] },
  { w: "new", p: "뉴", k: "새로운", pr: ["old", "fresh"] },
  { w: "open", p: "오픈", k: "열린", pr: ["close", "door"] },
  { w: "close", p: "클로즈", k: "닫힌", pr: ["open", "shut"] },
  { w: "up", p: "업", k: "위로", pr: ["down", "high"] },
  { w: "down", p: "다운", k: "아래로", pr: ["up", "low"] },
  { w: "happy", p: "해피", k: "행복한", pr: ["sad", "glad"] },
  { w: "sad", p: "새드", k: "슬픈", pr: ["happy", "cry"] },
  { w: "wet", p: "웻", k: "젖은", pr: ["dry", "water"] },
  { w: "dry", p: "드라이", k: "마른", pr: ["wet", "sun"] },
];

const G34_TIME_BASIC: W[] = [
  { w: "morning", p: "모닝", k: "아침", pr: ["afternoon", "sunrise"] },
  { w: "afternoon", p: "애프터눈", k: "오후", pr: ["morning", "lunch"] },
  { w: "evening", p: "이브닝", k: "저녁", pr: ["night", "dinner"] },
  { w: "night", p: "나잇", k: "밤", pr: ["day", "sleep"] },
  { w: "today", p: "투데이", k: "오늘", pr: ["yesterday", "tomorrow"] },
  { w: "yesterday", p: "예스터데이", k: "어제", pr: ["today", "past"] },
  { w: "tomorrow", p: "투머로우", k: "내일", pr: ["today", "future"] },
  { w: "always", p: "올웨이즈", k: "항상", pr: ["never", "every"] },
  { w: "never", p: "네버", k: "절대 안", pr: ["always", "not"] },
  { w: "sometimes", p: "섬타임즈", k: "가끔", pr: ["always", "often"] },
  { w: "now", p: "나우", k: "지금", pr: ["later", "here"] },
  { w: "soon", p: "순", k: "곧", pr: ["later", "quick"] },
  { w: "early", p: "얼리", k: "일찍", pr: ["late", "morning"] },
  { w: "late", p: "레이트", k: "늦은", pr: ["early", "hurry"] },
  { w: "already", p: "올레디", k: "이미", pr: ["yet", "done"] },
  { w: "still", p: "스틸", k: "아직", pr: ["already", "yet"] },
  { w: "often", p: "오프튼", k: "자주", pr: ["rarely", "many"] },
  { w: "once", p: "원스", k: "한 번", pr: ["twice", "one"] },
  { w: "twice", p: "트와이스", k: "두 번", pr: ["once", "two"] },
  { w: "before", p: "비포", k: "전에", pr: ["after", "first"] },
];

const G34_CONTAINERS: W[] = [
  { w: "box", p: "박스", k: "상자", pr: ["square", "pack"] },
  { w: "bag", p: "백", k: "가방", pr: ["carry", "hold"] },
  { w: "bottle", p: "보틀", k: "병", pr: ["water", "drink"] },
  { w: "cup", p: "컵", k: "컵", pr: ["drink", "hold"] },
  { w: "jar", p: "자", k: "단지", pr: ["jam", "store"] },
  { w: "bowl", p: "보울", k: "그릇", pr: ["soup", "eat"] },
  { w: "plate", p: "플레이트", k: "접시", pr: ["food", "eat"] },
  { w: "can", p: "캔", k: "캔", pr: ["metal", "drink"] },
  { w: "bucket", p: "버킷", k: "양동이", pr: ["water", "carry"] },
  { w: "pot", p: "팟", k: "냄비", pr: ["cook", "soup"] },
  { w: "tray", p: "트레이", k: "쟁반", pr: ["carry", "food"] },
  { w: "basket", p: "바스켓", k: "바구니", pr: ["fruit", "carry"] },
  { w: "envelope", p: "엔벨로프", k: "봉투", pr: ["letter", "send"] },
  { w: "wallet", p: "월릿", k: "지갑", pr: ["money", "pocket"] },
  { w: "backpack", p: "백팩", k: "배낭", pr: ["school", "carry"] },
  { w: "lunch box", p: "런치 박스", k: "도시락", pr: ["food", "school"] },
  { w: "pencil case", p: "펜슬 케이스", k: "필통", pr: ["pencil", "school"] },
  { w: "trash can", p: "트래시 캔", k: "쓰레기통", pr: ["throw", "clean"] },
  { w: "water bottle", p: "워터 보틀", k: "물병", pr: ["drink", "carry"] },
  { w: "tissue box", p: "티슈 박스", k: "휴지통", pr: ["tissue", "paper"] },
];

// ============================================================
// NEW Grade 3-4 Word Banks (추가 확장)
// ============================================================

const G34_SHAPES: W[] = [
  { w: "circle", p: "서클", k: "원", pr: ["round", "ring"] },
  { w: "square", p: "스퀘어", k: "정사각형", pr: ["box", "four"] },
  { w: "triangle", p: "트라이앵글", k: "삼각형", pr: ["three", "point"] },
  { w: "rectangle", p: "렉탱글", k: "직사각형", pr: ["box", "long"] },
  { w: "star", p: "스타", k: "별 모양", pr: ["point", "five"] },
  { w: "heart", p: "하트", k: "하트 모양", pr: ["love", "red"] },
  { w: "diamond", p: "다이아몬드", k: "다이아몬드 모양", pr: ["gem", "shape"] },
  { w: "oval", p: "오벌", k: "타원형", pr: ["egg", "round"] },
  { w: "cube", p: "큐브", k: "정육면체", pr: ["box", "dice"] },
  { w: "sphere", p: "스피어", k: "구", pr: ["ball", "round"] },
  { w: "cone", p: "콘", k: "원뿔", pr: ["ice cream", "point"] },
  { w: "cylinder", p: "실린더", k: "원기둥", pr: ["tube", "can"] },
  { w: "arrow", p: "애로", k: "화살표", pr: ["point", "direction"] },
  { w: "cross", p: "크로스", k: "십자 모양", pr: ["plus", "cross"] },
  { w: "line", p: "라인", k: "선", pr: ["straight", "draw"] },
  { w: "dot", p: "돗", k: "점", pr: ["spot", "small"] },
  { w: "spiral", p: "스파이럴", k: "나선형", pr: ["twist", "curl"] },
  { w: "hexagon", p: "헥사곤", k: "육각형", pr: ["six", "bee"] },
  { w: "pentagon", p: "펜타곤", k: "오각형", pr: ["five", "shape"] },
  { w: "crescent", p: "크레센트", k: "초승달 모양", pr: ["moon", "curve"] },
];

const G34_TOYS: W[] = [
  { w: "toy", p: "토이", k: "장난감", pr: ["play", "fun"] },
  { w: "doll", p: "돌", k: "인형", pr: ["girl", "play"] },
  { w: "ball", p: "볼", k: "공", pr: ["throw", "catch"] },
  { w: "block", p: "블록", k: "블록", pr: ["build", "stack"] },
  { w: "puzzle", p: "퍼즐", k: "퍼즐", pr: ["piece", "solve"] },
  { w: "kite", p: "카이트", k: "연", pr: ["fly", "wind"] },
  { w: "robot", p: "로봇", k: "로봇", pr: ["machine", "play"] },
  { w: "teddy bear", p: "테디 베어", k: "곰인형", pr: ["soft", "hug"] },
  { w: "board game", p: "보드 게임", k: "보드게임", pr: ["dice", "play"] },
  { w: "card game", p: "카드 게임", k: "카드게임", pr: ["play", "fun"] },
  { w: "swing", p: "스윙", k: "그네", pr: ["playground", "fly"] },
  { w: "slide", p: "슬라이드", k: "미끄럼틀", pr: ["down", "playground"] },
  { w: "bicycle", p: "바이시클", k: "자전거", pr: ["ride", "wheel"] },
  {
    w: "skateboard",
    p: "스케이트보드",
    k: "스케이트보드",
    pr: ["ride", "wheel"],
  },
  { w: "jump rope", p: "점프 로프", k: "줄넘기", pr: ["jump", "skip"] },
  { w: "balloon", p: "벌룬", k: "풍선", pr: ["air", "pop"] },
  { w: "sticker", p: "스티커", k: "스티커", pr: ["stick", "paper"] },
  { w: "top", p: "탑", k: "팽이", pr: ["spin", "toy"] },
  { w: "yo-yo", p: "요요", k: "요요", pr: ["string", "spin"] },
  { w: "marble", p: "마블", k: "구슬", pr: ["roll", "glass"] },
];

const G34_MATERIALS: W[] = [
  { w: "wood", p: "우드", k: "나무", pr: ["tree", "hard"] },
  { w: "metal", p: "메탈", k: "금속", pr: ["iron", "hard"] },
  { w: "glass", p: "글래스", k: "유리", pr: ["window", "clear"] },
  { w: "plastic", p: "플라스틱", k: "플라스틱", pr: ["bottle", "light"] },
  { w: "paper", p: "페이퍼", k: "종이", pr: ["book", "write"] },
  { w: "cloth", p: "클로스", k: "천", pr: ["fabric", "soft"] },
  { w: "rubber", p: "러버", k: "고무", pr: ["eraser", "bounce"] },
  { w: "stone", p: "스톤", k: "돌", pr: ["rock", "hard"] },
  { w: "cotton", p: "코튼", k: "면", pr: ["soft", "shirt"] },
  { w: "silk", p: "실크", k: "비단", pr: ["smooth", "soft"] },
  { w: "leather", p: "레더", k: "가죽", pr: ["shoe", "bag"] },
  { w: "wool", p: "울", k: "양모", pr: ["sheep", "warm"] },
  { w: "brick", p: "브릭", k: "벽돌", pr: ["build", "wall"] },
  { w: "clay", p: "클레이", k: "점토", pr: ["mold", "art"] },
  { w: "sand", p: "샌드", k: "모래", pr: ["beach", "castle"] },
  { w: "ice", p: "아이스", k: "얼음", pr: ["cold", "water"] },
  { w: "wax", p: "왁스", k: "밀랍", pr: ["candle", "smooth"] },
  { w: "foam", p: "폼", k: "거품", pr: ["soft", "light"] },
  { w: "cardboard", p: "카드보드", k: "판지", pr: ["box", "paper"] },
  { w: "rope", p: "로프", k: "밧줄", pr: ["tie", "pull"] },
];

const G34_QUESTIONS: W[] = [
  { w: "what", p: "왓", k: "무엇", pr: ["which", "that"] },
  { w: "where", p: "웨어", k: "어디", pr: ["here", "there"] },
  { w: "when", p: "웬", k: "언제", pr: ["now", "then"] },
  { w: "who", p: "후", k: "누구", pr: ["he", "she"] },
  { w: "why", p: "와이", k: "왜", pr: ["because", "reason"] },
  { w: "how", p: "하우", k: "어떻게", pr: ["way", "method"] },
  { w: "which", p: "위치", k: "어느 것", pr: ["what", "that"] },
  { w: "how many", p: "하우 매니", k: "몇 개", pr: ["count", "number"] },
  { w: "how much", p: "하우 머치", k: "얼마", pr: ["price", "cost"] },
  { w: "how old", p: "하우 올드", k: "몇 살", pr: ["age", "year"] },
  { w: "how long", p: "하우 롱", k: "얼마나 긴", pr: ["time", "length"] },
  { w: "how far", p: "하우 파", k: "얼마나 먼", pr: ["distance", "near"] },
  {
    w: "how often",
    p: "하우 오프튼",
    k: "얼마나 자주",
    pr: ["always", "sometimes"],
  },
  { w: "whose", p: "후즈", k: "누구의", pr: ["mine", "yours"] },
  { w: "yes", p: "예스", k: "네", pr: ["no", "okay"] },
  { w: "no", p: "노", k: "아니요", pr: ["yes", "not"] },
  { w: "maybe", p: "메이비", k: "아마도", pr: ["perhaps", "possibly"] },
  { w: "of course", p: "오브 코스", k: "물론", pr: ["sure", "yes"] },
  { w: "sure", p: "슈어", k: "확실히", pr: ["yes", "okay"] },
  { w: "I see", p: "아이 시", k: "알겠어요", pr: ["understand", "okay"] },
];

const G34_WEATHER_BASIC: W[] = [
  { w: "weather", p: "웨더", k: "날씨", pr: ["climate", "sky"] },
  { w: "rain", p: "레인", k: "비", pr: ["umbrella", "wet"] },
  { w: "snow", p: "스노", k: "눈", pr: ["cold", "white"] },
  { w: "cloud", p: "클라우드", k: "구름", pr: ["sky", "gray"] },
  { w: "wind", p: "윈드", k: "바람", pr: ["blow", "breeze"] },
  { w: "thunder", p: "썬더", k: "천둥", pr: ["lightning", "loud"] },
  { w: "lightning", p: "라이트닝", k: "번개", pr: ["thunder", "flash"] },
  { w: "rainbow", p: "레인보", k: "무지개", pr: ["rain", "color"] },
  { w: "storm", p: "스톰", k: "폭풍", pr: ["wind", "rain"] },
  { w: "sunshine", p: "선샤인", k: "햇살", pr: ["sun", "bright"] },
  { w: "umbrella", p: "엄브렐라", k: "우산", pr: ["rain", "wet"] },
  { w: "thermometer", p: "써모미터", k: "온도계", pr: ["temperature", "hot"] },
  { w: "frost", p: "프로스트", k: "서리", pr: ["cold", "ice"] },
  { w: "hail", p: "헤일", k: "우박", pr: ["ice", "storm"] },
  { w: "puddle", p: "퍼들", k: "물웅덩이", pr: ["rain", "water"] },
  { w: "snowman", p: "스노맨", k: "눈사람", pr: ["snow", "winter"] },
  { w: "fog", p: "포그", k: "안개", pr: ["misty", "hazy"] },
  { w: "dew", p: "듀", k: "이슬", pr: ["morning", "water"] },
  { w: "flood", p: "플러드", k: "홍수", pr: ["rain", "water"] },
  { w: "drought", p: "드라우트", k: "가뭄", pr: ["dry", "hot"] },
];

const G34_SPORTS: W[] = [
  { w: "soccer", p: "사커", k: "축구", pr: ["ball", "kick"] },
  { w: "basketball", p: "바스켓볼", k: "농구", pr: ["shoot", "court"] },
  { w: "baseball", p: "베이스볼", k: "야구", pr: ["bat", "pitch"] },
  { w: "swimming", p: "스위밍", k: "수영", pr: ["pool", "water"] },
  { w: "running", p: "러닝", k: "달리기", pr: ["fast", "race"] },
  { w: "jumping", p: "점핑", k: "뛰기", pr: ["hop", "high"] },
  { w: "tennis", p: "테니스", k: "테니스", pr: ["racket", "ball"] },
  { w: "badminton", p: "배드민턴", k: "배드민턴", pr: ["shuttle", "racket"] },
  { w: "volleyball", p: "발리볼", k: "배구", pr: ["net", "team"] },
  { w: "golf", p: "골프", k: "골프", pr: ["club", "ball"] },
  { w: "skating", p: "스케이팅", k: "스케이팅", pr: ["ice", "rink"] },
  { w: "skiing", p: "스키잉", k: "스키", pr: ["snow", "mountain"] },
  { w: "taekwondo", p: "태권도", k: "태권도", pr: ["kick", "martial"] },
  { w: "gymnastics", p: "짐내스틱스", k: "체조", pr: ["flip", "balance"] },
  { w: "track", p: "트랙", k: "트랙", pr: ["run", "race"] },
  { w: "team", p: "팀", k: "팀", pr: ["group", "together"] },
  { w: "score", p: "스코어", k: "점수", pr: ["point", "win"] },
  { w: "coach", p: "코치", k: "코치", pr: ["teach", "train"] },
  { w: "referee", p: "레퍼리", k: "심판", pr: ["judge", "fair"] },
  { w: "medal", p: "메달", k: "메달", pr: ["gold", "win"] },
];

const G34_EMOTIONS_BASIC: W[] = [
  { w: "happy", p: "해피", k: "행복한", pr: ["glad", "joyful"] },
  { w: "sad", p: "새드", k: "슬픈", pr: ["unhappy", "cry"] },
  { w: "angry", p: "앵그리", k: "화난", pr: ["mad", "upset"] },
  { w: "scared", p: "스케어드", k: "무서운", pr: ["afraid", "fear"] },
  { w: "surprised", p: "서프라이즈드", k: "놀란", pr: ["amazed", "wow"] },
  { w: "tired", p: "타이어드", k: "피곤한", pr: ["sleepy", "rest"] },
  { w: "excited", p: "익사이티드", k: "신나는", pr: ["thrilled", "eager"] },
  { w: "bored", p: "보어드", k: "지루한", pr: ["dull", "yawn"] },
  { w: "lonely", p: "론리", k: "외로운", pr: ["alone", "sad"] },
  { w: "proud", p: "프라우드", k: "자랑스러운", pr: ["confident", "great"] },
  { w: "shy", p: "샤이", k: "수줍은", pr: ["timid", "quiet"] },
  { w: "nervous", p: "너버스", k: "긴장한", pr: ["anxious", "worried"] },
  { w: "curious", p: "큐리어스", k: "궁금한", pr: ["wonder", "ask"] },
  { w: "thankful", p: "땡크풀", k: "감사한", pr: ["grateful", "happy"] },
  { w: "worried", p: "워리드", k: "걱정되는", pr: ["anxious", "nervous"] },
  { w: "calm", p: "캄", k: "차분한", pr: ["quiet", "peaceful"] },
  { w: "cheerful", p: "치어풀", k: "쾌활한", pr: ["happy", "bright"] },
  { w: "funny", p: "퍼니", k: "웃긴", pr: ["hilarious", "silly"] },
  { w: "brave", p: "브레이브", k: "용감한", pr: ["bold", "fearless"] },
  { w: "grumpy", p: "그럼피", k: "심술궂은", pr: ["cranky", "moody"] },
];

const G34_FRUITS_VEG: W[] = [
  { w: "watermelon", p: "워터멜론", k: "수박", pr: ["summer", "red"] },
  { w: "cherry", p: "체리", k: "체리", pr: ["red", "small"] },
  { w: "blueberry", p: "블루베리", k: "블루베리", pr: ["blue", "small"] },
  { w: "kiwi", p: "키위", k: "키위", pr: ["green", "fuzzy"] },
  { w: "coconut", p: "코코넛", k: "코코넛", pr: ["tropical", "milk"] },
  { w: "avocado", p: "아보카도", k: "아보카도", pr: ["green", "healthy"] },
  { w: "broccoli", p: "브로콜리", k: "브로콜리", pr: ["green", "vegetable"] },
  { w: "cucumber", p: "큐컴버", k: "오이", pr: ["green", "cool"] },
  { w: "lettuce", p: "레터스", k: "상추", pr: ["salad", "green"] },
  { w: "spinach", p: "스피니치", k: "시금치", pr: ["green", "healthy"] },
  { w: "pepper", p: "페퍼", k: "고추", pr: ["spicy", "red"] },
  { w: "pumpkin", p: "펌킨", k: "호박", pr: ["orange", "Halloween"] },
  { w: "garlic", p: "갈릭", k: "마늘", pr: ["smell", "cook"] },
  { w: "ginger", p: "진저", k: "생강", pr: ["spicy", "tea"] },
  { w: "cabbage", p: "캐비지", k: "양배추", pr: ["green", "wrap"] },
  { w: "bean", p: "빈", k: "콩", pr: ["plant", "grow"] },
  { w: "pea", p: "피", k: "완두콩", pr: ["green", "small"] },
  { w: "eggplant", p: "에그플랜트", k: "가지", pr: ["purple", "vegetable"] },
  { w: "plum", p: "플럼", k: "자두", pr: ["purple", "sweet"] },
  { w: "fig", p: "피그", k: "무화과", pr: ["sweet", "fruit"] },
];

const G34_MUSIC: W[] = [
  { w: "piano", p: "피아노", k: "피아노", pr: ["keyboard", "play"] },
  { w: "guitar", p: "기타", k: "기타", pr: ["string", "strum"] },
  { w: "drum", p: "드럼", k: "드럼", pr: ["beat", "stick"] },
  { w: "violin", p: "바이올린", k: "바이올린", pr: ["bow", "string"] },
  { w: "flute", p: "플루트", k: "플루트", pr: ["blow", "wind"] },
  { w: "trumpet", p: "트럼펫", k: "트럼펫", pr: ["brass", "blow"] },
  { w: "song", p: "송", k: "노래", pr: ["sing", "melody"] },
  { w: "melody", p: "멜로디", k: "멜로디", pr: ["tune", "song"] },
  { w: "rhythm", p: "리듬", k: "리듬", pr: ["beat", "tempo"] },
  { w: "concert", p: "콘서트", k: "음악회", pr: ["show", "stage"] },
  { w: "choir", p: "콰이어", k: "합창단", pr: ["sing", "group"] },
  { w: "band", p: "밴드", k: "밴드", pr: ["group", "music"] },
  { w: "note", p: "노트", k: "음표", pr: ["music", "sound"] },
  { w: "tambourine", p: "탬버린", k: "탬버린", pr: ["shake", "beat"] },
  { w: "recorder", p: "리코더", k: "리코더", pr: ["blow", "play"] },
  { w: "xylophone", p: "자일로폰", k: "실로폰", pr: ["hit", "key"] },
  { w: "harmonica", p: "하모니카", k: "하모니카", pr: ["blow", "wind"] },
  { w: "ukulele", p: "우쿨렐레", k: "우쿨렐레", pr: ["string", "small"] },
  { w: "microphone", p: "마이크로폰", k: "마이크", pr: ["sing", "voice"] },
  { w: "speaker", p: "스피커", k: "스피커", pr: ["sound", "loud"] },
];

const G34_SEASONS_BASIC: W[] = [
  { w: "spring", p: "스프링", k: "봄", pr: ["flower", "warm"] },
  { w: "summer", p: "서머", k: "여름", pr: ["hot", "swim"] },
  { w: "fall", p: "폴", k: "가을", pr: ["leaf", "cool"] },
  { w: "winter", p: "윈터", k: "겨울", pr: ["cold", "snow"] },
  { w: "warm", p: "웜", k: "따뜻한", pr: ["hot", "spring"] },
  { w: "cool", p: "쿨", k: "시원한", pr: ["cold", "autumn"] },
  { w: "hot", p: "핫", k: "뜨거운", pr: ["warm", "summer"] },
  { w: "cold", p: "콜드", k: "추운", pr: ["cool", "winter"] },
  { w: "rainy", p: "레이니", k: "비 오는", pr: ["wet", "umbrella"] },
  { w: "snowy", p: "스노이", k: "눈 오는", pr: ["cold", "white"] },
  { w: "sunny", p: "서니", k: "화창한", pr: ["bright", "clear"] },
  { w: "windy", p: "윈디", k: "바람 부는", pr: ["breeze", "blow"] },
  { w: "cloudy", p: "클라우디", k: "흐린", pr: ["gray", "sky"] },
  { w: "foggy", p: "포기", k: "안개 낀", pr: ["misty", "hazy"] },
  { w: "stormy", p: "스토미", k: "폭풍우의", pr: ["thunder", "rain"] },
  { w: "dry", p: "드라이", k: "건조한", pr: ["wet", "arid"] },
  { w: "humid", p: "휴미드", k: "습한", pr: ["sticky", "moist"] },
  { w: "icy", p: "아이시", k: "얼음처럼 찬", pr: ["cold", "slippery"] },
  { w: "breezy", p: "브리지", k: "산들바람 부는", pr: ["wind", "gentle"] },
  { w: "clear", p: "클리어", k: "맑은", pr: ["sunny", "bright"] },
];

const G34_CLASSROOM: W[] = [
  { w: "classroom", p: "클래스룸", k: "교실", pr: ["school", "study"] },
  { w: "teacher", p: "티처", k: "선생님", pr: ["school", "class"] },
  { w: "student", p: "스튜던트", k: "학생", pr: ["pupil", "learn"] },
  {
    w: "whiteboard",
    p: "화이트보드",
    k: "화이트보드",
    pr: ["write", "marker"],
  },
  { w: "projector", p: "프로젝터", k: "프로젝터", pr: ["screen", "show"] },
  { w: "locker", p: "라커", k: "사물함", pr: ["lock", "store"] },
  { w: "playground", p: "플레이그라운드", k: "운동장", pr: ["play", "run"] },
  { w: "hallway", p: "홀웨이", k: "복도", pr: ["walk", "corridor"] },
  { w: "gym", p: "짐", k: "체육관", pr: ["exercise", "sport"] },
  { w: "library", p: "라이브러리", k: "도서관", pr: ["book", "read"] },
  { w: "art room", p: "아트 룸", k: "미술실", pr: ["paint", "draw"] },
  { w: "music room", p: "뮤직 룸", k: "음악실", pr: ["sing", "play"] },
  {
    w: "computer room",
    p: "컴퓨터 룸",
    k: "컴퓨터실",
    pr: ["type", "internet"],
  },
  {
    w: "science lab",
    p: "사이언스 랩",
    k: "과학실",
    pr: ["experiment", "test"],
  },
  { w: "cafeteria", p: "카페테리아", k: "급식실", pr: ["lunch", "eat"] },
  { w: "principal", p: "프린시펄", k: "교장선생님", pr: ["school", "leader"] },
  { w: "bell", p: "벨", k: "종", pr: ["ring", "class"] },
  { w: "report card", p: "리포트 카드", k: "성적표", pr: ["grade", "score"] },
  { w: "field trip", p: "필드 트립", k: "현장학습", pr: ["bus", "visit"] },
  { w: "recess", p: "리세스", k: "쉬는 시간", pr: ["break", "play"] },
];

const G34_SHOPPING: W[] = [
  { w: "store", p: "스토어", k: "가게", pr: ["shop", "buy"] },
  { w: "money", p: "머니", k: "돈", pr: ["coin", "pay"] },
  { w: "price", p: "프라이스", k: "가격", pr: ["cost", "money"] },
  { w: "cheap", p: "칩", k: "싼", pr: ["expensive", "low"] },
  { w: "expensive", p: "익스펜시브", k: "비싼", pr: ["cheap", "costly"] },
  { w: "buy", p: "바이", k: "사다", pr: ["sell", "shop"] },
  { w: "sell", p: "셀", k: "팔다", pr: ["buy", "trade"] },
  { w: "pay", p: "페이", k: "지불하다", pr: ["money", "cash"] },
  { w: "coin", p: "코인", k: "동전", pr: ["money", "change"] },
  { w: "wallet", p: "월릿", k: "지갑", pr: ["money", "pocket"] },
  { w: "receipt", p: "리시트", k: "영수증", pr: ["pay", "paper"] },
  { w: "cart", p: "카트", k: "카트", pr: ["shop", "push"] },
  { w: "basket", p: "바스켓", k: "바구니", pr: ["carry", "shop"] },
  { w: "cashier", p: "캐시어", k: "계산원", pr: ["pay", "counter"] },
  { w: "change", p: "체인지", k: "거스름돈", pr: ["money", "coin"] },
  { w: "gift", p: "기프트", k: "선물", pr: ["present", "wrap"] },
  { w: "toy", p: "토이", k: "장난감", pr: ["play", "fun"] },
  { w: "candy", p: "캔디", k: "사탕", pr: ["sweet", "sugar"] },
  { w: "discount", p: "디스카운트", k: "할인", pr: ["sale", "cheap"] },
  { w: "size", p: "사이즈", k: "크기", pr: ["big", "small"] },
];

const G34_COOKING: W[] = [
  { w: "cook", p: "쿡", k: "요리하다", pr: ["bake", "fry"] },
  { w: "bake", p: "베이크", k: "굽다", pr: ["oven", "bread"] },
  { w: "fry", p: "프라이", k: "튀기다", pr: ["pan", "oil"] },
  { w: "boil", p: "보일", k: "끓이다", pr: ["water", "pot"] },
  { w: "mix", p: "믹스", k: "섞다", pr: ["stir", "blend"] },
  { w: "stir", p: "스터", k: "젓다", pr: ["mix", "spoon"] },
  { w: "chop", p: "촙", k: "자르다", pr: ["cut", "knife"] },
  { w: "peel", p: "필", k: "껍질을 벗기다", pr: ["skin", "fruit"] },
  { w: "recipe", p: "레시피", k: "요리법", pr: ["cook", "food"] },
  { w: "ingredient", p: "인그리디언트", k: "재료", pr: ["food", "recipe"] },
  { w: "pan", p: "팬", k: "프라이팬", pr: ["fry", "cook"] },
  { w: "pot", p: "팟", k: "냄비", pr: ["boil", "soup"] },
  { w: "oven", p: "오븐", k: "오븐", pr: ["bake", "hot"] },
  { w: "bowl", p: "보울", k: "그릇", pr: ["plate", "cup"] },
  { w: "apron", p: "에이프런", k: "앞치마", pr: ["cook", "wear"] },
  { w: "taste", p: "테이스트", k: "맛보다", pr: ["flavor", "try"] },
  { w: "delicious", p: "딜리셔스", k: "맛있는", pr: ["tasty", "yummy"] },
  { w: "sweet", p: "스위트", k: "달콤한", pr: ["sugar", "candy"] },
  { w: "sour", p: "사워", k: "신", pr: ["lemon", "tart"] },
  { w: "salty", p: "솔티", k: "짠", pr: ["salt", "sea"] },
];

const G34_HOLIDAYS: W[] = [
  { w: "holiday", p: "홀리데이", k: "공휴일", pr: ["vacation", "rest"] },
  { w: "vacation", p: "베이케이션", k: "방학", pr: ["summer", "trip"] },
  { w: "Christmas", p: "크리스마스", k: "크리스마스", pr: ["Santa", "gift"] },
  { w: "Halloween", p: "핼러윈", k: "핼러윈", pr: ["costume", "pumpkin"] },
  { w: "birthday", p: "벌스데이", k: "생일", pr: ["cake", "party"] },
  { w: "New Year", p: "뉴 이어", k: "새해", pr: ["January", "firework"] },
  {
    w: "Thanksgiving",
    p: "땡스기빙",
    k: "추수감사절",
    pr: ["turkey", "grateful"],
  },
  { w: "Easter", p: "이스터", k: "부활절", pr: ["egg", "spring"] },
  { w: "Valentine", p: "밸런타인", k: "밸런타인", pr: ["love", "heart"] },
  { w: "party", p: "파티", k: "파티", pr: ["celebrate", "fun"] },
  { w: "decoration", p: "데코레이션", k: "장식", pr: ["ornament", "pretty"] },
  { w: "firework", p: "파이어워크", k: "불꽃놀이", pr: ["sky", "bang"] },
  { w: "costume", p: "코스튬", k: "의상", pr: ["wear", "dress"] },
  { w: "candle", p: "캔들", k: "촛불", pr: ["light", "fire"] },
  { w: "pumpkin", p: "펌킨", k: "호박", pr: ["Halloween", "orange"] },
  { w: "present", p: "프레전트", k: "선물", pr: ["gift", "wrap"] },
  { w: "card", p: "카드", k: "카드", pr: ["letter", "wish"] },
  { w: "balloon", p: "벌룬", k: "풍선", pr: ["party", "pop"] },
  { w: "ribbon", p: "리본", k: "리본", pr: ["bow", "wrap"] },
  { w: "invitation", p: "인비테이션", k: "초대장", pr: ["party", "come"] },
];

// ============================================================
// NEW Grade 5-6 Word Banks (추가 확장)
// ============================================================

const G56_ENVIRONMENT: W[] = [
  { w: "environment", p: "인바이런먼트", k: "환경", pr: ["nature", "earth"] },
  { w: "pollution", p: "펄루션", k: "오염", pr: ["dirty", "air"] },
  { w: "recycle", p: "리사이클", k: "재활용하다", pr: ["reuse", "reduce"] },
  { w: "energy", p: "에너지", k: "에너지", pr: ["power", "fuel"] },
  { w: "solar", p: "솔라", k: "태양의", pr: ["sun", "power"] },
  { w: "climate", p: "클라이밋", k: "기후", pr: ["weather", "change"] },
  {
    w: "global warming",
    p: "글로벌 워밍",
    k: "지구 온난화",
    pr: ["heat", "earth"],
  },
  { w: "trash", p: "트래시", k: "쓰레기", pr: ["garbage", "waste"] },
  { w: "plastic", p: "플라스틱", k: "플라스틱", pr: ["bottle", "bag"] },
  { w: "protect", p: "프로텍트", k: "보호하다", pr: ["save", "guard"] },
  {
    w: "endangered",
    p: "인데인저드",
    k: "멸종 위기의",
    pr: ["animal", "rare"],
  },
  { w: "forest", p: "포레스트", k: "숲", pr: ["tree", "nature"] },
  { w: "ecosystem", p: "이코시스템", k: "생태계", pr: ["nature", "balance"] },
  { w: "conservation", p: "컨서베이션", k: "보전", pr: ["protect", "save"] },
  { w: "renewable", p: "리뉴어블", k: "재생 가능한", pr: ["energy", "solar"] },
  { w: "waste", p: "웨이스트", k: "낭비", pr: ["trash", "reduce"] },
  { w: "oxygen", p: "옥시젠", k: "산소", pr: ["air", "breathe"] },
  { w: "carbon", p: "카본", k: "탄소", pr: ["dioxide", "emission"] },
  { w: "habitat", p: "해비탯", k: "서식지", pr: ["home", "animal"] },
  { w: "planet", p: "플래닛", k: "행성", pr: ["earth", "solar"] },
];

const G56_TRAVEL: W[] = [
  { w: "passport", p: "패스포트", k: "여권", pr: ["travel", "visa"] },
  { w: "suitcase", p: "수트케이스", k: "여행가방", pr: ["pack", "luggage"] },
  { w: "ticket", p: "티켓", k: "표", pr: ["train", "airplane"] },
  { w: "map", p: "맵", k: "지도", pr: ["direction", "navigate"] },
  { w: "tourist", p: "투어리스트", k: "관광객", pr: ["visit", "travel"] },
  { w: "souvenir", p: "수버니어", k: "기념품", pr: ["gift", "memory"] },
  { w: "hotel", p: "호텔", k: "호텔", pr: ["stay", "room"] },
  { w: "reservation", p: "레저베이션", k: "예약", pr: ["book", "plan"] },
  { w: "departure", p: "디파처", k: "출발", pr: ["leave", "start"] },
  { w: "arrival", p: "어라이벌", k: "도착", pr: ["come", "reach"] },
  { w: "luggage", p: "러기지", k: "짐", pr: ["bag", "pack"] },
  { w: "guide", p: "가이드", k: "안내인", pr: ["tour", "help"] },
  { w: "journey", p: "저니", k: "여행", pr: ["trip", "travel"] },
  { w: "adventure", p: "어드벤처", k: "모험", pr: ["explore", "discover"] },
  { w: "explore", p: "익스플로어", k: "탐험하다", pr: ["discover", "find"] },
  { w: "landmark", p: "랜드마크", k: "명소", pr: ["famous", "place"] },
  { w: "flight", p: "플라이트", k: "비행", pr: ["airplane", "sky"] },
  { w: "boarding pass", p: "보딩 패스", k: "탑승권", pr: ["airplane", "gate"] },
  { w: "customs", p: "커스텀즈", k: "세관", pr: ["check", "border"] },
  { w: "exchange", p: "익스체인지", k: "환전", pr: ["money", "change"] },
];

const G56_SCIENCE: W[] = [
  { w: "experiment", p: "익스페리먼트", k: "실험", pr: ["test", "lab"] },
  { w: "gravity", p: "그래비티", k: "중력", pr: ["fall", "earth"] },
  { w: "magnet", p: "매그닛", k: "자석", pr: ["attract", "iron"] },
  { w: "planet", p: "플래닛", k: "행성", pr: ["earth", "solar"] },
  { w: "telescope", p: "텔레스코프", k: "망원경", pr: ["star", "look"] },
  { w: "microscope", p: "마이크로스코프", k: "현미경", pr: ["tiny", "look"] },
  { w: "molecule", p: "몰레큘", k: "분자", pr: ["atom", "small"] },
  { w: "fossil", p: "파슬", k: "화석", pr: ["dinosaur", "old"] },
  { w: "volcano", p: "볼케이노", k: "화산", pr: ["lava", "erupt"] },
  { w: "earthquake", p: "얼쓰퀘이크", k: "지진", pr: ["shake", "ground"] },
  { w: "temperature", p: "템퍼러처", k: "온도", pr: ["hot", "cold"] },
  { w: "electricity", p: "일렉트리서티", k: "전기", pr: ["power", "light"] },
  { w: "circuit", p: "서킷", k: "회로", pr: ["wire", "electricity"] },
  { w: "oxygen", p: "옥시젠", k: "산소", pr: ["air", "breathe"] },
  { w: "cell", p: "셀", k: "세포", pr: ["body", "tiny"] },
  { w: "solar system", p: "솔라 시스템", k: "태양계", pr: ["sun", "planet"] },
  { w: "dinosaur", p: "다이너소어", k: "공룡", pr: ["fossil", "extinct"] },
  { w: "laboratory", p: "래보러토리", k: "실험실", pr: ["science", "test"] },
  { w: "hypothesis", p: "하이파서시스", k: "가설", pr: ["guess", "test"] },
  { w: "data", p: "데이터", k: "자료", pr: ["number", "collect"] },
];

const G56_COMMUNITY: W[] = [
  { w: "community", p: "커뮤니티", k: "공동체", pr: ["town", "people"] },
  { w: "volunteer", p: "볼런티어", k: "자원봉사자", pr: ["help", "free"] },
  { w: "neighbor", p: "네이버", k: "이웃", pr: ["next door", "friend"] },
  { w: "mayor", p: "메이어", k: "시장", pr: ["city", "leader"] },
  { w: "election", p: "일렉션", k: "선거", pr: ["vote", "choose"] },
  { w: "citizen", p: "시티즌", k: "시민", pr: ["city", "people"] },
  { w: "law", p: "로", k: "법", pr: ["rule", "court"] },
  { w: "court", p: "코트", k: "법원", pr: ["judge", "law"] },
  { w: "government", p: "거번먼트", k: "정부", pr: ["country", "leader"] },
  { w: "president", p: "프레지던트", k: "대통령", pr: ["leader", "country"] },
  { w: "flag", p: "플래그", k: "국기", pr: ["country", "symbol"] },
  { w: "culture", p: "컬처", k: "문화", pr: ["tradition", "art"] },
  { w: "tradition", p: "트래디션", k: "전통", pr: ["culture", "custom"] },
  { w: "ceremony", p: "세러모니", k: "의식", pr: ["event", "formal"] },
  { w: "festival", p: "페스티벌", k: "축제", pr: ["party", "celebrate"] },
  { w: "charity", p: "채리티", k: "자선", pr: ["help", "donate"] },
  { w: "donation", p: "도네이션", k: "기부", pr: ["give", "help"] },
  { w: "society", p: "소사이어티", k: "사회", pr: ["community", "people"] },
  { w: "independence", p: "인디펜던스", k: "독립", pr: ["free", "country"] },
  { w: "peace", p: "피스", k: "평화", pr: ["calm", "harmony"] },
];

const G56_MEDIA: W[] = [
  { w: "news", p: "뉴스", k: "뉴스", pr: ["report", "media"] },
  { w: "newspaper", p: "뉴스페이퍼", k: "신문", pr: ["read", "article"] },
  { w: "magazine", p: "매거진", k: "잡지", pr: ["read", "photo"] },
  { w: "article", p: "아티클", k: "기사", pr: ["news", "read"] },
  { w: "blog", p: "블로그", k: "블로그", pr: ["write", "online"] },
  { w: "video", p: "비디오", k: "영상", pr: ["watch", "record"] },
  { w: "channel", p: "채널", k: "채널", pr: ["TV", "watch"] },
  { w: "podcast", p: "팟캐스트", k: "팟캐스트", pr: ["listen", "audio"] },
  { w: "broadcast", p: "브로드캐스트", k: "방송", pr: ["TV", "radio"] },
  {
    w: "advertisement",
    p: "애드버타이즈먼트",
    k: "광고",
    pr: ["TV", "poster"],
  },
  { w: "interview", p: "인터뷰", k: "인터뷰", pr: ["question", "answer"] },
  { w: "reporter", p: "리포터", k: "기자", pr: ["news", "write"] },
  { w: "headline", p: "헤드라인", k: "헤드라인", pr: ["news", "title"] },
  {
    w: "social media",
    p: "소셜 미디어",
    k: "소셜 미디어",
    pr: ["online", "share"],
  },
  { w: "streaming", p: "스트리밍", k: "스트리밍", pr: ["video", "online"] },
  {
    w: "subscribe",
    p: "서브스크라이브",
    k: "구독하다",
    pr: ["follow", "channel"],
  },
  { w: "content", p: "콘텐트", k: "콘텐츠", pr: ["video", "article"] },
  { w: "editor", p: "에디터", k: "편집자", pr: ["write", "change"] },
  { w: "publish", p: "퍼블리시", k: "출판하다", pr: ["book", "print"] },
  {
    w: "communication",
    p: "커뮤니케이션",
    k: "의사소통",
    pr: ["talk", "share"],
  },
];

const G56_SPACE: W[] = [
  { w: "space", p: "스페이스", k: "우주", pr: ["star", "planet"] },
  { w: "astronaut", p: "애스트로넛", k: "우주비행사", pr: ["space", "rocket"] },
  { w: "rocket", p: "로켓", k: "로켓", pr: ["launch", "space"] },
  { w: "satellite", p: "새틀라이트", k: "위성", pr: ["orbit", "space"] },
  { w: "moon", p: "문", k: "달", pr: ["night", "full"] },
  { w: "sun", p: "선", k: "태양", pr: ["star", "hot"] },
  { w: "star", p: "스타", k: "별", pr: ["night", "bright"] },
  { w: "galaxy", p: "갤럭시", k: "은하", pr: ["star", "milky way"] },
  { w: "orbit", p: "오빗", k: "궤도", pr: ["circle", "planet"] },
  { w: "comet", p: "코멧", k: "혜성", pr: ["tail", "ice"] },
  { w: "asteroid", p: "애스터로이드", k: "소행성", pr: ["rock", "space"] },
  {
    w: "constellation",
    p: "컨스텔레이션",
    k: "별자리",
    pr: ["star", "pattern"],
  },
  { w: "telescope", p: "텔레스코프", k: "망원경", pr: ["look", "star"] },
  { w: "Mars", p: "마스", k: "화성", pr: ["red", "planet"] },
  { w: "Jupiter", p: "주피터", k: "목성", pr: ["big", "planet"] },
  { w: "Saturn", p: "새턴", k: "토성", pr: ["ring", "planet"] },
  { w: "Venus", p: "비너스", k: "금성", pr: ["bright", "planet"] },
  { w: "Mercury", p: "머큐리", k: "수성", pr: ["small", "planet"] },
  { w: "Neptune", p: "넵튠", k: "해왕성", pr: ["blue", "planet"] },
  { w: "universe", p: "유니버스", k: "우주", pr: ["space", "infinite"] },
];

const G56_FEELINGS_ADV: W[] = [
  { w: "confident", p: "컨피던트", k: "자신감 있는", pr: ["sure", "bold"] },
  { w: "anxious", p: "앵셔스", k: "불안한", pr: ["worried", "nervous"] },
  { w: "exhausted", p: "이그저스티드", k: "지친", pr: ["tired", "worn out"] },
  {
    w: "inspired",
    p: "인스파이어드",
    k: "영감을 받은",
    pr: ["motivated", "creative"],
  },
  { w: "thrilled", p: "쓰릴드", k: "아주 신나는", pr: ["excited", "happy"] },
  { w: "furious", p: "퓨리어스", k: "몹시 화난", pr: ["angry", "mad"] },
  { w: "guilty", p: "길티", k: "죄책감 드는", pr: ["sorry", "ashamed"] },
  { w: "delighted", p: "딜라이티드", k: "기뻐하는", pr: ["happy", "pleased"] },
  { w: "miserable", p: "미저러블", k: "비참한", pr: ["sad", "unhappy"] },
  {
    w: "grateful",
    p: "그레이트풀",
    k: "감사하는",
    pr: ["thankful", "blessed"],
  },
  { w: "jealous", p: "젤러스", k: "질투하는", pr: ["envious", "green"] },
  { w: "suspicious", p: "서스피셔스", k: "의심하는", pr: ["doubt", "wonder"] },
  { w: "ashamed", p: "어셰임드", k: "부끄러운", pr: ["shy", "embarrassed"] },
  {
    w: "optimistic",
    p: "옵티미스틱",
    k: "낙관적인",
    pr: ["positive", "hopeful"],
  },
  {
    w: "pessimistic",
    p: "페시미스틱",
    k: "비관적인",
    pr: ["negative", "gloomy"],
  },
  { w: "sympathetic", p: "심퍼세틱", k: "동정적인", pr: ["kind", "caring"] },
  {
    w: "enthusiastic",
    p: "인수지애스틱",
    k: "열정적인",
    pr: ["eager", "excited"],
  },
  { w: "content", p: "컨텐트", k: "만족하는", pr: ["satisfied", "happy"] },
  { w: "nostalgic", p: "노스탤직", k: "향수에 젖은", pr: ["memory", "past"] },
  {
    w: "overwhelmed",
    p: "오버웰름드",
    k: "압도된",
    pr: ["stressed", "too much"],
  },
];

const G56_HEALTH: W[] = [
  { w: "healthy", p: "헬시", k: "건강한", pr: ["strong", "fit"] },
  { w: "sick", p: "식", k: "아픈", pr: ["ill", "unwell"] },
  { w: "fever", p: "피버", k: "열", pr: ["cold", "flu"] },
  { w: "cough", p: "코프", k: "기침", pr: ["sneeze", "cold"] },
  { w: "headache", p: "헤데이크", k: "두통", pr: ["pain", "medicine"] },
  { w: "medicine", p: "메디슨", k: "약", pr: ["pill", "doctor"] },
  { w: "exercise", p: "엑서사이즈", k: "운동", pr: ["sport", "fitness"] },
  { w: "vitamin", p: "비타민", k: "비타민", pr: ["health", "fruit"] },
  { w: "toothache", p: "투세이크", k: "치통", pr: ["dentist", "pain"] },
  { w: "stomachache", p: "스터머케이크", k: "복통", pr: ["pain", "sick"] },
  { w: "bandage", p: "밴디지", k: "붕대", pr: ["wound", "wrap"] },
  { w: "allergy", p: "앨러지", k: "알레르기", pr: ["sneeze", "rash"] },
  { w: "injury", p: "인저리", k: "부상", pr: ["hurt", "wound"] },
  { w: "hospital", p: "호스피탈", k: "병원", pr: ["doctor", "nurse"] },
  { w: "rest", p: "레스트", k: "쉬다", pr: ["sleep", "relax"] },
  { w: "sneeze", p: "스니즈", k: "재채기", pr: ["cold", "cough"] },
  { w: "temperature", p: "템퍼러처", k: "체온", pr: ["fever", "check"] },
  { w: "diet", p: "다이어트", k: "식단", pr: ["food", "health"] },
  { w: "stretch", p: "스트레치", k: "스트레칭", pr: ["exercise", "body"] },
  { w: "vaccine", p: "백신", k: "백신", pr: ["shot", "protect"] },
];

// ============================================================
// NEW Grade 5-6 Expansion Word Banks (2차 확장)
// ============================================================

const G56_COOKING_ADV: W[] = [
  { w: "recipe", p: "레시피", k: "요리법", pr: ["cook", "food"] },
  { w: "ingredient", p: "인그리디언트", k: "재료", pr: ["food", "recipe"] },
  { w: "grill", p: "그릴", k: "굽다", pr: ["barbecue", "fire"] },
  { w: "roast", p: "로스트", k: "구워내다", pr: ["oven", "meat"] },
  { w: "steam", p: "스팀", k: "찌다", pr: ["water", "hot"] },
  { w: "slice", p: "슬라이스", k: "썰다", pr: ["cut", "thin"] },
  { w: "melt", p: "멜트", k: "녹이다", pr: ["heat", "butter"] },
  { w: "freeze", p: "프리즈", k: "얼리다", pr: ["cold", "ice"] },
  { w: "season", p: "시즌", k: "양념하다", pr: ["salt", "pepper"] },
  { w: "blend", p: "블렌드", k: "섞다", pr: ["mix", "smooth"] },
  {
    w: "marinate",
    p: "매리네이트",
    k: "양념에 재우다",
    pr: ["sauce", "flavor"],
  },
  { w: "measure", p: "메져", k: "재다", pr: ["cup", "spoon"] },
  { w: "serve", p: "서브", k: "차려내다", pr: ["plate", "food"] },
  { w: "simmer", p: "시머", k: "끓이다", pr: ["low", "heat"] },
  { w: "whisk", p: "위스크", k: "거품기로 젓다", pr: ["egg", "mix"] },
  { w: "sprinkle", p: "스프링클", k: "뿌리다", pr: ["salt", "sugar"] },
  { w: "appetizer", p: "애피타이저", k: "전채", pr: ["first", "meal"] },
  { w: "dessert", p: "디저트", k: "후식", pr: ["sweet", "cake"] },
  { w: "menu", p: "메뉴", k: "메뉴", pr: ["food", "choose"] },
  { w: "cuisine", p: "큐이진", k: "요리", pr: ["food", "style"] },
];

const G56_LITERATURE: W[] = [
  { w: "novel", p: "노블", k: "소설", pr: ["book", "story"] },
  { w: "poem", p: "포엠", k: "시", pr: ["rhyme", "verse"] },
  { w: "fairy tale", p: "페어리 테일", k: "동화", pr: ["princess", "magic"] },
  { w: "character", p: "캐릭터", k: "등장인물", pr: ["hero", "villain"] },
  { w: "author", p: "오써", k: "작가", pr: ["write", "book"] },
  { w: "chapter", p: "챕터", k: "장", pr: ["book", "section"] },
  { w: "plot", p: "플롯", k: "줄거리", pr: ["story", "plan"] },
  { w: "setting", p: "세팅", k: "배경", pr: ["place", "time"] },
  { w: "dialogue", p: "다이얼로그", k: "대화", pr: ["talk", "quote"] },
  { w: "genre", p: "장르", k: "장르", pr: ["type", "style"] },
  { w: "fiction", p: "픽션", k: "허구", pr: ["story", "imagine"] },
  { w: "nonfiction", p: "논픽션", k: "논픽션", pr: ["fact", "real"] },
  { w: "biography", p: "바이오그래피", k: "전기", pr: ["life", "person"] },
  { w: "myth", p: "미쓰", k: "신화", pr: ["legend", "ancient"] },
  { w: "fable", p: "페이블", k: "우화", pr: ["animal", "lesson"] },
  { w: "hero", p: "히어로", k: "영웅", pr: ["brave", "save"] },
  { w: "villain", p: "빌런", k: "악당", pr: ["bad", "enemy"] },
  { w: "moral", p: "모럴", k: "교훈", pr: ["lesson", "right"] },
  {
    w: "illustrator",
    p: "일러스트레이터",
    k: "삽화가",
    pr: ["draw", "picture"],
  },
  { w: "library", p: "라이브러리", k: "도서관", pr: ["book", "read"] },
];

const G56_GEOGRAPHY: W[] = [
  { w: "continent", p: "컨티넌트", k: "대륙", pr: ["Asia", "world"] },
  { w: "country", p: "컨트리", k: "나라", pr: ["nation", "flag"] },
  { w: "capital", p: "캐피탈", k: "수도", pr: ["city", "main"] },
  { w: "population", p: "파퓰레이션", k: "인구", pr: ["people", "number"] },
  { w: "border", p: "보더", k: "국경", pr: ["line", "country"] },
  { w: "ocean", p: "오션", k: "대양", pr: ["Pacific", "Atlantic"] },
  { w: "island", p: "아일랜드", k: "섬", pr: ["water", "beach"] },
  { w: "peninsula", p: "페닌슐라", k: "반도", pr: ["Korea", "land"] },
  { w: "equator", p: "이퀘이터", k: "적도", pr: ["hot", "middle"] },
  { w: "hemisphere", p: "헤미스피어", k: "반구", pr: ["north", "south"] },
  { w: "latitude", p: "래티튜드", k: "위도", pr: ["north", "south"] },
  { w: "longitude", p: "론지튜드", k: "경도", pr: ["east", "west"] },
  { w: "compass", p: "컴퍼스", k: "나침반", pr: ["north", "direction"] },
  { w: "globe", p: "글로브", k: "지구본", pr: ["world", "round"] },
  { w: "valley", p: "밸리", k: "계곡", pr: ["mountain", "river"] },
  { w: "plateau", p: "플레토", k: "고원", pr: ["flat", "high"] },
  { w: "canyon", p: "캐니언", k: "협곡", pr: ["deep", "river"] },
  { w: "glacier", p: "글레이셔", k: "빙하", pr: ["ice", "cold"] },
  { w: "tundra", p: "턴드라", k: "툰드라", pr: ["cold", "flat"] },
  { w: "tropics", p: "트로픽스", k: "열대", pr: ["hot", "jungle"] },
];

const G56_MATH_TERMS: W[] = [
  { w: "addition", p: "어디션", k: "덧셈", pr: ["plus", "sum"] },
  { w: "subtraction", p: "서브트랙션", k: "뺄셈", pr: ["minus", "difference"] },
  {
    w: "multiplication",
    p: "멀티플리케이션",
    k: "곱셈",
    pr: ["times", "product"],
  },
  { w: "division", p: "디비전", k: "나눗셈", pr: ["divide", "quotient"] },
  { w: "fraction", p: "프랙션", k: "분수", pr: ["half", "part"] },
  { w: "decimal", p: "데시멀", k: "소수", pr: ["point", "number"] },
  { w: "percent", p: "퍼센트", k: "퍼센트", pr: ["hundred", "ratio"] },
  { w: "equation", p: "이퀘이션", k: "등식", pr: ["equal", "solve"] },
  { w: "angle", p: "앵글", k: "각도", pr: ["degree", "corner"] },
  { w: "area", p: "에어리어", k: "넓이", pr: ["square", "space"] },
  { w: "perimeter", p: "퍼리미터", k: "둘레", pr: ["around", "length"] },
  { w: "volume", p: "볼륨", k: "부피", pr: ["cube", "space"] },
  { w: "graph", p: "그래프", k: "그래프", pr: ["chart", "data"] },
  { w: "average", p: "애버리지", k: "평균", pr: ["mean", "middle"] },
  { w: "estimate", p: "에스티메이트", k: "어림하다", pr: ["guess", "close"] },
  { w: "measure", p: "메져", k: "측정하다", pr: ["ruler", "scale"] },
  { w: "pattern", p: "패턴", k: "패턴", pr: ["repeat", "design"] },
  { w: "symmetry", p: "시메트리", k: "대칭", pr: ["mirror", "equal"] },
  { w: "parallel", p: "패럴렐", k: "평행", pr: ["line", "never meet"] },
  { w: "diameter", p: "다이애미터", k: "지름", pr: ["circle", "across"] },
];

const G56_PERSONALITY: W[] = [
  { w: "honest", p: "아너스트", k: "정직한", pr: ["truthful", "sincere"] },
  { w: "generous", p: "제너러스", k: "너그러운", pr: ["giving", "kind"] },
  { w: "stubborn", p: "스터번", k: "고집 센", pr: ["firm", "refuse"] },
  {
    w: "creative",
    p: "크리에이티브",
    k: "창의적인",
    pr: ["imagine", "invent"],
  },
  {
    w: "responsible",
    p: "리스판서블",
    k: "책임감 있는",
    pr: ["duty", "trust"],
  },
  { w: "polite", p: "폴라이트", k: "예의 바른", pr: ["manner", "respect"] },
  { w: "curious", p: "큐리어스", k: "호기심 많은", pr: ["wonder", "ask"] },
  { w: "patient", p: "페이션트", k: "참을성 있는", pr: ["wait", "calm"] },
  { w: "ambitious", p: "앰비셔스", k: "야망 있는", pr: ["goal", "dream"] },
  { w: "humble", p: "험블", k: "겸손한", pr: ["modest", "simple"] },
  { w: "loyal", p: "로열", k: "충성스러운", pr: ["faithful", "true"] },
  { w: "independent", p: "인디펜던트", k: "독립적인", pr: ["alone", "self"] },
  {
    w: "diligent",
    p: "딜리전트",
    k: "부지런한",
    pr: ["hardworking", "effort"],
  },
  {
    w: "cooperative",
    p: "코오퍼레이티브",
    k: "협력적인",
    pr: ["team", "together"],
  },
  { w: "respectful", p: "리스펙트풀", k: "공손한", pr: ["polite", "manner"] },
  { w: "thoughtful", p: "쏘트풀", k: "사려깊은", pr: ["caring", "kind"] },
  {
    w: "adventurous",
    p: "어드벤처러스",
    k: "모험적인",
    pr: ["brave", "explore"],
  },
  { w: "cheerful", p: "치어풀", k: "활발한", pr: ["happy", "bright"] },
  {
    w: "reliable",
    p: "릴라이어블",
    k: "믿을 수 있는",
    pr: ["trust", "depend"],
  },
  { w: "flexible", p: "플렉서블", k: "유연한", pr: ["adapt", "change"] },
];

const G56_DAILY_CONVERSATION: W[] = [
  {
    w: "excuse me",
    p: "익스큐즈 미",
    k: "실례합니다",
    pr: ["pardon", "sorry"],
  },
  {
    w: "may I help you",
    p: "메이 아이 헬프 유",
    k: "도와드릴까요",
    pr: ["help", "please"],
  },
  {
    w: "never mind",
    p: "네버 마인드",
    k: "신경 쓰지 마세요",
    pr: ["okay", "fine"],
  },
  {
    w: "what happened",
    p: "왓 해픈드",
    k: "무슨 일이에요",
    pr: ["tell", "problem"],
  },
  { w: "I agree", p: "아이 어그리", k: "동의해요", pr: ["yes", "same"] },
  {
    w: "I disagree",
    p: "아이 디스어그리",
    k: "동의하지 않아요",
    pr: ["no", "different"],
  },
  {
    w: "that is right",
    p: "댓 이즈 라이트",
    k: "맞아요",
    pr: ["correct", "yes"],
  },
  {
    w: "I am not sure",
    p: "아이 엠 낫 슈어",
    k: "잘 모르겠어요",
    pr: ["maybe", "think"],
  },
  {
    w: "it depends",
    p: "잇 디펜즈",
    k: "상황에 따라 달라요",
    pr: ["maybe", "situation"],
  },
  {
    w: "let me think",
    p: "렛 미 싱크",
    k: "생각해 볼게요",
    pr: ["wait", "moment"],
  },
  { w: "sounds good", p: "사운즈 굿", k: "좋아요", pr: ["great", "okay"] },
  {
    w: "good idea",
    p: "굿 아이디어",
    k: "좋은 생각이에요",
    pr: ["great", "plan"],
  },
  { w: "no problem", p: "노 프라블럼", k: "괜찮아요", pr: ["okay", "fine"] },
  {
    w: "take your time",
    p: "테이크 유어 타임",
    k: "천천히 해요",
    pr: ["slow", "relax"],
  },
  { w: "go ahead", p: "고 어헤드", k: "먼저 하세요", pr: ["first", "okay"] },
  { w: "be careful", p: "비 케어풀", k: "조심하세요", pr: ["watch", "safe"] },
  {
    w: "I got it",
    p: "아이 갓 잇",
    k: "이해했어요",
    pr: ["understand", "know"],
  },
  {
    w: "what do you mean",
    p: "왓 두 유 민",
    k: "무슨 뜻이에요",
    pr: ["explain", "how"],
  },
  { w: "by the way", p: "바이 더 웨이", k: "그런데", pr: ["also", "another"] },
  {
    w: "in my opinion",
    p: "인 마이 오피니언",
    k: "내 생각에는",
    pr: ["think", "believe"],
  },
];

const G56_CONNECTORS: W[] = [
  { w: "because", p: "비코즈", k: "왜냐하면", pr: ["reason", "so"] },
  { w: "however", p: "하우에버", k: "그러나", pr: ["but", "yet"] },
  { w: "therefore", p: "데어포", k: "그러므로", pr: ["so", "thus"] },
  { w: "although", p: "올도", k: "비록 ~이지만", pr: ["but", "even"] },
  { w: "meanwhile", p: "민와일", k: "그동안", pr: ["during", "while"] },
  { w: "furthermore", p: "퍼더모어", k: "게다가", pr: ["also", "moreover"] },
  { w: "instead", p: "인스테드", k: "대신에", pr: ["rather", "replace"] },
  { w: "finally", p: "파이널리", k: "마침내", pr: ["at last", "end"] },
  { w: "suddenly", p: "서든리", k: "갑자기", pr: ["quick", "surprise"] },
  {
    w: "unfortunately",
    p: "언포튜너틀리",
    k: "불행히도",
    pr: ["sadly", "bad"],
  },
  { w: "especially", p: "이스페셜리", k: "특히", pr: ["mainly", "most"] },
  { w: "actually", p: "액추얼리", k: "사실은", pr: ["really", "truth"] },
  { w: "probably", p: "프라버블리", k: "아마도", pr: ["maybe", "likely"] },
  { w: "definitely", p: "데피닛리", k: "확실히", pr: ["sure", "certainly"] },
  { w: "obviously", p: "오비어슬리", k: "분명히", pr: ["clearly", "plain"] },
  { w: "recently", p: "리센틀리", k: "최근에", pr: ["lately", "new"] },
  { w: "immediately", p: "이미디어틀리", k: "즉시", pr: ["now", "right away"] },
  { w: "gradually", p: "그래주얼리", k: "점차", pr: ["slowly", "step"] },
  { w: "exactly", p: "이그잭틀리", k: "정확히", pr: ["precisely", "right"] },
  { w: "apparently", p: "어패런틀리", k: "보기에는", pr: ["seems", "looks"] },
];

const G56_BODY_SYSTEMS: W[] = [
  { w: "brain", p: "브레인", k: "뇌", pr: ["think", "head"] },
  { w: "heart", p: "하트", k: "심장", pr: ["beat", "blood"] },
  { w: "lung", p: "렁", k: "폐", pr: ["breathe", "air"] },
  { w: "bone", p: "본", k: "뼈", pr: ["skeleton", "hard"] },
  { w: "muscle", p: "머슬", k: "근육", pr: ["strong", "body"] },
  { w: "blood", p: "블러드", k: "혈액", pr: ["red", "vein"] },
  { w: "nerve", p: "너브", k: "신경", pr: ["sense", "feel"] },
  { w: "spine", p: "스파인", k: "척추", pr: ["back", "bone"] },
  { w: "rib", p: "립", k: "갈비뼈", pr: ["chest", "bone"] },
  { w: "joint", p: "조인트", k: "관절", pr: ["bend", "move"] },
  { w: "liver", p: "리버", k: "간", pr: ["organ", "body"] },
  { w: "kidney", p: "키드니", k: "콩팥", pr: ["organ", "filter"] },
  { w: "stomach", p: "스터먹", k: "위", pr: ["digest", "food"] },
  { w: "intestine", p: "인테스틴", k: "장", pr: ["digest", "long"] },
  { w: "skin", p: "스킨", k: "피부", pr: ["touch", "cover"] },
  { w: "vein", p: "베인", k: "혈관", pr: ["blood", "flow"] },
  { w: "organ", p: "오건", k: "장기", pr: ["body", "inside"] },
  { w: "tissue", p: "티슈", k: "조직", pr: ["cell", "body"] },
  { w: "skeleton", p: "스켈레톤", k: "골격", pr: ["bone", "frame"] },
  { w: "pulse", p: "펄스", k: "맥박", pr: ["heart", "beat"] },
];

// ============================================================
// Dialogue Data for 대화완성 question type
// ============================================================

interface Dialogue {
  speaker1: string;
  speaker2: string;
  missingPart: string;
  translation1: string;
  translation2: string;
  grade: "3-4" | "5-6";
  unit?: string;
}

const DIALOGUES: Dialogue[] = [
  // Grade 3-4 Dialogues
  {
    speaker1: "Hi! How are you?",
    speaker2: "I am fine, thank you.",
    missingPart: "fine",
    translation1: "안녕! 어떻게 지내?",
    translation2: "잘 지내, 고마워.",
    grade: "3-4",
    unit: "인사와 소개",
  },
  {
    speaker1: "What is your name?",
    speaker2: "My name is Tom.",
    missingPart: "name",
    translation1: "이름이 뭐예요?",
    translation2: "내 이름은 톰이에요.",
    grade: "3-4",
    unit: "인사와 소개",
  },
  {
    speaker1: "Do you like apples?",
    speaker2: "Yes, I do.",
    missingPart: "apples",
    translation1: "사과 좋아해?",
    translation2: "응, 좋아해.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    speaker1: "What color is it?",
    speaker2: "It is red.",
    missingPart: "red",
    translation1: "무슨 색이에요?",
    translation2: "빨간색이에요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    speaker1: "Where is the book?",
    speaker2: "It is on the desk.",
    missingPart: "desk",
    translation1: "책이 어디에 있어?",
    translation2: "책상 위에 있어.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    speaker1: "How old are you?",
    speaker2: "I am ten years old.",
    missingPart: "ten",
    translation1: "몇 살이에요?",
    translation2: "열 살이에요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    speaker1: "Can you swim?",
    speaker2: "Yes, I can.",
    missingPart: "swim",
    translation1: "수영할 수 있어?",
    translation2: "응, 할 수 있어.",
    grade: "3-4",
    unit: "일상표현",
  },
  {
    speaker1: "What day is it today?",
    speaker2: "It is Monday.",
    missingPart: "Monday",
    translation1: "오늘 무슨 요일이에요?",
    translation2: "월요일이에요.",
    grade: "3-4",
  },
  {
    speaker1: "Do you have a pet?",
    speaker2: "Yes, I have a dog.",
    missingPart: "dog",
    translation1: "반려동물 있어?",
    translation2: "응, 개가 있어.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    speaker1: "What is this?",
    speaker2: "This is a pencil.",
    missingPart: "pencil",
    translation1: "이게 뭐예요?",
    translation2: "연필이에요.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    speaker1: "How is the weather?",
    speaker2: "It is sunny.",
    missingPart: "sunny",
    translation1: "날씨가 어때?",
    translation2: "화창해.",
    grade: "3-4",
    unit: "날씨",
  },
  {
    speaker1: "What do you want?",
    speaker2: "I want some water.",
    missingPart: "water",
    translation1: "뭘 원해?",
    translation2: "물을 좀 마시고 싶어.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    speaker1: "Who is she?",
    speaker2: "She is my sister.",
    missingPart: "sister",
    translation1: "그녀는 누구예요?",
    translation2: "내 여동생이에요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    speaker1: "Let's play together!",
    speaker2: "Sure! That sounds fun.",
    missingPart: "fun",
    translation1: "같이 놀자!",
    translation2: "좋아! 재미있겠다.",
    grade: "3-4",
    unit: "놀이와 장난감",
  },
  {
    speaker1: "Are you hungry?",
    speaker2: "Yes, I want some rice.",
    missingPart: "hungry",
    translation1: "배고파?",
    translation2: "응, 밥 먹고 싶어.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  // Grade 5-6 Dialogues
  {
    speaker1: "What is your favorite subject?",
    speaker2: "I like science the most.",
    missingPart: "science",
    translation1: "가장 좋아하는 과목이 뭐야?",
    translation2: "과학을 가장 좋아해.",
    grade: "5-6",
    unit: "학교와 직업",
  },
  {
    speaker1: "Where did you go yesterday?",
    speaker2: "I went to the museum.",
    missingPart: "museum",
    translation1: "어제 어디 갔어?",
    translation2: "박물관에 갔어.",
    grade: "5-6",
    unit: "위치와 장소",
  },
  {
    speaker1: "What do you want to be?",
    speaker2: "I want to be a doctor.",
    missingPart: "doctor",
    translation1: "뭐가 되고 싶어?",
    translation2: "의사가 되고 싶어.",
    grade: "5-6",
    unit: "진로와 직업",
  },
  {
    speaker1: "How was your vacation?",
    speaker2: "It was wonderful.",
    missingPart: "wonderful",
    translation1: "방학은 어땠어?",
    translation2: "아주 좋았어.",
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    speaker1: "Can you help me?",
    speaker2: "Of course! What do you need?",
    missingPart: "help",
    translation1: "도와줄 수 있어?",
    translation2: "물론! 뭐가 필요해?",
    grade: "5-6",
  },
  {
    speaker1: "Why are you sad?",
    speaker2: "Because I lost my wallet.",
    missingPart: "lost",
    translation1: "왜 슬퍼?",
    translation2: "지갑을 잃어버렸거든.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    speaker1: "What time does the movie start?",
    speaker2: "It starts at three.",
    missingPart: "three",
    translation1: "영화 몇 시에 시작해?",
    translation2: "세 시에 시작해.",
    grade: "5-6",
    unit: "시간과 날짜",
  },
  {
    speaker1: "Have you ever been to Japan?",
    speaker2: "No, but I want to go.",
    missingPart: "Japan",
    translation1: "일본에 가 본 적 있어?",
    translation2: "아니, 하지만 가고 싶어.",
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    speaker1: "What should we do?",
    speaker2: "We should recycle more.",
    missingPart: "recycle",
    translation1: "우리 뭘 해야 할까?",
    translation2: "재활용을 더 해야 해.",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    speaker1: "How do you feel today?",
    speaker2: "I feel nervous about the test.",
    missingPart: "nervous",
    translation1: "오늘 기분이 어때?",
    translation2: "시험 때문에 긴장돼.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    speaker1: "What is your hobby?",
    speaker2: "I enjoy reading books.",
    missingPart: "reading",
    translation1: "취미가 뭐야?",
    translation2: "책 읽는 걸 좋아해.",
    grade: "5-6",
    unit: "일상과 취미",
  },
  {
    speaker1: "Did you finish your homework?",
    speaker2: "Not yet. I will do it tonight.",
    missingPart: "tonight",
    translation1: "숙제 끝냈어?",
    translation2: "아직. 오늘 밤에 할 거야.",
    grade: "5-6",
  },
  {
    speaker1: "Which season do you like?",
    speaker2: "I like spring because of the flowers.",
    missingPart: "spring",
    translation1: "어떤 계절을 좋아해?",
    translation2: "꽃 때문에 봄을 좋아해.",
    grade: "5-6",
    unit: "날씨와 계절",
  },
  {
    speaker1: "What did you learn in class?",
    speaker2: "We learned about the solar system.",
    missingPart: "solar system",
    translation1: "수업에서 뭘 배웠어?",
    translation2: "태양계에 대해 배웠어.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    speaker1: "How often do you exercise?",
    speaker2: "I exercise three times a week.",
    missingPart: "exercise",
    translation1: "얼마나 자주 운동해?",
    translation2: "일주일에 세 번 운동해.",
    grade: "5-6",
    unit: "건강과 운동",
  },
];

// ============================================================
// Word Ordering Data for 순서배열 question type
// ============================================================

interface WordOrder {
  words: string[];
  correct: string;
  translation: string;
  grade: "3-4" | "5-6";
  unit?: string;
}

const WORD_ORDERS: WordOrder[] = [
  // Grade 3-4
  {
    words: ["I", "like", "apples"],
    correct: "I like apples.",
    translation: "나는 사과를 좋아해요.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    words: ["This", "is", "a", "cat"],
    correct: "This is a cat.",
    translation: "이것은 고양이예요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    words: ["She", "is", "my", "sister"],
    correct: "She is my sister.",
    translation: "그녀는 내 여동생이에요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    words: ["I", "can", "swim"],
    correct: "I can swim.",
    translation: "나는 수영할 수 있어요.",
    grade: "3-4",
    unit: "일상표현",
  },
  {
    words: ["The", "dog", "is", "big"],
    correct: "The dog is big.",
    translation: "그 개는 커요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    words: ["I", "have", "two", "books"],
    correct: "I have two books.",
    translation: "나는 책이 두 권 있어요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    words: ["Open", "the", "door", "please"],
    correct: "Open the door, please.",
    translation: "문을 열어 주세요.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    words: ["Do", "you", "like", "music"],
    correct: "Do you like music?",
    translation: "음악 좋아해요?",
    grade: "3-4",
    unit: "음악과 악기",
  },
  {
    words: ["My", "father", "is", "tall"],
    correct: "My father is tall.",
    translation: "우리 아빠는 키가 커요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    words: ["Let's", "play", "soccer"],
    correct: "Let's play soccer.",
    translation: "축구하자.",
    grade: "3-4",
    unit: "운동과 스포츠",
  },
  {
    words: ["I", "go", "to", "school"],
    correct: "I go to school.",
    translation: "나는 학교에 가요.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    words: ["It", "is", "rainy", "today"],
    correct: "It is rainy today.",
    translation: "오늘은 비가 와요.",
    grade: "3-4",
    unit: "날씨",
  },
  {
    words: ["She", "likes", "ice", "cream"],
    correct: "She likes ice cream.",
    translation: "그녀는 아이스크림을 좋아해요.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    words: ["Where", "is", "my", "bag"],
    correct: "Where is my bag?",
    translation: "내 가방이 어디에 있어요?",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    words: ["I", "want", "a", "cookie"],
    correct: "I want a cookie.",
    translation: "쿠키를 먹고 싶어요.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    words: ["He", "is", "my", "friend"],
    correct: "He is my friend.",
    translation: "그는 내 친구예요.",
    grade: "3-4",
    unit: "인사와 소개",
  },
  {
    words: ["I", "see", "a", "bird"],
    correct: "I see a bird.",
    translation: "새가 보여요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    words: ["We", "eat", "lunch", "together"],
    correct: "We eat lunch together.",
    translation: "우리는 함께 점심을 먹어요.",
    grade: "3-4",
    unit: "일과표현",
  },
  {
    words: ["The", "sky", "is", "blue"],
    correct: "The sky is blue.",
    translation: "하늘이 파래요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    words: ["I", "read", "a", "book"],
    correct: "I read a book.",
    translation: "나는 책을 읽어요.",
    grade: "3-4",
    unit: "학교생활",
  },
  // Grade 5-6
  {
    words: ["I", "went", "to", "the", "library"],
    correct: "I went to the library.",
    translation: "나는 도서관에 갔어요.",
    grade: "5-6",
    unit: "위치와 장소",
  },
  {
    words: ["She", "is", "taller", "than", "me"],
    correct: "She is taller than me.",
    translation: "그녀는 나보다 키가 커요.",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    words: ["We", "should", "protect", "the", "environment"],
    correct: "We should protect the environment.",
    translation: "우리는 환경을 보호해야 해요.",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    words: ["I", "want", "to", "be", "a", "doctor"],
    correct: "I want to be a doctor.",
    translation: "나는 의사가 되고 싶어요.",
    grade: "5-6",
    unit: "진로와 직업",
  },
  {
    words: ["If", "it", "rains", "I", "will", "stay"],
    correct: "If it rains, I will stay.",
    translation: "비가 오면 나는 있을 거예요.",
    grade: "5-6",
  },
  {
    words: ["The", "movie", "was", "very", "interesting"],
    correct: "The movie was very interesting.",
    translation: "그 영화는 매우 재미있었어요.",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    words: ["I", "have", "been", "to", "Japan"],
    correct: "I have been to Japan.",
    translation: "나는 일본에 가 본 적 있어요.",
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    words: ["He", "studied", "hard", "for", "the", "test"],
    correct: "He studied hard for the test.",
    translation: "그는 시험을 위해 열심히 공부했어요.",
    grade: "5-6",
    unit: "학교와 직업",
  },
  {
    words: ["My", "hobby", "is", "playing", "basketball"],
    correct: "My hobby is playing basketball.",
    translation: "내 취미는 농구예요.",
    grade: "5-6",
    unit: "일상과 취미",
  },
  {
    words: ["We", "learned", "about", "the", "solar", "system"],
    correct: "We learned about the solar system.",
    translation: "우리는 태양계에 대해 배웠어요.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    words: ["She", "always", "helps", "her", "friends"],
    correct: "She always helps her friends.",
    translation: "그녀는 항상 친구들을 도와요.",
    grade: "5-6",
  },
  {
    words: ["I", "think", "reading", "is", "important"],
    correct: "I think reading is important.",
    translation: "나는 독서가 중요하다고 생각해요.",
    grade: "5-6",
  },
  {
    words: ["The", "weather", "will", "be", "sunny", "tomorrow"],
    correct: "The weather will be sunny tomorrow.",
    translation: "내일 날씨가 화창할 거예요.",
    grade: "5-6",
    unit: "날씨와 자연",
  },
  {
    words: ["Can", "you", "speak", "English", "well"],
    correct: "Can you speak English well?",
    translation: "영어를 잘 할 수 있어요?",
    grade: "5-6",
  },
  {
    words: ["I", "feel", "happy", "when", "I", "sing"],
    correct: "I feel happy when I sing.",
    translation: "노래할 때 행복해요.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    words: ["They", "visited", "the", "museum", "yesterday"],
    correct: "They visited the museum yesterday.",
    translation: "그들은 어제 박물관을 방문했어요.",
    grade: "5-6",
    unit: "위치와 장소",
  },
  {
    words: ["You", "should", "eat", "more", "vegetables"],
    correct: "You should eat more vegetables.",
    translation: "채소를 더 먹어야 해요.",
    grade: "5-6",
    unit: "건강과 운동",
  },
  {
    words: ["The", "earth", "goes", "around", "the", "sun"],
    correct: "The earth goes around the sun.",
    translation: "지구는 태양 주위를 돌아요.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    words: ["I", "was", "surprised", "by", "the", "news"],
    correct: "I was surprised by the news.",
    translation: "그 소식에 놀랐어요.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    words: ["We", "need", "to", "save", "water"],
    correct: "We need to save water.",
    translation: "우리는 물을 절약해야 해요.",
    grade: "5-6",
    unit: "환경과 지구",
  },
];

// ============================================================
// Sentence Completion Data for 문장완성 question type
// ============================================================

interface SentenceCompletion {
  sentence: string;
  blank: string;
  choices: string[];
  translation: string;
  grade: "3-4" | "5-6";
  unit?: string;
}

const SENTENCE_COMPLETIONS: SentenceCompletion[] = [
  // Grade 3-4
  {
    sentence: "I ___ to school every day.",
    blank: "go",
    choices: ["go", "eat", "sleep", "fly"],
    translation: "나는 매일 학교에 가요.",
    grade: "3-4",
    unit: "일과표현",
  },
  {
    sentence: "My mother is very ___.",
    blank: "kind",
    choices: ["kind", "cloud", "pencil", "apple"],
    translation: "우리 엄마는 매우 친절해요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    sentence: "The sun is ___ and bright.",
    blank: "yellow",
    choices: ["yellow", "blue", "cold", "slow"],
    translation: "태양은 노랗고 밝아요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    sentence: "I ___ my teeth every morning.",
    blank: "brush",
    choices: ["brush", "draw", "cook", "throw"],
    translation: "나는 매일 아침 양치해요.",
    grade: "3-4",
    unit: "일과표현",
  },
  {
    sentence: "The cat is ___ the table.",
    blank: "under",
    choices: ["under", "swim", "happy", "three"],
    translation: "고양이가 탁자 아래에 있어요.",
    grade: "3-4",
    unit: "위치와 장소",
  },
  {
    sentence: "I like to ___ pictures.",
    blank: "draw",
    choices: ["draw", "eat", "run", "sleep"],
    translation: "나는 그림 그리기를 좋아해요.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    sentence: "She is wearing a red ___.",
    blank: "dress",
    choices: ["dress", "cloud", "tree", "fish"],
    translation: "그녀는 빨간 드레스를 입고 있어요.",
    grade: "3-4",
  },
  {
    sentence: "We play ___ after school.",
    blank: "soccer",
    choices: ["soccer", "pencil", "milk", "door"],
    translation: "우리는 방과 후에 축구를 해요.",
    grade: "3-4",
    unit: "운동과 스포츠",
  },
  {
    sentence: "There are many ___ in the sky.",
    blank: "stars",
    choices: ["stars", "fish", "desks", "shoes"],
    translation: "하늘에 별이 많아요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    sentence: "Please ___ the window.",
    blank: "open",
    choices: ["open", "eat", "sing", "fly"],
    translation: "창문을 열어 주세요.",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    sentence: "I eat ___ for breakfast.",
    blank: "bread",
    choices: ["bread", "desk", "star", "road"],
    translation: "나는 아침에 빵을 먹어요.",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    sentence: "The flower is very ___.",
    blank: "pretty",
    choices: ["pretty", "angry", "heavy", "fast"],
    translation: "그 꽃은 매우 예뻐요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    sentence: "He can ___ very fast.",
    blank: "run",
    choices: ["run", "read", "sleep", "cook"],
    translation: "그는 매우 빨리 달릴 수 있어요.",
    grade: "3-4",
    unit: "일상표현",
  },
  {
    sentence: "I need an ___ for the rain.",
    blank: "umbrella",
    choices: ["umbrella", "apple", "eraser", "ant"],
    translation: "비에 우산이 필요해요.",
    grade: "3-4",
    unit: "날씨",
  },
  {
    sentence: "The baby is ___.",
    blank: "sleeping",
    choices: ["sleeping", "swimming", "cooking", "flying"],
    translation: "아기가 자고 있어요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  // Grade 5-6
  {
    sentence: "I ___ to the library yesterday.",
    blank: "went",
    choices: ["went", "go", "eat", "fly"],
    translation: "나는 어제 도서관에 갔어요.",
    grade: "5-6",
    unit: "과거경험",
  },
  {
    sentence: "She is ___ than her brother.",
    blank: "taller",
    choices: ["taller", "tallest", "tall", "short"],
    translation: "그녀는 오빠보다 키가 커요.",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    sentence: "We should ___ the environment.",
    blank: "protect",
    choices: ["protect", "destroy", "forget", "ignore"],
    translation: "우리는 환경을 보호해야 해요.",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    sentence: "The ___ rises in the east.",
    blank: "sun",
    choices: ["sun", "moon", "rain", "wind"],
    translation: "태양은 동쪽에서 떠요.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    sentence: "If you study hard, you will ___.",
    blank: "succeed",
    choices: ["succeed", "fail", "sleep", "cry"],
    translation: "열심히 공부하면 성공할 거예요.",
    grade: "5-6",
  },
  {
    sentence: "He was very ___ about the result.",
    blank: "disappointed",
    choices: ["disappointed", "happy", "hungry", "tall"],
    translation: "그는 결과에 매우 실망했어요.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    sentence: "The ___ orbits the Earth.",
    blank: "moon",
    choices: ["moon", "fish", "book", "chair"],
    translation: "달은 지구를 돌아요.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    sentence: "I ___ a letter to my pen pal.",
    blank: "wrote",
    choices: ["wrote", "write", "eaten", "swim"],
    translation: "나는 펜팔에게 편지를 썼어요.",
    grade: "5-6",
    unit: "과거경험",
  },
  {
    sentence: "The movie was ___ than I expected.",
    blank: "better",
    choices: ["better", "good", "best", "worse"],
    translation: "영화가 기대보다 더 좋았어요.",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    sentence: "We ___ recycle plastic bottles.",
    blank: "should",
    choices: ["should", "will", "can", "may"],
    translation: "우리는 플라스틱 병을 재활용해야 해요.",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    sentence: "The ___ was very exciting.",
    blank: "adventure",
    choices: ["adventure", "homework", "pillow", "pencil"],
    translation: "그 모험은 매우 신났어요.",
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    sentence: "She ___ English and Korean.",
    blank: "speaks",
    choices: ["speaks", "eats", "draws", "throws"],
    translation: "그녀는 영어와 한국어를 해요.",
    grade: "5-6",
  },
  {
    sentence: "I am ___ in science.",
    blank: "interested",
    choices: ["interested", "tired", "angry", "hungry"],
    translation: "나는 과학에 관심이 있어요.",
    grade: "5-6",
    unit: "과학 탐구",
  },
  {
    sentence: "The ___ change every season.",
    blank: "leaves",
    choices: ["leaves", "books", "chairs", "phones"],
    translation: "나뭇잎은 계절마다 바뀌어요.",
    grade: "5-6",
    unit: "날씨와 계절",
  },
  {
    sentence: "He ___ his best friend at the park.",
    blank: "met",
    choices: ["met", "meet", "ate", "slept"],
    translation: "그는 공원에서 절친을 만났어요.",
    grade: "5-6",
    unit: "과거경험",
  },
];

// ============================================================
// Translation/Writing Data for 영작문 question type
// ============================================================

interface TranslationEntry {
  korean: string;
  english: string;
  keyWord: string;
  grade: "3-4" | "5-6";
  unit?: string;
}

const TRANSLATIONS: TranslationEntry[] = [
  // Grade 3-4
  {
    korean: "나는 사과를 좋아해요.",
    english: "I like apples.",
    keyWord: "like",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    korean: "이것은 내 가방이에요.",
    english: "This is my bag.",
    keyWord: "bag",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    korean: "고양이가 귀여워요.",
    english: "The cat is cute.",
    keyWord: "cute",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    korean: "오늘 날씨가 좋아요.",
    english: "The weather is nice today.",
    keyWord: "weather",
    grade: "3-4",
    unit: "날씨",
  },
  {
    korean: "나는 매일 학교에 가요.",
    english: "I go to school every day.",
    keyWord: "school",
    grade: "3-4",
    unit: "일과표현",
  },
  {
    korean: "우리 엄마는 요리를 잘해요.",
    english: "My mother cooks well.",
    keyWord: "mother",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    korean: "그 꽃은 빨간색이에요.",
    english: "The flower is red.",
    keyWord: "red",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    korean: "나는 축구를 좋아해요.",
    english: "I like soccer.",
    keyWord: "soccer",
    grade: "3-4",
    unit: "운동과 스포츠",
  },
  {
    korean: "책상 위에 연필이 있어요.",
    english: "There is a pencil on the desk.",
    keyWord: "pencil",
    grade: "3-4",
    unit: "학교생활",
  },
  {
    korean: "나는 피아노를 연주해요.",
    english: "I play the piano.",
    keyWord: "piano",
    grade: "3-4",
    unit: "음악과 악기",
  },
  {
    korean: "물을 마시고 싶어요.",
    english: "I want to drink water.",
    keyWord: "water",
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    korean: "그는 키가 커요.",
    english: "He is tall.",
    keyWord: "tall",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    korean: "비가 오고 있어요.",
    english: "It is raining.",
    keyWord: "raining",
    grade: "3-4",
    unit: "날씨",
  },
  {
    korean: "나는 개가 있어요.",
    english: "I have a dog.",
    keyWord: "dog",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    korean: "같이 놀자!",
    english: "Let's play together!",
    keyWord: "play",
    grade: "3-4",
    unit: "놀이와 장난감",
  },
  // Grade 5-6
  {
    korean: "나는 어제 도서관에 갔어요.",
    english: "I went to the library yesterday.",
    keyWord: "went",
    grade: "5-6",
    unit: "과거경험",
  },
  {
    korean: "그녀는 나보다 빨라요.",
    english: "She is faster than me.",
    keyWord: "faster",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    korean: "환경을 보호해야 해요.",
    english: "We should protect the environment.",
    keyWord: "protect",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    korean: "나는 의사가 되고 싶어요.",
    english: "I want to be a doctor.",
    keyWord: "doctor",
    grade: "5-6",
    unit: "진로와 직업",
  },
  {
    korean: "비가 오면 집에 있을 거예요.",
    english: "If it rains, I will stay home.",
    keyWord: "rains",
    grade: "5-6",
  },
  {
    korean: "내 취미는 독서예요.",
    english: "My hobby is reading.",
    keyWord: "reading",
    grade: "5-6",
    unit: "일상과 취미",
  },
  {
    korean: "그 영화는 재미있었어요.",
    english: "The movie was interesting.",
    keyWord: "interesting",
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    korean: "우리는 물을 절약해야 해요.",
    english: "We should save water.",
    keyWord: "save",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    korean: "지구는 태양 주위를 돌아요.",
    english: "The earth goes around the sun.",
    keyWord: "earth",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    korean: "나는 매일 운동해요.",
    english: "I exercise every day.",
    keyWord: "exercise",
    grade: "5-6",
    unit: "건강과 운동",
  },
  {
    korean: "그는 열심히 공부했어요.",
    english: "He studied hard.",
    keyWord: "studied",
    grade: "5-6",
    unit: "과거경험",
  },
  {
    korean: "날씨가 점점 더워지고 있어요.",
    english: "The weather is getting hotter.",
    keyWord: "hotter",
    grade: "5-6",
    unit: "날씨와 자연",
  },
  {
    korean: "친절은 세상을 바꿔요.",
    english: "Kindness changes the world.",
    keyWord: "kindness",
    grade: "5-6",
  },
  {
    korean: "나는 과학이 재미있다고 생각해요.",
    english: "I think science is fun.",
    keyWord: "science",
    grade: "5-6",
    unit: "과학 탐구",
  },
  {
    korean: "우리는 서로 도와야 해요.",
    english: "We should help each other.",
    keyWord: "help",
    grade: "5-6",
  },
];

// ============================================================
// Listening Comprehension Data for 듣기이해 question type
// ============================================================

interface ListeningEntry {
  sentence: string;
  question: string;
  answer: string;
  choices: string[];
  translation: string;
  grade: "3-4" | "5-6";
  unit?: string;
}

const LISTENING_ENTRIES: ListeningEntry[] = [
  // Grade 3-4
  {
    sentence: "I have a red ball.",
    question: "What color is the ball?",
    answer: "red",
    choices: ["red", "blue", "green", "yellow"],
    translation: "나는 빨간 공이 있어요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    sentence: "My mother is cooking dinner.",
    question: "What is my mother doing?",
    answer: "cooking",
    choices: ["cooking", "reading", "sleeping", "singing"],
    translation: "엄마가 저녁을 요리하고 있어요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    sentence: "There are five apples on the table.",
    question: "How many apples are there?",
    answer: "five",
    choices: ["three", "four", "five", "six"],
    translation: "탁자 위에 사과가 다섯 개 있어요.",
    grade: "3-4",
    unit: "숫자와 색깔",
  },
  {
    sentence: "The bird is in the tree.",
    question: "Where is the bird?",
    answer: "in the tree",
    choices: ["in the tree", "under the table", "on the desk", "in the box"],
    translation: "새가 나무에 있어요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    sentence: "I wake up at seven every morning.",
    question: "What time do I wake up?",
    answer: "seven",
    choices: ["six", "seven", "eight", "nine"],
    translation: "나는 매일 아침 7시에 일어나요.",
    grade: "3-4",
    unit: "일과표현",
  },
  {
    sentence: "Tom likes to play soccer.",
    question: "What does Tom like to play?",
    answer: "soccer",
    choices: ["soccer", "tennis", "baseball", "chess"],
    translation: "톰은 축구를 좋아해요.",
    grade: "3-4",
    unit: "운동과 스포츠",
  },
  {
    sentence: "It is snowy today.",
    question: "How is the weather?",
    answer: "snowy",
    choices: ["sunny", "rainy", "snowy", "cloudy"],
    translation: "오늘은 눈이 와요.",
    grade: "3-4",
    unit: "날씨",
  },
  {
    sentence: "She is my grandmother.",
    question: "Who is she?",
    answer: "grandmother",
    choices: ["mother", "sister", "grandmother", "teacher"],
    translation: "그녀는 내 할머니예요.",
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    sentence: "I go to school by bus.",
    question: "How do I go to school?",
    answer: "by bus",
    choices: ["by bus", "by car", "on foot", "by train"],
    translation: "나는 버스로 학교에 가요.",
    grade: "3-4",
    unit: "교통과 이동",
  },
  {
    sentence: "The elephant is very big.",
    question: "What is big?",
    answer: "the elephant",
    choices: ["the cat", "the dog", "the elephant", "the ant"],
    translation: "코끼리는 매우 커요.",
    grade: "3-4",
    unit: "동물과 자연",
  },
  // Grade 5-6
  {
    sentence: "I went to the museum last weekend.",
    question: "Where did I go last weekend?",
    answer: "the museum",
    choices: ["the park", "the museum", "the library", "the cinema"],
    translation: "나는 지난 주말에 박물관에 갔어요.",
    grade: "5-6",
    unit: "위치와 장소",
  },
  {
    sentence: "She wants to be a scientist.",
    question: "What does she want to be?",
    answer: "a scientist",
    choices: ["a teacher", "a doctor", "a scientist", "a singer"],
    translation: "그녀는 과학자가 되고 싶어요.",
    grade: "5-6",
    unit: "진로와 직업",
  },
  {
    sentence: "We should recycle to protect the earth.",
    question: "Why should we recycle?",
    answer: "to protect the earth",
    choices: [
      "to save money",
      "to protect the earth",
      "to be famous",
      "to have fun",
    ],
    translation: "지구를 보호하기 위해 재활용해야 해요.",
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    sentence: "The temperature dropped below zero yesterday.",
    question: "What happened yesterday?",
    answer: "The temperature dropped below zero.",
    choices: [
      "It was very hot.",
      "The temperature dropped below zero.",
      "It rained a lot.",
      "It was sunny.",
    ],
    translation: "어제 기온이 영하로 내려갔어요.",
    grade: "5-6",
    unit: "날씨와 자연",
  },
  {
    sentence: "He practiced piano for two hours.",
    question: "How long did he practice piano?",
    answer: "two hours",
    choices: ["one hour", "two hours", "three hours", "four hours"],
    translation: "그는 두 시간 동안 피아노를 연습했어요.",
    grade: "5-6",
    unit: "일상과 취미",
  },
  {
    sentence: "Mars is called the Red Planet.",
    question: "What is Mars called?",
    answer: "the Red Planet",
    choices: [
      "the Blue Planet",
      "the Red Planet",
      "the Green Planet",
      "the White Planet",
    ],
    translation: "화성은 붉은 행성이라 불려요.",
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    sentence: "I feel nervous before the test.",
    question: "How do I feel before the test?",
    answer: "nervous",
    choices: ["happy", "sad", "nervous", "excited"],
    translation: "시험 전에 긴장돼요.",
    grade: "5-6",
    unit: "감정과 상태",
  },
  {
    sentence: "She bought a souvenir for her friend.",
    question: "What did she buy?",
    answer: "a souvenir",
    choices: ["a book", "a souvenir", "a ticket", "a pencil"],
    translation: "그녀는 친구에게 기념품을 샀어요.",
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    sentence: "We need to drink eight glasses of water a day.",
    question: "How many glasses of water should we drink?",
    answer: "eight",
    choices: ["four", "six", "eight", "ten"],
    translation: "하루에 물 여덟 잔을 마셔야 해요.",
    grade: "5-6",
    unit: "건강과 운동",
  },
  {
    sentence: "The community held a festival last month.",
    question: "What did the community hold?",
    answer: "a festival",
    choices: ["a meeting", "a festival", "a contest", "a parade"],
    translation: "지역사회에서 지난달에 축제를 열었어요.",
    grade: "5-6",
    unit: "사회와 공동체",
  },
];

// ============================================================
// Picture Description Data for 그림보고영어 question type
// ============================================================

interface PictureDesc {
  scene: string;
  sceneKr: string;
  question: string;
  answer: string;
  choices: string[];
  grade: "3-4" | "5-6";
  unit?: string;
}

const PICTURE_DESCRIPTIONS: PictureDesc[] = [
  // Grade 3-4
  {
    scene: "A boy is eating an apple under a tree.",
    sceneKr: "소년이 나무 아래에서 사과를 먹고 있어요.",
    question: "What is the boy doing?",
    answer: "eating an apple",
    choices: ["eating an apple", "reading a book", "sleeping", "running"],
    grade: "3-4",
    unit: "음식과 맛",
  },
  {
    scene: "A girl is playing with a dog in the park.",
    sceneKr: "소녀가 공원에서 개와 놀고 있어요.",
    question: "Where is the girl?",
    answer: "in the park",
    choices: ["at school", "in the park", "at home", "in the library"],
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    scene: "It is raining and the boy has an umbrella.",
    sceneKr: "비가 오고 소년이 우산을 쓰고 있어요.",
    question: "What does the boy have?",
    answer: "an umbrella",
    choices: ["a hat", "an umbrella", "a bag", "a ball"],
    grade: "3-4",
    unit: "날씨",
  },
  {
    scene: "A family is eating dinner at a table.",
    sceneKr: "가족이 식탁에서 저녁을 먹고 있어요.",
    question: "What is the family doing?",
    answer: "eating dinner",
    choices: ["eating dinner", "watching TV", "playing games", "reading books"],
    grade: "3-4",
    unit: "가족과 신체",
  },
  {
    scene: "Three cats are sleeping on the sofa.",
    sceneKr: "고양이 세 마리가 소파 위에서 자고 있어요.",
    question: "How many cats are there?",
    answer: "three",
    choices: ["two", "three", "four", "five"],
    grade: "3-4",
    unit: "동물과 자연",
  },
  {
    scene: "A teacher is writing on the blackboard.",
    sceneKr: "선생님이 칠판에 쓰고 있어요.",
    question: "What is the teacher writing on?",
    answer: "the blackboard",
    choices: ["the desk", "the blackboard", "a book", "a paper"],
    grade: "3-4",
    unit: "학교생활",
  },
  {
    scene: "Two children are riding bicycles.",
    sceneKr: "두 아이가 자전거를 타고 있어요.",
    question: "What are the children riding?",
    answer: "bicycles",
    choices: ["cars", "buses", "bicycles", "horses"],
    grade: "3-4",
    unit: "교통과 이동",
  },
  {
    scene: "A snowman is in front of a house.",
    sceneKr: "눈사람이 집 앞에 있어요.",
    question: "What season is it?",
    answer: "winter",
    choices: ["spring", "summer", "fall", "winter"],
    grade: "3-4",
    unit: "날씨와 계절",
  },
  {
    scene: "A boy is kicking a soccer ball.",
    sceneKr: "소년이 축구공을 차고 있어요.",
    question: "What sport is the boy playing?",
    answer: "soccer",
    choices: ["basketball", "baseball", "soccer", "tennis"],
    grade: "3-4",
    unit: "운동과 스포츠",
  },
  {
    scene: "A woman is cooking soup in the kitchen.",
    sceneKr: "여자가 부엌에서 수프를 만들고 있어요.",
    question: "Where is the woman?",
    answer: "in the kitchen",
    choices: [
      "in the bedroom",
      "in the kitchen",
      "in the garden",
      "in the bathroom",
    ],
    grade: "3-4",
    unit: "요리와 맛",
  },
  // Grade 5-6
  {
    scene: "Students are doing a science experiment in the lab.",
    sceneKr: "학생들이 실험실에서 과학 실험을 하고 있어요.",
    question: "What are the students doing?",
    answer: "a science experiment",
    choices: [
      "a math test",
      "a science experiment",
      "an art project",
      "a music concert",
    ],
    grade: "5-6",
    unit: "과학 탐구",
  },
  {
    scene: "A family is at the airport with suitcases.",
    sceneKr: "가족이 여행가방을 들고 공항에 있어요.",
    question: "Where is the family?",
    answer: "at the airport",
    choices: ["at the park", "at school", "at the airport", "at the hospital"],
    grade: "5-6",
    unit: "여행과 세계",
  },
  {
    scene: "People are recycling bottles and cans.",
    sceneKr: "사람들이 병과 캔을 재활용하고 있어요.",
    question: "What are people doing?",
    answer: "recycling",
    choices: ["cooking", "recycling", "playing", "studying"],
    grade: "5-6",
    unit: "환경과 지구",
  },
  {
    scene: "A doctor is examining a patient at the hospital.",
    sceneKr: "의사가 병원에서 환자를 진찰하고 있어요.",
    question: "Who is the doctor examining?",
    answer: "a patient",
    choices: ["a teacher", "a patient", "a student", "a chef"],
    grade: "5-6",
    unit: "진로와 직업",
  },
  {
    scene: "The night sky is full of stars and a big moon.",
    sceneKr: "밤하늘에 별과 큰 달이 가득해요.",
    question: "What is in the sky?",
    answer: "stars and a moon",
    choices: [
      "clouds and rain",
      "stars and a moon",
      "birds and planes",
      "snow and wind",
    ],
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    scene: "Children are volunteering at a community garden.",
    sceneKr: "아이들이 지역 정원에서 봉사활동을 하고 있어요.",
    question: "What are the children doing?",
    answer: "volunteering",
    choices: ["studying", "volunteering", "sleeping", "eating"],
    grade: "5-6",
    unit: "사회와 공동체",
  },
  {
    scene: "A girl is reading a book at the library.",
    sceneKr: "소녀가 도서관에서 책을 읽고 있어요.",
    question: "Where is the girl reading?",
    answer: "at the library",
    choices: ["at school", "at home", "at the library", "at the park"],
    grade: "5-6",
    unit: "일상과 취미",
  },
  {
    scene: "Two students are comparing their heights.",
    sceneKr: "두 학생이 키를 비교하고 있어요.",
    question: "What are the students comparing?",
    answer: "their heights",
    choices: ["their ages", "their heights", "their bags", "their shoes"],
    grade: "5-6",
    unit: "비교와 묘사",
  },
  {
    scene: "An astronaut is floating in space.",
    sceneKr: "우주비행사가 우주에서 떠 있어요.",
    question: "Where is the astronaut?",
    answer: "in space",
    choices: ["in the sky", "in the ocean", "in space", "in the forest"],
    grade: "5-6",
    unit: "우주와 과학",
  },
  {
    scene: "A chef is making a delicious meal in a restaurant.",
    sceneKr: "셰프가 식당에서 맛있는 음식을 만들고 있어요.",
    question: "What is the chef doing?",
    answer: "making a meal",
    choices: ["washing dishes", "making a meal", "cleaning", "reading"],
    grade: "5-6",
    unit: "진로와 직업",
  },
];

// ============================================================
// Sentence Templates
// ============================================================

interface Tmpl {
  s: (w: string) => string;
  t: (k: string) => string;
}

const BASIC_TEMPLATES: Tmpl[] = [
  { s: (w) => `I like ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
  { s: (w) => `This is a ${w}.`, t: (k) => `이것은 ${k}이에요.` },
  { s: (w) => `I see a ${w}.`, t: (k) => `나는 ${k}을(를) 봐요.` },
  { s: (w) => `Do you like ${w}?`, t: (k) => `${k}을(를) 좋아해요?` },
  { s: (w) => `It is ${w}.`, t: (k) => `그것은 ${k}이에요.` },
  { s: (w) => `I have a ${w}.`, t: (k) => `나는 ${k}이(가) 있어요.` },
  { s: (w) => `The ${w} is nice.`, t: (k) => `그 ${k}은(는) 좋아요.` },
  { s: (w) => `Look at the ${w}!`, t: (k) => `${k}을(를) 봐요!` },
  { s: (w) => `I want a ${w}.`, t: (k) => `나는 ${k}을(를) 원해요.` },
  { s: (w) => `Where is the ${w}?`, t: (k) => `${k}이(가) 어디에 있어요?` },
];

const FAMILY_TEMPLATES: Tmpl[] = [
  { s: (w) => `This is my ${w}.`, t: (k) => `이분은 내 ${k}이에요.` },
  { s: (w) => `I love my ${w}.`, t: (k) => `나는 내 ${k}을(를) 사랑해요.` },
  { s: (w) => `My ${w} is kind.`, t: (k) => `내 ${k}은(는) 친절해요.` },
  { s: (w) => `My ${w} is tall.`, t: (k) => `내 ${k}은(는) 키가 커요.` },
  { s: (w) => `I have a ${w}.`, t: (k) => `나는 ${k}이(가) 있어요.` },
  { s: (w) => `My ${w} is the best.`, t: (k) => `내 ${k}은(는) 최고예요.` },
];

const ACTION_TEMPLATES: Tmpl[] = [
  { s: (w) => `I ${w} every day.`, t: (k) => `나는 매일 ${k}.` },
  { s: (w) => `Let's ${w}!`, t: (k) => `같이 ${k}!` },
  { s: (w) => `I can ${w}.`, t: (k) => `나는 ${k} 수 있어요.` },
  { s: (w) => `Do you like to ${w}?`, t: (k) => `${k} 것을 좋아해요?` },
  { s: (w) => `I like to ${w}.`, t: (k) => `나는 ${k} 것을 좋아해요.` },
  { s: (w) => `She can ${w} well.`, t: (k) => `그녀는 잘 ${k}.` },
  { s: (w) => `We ${w} together.`, t: (k) => `우리는 함께 ${k}.` },
];

const INTERMEDIATE_TEMPLATES: Tmpl[] = [
  { s: (w) => `I went to the ${w}.`, t: (k) => `나는 ${k}에 갔어요.` },
  {
    s: (w) => `The ${w} is near my house.`,
    t: (k) => `${k}은(는) 우리 집 근처에 있어요.`,
  },
  { s: (w) => `Let's go to the ${w}.`, t: (k) => `${k}에 가자.` },
  { s: (w) => `Where is the ${w}?`, t: (k) => `${k}이(가) 어디에 있어요?` },
  {
    s: (w) => `I like going to the ${w}.`,
    t: (k) => `나는 ${k}에 가는 것을 좋아해요.`,
  },
  {
    s: (w) => `We visited the ${w} yesterday.`,
    t: (k) => `우리는 어제 ${k}에 갔어요.`,
  },
  { s: (w) => `The ${w} is very big.`, t: (k) => `그 ${k}은(는) 매우 커요.` },
  {
    s: (w) => `Have you been to the ${w}?`,
    t: (k) => `${k}에 가 본 적 있어요?`,
  },
];

const EMOTION_TEMPLATES: Tmpl[] = [
  { s: (w) => `I feel ${w}.`, t: (k) => `나는 ${k} 기분이에요.` },
  { s: (w) => `She looks ${w}.`, t: (k) => `그녀는 ${k} 보여요.` },
  { s: (w) => `Are you ${w}?`, t: (k) => `${k} 기분이에요?` },
  {
    s: (w) => `He was ${w} yesterday.`,
    t: (k) => `그는 어제 ${k} 기분이었어요.`,
  },
  { s: (w) => `Don't be ${w}.`, t: (k) => `${k} 하지 마세요.` },
  { s: (w) => `I am so ${w} right now.`, t: (k) => `나는 지금 너무 ${k}.` },
  { s: (w) => `Why are you ${w}?`, t: (k) => `왜 ${k} 기분이에요?` },
];

const HOBBY_TEMPLATES: Tmpl[] = [
  { s: (w) => `My hobby is ${w}.`, t: (k) => `내 취미는 ${k}이에요.` },
  { s: (w) => `I enjoy ${w}.`, t: (k) => `나는 ${k}을(를) 즐겨요.` },
  { s: (w) => `Do you like ${w}?`, t: (k) => `${k} 좋아해요?` },
  {
    s: (w) => `I go ${w} on weekends.`,
    t: (k) => `나는 주말에 ${k}을(를) 해요.`,
  },
  { s: (w) => `${w} is fun.`, t: (k) => `${k}은(는) 재미있어요.` },
  {
    s: (w) => `I started ${w} last year.`,
    t: (k) => `나는 작년에 ${k}을(를) 시작했어요.`,
  },
];

// 날씨 명사용(형용사 날씨 단어는 ADJ_DESC_TEMPLATES로 자동 라우팅됨)
const WEATHER_TEMPLATES: Tmpl[] = [
  { s: (w) => `Look at the ${w}!`, t: (k) => `${k}을(를) 봐요!` },
  { s: (w) => `There is ${w} today.`, t: (k) => `오늘은 ${k}이(가) 있어요.` },
  { s: (w) => `I like the ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
];

const JOB_TEMPLATES: Tmpl[] = [
  {
    s: (w) => `I want to be a ${w}.`,
    t: (k) => `나는 ${k}이(가) 되고 싶어요.`,
  },
  { s: (w) => `My mom is a ${w}.`, t: (k) => `우리 엄마는 ${k}이에요.` },
  { s: (w) => `A ${w} helps people.`, t: (k) => `${k}은(는) 사람들을 도와요.` },
  {
    s: (w) => `The ${w} works hard.`,
    t: (k) => `그 ${k}은(는) 열심히 일해요.`,
  },
  {
    s: (w) => `Do you want to be a ${w}?`,
    t: (k) => `${k}이(가) 되고 싶어요?`,
  },
];

const COMPARISON_TEMPLATES: Tmpl[] = [
  { s: (w) => `This is ${w} than that.`, t: (k) => `이것은 저것보다 ${k}.` },
  { s: (w) => `She is ${w}.`, t: (k) => `그녀는 ${k}.` },
  { s: (w) => `The movie was ${w}.`, t: (k) => `그 영화는 ${k}어요.` },
  { s: (w) => `This book is ${w}.`, t: (k) => `이 책은 ${k}.` },
  { s: (w) => `That building is ${w}.`, t: (k) => `저 건물은 ${k}.` },
  { s: (w) => `The test was ${w}.`, t: (k) => `시험은 ${k}어요.` },
];

// ============================================================
// Fixed sentence collections
// ============================================================

const FIXED_COMMANDS: EnglishEntry[] = [
  {
    sentence: "Open your book.",
    translation: "책을 펴세요.",
    word: "open",
    targetKo: "펴세요",
    pronunciation: "오픈",
    practice: ["close", "read", "page"],
  },
  {
    sentence: "Close the door.",
    translation: "문을 닫으세요.",
    word: "close",
    targetKo: "닫으세요",
    pronunciation: "클로즈",
    practice: ["open", "shut", "door"],
  },
  {
    sentence: "Raise your hand.",
    translation: "손을 들어요.",
    word: "raise",
    targetKo: "들어요",
    pronunciation: "레이즈",
    practice: ["hand", "up", "lift"],
  },
  {
    sentence: "Be quiet, please.",
    translation: "조용히 해 주세요.",
    word: "quiet",
    targetKo: "조용히",
    pronunciation: "콰이엇",
    practice: ["silent", "calm"],
  },
  {
    sentence: "Listen carefully.",
    translation: "잘 들으세요.",
    word: "carefully",
    targetKo: "잘",
    pronunciation: "케어풀리",
    practice: ["listen", "hear"],
  },
  {
    sentence: "Repeat after me.",
    translation: "따라 하세요.",
    word: "repeat",
    targetKo: "따라 하세요",
    pronunciation: "리핏",
    practice: ["again", "say"],
  },
  {
    sentence: "Clean your desk.",
    translation: "책상을 정리하세요.",
    word: "clean",
    targetKo: "정리하세요",
    pronunciation: "클린",
    practice: ["tidy", "organize"],
  },
  {
    sentence: "Share with your friend.",
    translation: "친구와 나누세요.",
    word: "share",
    targetKo: "나누세요",
    pronunciation: "쉐어",
    practice: ["give", "together"],
  },
  {
    sentence: "Line up, everyone.",
    translation: "모두 줄 서세요.",
    word: "line up",
    targetKo: "줄 서세요",
    pronunciation: "라인 업",
    practice: ["queue", "row"],
  },
  {
    sentence: "Take out your pencil.",
    translation: "연필을 꺼내세요.",
    word: "take out",
    targetKo: "꺼내세요",
    pronunciation: "테이크 아웃",
    practice: ["pencil", "bag"],
  },
  {
    sentence: "Sit down, please.",
    translation: "앉으세요.",
    word: "sit",
    targetKo: "앉으세요",
    pronunciation: "싯",
    practice: ["stand", "chair"],
  },
  {
    sentence: "Stand up, please.",
    translation: "일어나세요.",
    word: "stand",
    targetKo: "일어나세요",
    pronunciation: "스탠드",
    practice: ["sit", "up"],
  },
  {
    sentence: "Turn to page ten.",
    translation: "10쪽을 펴세요.",
    word: "turn",
    targetKo: "펴세요",
    pronunciation: "턴",
    practice: ["page", "book"],
  },
  {
    sentence: "Come to the front.",
    translation: "앞으로 나오세요.",
    word: "front",
    targetKo: "앞",
    pronunciation: "프런트",
    practice: ["back", "come"],
  },
  {
    sentence: "Work in pairs.",
    translation: "짝과 함께 하세요.",
    word: "pairs",
    targetKo: "짝",
    pronunciation: "페어스",
    practice: ["two", "together"],
  },
  {
    sentence: "Raise your hand if you know.",
    translation: "알면 손을 드세요.",
    word: "know",
    targetKo: "알면",
    pronunciation: "노",
    practice: ["answer", "hand"],
  },
  {
    sentence: "Put away your phone.",
    translation: "전화기를 치우세요.",
    word: "put away",
    targetKo: "치우세요",
    pronunciation: "풋 어웨이",
    practice: ["keep", "store"],
  },
  {
    sentence: "Pay attention.",
    translation: "집중하세요.",
    word: "attention",
    targetKo: "집중하세요",
    pronunciation: "어텐션",
    practice: ["focus", "listen"],
  },
  {
    sentence: "Hurry up, please.",
    translation: "서두르세요.",
    word: "hurry",
    targetKo: "서두르세요",
    pronunciation: "허리",
    practice: ["quick", "fast"],
  },
  {
    sentence: "Wait your turn.",
    translation: "차례를 기다리세요.",
    word: "wait",
    targetKo: "기다리세요",
    pronunciation: "웨이트",
    practice: ["turn", "patience"],
  },
  {
    sentence: "Try again.",
    translation: "다시 해 보세요.",
    word: "again",
    targetKo: "다시",
    pronunciation: "어겐",
    practice: ["once more", "retry"],
  },
  {
    sentence: "Do not run in the hallway.",
    translation: "복도에서 뛰지 마세요.",
    word: "hallway",
    targetKo: "복도",
    pronunciation: "홀웨이",
    practice: ["walk", "corridor"],
  },
  {
    sentence: "Pick up your trash.",
    translation: "쓰레기를 주우세요.",
    word: "trash",
    targetKo: "쓰레기",
    pronunciation: "트래시",
    practice: ["garbage", "clean"],
  },
  {
    sentence: "Be careful.",
    translation: "조심하세요.",
    word: "careful",
    targetKo: "조심하세요",
    pronunciation: "케어풀",
    practice: ["watch", "safe"],
  },
];

const FIXED_BECAUSE: EnglishEntry[] = [
  {
    sentence: "I am happy because it is my birthday.",
    translation: "내 생일이어서 행복해요.",
    word: "birthday",
    targetKo: "생일",
    pronunciation: "벌스데이",
    practice: ["party", "cake"],
  },
  {
    sentence: "I am tired because I studied all day.",
    translation: "하루 종일 공부해서 피곤해요.",
    word: "tired",
    targetKo: "피곤해요",
    pronunciation: "타이어드",
    practice: ["sleepy", "rest"],
  },
  {
    sentence: "She is late because she missed the bus.",
    translation: "버스를 놓쳐서 늦었어요.",
    word: "late",
    targetKo: "늦었어요",
    pronunciation: "레이트",
    practice: ["early", "hurry"],
  },
  {
    sentence: "We are excited because we are going on a trip.",
    translation: "여행을 가서 신나요.",
    word: "trip",
    targetKo: "여행",
    pronunciation: "트립",
    practice: ["travel", "vacation"],
  },
  {
    sentence: "He is hungry because he did not eat lunch.",
    translation: "점심을 안 먹어서 배고파요.",
    word: "hungry",
    targetKo: "배고파요",
    pronunciation: "헝그리",
    practice: ["thirsty", "food"],
  },
  {
    sentence: "I wear a jacket because it is cold outside.",
    translation: "밖이 추워서 재킷을 입어요.",
    word: "jacket",
    targetKo: "재킷",
    pronunciation: "재킷",
    practice: ["coat", "warm"],
  },
  {
    sentence: "I take an umbrella because it is rainy.",
    translation: "비가 와서 우산을 가져가요.",
    word: "umbrella",
    targetKo: "우산",
    pronunciation: "엄브렐라",
    practice: ["raincoat", "wet"],
  },
  {
    sentence: "She is proud because she won the contest.",
    translation: "대회에서 이겨서 자랑스러워요.",
    word: "proud",
    targetKo: "자랑스러워요",
    pronunciation: "프라우드",
    practice: ["happy", "winner"],
  },
  {
    sentence: "I like spring because the flowers bloom.",
    translation: "꽃이 피어서 봄을 좋아해요.",
    word: "spring",
    targetKo: "봄",
    pronunciation: "스프링",
    practice: ["flower", "warm"],
  },
  {
    sentence: "They are scared because they heard a loud noise.",
    translation: "큰 소리를 들어서 무서워요.",
    word: "scared",
    targetKo: "무서워요",
    pronunciation: "스케어드",
    practice: ["afraid", "noise"],
  },
  {
    sentence: "I am sleepy because I stayed up late.",
    translation: "늦게까지 안 자서 졸려요.",
    word: "sleepy",
    targetKo: "졸려요",
    pronunciation: "슬리피",
    practice: ["tired", "yawn"],
  },
  {
    sentence: "He is smiling because he got a gift.",
    translation: "선물을 받아서 웃고 있어요.",
    word: "gift",
    targetKo: "선물",
    pronunciation: "기프트",
    practice: ["present", "surprise"],
  },
  {
    sentence: "I am thirsty because I ran a lot.",
    translation: "많이 뛰어서 목이 말라요.",
    word: "thirsty",
    targetKo: "목이 말라요",
    pronunciation: "써스티",
    practice: ["drink", "water"],
  },
  {
    sentence: "She is crying because she lost her toy.",
    translation: "장난감을 잃어버려서 울고 있어요.",
    word: "lost",
    targetKo: "잃어버려서",
    pronunciation: "로스트",
    practice: ["find", "gone"],
  },
  {
    sentence: "We are laughing because the movie is funny.",
    translation: "영화가 재미있어서 웃고 있어요.",
    word: "funny",
    targetKo: "재미있어서",
    pronunciation: "퍼니",
    practice: ["hilarious", "comedy"],
  },
  {
    sentence: "I am nervous because I have a test today.",
    translation: "오늘 시험이 있어서 긴장돼요.",
    word: "test",
    targetKo: "시험",
    pronunciation: "테스트",
    practice: ["exam", "quiz"],
  },
  {
    sentence: "He is cold because he forgot his jacket.",
    translation: "재킷을 잊어서 추워요.",
    word: "forgot",
    targetKo: "잊어서",
    pronunciation: "포갓",
    practice: ["remember", "lost"],
  },
  {
    sentence: "I am full because I ate too much.",
    translation: "너무 많이 먹어서 배불러요.",
    word: "full",
    targetKo: "배불러요",
    pronunciation: "풀",
    practice: ["hungry", "stomach"],
  },
  {
    sentence: "She is excited because her friend is visiting.",
    translation: "친구가 놀러 와서 신나요.",
    word: "visiting",
    targetKo: "놀러 와서",
    pronunciation: "비지팅",
    practice: ["coming", "guest"],
  },
];

const FIXED_IF: EnglishEntry[] = [
  {
    sentence: "If it rains, I will stay home.",
    translation: "비가 오면 나는 집에 있을 거예요.",
    word: "rain",
    targetKo: "비",
    pronunciation: "레인",
    practice: ["snow", "storm"],
  },
  {
    sentence: "If you study hard, you will do well.",
    translation: "열심히 공부하면 잘할 거예요.",
    word: "study",
    targetKo: "공부하면",
    pronunciation: "스터디",
    practice: ["learn", "practice"],
  },
  {
    sentence: "If I have time, I will read a book.",
    translation: "시간이 있으면 책을 읽을 거예요.",
    word: "time",
    targetKo: "시간",
    pronunciation: "타임",
    practice: ["clock", "hour"],
  },
  {
    sentence: "If we finish early, we can play outside.",
    translation: "일찍 끝나면 밖에서 놀 수 있어요.",
    word: "finish",
    targetKo: "끝나면",
    pronunciation: "피니시",
    practice: ["complete", "done"],
  },
  {
    sentence: "If you are kind, people will like you.",
    translation: "친절하면 사람들이 좋아할 거예요.",
    word: "kind",
    targetKo: "친절하면",
    pronunciation: "카인드",
    practice: ["nice", "gentle"],
  },
  {
    sentence: "If it is sunny, we will go to the park.",
    translation: "날씨가 좋으면 공원에 갈 거예요.",
    word: "sunny",
    targetKo: "날씨가 좋으면",
    pronunciation: "서니",
    practice: ["bright", "clear"],
  },
  {
    sentence: "If you eat vegetables, you will be healthy.",
    translation: "채소를 먹으면 건강해질 거예요.",
    word: "healthy",
    targetKo: "건강해질",
    pronunciation: "헬시",
    practice: ["strong", "fit"],
  },
  {
    sentence: "If I save money, I can buy a new book.",
    translation: "돈을 모으면 새 책을 살 수 있어요.",
    word: "save",
    targetKo: "모으면",
    pronunciation: "세이브",
    practice: ["spend", "keep"],
  },
  {
    sentence: "If you help others, they will help you too.",
    translation: "다른 사람을 도우면 그들도 너를 도와줄 거예요.",
    word: "others",
    targetKo: "다른 사람",
    pronunciation: "아더스",
    practice: ["people", "friends"],
  },
  {
    sentence: "If I practice every day, I will get better.",
    translation: "매일 연습하면 더 잘할 수 있을 거예요.",
    word: "practice",
    targetKo: "연습하면",
    pronunciation: "프랙티스",
    practice: ["train", "improve"],
  },
  {
    sentence: "If it snows, we will build a snowman.",
    translation: "눈이 오면 눈사람을 만들 거예요.",
    word: "snowman",
    targetKo: "눈사람",
    pronunciation: "스노맨",
    practice: ["snow", "winter"],
  },
  {
    sentence: "If you are tired, you should rest.",
    translation: "피곤하면 쉬어야 해요.",
    word: "rest",
    targetKo: "쉬어야",
    pronunciation: "레스트",
    practice: ["sleep", "relax"],
  },
  {
    sentence: "If we hurry, we will catch the bus.",
    translation: "서두르면 버스를 탈 수 있을 거예요.",
    word: "hurry",
    targetKo: "서두르면",
    pronunciation: "허리",
    practice: ["fast", "rush"],
  },
  {
    sentence: "If you read every day, you will learn many words.",
    translation: "매일 읽으면 단어를 많이 배울 거예요.",
    word: "words",
    targetKo: "단어",
    pronunciation: "워즈",
    practice: ["vocabulary", "language"],
  },
  {
    sentence: "If she comes early, we can play together.",
    translation: "그녀가 일찍 오면 같이 놀 수 있어요.",
    word: "early",
    targetKo: "일찍",
    pronunciation: "얼리",
    practice: ["late", "soon"],
  },
];

const FIXED_ROUTINE: EnglishEntry[] = [
  {
    sentence: "Every day, I wake up at seven.",
    translation: "매일, 나는 7시에 일어나요.",
    word: "wake up",
    targetKo: "일어나요",
    pronunciation: "웨이크 업",
    practice: ["get up", "alarm"],
  },
  {
    sentence: "Every day, I brush my teeth.",
    translation: "매일, 나는 양치해요.",
    word: "brush",
    targetKo: "양치해요",
    pronunciation: "브러시",
    practice: ["toothpaste", "teeth"],
  },
  {
    sentence: "Every day, I eat breakfast.",
    translation: "매일, 나는 아침을 먹어요.",
    word: "breakfast",
    targetKo: "아침",
    pronunciation: "브렉퍼스트",
    practice: ["lunch", "dinner"],
  },
  {
    sentence: "Every day, I go to school.",
    translation: "매일, 나는 학교에 가요.",
    word: "school",
    targetKo: "학교",
    pronunciation: "스쿨",
    practice: ["class", "teacher"],
  },
  {
    sentence: "Every day, I do my homework.",
    translation: "매일, 나는 숙제를 해요.",
    word: "homework",
    targetKo: "숙제",
    pronunciation: "홈워크",
    practice: ["assignment", "study"],
  },
  {
    sentence: "Every day, I take a shower.",
    translation: "매일, 나는 샤워해요.",
    word: "shower",
    targetKo: "샤워해요",
    pronunciation: "샤워",
    practice: ["bath", "wash"],
  },
  {
    sentence: "Every day, I go to bed at nine.",
    translation: "매일, 나는 9시에 자요.",
    word: "bed",
    targetKo: "자요",
    pronunciation: "베드",
    practice: ["sleep", "pillow"],
  },
  {
    sentence: "Every day, I walk to school.",
    translation: "매일, 나는 걸어서 학교에 가요.",
    word: "walk",
    targetKo: "걸어서",
    pronunciation: "워크",
    practice: ["run", "ride"],
  },
  {
    sentence: "Every day, I feed my pet.",
    translation: "매일, 나는 반려동물에게 밥을 줘요.",
    word: "feed",
    targetKo: "밥을 줘요",
    pronunciation: "피드",
    practice: ["food", "eat"],
  },
  {
    sentence: "Every day, I practice piano.",
    translation: "매일, 나는 피아노를 연습해요.",
    word: "practice",
    targetKo: "연습해요",
    pronunciation: "프랙티스",
    practice: ["rehearse", "play"],
  },
  {
    sentence: "Every day, I read before bed.",
    translation: "매일, 나는 자기 전에 책을 읽어요.",
    word: "read",
    targetKo: "읽어요",
    pronunciation: "리드",
    practice: ["book", "story"],
  },
  {
    sentence: "Every day, I drink water.",
    translation: "매일, 나는 물을 마셔요.",
    word: "water",
    targetKo: "물",
    pronunciation: "워터",
    practice: ["drink", "healthy"],
  },
  {
    sentence: "Every day, I clean my room.",
    translation: "매일, 나는 방을 정리해요.",
    word: "room",
    targetKo: "방",
    pronunciation: "룸",
    practice: ["clean", "tidy"],
  },
  {
    sentence: "Every day, I say hello to my friends.",
    translation: "매일, 나는 친구들에게 인사해요.",
    word: "hello",
    targetKo: "인사해요",
    pronunciation: "헬로",
    practice: ["greet", "hi"],
  },
  {
    sentence: "Every day, I wear my uniform.",
    translation: "매일, 나는 교복을 입어요.",
    word: "uniform",
    targetKo: "교복",
    pronunciation: "유니폼",
    practice: ["school", "clothes"],
  },
  {
    sentence: "Every day, I pack my bag.",
    translation: "매일, 나는 가방을 싸요.",
    word: "pack",
    targetKo: "싸요",
    pronunciation: "팩",
    practice: ["bag", "prepare"],
  },
  {
    sentence: "Every day, I help my parents.",
    translation: "매일, 나는 부모님을 도와요.",
    word: "parents",
    targetKo: "부모님",
    pronunciation: "페어런츠",
    practice: ["family", "help"],
  },
  {
    sentence: "Every day, I exercise after school.",
    translation: "매일, 나는 방과 후에 운동해요.",
    word: "exercise",
    targetKo: "운동",
    pronunciation: "엑서사이즈",
    practice: ["sport", "run"],
  },
  {
    sentence: "Every day, I eat vegetables.",
    translation: "매일, 나는 채소를 먹어요.",
    word: "vegetables",
    targetKo: "채소",
    pronunciation: "베지터블즈",
    practice: ["fruit", "healthy"],
  },
];

const FIXED_SHOULD: EnglishEntry[] = [
  {
    sentence: "You should eat breakfast.",
    translation: "아침을 먹어야 해요.",
    word: "should",
    targetKo: "먹어야 해요",
    pronunciation: "슈드",
    practice: ["must", "need"],
  },
  {
    sentence: "We should be kind to others.",
    translation: "다른 사람에게 친절해야 해요.",
    word: "kind",
    targetKo: "친절해야",
    pronunciation: "카인드",
    practice: ["nice", "gentle"],
  },
  {
    sentence: "You should drink more water.",
    translation: "물을 더 마셔야 해요.",
    word: "water",
    targetKo: "물",
    pronunciation: "워터",
    practice: ["juice", "milk"],
  },
  {
    sentence: "She should go to bed early.",
    translation: "그녀는 일찍 자야 해요.",
    word: "early",
    targetKo: "일찍",
    pronunciation: "얼리",
    practice: ["late", "soon"],
  },
  {
    sentence: "We should help each other.",
    translation: "우리는 서로 도와야 해요.",
    word: "help",
    targetKo: "도와야",
    pronunciation: "헬프",
    practice: ["support", "assist"],
  },
  {
    sentence: "You should wear a helmet.",
    translation: "헬멧을 써야 해요.",
    word: "helmet",
    targetKo: "헬멧",
    pronunciation: "헬멧",
    practice: ["safety", "protect"],
  },
  {
    sentence: "You should brush your teeth.",
    translation: "양치를 해야 해요.",
    word: "brush",
    targetKo: "양치",
    pronunciation: "브러시",
    practice: ["teeth", "clean"],
  },
  {
    sentence: "We should save energy.",
    translation: "에너지를 절약해야 해요.",
    word: "energy",
    targetKo: "에너지",
    pronunciation: "에너지",
    practice: ["power", "save"],
  },
  {
    sentence: "You should say thank you.",
    translation: "감사하다고 말해야 해요.",
    word: "thank",
    targetKo: "감사하다고",
    pronunciation: "땡크",
    practice: ["grateful", "polite"],
  },
  {
    sentence: "We should respect our teachers.",
    translation: "선생님을 존경해야 해요.",
    word: "respect",
    targetKo: "존경해야",
    pronunciation: "리스펙트",
    practice: ["honor", "polite"],
  },
  {
    sentence: "You should listen to your parents.",
    translation: "부모님 말씀을 들어야 해요.",
    word: "listen",
    targetKo: "들어야",
    pronunciation: "리슨",
    practice: ["hear", "obey"],
  },
  {
    sentence: "She should study for the test.",
    translation: "그녀는 시험 공부를 해야 해요.",
    word: "test",
    targetKo: "시험",
    pronunciation: "테스트",
    practice: ["exam", "quiz"],
  },
  {
    sentence: "We should recycle paper.",
    translation: "종이를 재활용해야 해요.",
    word: "recycle",
    targetKo: "재활용해야",
    pronunciation: "리사이클",
    practice: ["reuse", "environment"],
  },
  {
    sentence: "You should wash your hands often.",
    translation: "손을 자주 씻어야 해요.",
    word: "wash",
    targetKo: "씻어야",
    pronunciation: "워시",
    practice: ["clean", "soap"],
  },
  {
    sentence: "We should protect animals.",
    translation: "동물을 보호해야 해요.",
    word: "protect",
    targetKo: "보호해야",
    pronunciation: "프로텍트",
    practice: ["save", "guard"],
  },
  {
    sentence: "You should read more books.",
    translation: "책을 더 많이 읽어야 해요.",
    word: "more",
    targetKo: "더 많이",
    pronunciation: "모어",
    practice: ["less", "many"],
  },
];

const FIXED_WANT: EnglishEntry[] = [
  {
    sentence: "I want to visit Japan.",
    translation: "나는 일본을 방문하고 싶어요.",
    word: "visit",
    targetKo: "방문하고",
    pronunciation: "비짓",
    practice: ["travel", "trip"],
  },
  {
    sentence: "I want to learn English.",
    translation: "나는 영어를 배우고 싶어요.",
    word: "learn",
    targetKo: "배우고",
    pronunciation: "런",
    practice: ["study", "practice"],
  },
  {
    sentence: "I want to become a doctor.",
    translation: "나는 의사가 되고 싶어요.",
    word: "become",
    targetKo: "되고",
    pronunciation: "비컴",
    practice: ["teacher", "scientist"],
  },
  {
    sentence: "I want to try new food.",
    translation: "나는 새 음식을 먹어보고 싶어요.",
    word: "try",
    targetKo: "먹어보고",
    pronunciation: "트라이",
    practice: ["taste", "eat"],
  },
  {
    sentence: "I want to ride a horse.",
    translation: "나는 말을 타고 싶어요.",
    word: "ride",
    targetKo: "타고",
    pronunciation: "라이드",
    practice: ["bicycle", "boat"],
  },
  {
    sentence: "I want to meet new friends.",
    translation: "나는 새 친구를 만나고 싶어요.",
    word: "meet",
    targetKo: "만나고",
    pronunciation: "밋",
    practice: ["greet", "talk"],
  },
  {
    sentence: "I want to build a robot.",
    translation: "나는 로봇을 만들고 싶어요.",
    word: "build",
    targetKo: "만들고",
    pronunciation: "빌드",
    practice: ["create", "design"],
  },
  {
    sentence: "I want to climb a mountain.",
    translation: "나는 산에 오르고 싶어요.",
    word: "climb",
    targetKo: "오르고",
    pronunciation: "클라임",
    practice: ["hike", "walk"],
  },
  {
    sentence: "I want to fly an airplane.",
    translation: "나는 비행기를 타고 싶어요.",
    word: "fly",
    targetKo: "타고",
    pronunciation: "플라이",
    practice: ["travel", "sky"],
  },
  {
    sentence: "I want to win the game.",
    translation: "나는 경기에서 이기고 싶어요.",
    word: "win",
    targetKo: "이기고",
    pronunciation: "윈",
    practice: ["lose", "compete"],
  },
  {
    sentence: "I want to travel around the world.",
    translation: "나는 세계 여행을 하고 싶어요.",
    word: "travel",
    targetKo: "여행",
    pronunciation: "트래블",
    practice: ["trip", "journey"],
  },
  {
    sentence: "I want to speak many languages.",
    translation: "나는 여러 언어를 말하고 싶어요.",
    word: "language",
    targetKo: "언어",
    pronunciation: "랭귀지",
    practice: ["speak", "learn"],
  },
  {
    sentence: "I want to plant a tree.",
    translation: "나는 나무를 심고 싶어요.",
    word: "plant",
    targetKo: "심고",
    pronunciation: "플랜트",
    practice: ["tree", "grow"],
  },
  {
    sentence: "I want to write a story.",
    translation: "나는 이야기를 쓰고 싶어요.",
    word: "story",
    targetKo: "이야기",
    pronunciation: "스토리",
    practice: ["tale", "book"],
  },
  {
    sentence: "I want to help animals.",
    translation: "나는 동물들을 돕고 싶어요.",
    word: "animal",
    targetKo: "동물들",
    pronunciation: "애니멀",
    practice: ["pet", "protect"],
  },
  {
    sentence: "I want to make a cake.",
    translation: "나는 케이크를 만들고 싶어요.",
    word: "cake",
    targetKo: "케이크",
    pronunciation: "케이크",
    practice: ["bake", "sweet"],
  },
  {
    sentence: "I want to see the ocean.",
    translation: "나는 바다를 보고 싶어요.",
    word: "ocean",
    targetKo: "바다",
    pronunciation: "오션",
    practice: ["sea", "beach"],
  },
  {
    sentence: "I want to learn to dance.",
    translation: "나는 춤을 배우고 싶어요.",
    word: "dance",
    targetKo: "춤",
    pronunciation: "댄스",
    practice: ["move", "music"],
  },
  {
    sentence: "I want to explore the jungle.",
    translation: "나는 정글을 탐험하고 싶어요.",
    word: "explore",
    targetKo: "탐험하고",
    pronunciation: "익스플로어",
    practice: ["discover", "adventure"],
  },
  {
    sentence: "I want to catch a butterfly.",
    translation: "나는 나비를 잡고 싶어요.",
    word: "butterfly",
    targetKo: "나비",
    pronunciation: "버터플라이",
    practice: ["insect", "net"],
  },
];

const FIXED_OPINION: EnglishEntry[] = [
  {
    sentence: "I think reading is important.",
    translation: "나는 독서가 중요하다고 생각해요.",
    word: "important",
    targetKo: "중요하다고",
    pronunciation: "임포턴트",
    practice: ["valuable", "essential"],
  },
  {
    sentence: "I believe friends are special.",
    translation: "나는 친구가 특별하다고 믿어요.",
    word: "special",
    targetKo: "특별하다고",
    pronunciation: "스페셜",
    practice: ["unique", "important"],
  },
  {
    sentence: "I think nature is beautiful.",
    translation: "나는 자연이 아름답다고 생각해요.",
    word: "nature",
    targetKo: "자연",
    pronunciation: "네이처",
    practice: ["forest", "mountain"],
  },
  {
    sentence: "I feel exercise is good for health.",
    translation: "운동이 건강에 좋다고 느껴요.",
    word: "exercise",
    targetKo: "운동",
    pronunciation: "엑서사이즈",
    practice: ["sport", "fitness"],
  },
  {
    sentence: "I hope we can travel together.",
    translation: "함께 여행할 수 있으면 좋겠어요.",
    word: "travel",
    targetKo: "여행할",
    pronunciation: "트래블",
    practice: ["trip", "journey"],
  },
  {
    sentence: "I know sharing is caring.",
    translation: "나누는 것이 배려라는 것을 알아요.",
    word: "sharing",
    targetKo: "나누는 것",
    pronunciation: "쉐어링",
    practice: ["giving", "helping"],
  },
  {
    sentence: "I wish I could fly like a bird.",
    translation: "새처럼 날 수 있으면 좋겠어요.",
    word: "fly",
    targetKo: "날",
    pronunciation: "플라이",
    practice: ["soar", "wing"],
  },
  {
    sentence: "I hope tomorrow will be sunny.",
    translation: "내일 날씨가 좋으면 좋겠어요.",
    word: "hope",
    targetKo: "좋겠어요",
    pronunciation: "호프",
    practice: ["wish", "dream"],
  },
  {
    sentence: "I think teamwork is important.",
    translation: "나는 팀워크가 중요하다고 생각해요.",
    word: "teamwork",
    targetKo: "팀워크",
    pronunciation: "팀워크",
    practice: ["together", "cooperate"],
  },
  {
    sentence: "I believe everyone is equal.",
    translation: "나는 모든 사람이 평등하다고 믿어요.",
    word: "equal",
    targetKo: "평등하다고",
    pronunciation: "이퀄",
    practice: ["same", "fair"],
  },
  {
    sentence: "I think learning is fun.",
    translation: "나는 배우는 것이 재미있다고 생각해요.",
    word: "learning",
    targetKo: "배우는 것",
    pronunciation: "러닝",
    practice: ["studying", "growing"],
  },
  {
    sentence: "I feel music makes me happy.",
    translation: "음악이 나를 행복하게 한다고 느껴요.",
    word: "music",
    targetKo: "음악",
    pronunciation: "뮤직",
    practice: ["song", "rhythm"],
  },
  {
    sentence: "I believe hard work pays off.",
    translation: "나는 노력은 보답된다고 믿어요.",
    word: "effort",
    targetKo: "노력",
    pronunciation: "에포트",
    practice: ["work", "try"],
  },
  {
    sentence: "I think animals deserve love.",
    translation: "나는 동물도 사랑받을 자격이 있다고 생각해요.",
    word: "deserve",
    targetKo: "자격이 있다고",
    pronunciation: "디저브",
    practice: ["earn", "worthy"],
  },
  {
    sentence: "I hope the world becomes cleaner.",
    translation: "세상이 더 깨끗해지면 좋겠어요.",
    word: "cleaner",
    targetKo: "더 깨끗해지면",
    pronunciation: "클리너",
    practice: ["clean", "fresh"],
  },
  {
    sentence: "I think patience is important.",
    translation: "나는 인내가 중요하다고 생각해요.",
    word: "patience",
    targetKo: "인내",
    pronunciation: "페이션스",
    practice: ["wait", "calm"],
  },
  {
    sentence: "I believe kindness changes the world.",
    translation: "나는 친절이 세상을 바꾼다고 믿어요.",
    word: "kindness",
    targetKo: "친절",
    pronunciation: "카인드니스",
    practice: ["nice", "generous"],
  },
];

const FIXED_ADVERBS: EnglishEntry[] = [
  {
    sentence: "I always do my homework.",
    translation: "나는 항상 숙제를 해요.",
    word: "always",
    targetKo: "항상",
    pronunciation: "올웨이즈",
    practice: ["never", "sometimes"],
  },
  {
    sentence: "She never eats candy.",
    translation: "그녀는 절대 사탕을 안 먹어요.",
    word: "never",
    targetKo: "절대",
    pronunciation: "네버",
    practice: ["always", "sometimes"],
  },
  {
    sentence: "I sometimes play soccer.",
    translation: "나는 가끔 축구를 해요.",
    word: "sometimes",
    targetKo: "가끔",
    pronunciation: "섬타임즈",
    practice: ["always", "never"],
  },
  {
    sentence: "He usually walks to school.",
    translation: "그는 보통 걸어서 학교에 가요.",
    word: "usually",
    targetKo: "보통",
    pronunciation: "유주얼리",
    practice: ["always", "sometimes"],
  },
  {
    sentence: "We often go to the library.",
    translation: "우리는 자주 도서관에 가요.",
    word: "often",
    targetKo: "자주",
    pronunciation: "오픈",
    practice: ["rarely", "sometimes"],
  },
  {
    sentence: "They seldom eat out.",
    translation: "그들은 거의 외식하지 않아요.",
    word: "seldom",
    targetKo: "거의",
    pronunciation: "셀덤",
    practice: ["rarely", "never"],
  },
  {
    sentence: "I already finished my work.",
    translation: "나는 이미 일을 끝냈어요.",
    word: "already",
    targetKo: "이미",
    pronunciation: "올레디",
    practice: ["yet", "still"],
  },
  {
    sentence: "She quickly ran to school.",
    translation: "그녀는 빨리 학교로 달렸어요.",
    word: "quickly",
    targetKo: "빨리",
    pronunciation: "퀵리",
    practice: ["slowly", "fast"],
  },
  {
    sentence: "He carefully wrote his name.",
    translation: "그는 조심히 이름을 썼어요.",
    word: "carefully",
    targetKo: "조심히",
    pronunciation: "케어풀리",
    practice: ["gently", "slowly"],
  },
  {
    sentence: "They happily played together.",
    translation: "그들은 행복하게 함께 놀았어요.",
    word: "happily",
    targetKo: "행복하게",
    pronunciation: "해필리",
    practice: ["gladly", "joyfully"],
  },
  {
    sentence: "I finally finished my homework.",
    translation: "나는 드디어 숙제를 끝냈어요.",
    word: "finally",
    targetKo: "드디어",
    pronunciation: "파이널리",
    practice: ["at last", "eventually"],
  },
  {
    sentence: "She quietly read her book.",
    translation: "그녀는 조용히 책을 읽었어요.",
    word: "quietly",
    targetKo: "조용히",
    pronunciation: "콰이엇리",
    practice: ["silently", "softly"],
  },
  {
    sentence: "We really enjoyed the trip.",
    translation: "우리는 정말 여행을 즐겼어요.",
    word: "really",
    targetKo: "정말",
    pronunciation: "리얼리",
    practice: ["truly", "very"],
  },
  {
    sentence: "He slowly walked home.",
    translation: "그는 천천히 집으로 걸었어요.",
    word: "slowly",
    targetKo: "천천히",
    pronunciation: "슬로리",
    practice: ["quickly", "gently"],
  },
  {
    sentence: "I accidentally dropped my cup.",
    translation: "나는 실수로 컵을 떨어뜨렸어요.",
    word: "accidentally",
    targetKo: "실수로",
    pronunciation: "액시덴털리",
    practice: ["mistake", "oops"],
  },
];

const FIXED_CAN: EnglishEntry[] = [
  {
    sentence: "Can you speak English?",
    translation: "영어를 할 수 있어요?",
    word: "speak",
    targetKo: "할",
    pronunciation: "스피크",
    practice: ["talk", "say"],
  },
  {
    sentence: "Can you play the piano?",
    translation: "피아노를 칠 수 있어요?",
    word: "piano",
    targetKo: "피아노",
    pronunciation: "피아노",
    practice: ["guitar", "violin"],
  },
  {
    sentence: "Can you ride a bicycle?",
    translation: "자전거를 탈 수 있어요?",
    word: "ride",
    targetKo: "탈",
    pronunciation: "라이드",
    practice: ["drive", "pedal"],
  },
  {
    sentence: "Can you cook dinner?",
    translation: "저녁을 만들 수 있어요?",
    word: "dinner",
    targetKo: "저녁",
    pronunciation: "디너",
    practice: ["lunch", "meal"],
  },
  {
    sentence: "Can you swim in the ocean?",
    translation: "바다에서 수영할 수 있어요?",
    word: "ocean",
    targetKo: "바다",
    pronunciation: "오션",
    practice: ["sea", "lake"],
  },
  {
    sentence: "Can you run fast?",
    translation: "빨리 달릴 수 있어요?",
    word: "fast",
    targetKo: "빨리",
    pronunciation: "패스트",
    practice: ["quick", "speed"],
  },
  {
    sentence: "Can you draw animals?",
    translation: "동물을 그릴 수 있어요?",
    word: "draw",
    targetKo: "그릴",
    pronunciation: "드로",
    practice: ["paint", "sketch"],
  },
  {
    sentence: "Can you sing a song?",
    translation: "노래를 부를 수 있어요?",
    word: "song",
    targetKo: "노래",
    pronunciation: "송",
    practice: ["music", "melody"],
  },
  {
    sentence: "Can you count to one hundred?",
    translation: "백까지 셀 수 있어요?",
    word: "count",
    targetKo: "셀",
    pronunciation: "카운트",
    practice: ["number", "add"],
  },
  {
    sentence: "Can you read Korean?",
    translation: "한국어를 읽을 수 있어요?",
    word: "Korean",
    targetKo: "국어",
    pronunciation: "코리안",
    practice: ["English", "language"],
  },
  {
    sentence: "Can you jump high?",
    translation: "높이 점프할 수 있어요?",
    word: "jump",
    targetKo: "점프할",
    pronunciation: "점프",
    practice: ["hop", "leap"],
  },
  {
    sentence: "Can you bake cookies?",
    translation: "쿠키를 구울 수 있어요?",
    word: "bake",
    targetKo: "구울",
    pronunciation: "베이크",
    practice: ["cook", "oven"],
  },
  {
    sentence: "Can you solve this puzzle?",
    translation: "이 퍼즐을 풀 수 있어요?",
    word: "puzzle",
    targetKo: "퍼즐",
    pronunciation: "퍼즐",
    practice: ["solve", "riddle"],
  },
  {
    sentence: "Can you whistle?",
    translation: "휘파람을 불 수 있어요?",
    word: "whistle",
    targetKo: "휘파람",
    pronunciation: "위슬",
    practice: ["blow", "sound"],
  },
  {
    sentence: "Can you climb a tree?",
    translation: "나무에 오를 수 있어요?",
    word: "climb",
    targetKo: "오를",
    pronunciation: "클라임",
    practice: ["up", "tree"],
  },
  {
    sentence: "Can you fly a kite?",
    translation: "연을 날릴 수 있어요?",
    word: "kite",
    targetKo: "연",
    pronunciation: "카이트",
    practice: ["wind", "string"],
  },
  {
    sentence: "Can you make a paper airplane?",
    translation: "종이비행기를 만들 수 있어요?",
    word: "airplane",
    targetKo: "비행기",
    pronunciation: "에어플레인",
    practice: ["paper", "fold"],
  },
  {
    sentence: "Can you skip rope?",
    translation: "줄넘기할 수 있어요?",
    word: "skip",
    targetKo: "줄넘기할",
    pronunciation: "스킵",
    practice: ["jump", "rope"],
  },
];

// ============================================================
// Generator Functions
// ============================================================

/**
 * 번역문에서 '밑줄 칠 낱말'의 실제 표면형을 찾는다.
 *
 * 템플릿이 글로스를 활용해 넣으면(동사 '먹다'→'먹자', 형용사 '큰'→'커요') 사전형 글로스가
 * 번역문에 그대로 남지 않는다. 그 상태로 targetKo 에 사전형을 넣으면 화면에서 밑줄이
 * 아예 그려지지 않아 "밑줄 친 낱말을 보고 고르세요"가 밑줄 없는 문제가 됐다(2026-09-16 실측 43건).
 *
 * 같은 템플릿을 '다른 단어'로 한 번 더 렌더해 두 결과가 갈라지는 구간(=글로스가 들어간 자리)을
 * 찾고, 그 자리를 품은 어절 전체를 밑줄 대상으로 삼는다. 활용형·조사까지 자연스럽게 잡힌다.
 */
export function surfaceForm(tmpl: Tmpl, k: string, translation: string): string | undefined {
  if (translation.includes(k)) return k; // 명사 등 원형이 그대로 쓰인 경우
  // 같은 품사의 다른 단어로 프로브 — 품사가 다르면 템플릿이 다른 활용을 태워 비교가 깨진다.
  const probe = isVerb(k)
    ? k === "가다"
      ? "먹다"
      : "가다"
    : ADJ_PRED[k]
      ? k === "큰"
        ? "작은"
        : "큰"
      : k === "사과"
        ? "가방"
        : "사과";
  let b: string;
  try {
    b = naturalizeKorean(tmpl.t(probe));
  } catch {
    return undefined;
  }
  const a = translation;
  if (a === b) return undefined;
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (
    pre + suf < a.length &&
    b.length - 1 - suf >= pre &&
    a[a.length - 1 - suf] === b[b.length - 1 - suf]
  )
    suf++;
  const end = a.length - suf;
  if (end <= pre) return undefined;
  // 슬롯을 포함한 어절 전체로 확장 후 문장부호 제거
  const spaceBefore = a.lastIndexOf(" ", pre);
  const start = spaceBefore === -1 ? 0 : spaceBefore + 1;
  let stop = a.indexOf(" ", end);
  if (stop === -1) stop = a.length;
  const surface = a.slice(start, stop).replace(/[.!?,~]+$/u, "").trim();
  return surface && a.includes(surface) ? surface : undefined;
}

function makeEntry(word: W, tmpl: Tmpl, unit?: string): EnglishEntry {
  const translation = naturalizeKorean(tmpl.t(word.k));
  const entry: EnglishEntry = {
    sentence: tmpl.s(word.w),
    translation,
    word: word.w,
    pronunciation: word.p,
    practice: word.pr,
    // 밑줄 대상은 '번역문에 실제로 존재하는 문자열'이어야 한다 — 없으면 아예 넣지 않는다.
    targetKo: surfaceForm(tmpl, word.k, translation),
  };
  if (unit) entry.unit = unit;
  return entry;
}

// ============================================================
// POS-aware template routing
// 단어 글로스의 품사에 따라 자동으로 알맞은 템플릿 풀을 고른다.
// 형용사(관형사형 글로스)를 명사 슬롯에 넣어 "큰을(를) 봐요"가 되거나
// 동사 사전형을 그대로 써 "밀다 것을"이 되던 비문을 근본 차단한다.
// 분류 규칙: k가 "다"로 끝나면 동사, ADJ_PRED에 있으면 형용사(감정/서술),
// 그 외는 명사 → 호출부가 넘긴 templates(명사용)를 그대로 사용.
// ============================================================

function adjPred(k: string): string {
  return ADJ_PRED[k]?.p ?? k;
}

type POS = "verb" | "person" | "thing" | "weather" | "noun";

function classifyPOS(k: string): POS {
  if (isVerb(k)) return "verb";
  const a = ADJ_PRED[k];
  if (a) return a.cat;
  return "noun";
}

// 동사: 안전 활용형(청유 ~자 / 관형사형 ~는 / 희망 ~고 싶어요)만 사용 → 불규칙 회피
const VERB_TEMPLATES: Tmpl[] = [
  { s: (w) => `Let's ${w}!`, t: (k) => `같이 ${verbPropositive(k)}!` },
  {
    s: (w) => `I like to ${w}.`,
    t: (k) => `나는 ${verbAttributive(k)} 것을 좋아해요.`,
  },
  {
    s: (w) => `Do you like to ${w}?`,
    t: (k) => `${verbAttributive(k)} 것을 좋아해요?`,
  },
  { s: (w) => `I want to ${w}.`, t: (k) => `나는 ${verbWantTo(k)}.` },
];

// 서술 형용사(사물 주어): 해요체 술어
const ADJ_DESC_TEMPLATES: Tmpl[] = [
  { s: (w) => `It is ${w}.`, t: (k) => `그것은 ${adjPred(k)}.` },
  { s: (w) => `This is very ${w}.`, t: (k) => `이것은 정말 ${adjPred(k)}.` },
  { s: (w) => `It is so ${w}!`, t: (k) => `정말 ${adjPred(k)}!` },
  { s: (w) => `Is it ${w}?`, t: (k) => `그것은 ${adjPred(k)}?` },
];

// 감정/성격/신체상태(사람 주어): 해요체 술어
const ADJ_EMO_TEMPLATES: Tmpl[] = [
  { s: (w) => `I am ${w}.`, t: (k) => `나는 ${adjPred(k)}.` },
  { s: (w) => `I feel ${w} today.`, t: (k) => `나는 오늘 ${adjPred(k)}.` },
  { s: (w) => `My friend is ${w}.`, t: (k) => `내 친구는 ${adjPred(k)}.` },
  { s: (w) => `Are you ${w}?`, t: (k) => `${adjPred(k)}?` },
];

// 날씨(사물 주어 없이 "오늘은/밖에" 프레임) — 절기성 술어(비가 와요)도 자연스럽게
const ADJ_WEATHER_TEMPLATES: Tmpl[] = [
  { s: (w) => `It is ${w} today.`, t: (k) => `오늘은 ${adjPred(k)}.` },
  { s: (w) => `It is so ${w}!`, t: (k) => `정말 ${adjPred(k)}!` },
  { s: (w) => `Is it ${w} outside?`, t: (k) => `밖에 ${adjPred(k)}?` },
];

function poolFor(pos: POS, fallback: Tmpl[]): Tmpl[] {
  switch (pos) {
    case "verb":
      return VERB_TEMPLATES;
    case "person":
      return ADJ_EMO_TEMPLATES;
    case "thing":
      return ADJ_DESC_TEMPLATES;
    case "weather":
      return ADJ_WEATHER_TEMPLATES;
    default:
      return fallback;
  }
}

function generateFromBank(
  rng: () => number,
  words: W[],
  templates: Tmpl[],
  entriesPerWord: number = 2,
  unit?: string,
): EnglishEntry[] {
  const entries: EnglishEntry[] = [];
  for (const word of words) {
    const pool = poolFor(classifyPOS(word.k), templates);
    const used = new Set<number>();
    for (let i = 0; i < entriesPerWord && i < pool.length; i++) {
      let idx: number;
      do {
        idx = Math.floor(rng() * pool.length);
      } while (used.has(idx) && used.size < pool.length);
      used.add(idx);
      entries.push(makeEntry(word, pool[idx], unit));
    }
  }
  return entries;
}

function generateGrade3_4Entries(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // Greetings (direct sentences) → "인사와 소개"
  for (const g of G34_GREETINGS) {
    entries.push({
      sentence: `${g.w.charAt(0).toUpperCase() + g.w.slice(1)}.`,
      translation: `${g.k}.`,
      word: g.w,
      targetKo: g.k,
      pronunciation: g.p,
      practice: g.pr,
      unit: "인사와 소개",
    });
  }

  // Colors - 2 templates each → "숫자와 색깔"
  entries.push(
    ...generateFromBank(rng, G34_COLORS, BASIC_TEMPLATES, 2, "숫자와 색깔"),
  );
  // Numbers → "숫자와 색깔"
  for (const n of G34_NUMBERS) {
    const items = [
      "apples",
      "books",
      "pencils",
      "friends",
      "toys",
      "balls",
      "cats",
      "dogs",
    ];
    const itemsK = [
      "개의 사과가",
      "권의 책이",
      "개의 연필이",
      "명의 친구가",
      "개의 장난감이",
      "개의 공이",
      "마리의 고양이가",
      "마리의 강아지가",
    ];
    // 서수(첫 번째)·0(영)은 수관형사 자리에 넣으면 "첫 번째 마리의 강아지가", "영 개의 사과가"
    // 같은 비문이 된다(2026-09-16 실측) → 각자 맞는 문장으로 따로 낸다.
    if (n.k === "첫 번째") {
      entries.push({
        sentence: `I am the ${n.w} in line.`,
        translation: `나는 줄에서 첫 번째예요.`,
        word: n.w,
        pronunciation: n.p,
        practice: n.pr,
        targetKo: "첫 번째",
        unit: "숫자와 색깔",
      });
      continue;
    }
    if (n.k === "영") {
      entries.push({
        sentence: `I have ${n.w} apples.`,
        translation: `나는 사과가 하나도 없어요.`,
        word: n.w,
        pronunciation: n.p,
        practice: n.pr,
        targetKo: "하나도 없어요",
        unit: "숫자와 색깔",
      });
      continue;
    }
    const idx = Math.floor(rng() * items.length);
    entries.push({
      sentence: `I have ${n.w} ${items[idx]}.`,
      translation: `나는 ${toCounterForm(n.k)} ${itemsK[idx]} 있어요.`,
      word: n.w,
      pronunciation: n.p,
      practice: n.pr,
      // 밑줄 대상은 번역문에 실제로 쓰인 수관형사("둘"이 아니라 "두")
      targetKo: toCounterForm(n.k),
      unit: "숫자와 색깔",
    });
  }

  // Animals - 2 templates → "동물과 자연"
  entries.push(
    ...generateFromBank(rng, G34_ANIMALS, BASIC_TEMPLATES, 2, "동물과 자연"),
  );
  // Family - 2 templates → "가족과 신체"
  entries.push(
    ...generateFromBank(rng, G34_FAMILY, FAMILY_TEMPLATES, 2, "가족과 신체"),
  );
  // Food - 2 templates → "음식과 맛"
  entries.push(
    ...generateFromBank(rng, G34_FOOD, BASIC_TEMPLATES, 2, "음식과 맛"),
  );
  // Body - 2 templates → "가족과 신체"
  entries.push(
    ...generateFromBank(rng, G34_BODY, BASIC_TEMPLATES, 2, "가족과 신체"),
  );
  // Daily actions - 2 templates → "일상표현"
  entries.push(
    ...generateFromBank(rng, G34_DAILY, ACTION_TEMPLATES, 2, "일상표현"),
  );
  // School items - 2 templates → "학교생활"
  entries.push(
    ...generateFromBank(rng, G34_SCHOOL, BASIC_TEMPLATES, 2, "학교생활"),
  );
  // Adjectives - 2 templates (general, no unit)
  entries.push(...generateFromBank(rng, G34_ADJECTIVES, BASIC_TEMPLATES, 2));
  // Clothing - 2 templates (general, no unit)
  const clothingTmpls: Tmpl[] = [
    { s: (w) => `I wear ${w}.`, t: (k) => `나는 ${k}을(를) 입어요.` },
    { s: (w) => `This ${w} is nice.`, t: (k) => `이 ${k}은(는) 멋져요.` },
    { s: (w) => `Put on your ${w}.`, t: (k) => `${k}을(를) 입으세요.` },
    { s: (w) => `I like this ${w}.`, t: (k) => `나는 이 ${k}이(가) 좋아요.` },
    { s: (w) => `Where are my ${w}?`, t: (k) => `내 ${k}이(가) 어디 있어요?` },
  ];
  entries.push(...generateFromBank(rng, G34_CLOTHING, clothingTmpls, 2));
  // Transport → "교통과 이동"
  const transportTmpls: Tmpl[] = [
    { s: (w) => `I go by ${w}.`, t: (k) => `나는 ${k}로 가요.` },
    { s: (w) => `This is a ${w}.`, t: (k) => `이것은 ${k}이에요.` },
    { s: (w) => `I ride the ${w}.`, t: (k) => `나는 ${k}을(를) 타요.` },
    { s: (w) => `The ${w} is fast.`, t: (k) => `${k}은(는) 빨라요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_TRANSPORT, transportTmpls, 2, "교통과 이동"),
  );
  // Nature → "동물과 자연"
  const natureTmpls: Tmpl[] = [
    { s: (w) => `I see the ${w}.`, t: (k) => `나는 ${k}을(를) 봐요.` },
    { s: (w) => `The ${w} is beautiful.`, t: (k) => `${k}은(는) 아름다워요.` },
    { s: (w) => `Look at the ${w}!`, t: (k) => `${k}을(를) 봐요!` },
    { s: (w) => `I like the ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_NATURE, natureTmpls, 2, "동물과 자연"),
  );
  // Positions → "위치와 장소"
  for (const pos of G34_POSITIONS) {
    entries.push(makeEntry(pos, pickOne(rng, BASIC_TEMPLATES), "위치와 장소"));
  }
  // House items (general, no unit)
  entries.push(...generateFromBank(rng, G34_HOUSE, BASIC_TEMPLATES, 2));
  // Commands (general, no unit)
  entries.push(...FIXED_COMMANDS);

  // Phonics → "파닉스"
  const phonicsTmpls: Tmpl[] = [
    { s: (w) => `This is a ${w}.`, t: (k) => `이것은 ${k}이에요.` },
    { s: (w) => `I see a ${w}.`, t: (k) => `나는 ${k}을(를) 봐요.` },
    { s: (w) => `The ${w} is here.`, t: (k) => `${k}이(가) 여기 있어요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_PHONICS, phonicsTmpls, 2, "파닉스"),
  );

  // Daily routine → "일과표현"
  const routineTmpls: Tmpl[] = [
    { s: (w) => `I ${w} every day.`, t: (k) => `나는 매일 ${k}.` },
    { s: (w) => `Do you ${w}?`, t: (k) => `${k} 해요?` },
    { s: (w) => `I like to ${w}.`, t: (k) => `나는 ${k} 것을 좋아해요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_DAILY_ROUTINE, routineTmpls, 2, "일과표현"),
  );

  // Common expressions → "일상표현"
  for (const expr of G34_COMMON_EXPRESSIONS) {
    entries.push({
      sentence: `${expr.w.charAt(0).toUpperCase() + expr.w.slice(1)}.`,
      translation: `${expr.k}.`,
      word: expr.w,
      targetKo: expr.k,
      pronunciation: expr.p,
      practice: expr.pr,
      unit: "일상표현",
    });
  }

  // Shapes → "모양과 도형"
  const shapeTmpls: Tmpl[] = [
    { s: (w) => `This is a ${w}.`, t: (k) => `이것은 ${k}이에요.` },
    { s: (w) => `I see a ${w}.`, t: (k) => `나는 ${k}을(를) 봐요.` },
    { s: (w) => `Draw a ${w}.`, t: (k) => `${k}을(를) 그려요.` },
    { s: (w) => `The ${w} is big.`, t: (k) => `${k}이(가) 커요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_SHAPES, shapeTmpls, 2, "모양과 도형"),
  );

  // Toys → "놀이와 장난감"
  const toyTmpls: Tmpl[] = [
    { s: (w) => `I play with the ${w}.`, t: (k) => `나는 ${k}으로 놀아요.` },
    { s: (w) => `This is my ${w}.`, t: (k) => `이것은 내 ${k}이에요.` },
    { s: (w) => `I like the ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    { s: (w) => `Can I have the ${w}?`, t: (k) => `${k}을(를) 가져도 될까요?` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_TOYS, toyTmpls, 2, "놀이와 장난감"),
  );

  // Materials → "재료와 물질"
  entries.push(
    ...generateFromBank(rng, G34_MATERIALS, BASIC_TEMPLATES, 2, "재료와 물질"),
  );

  // Questions → "질문과 대답"
  for (const q of G34_QUESTIONS) {
    entries.push({
      sentence: `${q.w.charAt(0).toUpperCase() + q.w.slice(1)}.`,
      translation: `${q.k}.`,
      word: q.w,
      targetKo: q.k,
      pronunciation: q.p,
      practice: q.pr,
      unit: "질문과 대답",
    });
  }

  // Weather (basic) → "날씨"
  entries.push(
    ...generateFromBank(rng, G34_WEATHER_BASIC, BASIC_TEMPLATES, 2, "날씨"),
  );

  // Sports → "운동과 스포츠"
  const sportTmpls: Tmpl[] = [
    { s: (w) => `I like ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    { s: (w) => `Let's play ${w}!`, t: (k) => `같이 ${k} 하자!` },
    { s: (w) => `${w} is fun.`, t: (k) => `${k}은(는) 재미있어요.` },
    { s: (w) => `I am good at ${w}.`, t: (k) => `나는 ${k}을(를) 잘해요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_SPORTS, sportTmpls, 2, "운동과 스포츠"),
  );

  // Emotions (basic) → "감정표현"
  entries.push(
    ...generateFromBank(
      rng,
      G34_EMOTIONS_BASIC,
      EMOTION_TEMPLATES,
      2,
      "감정표현",
    ),
  );

  // Fruits & Vegetables → "과일과 채소"
  entries.push(
    ...generateFromBank(rng, G34_FRUITS_VEG, BASIC_TEMPLATES, 2, "과일과 채소"),
  );

  // Music → "음악과 악기"
  const musicTmpls: Tmpl[] = [
    { s: (w) => `I play the ${w}.`, t: (k) => `나는 ${k}을(를) 연주해요.` },
    { s: (w) => `I like the ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    {
      s: (w) => `The ${w} sounds beautiful.`,
      t: (k) => `${k} 소리가 아름다워요.`,
    },
    {
      s: (w) => `Can you play the ${w}?`,
      t: (k) => `${k}을(를) 연주할 수 있어요?`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G34_MUSIC, musicTmpls, 2, "음악과 악기"),
  );

  // Seasons (basic) → "날씨와 계절"
  entries.push(
    ...generateFromBank(
      rng,
      G34_SEASONS_BASIC,
      BASIC_TEMPLATES,
      2,
      "날씨와 계절",
    ),
  );

  // Classroom → "학교생활"
  entries.push(
    ...generateFromBank(rng, G34_CLASSROOM, BASIC_TEMPLATES, 2, "학교생활"),
  );

  // Shopping → "쇼핑과 돈"
  const shoppingTmpls: Tmpl[] = [
    { s: (w) => `I need ${w}.`, t: (k) => `나는 ${k}이(가) 필요해요.` },
    { s: (w) => `How much is the ${w}?`, t: (k) => `${k}은(는) 얼마예요?` },
    { s: (w) => `I want to ${w}.`, t: (k) => `나는 ${k}고 싶어요.` },
    { s: (w) => `The ${w} is here.`, t: (k) => `${k}이(가) 여기 있어요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_SHOPPING, shoppingTmpls, 2, "쇼핑과 돈"),
  );

  // Cooking → "요리와 맛"
  const cookingTmpls: Tmpl[] = [
    { s: (w) => `I like to ${w}.`, t: (k) => `나는 ${k} 것을 좋아해요.` },
    { s: (w) => `Let's ${w}!`, t: (k) => `같이 ${k}!` },
    { s: (w) => `This is ${w}.`, t: (k) => `이것은 ${k}이에요.` },
    { s: (w) => `I can ${w}.`, t: (k) => `나는 ${k} 수 있어요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_COOKING, cookingTmpls, 2, "요리와 맛"),
  );

  // Holidays → "축제와 행사"
  const holidayTmpls: Tmpl[] = [
    { s: (w) => `I love ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    { s: (w) => `${w} is fun!`, t: (k) => `${k}은(는) 재미있어요!` },
    { s: (w) => `We celebrate ${w}.`, t: (k) => `우리는 ${k}을(를) 축하해요.` },
    { s: (w) => `Do you like ${w}?`, t: (k) => `${k}을(를) 좋아해요?` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_HOLIDAYS, holidayTmpls, 2, "축제와 행사"),
  );

  // Insects → "곤충과 벌레"
  const insectTmpls: Tmpl[] = [
    { s: (w) => `I see a ${w}.`, t: (k) => `나는 ${k}을(를) 봐요.` },
    { s: (w) => `The ${w} is small.`, t: (k) => `${k}은(는) 작아요.` },
    { s: (w) => `Look at the ${w}!`, t: (k) => `${k}을(를) 봐요!` },
    {
      s: (w) => `There is a ${w} here.`,
      t: (k) => `여기에 ${k}이(가) 있어요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G34_INSECTS, insectTmpls, 2, "곤충과 벌레"),
  );

  // Occupations (basic) → "직업"
  const occupationTmpls: Tmpl[] = [
    {
      s: (w) => `I want to be a ${w}.`,
      t: (k) => `나는 ${k}이(가) 되고 싶어요.`,
    },
    { s: (w) => `My dad is a ${w}.`, t: (k) => `우리 아빠는 ${k}이에요.` },
    {
      s: (w) => `The ${w} helps people.`,
      t: (k) => `${k}은(는) 사람들을 도와요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G34_OCCUPATIONS_BASIC, occupationTmpls, 2, "직업"),
  );

  // Furniture → "가구와 집"
  entries.push(
    ...generateFromBank(rng, G34_FURNITURE, BASIC_TEMPLATES, 2, "가구와 집"),
  );

  // Extra feelings → "감정표현"
  entries.push(
    ...generateFromBank(
      rng,
      G34_FEELINGS_EXTRA,
      EMOTION_TEMPLATES,
      2,
      "감정표현",
    ),
  );

  // Places (basic) → "위치와 장소"
  entries.push(
    ...generateFromBank(
      rng,
      G34_PLACES_BASIC,
      BASIC_TEMPLATES,
      2,
      "위치와 장소",
    ),
  );

  // Extra verbs → "동작과 행동"
  entries.push(
    ...generateFromBank(
      rng,
      G34_VERBS_EXTRA,
      ACTION_TEMPLATES,
      2,
      "동작과 행동",
    ),
  );

  // Opposites → "반대말"
  const oppositeTmpls: Tmpl[] = [
    { s: (w) => `It is ${w}.`, t: (k) => `${k}이에요.` },
    { s: (w) => `This is very ${w}.`, t: (k) => `이것은 매우 ${k}.` },
    { s: (w) => `The ball is ${w}.`, t: (k) => `공은 ${k}.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_OPPOSITES, oppositeTmpls, 2, "반대말"),
  );

  // Time (basic) → "시간표현"
  const timeBasicTmpls: Tmpl[] = [
    { s: (w) => `I study in the ${w}.`, t: (k) => `나는 ${k}에 공부해요.` },
    { s: (w) => `It is ${w}.`, t: (k) => `${k}이에요.` },
    { s: (w) => `I will come ${w}.`, t: (k) => `${k} 올게요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G34_TIME_BASIC, timeBasicTmpls, 2, "시간표현"),
  );

  // Containers → "물건과 용기"
  entries.push(
    ...generateFromBank(rng, G34_CONTAINERS, BASIC_TEMPLATES, 2, "물건과 용기"),
  );

  // Dialogue entries for Grade 3-4
  for (const d of DIALOGUES.filter((dl) => dl.grade === "3-4")) {
    entries.push({
      sentence: `${d.speaker1} / ${d.speaker2}`,
      translation: `${d.translation1} / ${d.translation2}`,
      word: d.missingPart,
      pronunciation: "",
      practice: [],
      unit: d.unit || "대화표현",
    });
  }

  // Word ordering entries for Grade 3-4
  for (const wo of WORD_ORDERS.filter((w) => w.grade === "3-4")) {
    entries.push({
      sentence: wo.correct,
      translation: wo.translation,
      word: wo.words[0],
      pronunciation: "",
      practice: wo.words.slice(1),
      unit: wo.unit || "문장만들기",
    });
  }

  // Sentence completion entries for Grade 3-4
  for (const sc of SENTENCE_COMPLETIONS.filter((s) => s.grade === "3-4")) {
    entries.push({
      sentence: sc.sentence.replace("___", sc.blank),
      translation: sc.translation,
      word: sc.blank,
      pronunciation: "",
      practice: sc.choices.filter((c) => c !== sc.blank),
      unit: sc.unit || "문장완성",
    });
  }

  // Translation entries for Grade 3-4
  for (const tr of TRANSLATIONS.filter((t) => t.grade === "3-4")) {
    entries.push({
      sentence: tr.english,
      translation: tr.korean,
      word: tr.keyWord,
      pronunciation: "",
      practice: [],
      unit: tr.unit || "영작문",
    });
  }

  // Listening entries for Grade 3-4
  for (const le of LISTENING_ENTRIES.filter((l) => l.grade === "3-4")) {
    entries.push({
      sentence: le.sentence,
      translation: le.translation,
      word: le.answer,
      pronunciation: "",
      practice: le.choices.filter((c) => c !== le.answer),
      unit: le.unit || "듣기이해",
    });
  }

  // Picture description entries for Grade 3-4
  for (const pd of PICTURE_DESCRIPTIONS.filter((p) => p.grade === "3-4")) {
    entries.push({
      sentence: pd.scene,
      translation: pd.sceneKr,
      word: pd.answer,
      pronunciation: "",
      practice: pd.choices.filter((c) => c !== pd.answer),
      unit: pd.unit || "그림보고영어",
    });
  }

  return entries;
}

function generateGrade5_6Entries(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // Subjects - 2 templates → "학교와 직업"
  const subjectTmpls: Tmpl[] = [
    { s: (w) => `I like ${w} class.`, t: (k) => `나는 ${k} 수업을 좋아해요.` },
    {
      s: (w) => `${w} is my favorite subject.`,
      t: (k) => `${k}은(는) 내가 가장 좋아하는 과목이에요.`,
    },
    {
      s: (w) => `We study ${w} at school.`,
      t: (k) => `우리는 학교에서 ${k}을(를) 공부해요.`,
    },
    {
      s: (w) => `${w} class is interesting.`,
      t: (k) => `${k} 수업은 재미있어요.`,
    },
    {
      s: (w) => `I have ${w} on Monday.`,
      t: (k) => `월요일에 ${k} 수업이 있어요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_SUBJECTS, subjectTmpls, 2, "학교와 직업"),
  );
  // Weather → "날씨와 자연"
  entries.push(
    ...generateFromBank(rng, G56_WEATHER, WEATHER_TEMPLATES, 2, "날씨와 자연"),
  );
  // Hobbies → "일상과 취미"
  entries.push(
    ...generateFromBank(rng, G56_HOBBIES, HOBBY_TEMPLATES, 2, "일상과 취미"),
  );
  // Places → "위치와 장소"
  entries.push(
    ...generateFromBank(
      rng,
      G56_PLACES,
      INTERMEDIATE_TEMPLATES,
      2,
      "위치와 장소",
    ),
  );
  // Emotions → "감정과 상태"
  entries.push(
    ...generateFromBank(rng, G56_EMOTIONS, EMOTION_TEMPLATES, 2, "감정과 상태"),
  );
  // Time & Days → "시간과 날짜"
  const timeTmpls: Tmpl[] = [
    { s: (w) => `Today is ${w}.`, t: (k) => `오늘은 ${k}이에요.` },
    { s: (w) => `I like ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    { s: (w) => `See you on ${w}.`, t: (k) => `${k}에 만나요.` },
    { s: (w) => `What do you do on ${w}?`, t: (k) => `${k}에 뭐 해요?` },
  ];
  entries.push(...generateFromBank(rng, G56_TIME, timeTmpls, 2, "시간과 날짜"));
  // Seasons & Months → "날씨와 계절"
  const seasonTmpls: Tmpl[] = [
    { s: (w) => `I like ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` },
    { s: (w) => `${w} is beautiful.`, t: (k) => `${k}은(는) 아름다워요.` },
    {
      s: (w) => `My birthday is in ${w}.`,
      t: (k) => `내 생일은 ${k}에 있어요.`,
    },
    {
      s: (w) => `We have a holiday in ${w}.`,
      t: (k) => `${k}에 공휴일이 있어요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_SEASONS, seasonTmpls, 2, "날씨와 계절"),
  );
  // Intermediate adjectives → "비교와 묘사"
  entries.push(
    ...generateFromBank(
      rng,
      G56_INTERMEDIATE_ADJ,
      COMPARISON_TEMPLATES,
      2,
      "비교와 묘사",
    ),
  );
  // Past tense → "과거경험"
  const pastTmpls: Tmpl[] = [
    { s: (w) => `I ${w} yesterday.`, t: (k) => `나는 어제 ${k}.` },
    { s: (w) => `She ${w} last night.`, t: (k) => `그녀는 어젯밤에 ${k}.` },
    { s: (w) => `We ${w} together.`, t: (k) => `우리는 함께 ${k}.` },
    { s: (w) => `He ${w} in the park.`, t: (k) => `그는 공원에서 ${k}.` },
    {
      s: (w) => `They ${w} last weekend.`,
      t: (k) => `그들은 지난 주말에 ${k}.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_PAST_TENSE, pastTmpls, 2, "과거경험"),
  );
  // Jobs → "진로와 직업"
  entries.push(
    ...generateFromBank(rng, G56_JOBS, JOB_TEMPLATES, 2, "진로와 직업"),
  );
  // Technology → "과학과 기술"
  entries.push(
    ...generateFromBank(rng, G56_TECHNOLOGY, BASIC_TEMPLATES, 2, "과학과 기술"),
  );
  // Health → "건강과 운동"
  entries.push(
    ...generateFromBank(rng, G56_HEALTH, BASIC_TEMPLATES, 2, "건강과 운동"),
  );

  // Environment → "환경과 지구"
  const envTmpls: Tmpl[] = [
    {
      s: (w) => `We should care about ${w}.`,
      t: (k) => `우리는 ${k}을(를) 관심가져야 해요.`,
    },
    { s: (w) => `${w} is important.`, t: (k) => `${k}은(는) 중요해요.` },
    { s: (w) => `Let's protect the ${w}.`, t: (k) => `${k}을(를) 보호하자.` },
    {
      s: (w) => `I learned about ${w}.`,
      t: (k) => `나는 ${k}에 대해 배웠어요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_ENVIRONMENT, envTmpls, 2, "환경과 지구"),
  );

  // Travel → "여행과 세계"
  const travelTmpls: Tmpl[] = [
    { s: (w) => `I need a ${w}.`, t: (k) => `나는 ${k}이(가) 필요해요.` },
    { s: (w) => `Where is the ${w}?`, t: (k) => `${k}이(가) 어디에 있어요?` },
    { s: (w) => `I have a ${w}.`, t: (k) => `나는 ${k}이(가) 있어요.` },
    { s: (w) => `The ${w} is ready.`, t: (k) => `${k}이(가) 준비되었어요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G56_TRAVEL, travelTmpls, 2, "여행과 세계"),
  );

  // Science → "과학 탐구"
  const sciTmpls: Tmpl[] = [
    {
      s: (w) => `We studied ${w} in class.`,
      t: (k) => `우리는 수업에서 ${k}을(를) 배웠어요.`,
    },
    { s: (w) => `${w} is interesting.`, t: (k) => `${k}은(는) 흥미로워요.` },
    {
      s: (w) => `I learned about ${w}.`,
      t: (k) => `나는 ${k}에 대해 배웠어요.`,
    },
    { s: (w) => `The ${w} was amazing.`, t: (k) => `${k}은(는) 놀라웠어요.` },
  ];
  entries.push(...generateFromBank(rng, G56_SCIENCE, sciTmpls, 2, "과학 탐구"));

  // Community → "사회와 공동체"
  const commTmpls: Tmpl[] = [
    {
      s: (w) => `${w} is important for everyone.`,
      t: (k) => `${k}은(는) 모두에게 중요해요.`,
    },
    { s: (w) => `I respect the ${w}.`, t: (k) => `나는 ${k}을(를) 존중해요.` },
    { s: (w) => `We need ${w}.`, t: (k) => `우리는 ${k}이(가) 필요해요.` },
    { s: (w) => `The ${w} is great.`, t: (k) => `${k}은(는) 훌륭해요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G56_COMMUNITY, commTmpls, 2, "사회와 공동체"),
  );

  // Media → "미디어와 소통"
  entries.push(
    ...generateFromBank(rng, G56_MEDIA, BASIC_TEMPLATES, 2, "미디어와 소통"),
  );

  // Space → "우주와 과학"
  entries.push(
    ...generateFromBank(rng, G56_SPACE, BASIC_TEMPLATES, 2, "우주와 과학"),
  );

  // Advanced Feelings → "감정과 상태"
  entries.push(
    ...generateFromBank(
      rng,
      G56_FEELINGS_ADV,
      EMOTION_TEMPLATES,
      2,
      "감정과 상태",
    ),
  );

  // Cooking (advanced) → "요리와 음식"
  const cookAdvTmpls: Tmpl[] = [
    { s: (w) => `I learned to ${w}.`, t: (k) => `나는 ${k} 것을 배웠어요.` },
    {
      s: (w) => `We need to ${w} the vegetables.`,
      t: (k) => `채소를 ${k}야 해요.`,
    },
    {
      s: (w) => `The chef will ${w} the sauce.`,
      t: (k) => `셰프가 소스를 ${k} 거예요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_COOKING_ADV, cookAdvTmpls, 2, "요리와 음식"),
  );

  // Literature → "문학과 독서"
  const litTmpls: Tmpl[] = [
    {
      s: (w) => `I read a great ${w}.`,
      t: (k) => `훌륭한 ${k}을(를) 읽었어요.`,
    },
    {
      s: (w) => `The ${w} was interesting.`,
      t: (k) => `${k}이(가) 재미있었어요.`,
    },
    { s: (w) => `I like this ${w}.`, t: (k) => `나는 이 ${k}을(를) 좋아해요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G56_LITERATURE, litTmpls, 2, "문학과 독서"),
  );

  // Geography → "지리와 세계"
  const geoTmpls: Tmpl[] = [
    {
      s: (w) => `I learned about the ${w}.`,
      t: (k) => `${k}에 대해 배웠어요.`,
    },
    { s: (w) => `The ${w} is very large.`, t: (k) => `${k}은(는) 매우 커요.` },
    {
      s: (w) => `Can you find the ${w} on the map?`,
      t: (k) => `지도에서 ${k}을(를) 찾을 수 있어요?`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_GEOGRAPHY, geoTmpls, 2, "지리와 세계"),
  );

  // Math terms → "수학 용어"
  const mathTermTmpls: Tmpl[] = [
    {
      s: (w) => `We studied ${w} today.`,
      t: (k) => `오늘 ${k}을(를) 공부했어요.`,
    },
    {
      s: (w) => `${w} is important in math.`,
      t: (k) => `${k}은(는) 수학에서 중요해요.`,
    },
  ];
  entries.push(
    ...generateFromBank(rng, G56_MATH_TERMS, mathTermTmpls, 2, "수학 용어"),
  );

  // Personality → "성격과 태도"
  const persTempls: Tmpl[] = [
    { s: (w) => `She is very ${w}.`, t: (k) => `그녀는 매우 ${k}.` },
    {
      s: (w) => `I want to be ${w}.`,
      t: (k) => `나는 ${k} 사람이 되고 싶어요.`,
    },
    { s: (w) => `He is a ${w} person.`, t: (k) => `그는 ${k} 사람이에요.` },
  ];
  entries.push(
    ...generateFromBank(rng, G56_PERSONALITY, persTempls, 2, "성격과 태도"),
  );

  // Daily conversation expressions → "일상 대화"
  for (const conv of G56_DAILY_CONVERSATION) {
    entries.push({
      sentence: `${conv.w.charAt(0).toUpperCase() + conv.w.slice(1)}.`,
      translation: `${conv.k}.`,
      word: conv.w,
      targetKo: conv.k,
      pronunciation: conv.p,
      practice: conv.pr,
      unit: "일상 대화",
    });
  }

  // Connectors → "접속사와 부사"
  for (const conn of G56_CONNECTORS) {
    entries.push({
      sentence: `${conn.w.charAt(0).toUpperCase() + conn.w.slice(1)}.`,
      translation: `${conn.k}.`,
      word: conn.w,
      targetKo: conn.k,
      pronunciation: conn.p,
      practice: conn.pr,
      unit: "접속사와 부사",
    });
  }

  // Body systems → "인체와 건강"
  entries.push(
    ...generateFromBank(
      rng,
      G56_BODY_SYSTEMS,
      BASIC_TEMPLATES,
      2,
      "인체와 건강",
    ),
  );

  // Dialogue entries for Grade 5-6
  for (const d of DIALOGUES.filter((dl) => dl.grade === "5-6")) {
    entries.push({
      sentence: `${d.speaker1} / ${d.speaker2}`,
      translation: `${d.translation1} / ${d.translation2}`,
      word: d.missingPart,
      pronunciation: "",
      practice: [],
      unit: d.unit || "대화표현",
    });
  }

  // Word ordering entries for Grade 5-6
  for (const wo of WORD_ORDERS.filter((w) => w.grade === "5-6")) {
    entries.push({
      sentence: wo.correct,
      translation: wo.translation,
      word: wo.words[0],
      pronunciation: "",
      practice: wo.words.slice(1),
      unit: wo.unit || "문장만들기",
    });
  }

  // Sentence completion entries for Grade 5-6
  for (const sc of SENTENCE_COMPLETIONS.filter((s) => s.grade === "5-6")) {
    entries.push({
      sentence: sc.sentence.replace("___", sc.blank),
      translation: sc.translation,
      word: sc.blank,
      pronunciation: "",
      practice: sc.choices.filter((c) => c !== sc.blank),
      unit: sc.unit || "문장완성",
    });
  }

  // Translation entries for Grade 5-6
  for (const tr of TRANSLATIONS.filter((t) => t.grade === "5-6")) {
    entries.push({
      sentence: tr.english,
      translation: tr.korean,
      word: tr.keyWord,
      pronunciation: "",
      practice: [],
      unit: tr.unit || "영작문",
    });
  }

  // Listening entries for Grade 5-6
  for (const le of LISTENING_ENTRIES.filter((l) => l.grade === "5-6")) {
    entries.push({
      sentence: le.sentence,
      translation: le.translation,
      word: le.answer,
      pronunciation: "",
      practice: le.choices.filter((c) => c !== le.answer),
      unit: le.unit || "듣기이해",
    });
  }

  // Picture description entries for Grade 5-6
  for (const pd of PICTURE_DESCRIPTIONS.filter((p) => p.grade === "5-6")) {
    entries.push({
      sentence: pd.scene,
      translation: pd.sceneKr,
      word: pd.answer,
      pronunciation: "",
      practice: pd.choices.filter((c) => c !== pd.answer),
      unit: pd.unit || "그림보고영어",
    });
  }

  // Fixed sentence collections (general, no unit for fixed sentences)
  entries.push(...FIXED_BECAUSE);
  entries.push(...FIXED_IF);
  entries.push(...FIXED_ROUTINE);
  entries.push(...FIXED_SHOULD);
  entries.push(...FIXED_WANT);
  entries.push(...FIXED_OPINION);
  entries.push(...FIXED_ADVERBS);
  entries.push(...FIXED_CAN);

  return entries;
}

// ============================================================
// Main Export
// ============================================================

export function generateEnglishPool(
  grade: number,
  seed: number,
  difficulty: 1 | 2 | 3 = 2,
): EnglishEntry[] {
  // Grades 1-2 don't have English curriculum
  if (grade <= 2) {
    return [];
  }

  const rng = seededRandom(seed);

  let pool: EnglishEntry[];

  if (grade <= 4) {
    pool = generateGrade3_4Entries(rng);
  } else {
    pool = generateGrade5_6Entries(rng);
  }

  // Filter by difficulty
  if (difficulty === 1) {
    // Easy: short words (≤5 chars) and basic topics (greetings, colors, numbers)
    const easyTopics = new Set([
      "인사와 소개",
      "숫자와 색깔",
      "가족과 신체",
      "동물과 자연",
      "학교생활",
      "파닉스",
      "모양과 도형",
      "놀이와 장난감",
      "날씨",
      "운동과 스포츠",
      "과일과 채소",
      "날씨와 계절",
      "곤충과 벌레",
      "직업",
      "가구와 집",
      "위치와 장소",
      "반대말",
      "시간표현",
      "물건과 용기",
      "대화표현",
      "문장만들기",
    ]);
    const filtered = pool.filter((entry) => {
      const wordLen = entry.word.split(/\s+/)[0].length; // first word length
      const isShort = wordLen <= 5;
      const isEasyTopic = entry.unit ? easyTopics.has(entry.unit) : false;
      return isShort || isEasyTopic;
    });
    if (filtered.length > 0) pool = filtered;
  } else if (difficulty === 3) {
    // Hard: longer words (>5 chars) and complex topics (science, environment, feelings)
    const hardTopics = new Set([
      "과학과 기술",
      "환경과 지구",
      "감정과 상태",
      "과거경험",
      "비교와 묘사",
      "사회와 공동체",
      "미디어와 소통",
      "우주와 과학",
      "과학 탐구",
      "여행과 세계",
      "진로와 직업",
      "요리와 음식",
      "문학과 독서",
      "지리와 세계",
      "수학 용어",
      "성격과 태도",
      "접속사와 부사",
      "인체와 건강",
      "영작문",
      "듣기이해",
      "그림보고영어",
    ]);
    const filtered = pool.filter((entry) => {
      const wordLen = entry.word.split(/\s+/)[0].length;
      const isLong = wordLen > 5;
      const isHardTopic = entry.unit ? hardTopics.has(entry.unit) : false;
      return isLong || isHardTopic;
    });
    if (filtered.length > 0) pool = filtered;
  }
  // difficulty === 2: no filtering (current behavior)

  // Shuffle the pool
  pool = shuffle(rng, pool);

  return pool;
}
