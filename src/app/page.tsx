import { SuggestionCard } from "@/components/SuggestionCard";
import { ChatContainer } from "@/components/ChatContainer";

export default function HomePage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
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



        <ChatContainer />
      </div>
    </div>
  );
}
