import { generateDailySet } from "../src/lib/daily-set-generator";
import "./audit/review/load-review-sync";
for (const grade of [1, 2, 3, 4, 5, 6]) {
  for (const semester of [1, 2]) {
    const s = generateDailySet(grade, semester);
    const mathQs = s.questions.filter((q) => q.subject === "math");
    console.log(
      `g${grade}s${semester}: ${s.questions.length}문항 (기대 ${s.set.total_questions}), math=${mathQs.length}, 예: ${(mathQs[0]?.content as any)?.expression ?? "-"} => ${(mathQs[0]?.answer as any)?.correct}`,
    );
    if (s.questions.length !== s.set.total_questions) throw new Error("문항수 불일치");
  }
}
console.log("스모크 통과");
