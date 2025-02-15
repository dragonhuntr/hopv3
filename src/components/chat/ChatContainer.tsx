'use client';

import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MultimodalInput } from '@/components/chat/MultimodalInput';
import { generateUUID } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();
  const [clientChatId] = useState(() => generateUUID());
  const hasRedirected = useRef(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    id: chatId ?? clientChatId,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    body: {
      model: selectedModel
    }
  });

  // Add scroll hooks
  const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

  // Load existing chat history
  useEffect(() => {
    if (chatId) {
      const load = async () => {
        setIsLoadingChat(true);
        try {
          const response = await fetch(`/api/chat/${chatId}`);
          const chat = await response.json();
          if (chat?.messages) {
            setMessages(chat.messages);
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
        } finally {
          setIsLoadingChat(false);
        }
      };
      load();
    }
  }, [chatId, setMessages]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!chatId && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(`/chat/${clientChatId}`);
    }
    
    await handleSubmit(e);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('update-chat-history'));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Start a new conversation
          </div>
        )}
        
        <div ref={endRef} />
      </div>
      <div className="w-full px-4 pb-4 min-w-0">
        <MultimodalInput 
          onSubmit={handleFormSubmit}
          disabled={isLoading || isLoadingChat}
          value={input}
          onChange={handleInputChange}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
} 