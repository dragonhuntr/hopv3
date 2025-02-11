import { models } from '@/lib/ai/models';
import { Zap, Image } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onClose: () => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  onClose,
}: ModelSelectorProps) {
  return (
    <div
      className="absolute left-0 bottom-10 z-10 min-w-[200px] rounded-lg bg-gray-900 p-2 shadow-xl"
      onBlur={onClose}
      role="menu"
    >
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => {
            onModelChange(model.id);
            onClose();
          }}
          className={`w-full rounded mb-2 px-3 py-2 text-left text-sm flex items-center gap-2 ${
            model.id === selectedModel
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          role="menuitem"
        >
          <span className="flex-1">{model.label}</span>
          <div className="flex gap-1">
            {model.vision && (
              <span className="text-blue-400">
                <Image className="w-4 h-4" />
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
} 