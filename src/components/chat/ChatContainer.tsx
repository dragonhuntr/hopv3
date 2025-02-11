'use client';

import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MultimodalInput } from '@/components/chat/MultimodalInput';
import { generateUUID } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();
  const [clientChatId] = useState(() => generateUUID());
  const hasRedirected = useRef(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    id: chatId ?? clientChatId,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    body: {
      model: selectedModel
    }
  });

  // Memoized chat history loader
  const loadChatHistory = useCallback(async () => {
    if (!chatId) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to load chat');
      
      const chat = await response.json();
      if (chat?.messages) {
        setMessages(chat.messages);
        toast.success('Chat history loaded');
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [chatId, setMessages]);

  // Load existing chat history
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

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
        {isLoadingHistory ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="animate-pulse bg-gray-800 rounded-lg h-16 w-4/5"
              />
            ))}
          </div>
        ) : messages.length > 0 ? (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Start a new conversation
          </div>
        )}
      </div>
      <div className="w-full px-4 pb-4 min-w-0">
        <MultimodalInput 
          onSubmit={handleFormSubmit}
          disabled={isLoading || isLoadingHistory}
          value={input}
          onChange={handleInputChange}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
} 