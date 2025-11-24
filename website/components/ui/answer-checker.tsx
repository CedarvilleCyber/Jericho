"use client";

import { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { CheckSquare, Send, XSquare, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Curriculum } from "@prisma/client";

export default function AnswerChecker({
  curriculumId,
  placeholder,
  scenarioId,
  onNextQuestion,
}: {
  curriculumId: string;
  placeholder: string;
  scenarioId: string;
  onNextQuestion?: (question: Curriculum) => void;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  useEffect(() => {
    const checkExistingAnswer = async () => {
      try {
        const response = await fetch(
          `/webapp/api/answers/check/${curriculumId}`
        );
        const data = await response.json();

        if (data.answered && data.isCorrect) {
          setIsAnswered(true);
          setIsCorrect(true);
          setUserAnswer(data.answer);
        }
      } catch (error) {
        console.error("Error checking existing answer:", error);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingAnswer();
  }, [curriculumId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/webapp/api/answers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId,
          answer: userAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.error === "You have already answered this question correctly"
        ) {
          toast.error("You have already answered this question");
          setIsAnswered(true);
        } else if (data.error === "Answer format is incorrect") {
          toast.error("Answer format is incorrect.");
        } else {
          toast.error(data.error || "Failed to submit answer");
        }
        return;
      }

      setIsCorrect(data.isCorrect);

      if (data.isCorrect) {
        setIsAnswered(true);
        toast.success(`Correct answer! +${data.points} points`);

        // Fetch the next question from the server
        if (onNextQuestion) {
          try {
            const nextRes = await fetch(
              `/webapp/api/answers/next-question/${scenarioId}`
            );
            const nextData = await nextRes.json();
            console.log("Next question data:", nextData);
            setTimeout(
              () => onNextQuestion(nextData.nextQuestion || null),
              500
            );
          } catch (error) {
            console.error("Error fetching next question:", error);
          }
        }
      } else {
        toast.error("Incorrect answer!");
      }
    } catch (error) {
      console.error("Answer submission error:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingExisting) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (isAnswered) {
    return (
      <div className="flex gap-2 items-center text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Correct ✓</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <Input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder={placeholder}
        className="rounded-r-none"
        disabled={isLoading}
      />
      <Button
        type="submit"
        className="rounded-l-none relative min-w-12"
        variant="outline"
        disabled={isLoading}
      >
        <Send
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all"
          style={{ scale: isCorrect === null && !isLoading ? 1 : 0 }}
        />
        <Loader2
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin"
          style={{ scale: isLoading ? 1 : 0 }}
        />
        <CheckSquare
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 transition-all"
          style={{ scale: isCorrect === true ? 1 : 0 }}
        />
        <XSquare
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-destructive transition-all"
          style={{ scale: isCorrect === false ? 1 : 0 }}
        />
      </Button>
    </form>
  );
}
