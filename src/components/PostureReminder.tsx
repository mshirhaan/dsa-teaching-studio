'use client';

import { useEffect, useState, useRef } from 'react';
import { PersonStanding, Play, Pause, RotateCcw, HelpCircle, X, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function PostureReminder() {
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [enabled, setEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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

  // Handle Escape key to close guide modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowGuide(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 w-64 z-[150] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-sm font-semibold text-white">Health Reminder</span>
            <div className="flex items-center gap-1.5">
              {/* Info Guide Button */}
              <button
                onClick={() => {
                  setShowGuide(true);
                  setIsOpen(false);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="Posture & Health Guide"
              >
                <HelpCircle size={15} />
              </button>
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

      {/* BIG HEALTH GUIDE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <PersonStanding className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Health & Posture Guide</h2>
                  <p className="text-xs text-gray-400">Ergonomics, alignment exercises, and relief stretches for long teaching sessions</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1 scrollbar-thin scrollbar-thumb-gray-700">
              {/* Section 1: The Core Moves */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-800 pb-1.5">The 2 Core Posture Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chin Tuck */}
                  <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <h4 className="font-bold text-sm text-white">The Chin Tuck</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 leading-relaxed font-semibold">For correcting Forward Head Posture</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Look straight ahead and pull your head straight back (like a turtle pulling its head into its shell), creating a comical &ldquo;double chin.&rdquo; Keep your chin level—don&apos;t look up or down. Hold for 2 seconds. This stretches the tight muscles at the base of your skull and strengthens the weak deep neck muscles that keep your head upright.
                    </p>
                  </div>

                  {/* Shoulder Roll & Lock */}
                  <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <h4 className="font-bold text-sm text-white">The Shoulder Roll & Lock</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 leading-relaxed font-semibold">For opening up Hunched Shoulders</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Roll your shoulders up to your ears, then back, and drop them down. Imagine trying to slide your shoulder blades into your back pockets. This immediately opens up your chest and turns off the overactive upper traps that cause hunching.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Timer Protocols */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-800 pb-1.5">Action Protocols</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Protocol 1 */}
                  <div className="bg-gray-850 p-4 rounded-xl border border-emerald-500/10 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">Protocol 1</div>
                      <h4 className="font-bold text-sm text-white">The 15-Second Micro-Reset</h4>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Use this every time the toolbar reminder blinks in your visual field.</p>
                    
                    <div className="space-y-2 border-t border-gray-800 pt-2 text-xs">
                      <div>
                        <span className="text-emerald-400 font-bold">1. The Chin Tuck:</span>
                        <p className="text-gray-300 pl-3 mt-0.5">Hold <span className="text-white font-semibold">3s</span> | Reps: <span className="text-white font-semibold">3 times</span></p>
                        <p className="text-gray-400 pl-3 italic text-[11px]">Pull head straight back, hold for 1-2-3, relax for 1s, and repeat.</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold">2. The Shoulder Roll & Lock:</span>
                        <p className="text-gray-300 pl-3 mt-0.5">Hold <span className="text-white font-semibold">5s</span> | Reps: <span className="text-white font-semibold">1 high-quality roll</span></p>
                        <p className="text-gray-400 pl-3 italic text-[11px]">Roll up and back, slide blades down, squeeze and hold while taking one deep breath.</p>
                      </div>
                    </div>
                  </div>

                  {/* Protocol 2 */}
                  <div className="bg-gray-855 p-4 rounded-xl border border-indigo-500/10 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-indigo-950 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">Protocol 2</div>
                      <h4 className="font-bold text-sm text-white">The Active Fix</h4>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Do this 1-2 times a day when you stand up to stretch or grab water.</p>
                    
                    <div className="space-y-2 border-t border-gray-800 pt-2 text-xs">
                      <div>
                        <span className="text-indigo-400 font-bold">1. The Chin Tuck (Strength Builder):</span>
                        <p className="text-gray-300 pl-3 mt-0.5">Hold <span className="text-white font-semibold">5s</span> | Reps: <span className="text-white font-semibold">10 to 12 reps</span></p>
                        <p className="text-gray-400 pl-3 italic text-[11px]">Do sitting or flat against a wall. Pressing the back of your head gently against the wall or headrest activates deeper neck flexors.</p>
                      </div>
                      <div>
                        <span className="text-indigo-400 font-bold">2. The Shoulder Roll & Lock (Posture Anchor):</span>
                        <p className="text-gray-300 pl-3 mt-0.5">Hold <span className="text-white font-semibold">5 to 7s</span> | Reps: <span className="text-white font-semibold">5 reps</span></p>
                        <p className="text-gray-400 pl-3 italic text-[11px]">Squeeze your shoulder blades together as hard as you can (imagine clamping a coin in the center of your back).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Daily Posture & Shoulder Stretches */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-800 pb-1.5">3 Critical Shoulder & Hunch Exercises</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-950/60 border-b border-gray-800 text-gray-400 font-semibold">
                        <th className="p-3 w-1/4">Exercise</th>
                        <th className="p-3 w-1/2">How to Do It</th>
                        <th className="p-3 w-1/4">Why It Helps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr className="hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 font-bold text-white">Doorway Chest Stretch</td>
                        <td className="p-3 text-gray-300 leading-relaxed">Place your forearms flat against a doorway frame (arms bent at 90°) and gently step forward until you feel a stretch in your chest. Hold for 20 seconds.</td>
                        <td className="p-3 text-emerald-400 font-medium">Instantly opens up tight chest muscles that pull your shoulders forward.</td>
                      </tr>
                      <tr className="hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 font-bold text-white">The &ldquo;W&rdquo; to &ldquo;Y&rdquo; Stretch</td>
                        <td className="p-3 text-gray-300 leading-relaxed">Sit tall, bring your elbows down to your sides to form a &ldquo;W&rdquo; with your arms (squeezing your shoulder blades). Slowly slide your hands up into a &ldquo;Y&rdquo; position, then pull them back down. Do 5 reps.</td>
                        <td className="p-3 text-emerald-400 font-medium">Activates and strengthens the lower traps and rhomboids (your &ldquo;upright posture&rdquo; muscles).</td>
                      </tr>
                      <tr className="hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 font-bold text-white">Wall Angels</td>
                        <td className="p-3 text-gray-300 leading-relaxed">Stand flat against a wall (heels, butt, upper back, and head touching). Put your arms against the wall in a &ldquo;W&rdquo; and try to slide them up and down without any part of your body leaving the wall.</td>
                        <td className="p-3 text-emerald-400 font-medium">The gold standard physical therapy exercise for correcting hunched shoulders.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Lower Back & Pelvic Tilt Health */}
              <div className="space-y-4 bg-gray-800/20 p-5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-amber-500 animate-pulse" size={20} />
                  <h3 className="text-base font-bold text-white">Lower Back Pain & Tight Hip Flexors</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <p className="text-gray-300 leading-relaxed">
                    If you sit for long hours, the muscles at the front of your hips (psoas and hip flexors) become incredibly tight. Because they attach directly to your lower spine, they literally pull your pelvis forward into an <span className="text-amber-400 font-semibold">Anterior Pelvic Tilt</span>, forcing your lower back to arch excessively. This is why sitting &ldquo;too straight&rdquo; by shrugging your chest forward can actually pinch your lower joints and cause lower back spasms.
                  </p>
                  
                  <div className="border-t border-gray-800/80 pt-4 space-y-3">
                    <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                      <ShieldCheck size={16} />
                      The Remedy: The Half-Kneeling Hip Flexor Stretch
                    </h4>
                    <ul className="list-decimal list-inside pl-2 space-y-1.5 text-gray-300 leading-relaxed">
                      <li>Kneel on one knee (use a cushion) with your other foot flat in front of you (90-degree angles).</li>
                      <li><span className="text-amber-400 font-bold">CRITICAL STEP:</span> Tuck your tailbone under (posterior pelvic tilt)—imagine flattening your lower back. Don&apos;t lean forward yet.</li>
                      <li>Gently squeeze the glute (butt muscle) on the kneeling side and push your hips forward slightly.</li>
                      <li>You should feel a deep, warm stretch in the front of your hip. Hold for <span className="text-white font-bold">20 seconds</span> per side.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-950/60 border-t border-gray-805 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow"
              >
                <span>Got it! Back to Teaching</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
