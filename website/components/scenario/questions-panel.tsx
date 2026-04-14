"use client";

import { submitAnswer, revealHint } from "@/lib/scenarios/answer";
import { INFORMATIONAL_COMPLETED_SENTINEL } from "@/lib/scenarios/constants";
import { Section, UserAnswer } from "@/app/generated/prisma/client";
import { QuestionWithSection } from "@/components/admin/scenario-types";
import {
  IconCheck,
  IconLock,
  IconX,
  IconBulb,
  IconInfoCircle,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AnswerState = {
  value: string;
  orderedItems: string[];
  submitting: boolean;
  correct: boolean | null;
  validationError: string | null;
  hintsRevealed: number;
  informationalCompleted: boolean;
};

function parseOptions(options: string | null): string[] {
  if (!options) return [];
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to pipe-split
  }
  return options.split("|").filter(Boolean);
}

function isQuestionAnsweredCorrectly(
  question: QuestionWithSection,
  answer: string | undefined,
): boolean {
  if (!answer) return false;

  if (question.type === "INFORMATIONAL") {
    return answer === INFORMATIONAL_COMPLETED_SENTINEL;
  }

  if (question.type === "NUMERIC") {
    return parseFloat(answer.trim()) === parseFloat(question.answer.trim());
  }

  if (question.answerIsRegex) {
    try {
      return new RegExp(question.answer).test(answer.trim());
    } catch {
      return false;
    }
  }

  return answer.trim() === question.answer.trim();
}

