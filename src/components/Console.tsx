'use client';

import { X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface ConsoleProps {
  output: string;
  onClear: () => void;
}

export default function Console({ output, onClear }: ConsoleProps) {
  const fontSize = useAppStore((state) => state.codeEditor.fontSize);

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
      <div
        className="flex-1 overflow-auto p-4 font-mono text-green-400 leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
      >
        {output ? (
          output.split('\n').map((line, i) => (
            <div
              key={i}
              className={`${line.startsWith('ERROR:') || line.startsWith('Error:') || line.includes('Exception')
                ? 'text-red-400'
                : 'text-green-400'
                }`}
            >
              {line}
            </div>
          ))
        ) : (
          <span className="text-gray-500">No output yet...</span>
        )}
      </div>
    </div>
  );
}

