'use client';

import { X } from 'lucide-react';

interface ConsoleProps {
  output: string;
  onClear: () => void;
}

export default function Console({ output, onClear }: ConsoleProps) {
  return (
    <div className="bg-gray-950 border-t border-gray-700 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-300">Console</span>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm text-green-400">
        {output || <span className="text-gray-500">No output yet...</span>}
      </div>
    </div>
  );
}

