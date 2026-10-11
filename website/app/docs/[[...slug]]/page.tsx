import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const filename = slug.at(-1);

  const documentName = filename
    ? filename
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Documentation";

  return {
    title: `Jericho | ${documentName}`,
  };
}

type Props = { params: Promise<{ slug?: string[] }> };

export default async function DocsPage({ params }: Props) {
  const { slug = [] } = await params;
  const path = slug.length ? slug.join("/") : "index";
  console.log(`Loading documentation for path: ${path}`);

  try {
    const { default: Doc } = await import(`@/docs/${path}.mdx`);
    return <Doc />;
  } catch {
    notFound();
  }
}
