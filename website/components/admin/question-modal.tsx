"use client";

import { addQuestion, updateQuestion } from "@/app/admin/scenarios/actions";
import { QuestionWithSection, QuestionType } from "./scenario-types";
import { Section } from "@/app/generated/prisma/client";
import { useState } from "react";
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from "@tabler/icons-react";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: "Short Answer",
  LONG_TEXT: "Long Answer",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  NUMERIC: "Numeric",
  ORDERING: "Ordering",
};

type FormState = {
  title: string;
  type: QuestionType;
  placeholder: string;
  validationRegex: string;
  answer: string;
  pointValue: number;
  options: string[];
  sectionId: string;
  order: number;
};

function OptionsEditor({
  options,
  answer,
  onChange,
  onAnswerChange,
}: {
  options: string[];
  answer: string;
  onChange: (opts: string[]) => void;
  onAnswerChange: (answer: string) => void;
}) {
  function addOption() {
    onChange([...options, ""]);
  }

  function removeOption(i: number) {
    const next = options.filter((_, idx) => idx !== i);
    onChange(next);
    if (answer === options[i]) onAnswerChange("");
  }

  function updateOption(i: number, value: string) {
    const next = options.map((o, idx) => (idx === i ? value : o));
    onChange(next);
    if (answer === options[i]) onAnswerChange(value);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="label">
        <span className="label-text">Options</span>
        <span className="label-text-alt text-base-content/60">Select correct answer</span>
      </div>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            className="radio radio-primary shrink-0"
            name="correct-option"
            checked={answer === opt}
            onChange={() => onAnswerChange(opt)}
            disabled={!opt}
          />
          <input
            className="input input-bordered input-sm flex-1"
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => removeOption(i)}
          >
            <IconTrash size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm self-start gap-1" onClick={addOption}>
        <IconPlus size={14} /> Add option
      </button>
    </div>
  );
}

function OrderingEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, value: string) {
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  }

  function moveDown(i: number) {
    if (i === items.length - 1) return;
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="label">
        <span className="label-text">Items (in correct order)</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-base-content/40 text-sm w-4 shrink-0">{i + 1}.</span>
          <input
            className="input input-bordered input-sm flex-1"
            value={item}
            placeholder={`Item ${i + 1}`}
            onChange={(e) => updateItem(i, e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => moveUp(i)}
            disabled={i === 0}
          >
            <IconArrowUp size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => moveDown(i)}
            disabled={i === items.length - 1}
          >
            <IconArrowDown size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => removeItem(i)}
          >
            <IconTrash size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm self-start gap-1" onClick={addItem}>
        <IconPlus size={14} /> Add item
      </button>
    </div>
  );
}

