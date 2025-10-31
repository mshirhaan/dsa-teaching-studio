'use client';

import { GripVertical } from 'lucide-react';

interface HorizontalResizerProps {
  onMouseDown: () => void;
}

export default function HorizontalResizer({ onMouseDown }: HorizontalResizerProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="h-1 bg-gray-700 hover:bg-accent cursor-row-resize transition-colors flex items-center justify-center group"
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={12} className="text-white rotate-90" />
      </div>
    </div>
  );
}

