'use client';

import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }: { content: string | null | undefined }) {
  if (!content) {
    return <p className="text-muted-foreground">No content available</p>;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          h2: (props) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
          h3: (props) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
          p: (props) => <p className="mb-2" {...props} />,
          ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
          li: (props) => <li className="ml-2" {...props} />,
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: ({ inline, ...props }: Record<string, any>) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-muted p-3 rounded mb-2 overflow-x-auto" {...props} />
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
