'use client';

import { GripVertical } from 'lucide-react';

interface VerticalResizerProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function VerticalResizer({ onMouseDown }: VerticalResizerProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 bg-gray-700 hover:bg-accent cursor-col-resize transition-colors flex items-center justify-center group flex-shrink-0 z-30 relative"
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute">
        <GripVertical size={12} className="text-white bg-gray-700 rounded-full py-2 h-8" />
      </div>
    </div>
  );
}
