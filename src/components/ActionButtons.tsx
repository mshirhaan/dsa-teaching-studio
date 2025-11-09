'use client';

import { useAppStore } from '@/stores/appStore';
import { Save, Upload, Download, Cloud, Settings as SettingsIcon } from 'lucide-react';
import { useRef, useState, memo } from 'react';
import GitHubSettingsModal from './GitHubSettingsModal';
import AuthModal from './AuthModal';

const ActionButtons = memo(() => {
  const { saveSession, github, showToolbarButtons, setShowToolbarButtons } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <>
      <div 
        className={`
          flex items-center bg-gray-800 rounded-lg py-1.5 
          border border-gray-600 shadow-lg 
          transition-all duration-300 ease-in-out
          ${showToolbarButtons ? 'px-2 gap-1.5' : 'px-1.5'}
        `}
      >
        {/* Settings/gear icon to toggle button visibility */}
        <button
          onClick={() => setShowToolbarButtons(!showToolbarButtons)}
          className="
            px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md 
            flex items-center justify-center 
            transition-all duration-300 ease-in-out
            transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-800
            shadow-sm
          "
          title={showToolbarButtons ? 'Hide toolbar buttons' : 'Show toolbar buttons'}
          aria-label={showToolbarButtons ? 'Hide toolbar buttons' : 'Show toolbar buttons'}
          aria-expanded={showToolbarButtons}
        >
          <SettingsIcon 
            size={18} 
            className={`transition-transform duration-300 ${showToolbarButtons ? 'rotate-90' : 'rotate-0'}`} 
          />
        </button>

        {/* Divider line - only show when buttons are visible */}
        {showToolbarButtons && (
          <div className="h-6 w-px bg-gray-600 transition-all duration-300" />
        )}

        {/* Action buttons with smooth show/hide animation */}
        <div 
          className={`
            flex items-center gap-1.5 
            transition-all duration-300 ease-in-out
            overflow-hidden
            ${showToolbarButtons 
              ? 'opacity-100 max-w-[1000px]' 
              : 'opacity-0 max-w-0'
            }
          `}
        >
          <button
            onClick={() => setShowAuthModal(true)}
            className="
              px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded-md 
              flex items-center gap-2 text-white 
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              whitespace-nowrap shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
            "
            title="Cloud Backup"
            aria-label="Open cloud backup"
          >
            <Cloud size={16} />
            <span className="text-sm font-medium">Backup</span>
          </button>

          <button
            onClick={() => setShowGitHubSettings(true)}
            className={`
              px-3 py-1.5 rounded-md 
              flex items-center gap-2 
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              whitespace-nowrap shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
              ${github.initialized && github.token
                ? 'bg-green-700 hover:bg-green-600 text-white focus:ring-green-500'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500'
              }
            `}
            title={github.initialized && github.token ? 'GitHub Connected' : 'Configure GitHub'}
            aria-label={github.initialized && github.token ? 'GitHub settings (connected)' : 'Configure GitHub'}
          >
            <SettingsIcon size={16} />
            <span className="text-sm font-medium">GitHub</span>
          </button>

          <button
            onClick={handleSave}
            className="
              px-3 py-1.5 bg-accent hover:bg-blue-700 rounded-md 
              flex items-center gap-2 text-white 
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              whitespace-nowrap shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
            "
            title="Save session"
            aria-label="Save current session"
          >
            <Save size={16} />
            <span className="text-sm font-medium">Save</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md 
              flex items-center gap-2 text-gray-300 
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              whitespace-nowrap shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800
            "
            title="Load session"
            aria-label="Load saved session"
          >
            <Upload size={16} />
            <span className="text-sm font-medium">Load</span>
          </button>

          <button
            onClick={handleExportCode}
            className="
              px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md 
              flex items-center gap-2 text-gray-300 
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              whitespace-nowrap shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800
            "
            title="Export code"
            aria-label="Export code to file"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      <GitHubSettingsModal 
        isOpen={showGitHubSettings} 
        onClose={() => setShowGitHubSettings(false)} 
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;

