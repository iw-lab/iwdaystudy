/**
 * Procedural Math Problem Generator
 * Generates grade-appropriate math problems algorithmically.
 * Combined with static data, this provides effectively unlimited math content.
 */
import type { MathEntry } from "@/types/curriculum";
import { naturalizeKorean, hasBatchim, withJosa } from "@/lib/korean-josa";

// 이름 뒤 주격조사 이/가를 받침 기준으로(연필이·사과가·상자가) — 하드코딩 "가"/"이" 비문 방지
const iGa = (w: string) => `${w}${hasBatchim(w.slice(-1)) ? "이" : "가"}`;
// 이름 뒤 보조사 은/는을 받침 기준으로(지영은·서연은·민수는) — 하드코딩 "는" 비문 방지
const eunNeun = (w: string) => `${w}${hasBatchim(w.slice(-1)) ? "은" : "는"}`;
// 이름 뒤 접속조사 과/와를 받침 기준으로(남학생과·사과와) — 하드코딩 "과" 비문 방지
const gwaWa = (w: string) => `${w}${hasBatchim(w.slice(-1)) ? "과" : "와"}`;

// Seeded PRNG for reproducible generation
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function gcdCalc(a: number, b: number): number {
  return b === 0 ? a : gcdCalc(b, a % b);
}

function lcmCalc(a: number, b: number): number {
  return (a * b) / gcdCalc(a, b);
}

