import { generateDailySetWithoutRepeats } from "../src/lib/daily-set-generator";
import "./audit/review/load-review-sync";

for (const grade of [1, 2, 3, 4, 5, 6]) {
  for (const semester of [1, 2]) {
    const set = generateDailySetWithoutRepeats(grade, semester);
    console.log(`\n=== ${grade}학년 ${semester}학기 — ${set.set.title} ===`);
    console.log(`총 ${set.questions.length}문항`);
    const subjects: Record<string, number> = {};
    for (const q of set.questions) {
      subjects[q.subject] = (subjects[q.subject] || 0) + 1;
    }
    console.log("과목별:", subjects);

    const writing = set.questions.find((q) => q.subject === "writing");
    if (writing) {
      const prompt =
        (writing.content as Record<string, unknown>)?.prompt ||
        (writing.content as Record<string, unknown>)?.text;
      console.log(`  글쓰기: ${String(prompt).substring(0, 50)}`);
    }
    const math = set.questions.find((q) => q.subject === "math");
    if (math) {
      const question =
        (math.content as Record<string, unknown>)?.question ||
        (math.content as Record<string, unknown>)?.text;
      console.log(`  수학: ${String(question).substring(0, 50)}`);
    }
    const vocab = set.questions.find((q) => q.subject === "vocabulary");
    if (vocab) {
      const content = vocab.content as Record<string, unknown>;
      console.log(
        `  어휘: ${JSON.stringify(content).substring(0, 80)}`,
      );
    }
    const hanja = set.questions.find((q) => q.subject === "hanja");
    if (hanja) {
      const content = hanja.content as Record<string, unknown>;
      console.log(
        `  한자: ${JSON.stringify(content).substring(0, 80)}`,
      );
    }
    const english = set.questions.find((q) => q.subject === "english");
    if (english) {
      const content = english.content as Record<string, unknown>;
      console.log(
        `  영어: ${JSON.stringify(content).substring(0, 80)}`,
      );
    }
  }
}
