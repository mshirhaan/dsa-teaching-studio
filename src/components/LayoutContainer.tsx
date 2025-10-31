'use client';

import { useAppStore } from '@/stores/appStore';
import CodeEditor from './CodeEditor';
import DrawingCanvas from './DrawingCanvas';
import Resizer from './Resizer';
import { useCallback, useRef, useState, useEffect } from 'react';

export default function LayoutContainer() {
  const { viewMode, splitRatio, setSplitRatio } = useAppStore();
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSplitRatio(Math.min(Math.max(percentage, 20), 80));
  }, [isResizing, setSplitRatio]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const renderLayout = () => {
    switch (viewMode) {
      case 'code-only':
        return (
          <div className="h-full w-full">
            <CodeEditor />
          </div>
        );
      
      case 'draw-only':
        return (
          <div className="h-full w-full">
            <DrawingCanvas />
          </div>
        );
      
      case 'split':
        return (
          <div ref={containerRef} className="flex h-full relative">
            <div className="h-full" style={{ width: `${splitRatio}%` }}>
              <CodeEditor />
            </div>
            <Resizer onMouseDown={handleMouseDown} />
            <div className="h-full" style={{ width: `${100 - splitRatio}%` }}>
              <DrawingCanvas />
            </div>
          </div>
        );
      
      case 'pip':
        return (
          <div className="h-full w-full relative">
            <DrawingCanvas />
            <div className="absolute top-4 right-4 w-[600px] h-[400px] rounded-lg shadow-2xl overflow-hidden border-2 border-gray-700">
              <CodeEditor />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <div className="flex-1 overflow-hidden">{renderLayout()}</div>;
}

