'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ChatContextType {
  isInChat: boolean;
  currentChatId: string | null;
  messagesKey: number;
  setCurrentChat: (chatId: string | null) => void;
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messagesKey, setMessagesKey] = useState<number>(0);
  const router = useRouter();
  
  // Determine if we're in a chat based on chatId existence
  const isInChat = currentChatId !== null;
  
  const setCurrentChat = useCallback((chatId: string | null) => {
    setCurrentChatId(chatId);
    
    // Update URL if needed
    if (chatId) {
      window.history.pushState(null, '', `/chat/${chatId}`);
    }
  }, []);
  
  // Function to start a new chat
  const startNewChat = useCallback(() => {
    // Clear the current chat ID
    setCurrentChatId(null);
    
    // Increment the messages key to force reset of messages in ChatContainer
    setMessagesKey(prevKey => prevKey + 1);
    
    // Navigate to the home page
    router.push('/');
  }, [router]);
  
  return (
    <ChatContext.Provider value={{ 
      isInChat, 
      currentChatId, 
      messagesKey,
      setCurrentChat,
      startNewChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
