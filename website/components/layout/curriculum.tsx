"use client";

import { Curriculum } from "@prisma/client";
import AnswerChecker from "../ui/answer-checker";

export default function CurriculumLayout({
  curriculum,
}: {
  curriculum: Array<Curriculum>;
}) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-2">Curriculum</h2>
      <div className="font-mono p-2 rounded h-full overflow-y-auto">
        {curriculum.map((item) => (
          <div key={item.id} className="mb-4">
            <h3 className="text-sm mb-1">{item.title}</h3>
            <AnswerChecker
              correctAnswer={item.answer}
              placeholder={item.placeholder}
              validation={item.validation}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
