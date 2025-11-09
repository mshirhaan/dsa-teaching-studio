'use client';

import { useAppStore, ViewMode } from '@/stores/appStore';
import { Layout, Code, PenTool, Map, LucideIcon } from 'lucide-react';
import { memo, useCallback, useEffect } from 'react';

interface ViewModeConfig {
  mode: ViewMode;
  icon: LucideIcon;
  label: string;
  shortcut: string;
}

const viewModes: ViewModeConfig[] = [
  { mode: 'split', icon: Layout, label: 'Split View', shortcut: '1' },
  { mode: 'code-only', icon: Code, label: 'Code Only', shortcut: '2' },
  { mode: 'draw-only', icon: PenTool, label: 'Draw Only', shortcut: '3' },
  { mode: 'roadmap', icon: Map, label: 'Roadmap', shortcut: '4' },
];

// Stable class strings to prevent flickering
const ACTIVE_CLASSES = 'bg-accent text-white shadow-md';
const INACTIVE_CLASSES = 'bg-gray-800 hover:bg-gray-600 text-gray-300';
const BASE_CLASSES = 'p-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-700';

interface ViewModeButtonProps {
  mode: ViewMode;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  isActive: boolean;
  onClick: () => void;
}

// Memoized button component to prevent flickering
const ViewModeButton = memo(({ mode, icon: Icon, label, shortcut, isActive, onClick }: ViewModeButtonProps) => {
  const buttonClasses = `${BASE_CLASSES} ${isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES}`;
  
  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      title={`${label} (${shortcut})`}
      aria-label={`${label}. Keyboard shortcut: ${shortcut}`}
      aria-pressed={isActive}
    >
      <Icon size={20} />
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.isActive === nextProps.isActive && prevProps.mode === nextProps.mode;
});

ViewModeButton.displayName = 'ViewModeButton';

const ViewModeSwitcher = memo(() => {
  const { viewMode, setViewMode } = useAppStore();

  // Memoize click handlers
  const handleSplitClick = useCallback(() => setViewMode('split'), [setViewMode]);
  const handleCodeOnlyClick = useCallback(() => setViewMode('code-only'), [setViewMode]);
  const handleDrawOnlyClick = useCallback(() => setViewMode('draw-only'), [setViewMode]);
  const handleRoadmapClick = useCallback(() => setViewMode('roadmap'), [setViewMode]);

  const handlers = {
    'split': handleSplitClick,
    'code-only': handleCodeOnlyClick,
    'draw-only': handleDrawOnlyClick,
    'roadmap': handleRoadmapClick,
  };

  // Keyboard shortcuts for view modes
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger if typing in Monaco editor or any contenteditable element
      const target = e.target as HTMLElement;
      if (
        target.closest('.monaco-editor') || 
        target.contentEditable === 'true' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          setViewMode('split');
          break;
        case '2':
          e.preventDefault();
          setViewMode('code-only');
          break;
        case '3':
          e.preventDefault();
          setViewMode('draw-only');
          break;
        case '4':
          e.preventDefault();
          setViewMode('roadmap');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setViewMode]);

  return (
    <div 
      className="flex gap-1 bg-gray-700 p-1 rounded-lg shadow-md"
      role="group"
      aria-label="View mode switcher"
    >
      {viewModes.map((config) => (
        <ViewModeButton
          key={config.mode}
          mode={config.mode}
          icon={config.icon}
          label={config.label}
          shortcut={config.shortcut}
          isActive={viewMode === config.mode}
          onClick={handlers[config.mode]}
        />
      ))}
    </div>
  );
});

ViewModeSwitcher.displayName = 'ViewModeSwitcher';

export default ViewModeSwitcher;

