"use client";

import AnswerChecker from "../ui/answer-checker";

export default function CurriculumLayout({
  curriculum,
}: {
  curriculum: string;
}) {
  const curriculumData = JSON.parse(curriculum);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-2">Curriculum</h2>
      <div className="bg-black text-green-500 font-mono p-2 rounded h-full overflow-y-auto">
        {curriculumData.map(
          (item: { title: string; placeholder: string; answer: string }) => (
            <div key={item.title} className="mb-2 flex">
              <label
                className="font-semibold text-nowrap my-auto mr-2"
                htmlFor={item.title}
              >
                {item.title}
              </label>
              <AnswerChecker
                correctAnswer={item.answer}
                placeholder={item.placeholder}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
