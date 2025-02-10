'use client';

import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/components/ChatMessage';
import { MultimodalInput } from '@/components/MultimodalInput';
import { generateUUID } from '@/lib/utils';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    id: chatId,
    sendExtraMessageFields: true,
    async onResponse(response) {
      if (!chatId && response.ok) {
        const { chatId: newChatId } = await response.json();
        router.replace(`/chat/${newChatId}`);
      }
    }
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <MultimodalInput 
        onSubmit={handleFormSubmit}
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
} 