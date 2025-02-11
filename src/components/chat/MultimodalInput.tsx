"use client";

import { Settings, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { ModelSelector } from "@/components/chat/ModelSelector";

interface MultimodalInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  value?: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function MultimodalInput({
  onSubmit,
  onChange,
  disabled,
  value,
  selectedModel,
  onModelChange,
}: MultimodalInputProps) {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="flex w-full items-center gap-2 rounded-xl bg-gray-900/50 px-4 py-3">
        <div className="relative flex gap-2">
          <button
            className="rounded-lg p-1 transition-colors hover:bg-gray-800"
            aria-label="Model settings"
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            disabled={disabled}
          >
            <Settings size={20} className="text-gray-400" />
          </button>
          
          {isModelSelectorOpen && (
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              onClose={() => setIsModelSelectorOpen(false)}
            />
          )}

        </div>
        <form
          onSubmit={onSubmit}
          className="flex w-full items-center gap-2"
          aria-label="Send message"
        >
          <input
            type="text"
            name="message"
            placeholder="type your message.."
            disabled={disabled}
            value={value}
            onChange={onChange}
            className="ml-2 flex-1 border-none bg-transparent text-gray-200 placeholder-gray-500 outline-none"
          />

          <button
            type="submit"
            className="rounded-lg p-1 transition-colors hover:bg-gray-800"
            disabled={disabled}
            aria-label="Send message"
          >
            <SendHorizontal size={20} className="text-gray-400" />
          </button>
        </form>
      </div>
    </div>
  );
}
