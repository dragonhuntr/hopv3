import type { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import clsx from 'clsx';
import rehypeKatex from 'rehype-katex';
// @ts-expect-error
import rehypeMath from 'rehype-math';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [expandedThinkBlocks, setExpandedThinkBlocks] = useState<Set<number>>(new Set());
  
  const parseThinkBlocks = (content: string) => {
    const parts = content.split(/(<think>|<\/think>)/g);
    const parsedParts = [];
    let isInThink = false;
    let buffer = '';
    let index = 0;

    for (const part of parts) {
      if (part === '<think>') {
        if (isInThink) {
          buffer += part;
        } else {
          if (buffer) {
            parsedParts.push({ type: 'text', content: buffer, index: index++ });
            buffer = '';
          }
          isInThink = true;
        }
      } else if (part === '</think>') {
        if (isInThink) {
          parsedParts.push({ type: 'think', content: buffer, index: index++ });
          buffer = '';
          isInThink = false;
        } else {
          buffer += part;
        }
      } else {
        if (isInThink) {
          buffer += part;
        } else {
          buffer += part;
        }
      }
    }

    if (buffer) {
      parsedParts.push({
        type: isInThink ? 'think' : 'text',
        content: buffer,
        index: index++
      });
    }

    return parsedParts;
  };

  const toggleThinkBlock = (index: number) => {
    setExpandedThinkBlocks(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-4 ${
        isUser ? 'bg-purple-600' : 'bg-gray-800/50'
      }`}>
        {(isUser ? [{type: 'text', content: message.content, index: 0}] : parseThinkBlocks(message.content)).map((part) => {
          if (!isUser && part.type === 'think') {
            return (
              <details
                key={part.index}
                className="group my-1 bg-gray-900 rounded-lg p-2"
                open={expandedThinkBlocks.has(part.index)}
              >
                <summary 
                  className="flex items-center cursor-pointer list-none text-sm text-gray-400"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleThinkBlock(part.index);
                  }}
                >
                  <span className="flex-1">Model is thinking...</span>
                  <svg
                    className={`transform transition-transform ${
                      expandedThinkBlocks.has(part.index) ? 'rotate-180' : ''
                    }`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </summary>
                <div className="mt-2 text-gray-300 text-sm">
                  <ReactMarkdown
                    rehypePlugins={undefined}
                    components={{
                      code: ({ node, className, children, ...props }) => (
                        <code className={clsx(className, "bg-gray-800 px-1 py-0.5 rounded")} {...props}>
                          {children}
                        </code>
                      )
                    }}
                  >
                    {part.content}
                  </ReactMarkdown>
                </div>
              </details>
            );
          }
          return isUser ? (
            <div 
              key={part.index}
              className="text-sm whitespace-pre-wrap break-words leading-[1.5rem]"
            >
              {part.content}
            </div>
          ) : (
            <ReactMarkdown
              key={part.index}
              className="text-sm overflow-x-auto break-words leading-[1.5rem]"
              rehypePlugins={[rehypeMath, rehypeKatex, rehypeHighlight]}
              components={{
                code({ node, className, children, ...props }) {
                  return (
                    <code className={clsx(className, "bg-gray-900 px-1 py-0.5 rounded max-w-full break-all")} {...props}>
                      {children}
                    </code>
                  )
                },
                pre({ node, className, children, ...props }) {
                  return (
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-1 max-w-[65vw] whitespace-pre">
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
              {part.content}
            </ReactMarkdown>
          );
        })}
      </div>
    </div>
  );
} 