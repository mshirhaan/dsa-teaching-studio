'use client';

import { GripVertical } from 'lucide-react';

interface ResizerProps {
  onMouseDown: () => void;
}

export default function Resizer({ onMouseDown }: ResizerProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 bg-gray-700 hover:bg-accent cursor-col-resize transition-colors flex items-center justify-center group"
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={12} className="text-white" />
      </div>
    </div>
  );
}

