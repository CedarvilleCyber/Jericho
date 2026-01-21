"use client";

import { useState, useEffect } from "react";
import { Curriculum } from "@prisma/client";
import AnswerChecker from "../ui/answer-checker";
import CompletionModal from "../ui/completion-modal";

export default function CurriculumLayout({
  curriculum,
  scenarioId,
  scenarioName,
}: {
  curriculum: Array<Curriculum & { answered?: boolean }>;
  scenarioId: string;
  scenarioName: string;
}) {
  const [visibleQuestions, setVisibleQuestions] = useState(curriculum);
  const [, setIsCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Check if all questions are already answered on page load
  useEffect(() => {
    const allAnswered = curriculum.every((q) => q.answered);
    if (allAnswered && curriculum.length > 0) {
      const points = curriculum.reduce((sum, q) => {
        return sum + (q.pointValue || 0);
      }, 0);
      setTotalPoints(points);
      setShowModal(true);
      setIsCompleted(true);
    }
  }, [curriculum]);

  const handleNextQuestion = (nextQuestion: Curriculum | null) => {
    if (!nextQuestion) {
      // All questions completed!
      const points = visibleQuestions.reduce((sum, q) => {
        return sum + (q.pointValue || 0);
      }, 0);
      setTotalPoints(points);
      setIsCompleted(true);
      setShowModal(true);
    } else {
      setVisibleQuestions((prev) => [...prev, nextQuestion]);
    }
  };

  const handleDismissModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Flags</h2>
        <div className="font-mono p-2 rounded h-full overflow-y-auto">
          {visibleQuestions.map((item) => (
            <div key={item.id} className="mb-4">
              <h3 className="text-sm mb-1 whitespace-pre-wrap">
                {item.title}
                {item.answered}
                &nbsp;({item.pointValue} pts)
              </h3>
              <AnswerChecker
                curriculumId={item.id}
                placeholder={item.placeholder}
                scenarioId={scenarioId}
                onNextQuestion={handleNextQuestion}
              />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <CompletionModal
          scenarioName={scenarioName}
          totalPoints={totalPoints}
          onDismiss={handleDismissModal}
        />
      )}
    </>
  );
}
