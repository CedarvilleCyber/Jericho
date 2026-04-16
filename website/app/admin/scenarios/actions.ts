"use server";

import prisma from "@/lib/prisma";
import { QuestionType } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function updateScenario(
  id: string,
  data: {
    name: string;
    description: string;
    slug: string;
    topologyURL: string;
    topology: object | null;
    teaserText: string;
    teaserImageURL: string;
    learningObjectives: string;
  },
) {
  await prisma.scenario.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      slug: data.slug,
      topologyURL: data.topologyURL || null,
      topology: data.topology ?? undefined,
      teaserText: data.teaserText || null,
      teaserImageURL: data.teaserImageURL || null,
      learningObjectives: data.learningObjectives || null,
    },
  });
  revalidatePath("/admin/scenarios");
}

export async function updateQuestion(
  id: string,
  data: {
    title: string;
    placeholder: string;
    validationRegex: string;
    answer: string;
    answerIsRegex: boolean;
    pointValue: number;
    type: QuestionType;
    options: string | null;
    sectionId: string | null;
    order: number;
    hints: { text: string; order: number }[];
  },
) {
  await prisma.question.update({
    where: { id },
    data: {
      title: data.title,
      placeholder: data.placeholder,
      validationRegex: data.validationRegex || null,
      answer: data.answer,
      answerIsRegex: data.answerIsRegex,
      pointValue: data.pointValue,
      type: data.type,
      options: data.options || null,
      sectionId: data.sectionId || null,
      order: data.order,
    },
  });
  await prisma.hint.deleteMany({ where: { questionId: id } });
  if (data.hints.length > 0) {
    await prisma.hint.createMany({
      data: data.hints.map((h) => ({ questionId: id, text: h.text, order: h.order })),
    });
  }
  revalidatePath("/admin/scenarios");
}

export async function addQuestion(
  scenarioId: string,
  data: {
    title: string;
    placeholder: string;
    validationRegex: string;
    answer: string;
    answerIsRegex: boolean;
    pointValue: number;
    type: QuestionType;
    options: string | null;
    sectionId: string | null;
    order: number;
    hints: { text: string; order: number }[];
  },
) {
  const question = await prisma.question.create({
    data: {
      scenarioId,
      title: data.title,
      placeholder: data.placeholder,
      validationRegex: data.validationRegex || null,
      answer: data.answer,
      answerIsRegex: data.answerIsRegex,
      pointValue: data.pointValue,
      type: data.type,
      options: data.options || null,
      sectionId: data.sectionId || null,
      order: data.order,
    },
  });
  if (data.hints.length > 0) {
    await prisma.hint.createMany({
      data: data.hints.map((h) => ({ questionId: question.id, text: h.text, order: h.order })),
    });
  }
  revalidatePath("/admin/scenarios");
}

export async function deleteQuestion(id: string) {
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/scenarios");
}

export async function createScenario(data: {
  name: string;
  description: string;
  slug: string;
  topologyURL: string;
  topology: object | null;
  teaserText: string;
  teaserImageURL: string;
  learningObjectives: string;
}) {
  await prisma.scenario.create({
    data: {
      name: data.name,
      description: data.description,
      slug: data.slug,
      topologyURL: data.topologyURL || null,
      topology: data.topology ?? undefined,
      teaserText: data.teaserText || null,
      teaserImageURL: data.teaserImageURL || null,
      learningObjectives: data.learningObjectives || null,
    },
  });
  revalidatePath("/admin/scenarios");
}

export async function addSection(
  scenarioId: string,
  data: { title: string; order: number },
) {
  await prisma.section.create({
    data: { scenarioId, title: data.title, order: data.order },
  });
  revalidatePath("/admin/scenarios");
}

export async function updateSection(
  id: string,
  data: { title: string; order: number },
) {
  await prisma.section.update({
    where: { id },
    data: { title: data.title, order: data.order },
  });
  revalidatePath("/admin/scenarios");
}

export async function deleteSection(id: string) {
  await prisma.section.delete({ where: { id } });
  revalidatePath("/admin/scenarios");
}

export async function addLivestream(
  scenarioId: string,
  data: { label: string; streamKey: string; order: number },
) {
  await prisma.scenarioLivestream.create({
    data: { scenarioId, label: data.label, streamKey: data.streamKey, order: data.order },
  });
  revalidatePath("/admin/scenarios");
}

export async function updateLivestream(
  id: string,
  data: { label: string; streamKey: string; order: number },
) {
  await prisma.scenarioLivestream.update({
    where: { id },
    data: { label: data.label, streamKey: data.streamKey, order: data.order },
  });
  revalidatePath("/admin/scenarios");
}

export async function deleteLivestream(id: string) {
  await prisma.scenarioLivestream.delete({ where: { id } });
  revalidatePath("/admin/scenarios");
}
