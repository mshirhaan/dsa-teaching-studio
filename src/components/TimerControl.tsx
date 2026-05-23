'use client';

import { useAppStore, SessionMode } from '@/stores/appStore';
import { Clock, Play, Pause, RotateCcw, Maximize2, X } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

const TimerControl = memo(() => {
  const { timerSetMinutes, setTimerSetMinutes, sessionMode } = useAppStore();

  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync local minutes when preset duration changes (e.g. initial load or user selection)
  useEffect(() => {
    setMinutes(timerSetMinutes);
    setSeconds(0);
    setIsRunning(false);
    setIsTimeUp(false);
  }, [timerSetMinutes]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) return;
    setIsTimeUp(false);

    // Calculate initial remaining seconds when timer starts/resumes
    const initialSeconds = minutes * 60 + seconds;
    if (initialSeconds <= 0) {
      setIsRunning(false);
      setIsTimeUp(true);
      return;
    }

    const targetTime = Date.now() + initialSeconds * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setMinutes(0);
        setSeconds(0);
        setIsRunning(false);
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
      } else {
        const remainingSecs = Math.round(difference / 1000);
        setMinutes(Math.floor(remainingSecs / 60));
        setSeconds(remainingSecs % 60);
      }
    }, 200); // Check every 200ms to ensure smooth updates and avoid drift

    return () => clearInterval(interval);
    // We intentionally only depend on `isRunning` to avoid recreating the interval on every single tick,
    // preventing drift due to React scheduling/rendering delays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleSetTimer = (mins: number) => {
    setTimerSetMinutes(mins);
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 999) {
      setTimerSetMinutes(mins);
      setCustomMinutes('');
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setMinutes(timerSetMinutes);
    setSeconds(0);
    setIsRunning(false);
    setIsTimeUp(false);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setShowTimerControls(false);
    }
  };

  // Listen for Escape key to exit fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Get active session status text based on state and active mode
  const getSessionStatusText = () => {
    if (isTimeUp) return "⏰ TIME'S UP!";
    
    const modeLabels: Record<SessionMode, string> = {
      teaching: 'Teaching Mode',
      qna: 'Q&A Session',
      break: 'Break Time',
      challenge: 'Challenge Mode',
    };
    
    const prefix: Record<SessionMode, string> = {
      teaching: '📚',
      qna: '💬',
      break: '☕',
      challenge: '🏆',
    };
    
    const label = modeLabels[sessionMode] || 'Session';
    const icon = prefix[sessionMode] || '⚡';
    
    if (isRunning) {
      return `${icon} ${label} in Progress`;
    }
    return `${icon} ${label} (Paused)`;
  };

  // Get coordinated styling for status badge based on mode and timer state
  const getSessionStatusClasses = () => {
    if (isTimeUp) {
      return 'bg-red-500/20 border-red-500/30 text-red-400 animate-bounce';
    }
    
    switch (sessionMode) {
      case 'break':
        return isRunning 
          ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
          : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400/80';
      case 'challenge':
        return isRunning 
          ? 'bg-purple-500/25 border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-pulse' 
          : 'bg-purple-950/40 border-purple-800/40 text-purple-400/80';
      case 'teaching':
        return isRunning 
          ? 'bg-cyan-500/25 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
          : 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400/80';
      case 'qna':
        return isRunning 
          ? 'bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
          : 'bg-amber-950/40 border-amber-800/40 text-amber-400/80';
      default:
        return isRunning 
          ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' 
          : 'bg-gray-800/80 border-gray-700 text-gray-400';
    }
  };

  // Get dynamic state-based radial glow coordinates and colors
  const getBackgroundGlowClass = () => {
    if (isTimeUp) {
      return 'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.18)_0%,transparent_60%)] animate-pulse';
    }
    if (!isRunning) {
      return 'bg-[radial-gradient(circle_at_center,rgba(156,163,175,0.06)_0%,transparent_60%)]';
    }
    
    switch (sessionMode) {
      case 'break':
        return 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_60%)]';
      case 'challenge':
        return 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_60%)]';
      case 'teaching':
        return 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_60%)]';
      case 'qna':
        return 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_60%)]';
      default:
        return 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_60%)]';
    }
  };

  return (
    <>
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          transition-all duration-300 ease-in-out
          ${isTimeUp ? 'bg-red-900 animate-pulse shadow-lg shadow-red-900/50' : 'bg-gray-700 shadow-md'}
        `}
      >
        {!showTimerControls ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isTimeUp) {
                  handleResetTimer();
                } else {
                  setShowTimerControls(true);
                }
              }}
              className="
                flex items-center gap-2 
                px-2 py-1 rounded-md
                hover:bg-gray-600 
                transition-all duration-300
                transform hover:scale-105
              "
              title={isTimeUp ? "Click to reset timer" : "Click to show timer settings"}
              aria-label={isTimeUp ? "Reset timer" : "Open timer settings"}
            >
              <Clock size={18} className={isTimeUp ? 'animate-bounce text-red-200' : ''} />
              {isTimeUp && (
                <span className="font-mono text-lg font-semibold min-w-[60px] text-red-200">
                  ⏰ TIME UP! (Reset)
                </span>
              )}
              {isRunning && !isTimeUp && (
                <span className="font-mono text-lg font-semibold min-w-[60px] text-white">
                  {formatTime(minutes, seconds)}
                </span>
              )}
              {!isRunning && !isTimeUp && (
                <span className="font-mono text-sm text-gray-300">
                  Timer
                </span>
              )}
            </button>
            
            <div className="h-4 w-px bg-gray-600" />
            
            {/* Maximize button in compact view */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="
                p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600
                transition-all duration-200
                transform hover:scale-110
              "
              title="Open Fullscreen Timer"
              aria-label="Open Fullscreen Timer"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                if (isTimeUp) {
                  handleResetTimer();
                } else {
                  setShowTimerControls(false);
                }
              }}
              className="
                flex items-center gap-2 
                px-2 py-1 rounded-md
                hover:bg-gray-600 
                transition-all duration-300
              "
              title={isTimeUp ? "Click to reset timer" : "Click to hide timer settings"}
              aria-label={isTimeUp ? "Reset timer" : "Close timer settings"}
            >
              <Clock size={18} className={isTimeUp ? 'animate-bounce text-red-200' : ''} />
              <span className={`font-mono text-sm font-semibold min-w-[50px] ${isTimeUp ? 'text-red-200' : 'text-white'}`}>
                {isTimeUp ? '⏰ TIME UP! (Reset)' : formatTime(minutes, seconds)}
              </span>
            </button>
            
            <div className="h-6 w-px bg-gray-600" />
            
            {/* Preset times dropdown */}
            <select
              value={timerSetMinutes}
              onChange={(e) => handleSetTimer(parseInt(e.target.value))}
              className="
                px-2 py-1 text-xs 
                bg-gray-600 text-white rounded-md
                border-none 
                focus:ring-2 focus:ring-accent 
                transition-all duration-200
                cursor-pointer
              "
              aria-label="Select preset timer duration"
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
  
            <div className="h-6 w-px bg-gray-600" />
  
            {/* Custom time input */}
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomTimer()}
              placeholder="Custom"
              className="
                w-16 px-2 py-1 text-xs 
                bg-gray-600 text-white rounded-md
                border-none 
                focus:ring-2 focus:ring-accent
                transition-all duration-200
              "
              min="1"
              max="999"
              aria-label="Enter custom timer duration in minutes"
            />
            <button
              onClick={handleCustomTimer}
              disabled={!customMinutes}
              className="
                px-2 py-1 text-xs rounded-md
                bg-gray-600 hover:bg-gray-500 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                transform hover:scale-105
              "
              aria-label="Set custom timer"
            >
              Set
            </button>
  
            <div className="h-6 w-px bg-gray-600" />
  
            {/* Timer controls */}
            <button
              onClick={handleToggleTimer}
              className="
                p-1 rounded-md
                hover:bg-gray-600 
                transition-all duration-200
                transform hover:scale-110
              "
              title={isRunning ? 'Pause timer' : 'Start timer'}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={handleResetTimer}
              className="
                p-1 rounded-md
                hover:bg-gray-600 
                transition-all duration-200
                transform hover:scale-110
              "
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw size={16} />
            </button>

            <div className="h-6 w-px bg-gray-600" />
            
            {/* Maximize button in expanded view */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="
                p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600
                transition-all duration-200
                transform hover:scale-110
              "
              title="Open Fullscreen Timer"
              aria-label="Open Fullscreen Timer"
            >
              <Maximize2 size={16} />
            </button>
          </>
        )}
      </div>

      {/* Premium Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-8 select-none animate-fadeIn">
          {/* Background state-aware glow effects */}
          <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 overflow-hidden ${getBackgroundGlowClass()}`} />

          {/* Absolute Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="
              absolute top-8 right-8 p-3 rounded-full bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-700
              transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 z-20
            "
            title="Exit Fullscreen"
            aria-label="Exit Fullscreen"
          >
            <X size={24} />
          </button>

          {/* Center Bar: Big Clock Display */}
          <div className="flex flex-col items-center justify-center z-10">
            <div className={`
              font-mono font-bold tracking-tighter text-center select-none transition-all duration-500
              text-[16vw] leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]
              ${isTimeUp 
                ? 'text-red-500 animate-pulse drop-shadow-[0_0_60px_rgba(239,68,68,0.3)]' 
                : isRunning 
                  ? 'text-white' 
                  : 'text-gray-300'
              }
            `}>
              {formatTime(minutes, seconds)}
            </div>
            
            {/* Visual Indicator of Dynamic Session Mode and State */}
            <div className="mt-6 flex items-center gap-3">
              <span className={`px-6 py-2.5 rounded-full border text-lg md:text-xl font-semibold tracking-wider uppercase transition-all duration-500 ${getSessionStatusClasses()}`}>
                {getSessionStatusText()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

TimerControl.displayName = 'TimerControl';

export default TimerControl;
