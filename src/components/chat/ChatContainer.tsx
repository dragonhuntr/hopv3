'use client';

import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MultimodalInput } from '@/components/chat/MultimodalInput';
import { generateUUID } from '@/lib/utils';
import { useState, useRef } from 'react';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();

  // we use a client-side generated chatId if it is a new chat
  const [clientChatId] = useState(() => generateUUID());
  const hasRedirected = useRef(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    id: chatId ?? clientChatId,
    sendExtraMessageFields: true,
    // use uuid for ids
    generateId: generateUUID
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // only redirect on new chats
    if (!chatId && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(`/chat/${clientChatId}`);
    }
    
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div className="w-full px-4 pb-4 min-w-0">
        <MultimodalInput 
          onSubmit={handleFormSubmit}
          disabled={isLoading}
          value={input}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
} 