function QuestionFields({
  form,
  setForm,
  sections,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  sections: Section[];
}) {
  const showPlaceholder = form.type === "TEXT" || form.type === "LONG_TEXT" || form.type === "NUMERIC";
  const showValidationRegex = form.type === "TEXT" || form.type === "LONG_TEXT";

  function handleTypeChange(type: QuestionType) {
    setForm({ ...form, type, answer: "", options: [] });
  }

  function handleOptionsChange(opts: string[]) {
    setForm({
      ...form,
      options: opts,
      answer: opts.includes(form.answer) ? form.answer : "",
    });
  }

  function handleOrderingChange(items: string[]) {
    setForm({
      ...form,
      options: items,
      answer: items.filter(Boolean).join("|"),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="form-control">
        <div className="label"><span className="label-text">Type</span></div>
        <select
          className="select select-bordered w-full"
          value={form.type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
        >
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
            <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </label>

      <label className="form-control">
        <div className="label"><span className="label-text">Title</span></div>
        <input
          className="input input-bordered w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      {showPlaceholder && (
        <label className="form-control">
          <div className="label"><span className="label-text">Placeholder</span></div>
          <input
            className="input input-bordered w-full"
            value={form.placeholder}
            onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
          />
        </label>
      )}

      {showValidationRegex && (
        <label className="form-control">
          <div className="label"><span className="label-text">Validation Regex</span></div>
          <input
            className="input input-bordered w-full"
            value={form.validationRegex}
            placeholder="Optional"
            onChange={(e) => setForm({ ...form, validationRegex: e.target.value })}
          />
        </label>
      )}

      {(form.type === "TEXT" || form.type === "LONG_TEXT") && (
        <label className="form-control">
          <div className="label"><span className="label-text">Answer</span></div>
          {form.type === "LONG_TEXT" ? (
            <textarea
              className="textarea textarea-bordered w-full"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
          ) : (
            <input
              className="input input-bordered w-full"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
          )}
        </label>
      )}

      {form.type === "NUMERIC" && (
        <label className="form-control">
          <div className="label"><span className="label-text">Answer</span></div>
          <input
            type="number"
            className="input input-bordered w-full"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
        </label>
      )}

      {form.type === "TRUE_FALSE" && (
        <div className="form-control">
          <div className="label"><span className="label-text">Correct Answer</span></div>
          <div className="flex gap-4">
            {["True", "False"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  name="tf-answer"
                  checked={form.answer === opt}
                  onChange={() => setForm({ ...form, answer: opt })}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}

      {form.type === "MULTIPLE_CHOICE" && (
        <OptionsEditor
          options={form.options}
          answer={form.answer}
          onChange={handleOptionsChange}
          onAnswerChange={(answer) => setForm({ ...form, answer })}
        />
      )}

      {form.type === "ORDERING" && (
        <OrderingEditor items={form.options} onChange={handleOrderingChange} />
      )}

      <label className="form-control">
        <div className="label"><span className="label-text">Point Value</span></div>
        <input
          type="number"
          className="input input-bordered w-full"
          value={form.pointValue}
          onChange={(e) => setForm({ ...form, pointValue: Number(e.target.value) })}
        />
      </label>

      {sections.length > 0 && (
        <label className="form-control">
          <div className="label"><span className="label-text">Section</span></div>
          <select
            className="select select-bordered w-full"
            value={form.sectionId}
            onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
          >
            <option value="">None</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
      )}

      <label className="form-control">
        <div className="label"><span className="label-text">Order</span></div>
        <input
          type="number"
          className="input input-bordered w-full"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}

function optionsFromQuestion(q: QuestionWithSection): string[] {
  if (!q.options) return [];
  try {
    const parsed = JSON.parse(q.options);
    return Array.isArray(parsed) ? parsed : q.options.split("|").filter(Boolean);
  } catch {
    return q.options.split("|").filter(Boolean);
  }
}

export function EditQuestionModal({
  question,
  sections,
  onClose,
}: {
  question: QuestionWithSection;
  sections: Section[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    title: question.title,
    type: question.type,
    placeholder: question.placeholder,
    validationRegex: question.validationRegex ?? "",
    answer: question.answer,
    pointValue: question.pointValue,
    options: optionsFromQuestion(question),
    sectionId: question.sectionId ?? "",
    order: question.order,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const options =
      form.type === "MULTIPLE_CHOICE"
        ? JSON.stringify(form.options)
        : form.type === "ORDERING"
          ? form.options.filter(Boolean).join("|")
          : null;
    await updateQuestion(question.id, {
      ...form,
      options,
      sectionId: form.sectionId || null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Edit Question</h3>
        <QuestionFields form={form} setForm={setForm} sections={sections} />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : "Save"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export function AddQuestionModal({
  scenarioId,
  sections,
  nextOrder,
  onClose,
}: {
  scenarioId: string;
  sections: Section[];
  nextOrder: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    title: "",
    type: "TEXT",
    placeholder: "",
    validationRegex: "",
    answer: "",
    pointValue: 10,
    options: [],
    sectionId: "",
    order: nextOrder,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const options =
      form.type === "MULTIPLE_CHOICE"
        ? JSON.stringify(form.options)
        : form.type === "ORDERING"
          ? form.options.filter(Boolean).join("|")
          : null;
    await addQuestion(scenarioId, {
      ...form,
      options,
      sectionId: form.sectionId || null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Add Question</h3>
        <QuestionFields form={form} setForm={setForm} sections={sections} />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : "Add"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
