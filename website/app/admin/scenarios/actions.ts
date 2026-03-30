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
    youtubeChannelId: string;
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
      youtubeChannelId: data.youtubeChannelId || null,
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
    pointValue: number;
    type: QuestionType;
    options: string | null;
    sectionId: string | null;
    order: number;
  },
) {
  await prisma.question.update({
    where: { id },
    data: {
      title: data.title,
      placeholder: data.placeholder,
      validationRegex: data.validationRegex || null,
      answer: data.answer,
      pointValue: data.pointValue,
      type: data.type,
      options: data.options || null,
      sectionId: data.sectionId || null,
      order: data.order,
    },
  });
  revalidatePath("/admin/scenarios");
}

export async function addQuestion(
  scenarioId: string,
  data: {
    title: string;
    placeholder: string;
    validationRegex: string;
    answer: string;
    pointValue: number;
    type: QuestionType;
    options: string | null;
    sectionId: string | null;
    order: number;
  },
) {
  await prisma.question.create({
    data: {
      scenarioId,
      title: data.title,
      placeholder: data.placeholder,
      validationRegex: data.validationRegex || null,
      answer: data.answer,
      pointValue: data.pointValue,
      type: data.type,
      options: data.options || null,
      sectionId: data.sectionId || null,
      order: data.order,
    },
  });
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
  youtubeChannelId: string;
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
      youtubeChannelId: data.youtubeChannelId || null,
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
