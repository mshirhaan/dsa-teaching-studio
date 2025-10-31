'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function DrawingCanvas() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  return (
    <div className="h-full w-full bg-gray-100">
      <Excalidraw
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        onChange={(elements: any, appState: any) => {
          // Handle changes
        }}
      />
    </div>
  );
}

