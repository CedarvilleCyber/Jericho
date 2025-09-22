"use client";

import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { CheckSquare, Send, XSquare } from "lucide-react";
import { toast } from "sonner";

export default function AnswerChecker({
  correctAnswer,
  placeholder,
}: {
  correctAnswer: string;
  placeholder: string;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (userAnswer.trim() === correctAnswer) {
          setIsCorrect(true);
          toast.success("Correct answer!");
        } else {
          setIsCorrect(false);
          toast.error("Incorrect answer!");
        }
      }}
      className="flex"
    >
      <Input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder={placeholder}
        className="rounded-r-none"
      />
      <Button
        type="submit"
        className="rounded-l-none relative min-w-12"
        variant="outline"
      >
        <Send
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all"
          style={{ scale: isCorrect === null ? 1 : 0 }}
        />
        <CheckSquare
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all"
          style={{ scale: isCorrect === true ? 1 : 0 }}
        />
        <XSquare
          className="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 transition-all"
          style={{ scale: isCorrect === false ? 1 : 0 }}
        />
      </Button>
    </form>
  );
}
