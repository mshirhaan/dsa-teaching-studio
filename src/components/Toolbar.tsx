'use client';

import { useAppStore } from '@/stores/appStore';
import { 
  Layout, Code, PenTool, Download, 
  Upload, Save, Tv, MessageCircle,
  Coffee, Trophy, Clock, Play, Pause, RotateCcw, Map, Settings, Network, Cloud
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import GitHubSettingsModal from './GitHubSettingsModal';
import AuthModal from './AuthModal';

export default function Toolbar() {
  const { 
    viewMode, 
    setViewMode, 
    saveSession,
    sessionMode,
    setSessionMode,
    timerMinutes,
    timerSeconds,
    timerSetMinutes,
    isTimerRunning,
    setTimerMinutes,
    setTimerSeconds,
    setTimerSetMinutes,
    setIsTimerRunning,
    resetTimer,
    github,
    showToolbarButtons,
    setShowToolbarButtons,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);
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

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;
    setIsTimeUp(false); // Reset time up state when timer starts

    const interval = setInterval(() => {
      if (timerSeconds > 0) {
        setTimerSeconds(timerSeconds - 1);
      } else if (timerMinutes > 0) {
        setTimerMinutes(timerMinutes - 1);
        setTimerSeconds(59);
      } else {
        // Timer reached 00:00
        setIsTimerRunning(false);
        setIsTimeUp(true);
        
        // Play alarm sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, setTimerMinutes, setTimerSeconds, setIsTimerRunning]);

  // Keyboard shortcuts for view modes
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setViewMode]);

  const sessionModes = [
    { value: 'teaching' as const, label: 'Teaching', icon: Tv, color: 'bg-blue-600' },
    { value: 'qna' as const, label: 'Q & A', icon: MessageCircle, color: 'bg-green-600' },
    { value: 'break' as const, label: 'Break', icon: Coffee, color: 'bg-orange-600' },
    { value: 'challenge' as const, label: 'Challenge', icon: Trophy, color: 'bg-purple-600' },
  ];

  const cycleSessionMode = () => {
    const currentIndex = sessionModes.findIndex(m => m.value === sessionMode);
    const nextIndex = (currentIndex + 1) % sessionModes.length;
    setSessionMode(sessionModes[nextIndex].value);
  };

  const currentSessionMode = sessionModes.find(m => m.value === sessionMode) || sessionModes[0];
  const SessionIcon = currentSessionMode.icon;

  const handleSetTimer = (minutes: number) => {
    setTimerSetMinutes(minutes);
    setCustomMinutes('');
    setIsTimeUp(false);
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 999) {
      setTimerSetMinutes(mins);
      setCustomMinutes('');
      setIsTimeUp(false);
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    resetTimer();
    setIsTimeUp(false);
  };

  const ViewModeButton = ({ mode, icon: Icon, label, shortcut }: { mode: any; icon: any; label: string; shortcut: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`p-2 rounded-lg transition-colors ${
        viewMode === mode ? 'bg-accent text-white' : 'bg-gray-800 hover:bg-gray-700'
      }`}
      title={`${label} (${shortcut})`}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Network size={28} className="text-accent" />
        <h1 className="text-xl font-bold text-accent mr-4">DSA Studio</h1>
      </div>

      {/* Center section: Session mode and timer */}
      <div className="flex items-center gap-3">
        {/* Session Mode Indicator */}
        <button
          onClick={cycleSessionMode}
          className={`px-4 py-2 ${currentSessionMode.color} hover:opacity-90 rounded-lg flex items-center gap-2 transition-all`}
          title={`Click to cycle session mode. Currently: ${currentSessionMode.label}`}
        >
          <SessionIcon size={18} />
          <span className="font-medium">{currentSessionMode.label}</span>
        </button>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isTimeUp ? 'bg-red-900 animate-pulse' : 'bg-gray-700'}`}>
          {!showTimerControls ? (
            <button
              onClick={() => setShowTimerControls(true)}
              className="flex items-center gap-2 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
              title="Click to show timer settings"
            >
              <Clock size={18} className={isTimeUp ? 'animate-spin' : ''} />
              {isTimeUp && <span className="font-mono text-lg font-semibold min-w-[60px] text-red-200">⏰ TIME UP!</span>}
              {isTimerRunning && !isTimeUp && (
                <span className="font-mono text-lg font-semibold min-w-[60px] text-white">
                  {formatTime(timerMinutes, timerSeconds)}
                </span>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowTimerControls(false)}
                className="flex items-center gap-2 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                title="Click to hide timer settings"
              >
                <Clock size={18} className={isTimeUp ? 'animate-spin' : ''} />
                <span className={`font-mono text-sm font-semibold min-w-[50px] ${isTimeUp ? 'text-red-200' : 'text-white'}`}>
                  {isTimeUp ? '⏰ TIME UP!' : formatTime(timerMinutes, timerSeconds)}
                </span>
              </button>
              
              <div className="h-6 w-px bg-gray-600"></div>
              
              {/* Preset times dropdown */}
              <select
                value={timerSetMinutes}
                onChange={(e) => handleSetTimer(parseInt(e.target.value))}
                className="px-2 py-1 text-xs bg-gray-600 text-white rounded border-none focus:ring-1 focus:ring-accent"
              >
                <option value={1}>1 min</option>
                <option value={2}>2 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>

              <div className="h-6 w-px bg-gray-600"></div>

              {/* Custom time input */}
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomTimer()}
                placeholder="Custom"
                className="w-16 px-2 py-1 text-xs bg-gray-600 text-white rounded border-none focus:ring-1 focus:ring-accent"
                min="1"
                max="999"
              />
              <button
                onClick={handleCustomTimer}
                disabled={!customMinutes}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded disabled:opacity-50"
              >
                Set
              </button>

              <div className="h-6 w-px bg-gray-600"></div>

              {/* Timer controls */}
              <button
                onClick={() => {
                  setIsTimerRunning(!isTimerRunning);
                  if (!isTimerRunning) {
                    // Only hide when starting the timer
                    setShowTimerControls(false);
                  }
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title={isTimerRunning ? 'Pause timer' : 'Start timer'}
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-1 hover:bg-gray-600 rounded"
                title="Reset timer"
              >
                <RotateCcw size={16} />
              </button>
            </>
          )}
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
          <ViewModeButton mode="split" icon={Layout} label="Split View" shortcut="⌘/Ctrl+1" />
          <ViewModeButton mode="code-only" icon={Code} label="Code Only" shortcut="⌘/Ctrl+2" />
          <ViewModeButton mode="draw-only" icon={PenTool} label="Draw Only" shortcut="⌘/Ctrl+3" />
          <ViewModeButton mode="roadmap" icon={Map} label="Roadmap" shortcut="⌘/Ctrl+4" />
        </div>
      </div>

      {/* Unified button group with background container */}
      <div className={`flex items-center bg-gray-800 rounded-lg py-1.5 border border-gray-600 shadow-lg transition-all duration-300 ${
        showToolbarButtons ? 'px-2 gap-1.5' : 'px-1.5'
      }`}>
        {/* Settings/gear icon to toggle button visibility */}
        <button
          onClick={() => setShowToolbarButtons(!showToolbarButtons)}
          className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
          title={showToolbarButtons ? 'Hide toolbar buttons' : 'Show toolbar buttons'}
        >
          <Settings 
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
          className={`flex items-center gap-1.5 transition-all duration-300 overflow-hidden ${
            showToolbarButtons 
              ? 'opacity-100 max-w-[1000px]' 
              : 'opacity-0 max-w-0'
          }`}
        >
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded-md flex items-center gap-2 text-white transition-all duration-200 hover:scale-105 whitespace-nowrap"
            title="Cloud Backup"
          >
            <Cloud size={16} />
            <span className="text-sm font-medium">Backup</span>
          </button>

          <button
            onClick={() => setShowGitHubSettings(true)}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all duration-200 hover:scale-105 whitespace-nowrap ${
              github.initialized && github.token
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={github.initialized && github.token ? 'GitHub Connected' : 'Configure GitHub'}
          >
            <Settings size={16} />
            <span className="text-sm font-medium">GitHub</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-accent hover:bg-blue-700 rounded-md flex items-center gap-2 text-white transition-all duration-200 hover:scale-105 whitespace-nowrap"
            title="Save session"
          >
            <Save size={16} />
            <span className="text-sm font-medium">Save</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2 text-gray-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            title="Load session"
          >
            <Upload size={16} />
            <span className="text-sm font-medium">Load</span>
          </button>

          <button
            onClick={handleExportCode}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2 text-gray-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            title="Export code"
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
    </div>
  );
}

