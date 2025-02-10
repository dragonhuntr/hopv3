interface SuggestionCardProps {
  icon: string;
  text: string;
}

export function SuggestionCard({ icon, text }: SuggestionCardProps) {
  return (
    <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 text-left flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-300">{text}</span>
    </button>
  );
} 