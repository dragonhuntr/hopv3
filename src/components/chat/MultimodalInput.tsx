"use client";

import { Search, Settings, SendHorizontal } from "lucide-react";

interface MultimodalInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  value?: string;
}

export function MultimodalInput({
  onSubmit,
  onChange,
  disabled,
  value,
}: MultimodalInputProps) {
  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="flex w-full items-center gap-2 rounded-xl bg-gray-900/50 px-4 py-3">
        <div className="flex gap-2">
          <button
            className="rounded-lg p-1 transition-colors hover:bg-gray-800"
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-400" />
          </button>

          <Search size={20} className="mt-1 text-gray-400" />
        </div>
        <form
          onSubmit={onSubmit}
          className="flex w-full items-center gap-2"
          aria-label="Send message"
        >
          <input
            type="text"
            name="message"
            placeholder="What will you find out today?"
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
