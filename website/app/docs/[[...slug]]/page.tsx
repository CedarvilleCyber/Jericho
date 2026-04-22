import { notFound } from "next/navigation";

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