function QuestionBox({
  question,
  existingAnswer,
  revealedHintIds,
}: {
  question: QuestionWithSection;
  existingAnswer: UserAnswer | undefined;
  revealedHintIds: Set<string>;
}) {
  const router = useRouter();
  const isInformational = question.type === "INFORMATIONAL";
  const options = parseOptions(question.options);
  const isInitiallyCorrect = isQuestionAnsweredCorrectly(
    question,
    existingAnswer?.answer,
  );

  function initOrderedItems(): string[] {
    if (question.type !== "ORDERING") return [];
    if (existingAnswer) return existingAnswer.answer.split("|").filter(Boolean);
    return options;
  }

  const initialHintsRevealed = question.hints.filter((h) =>
    revealedHintIds.has(h.id)
  ).length;

  const [state, setState] = useState<AnswerState>({
    value: existingAnswer?.answer ?? "",
    orderedItems: initOrderedItems(),
    submitting: false,
    correct: isInformational || !existingAnswer ? null : isInitiallyCorrect,
    validationError: null,
    hintsRevealed: initialHintsRevealed,
    informationalCompleted: existingAnswer?.answer === INFORMATIONAL_COMPLETED_SENTINEL,
  });

  const isQuestionComplete = isInformational
    ? state.informationalCompleted
    : state.correct === true;

  function validate(value: string): string | null {
    if (question.type !== "TEXT" && question.type !== "LONG_TEXT") return null;
    if (!question.validationRegex) return null;
    try {
      const regex = new RegExp(question.validationRegex);
      if (!regex.test(value)) return `Answer must match: ${question.validationRegex}`;
    } catch {
      // invalid regex stored — skip client validation
    }
    return null;
  }

  async function handleSubmit() {
    let submitValue = state.value;
    if (isInformational) {
      submitValue = INFORMATIONAL_COMPLETED_SENTINEL;
    }
    if (question.type === "ORDERING") {
      submitValue = state.orderedItems.filter(Boolean).join("|");
    }
    const error = validate(submitValue);
    if (error) {
      setState((s) => ({ ...s, validationError: error }));
      return;
    }
    setState((s) => ({ ...s, submitting: true, validationError: null }));
    const { correct } = await submitAnswer(question.id, submitValue);
    setState((s) => ({
      ...s,
      submitting: false,
      correct: isInformational ? null : correct,
      value: submitValue,
      informationalCompleted:
        isInformational && submitValue === INFORMATIONAL_COMPLETED_SENTINEL,
    }));
    router.refresh();
  }

  function moveUp(i: number) {
    setState((s) => {
      const items = [...s.orderedItems];
      [items[i - 1], items[i]] = [items[i], items[i - 1]];
      return { ...s, orderedItems: items, correct: null };
    });
  }

  function moveDown(i: number) {
    setState((s) => {
      const items = [...s.orderedItems];
      [items[i], items[i + 1]] = [items[i + 1], items[i]];
      return { ...s, orderedItems: items, correct: null };
    });
  }

  const isSubmitDisabled =
    state.submitting ||
    (!isInformational && question.type !== "ORDERING" && !state.value.trim());

  const inputBorderClass =
    state.validationError
      ? "input-error"
      : state.correct === true
        ? "input-success"
        : state.correct === false
          ? "input-error"
          : "";

  const cardClassName = isQuestionComplete
    ? "card bg-base-100 border-2 border-success shadow-sm shadow-success/20"
    : "card bg-base-100 border border-base-300";

  return (
    <div className={cardClassName}>
      <div className="card-body p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{question.title}</p>
          <span className="badge badge-ghost badge-sm shrink-0">
            {isInformational ? 0 : question.pointValue} pts
          </span>
        </div>

        {isQuestionComplete && (
          <div className="rounded-box border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <IconRosetteDiscountCheck size={16} />
              {isInformational ? "Completed" : "Correct"}
            </span>
          </div>
        )}

        {isInformational && (
          <div className="flex flex-col gap-3">
            <div className="alert py-2 text-sm gap-2">
              <IconInfoCircle size={16} className="shrink-0" />
              <span className="whitespace-pre-wrap">{question.answer}</span>
            </div>
            <button
              className="btn btn-primary shrink-0 self-start"
              onClick={handleSubmit}
              disabled={state.submitting || state.informationalCompleted}
            >
              {state.submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : state.informationalCompleted ? (
                "Continued"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        )}

        {(question.type === "TEXT") && (
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                className={`input input-bordered w-full ${inputBorderClass}`}
                placeholder={question.placeholder}
                value={state.value}
                onChange={(e) =>
                  setState((s) => ({ ...s, value: e.target.value, validationError: null, correct: null }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {state.validationError && (
                <p className="text-error text-xs mt-1">{state.validationError}</p>
              )}
            </div>
            <SubmitButton submitting={state.submitting} disabled={isSubmitDisabled} onSubmit={handleSubmit} />
          </div>
        )}

        {(question.type === "LONG_TEXT") && (
          <div className="flex flex-col gap-2">
            <textarea
              className={`textarea textarea-bordered w-full ${
                state.correct === true ? "textarea-success" : state.correct === false ? "textarea-error" : ""
              }`}
              placeholder={question.placeholder}
              value={state.value}
              rows={4}
              onChange={(e) =>
                setState((s) => ({ ...s, value: e.target.value, validationError: null, correct: null }))
              }
            />
            {state.validationError && (
              <p className="text-error text-xs">{state.validationError}</p>
            )}
            <SubmitButton submitting={state.submitting} disabled={isSubmitDisabled} onSubmit={handleSubmit} />
          </div>
        )}

        {(question.type === "NUMERIC") && (
          <div className="flex gap-2">
            <input
              type="number"
              className={`input input-bordered flex-1 ${inputBorderClass}`}
              placeholder={question.placeholder}
              value={state.value}
              onChange={(e) =>
                setState((s) => ({ ...s, value: e.target.value, correct: null }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <SubmitButton submitting={state.submitting} disabled={isSubmitDisabled} onSubmit={handleSubmit} />
          </div>
        )}

        {(question.type === "MULTIPLE_CHOICE") && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="radio radio-primary"
                    name={question.id}
                    value={opt}
                    checked={state.value === opt}
                    onChange={() => setState((s) => ({ ...s, value: opt, correct: null }))}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            <SubmitButton submitting={state.submitting} disabled={isSubmitDisabled} onSubmit={handleSubmit} />
          </div>
        )}

        {(question.type === "TRUE_FALSE") && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-6">
              {["True", "False"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="radio radio-primary"
                    name={question.id}
                    value={opt}
                    checked={state.value === opt}
                    onChange={() => setState((s) => ({ ...s, value: opt, correct: null }))}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            <SubmitButton submitting={state.submitting} disabled={isSubmitDisabled} onSubmit={handleSubmit} />
          </div>
        )}

        {(question.type === "ORDERING") && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {state.orderedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-base-200 rounded px-3 py-1.5"
                >
                  <span className="text-base-content/40 text-xs w-4 shrink-0">{i + 1}.</span>
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => moveDown(i)}
                    disabled={i === state.orderedItems.length - 1}
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
            <SubmitButton submitting={state.submitting} disabled={false} onSubmit={handleSubmit} />
          </div>
        )}

        {!isInformational && state.correct === true && (
          <div className="flex items-center gap-1.5 text-success text-sm">
            <IconCheck size={16} />
            Correct!
          </div>
        )}
        {!isInformational && state.correct === false && (
          <div className="flex items-center gap-1.5 text-error text-sm">
            <IconX size={16} />
            Incorrect — try again.
          </div>
        )}

        {question.hints.length > 0 && state.correct !== true && (
          <div className="flex flex-col gap-2 pt-1 border-t border-base-300">
            {question.hints.slice(0, state.hintsRevealed).map((hint, i) => (
              <div key={hint.id} className="alert alert-info py-2 text-sm gap-2">
                <IconBulb size={16} className="shrink-0" />
                <span><span className="font-medium">Hint {i + 1}:</span> {hint.text}</span>
              </div>
            ))}
            {state.hintsRevealed < question.hints.length && (
              <button
                type="button"
                className="btn btn-ghost btn-sm self-start gap-1.5"
                onClick={() => {
                  const nextHint = question.hints[state.hintsRevealed];
                  if (nextHint) revealHint(nextHint.id);
                  setState((s) => ({ ...s, hintsRevealed: s.hintsRevealed + 1 }));
                }}
              >
                <IconBulb size={14} />
                {state.hintsRevealed === 0
                  ? `Show hint (${question.hints.length} available)`
                  : `Show hint ${state.hintsRevealed + 1} of ${question.hints.length}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitButton({
  submitting,
  disabled,
  onSubmit,
}: {
  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <button className="btn btn-primary shrink-0" onClick={onSubmit} disabled={disabled}>
      {submitting ? <span className="loading loading-spinner loading-sm" /> : "Submit"}
    </button>
  );
}

export default function QuestionsPanel({
  questions,
  sections,
  userAnswers,
  correctQuestionIds,
  revealedHintIds = [],
}: {
  questions: QuestionWithSection[];
  sections: Section[];
  userAnswers: UserAnswer[];
  correctQuestionIds: string[];
  revealedHintIds?: string[];
}) {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const unsectioned = questions
    .filter((q) => !q.sectionId)
    .sort((a, b) => a.order - b.order);

  const answerMap = Object.fromEntries(userAnswers.map((a) => [a.questionId, a]));
  const correctSet = new Set(correctQuestionIds);
  const revealedHintSet = new Set(revealedHintIds);
  const completedCount = questions.filter((q) => correctSet.has(q.id)).length;
  const totalCount = questions.length;
  const allQuestionsComplete = totalCount > 0 && completedCount === totalCount;

  // Build a flat ordered list: unsectioned first, then sections in order
  const flatOrder: QuestionWithSection[] = [
    ...unsectioned,
    ...sortedSections.flatMap((s) =>
      questions.filter((q) => q.sectionId === s.id).sort((a, b) => a.order - b.order),
    ),
  ];

  // A question is visible if all questions before it in the flat list are correct
  const visibleIds = new Set<string>();
  for (const q of flatOrder) {
    visibleIds.add(q.id);
    if (!correctSet.has(q.id)) break; // stop unlocking after first incomplete question
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      {totalCount > 0 && (
        <div
          className={`rounded-box border px-4 py-3 ${
            allQuestionsComplete
              ? "border-success bg-success/10 text-success"
              : "border-base-300 bg-base-200/60 text-base-content"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconRosetteDiscountCheck size={18} className={allQuestionsComplete ? "" : "text-base-content/50"} />
              <div>
                <p className="font-medium">
                  {allQuestionsComplete ? "All questions complete" : "Question progress"}
                </p>
                <p className={`text-sm ${allQuestionsComplete ? "text-success/80" : "text-base-content/70"}`}>
                  {allQuestionsComplete
                    ? "Every question in this scenario has been completed."
                    : `${completedCount} of ${totalCount} questions completed.`}
                </p>
              </div>
            </div>
            <span className={`badge badge-lg ${allQuestionsComplete ? "badge-success" : "badge-ghost"}`}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      )}

      {unsectioned.map((q) =>
        visibleIds.has(q.id) ? (
          <QuestionBox key={q.id} question={q} existingAnswer={answerMap[q.id]} revealedHintIds={revealedHintSet} />
        ) : null,
      )}

      {sortedSections.map((section) => {
        const sectionQuestions = questions
          .filter((q) => q.sectionId === section.id)
          .sort((a, b) => a.order - b.order);
        const anyVisible = sectionQuestions.some((q) => visibleIds.has(q.id));
        const allLocked = !anyVisible;

        return (
          <div key={section.id} className="flex flex-col gap-3">
            <div className={`divider font-semibold text-sm ${allLocked ? "opacity-50" : ""}`}>
              <span className="flex items-center gap-1.5">
                {allLocked && <IconLock size={14} />}
                {section.title}
              </span>
            </div>
            {allLocked ? (
              <p className="text-sm text-base-content/50 text-center py-2">
                Complete previous questions to unlock.
              </p>
            ) : (
              sectionQuestions.map((q) =>
                visibleIds.has(q.id) ? (
                  <QuestionBox key={q.id} question={q} existingAnswer={answerMap[q.id]} revealedHintIds={revealedHintSet} />
                ) : null,
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
