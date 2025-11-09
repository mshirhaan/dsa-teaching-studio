'use client';

import { BookOpen } from 'lucide-react';
import { memo } from 'react';
import SessionModeButton from './SessionModeButton';
import TimerControl from './TimerControl';
import ViewModeSwitcher from './ViewModeSwitcher';
import ActionButtons from './ActionButtons';

const Toolbar = memo(() => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shadow-lg">
      {/* Left section: Logo and Title */}
      <div className="flex items-center gap-2">
        <BookOpen size={28} className="text-accent transition-transform duration-300 hover:scale-110" />
        <h1 className="text-xl font-bold text-accent mr-4 tracking-wide">WorkPad</h1>
      </div>

      {/* Center section: Session mode, Timer, and View Mode */}
      <div className="flex items-center gap-3">
        <SessionModeButton />
        <TimerControl />
        <ViewModeSwitcher />
      </div>

      {/* Right section: Action Buttons */}
      <ActionButtons />
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
