'use client';

import { useAppStore, SessionMode } from '@/stores/appStore';
import { Tv, MessageCircle, Coffee, Trophy, LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface SessionModeConfig {
  value: SessionMode;
  label: string;
  icon: LucideIcon;
  color: string;
}

const sessionModes: SessionModeConfig[] = [
  { value: 'teaching', label: 'Teaching', icon: Tv, color: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'qna', label: 'Q & A', icon: MessageCircle, color: 'bg-green-600 hover:bg-green-700' },
  { value: 'break', label: 'Break', icon: Coffee, color: 'bg-orange-600 hover:bg-orange-700' },
  { value: 'challenge', label: 'Challenge', icon: Trophy, color: 'bg-purple-600 hover:bg-purple-700' },
];

const SessionModeButton = memo(() => {
  const { sessionMode, setSessionMode } = useAppStore();

  const cycleSessionMode = () => {
    const currentIndex = sessionModes.findIndex(m => m.value === sessionMode);
    const nextIndex = (currentIndex + 1) % sessionModes.length;
    setSessionMode(sessionModes[nextIndex].value);
  };

  const currentSessionMode = sessionModes.find(m => m.value === sessionMode) || sessionModes[0];
  const SessionIcon = currentSessionMode.icon;

  return (
    <button
      onClick={cycleSessionMode}
      className={`
        px-4 py-2 rounded-lg 
        flex items-center gap-2 
        ${currentSessionMode.color}
        transition-all duration-300 ease-in-out
        shadow-md hover:shadow-lg
        transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
      `}
      title={`Click to cycle session mode. Currently: ${currentSessionMode.label}`}
      aria-label={`Session mode: ${currentSessionMode.label}. Click to change.`}
    >
      <SessionIcon size={18} className="transition-transform duration-300" />
      <span className="font-medium text-white">{currentSessionMode.label}</span>
    </button>
  );
});

SessionModeButton.displayName = 'SessionModeButton';

export default SessionModeButton;

