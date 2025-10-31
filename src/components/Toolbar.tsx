'use client';

import { useAppStore } from '@/stores/appStore';
import { 
  Layout, Code, PenTool, Download, 
  Upload, Save
} from 'lucide-react';
import { useState, useRef } from 'react';

export default function Toolbar() {
  const { viewMode, setViewMode, saveSession } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveSession();
    alert('Session saved!');
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const session = JSON.parse(event.target?.result as string);
        useAppStore.getState().loadSession(session);
        alert('Session loaded!');
      } catch (error) {
        alert('Failed to load session');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCode = () => {
    const code = useAppStore.getState().codeEditor.code;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ViewModeButton = ({ mode, icon: Icon, label }: { mode: any; icon: any; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`p-2 rounded-lg transition-colors ${
        viewMode === mode ? 'bg-accent text-white' : 'bg-gray-800 hover:bg-gray-700'
      }`}
      title={label}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-accent mr-4">DSA Studio</h1>
        
        <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
          <ViewModeButton mode="split" icon={Layout} label="Split View" />
          <ViewModeButton mode="code-only" icon={Code} label="Code Only" />
          <ViewModeButton mode="draw-only" icon={PenTool} label="Draw Only" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-2 bg-accent hover:bg-blue-700 rounded-lg flex items-center gap-2"
        >
          <Save size={16} />
          Save
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <Upload size={16} />
          Load
        </button>

        <button
          onClick={handleExportCode}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
      </div>
    </div>
  );
}

