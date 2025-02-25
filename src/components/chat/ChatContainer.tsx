'use client';

import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MultimodalInput } from '@/components/chat/MultimodalInput';
import { generateUUID } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { getChatMessages, sendMessage, createChat, type Message } from '@/lib/ai';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();
  const [clientChatId] = useState(() => generateUUID());
  const hasRedirected = useRef(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add scroll hooks
  const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

  // Load existing chat history
  useEffect(() => {
    if (chatId) {
      const load = async () => {
        setIsLoadingChat(true);
        try {
          const messagesData = await getChatMessages(chatId);
          setMessages(messagesData);
        } catch (error) {
          console.error('Failed to load chat history:', error);
        } finally {
          setIsLoadingChat(false);
        }
      };
      load();
    }
  }, [chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!chatId && !hasRedirected.current) {
      await createChat({
        id: clientChatId,
        name: 'New Chat',
        isPrivate: false,
        //modelId: selectedModel,
      });
      router.replace(`/chat/${clientChatId}`);
      hasRedirected.current = true;
    }

    const currentChatId = chatId || clientChatId;
    const userMessage: Message = {
      id: generateUUID(),
      chatId: currentChatId,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);
    setInput('');
    setMessages(prev => [...prev, userMessage]);

    try {
      const stream = await sendMessage(currentChatId, {
        content: input,
        model: selectedModel
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const tempMessage: Message = {
        id: generateUUID(), // we dont need to match backend anyways
        chatId: currentChatId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (!lastMessage) return newMessages;

          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: assistantMessage
          };
          return newMessages;
        });
      }

      window.dispatchEvent(new Event('update-chat-history'));
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
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

      {(!chatId || messages.length > 0) && (
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
      )}
    </div>
  );
}