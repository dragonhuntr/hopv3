'use client';

import { SuggestionCard } from "@/components/chat/SuggestionCard";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { AuthGuard } from "@/components/AuthGuard";
import { useChatContext } from "@/context/ChatContext";

export default function HomePage() {
  // Get chat state from context
  const { isInChat } = useChatContext();

  return (
    <AuthGuard>
      <div className="h-full flex flex-col items-center justify-center p-8">
        {!isInChat && (
          <div className="max-w-2xl w-full space-y-8">
            <h1 className="text-3xl font-bold text-center">
              What insight will you find?
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <SuggestionCard
                icon="🍰"
                text="Find recipes for the best spongecake"
              />
              <SuggestionCard
                icon="🛠️"
                text="Recommend productivity tools"
              />
              <SuggestionCard
                icon="✈️"
                text="Plan me a trip to France"
              />
              <SuggestionCard
                icon="🤖"
                text="Explain ML transformers"
              />
            </div>
          </div>
        )}
        
        <div className="max-w-2xl w-full">
          <ChatContainer />
        </div>
      </div>
    </AuthGuard>
  );
}
