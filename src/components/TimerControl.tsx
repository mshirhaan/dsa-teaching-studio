'use client';

import { useAppStore } from '@/stores/appStore';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

const TimerControl = memo(() => {
  const {
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

  const [showTimerControls, setShowTimerControls] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;
    setIsTimeUp(false);

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

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      setShowTimerControls(false);
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-300 ease-in-out
        ${isTimeUp ? 'bg-red-900 animate-pulse shadow-lg shadow-red-900/50' : 'bg-gray-700 shadow-md'}
      `}
    >
      {!showTimerControls ? (
        <button
          onClick={() => setShowTimerControls(true)}
          className="
            flex items-center gap-2 
            px-2 py-1 rounded-md
            hover:bg-gray-600 
            transition-all duration-300
            transform hover:scale-105
          "
          title="Click to show timer settings"
          aria-label="Open timer settings"
        >
          <Clock size={18} className={isTimeUp ? 'animate-spin' : ''} />
          {isTimeUp && (
            <span className="font-mono text-lg font-semibold min-w-[60px] text-red-200">
              ⏰ TIME UP!
            </span>
          )}
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
            className="
              flex items-center gap-2 
              px-2 py-1 rounded-md
              hover:bg-gray-600 
              transition-all duration-300
            "
            title="Click to hide timer settings"
            aria-label="Close timer settings"
          >
            <Clock size={18} className={isTimeUp ? 'animate-spin' : ''} />
            <span className={`font-mono text-sm font-semibold min-w-[50px] ${isTimeUp ? 'text-red-200' : 'text-white'}`}>
              {isTimeUp ? '⏰ TIME UP!' : formatTime(timerMinutes, timerSeconds)}
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
            title={isTimerRunning ? 'Pause timer' : 'Start timer'}
            aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
          >
            {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
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
        </>
      )}
    </div>
  );
});

TimerControl.displayName = 'TimerControl';

export default TimerControl;

