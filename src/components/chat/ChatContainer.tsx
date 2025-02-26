'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MultimodalInput } from '@/components/chat/MultimodalInput';
import { generateUUID } from '@/lib/utils';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useChatContext } from '@/context/ChatContext';
import {
  getChatMessages,
  sendMessage,
  createChat,
  type Message
} from '@/lib/ai';

/**
 * Props for the ChatContainer component
 */
interface ChatContainerProps {
  /** Optional ID of an existing chat */
  chatId?: string;
}

/**
 * Helper to create a new chat message
 */
const createMessage = (
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Message => ({
  id: generateUUID(),
  chatId,
  role,
  content,
  timestamp: new Date().toISOString()
});

/**
 * ChatContainer is responsible for managing the chat interface, including:
 * - Loading and displaying chat messages
 * - Handling user input
 * - Sending messages to the API
 * - Managing chat creation and redirection
 */
export function ChatContainer({ chatId }: ChatContainerProps) {
  // Get chat context
  const { setCurrentChat, messagesKey } = useChatContext();

  // State management
  const [clientChatId, setClientChatId] = useState<string>(generateUUID);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  // Loading states
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [isMessageSending, setIsMessageSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const hasRedirected = useRef<boolean>(false);

  // Scroll management
  const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

  /**
   * Reset state when navigating to a new chat or home
   */
  useEffect(() => {
    // Reset messages when chatId changes or becomes null (new chat)
    setMessages([]);
    setError(null);
    hasRedirected.current = false;
    
    // Generate a new client chat ID when starting a new chat (messagesKey changes)
    if (!chatId) {
      setClientChatId(generateUUID());
    }

    // Update the chat context with current chatId
    setCurrentChat(chatId || null);
  }, [chatId, setCurrentChat, messagesKey]);

  /**
   * Load existing chat history when chatId is available
   */
  useEffect(() => {
    if (!chatId) return;

    const loadChatHistory = async () => {
      setIsLoadingChat(true);
      setError(null);

      try {
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setError('Failed to load chat history. Please try again.');
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChatHistory();
  }, [chatId]);

  /**
   * Create a new chat if needed and update the URL optimistically
   */
  const createNewChatIfNeeded = useCallback(async () => {
    if (chatId || hasRedirected.current) return chatId || clientChatId;

    try {
      // Update the chat context (which will update the URL)
      setCurrentChat(clientChatId);
      hasRedirected.current = true;

      // Create the chat in the background without waiting for the response
      createChat({
        id: clientChatId,
        name: 'New Chat',
        isPrivate: false,
      }).catch(error => {
        console.error('Failed to create chat:', error);
        setError('Failed to create chat, but your message was sent.');
      });

      return clientChatId;
    } catch (error) {
      console.error('Failed to create chat:', error);
      setError('Failed to create chat. Please try again.');
      throw error;
    }
  }, [chatId, clientChatId, setCurrentChat]);

  /**
   * Update streaming message content
   */
  const updateStreamingMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex < 0) return newMessages;

      newMessages[lastIndex] = {
        ...newMessages[lastIndex],
        content,
        id: newMessages[lastIndex]!.id,
        chatId: newMessages[lastIndex]!.chatId,
        role: newMessages[lastIndex]!.role,
        timestamp: newMessages[lastIndex]!.timestamp
      };
      return newMessages;
    });
  }, []);

  /**
   * Extract and process content from an SSE chunk
   */
  const extractContentFromChunk = (dataContent: string): string | null => {
    try {
      const parsedData = JSON.parse(dataContent);
      
      // Extract content - handle different possible formats
      if (typeof parsedData === 'string') {
        return parsedData;
      } else if (parsedData?.content) {
        return parsedData.content;
      } else if (parsedData?.choices?.[0]?.delta?.content) {
        return parsedData.choices[0].delta.content;
      }
    } catch (e) {
      console.error('Error processing data:', e, dataContent);
    }
    return null;
  };

  /**
   * Process the AI response using Server-Sent Events (SSE)
   */
  const processResponseStream = useCallback(
    async (response: Response, currentChatId: string) => {
      // Create a temporary message to show streaming response
      const tempMessage = createMessage(currentChatId, 'assistant', '');
      setMessages(prev => [...prev, tempMessage]);

      try {
        // Check if the response is valid
        if (!response.ok) {
          throw new Error(`Response error: ${response.status} ${response.statusText}`);
        }

        // Get the response body as a readable stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        if (!reader) {
          throw new Error('Response body is null');
        }

        // Process the stream chunk by chunk
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log("Raw chunk:", chunk);
          
          // Process each line (SSE messages are line-delimited)
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            // Handle lines with or without "data: " prefix
            let dataContent = line;
            if (line.startsWith('data: ')) {
              dataContent = line.substring(6);
            } else if (line.startsWith('Raw chunk: ')) {
              dataContent = line.substring(11) + '{';
            }

            // Skip the "[DONE]" message
            if (dataContent === '[DONE]') continue;

            const content = extractContentFromChunk(dataContent);
            
            if (content) {
              assistantMessage += content;
              updateStreamingMessage(assistantMessage);
            }
          }
        }
      } catch (error) {
        console.error('Error processing SSE response:', error);
        setError('Error receiving response. Please try again.');
      }
    },
    [updateStreamingMessage]
  );

  /**
   * Handle input change in the message field
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  /**
   * Handle form submission to send a new message
   */
  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      setIsMessageSending(true);
      setError(null);

      // Create chat if needed and get the current chat ID (optimistically updates URL)
      const currentChatId = await createNewChatIfNeeded();

      // Create and add user message
      const userMessage = createMessage(currentChatId, 'user', trimmedInput);

      // Optimistically update UI
      setInput('');
      setMessages(prev => [...prev, userMessage]);

      // Send message to API and process response
      const response = await sendMessage(currentChatId, {
        content: trimmedInput,
        model: selectedModel
      });

      await processResponseStream(new Response(response), currentChatId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsMessageSending(false);
    }
  }, [input, selectedModel, createNewChatIfNeeded, processResponseStream]);

  // Component rendering functions
  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-pulse text-gray-400">Loading messages...</div>
    </div>
  );

  const renderMessages = () => (
    messages.map(message => (
      <ChatMessage key={message.id} message={message} />
    ))
  );

  const renderEmptyState = () => (
    <div className="text-center text-gray-500 mt-8">
      Start a new conversation
    </div>
  );

  const renderError = () => (
    error && (
      <div className="p-3 bg-red-100 text-red-800 rounded-md">
        {error}
      </div>
    )
  );

  // Determine if input should be disabled
  const isInputDisabled = isMessageSending || isLoadingChat;

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
      >
        {isLoadingChat
          ? renderLoadingState()
          : messages.length > 0
            ? renderMessages()
            : renderEmptyState()
        }

        {renderError()}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      {(!chatId || messages.length > 0) && (
        <div className="w-full px-4 pb-4 min-w-0">
          <MultimodalInput
            onSubmit={handleFormSubmit}
            disabled={isInputDisabled}
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