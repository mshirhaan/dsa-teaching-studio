'use client';

import { useEffect, useState, useRef } from 'react';
import { PersonStanding, Play, Pause, RotateCcw } from 'lucide-react';

export default function PostureReminder() {
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [enabled, setEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load configuration and start timer logic
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedInterval = localStorage.getItem('posture-interval');
    const storedEnabled = localStorage.getItem('posture-enabled');

    if (storedInterval) {
      setIntervalMinutes(parseInt(storedInterval, 10));
    }
    if (storedEnabled !== null) {
      setEnabled(JSON.parse(storedEnabled));
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setElapsedSeconds(0);
      setIsBlinking(false);
      return;
    }

    const tick = () => {
      const storedStart = localStorage.getItem('posture-start-time');
      let startTime = storedStart ? parseInt(storedStart, 10) : 0;
      if (!startTime) {
        startTime = Date.now();
        localStorage.setItem('posture-start-time', startTime.toString());
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const limit = intervalMinutes * 60;

      if (elapsed >= limit) {
        setElapsedSeconds(limit);
        setIsBlinking(true);
      } else {
        setElapsedSeconds(elapsed);
        setIsBlinking(false);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled, intervalMinutes]);

  const handleAcknowledge = () => {
    const now = Date.now();
    localStorage.setItem('posture-start-time', now.toString());
    setElapsedSeconds(0);
    setIsBlinking(false);
  };

  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem('posture-enabled', JSON.stringify(newEnabled));
    if (newEnabled) {
      localStorage.setItem('posture-start-time', Date.now().toString());
    } else {
      localStorage.removeItem('posture-start-time');
    }
    setIsOpen(false);
  };

  const handleIntervalChange = (mins: number) => {
    setIntervalMinutes(mins);
    localStorage.setItem('posture-interval', mins.toString());
    localStorage.setItem('posture-start-time', Date.now().toString());
    setElapsedSeconds(0);
    setIsBlinking(false);
  };

  const progress = (elapsedSeconds / (intervalMinutes * 60)) * 100;
  const radius = 15;
  const circumference = 2 * Math.PI * radius; // 94.25
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const handleClickButton = () => {
    if (isBlinking) {
      handleAcknowledge();
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Human friendly display of time remaining
  const secondsLeft = Math.max(0, intervalMinutes * 60 - elapsedSeconds);
  const displayMins = Math.floor(secondsLeft / 60);
  const displaySecs = secondsLeft % 60;
  const timeRemainingStr = `${displayMins}:${displaySecs.toString().padStart(2, '0')}`;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button with Circular Progress */}
      <button
        onClick={handleClickButton}
        className={`relative flex items-center justify-center rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
          isBlinking
            ? 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse border border-red-500/50 scale-105'
            : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
        }`}
        title={isBlinking ? "Time to stretch/stand! Click to Acknowledge" : "Health Settings"}
      >
        {/* Progress Ring (SVG) */}
        <div className="w-[36px] h-[36px] flex items-center justify-center relative">
          <svg className="absolute transform -rotate-90" height="36" width="36">
            {/* Background Track */}
            <circle
              stroke="#374151" // gray-700
              fill="transparent"
              strokeWidth="2.5"
              r={radius}
              cx="18"
              cy="18"
            />
            {/* Active Progress */}
            {enabled && (
              <circle
                stroke={isBlinking ? "#EF4444" : "#10B981"} // red-500 if blinking, emerald-500 normally
                fill="transparent"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx="18"
                cy="18"
                className="transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          {/* Internal Icon */}
          <PersonStanding
            size={18}
            className={`z-10 transition-colors ${
              isBlinking ? 'text-red-500' : 'text-gray-300 hover:text-white'
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 w-60 z-[150] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-sm font-semibold text-white">Health Reminder</span>
            <button
              onClick={toggleEnabled}
              className={`p-1 rounded-md transition-colors ${
                enabled ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
              title={enabled ? "Pause Reminder" : "Enable Reminder"}
            >
              {enabled ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {enabled && (
            <div className="space-y-3">
              {/* Timer Status */}
              <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700/50 text-xs">
                <span className="text-gray-400">Next check in:</span>
                <span className="font-mono font-bold text-emerald-400">{timeRemainingStr}</span>
              </div>

              {/* Interval Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Interval</span>
                  <span className="text-white font-medium">{intervalMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={intervalMinutes}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Interval Quick Presets */}
              <div className="grid grid-cols-4 gap-1">
                {[1, 5, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleIntervalChange(mins)}
                    className={`px-1 py-1 text-[10px] rounded transition-colors border font-medium ${
                      intervalMinutes === mins
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-gray-750 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Reset / Acknowledge button */}
              <button
                onClick={() => {
                  handleAcknowledge();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors shadow"
              >
                <RotateCcw size={12} />
                <span>Reset Timer</span>
              </button>
            </div>
          )}

          {!enabled && (
            <div className="text-xs text-gray-400 py-2 text-center">
              Reminder is paused. Toggle play to resume health checks.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
