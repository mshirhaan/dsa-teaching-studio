'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/appStore';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function DrawingCanvas() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const updateDrawing = useAppStore((state) => state.updateDrawing);
  const drawing = useAppStore((state) => state.drawing);
  const [isInitialized, setIsInitialized] = useState(false);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with saved data only once
  useEffect(() => {
    if (excalidrawAPI && !isInitialized && drawing.elements.length > 0) {
      excalidrawAPI.updateScene({
        elements: drawing.elements,
      });
      setIsInitialized(true);
    }
  }, [excalidrawAPI, isInitialized, drawing.elements]);

  const handleChange = useCallback((elements: any, appState: any) => {
    // Debounce updates to prevent infinite loops
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(() => {
      updateDrawing({
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
          currentItemStrokeColor: appState.currentItemStrokeColor || '#000000',
          currentItemBackgroundColor: appState.currentItemBackgroundColor || '#ffffff',
          currentItemFillStyle: appState.currentItemFillStyle || 'solid',
          currentItemStrokeWidth: appState.currentItemStrokeWidth || 2,
          currentItemRoughness: appState.currentItemRoughness || 1,
          currentItemOpacity: appState.currentItemOpacity || 100,
        },
      });
    }, 300); // Debounce for 300ms
  }, [updateDrawing]);

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full bg-gray-900">
      <Excalidraw
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        onChange={handleChange}
        theme="dark"
        initialData={{
          elements: drawing.elements,
          appState: {
            theme: 'dark',
          } as any,
        }}
      />
    </div>
  );
}

