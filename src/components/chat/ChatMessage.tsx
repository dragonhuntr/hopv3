import type { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import clsx from 'clsx';
import rehypeKatex from 'rehype-katex';
// @ts-expect-error
import rehypeMath from 'rehype-math';

interface ChatMessageProps {
  message: Message;
}

// Update existing type declaration
type MathComponentProps = React.ComponentProps<'code'> & {
  node?: unknown
  className?: string
  children?: React.ReactNode
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-4 ${
        isUser ? 'bg-purple-600' : 'bg-gray-800/50'
      }`}>
        <ReactMarkdown
          className="text-sm overflow-x-auto break-words leading-[1.5rem]"
          rehypePlugins={[rehypeMath, rehypeKatex, rehypeHighlight]}
          components={{
            code({ node, className, children, ...props }) {
              if (!className?.includes('math')) {
                return (
                  <code className={clsx(className, "bg-gray-900 px-1 py-0.5 rounded max-w-full break-words")} {...props}>
                    {children}
                  </code>
                )
              }
              return <code {...props}>{children}</code>
            },
            pre({ node, className, children, ...props }) {
              return (
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-1">
                  <code className="block bg-inherit p-0 text-sm">
                    {children}
                  </code>
                </pre>
              )
            },
            p: ({ node, ...props }) => <p className="mb-1" {...props} />,
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-4" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="my-1" {...props} />
            )
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
} 