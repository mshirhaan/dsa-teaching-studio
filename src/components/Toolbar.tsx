'use client';

import { useAppStore } from '@/stores/appStore';
import { 
  Layout, Code, PenTool, Download, 
  Upload, Save, Tv, MessageCircle,
  Coffee, Trophy, Clock, Play, Pause, RotateCcw, Map
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);

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
              <span className={`font-mono text-lg font-semibold min-w-[60px] ${isTimeUp ? 'text-red-200' : 'text-white'}`}>
                {isTimeUp ? '⏰ TIME UP!' : formatTime(timerMinutes, timerSeconds)}
              </span>
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
          <ViewModeButton mode="split" icon={Layout} label="Split View" />
          <ViewModeButton mode="code-only" icon={Code} label="Code Only" />
          <ViewModeButton mode="draw-only" icon={PenTool} label="Draw Only" />
          <ViewModeButton mode="roadmap" icon={Map} label="Roadmap" />
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