// ============================================================
// Grade 1: 0~100, basic addition/subtraction, shapes
// ============================================================
function generateGrade1Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
  // 1학년은 MATH_UNIT_SEQUENCE상 "한 자리 덧셈/뺄셈·뛰어 세기·수의 크기 비교"가
  // 1·2학기 모두 동일하게 반복 학습되므로(주차만 다름) semester로 유형을 가를 필요가 없다.
  // 시그니처만 다른 학년과 통일해 둔다(선택적 매개변수 — 기존 호출 호환).
  semester: 1 | 2 = 1,
): MathEntry {
  void semester;
  const type = pickOne(rng, [
    "addition",
    "addition",
    "addition",
    "subtraction",
    "subtraction",
    "counting",
    "counting3",
    "comparison",
    "comparison_symbol",
    // New types
    "word_problem_add",
    "word_problem_sub",
    "ordering",
    "shape_identify",
    "pattern_find",
    "size_compare_visual",
    "number_decompose",
    "missing_number",
  ]);

  // Difficulty-based ranges for Grade 1
  const addMax = difficulty === 1 ? 5 : difficulty === 3 ? 18 : 9;
  const compMax = difficulty === 1 ? 20 : difficulty === 3 ? 99 : 50;
  const countMax = difficulty === 1 ? 15 : difficulty === 3 ? 80 : 40;

  if (type === "addition") {
    const a = randInt(rng, 1, addMax);
    const b = randInt(rng, 1, difficulty === 3 ? 18 - a : addMax);
    const bClamped = Math.max(1, b);
    if (difficulty === 3) {
      // Hard: word problem with carry situations
      const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
      return {
        type: "addition",
        expression: `${iGa(items)} ${a}개 있었는데 ${bClamped}개를 더 받았습니다. 모두 몇 개?`,
        answer: a + bClamped,
        steps: [
          `${withJosa(String(a), "과/와")} ${withJosa(String(bClamped), "을/를")} 더합니다`,
          `${a} + ${bClamped} = ${a + bClamped}`,
        ],
        unit: "한 자리 덧셈",
        numbers: [a, bClamped],
        hasCarry: a + bClamped >= 10,
      };
    }
    return {
      type: "addition",
      expression: `${a} + ${bClamped} = ?`,
      answer: a + bClamped,
      steps: [
        `${withJosa(String(a), "과/와")} ${withJosa(String(bClamped), "을/를")} 더합니다`,
        `${a} + ${bClamped} = ${a + bClamped}`,
      ],
      unit: "한 자리 덧셈",
      numbers: [a, bClamped],
      hasCarry: a + bClamped >= 10,
    };
  } else if (type === "subtraction") {
    const maxVal = difficulty === 1 ? 5 : difficulty === 3 ? 18 : 9;
    const b = randInt(rng, 1, maxVal);
    const a = randInt(rng, b, maxVal);
    if (difficulty === 3) {
      const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
      return {
        type: "subtraction",
        expression: `${iGa(items)} ${a}개 있었는데 ${b}개를 먹었습니다. 남은 것은?`,
        answer: a - b,
        steps: [`${a}에서 ${withJosa(String(b), "을/를")} 뺍니다`, `${a} - ${b} = ${a - b}`],
        unit: "한 자리 뺄셈",
        numbers: [a, b],
        hasBorrow: a >= 10 && a % 10 < b % 10,
      };
    }
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${withJosa(String(b), "을/를")} 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "한 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: false,
    };
  } else if (type === "counting") {
    const start = randInt(rng, 1, countMax);
    const skip =
      difficulty === 1 ? pickOne(rng, [2, 5]) : pickOne(rng, [2, 5, 10]);
    const count =
      difficulty === 1
        ? randInt(rng, 2, 3)
        : difficulty === 3
          ? randInt(rng, 4, 7)
          : randInt(rng, 3, 5);
    const answer = start + skip * count;
    return {
      type: "counting",
      expression: `${start}부터 ${skip}씩 ${count}번 뛰어 세면?`,
      answer,
      steps: Array.from({ length: count + 1 }, (_, i) => `${start + skip * i}`),
      unit: "뛰어 세기",
      numbers: [start, skip, count],
    };
  } else if (type === "counting3") {
    // 3씩 뛰어세기
    const start = randInt(
      rng,
      1,
      difficulty === 1 ? 10 : difficulty === 3 ? 50 : 30,
    );
    const count =
      difficulty === 1
        ? randInt(rng, 2, 3)
        : difficulty === 3
          ? randInt(rng, 5, 8)
          : randInt(rng, 3, 6);
    const answer = start + 3 * count;
    return {
      type: "counting",
      expression: `${start}부터 3씩 ${count}번 뛰어 세면?`,
      answer,
      steps: Array.from({ length: count + 1 }, (_, i) => `${start + 3 * i}`),
      unit: "뛰어 세기",
      numbers: [start, 3, count],
    };
  } else if (type === "comparison_symbol") {
    // 수 비교 (>, <, =) with visual descriptions
    const a = randInt(rng, 1, compMax);
    const b = randInt(rng, 1, compMax);
    const symbol = a > b ? ">" : a < b ? "<" : "=";
    const answerNum = a > b ? 1 : a < b ? 2 : 0;
    const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
    return {
      type: "comparison",
      expression: `${iGa(items)} ${a}개, 귤이 ${b}개 있습니다. 더 많은 것은? (1: ${items}, 2: 귤, 0: 같음)`,
      answer: answerNum,
      steps: [
        `${a} ${symbol} ${b}`,
        answerNum === 1
          ? `${iGa(items)} 더 많습니다`
          : answerNum === 2
            ? `귤이 더 많습니다`
            : `같습니다`,
      ],
      unit: "수의 크기 비교",
      numbers: [a, b],
    };
  } else if (type === "word_problem_add") {
    // 서술형 덧셈
    const aMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9;
    const a = randInt(rng, 1, aMax);
    const b = randInt(rng, 1, aMax);
    const scenario = pickOne(rng, [
      {
        place: "놀이터에서",
        item: "친구",
        verb: "만났습니다",
        a_desc: "먼저 와 있던",
        b_desc: "나중에 온",
      },
      {
        place: "교실에서",
        item: "색연필",
        verb: "찾았습니다",
        a_desc: "책상 위의",
        b_desc: "서랍 속의",
      },
      {
        place: "정원에서",
        item: "나비",
        verb: "보았습니다",
        a_desc: "꽃 위의",
        b_desc: "풀 위의",
      },
      {
        place: "수족관에서",
        item: "물고기",
        verb: "세었습니다",
        a_desc: "빨간",
        b_desc: "파란",
      },
    ]);
    return {
      type: "addition",
      expression: `${scenario.place} ${scenario.a_desc} ${withJosa(String(scenario.item), "이/가")} ${a}마리, ${scenario.b_desc} ${withJosa(String(scenario.item), "이/가")} ${b}마리 있습니다. 모두 몇 마리?`,
      answer: a + b,
      steps: [
        `${scenario.a_desc} ${a}마리와 ${scenario.b_desc} ${b}마리를 더합니다`,
        `${a} + ${b} = ${a + b}`,
      ],
      unit: "서술형 덧셈",
      numbers: [a, b],
      hasCarry: a + b >= 10,
    };
  } else if (type === "word_problem_sub") {
    // 서술형 뺄셈
    const maxVal = difficulty === 1 ? 9 : difficulty === 3 ? 18 : 12;
    const a = randInt(rng, 3, maxVal);
    const b = randInt(rng, 1, a - 1);
    const scenario = pickOne(rng, [
      { item: "쿠키", verb: "먹었습니다" },
      { item: "풍선", verb: "터뜨렸습니다" },
      { item: "스티커", verb: "친구에게 주었습니다" },
      { item: "사탕", verb: "동생에게 나눠주었습니다" },
    ]);
    return {
      type: "subtraction",
      expression: `${withJosa(String(scenario.item), "이/가")} ${a}개 있었는데 ${b}개를 ${scenario.verb} 남은 것은 몇 개?`,
      answer: a - b,
      steps: [`${a}개에서 ${b}개를 빼면 됩니다`, `${a} - ${b} = ${a - b}`],
      unit: "서술형 뺄셈",
      numbers: [a, b],
      hasBorrow: false,
    };
  } else if (type === "ordering") {
    // 순서배열 - 수를 크기 순으로 나열
    const numCount = difficulty === 1 ? 3 : difficulty === 3 ? 5 : 4;
    const rangeMax = difficulty === 1 ? 20 : difficulty === 3 ? 99 : 50;
    const nums: number[] = [];
    while (nums.length < numCount) {
      const n = randInt(rng, 1, rangeMax);
      if (!nums.includes(n)) nums.push(n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const ascending = rng() > 0.5;
    const orderedNums = ascending ? sorted : [...sorted].reverse();
    return {
      type: "comparison",
      expression: `${nums.join(", ")}을(를) ${ascending ? "작은 수부터" : "큰 수부터"} 나열하면? (첫 번째 수는?)`,
      answer: orderedNums[0],
      steps: [
        `${ascending ? "작은 수부터" : "큰 수부터"} 정렬합니다`,
        orderedNums.join(", "),
      ],
      unit: "순서배열",
      numbers: nums,
    };
  } else if (type === "shape_identify") {
    // 도형문제 - 꼭짓점, 변의 수
    const shape = pickOne(rng, [
      { name: "삼각형", sides: 3, vertices: 3 },
      { name: "사각형", sides: 4, vertices: 4 },
      { name: "오각형", sides: 5, vertices: 5 },
      { name: "육각형", sides: 6, vertices: 6 },
    ]);
    const askSides = rng() > 0.5;
    return {
      type: "comparison",
      expression: askSides
        ? `${shape.name}의 변은 몇 개?`
        : `${shape.name}의 꼭짓점은 몇 개?`,
      answer: askSides ? shape.sides : shape.vertices,
      steps: [
        `${shape.name}은(는) ${shape.sides}개의 변과 ${shape.vertices}개의 꼭짓점이 있습니다`,
      ],
      unit: "도형문제",
      numbers: [shape.sides],
    };
  } else if (type === "pattern_find") {
    // 규칙찾기
    const skip =
      difficulty === 1 ? pickOne(rng, [1, 2, 3]) : pickOne(rng, [2, 3, 4, 5]);
    const start = randInt(rng, 1, difficulty === 1 ? 5 : 10);
    const count = difficulty === 1 ? 3 : difficulty === 3 ? 5 : 4;
    const sequence = Array.from({ length: count }, (_, i) => start + skip * i);
    const answer = start + skip * count;
    return {
      type: "counting",
      expression: `${sequence.join(", ")}, ? 에서 ?에 알맞은 수는?`,
      answer,
      steps: [
        `${skip}씩 커지는 규칙입니다`,
        `${sequence[sequence.length - 1]} + ${skip} = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...sequence, answer],
    };
  } else if (type === "size_compare_visual") {
    // 크기비교 - 두 묶음 비교
    const a = randInt(rng, 2, difficulty === 1 ? 10 : 20);
    const b = randInt(rng, 2, difficulty === 1 ? 10 : 20);
    const diff = Math.abs(a - b);
    const itemA = pickOne(rng, ["빨간 공", "큰 상자", "긴 연필"]);
    const itemB = pickOne(rng, ["파란 공", "작은 상자", "짧은 연필"]);
    return {
      type: "comparison",
      expression: `${iGa(itemA)} ${a}개, ${iGa(itemB)} ${b}개 있습니다. 몇 개 더 많은가요?`,
      answer: diff,
      steps: [
        a > b
          ? `${iGa(itemA)} 더 많습니다`
          : a < b
            ? `${withJosa(String(itemB), "이/가")} 더 많습니다`
            : `같습니다`,
        `${Math.max(a, b)} - ${Math.min(a, b)} = ${diff}`,
      ],
      unit: "크기비교",
      numbers: [a, b],
    };
  } else if (type === "number_decompose") {
    // 수의 분해 - 10을 두 수로 가르기
    const total =
      difficulty === 1
        ? pickOne(rng, [5, 6, 7, 8, 9, 10])
        : pickOne(rng, [10, 11, 12, 13, 14, 15]);
    const part1 = randInt(rng, 1, total - 1);
    const part2 = total - part1;
    return {
      type: "addition",
      expression: `${withJosa(String(total), "을/를")} ${withJosa(String(part1), "과/와")} 어떤 수로 가르면? 어떤 수는?`,
      answer: part2,
      steps: [`${total} = ${part1} + ?`, `? = ${total} - ${part1} = ${part2}`],
      unit: "수의 가르기",
      numbers: [total, part1],
    };
  } else if (type === "missing_number") {
    // 빈칸 채우기
    const a = randInt(rng, 1, addMax);
    const b = randInt(rng, 1, addMax);
    const sum = a + b;
    const askFirst = rng() > 0.5;
    return {
      type: "addition",
      expression: askFirst
        ? `? + ${b} = ${sum}에서 ?는?`
        : `${a} + ? = ${sum}에서 ?는?`,
      answer: askFirst ? a : b,
      steps: [
        askFirst ? `? = ${sum} - ${b} = ${a}` : `? = ${sum} - ${a} = ${b}`,
      ],
      unit: "빈칸 채우기",
      numbers: [a, b, sum],
    };
  } else {
    const a = randInt(rng, 1, compMax);
    const b = randInt(rng, 1, compMax);
    return {
      type: "comparison",
      expression: `${withJosa(String(a), "과/와")} ${b} 중 더 큰 수는?`,
      answer: Math.max(a, b),
      steps: [`${withJosa(String(a), "과/와")} ${withJosa(String(b), "을/를")} 비교합니다`, `${withJosa(String(Math.max(a, b)), "이/가")} 더 큽니다`],
      unit: "수의 크기 비교",
      numbers: [a, b],
    };
  }
}

// ============================================================
// Grade 2: 두 자리 +/-, 구구단 시작, 시간, 길이
// ============================================================
function generateGrade2Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
  semester: 1 | 2 = 1,
): MathEntry {
  // "길이 재기"(length/length_compare)는 MATH_UNIT_SEQUENCE상 2학기(13주차)에만 등장하는
  // 단원이므로 1학기 풀에서는 제외한다(단원 없이 semester를 무시하던 결함 수정).
  const type = pickOne(
    rng,
    semester === 2
      ? [
          "addition2",
          "addition2",
          "subtraction2",
          "subtraction2",
          "multiplication_intro",
          "time",
          "length",
          "length_compare",
          "weight_compare",
          "clock_read",
          // New types
          "unit_convert_length",
          "word_problem_mul",
          "ordering_2digit",
          "shape_compose",
          "pattern_find_2",
          "missing_operator",
          "even_odd",
          "word_problem_compare",
        ]
      : [
          "addition2",
          "addition2",
          "subtraction2",
          "subtraction2",
          "multiplication_intro",
          "time",
          "weight_compare",
          "clock_read",
          // New types
          "unit_convert_length",
          "word_problem_mul",
          "ordering_2digit",
          "shape_compose",
          "pattern_find_2",
          "missing_operator",
          "even_odd",
          "word_problem_compare",
        ],
  );

  // Difficulty-based ranges for Grade 2 (단원 라벨 "두 자리"를 넘지 않도록 항상 ≤99 유지 —
  // 난이도 상승은 자릿수 확장이 아니라 하한선 상향·받아올림 빈도로 표현)
  const addMin = difficulty === 1 ? 10 : difficulty === 3 ? 50 : 10;
  const addMax = 99;
  const subMax = 99;
  const mulMax = difficulty === 1 ? 4 : difficulty === 3 ? 9 : 5;

  if (type === "addition2") {
    const a = randInt(rng, addMin, addMax);
    const bMax = Math.max(1, addMax - a);
    const b = randInt(rng, 1, bMax);
    const hasCarry = (a % 10) + (b % 10) >= 10;
    const unitLabel = difficulty === 3 ? "두 자리 덧셈" : "두 자리 덧셈";
    if (difficulty === 3) {
      const context = pickOne(rng, [
        "문구점에서 연필",
        "과일가게에서 사과",
        "도서관에서 책",
      ]);
      return {
        type: "addition",
        expression: `${context} ${a}개와 ${b}개를 합하면 모두 몇 개?`,
        answer: a + b,
        steps: [`일의 자리부터 차례로 더합니다`, `${a} + ${b} = ${a + b}`],
        unit: "두 자리 덧셈",
        numbers: [a, b],
        hasCarry,
      };
    }
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: a + b,
      steps: [
        `일의 자리: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`,
        `십의 자리: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${hasCarry ? " + 1" : ""} = ${Math.floor((a + b) / 10)}`,
        `${a} + ${b} = ${a + b}`,
      ],
      unit: unitLabel,
      numbers: [a, b],
      hasCarry,
    };
  } else if (type === "subtraction2") {
    const a = randInt(
      rng,
      difficulty === 1 ? 15 : difficulty === 3 ? 70 : 20,
      subMax,
    );
    const b = randInt(rng, 1, a);
    const hasBorrow = a % 10 < b % 10;
    if (difficulty === 3) {
      // 대상별 단위(명/개/마리)를 맞춰 출제 ("학생이 316개" 같은 비문 방지)
      const ctx = pickOne(rng, [
        { where: "학교에 학생이", counter: "명", gone: "전학을 갔습니다" },
        { where: "바구니에 귤이", counter: "개", gone: "없어졌습니다" },
        { where: "연못에 물고기가", counter: "마리", gone: "없어졌습니다" },
      ]);
      return {
        type: "subtraction",
        expression: `${ctx.where} ${a}${ctx.counter} 있었는데 ${iGa(`${b}${ctx.counter}`)} ${ctx.gone}. 남은 것은 몇 ${ctx.counter}?`,
        answer: a - b,
        steps: [`${a}에서 ${withJosa(String(b), "을/를")} 뺍니다`, `${a} - ${b} = ${a - b}`],
        unit: "두 자리 뺄셈",
        numbers: [a, b],
        hasBorrow,
      };
    }
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${withJosa(String(b), "을/를")} 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "두 자리 뺄셈",
      numbers: [a, b],
      hasBorrow,
    };
  } else if (type === "multiplication_intro") {
    const a = randInt(rng, 2, mulMax);
    const b = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [
        `${a}을(를) ${b}번 더합니다`,
        `${Array(b).fill(a).join(" + ")} = ${a * b}`,
      ],
      unit: "곱셈구구",
      numbers: [a, b],
    };
  } else if (type === "time") {
    const hour = randInt(rng, 1, 12);
    const min =
      difficulty === 1 ? pickOne(rng, [0, 30]) : pickOne(rng, [0, 15, 30, 45]);
    const addMin =
      difficulty === 1
        ? 30
        : difficulty === 3
          ? pickOne(rng, [30, 45, 60, 90])
          : 30;
    if (difficulty === 3) {
      const totalMin = hour * 60 + min + addMin;
      const newHour = Math.floor(totalMin / 60) % 12 || 12;
      const newMin = totalMin % 60;
      return {
        type: "time",
        expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 ${addMin}분 후는 몇 시 몇 분?`,
        answer: newHour * 100 + newMin,
        steps: [`${hour}시 ${min}분 + ${addMin}분 = ${newHour}시 ${newMin}분`],
        unit: "시각과 시간",
        numbers: [hour, min],
      };
    }
    return {
      type: "time",
      expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 30분 후는?`,
      answer:
        min + 30 >= 60
          ? ((hour % 12) + 1) * 100 + (min + 30 - 60)
          : hour * 100 + min + 30,
      steps: [
        `${hour}시 ${min}분 + 30분 = ${min + 30 >= 60 ? `${(hour % 12) + 1}시 ${min + 30 - 60}분` : `${hour}시 ${min + 30}분`}`,
      ],
      unit: "시각과 시간",
      numbers: [hour, min],
    };
  } else if (type === "length_compare") {
    const lenMax = difficulty === 1 ? 30 : difficulty === 3 ? 200 : 99;
    const cm1 = randInt(rng, 10, lenMax);
    const cm2 = randInt(rng, 10, lenMax);
    const diff = Math.abs(cm1 - cm2);
    return {
      type: "subtraction",
      expression: `연필 길이가 ${cm1}cm, 지우개 길이가 ${cm2}cm입니다. 몇 cm 차이?`,
      answer: diff,
      steps: [
        cm1 > cm2
          ? `${cm1} - ${cm2} = ${diff}cm`
          : `${cm2} - ${cm1} = ${diff}cm`,
      ],
      unit: "길이 재기",
      numbers: [cm1, cm2],
    };
  } else if (type === "weight_compare") {
    // 실제로 있을 법한 무게 범위의 짝만(«참외 19kg» 금지) · 같은 무게면 «더 무거운 것»이 없으니 다시 뽑는다
    const pair = pickOne(rng, [
      ["강아지", "고양이", 2, 12],
      ["쌀 포대", "밀가루 포대", 5, 20],
      ["여행 가방", "책가방", 2, 20],
      ["수박", "호박", 3, 10],
    ] as const);
    const kg1 = randInt(rng, pair[2], pair[3]);
    let kg2 = randInt(rng, pair[2], pair[3]);
    if (kg2 === kg1) kg2 = kg1 === pair[3] ? kg1 - 1 : kg1 + 1;
    return {
      type: "comparison",
      expression: `${pair[0]} ${kg1}kg, ${pair[1]} ${kg2}kg 중 더 무거운 것의 무게는?`,
      answer: Math.max(kg1, kg2),
      steps: [
        `${withJosa(String(kg1), "과/와")} ${withJosa(String(kg2), "을/를")} 비교합니다`,
        `${Math.max(kg1, kg2)}kg이 더 무겁습니다`,
      ],
      unit: "무게 재기",
      numbers: [kg1, kg2],
    };
  } else if (type === "clock_read") {
    const hour = randInt(rng, 1, 12);
    const min =
      difficulty === 1
        ? pickOne(rng, [0, 15, 30, 45])
        : pickOne(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const addMin =
      difficulty === 1
        ? pickOne(rng, [15, 30])
        : difficulty === 3
          ? pickOne(rng, [25, 35, 45, 55, 75, 90])
          : pickOne(rng, [15, 20, 25, 30, 45, 60]);
    const totalMin = hour * 60 + min + addMin;
    const newHour = Math.floor(totalMin / 60) % 12 || 12;
    const newMin = totalMin % 60;
    return {
      type: "time",
      expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 ${addMin}분 후는 몇 시 몇 분?`,
      answer: newHour * 100 + newMin,
      steps: [`${hour}시 ${min}분 + ${addMin}분 = ${newHour}시 ${newMin}분`],
      unit: "시각과 시간",
      numbers: [hour, min],
    };
  } else if (type === "unit_convert_length") {
    // 단위변환 - cm와 m
    const meters = randInt(
      rng,
      1,
      difficulty === 1 ? 3 : difficulty === 3 ? 10 : 5,
    );
    const extraCm = randInt(rng, 0, 99);
    const totalCm = meters * 100 + extraCm;
    const askDirection = rng() > 0.5;
    if (askDirection) {
      return {
        type: "comparison",
        expression:
          extraCm === 0
            ? `${totalCm}cm는 몇 m?`
            : `${totalCm}cm는 몇 m 몇 cm? (m 부분의 수만 입력)`,
        answer: meters,
        steps: [`100cm = 1m`, `${totalCm}cm = ${meters}m ${extraCm}cm`],
        unit: "단위변환",
        numbers: [totalCm],
      };
    }
    return {
      type: "comparison",
      expression: `${meters}m ${extraCm}cm는 모두 몇 cm?`,
      answer: totalCm,
      steps: [
        `${meters}m = ${meters * 100}cm`,
        `${meters * 100} + ${extraCm} = ${totalCm}cm`,
      ],
      unit: "단위변환",
      numbers: [meters, extraCm],
    };
  } else if (type === "word_problem_mul") {
    // 서술형 곱셈
    const a = randInt(rng, 2, mulMax);
    const b = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const scenario = pickOne(rng, [
      { item: "접시", unit: "개", content: "딸기", contentUnit: "개" },
      { item: "봉지", unit: "개", content: "사탕", contentUnit: "개" },
      { item: "줄", unit: "줄", content: "의자", contentUnit: "개" },
      { item: "상자", unit: "개", content: "귤", contentUnit: "개" },
    ]);
    return {
      type: "multiplication",
      expression: `${scenario.item} ${a}${scenario.unit}에 ${withJosa(String(scenario.content), "이/가")} ${b}${scenario.contentUnit}씩 있습니다. 전체 ${withJosa(String(scenario.content), "은/는")} 몇 ${scenario.contentUnit}?`,
      answer: a * b,
      steps: [`${a} × ${b} = ${a * b}`],
      unit: "서술형 곱셈",
      numbers: [a, b],
    };
  } else if (type === "ordering_2digit") {
    // 순서배열 - 두 자리 수
    const numCount = difficulty === 1 ? 3 : difficulty === 3 ? 5 : 4;
    const nums: number[] = [];
    while (nums.length < numCount) {
      const n = randInt(rng, 10, 99);
      if (!nums.includes(n)) nums.push(n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const ascending = rng() > 0.5;
    const orderedNums = ascending ? sorted : [...sorted].reverse();
    return {
      type: "comparison",
      expression: `${nums.join(", ")}을(를) ${ascending ? "작은 수부터" : "큰 수부터"} 나열할 때 두 번째 수는?`,
      answer: orderedNums[1],
      steps: [
        `${ascending ? "오름차순" : "내림차순"}: ${orderedNums.join(", ")}`,
        `두 번째: ${orderedNums[1]}`,
      ],
      unit: "순서배열",
      numbers: nums,
    };
  } else if (type === "shape_compose") {
    // 도형 - 변의 합
    const shape = pickOne(rng, [
      { name: "정삼각형", sides: 3 },
      { name: "정사각형", sides: 4 },
      { name: "정오각형", sides: 5 },
      { name: "정육각형", sides: 6 },
    ]);
    const sideLen = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const perimeter = shape.sides * sideLen;
    return {
      type: "addition",
      expression: `한 변의 길이가 ${sideLen}cm인 ${shape.name}의 둘레는 몇 cm?`,
      answer: perimeter,
      steps: [
        `${withJosa(String(shape.name), "은/는")} ${shape.sides}개의 변이 있습니다`,
        `${sideLen} × ${shape.sides} = ${perimeter}cm`,
      ],
      unit: "도형문제",
      numbers: [sideLen, shape.sides],
    };
  } else if (type === "pattern_find_2") {
    // 규칙찾기 - 곱셈 패턴
    const base = randInt(rng, 2, mulMax);
    const startMul = randInt(rng, 1, 3);
    const count = difficulty === 1 ? 3 : 4;
    const sequence = Array.from(
      { length: count },
      (_, i) => base * (startMul + i),
    );
    const answer = base * (startMul + count);
    return {
      type: "counting",
      expression: `${sequence.join(", ")}, ? 에서 ?에 알맞은 수는?`,
      answer,
      steps: [
        `${base}씩 커지는 규칙입니다`,
        `${sequence[sequence.length - 1]} + ${base} = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...sequence, answer],
    };
  } else if (type === "missing_operator") {
    // 빈 연산자 찾기 - 답에 연산자 번호
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 1, a - 1);
    const opType = pickOne(rng, ["add", "sub"]);
    const result = opType === "add" ? a + b : a - b;
    return {
      type: "comparison",
      expression: `${a} ○ ${b} = ${result}에서 ○에 알맞은 것은? (1: +, 2: -)`,
      answer: opType === "add" ? 1 : 2,
      steps: [
        `${a} ${opType === "add" ? "+" : "-"} ${b} = ${result}`,
        `답: ${opType === "add" ? "+" : "-"}`,
      ],
      unit: "빈칸 채우기",
      numbers: [a, b, result],
    };
  } else if (type === "even_odd") {
    // 짝수/홀수
    const num = randInt(rng, 1, difficulty === 1 ? 20 : 50);
    const isEven = num % 2 === 0;
    return {
      type: "comparison",
      expression: `${withJosa(String(num), "은/는")} 짝수인가요 홀수인가요? (1: 짝수, 2: 홀수)`,
      answer: isEven ? 1 : 2,
      steps: [
        `${num} ÷ 2 = ${isEven ? `${num / 2} (나누어떨어짐)` : `나머지 1`}`,
        `${withJosa(String(num), "은/는")} ${isEven ? "짝수" : "홀수"}입니다`,
      ],
      unit: "짝수와 홀수",
      numbers: [num],
    };
  } else if (type === "word_problem_compare") {
    // 서술형 비교
    const a = randInt(rng, 10, difficulty === 1 ? 30 : 99);
    const b = randInt(rng, 10, difficulty === 1 ? 30 : 99);
    const items = pickOne(rng, [
      { a: "민수", b: "영희", item: "구슬" },
      { a: "철수", b: "지영", item: "색종이" },
      { a: "준호", b: "서연", item: "스티커" },
    ]);
    const diff = Math.abs(a - b);
    return {
      type: "subtraction",
      expression: `${eunNeun(items.a)} ${withJosa(String(items.item), "을/를")} ${a}개, ${eunNeun(items.b)} ${b}개 가지고 있습니다. 누가 몇 개 더 많나요? (개수만 입력)`,
      answer: diff,
      steps: [
        `${iGa(a > b ? items.a : items.b)} 더 많습니다`,
        `${Math.max(a, b)} - ${Math.min(a, b)} = ${diff}개`,
      ],
      unit: "서술형 비교",
      numbers: [a, b],
    };
  } else {
    const lenMax = difficulty === 1 ? 15 : difficulty === 3 ? 60 : 30;
    const cm = randInt(rng, 5, lenMax);
    const cm2 = randInt(rng, 5, lenMax);
    return {
      type: "addition",
      expression: `${cm}cm + ${cm2}cm = ?cm`,
      answer: cm + cm2,
      steps: [`${cm} + ${cm2} = ${cm + cm2}cm`],
      unit: "길이 재기",
      numbers: [cm, cm2],
    };
  }
}

// ============================================================
// Grade 3: 세 자리 +/-, 곱셈, 나눗셈 시작, 분수 기초
// ============================================================
function generateGrade3Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
  semester: 1 | 2 = 1,
): MathEntry {
  // addition3·subtraction3(세 자리 덧셈/뺄셈)과 fraction_intro·fraction_compare
  // (분수의 기초)는 MATH_UNIT_SEQUENCE상 3학년 1학기 전용 단원이므로 2학기 풀에서는
  // 제외한다(단원 없이 semester를 무시하던 결함 수정).
  const type = pickOne(
    rng,
    semester === 2
      ? [
          "multiplication",
          "multiplication",
          "division_intro",
          "division_remainder",
          // New types
          "word_problem_division",
          "ordering_fractions",
          "shape_perimeter",
          "unit_convert_km",
          "pattern_find_mul",
          "word_problem_multi_step",
          "comparison_3digit",
          "missing_number_mul",
        ]
      : [
          "addition3",
          "subtraction3",
          "multiplication",
          "multiplication",
          "division_intro",
          "division_remainder",
          "fraction_intro",
          "fraction_compare",
          // New types
          "word_problem_division",
          "ordering_fractions",
          "shape_perimeter",
          "unit_convert_km",
          "pattern_find_mul",
          "word_problem_multi_step",
          "comparison_3digit",
          "missing_number_mul",
        ],
  );

  // Difficulty-based ranges for Grade 3
  const mulMaxA = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;
  const mulMaxB = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;
  const divMaxQ = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;

  if (type === "addition3") {
    // 단원 라벨 "세 자리 덧셈"을 넘지 않도록 항은 항상 ≤999 유지 —
    // 난이도 상승은 자릿수 확장이 아니라 하한선 상향(받아올림 빈도 증가)으로 표현
    const aMin = difficulty === 1 ? 100 : difficulty === 3 ? 500 : 100;
    const aMax = difficulty === 1 ? 400 : 999;
    const a = randInt(rng, aMin, aMax);
    const bMin = difficulty === 1 ? 50 : difficulty === 3 ? 300 : 100;
    const b = randInt(rng, bMin, 999);
    const sum = a + b;
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: sum,
      steps: [`일의 자리부터 차례로 더합니다`, `${a} + ${b} = ${sum}`],
      unit: "세 자리 덧셈",
      numbers: [a, b],
      hasCarry: true,
    };
  } else if (type === "subtraction3") {
    // 단원 라벨 "세 자리 뺄셈"을 넘지 않도록 항은 항상 ≤999 유지
    const aMin = difficulty === 1 ? 200 : difficulty === 3 ? 700 : 200;
    const aMax = difficulty === 1 ? 500 : 999;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(
      rng,
      difficulty === 1 ? 50 : difficulty === 3 ? 300 : 100,
      a,
    );
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${withJosa(String(b), "을/를")} 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "세 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: true,
    };
  } else if (type === "multiplication") {
    const a = randInt(rng, 2, mulMaxA);
    const b = randInt(rng, 2, mulMaxB);
    if (difficulty === 3) {
      return {
        type: "multiplication",
        expression: `한 상자에 ${a}개씩 ${b}상자가 있습니다. 전체 개수는?`,
        answer: a * b,
        steps: [`${a} × ${b} = ${a * b}`],
        unit: "곱셈구구",
        numbers: [a, b],
      };
    }
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [`${a} × ${b} = ${a * b}`],
      unit: "곱셈구구",
      numbers: [a, b],
    };
  } else if (type === "division_intro") {
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const quotient = randInt(rng, 2, divMaxQ);
    const dividend = divisor * quotient;
    if (difficulty === 3) {
      return {
        type: "division",
        expression: `${dividend}개의 사탕을 ${divisor}명에게 똑같이 나누면 한 명에게 몇 개?`,
        answer: quotient,
        steps: [
          `${dividend} 안에 ${withJosa(String(divisor), "이/가")} 몇 번 들어가는지 생각합니다`,
          `${dividend} ÷ ${divisor} = ${quotient}`,
        ],
        unit: "나눗셈",
        dividend,
        divisor,
        quotient,
        remainder: 0,
      };
    }
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      steps: [
        `${dividend} 안에 ${withJosa(String(divisor), "이/가")} 몇 번 들어가는지 생각합니다`,
        `${dividend} ÷ ${divisor} = ${quotient}`,
      ],
      unit: "나눗셈",
      dividend,
      divisor,
      quotient,
      remainder: 0,
    };
  } else if (type === "division_remainder") {
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const quotient = randInt(
      rng,
      2,
      difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9,
    );
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor}의 몫은?`,
      answer: quotient,
      steps: [
        `${dividend} 안에 ${withJosa(String(divisor), "이/가")} ${quotient}번 들어갑니다`,
        `${dividend} ÷ ${divisor} = ${quotient} ... ${remainder}`,
      ],
      unit: "나눗셈",
      dividend,
      divisor,
      quotient,
      remainder,
    };
  } else if (type === "fraction_compare") {
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [4, 5, 6, 8, 10, 12])
          : pickOne(rng, [3, 4, 5, 6, 8]);
    const n1 = randInt(rng, 1, denom - 1);
    let n2 = randInt(rng, 1, denom - 1);
    if (n2 === n1) n2 = n1 > 1 ? n1 - 1 : n1 + 1;
    const bigger = Math.max(n1, n2);
    return {
      type: "fraction",
      expression: `${withJosa(`${n1}/${denom}`, "과/와", String(n1))} ${n2}/${denom} 중 더 큰 분수의 분자는?`,
      answer: bigger,
      steps: [
        `분모가 같으면 분자가 큰 것이 더 큽니다`,
        `${withJosa(`${bigger}/${denom}`, "이/가", String(bigger))} 더 큽니다`,
      ],
      unit: "분수의 기초",
      numbers: [n1, n2, denom],
    };
  } else if (type === "word_problem_division") {
    // 서술형 나눗셈
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const quotient = randInt(rng, 2, divMaxQ);
    const dividend = divisor * quotient;
    // 문장이 자연스럽도록 시나리오별 완성 문장 사용 ("2명에 학생들에게" 비문 방지)
    const scenario = pickOne(rng, [
      {
        sentence: `색종이 ${dividend}장을 학생 ${divisor}명에게 똑같이 나누어 주려고 합니다. 한 명에 몇 장씩?`,
      },
      {
        sentence: `쿠키 ${dividend}개를 접시 ${divisor}개에 똑같이 담으려고 합니다. 한 접시에 몇 개씩?`,
      },
      {
        sentence: `연필 ${dividend}자루를 필통 ${divisor}개에 똑같이 넣으려고 합니다. 한 필통에 몇 자루씩?`,
      },
    ]);
    return {
      type: "division",
      expression: scenario.sentence,
      answer: quotient,
      steps: [
        `${dividend} ÷ ${divisor} = ${quotient}`,
        `한 곳에 ${quotient}개씩`,
      ],
      unit: "서술형 나눗셈",
      dividend,
      divisor,
      quotient,
      remainder: 0,
    };
  } else if (type === "ordering_fractions") {
    // 순서배열 - 같은 분모 분수
    const denom =
      difficulty === 1 ? pickOne(rng, [4, 5, 6]) : pickOne(rng, [6, 8, 10]);
    const numCount = 3;
    const nums: number[] = [];
    while (nums.length < numCount) {
      const n = randInt(rng, 1, denom - 1);
      if (!nums.includes(n)) nums.push(n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    return {
      type: "fraction",
      expression: `${nums.map((n) => `${n}/${denom}`).join(", ")}을 작은 것부터 나열할 때 가장 작은 분수의 분자는?`,
      answer: sorted[0],
      steps: [
        `분모가 같으므로 분자가 작을수록 작은 분수`,
        sorted.map((n) => `${n}/${denom}`).join(" < "),
      ],
      unit: "순서배열",
      numbers: [...nums, denom],
    };
  } else if (type === "shape_perimeter") {
    // 도형 둘레
    const shapeType = pickOne(rng, ["rectangle", "square", "triangle"]);
    if (shapeType === "rectangle") {
      const w = randInt(rng, 3, difficulty === 1 ? 10 : 20);
      const h = randInt(rng, 3, difficulty === 1 ? 10 : 20);
      const perimeter = 2 * (w + h);
      return {
        type: "addition",
        expression: `가로 ${w}cm, 세로 ${h}cm인 직사각형의 둘레는?`,
        answer: perimeter,
        steps: [
          `둘레 = (가로 + 세로) × 2`,
          `(${w} + ${h}) × 2 = ${perimeter}cm`,
        ],
        unit: "도형 둘레",
        numbers: [w, h],
      };
    } else if (shapeType === "square") {
      const side = randInt(rng, 2, difficulty === 1 ? 10 : 15);
      return {
        type: "multiplication",
        expression: `한 변이 ${side}cm인 정사각형의 둘레는?`,
        answer: side * 4,
        steps: [`정사각형 둘레 = 한 변 × 4`, `${side} × 4 = ${side * 4}cm`],
        unit: "도형 둘레",
        numbers: [side],
      };
    } else {
      const a = randInt(rng, 3, 10);
      const b = randInt(rng, 3, 10);
      const c = randInt(rng, Math.abs(a - b) + 1, a + b - 1); // triangle inequality
      return {
        type: "addition",
        expression: `세 변의 길이가 ${a}cm, ${b}cm, ${c}cm인 삼각형의 둘레는?`,
        answer: a + b + c,
        steps: [`${a} + ${b} + ${c} = ${a + b + c}cm`],
        unit: "도형 둘레",
        numbers: [a, b, c],
      };
    }
  } else if (type === "unit_convert_km") {
    // 단위변환 - m와 km
    const km = randInt(rng, 1, difficulty === 1 ? 3 : 9);
    const extraM = randInt(rng, 0, 9) * 100;
    const totalM = km * 1000 + extraM;
    const askDirection = rng() > 0.5;
    if (askDirection) {
      return {
        type: "comparison",
        expression:
          extraM === 0
            ? `${totalM}m는 몇 km?`
            : `${totalM}m는 몇 km 몇 m? (km 부분의 수만 입력)`,
        answer: km,
        steps: [`1000m = 1km`, `${totalM}m = ${km}km ${extraM}m`],
        unit: "단위변환",
        numbers: [totalM],
      };
    }
    return {
      type: "comparison",
      expression: `${km}km ${extraM}m는 모두 몇 m?`,
      answer: totalM,
      steps: [
        `${km}km = ${km * 1000}m`,
        `${km * 1000} + ${extraM} = ${totalM}m`,
      ],
      unit: "단위변환",
      numbers: [km, extraM],
    };
  } else if (type === "pattern_find_mul") {
    // 규칙찾기 - 곱셈 패턴
    const base = randInt(rng, 2, 5);
    const sequence = Array.from(
      { length: 4 },
      (_, i) => base * (i + 1) * (i + 1),
    );
    // Pattern: base×1, base×4, base×9, base×16 → 제곱수 패턴
    // Simpler: just multiply pattern
    const mult = randInt(rng, 2, 4);
    const seq = Array.from({ length: 3 }, (_, i) => mult * Math.pow(2, i));
    const answer = mult * Math.pow(2, 3);
    return {
      type: "counting",
      expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는? (규칙: 2배씩)`,
      answer,
      steps: [
        `앞의 수에 2를 곱하는 규칙입니다`,
        `${seq[seq.length - 1]} × 2 = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...seq, answer],
    };
  } else if (type === "word_problem_multi_step") {
    // 서술형 복합 문제
    const price = randInt(rng, 2, 5) * 100;
    const count = randInt(rng, 2, difficulty === 1 ? 3 : 5);
    const money = price * count + randInt(rng, 1, 5) * 100;
    const total = price * count;
    const change = money - total;
    return {
      type: "mixed",
      expression: `${price}원짜리 빵을 ${count}개 사고 ${money}원을 냈습니다. 거스름돈은?`,
      answer: change,
      steps: [
        `빵 가격: ${price} × ${count} = ${total}원`,
        `거스름돈: ${money} - ${total} = ${change}원`,
      ],
      unit: "서술형 복합",
      numbers: [price, count, money],
    };
  } else if (type === "comparison_3digit") {
    // 크기비교 - 세 자리 수
    const a = randInt(rng, 100, 999);
    const b = randInt(rng, 100, 999);
    const symbol = a > b ? ">" : a < b ? "<" : "=";
    return {
      type: "comparison",
      expression: `${a} ○ ${b}에서 ○에 알맞은 기호는? (1: >, 2: <, 3: =)`,
      answer: a > b ? 1 : a < b ? 2 : 3,
      steps: [`백의 자리부터 비교합니다`, `${a} ${symbol} ${b}`],
      unit: "크기비교",
      numbers: [a, b],
    };
  } else if (type === "missing_number_mul") {
    // 빈칸 곱셈
    const a = randInt(rng, 2, mulMaxA);
    const b = randInt(rng, 2, mulMaxB);
    const product = a * b;
    return {
      type: "multiplication",
      expression: `${a} × ? = ${product}에서 ?는?`,
      answer: b,
      steps: [`? = ${product} ÷ ${a} = ${b}`],
      unit: "빈칸 곱셈",
      numbers: [a, product],
    };
  } else {
    // fraction intro
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [3, 4, 5, 6, 8, 10, 12])
          : pickOne(rng, [2, 3, 4, 5, 6, 8]);
    const numer = randInt(rng, 1, denom - 1);
    return {
      type: "fraction",
      expression: `피자를 똑같이 ${denom}조각으로 나누어 ${numer}조각을 먹었습니다. 먹은 양은 ?/${denom}입니다. ?에 알맞은 수는?`,
      answer: numer,
      steps: [`전체 ${denom}조각 중 ${numer}조각`, `먹은 양 = ${numer}/${denom}`],
      unit: "분수의 기초",
      numbers: [numer, denom],
    };
  }
}

// ============================================================
// Grade 4: 큰 수, 곱셈/나눗셈 확장, 각도, 분수 덧뺄셈
// ============================================================
function generateGrade4Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
  semester: 1 | 2 = 1,
): MathEntry {
  // MATH_UNIT_SEQUENCE 기준 division_remainder·large_addition·large_subtraction·
  // angle·angle_calc(나머지가 있는 나눗셈·네 자리 덧셈/뺄셈·각도)는 1학기 전용,
  // fraction_add(동분모 분수 덧셈)는 2학기 전용이므로 학기별로 나눈다
  // (단원 없이 semester를 무시하던 결함 수정).
  const type = pickOne(
    rng,
    semester === 2
      ? [
          "multiplication_2digit",
          "fraction_add",
          "graph_read",
          // New types
          "word_problem_area",
          "ordering_large",
          "shape_area_triangle",
          "unit_convert_weight",
          "pattern_find_complex",
          "mixed_word_problem",
          "estimation",
          "symmetry",
        ]
      : [
          "multiplication_2digit",
          "division_remainder",
          "large_addition",
          "large_subtraction",
          "angle",
          "angle_calc",
          "graph_read",
          // New types
          "word_problem_area",
          "ordering_large",
          "shape_area_triangle",
          "unit_convert_weight",
          "pattern_find_complex",
          "mixed_word_problem",
          "estimation",
          "symmetry",
        ],
  );

  if (type === "multiplication_2digit") {
    const aMin = difficulty === 1 ? 11 : difficulty === 3 ? 20 : 11;
    const aMax = difficulty === 1 ? 30 : difficulty === 3 ? 99 : 99;
    const bMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(rng, 2, bMax);
    if (difficulty === 3) {
      return {
        type: "multiplication",
        expression: `한 줄에 ${a}명씩 ${b}줄이 있습니다. 전체 인원은?`,
        answer: a * b,
        steps: [
          `${a} × ${withJosa(String(b), "을/를")} 세로셈으로 계산합니다`,
          `${a} × ${b} = ${a * b}`,
        ],
        unit: "두 자리 × 한 자리 곱셈",
        numbers: [a, b],
      };
    }
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [
        `${a} × ${withJosa(String(b), "을/를")} 세로셈으로 계산합니다`,
        `일의 자리: ${a % 10} × ${b} = ${(a % 10) * b}`,
        `십의 자리: ${Math.floor(a / 10)} × ${b} = ${Math.floor(a / 10) * b}`,
        `${a} × ${b} = ${a * b}`,
      ],
      unit: "두 자리 × 한 자리 곱셈",
      numbers: [a, b],
    };
  } else if (type === "division_remainder") {
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const qMax = difficulty === 1 ? 8 : difficulty === 3 ? 25 : 15;
    const quotient = randInt(rng, 3, qMax);
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor}의 몫은?`,
      answer: quotient,
      steps: [`${dividend} ÷ ${divisor} = ${quotient} ... ${remainder}`],
      unit: "나머지가 있는 나눗셈",
      dividend,
      divisor,
      quotient,
      remainder,
    };
  } else if (type === "large_addition") {
    // 단원 라벨 "네 자리 덧셈"을 넘지 않도록 항은 항상 1000~9999 유지 —
    // 난이도 상승은 자릿수 확장이 아니라 하한선 상향으로 표현
    const aMin = difficulty === 1 ? 1000 : difficulty === 3 ? 5000 : 1000;
    const aMax = 9999;
    const a = randInt(rng, aMin, aMax);
    const bMin = difficulty === 1 ? 1000 : difficulty === 3 ? 3000 : 1000;
    const b = randInt(rng, bMin, 9999);
    return {
      type: "addition",
      expression: `${a.toLocaleString()} + ${b.toLocaleString()} = ?`,
      answer: a + b,
      steps: [`${a} + ${b} = ${a + b}`],
      unit: "네 자리 덧셈",
      numbers: [a, b],
      hasCarry: true,
    };
  } else if (type === "large_subtraction") {
    // 단원 라벨 "네 자리 뺄셈"을 넘지 않도록 항은 항상 1000~9999 유지
    const aMin = difficulty === 1 ? 1000 : difficulty === 3 ? 5000 : 2000;
    const aMax = 9999;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(
      rng,
      difficulty === 1 ? 1000 : difficulty === 3 ? 3000 : 1000,
      a,
    );
    return {
      type: "subtraction",
      expression: `${a.toLocaleString()} - ${b.toLocaleString()} = ?`,
      answer: a - b,
      steps: [`${a} - ${b} = ${a - b}`],
      unit: "네 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: true,
    };
  } else if (type === "angle") {
    if (difficulty === 1) {
      // Simpler: just find missing angle in a right triangle or straight line
      const angle1 = randInt(rng, 30, 80);
      const angle2 = 90 - angle1;
      return {
        type: "angle",
        expression: `직각삼각형의 한 각이 ${angle1}°일 때 나머지 한 각은?`,
        answer: angle2,
        steps: [`직각삼각형: 90° + ${angle1}° + ? = 180°`, `? = ${angle2}°`],
        unit: "각도",
        numbers: [angle1],
      };
    } else if (difficulty === 3) {
      // Multi-step: quadrilateral angles
      const a1 = randInt(rng, 50, 120);
      const a2 = randInt(rng, 40, 100);
      const a3 = randInt(rng, 30, 360 - a1 - a2 - 10);
      const a4 = 360 - a1 - a2 - a3;
      return {
        type: "angle",
        expression: `사각형의 세 각이 ${a1}°, ${a2}°, ${a3}°일 때 나머지 한 각은?`,
        answer: a4,
        steps: [
          `사각형 네 각의 합은 360°`,
          `360° - ${a1}° - ${a2}° - ${a3}° = ${a4}°`,
        ],
        unit: "각도",
        numbers: [a1, a2, a3],
      };
    }
    const angle1 = randInt(rng, 20, 100);
    const angle2 = randInt(rng, 20, Math.max(21, 180 - angle1 - 10));
    const angle3 = 180 - angle1 - angle2;
    return {
      type: "angle",
      expression: `삼각형 두 각이 ${angle1}°와 ${angle2}°일 때 나머지 한 각은?`,
      answer: angle3,
      steps: [
        `삼각형 세 각의 합은 180°`,
        `180° - ${angle1}° - ${angle2}° = ${angle3}°`,
      ],
      unit: "각도",
      numbers: [angle1, angle2],
    };
  } else if (type === "angle_calc") {
    const a1Max = difficulty === 1 ? 60 : difficulty === 3 ? 120 : 120;
    const a2Max = difficulty === 1 ? 30 : difficulty === 3 ? 50 : 60;
    const a1 = randInt(rng, 20, a1Max);
    const a2 = randInt(rng, 10, Math.min(a2Max, 170 - a1));
    const isAdd = rng() > 0.5;
    if (difficulty === 3) {
      // Multi-step: add two angles then subtract from 180 (ensure positive result)
      const sum = a1 + a2;
      return {
        type: "angle",
        expression: `두 각 ${a1}°와 ${a2}°의 합을 180°에서 빼면 몇 도?`,
        answer: 180 - sum,
        steps: [`${a1}° + ${a2}° = ${sum}°`, `180° - ${sum}° = ${180 - sum}°`],
        unit: "각도",
        numbers: [a1, a2],
      };
    }
    if (isAdd) {
      return {
        type: "angle",
        expression: `${a1}°와 ${a2}°를 더하면 몇 도?`,
        answer: a1 + a2,
        steps: [`${a1}° + ${a2}° = ${a1 + a2}°`],
        unit: "각도",
        numbers: [a1, a2],
      };
    } else {
      const big = Math.max(a1, a2);
      const small = Math.min(a1, a2);
      return {
        type: "angle",
        expression: `${big}°에서 ${small}°를 빼면 몇 도?`,
        answer: big - small,
        steps: [`${big}° - ${small}° = ${big - small}°`],
        unit: "각도",
        numbers: [big, small],
      };
    }
  } else if (type === "graph_read") {
    const monthCount = difficulty === 1 ? 3 : difficulty === 3 ? 7 : 5;
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월"].slice(
      0,
      monthCount,
    );
    // 완전 무작위 대신 한국 평년 월별 평균기온(°C) 근사치를 기준으로 소폭 변동만 준다
    // ("2월 47°C" 같은 비현실적 값 방지). 4학년은 음수를 배우지 않으므로 0 미만은 자른다.
    const monthlyAvgTemp = [1, 3, 8, 14, 19, 23, 26]; // 1~7월
    const values = Array.from({ length: monthCount }, (_, i) =>
      Math.max(0, monthlyAvgTemp[i] + randInt(rng, -3, 3)),
    );
    const maxVal = Math.max(...values);
    const maxIdx = values.indexOf(maxVal);
    const minVal = Math.min(...values);
    if (difficulty === 3) {
      return {
        type: "comparison",
        expression: `기온 그래프: ${months.map((m, i) => `${m}=${values[i]}°C`).join(", ")}. 가장 높은 달과 낮은 달의 기온 차이는?`,
        answer: maxVal - minVal,
        steps: [
          `최고: ${months[maxIdx]} ${maxVal}°C, 최저: ${minVal}°C`,
          `차이: ${maxVal} - ${minVal} = ${maxVal - minVal}°C`,
        ],
        unit: "그래프 읽기",
        numbers: values,
      };
    }
    return {
      type: "comparison",
      expression: `기온 그래프: ${months.map((m, i) => `${m}=${values[i]}°C`).join(", ")}. 가장 높은 달의 기온은?`,
      answer: maxVal,
      steps: [`${months[maxIdx]}의 기온이 ${maxVal}°C로 가장 높습니다`],
      unit: "그래프 읽기",
      numbers: values,
    };
  } else if (type === "word_problem_area") {
    // 서술형 넓이 문제
    const w = randInt(rng, 3, difficulty === 1 ? 10 : 15);
    const h = randInt(rng, 3, difficulty === 1 ? 10 : 15);
    const scenario = pickOne(rng, [
      "교실 바닥",
      "꽃밭",
      "운동장의 직사각형 구역",
      "색종이",
    ]);
    return {
      type: "area",
      expression: `${scenario}의 가로가 ${w}m, 세로가 ${h}m입니다. 넓이는 몇 m²?`,
      answer: w * h,
      steps: [`직사각형 넓이 = 가로 × 세로`, `${w} × ${h} = ${w * h}m²`],
      unit: "서술형 넓이",
      numbers: [w, h],
    };
  } else if (type === "ordering_large") {
    // 순서배열 - 큰 수
    const numCount = difficulty === 1 ? 3 : 4;
    const nums: number[] = [];
    while (nums.length < numCount) {
      const n = randInt(rng, 1000, 9999);
      if (!nums.includes(n)) nums.push(n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    return {
      type: "comparison",
      expression: `${nums.join(", ")}을(를) 작은 수부터 나열할 때 가장 큰 수는?`,
      answer: sorted[sorted.length - 1],
      steps: [
        `오름차순: ${sorted.join(", ")}`,
        `가장 큰 수: ${sorted[sorted.length - 1]}`,
      ],
      unit: "순서배열",
      numbers: nums,
    };
  } else if (type === "shape_area_triangle") {
    // 도형 - 삼각형 넓이
    const base = randInt(rng, 4, difficulty === 1 ? 10 : 20);
    const height = randInt(rng, 2, difficulty === 1 ? 8 : 16);
    // ensure even product for clean division
    const adjustedBase = base % 2 === 1 && height % 2 === 1 ? base + 1 : base;
    const area = (adjustedBase * height) / 2;
    return {
      type: "area",
      expression: `밑변 ${adjustedBase}cm, 높이 ${height}cm인 삼각형의 넓이는?`,
      answer: area,
      steps: [
        `삼각형 넓이 = 밑변 × 높이 ÷ 2`,
        `${adjustedBase} × ${height} ÷ 2 = ${area}cm²`,
      ],
      unit: "삼각형 넓이",
      numbers: [adjustedBase, height],
    };
  } else if (type === "unit_convert_weight") {
    // 단위변환 - g과 kg
    const kg = randInt(rng, 1, difficulty === 1 ? 5 : 10);
    const extraG = randInt(rng, 0, 9) * 100;
    const totalG = kg * 1000 + extraG;
    const askDirection = rng() > 0.5;
    if (askDirection) {
      return {
        type: "comparison",
        expression:
          extraG === 0
            ? `${totalG}g은 몇 kg?`
            : `${totalG}g은 몇 kg 몇 g? (kg 부분의 수만 입력)`,
        answer: kg,
        steps: [`1000g = 1kg`, `${totalG}g = ${kg}kg ${extraG}g`],
        unit: "단위변환",
        numbers: [totalG],
      };
    }
    return {
      type: "comparison",
      expression: `${kg}kg ${extraG}g은 모두 몇 g?`,
      answer: totalG,
      steps: [
        `${kg}kg = ${kg * 1000}g`,
        `${kg * 1000} + ${extraG} = ${totalG}g`,
      ],
      unit: "단위변환",
      numbers: [kg, extraG],
    };
  } else if (type === "pattern_find_complex") {
    // 규칙찾기 - 복잡한 패턴
    const patternType = pickOne(rng, ["add_increase", "multiply", "alternate"]);
    if (patternType === "add_increase") {
      // 1, 3, 6, 10, 15, ... (삼각수)
      const start = randInt(rng, 1, 3);
      const seq = [start];
      for (let i = 1; i < 4; i++) {
        seq.push(seq[seq.length - 1] + (i + 1));
      }
      const answer = seq[seq.length - 1] + 5;
      return {
        type: "counting",
        expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는? (더하는 수가 1씩 증가)`,
        answer,
        steps: [
          `차이: ${seq[1] - seq[0]}, ${seq[2] - seq[1]}, ${withJosa(String(seq[3] - seq[2]), "으로/로")} 1씩 증가`,
          `${seq[seq.length - 1]} + 5 = ${answer}`,
        ],
        unit: "규칙찾기",
        numbers: [...seq, answer],
      };
    } else if (patternType === "multiply") {
      const base = pickOne(rng, [2, 3]);
      const seq = Array.from({ length: 4 }, (_, i) => Math.pow(base, i + 1));
      const answer = Math.pow(base, 5);
      return {
        type: "counting",
        expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는?`,
        answer,
        steps: [
          `${withJosa(String(base), "을/를")} 반복해서 곱하는 규칙`,
          `${seq[seq.length - 1]} × ${base} = ${answer}`,
        ],
        unit: "규칙찾기",
        numbers: [...seq, answer],
      };
    } else {
      // alternate: +3, -1, +3, -1 pattern
      const start = randInt(rng, 5, 10);
      const addVal = randInt(rng, 2, 4);
      const subVal = 1;
      const seq = [start];
      for (let i = 0; i < 5; i++) {
        seq.push(seq[seq.length - 1] + (i % 2 === 0 ? addVal : -subVal));
      }
      const answer =
        seq[seq.length - 1] + (seq.length % 2 === 1 ? addVal : -subVal);
      return {
        type: "counting",
        expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는?`,
        answer,
        steps: [`+${addVal}, -${withJosa(String(subVal), "이/가")} 반복되는 규칙`, `답: ${answer}`],
        unit: "규칙찾기",
        numbers: [...seq, answer],
      };
    }
  } else if (type === "mixed_word_problem") {
    // 서술형 혼합 계산
    const itemPrice = randInt(rng, 2, 8) * 100;
    const count1 = randInt(rng, 2, 5);
    const count2 = randInt(rng, 1, 3);
    const item1 = pickOne(rng, ["연필", "지우개", "공책"]);
    const item2 = pickOne(rng, ["자", "풀", "가위"]);
    const price2 = randInt(rng, 3, 9) * 100;
    const total = itemPrice * count1 + price2 * count2;
    return {
      type: "mixed",
      expression: `${item1} ${count1}개(개당 ${itemPrice}원)와 ${item2} ${count2}개(개당 ${price2}원)의 총 가격은?`,
      answer: total,
      steps: [
        `${item1}: ${itemPrice} × ${count1} = ${itemPrice * count1}원`,
        `${item2}: ${price2} × ${count2} = ${price2 * count2}원`,
        `합계: ${itemPrice * count1} + ${price2 * count2} = ${total}원`,
      ],
      unit: "서술형 혼합",
      numbers: [itemPrice, count1, price2, count2],
    };
  } else if (type === "estimation") {
    // 어림 - 반올림
    const num = randInt(rng, 100, 9999);
    const place = pickOne(rng, [10, 100, 1000]);
    const placeNames: Record<number, string> = {
      10: "십의 자리",
      100: "백의 자리",
      1000: "천의 자리",
    };
    const rounded = Math.round(num / place) * place;
    return {
      type: "comparison",
      // "천의 자리에서 반올림"은 천의 자리 숫자를 보고 만의 자리로 어림한다는
      // 뜻이 되어 정답(천의 자리까지 나타내기)과 어긋난다 → 표준 표현으로
      expression: `${withJosa(String(num), "을/를")} 반올림하여 ${placeNames[place]}까지 나타내면?`,
      answer: rounded,
      steps: [`반올림하여 ${placeNames[place]}까지 나타냅니다`, `${num} → ${rounded}`],
      unit: "어림하기",
      numbers: [num, place],
    };
  } else if (type === "symmetry") {
    // 대칭 - 선대칭 도형
    const shape = pickOne(rng, [
      { name: "정삼각형", axes: 3 },
      { name: "정사각형", axes: 4 },
      { name: "정오각형", axes: 5 },
      { name: "정육각형", axes: 6 },
      { name: "원", axes: 0 }, // infinite but we'll say 0 as special
    ]);
    if (shape.name === "원") {
      return {
        type: "comparison",
        expression: `정삼각형의 대칭축은 몇 개?`,
        answer: 3,
        steps: [`정삼각형은 3개의 대칭축이 있습니다`],
        unit: "대칭",
        numbers: [3],
      };
    }
    return {
      type: "comparison",
      expression: `${shape.name}의 대칭축은 몇 개?`,
      answer: shape.axes,
      steps: [`${shape.name}은(는) ${shape.axes}개의 대칭축이 있습니다`],
      unit: "대칭",
      numbers: [shape.axes],
    };
  } else {
    // fraction addition (same denominator)
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [4, 5, 6, 8, 10, 12])
          : pickOne(rng, [3, 4, 5, 6, 8]);
    const a = randInt(rng, 1, denom - 2);
    const b = randInt(rng, 1, denom - a);
    if (difficulty === 3) {
      // Addition then subtraction
      const c = randInt(rng, 1, Math.max(1, a + b - 1));
      const result = a + b - c;
      return {
        type: "fraction",
        expression: `${a}/${denom} + ${b}/${denom} - ${c}/${denom} = ? (분자만 입력, 분모=${denom})`,
        answer: result,
        steps: [
          `분모가 같으므로 분자끼리 계산합니다`,
          `${a} + ${b} - ${c} = ${result}`,
          `답: ${result}/${denom}`,
        ],
        unit: "동분모 분수 덧셈",
        numbers: [a, b, c, denom],
      };
    }
    return {
      type: "fraction",
      expression: `${a}/${denom} + ${b}/${denom} = ? (분자만 입력, 분모=${denom})`,
      answer: a + b,
      steps: [
        `분모가 같으므로 분자끼리 더합니다`,
        `${a} + ${b} = ${a + b}`,
        `답: ${a + b}/${denom}`,
      ],
      unit: "동분모 분수 덧셈",
      numbers: [a, b, denom],
    };
  }
}

// ============================================================
// Grade 5: 약수/배수, 소수 연산, 넓이, 대칭, 혼합계산
// 1학기: 혼합계산, 약수와 배수, 최대공약수/최소공배수, 분수의 덧셈/뺄셈
// 2학기: 분수의 곱셈, 소수의 곱셈, 소수의 덧셈, 넓이
// ============================================================
function generateGrade5Math(
  rng: () => number,
  semester = 1,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const sem1Types = [
    "mixed_ops",
    "factor",
    "lcm_gcd",
    "fraction_sub",
    "fraction_sub",
    "simplify_fraction",
    // New types
    "word_problem_fraction",
    "ordering_fractions_diff_denom",
    "unit_convert_area",
    "pattern_arithmetic_seq",
    "comparison_fractions",
    "multiple_check",
  ];
  const sem2Types = [
    "decimal_multiply",
    "decimal_add",
    "decimal_multiply2",
    "area",
    "fraction_multiply",
    // New types
    "word_problem_decimal",
    "trapezoid_area",
    "parallelogram_area",
    "decimal_subtract",
    "unit_convert_capacity",
    "pattern_geometric",
  ];
  const type = pickOne(rng, semester === 1 ? sem1Types : sem2Types);

  // Difficulty-based: denominators for fractions
  const fracDenomMax = difficulty === 1 ? 6 : difficulty === 3 ? 15 : 10;

  if (type === "mixed_ops") {
    const aMax = difficulty === 1 ? 10 : difficulty === 3 ? 30 : 20;
    const bMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 10;
    const cMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, bMax);
    const ops = pickOne(rng, ["+", "-"]);
    const c =
      ops === "-"
        ? randInt(rng, 1, Math.min(cMax, a * b - 1))
        : randInt(rng, 1, cMax);
    const answer = ops === "+" ? a * b + c : a * b - c;
    if (difficulty === 3) {
      // Multi-step: add parentheses
      const d = randInt(rng, 2, 5);
      const answer3 = (a + c) * b - d;
      return {
        type: "mixed",
        expression: `(${a} + ${c}) × ${b} - ${d} = ?`,
        answer: answer3,
        steps: [
          `먼저 괄호: ${a} + ${c} = ${a + c}`,
          `곱셈: ${a + c} × ${b} = ${(a + c) * b}`,
          `뺄셈: ${(a + c) * b} - ${d} = ${answer3}`,
        ],
        unit: "혼합 계산",
        numbers: [a, b, c, d],
      };
    }
    return {
      type: "mixed",
      expression: `${a} × ${b} ${ops} ${c} = ?`,
      answer,
      steps: [
        `먼저 곱셈: ${a} × ${b} = ${a * b}`,
        `그 다음 ${ops === "+" ? "덧셈" : "뺄셈"}: ${a * b} ${ops} ${c} = ${answer}`,
      ],
      unit: "혼합 계산",
      numbers: [a, b, c],
    };
  } else if (type === "decimal_add") {
    if (difficulty === 3) {
      // Two-decimal-place addition
      const a = randInt(rng, 100, 999) / 100;
      const b = randInt(rng, 100, 999) / 100;
      const answer = Math.round((a + b) * 100) / 100;
      return {
        type: "decimal",
        expression: `${a} + ${b} = ?`,
        answer,
        steps: [`소수점을 맞추어 더합니다`, `${a} + ${b} = ${answer}`],
        unit: "소수의 덧셈",
        numbers: [Math.round(a * 100), Math.round(b * 100)],
      };
    }
    const aMax = difficulty === 1 ? 50 : 99;
    const a = randInt(rng, 10, aMax) / 10;
    const b = randInt(rng, 10, aMax) / 10;
    const answer = Math.round((a + b) * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} + ${b} = ?`,
      answer,
      steps: [`소수점을 맞추어 더합니다`, `${a} + ${b} = ${answer}`],
      unit: "소수의 덧셈",
      numbers: [a * 10, b * 10],
    };
  } else if (type === "decimal_multiply") {
    const aMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 1, 9) / 10;
    const answer = Math.round(a * b * 10) / 10;
    if (difficulty === 3) {
      // Decimal × decimal
      const a2 = randInt(rng, 11, 99) / 10;
      const b2 = randInt(rng, 2, 9) / 10;
      const ans2 = Math.round(a2 * b2 * 100) / 100;
      return {
        type: "decimal",
        expression: `${a2} × ${b2} = ?`,
        answer: ans2,
        steps: [
          `소수 × 소수: 소수점 자리수를 더합니다`,
          `${a2} × ${b2} = ${ans2}`,
        ],
        unit: "소수의 곱셈",
        numbers: [Math.round(a2 * 10), Math.round(b2 * 10)],
      };
    }
    return {
      type: "decimal",
      expression: `${a} × ${b} = ?`,
      answer,
      steps: [`${a} × ${b} = ${answer}`],
      unit: "소수의 곱셈",
      numbers: [a, b * 10],
    };
  } else if (type === "factor") {
    const easyNums = [6, 8, 10, 12, 15];
    const normalNums = [12, 18, 24, 30, 36, 42, 48, 56, 60, 72];
    const hardNums = [36, 48, 60, 72, 84, 90, 96, 100, 120];
    const n = pickOne(
      rng,
      difficulty === 1 ? easyNums : difficulty === 3 ? hardNums : normalNums,
    );
    const factors: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) factors.push(i);
    }
    return {
      type: "factor",
      expression: `${n}의 약수의 개수는?`,
      answer: factors.length,
      steps: [`${n}의 약수: ${factors.join(", ")}`, `총 ${factors.length}개`],
      unit: "약수와 배수",
      numbers: [n],
    };
  } else if (type === "fraction_sub") {
    const easyDenoms: [number, number][] = [
      [2, 4],
      [2, 6],
      [3, 6],
    ];
    const normalDenoms: [number, number][] = [
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 6],
      [4, 6],
      [2, 6],
      [3, 5],
    ];
    const hardDenoms: [number, number][] = [
      [3, 5],
      [4, 5],
      [3, 7],
      [5, 6],
      [4, 7],
      [5, 8],
      [3, 8],
      [6, 7],
    ];
    const [d1, d2] = pickOne(
      rng,
      difficulty === 1
        ? easyDenoms
        : difficulty === 3
          ? hardDenoms
          : normalDenoms,
    );
    const lcm = (d1 * d2) / gcdCalc(d1, d2);
    const n1 = randInt(rng, 1, d1 - 1);
    const n2 = randInt(rng, 1, d2 - 1);
    const isAdd = rng() > 0.4;
    const n1c = n1 * (lcm / d1);
    const n2c = n2 * (lcm / d2);

    // For subtraction, ensure first fraction is larger than second
    let resultNum: number;
    let op: string;
    let finalN1: number, finalN2: number, finalD1: number, finalD2: number;

    if (isAdd) {
      resultNum = n1c + n2c;
      op = "+";
      finalN1 = n1;
      finalN2 = n2;
      finalD1 = d1;
      finalD2 = d2;
    } else {
      // For subtraction, make sure we don't get negative results
      if (n1c >= n2c) {
        resultNum = n1c - n2c;
        finalN1 = n1;
        finalN2 = n2;
        finalD1 = d1;
        finalD2 = d2;
      } else {
        resultNum = n2c - n1c;
        finalN1 = n2;
        finalN2 = n1;
        finalD1 = d2;
        finalD2 = d1;
      }
      op = "-";
    }
    // 표시 순서 기준 통분 분자 (뺄셈에서 앞뒤가 바뀌었을 수 있으므로 final* 기준으로 계산)
    const finalN1c = finalN1 * (lcm / finalD1);
    const finalN2c = finalN2 * (lcm / finalD2);
    if (difficulty === 3) {
      // Mixed operation: add then subtract a third fraction.
      // 세 번째 분수를 빼도 결과가 음수가 되지 않는 경우에만 3항식 출제.
      const step3 = lcm / finalD1;
      const n3Max = Math.min(finalD1 - 1, Math.floor((resultNum - 1) / step3));
      if (n3Max >= 1) {
        const n3 = randInt(rng, 1, n3Max);
        const n3c = n3 * step3;
        const finalResult = resultNum - n3c;
        return {
          type: "fraction",
          expression: `${finalN1}/${finalD1} ${op} ${finalN2}/${finalD2} - ${n3}/${finalD1} = ? (분자만 입력, 분모=${lcm})`,
          answer: finalResult,
          steps: [
            `공통분모: ${lcm}`,
            `${finalN1c}/${lcm} ${op} ${finalN2c}/${lcm} = ${resultNum}/${lcm}`,
            `${resultNum}/${lcm} - ${n3c}/${lcm} = ${finalResult}/${lcm}`,
          ],
          unit: "분수의 덧셈",
          numbers: [finalN1, finalD1, finalN2, finalD2, n3],
        };
      }
      // 안전한 3항식을 만들 수 없으면 2항식으로 폴백
    }
    return {
      type: "fraction",
      expression: `${finalN1}/${finalD1} ${op} ${finalN2}/${finalD2} = ? (분자만 입력, 분모=${lcm})`,
      answer: resultNum,
      steps: [
        `공통분모: ${lcm}`,
        `${finalN1c}/${lcm} ${op} ${finalN2c}/${lcm} = ${resultNum}/${lcm}`,
      ],
      unit: isAdd ? "분수의 덧셈" : "분수의 뺄셈",
      numbers: [finalN1, finalD1, finalN2, finalD2],
    };
  } else if (type === "fraction_multiply") {
    const nMax = difficulty === 1 ? 3 : difficulty === 3 ? 8 : 5;
    const dMax = difficulty === 1 ? 6 : difficulty === 3 ? 12 : 8;
    const n1 = randInt(rng, 1, nMax);
    const d1 = randInt(rng, 2, dMax);
    const n2 = randInt(rng, 1, nMax);
    const d2 = randInt(rng, 2, dMax);
    const gcdN = gcdCalc(n1 * n2, d1 * d2);
    const resultN = (n1 * n2) / gcdN;
    const resultD = (d1 * d2) / gcdN;
    return {
      type: "fraction",
      expression: `${n1}/${d1} × ${n2}/${d2} = ? (기약분수의 분자만 입력)`,
      answer: resultN,
      steps: [
        `분자끼리: ${n1} × ${n2} = ${n1 * n2}`,
        `분모끼리: ${d1} × ${d2} = ${d1 * d2}`,
        `약분하면: ${resultN}/${resultD}`,
      ],
      unit: "분수의 곱셈",
      numbers: [n1, d1, n2, d2],
    };
  } else if (type === "simplify_fraction") {
    const factor =
      difficulty === 1
        ? pickOne(rng, [2, 3])
        : difficulty === 3
          ? pickOne(rng, [3, 4, 5, 6, 7, 8])
          : pickOne(rng, [2, 3, 4, 5, 6]);
    let n = randInt(rng, 1, difficulty === 1 ? 3 : 5);
    let d = randInt(
      rng,
      n + 1,
      difficulty === 1 ? 5 : difficulty === 3 ? 12 : 8,
    );
    // n/d가 이미 기약이어야 factor가 곧 최대공약수가 된다.
    // (기존엔 2/4×4=8/16의 답을 2로 내는 오답 버그 — 기약 분자는 1)
    const g0 = gcdCalc(n, d);
    n /= g0;
    d /= g0;
    const numer = n * factor;
    const denom = d * factor;
    return {
      type: "fraction",
      expression: `${withJosa(`${numer}/${denom}`, "을/를", String(numer))} 기약분수로 나타내면? (분자만 입력)`,
      answer: n,
      steps: [
        `${withJosa(String(numer), "과/와")} ${denom}의 최대공약수 ${withJosa(String(factor), "으로/로")} 분자와 분모를 나눕니다`,
        `${numer}/${denom} = ${n}/${d}`,
      ],
      unit: "약분과 통분",
      numbers: [numer, denom],
    };
  } else if (type === "decimal_multiply2") {
    const a = randInt(rng, 1, difficulty === 1 ? 5 : 9) / 10;
    const b = randInt(rng, 2, difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9);
    const answer = Math.round(a * b * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} × ${b} = ?`,
      answer,
      steps: [`소수점 위치에 주의합니다`, `${a} × ${b} = ${answer}`],
      unit: "소수의 곱셈",
      numbers: [a * 10, b],
    };
  } else if (type === "area") {
    const wMax = difficulty === 1 ? 8 : difficulty === 3 ? 25 : 15;
    const w = randInt(rng, 3, wMax);
    const h = randInt(rng, 3, wMax);
    if (difficulty === 3) {
      // Complex shape: L-shaped area
      const w2 = randInt(rng, 1, w - 1);
      const h2 = randInt(rng, 1, h - 1);
      const area = w * h - w2 * h2;
      return {
        type: "area",
        expression: `큰 직사각형 가로 ${w}cm, 세로 ${h}cm에서 가로 ${w2}cm, 세로 ${h2}cm를 잘라냈을 때 넓이는?`,
        answer: area,
        steps: [
          `전체 넓이: ${w} × ${h} = ${w * h}cm²`,
          `잘라낸 넓이: ${w2} × ${h2} = ${w2 * h2}cm²`,
          `${w * h} - ${w2 * h2} = ${area}cm²`,
        ],
        unit: "넓이",
        numbers: [w, h, w2, h2],
      };
    }
    return {
      type: "area",
      expression: `가로 ${w}cm, 세로 ${h}cm 직사각형의 넓이는?`,
      answer: w * h,
      steps: [`넓이 = 가로 × 세로`, `${w} × ${h} = ${w * h}cm²`],
      unit: "넓이",
      numbers: [w, h],
    };
  } else if (type === "word_problem_fraction") {
    // 서술형 분수 (합이 1을 넘지 않도록 n1+n2 < denom 보장)
    const denom = pickOne(rng, [3, 4, 5, 6, 8]);
    const n1 = randInt(rng, 1, denom - 2);
    const n2 = randInt(rng, 1, denom - n1 - 1);
    const item = pickOne(rng, ["피자", "케이크", "수박", "초콜릿"]);
    return {
      type: "fraction",
      expression: `${item}의 ${withJosa(`${n1}/${denom}`, "을/를", String(n1))} 먹고, ${withJosa(`${n2}/${denom}`, "을/를", String(n2))} 더 먹었습니다. 모두 얼마나 먹었나요? (분자만 입력, 분모=${denom})`,
      answer: n1 + n2,
      steps: [
        `분모가 같으므로 분자끼리 더합니다`,
        `${n1} + ${n2} = ${n1 + n2}`,
        `답: ${n1 + n2}/${denom}`,
      ],
      unit: "서술형 분수",
      numbers: [n1, n2, denom],
    };
  } else if (type === "ordering_fractions_diff_denom") {
    // 순서배열 - 다른 분모 분수 크기 비교
    const d1 = pickOne(rng, [2, 3, 4]);
    const d2 = pickOne(rng, [3, 4, 6]);
    const n1 = randInt(rng, 1, d1 - 1);
    let n2 = randInt(rng, 1, d2 - 1);
    // 같은 분수 두 개를 비교하는 무의미한 문항 방지 (1/2 vs 2/4 같은 동치 비교는 허용)
    if (d1 === d2 && n1 === n2) n2 = n2 === d2 - 1 ? Math.max(1, n2 - 1) : n2 + 1;
    const val1 = n1 / d1;
    const val2 = n2 / d2;
    const bigger = val1 > val2 ? 1 : val1 < val2 ? 2 : 0;
    return {
      type: "fraction",
      expression: `${withJosa(`${n1}/${d1}`, "과/와", String(n1))} ${n2}/${d2} 중 더 큰 분수는? (1: ${n1}/${d1}, 2: ${n2}/${d2}, 0: 같음)`,
      answer: bigger,
      steps: [
        `통분하여 비교합니다`,
        `${n1}/${d1} = ${n1 * (lcmCalc(d1, d2) / d1)}/${lcmCalc(d1, d2)}, ${n2}/${d2} = ${n2 * (lcmCalc(d1, d2) / d2)}/${lcmCalc(d1, d2)}`,
        bigger === 1
          ? `${withJosa(`${n1}/${d1}`, "이/가", String(n1))} 더 큽니다`
          : bigger === 2
            ? `${withJosa(`${n2}/${d2}`, "이/가", String(n2))} 더 큽니다`
            : `같습니다`,
      ],
      unit: "크기비교",
      numbers: [n1, d1, n2, d2],
    };
  } else if (type === "unit_convert_area") {
    // 단위변환 - 넓이 cm² ↔ m²
    const side = randInt(rng, 1, 5);
    const areaCm2 = side * side * 10000;
    return {
      type: "comparison",
      expression: `${side}m × ${side}m = ${side * side}m²는 몇 cm²?`,
      answer: areaCm2,
      steps: [
        `1m² = 10000cm²`,
        `${side * side}m² = ${side * side} × 10000 = ${areaCm2}cm²`,
      ],
      unit: "단위변환",
      numbers: [side],
    };
  } else if (type === "pattern_arithmetic_seq") {
    // 규칙찾기 - 등차수열
    const first = randInt(rng, 1, 10);
    const diff = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const count = 4;
    const seq = Array.from({ length: count }, (_, i) => first + diff * i);
    const answer = first + diff * count;
    return {
      type: "counting",
      expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는?`,
      answer,
      steps: [
        `공차가 ${diff}인 등차수열`,
        `${seq[seq.length - 1]} + ${diff} = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...seq, answer],
    };
  } else if (type === "comparison_fractions") {
    // 크기비교 - 분수와 소수. 분모 2/4/5/10은 소수 둘째 자리 안에서
    // 정확히 떨어진다 — 반올림 금지(기존 1/4→0.3 오답 버그).
    const denom = pickOne(rng, [2, 4, 5, 10]);
    const numer = randInt(rng, 1, denom - 1);
    const decimal = Math.round((numer / denom) * 100) / 100;
    return {
      type: "fraction",
      expression: `${withJosa(`${numer}/${denom}`, "을/를", String(numer))} 소수로 나타내면?`,
      answer: decimal,
      steps: [`${numer} ÷ ${denom} = ${decimal}`],
      unit: "크기비교",
      numbers: [numer, denom],
    };
  } else if (type === "multiple_check") {
    // 배수 판별
    const base = pickOne(rng, [2, 3, 4, 5, 6, 9]);
    const num = base * randInt(rng, 3, 20);
    const wrong = num + randInt(rng, 1, base - 1);
    const askAbout = rng() > 0.5 ? num : wrong;
    const isMultiple = askAbout % base === 0;
    return {
      type: "comparison",
      expression: `${askAbout}은(는) ${base}의 배수인가요? (1: 예, 2: 아니오)`,
      answer: isMultiple ? 1 : 2,
      steps: [
        `${askAbout} ÷ ${base} = ${isMultiple ? `${askAbout / base} (나누어떨어짐)` : `나머지 ${askAbout % base}`}`,
        `${isMultiple ? "배수입니다" : "배수가 아닙니다"}`,
      ],
      unit: "약수와 배수",
      numbers: [askAbout, base],
    };
  } else if (type === "word_problem_decimal") {
    // 서술형 소수
    const price = randInt(rng, 10, 99) / 10;
    const count = randInt(rng, 2, 5);
    const total = Math.round(price * count * 10) / 10;
    const item = pickOne(rng, ["주스", "우유", "요구르트", "물"]);
    return {
      type: "decimal",
      expression: `${item} 한 개에 ${price}L입니다. ${count}개면 모두 몇 L?`,
      answer: total,
      steps: [`${price} × ${count} = ${total}L`],
      unit: "서술형 소수",
      numbers: [Math.round(price * 10), count],
    };
  } else if (type === "trapezoid_area") {
    // 사다리꼴 넓이
    const top = randInt(rng, 3, difficulty === 1 ? 8 : 15);
    const bottom = randInt(rng, top + 1, difficulty === 1 ? 12 : 20);
    const height = randInt(rng, 2, difficulty === 1 ? 6 : 12);
    // Ensure clean division
    const adjustedHeight = (top + bottom) % 2 === 1 ? height * 2 : height;
    const area = ((top + bottom) * adjustedHeight) / 2;
    return {
      type: "area",
      expression: `윗변 ${top}cm, 아랫변 ${bottom}cm, 높이 ${adjustedHeight}cm인 사다리꼴의 넓이는?`,
      answer: area,
      steps: [
        `사다리꼴 넓이 = (윗변 + 아랫변) × 높이 ÷ 2`,
        `(${top} + ${bottom}) × ${adjustedHeight} ÷ 2 = ${area}cm²`,
      ],
      unit: "사다리꼴 넓이",
      numbers: [top, bottom, adjustedHeight],
    };
  } else if (type === "parallelogram_area") {
    // 평행사변형 넓이
    const base = randInt(rng, 3, difficulty === 1 ? 10 : 18);
    const height = randInt(rng, 2, difficulty === 1 ? 8 : 14);
    const area = base * height;
    return {
      type: "area",
      expression: `밑변 ${base}cm, 높이 ${height}cm인 평행사변형의 넓이는?`,
      answer: area,
      steps: [
        `평행사변형 넓이 = 밑변 × 높이`,
        `${base} × ${height} = ${area}cm²`,
      ],
      unit: "평행사변형 넓이",
      numbers: [base, height],
    };
  } else if (type === "decimal_subtract") {
    // 소수 뺄셈
    const aInt = randInt(rng, 30, 99);
    const bInt = randInt(rng, 10, aInt - 1);
    const a = aInt / 10;
    const b = bInt / 10;
    const answer = Math.round((a - b) * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} - ${b} = ?`,
      answer,
      steps: [`소수점을 맞추어 뺍니다`, `${a} - ${b} = ${answer}`],
      unit: "소수의 뺄셈",
      numbers: [aInt, bInt],
    };
  } else if (type === "unit_convert_capacity") {
    // 단위변환 - mL와 L
    const liters = randInt(rng, 1, 5);
    const extraMl = randInt(rng, 0, 9) * 100;
    const totalMl = liters * 1000 + extraMl;
    return {
      type: "comparison",
      // "몇 L 몇 mL?"에 답이 L 수 하나뿐이면 모호 → 무엇을 입력할지 명시
      expression:
        extraMl === 0
          ? `${totalMl}mL는 몇 L?`
          : `${totalMl}mL는 몇 L 몇 mL? (L 부분의 수만 입력)`,
      answer: liters,
      steps: [`1000mL = 1L`, `${totalMl}mL = ${liters}L ${extraMl}mL`],
      unit: "단위변환",
      numbers: [totalMl],
    };
  } else if (type === "pattern_geometric") {
    // 규칙찾기 - 등비수열
    const first = pickOne(rng, [1, 2, 3]);
    const ratio = pickOne(rng, [2, 3]);
    const count = 4;
    const seq = Array.from(
      { length: count },
      (_, i) => first * Math.pow(ratio, i),
    );
    const answer = first * Math.pow(ratio, count);
    return {
      type: "counting",
      expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는?`,
      answer,
      steps: [
        `${ratio}배씩 커지는 규칙`,
        `${seq[seq.length - 1]} × ${ratio} = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...seq, answer],
    };
  } else {
    // LCM/GCD
    const easyNums = [4, 6, 8, 10, 12];
    const normalNums = [4, 6, 8, 9, 10, 12, 15, 18, 20];
    const hardNums = [12, 15, 18, 20, 24, 28, 30, 36, 42, 48];
    const pool =
      difficulty === 1 ? easyNums : difficulty === 3 ? hardNums : normalNums;
    const a = pickOne(rng, pool);
    const b = pickOne(
      rng,
      pool.filter((x) => x !== a),
    );
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    if (difficulty === 3) {
      // Ask for both GCD and LCM
      const l = (a * b) / g;
      return {
        type: "gcd",
        expression: `${withJosa(String(a), "과/와")} ${b}의 최소공배수는?`,
        answer: l,
        steps: [`최대공약수: ${g}`, `최소공배수: ${a} × ${b} ÷ ${g} = ${l}`],
        unit: "최소공배수",
        numbers: [a, b],
      };
    }
    return {
      type: "gcd",
      expression: `${withJosa(String(a), "과/와")} ${b}의 최대공약수는?`,
      answer: g,
      steps: [
        `${a}의 약수와 ${b}의 약수 중 공통된 가장 큰 수`,
        `최대공약수: ${g}`,
      ],
      unit: "최대공약수",
      numbers: [a, b],
    };
  }
}

// ============================================================
// Grade 6: 비와 비율, 원의 넓이, 비례식, 경우의 수
// ============================================================
function generateGrade6Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
  semester: 1 | 2 = 1,
): MathEntry {
  // MATH_UNIT_SEQUENCE 기준 ratio·percentage·volume(비와 비율·백분율·직육면체의 부피)은
  // 1학기 전용, circle_area·circle_circumference·proportion·proportion_word
  // (원의 넓이·비례식)는 2학기 전용이므로 학기별로 나눈다
  // (단원 없이 semester를 무시하던 결함 수정).
  const type = pickOne(
    rng,
    semester === 2
      ? [
          "circle_area",
          "circle_circumference",
          "proportion",
          "proportion_word",
          "probability",
          // New types
          "word_problem_ratio",
          "ordering_decimals",
          "unit_convert_speed",
          "pattern_fibonacci",
          "fraction_division",
          "surface_area",
          "average",
        ]
      : [
          "ratio",
          "percentage",
          "probability",
          "volume",
          // New types
          "word_problem_ratio",
          "ordering_decimals",
          "unit_convert_speed",
          "pattern_fibonacci",
          "fraction_division",
          "surface_area",
          "average",
          // "cylinder_volume" 제외: 원기둥의 부피는 초등 교육과정([6수02-01] 직육면체·정육면체 범위) 밖 —
          // 중학교 과정 내용이라 미배정. 아래 cylinder_volume 분기는 생성 경로에서 도달 불가.
        ],
  );

  if (type === "ratio") {
    const aMax = difficulty === 1 ? 6 : difficulty === 3 ? 24 : 12;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, aMax);
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    if (difficulty === 3) {
      // Three-way ratio simplification
      const c = randInt(rng, 2, aMax);
      const g3 = gcd(gcd(a, b), c);
      return {
        type: "ratio",
        expression: `${a} : ${b} : ${withJosa(String(c), "을/를")} 가장 간단한 자연수의 비로 나타내면? (첫째 수 입력)`,
        answer: a / g3,
        steps: [
          `최대공약수 ${withJosa(String(g3), "으로/로")} 나눕니다`,
          `${a / g3} : ${b / g3} : ${c / g3}`,
        ],
        unit: "비와 비율",
        numbers: [a, b, c],
      };
    }
    return {
      type: "ratio",
      expression: `${a} : ${withJosa(String(b), "을/를")} 가장 간단한 자연수의 비로 나타내면? (첫째 수 입력)`,
      answer: a / g,
      steps: [`최대공약수 ${withJosa(String(g), "으로/로")} 나눕니다`, `${a / g} : ${b / g}`],
      unit: "비와 비율",
      numbers: [a, b],
    };
  } else if (type === "percentage") {
    const easyTotals = [10, 20, 50, 100];
    const normalTotals = [20, 25, 40, 50, 100, 200];
    const hardTotals = [30, 60, 75, 80, 120, 150, 250, 300];
    const total = pickOne(
      rng,
      difficulty === 1
        ? easyTotals
        : difficulty === 3
          ? hardTotals
          : normalTotals,
    );
    // 백분율이 정수로 떨어지는 part만 출제(반올림 근사치를 정답으로 내던 버그 방지)
    const partStep = total / gcdCalc(total, 100);
    // 전체와 같은 part(«20명 중 20명») 는 너무 쉬워 빼고, 1 ~ (전체-1) 에서만 고른다
    const part = partStep * randInt(rng, 1, Math.max(1, total / partStep - 1));
    const pct = (part / total) * 100;
    if (difficulty === 3) {
      // Multi-step: find percentage then calculate amount
      const total2 = pickOne(rng, [200, 300, 500, 800]);
      const pctKnown = pickOne(rng, [10, 15, 20, 25, 30, 40]);
      const answer = (total2 * pctKnown) / 100;
      return {
        type: "percentage",
        expression: `${total2}원의 ${pctKnown}%는 얼마?`,
        answer,
        steps: [`${total2} × ${pctKnown}/100 = ${answer}원`],
        unit: "백분율",
        numbers: [total2, pctKnown],
      };
    }
    return {
      type: "percentage",
      expression: `${total}명 중 ${part}명은 전체의 몇 %?`,
      answer: pct,
      steps: [`${part}/${total} × 100 = ${pct}%`],
      unit: "백분율",
      numbers: [part, total],
    };
  } else if (type === "circle_area") {
    const rMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const r = randInt(rng, 2, rMax);
    const area = Math.round(r * r * 3.14 * 100) / 100;
    if (difficulty === 3) {
      // Find area of ring (annulus)
      const r2 = randInt(rng, 1, r - 1);
      const outerArea = Math.round(r * r * 3.14 * 100) / 100;
      const innerArea = Math.round(r2 * r2 * 3.14 * 100) / 100;
      const ringArea = Math.round((outerArea - innerArea) * 100) / 100;
      return {
        type: "area",
        expression: `바깥 반지름 ${r}cm, 안쪽 반지름 ${r2}cm인 고리 모양의 넓이는? (원주율 3.14)`,
        answer: ringArea,
        steps: [
          `바깥 원: ${r}² × 3.14 = ${outerArea}cm²`,
          `안쪽 원: ${r2}² × 3.14 = ${innerArea}cm²`,
          `고리 넓이: ${outerArea} - ${innerArea} = ${ringArea}cm²`,
        ],
        unit: "원의 넓이",
        numbers: [r, r2],
      };
    }
    return {
      type: "area",
      expression: `반지름 ${r}cm인 원의 넓이는? (원주율 3.14)`,
      answer: area,
      steps: [
        `원의 넓이 = 반지름 × 반지름 × 3.14`,
        `${r} × ${r} × 3.14 = ${area}cm²`,
      ],
      unit: "원의 넓이",
      numbers: [r],
    };
  } else if (type === "circle_circumference") {
    const rMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const r = randInt(rng, 2, rMax);
    const circumference = Math.round(2 * r * 3.14 * 100) / 100;
    return {
      type: "area",
      expression: `반지름 ${r}cm인 원의 둘레는? (원주율 3.14)`,
      answer: circumference,
      steps: [
        `원의 둘레 = 2 × 반지름 × 3.14`,
        `2 × ${r} × 3.14 = ${circumference}cm`,
      ],
      unit: "원의 넓이",
      numbers: [r],
    };
  } else if (type === "proportion_word") {
    const aMax = difficulty === 1 ? 4 : difficulty === 3 ? 10 : 6;
    const mulMax = difficulty === 1 ? 3 : difficulty === 3 ? 8 : 5;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, aMax);
    const multiplier = randInt(rng, 2, mulMax);
    if (difficulty === 3) {
      // Multi-step word problem
      const pricePerItem = b * 10;
      const totalItems = a * multiplier;
      const totalPrice = pricePerItem * multiplier;
      // 할인가가 정수(원)로 떨어지는 할인율만 출제 (10%는 항상 유효)
      const validDiscounts = [10, 15, 20, 25].filter(
        (dc) => (totalPrice * (100 - dc)) % 100 === 0,
      );
      const discount = pickOne(rng, validDiscounts);
      const discounted = (totalPrice * (100 - discount)) / 100;
      return {
        type: "proportion",
        expression: `사탕 ${a}개에 ${pricePerItem}원입니다. ${totalItems}개를 사고 ${discount}% 할인 받으면 얼마?`,
        answer: discounted,
        steps: [
          `${totalItems}개 가격: ${pricePerItem} × ${multiplier} = ${totalPrice}원`,
          `${discount}% 할인: ${totalPrice} × ${100 - discount}/100 = ${discounted}원`,
        ],
        unit: "비례식",
        numbers: [a, pricePerItem, multiplier, discount],
      };
    }
    return {
      type: "proportion",
      expression: `사탕 ${a}개에 ${b * 10}원이면, 사탕 ${a * multiplier}개는 얼마?`,
      answer: b * 10 * multiplier,
      steps: [
        `${a}개 : ${b * 10}원 = ${a * multiplier}개 : ?원`,
        `? = ${b * 10} × ${multiplier} = ${b * 10 * multiplier}원`,
      ],
      unit: "비례식",
      numbers: [a, b * 10, multiplier],
    };
  } else if (type === "proportion") {
    const propMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 8;
    const a = randInt(rng, 2, propMax);
    const b = randInt(rng, 2, propMax);
    const c = randInt(rng, 2, propMax);
    const d = (b * c) / a;
    if (Number.isInteger(d) && d > 0) {
      return {
        type: "proportion",
        expression: `${a} : ${b} = ${c} : ?`,
        answer: d,
        steps: [
          `비례식에서 외항의 곱 = 내항의 곱`,
          `${a} × ? = ${b} × ${c}`,
          `? = ${d}`,
        ],
        unit: "비례식",
        numbers: [a, b, c],
      };
    }
    // fallback
    return {
      type: "proportion",
      expression: `${a} : ${b} = ${a * 2} : ?`,
      answer: b * 2,
      steps: [`${a} × 2 = ${a * 2}이므로 ${b} × 2 = ${b * 2}`],
      unit: "비례식",
      numbers: [a, b],
    };
  } else if (type === "probability") {
    const itemsMin = difficulty === 1 ? 3 : difficulty === 3 ? 5 : 3;
    const itemsMax = difficulty === 1 ? 4 : difficulty === 3 ? 8 : 6;
    const items = randInt(rng, itemsMin, itemsMax);
    const chooseMax = difficulty === 1 ? 2 : difficulty === 3 ? 4 : 3;
    const choose = randInt(rng, 1, Math.min(items - 1, chooseMax));
    const factorial = (n: number): number =>
      n <= 1 ? 1 : n * factorial(n - 1);
    const comb =
      factorial(items) / (factorial(choose) * factorial(items - choose));
    return {
      type: "combination",
      expression: `${items}가지 중 ${choose}가지를 고르는 경우의 수는?`,
      answer: comb,
      steps: [`${items}C${choose} = ${comb}`],
      unit: "경우의 수",
      numbers: [items, choose],
    };
  } else if (type === "word_problem_ratio") {
    // 서술형 비율 문제
    const total = randInt(rng, 20, difficulty === 1 ? 50 : 100);
    const ratioA = randInt(rng, 1, 4);
    const ratioB = randInt(rng, 1, 4);
    const ratioSum = ratioA + ratioB;
    // Ensure total is divisible by ratioSum
    const adjustedTotal = Math.floor(total / ratioSum) * ratioSum;
    const partA = (adjustedTotal / ratioSum) * ratioA;
    // 짝이 맞는 대상끼리 + 단위(명/개)도 함께 (남학생·파란 공 같은 어긋난 짝 방지)
    const pair = pickOne(rng, [
      { a: "남학생", b: "여학생", counter: "명" },
      { a: "빨간 공", b: "파란 공", counter: "개" },
      { a: "사과", b: "배", counter: "개" },
    ]);
    return {
      type: "ratio",
      expression: `${gwaWa(pair.a)} ${pair.b}의 비가 ${ratioA}:${ratioB}이고 전체가 ${adjustedTotal}${pair.counter}일 때 ${eunNeun(pair.a)} 몇 ${pair.counter}?`,
      answer: partA,
      steps: [
        `전체 비: ${ratioA} + ${ratioB} = ${ratioSum}`,
        `${pair.a}: ${adjustedTotal} × ${ratioA}/${ratioSum} = ${partA}${pair.counter}`,
      ],
      unit: "서술형 비율",
      numbers: [ratioA, ratioB, adjustedTotal],
    };
  } else if (type === "ordering_decimals") {
    // 순서배열 - 소수
    const numCount = difficulty === 1 ? 3 : 4;
    const nums: number[] = [];
    while (nums.length < numCount) {
      const n = randInt(rng, 1, 99) / 10;
      if (!nums.includes(n)) nums.push(n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    return {
      type: "comparison",
      expression: `${nums.join(", ")}을(를) 작은 수부터 나열할 때 가장 작은 수는?`,
      answer: sorted[0],
      steps: [`오름차순: ${sorted.join(", ")}`],
      unit: "순서배열",
      numbers: nums.map((n) => Math.round(n * 10)),
    };
  } else if (type === "unit_convert_speed") {
    // 단위변환 - 속도 (km/h ↔ m/min)
    const kmH = randInt(rng, 2, difficulty === 1 ? 6 : 12) * 6; // Multiple of 6 for clean division
    const mMin = Math.round((kmH * 1000) / 60);
    return {
      type: "comparison",
      expression: `시속 ${kmH}km는 분속 몇 m?`,
      answer: mMin,
      steps: [
        `${kmH}km = ${kmH * 1000}m`,
        `1시간 = 60분`,
        `${kmH * 1000} ÷ 60 = ${mMin}m/분`,
      ],
      unit: "단위변환",
      numbers: [kmH],
    };
  } else if (type === "pattern_fibonacci") {
    // 규칙찾기 - 피보나치류 패턴 (앞 두 수의 합)
    const a = randInt(rng, 1, 3);
    const b = randInt(rng, 2, 5);
    const seq = [a, b];
    for (let i = 0; i < 3; i++) {
      seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
    }
    const answer = seq[seq.length - 1] + seq[seq.length - 2];
    return {
      type: "counting",
      expression: `${seq.join(", ")}, ? 에서 ?에 알맞은 수는? (규칙: 앞 두 수의 합)`,
      answer,
      steps: [
        `앞의 두 수를 더하는 규칙`,
        `${seq[seq.length - 2]} + ${seq[seq.length - 1]} = ${answer}`,
      ],
      unit: "규칙찾기",
      numbers: [...seq, answer],
    };
  } else if (type === "fraction_division") {
    // 분수의 나눗셈
    const n1 = randInt(rng, 1, difficulty === 1 ? 4 : 6);
    const d1 = randInt(rng, n1 + 1, difficulty === 1 ? 6 : 10);
    const n2 = randInt(rng, 1, difficulty === 1 ? 3 : 5);
    const d2 = randInt(rng, n2 + 1, difficulty === 1 ? 5 : 8);
    // n1/d1 ÷ n2/d2 = n1*d2 / d1*n2
    const resultN = n1 * d2;
    const resultD = d1 * n2;
    const g = gcdCalc(resultN, resultD);
    const simplifiedN = resultN / g;
    const simplifiedD = resultD / g;
    return {
      type: "fraction",
      expression: `${n1}/${d1} ÷ ${n2}/${d2} = ? (기약분수의 분자만 입력)`,
      answer: simplifiedN,
      steps: [
        `나누기는 역수를 곱합니다`,
        `${n1}/${d1} × ${d2}/${n2} = ${resultN}/${resultD}`,
        `약분: ${simplifiedN}/${simplifiedD}`,
      ],
      unit: "분수의 나눗셈",
      numbers: [n1, d1, n2, d2],
    };
  } else if (type === "surface_area") {
    // 직육면체 겉넓이
    const w = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const h = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const d = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const surfaceArea = 2 * (w * h + h * d + w * d);
    return {
      type: "area",
      expression: `가로 ${w}cm, 세로 ${h}cm, 높이 ${d}cm 직육면체의 겉넓이는?`,
      answer: surfaceArea,
      steps: [
        `겉넓이 = 2 × (가로×세로 + 세로×높이 + 가로×높이)`,
        `2 × (${w}×${h} + ${h}×${d} + ${w}×${d})`,
        `2 × (${w * h} + ${h * d} + ${w * d}) = ${surfaceArea}cm²`,
      ],
      unit: "겉넓이",
      numbers: [w, h, d],
    };
  } else if (type === "average") {
    // 평균
    const count = difficulty === 1 ? 3 : difficulty === 3 ? 6 : 4;
    const values = Array.from({ length: count }, () => randInt(rng, 50, 100));
    const sum = values.reduce((a, b) => a + b, 0);
    // Ensure clean average (점수가 100점을 넘지 않도록 빼는 방향으로 보정)
    const remainder = sum % count;
    if (remainder !== 0) values[0] -= remainder;
    const adjustedSum = values.reduce((a, b) => a + b, 0);
    const avg = adjustedSum / count;
    return {
      type: "comparison",
      expression: `시험 점수가 ${values.join(", ")}점일 때 평균은?`,
      answer: avg,
      steps: [
        `합계: ${values.join(" + ")} = ${adjustedSum}`,
        `평균: ${adjustedSum} ÷ ${count} = ${avg}점`,
      ],
      unit: "평균",
      numbers: values,
    };
  } else if (type === "cylinder_volume") {
    // 원기둥 부피
    const r = randInt(rng, 2, difficulty === 1 ? 5 : 10);
    const h = randInt(rng, 3, difficulty === 1 ? 8 : 15);
    const volume = Math.round(r * r * 3.14 * h * 100) / 100;
    return {
      type: "volume",
      expression: `밑면 반지름 ${r}cm, 높이 ${h}cm인 원기둥의 부피는? (원주율 3.14)`,
      answer: volume,
      steps: [
        `원기둥 부피 = 밑면적 × 높이 = π × r² × h`,
        `3.14 × ${r}² × ${h} = 3.14 × ${r * r} × ${h} = ${volume}cm³`,
      ],
      unit: "원기둥의 부피",
      numbers: [r, h],
    };
  } else {
    // volume
    const vMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const w = randInt(rng, 2, vMax);
    const h = randInt(rng, 2, vMax);
    const d = randInt(rng, 2, vMax);
    if (difficulty === 3) {
      // Complex: volume with missing dimension
      const volume = w * h * d;
      return {
        type: "volume",
        expression: `직육면체의 부피가 ${volume}cm³이고 가로 ${w}cm, 세로 ${h}cm일 때 높이는?`,
        answer: d,
        steps: [
          `높이 = 부피 ÷ (가로 × 세로)`,
          `${volume} ÷ (${w} × ${h}) = ${volume} ÷ ${w * h} = ${d}cm`,
        ],
        unit: "직육면체의 부피",
        numbers: [w, h, d],
      };
    }
    return {
      type: "volume",
      expression: `가로 ${w}cm, 세로 ${h}cm, 높이 ${d}cm 직육면체의 부피는?`,
      answer: w * h * d,
      steps: [
        `부피 = 가로 × 세로 × 높이`,
        `${w} × ${h} × ${d} = ${w * h * d}cm³`,
      ],
      unit: "직육면체의 부피",
      numbers: [w, h, d],
    };
  }
}

// ============================================================
// Public API: Generate N math problems for a given grade
// ============================================================
export function generateMathProblems(
  grade: number,
  count: number,
  seed: number,
  semester = 1,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry[] {
  const rng = seededRandom(seed);
  const problems: MathEntry[] = [];
  // semester는 1|2만 유효 — daily-set-generator.ts 등 외부 호출부가 number를 넘겨도
  // 안전하게 정규화한다.
  const sem: 1 | 2 = semester === 2 ? 2 : 1;

  const gen = (r: () => number): MathEntry => {
    switch (grade) {
      case 1:
        return generateGrade1Math(r, difficulty, sem);
      case 2:
        return generateGrade2Math(r, difficulty, sem);
      case 3:
        return generateGrade3Math(r, difficulty, sem);
      case 4:
        return generateGrade4Math(r, difficulty, sem);
      case 5:
        return generateGrade5Math(r, semester, difficulty);
      case 6:
        return generateGrade6Math(r, difficulty, sem);
      default:
        return generateGrade1Math(r, difficulty, sem);
    }
  };

  for (let i = 0; i < count; i++) {
    const p = gen(rng);
    if (p.expression) p.expression = naturalizeKorean(p.expression);
    if (p.steps) p.steps = p.steps.map(naturalizeKorean);
    problems.push(p);
  }

  return problems;
}

/**
 * Generate a large pool of math problems for a grade + semester.
 * Used to supplement static data, giving 10x+ content.
 */
export function generateMathPool(
  grade: number,
  dayOfYear: number,
  semester = 1,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry[] {
  return generateMathProblems(
    grade,
    800,
    dayOfYear * 1000 + grade,
    semester,
    difficulty,
  );
}
