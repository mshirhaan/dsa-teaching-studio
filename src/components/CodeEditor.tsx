'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import Editor from '@monaco-editor/react';
import Console from './Console';
import { motion, AnimatePresence } from 'framer-motion';
import HorizontalResizer from './HorizontalResizer';
import { Play, ZoomIn, ZoomOut, Plus, X, RotateCcw, Flashlight } from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGS
// ============================================================================

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'], pistonLang: 'javascript' },
  { value: 'python', label: 'Python', extensions: ['.py', '.pyw', '.pyi'], pistonLang: 'python' },
  { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cxx', '.cc', '.c++'], pistonLang: 'cpp' },
  { value: 'java', label: 'Java', extensions: ['.java'], pistonLang: 'java' },
];

const THEMES = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast' },
];

const AUTO_RUN_DEBOUNCE_MS = 300;
const MIN_CONSOLE_HEIGHT = 80;
const MAX_CONSOLE_HEIGHT_RATIO = 0.7;

// ============================================================================
// HELPER FUNCTIONS (Pure, No Side Effects)
// ============================================================================

function getExtensionFromLanguage(lang: string): string {
  const langConfig = LANGUAGES.find(l => l.value === lang);
  return langConfig ? langConfig.extensions[0] : '.txt';
}

function getLanguageFromExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) return 'javascript';

  const extension = filename.substring(lastDotIndex);
  const langConfig = LANGUAGES.find(l => l.extensions.includes(extension));
  return langConfig ? langConfig.value : 'javascript';
}

function getPistonLanguage(lang: string): string {
  const langConfig = LANGUAGES.find(l => l.value === lang);
  return langConfig?.pistonLang || lang;
}

// ============================================================================
// EXECUTION ENGINE (Always uses latest code from store)
// ============================================================================

/**
 * Execute code via Piston API
 * Pure function - no state dependencies
 */
async function executePistonAPI(
  code: string,
  language: string,
  filename: string
): Promise<string> {
  try {
    const pistonLang = getPistonLanguage(language);

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: '*',
        files: [{ name: filename, content: code }],
        stdin: '',
        args: [],
      }),
    });

    const data = await response.json();

    if (data.run) {
      const output = [];

      if (data.run.stderr) {
        output.push('ERROR: ' + data.run.stderr);
      }

      if (data.run.stdout) {
        output.push(data.run.stdout);
      }

      if (data.run.code !== 0 && !data.run.stderr) {
        output.push(`Process exited with code ${data.run.code}`);
      }

      return output.join('\n') || 'No output';
    }

    return 'Failed to execute code';
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CodeEditor() {
  // Store state (read-only, always get fresh via getState())
  const {
    codeEditor,
    updateCode,
    setTheme,
    setLanguage,
    setFontSize,
    addFile,
    selectFile,
    updateFileName,
    deleteFile,
    isRunning,
    setIsRunning,
    consoleOutput,
    setConsoleOutput,
    autoRun,
    setAutoRun,
    laserMode,
    setLaserMode,
    consoleHeight,
    setConsoleHeight,
  } = useAppStore();

  // Local UI state (not in store)
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isConsoleResizing, setIsConsoleResizing] = useState(false);
  const [laserPosition, setLaserPosition] = useState({ x: 0, y: 0 });

  // Refs for execution tracking (no closure issues)
  const executionRef = useRef({
    lastExecutedCode: '',
    codeChangedDuringExecution: false,
  });

  // Refs for UI management
  const containerRef = useRef<HTMLDivElement>(null);
  const autoEditNewFileRef = useRef<string | null>(null);

  // ============================================================================
  // CODE EXECUTION (Always reads latest from store)
  // ============================================================================

  /**
   * Execute the current code from store
   * NO CLOSURE DEPENDENCIES - always reads fresh state
   */
  const executeCurrentCode = useCallback(async () => {
    // Always get latest values from store at execution time
    const state = useAppStore.getState();
    const currentCode = state.codeEditor.code;
    const currentLang = state.codeEditor.language;
    const currentFile = state.codeEditor.files.find(f => f.id === state.codeEditor.currentFileId);
    const filename = currentFile?.name || 'main' + getExtensionFromLanguage(currentLang);

    // Empty code handling
    if (!currentCode.trim()) {
      setConsoleOutput('');
      return;
    }

    // Mark as running and store what we're executing
    executionRef.current.lastExecutedCode = currentCode;
    executionRef.current.codeChangedDuringExecution = false;
    setIsRunning(true);

    try {
      const output = await executePistonAPI(currentCode, currentLang, filename);
      setConsoleOutput(output);
    } catch (error: any) {
      setConsoleOutput(`Error: ${error.message}`);
    }

    setIsRunning(false);

    // Check if code changed during execution
    const latestCode = useAppStore.getState().codeEditor.code;
    if (latestCode !== executionRef.current.lastExecutedCode && autoRun && latestCode.trim()) {
      // Code changed during execution, run again with latest code
      setTimeout(() => executeCurrentCode(), 100);
    }
  }, [setIsRunning, setConsoleOutput, autoRun]);

  // ============================================================================
  // AUTO-RUN EFFECT (Simple & Clear)
  // ============================================================================

  useEffect(() => {
    if (!autoRun) return;

    const currentCode = codeEditor.code;

    // Empty code: clear console immediately
    if (!currentCode.trim()) {
      setConsoleOutput('');
      executionRef.current.lastExecutedCode = '';
      return;
    }

    // Code changed: debounce and execute
    const timeoutId = setTimeout(() => {
      // Only execute if code is different from last execution
      if (currentCode !== executionRef.current.lastExecutedCode) {
        executeCurrentCode();
      }
    }, AUTO_RUN_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [codeEditor.code, autoRun, setConsoleOutput, executeCurrentCode]);

  // ============================================================================
  // FILE MANAGEMENT
  // ============================================================================

  // Auto-edit newly created untitled files
  useEffect(() => {
    if (autoEditNewFileRef.current === 'new' && codeEditor.currentFileId) {
      const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);
      if (currentFile && currentFile.name.startsWith('untitled') && currentFile.code === '') {
        setTimeout(() => {
          setEditingFileName(codeEditor.currentFileId!);
          setNewFileName(currentFile.name);
          autoEditNewFileRef.current = null;
        }, 50);
      } else {
        autoEditNewFileRef.current = null;
      }
    }
  }, [codeEditor.currentFileId, codeEditor.files]);

  const handleAddNewFile = () => {
    const existingFiles = codeEditor.files;
    const untitledFiles = existingFiles.filter(f => f.name.startsWith('untitled'));
    const fileNumber = untitledFiles.length + 1;
    const extension = getExtensionFromLanguage(codeEditor.language);
    const name = `untitled${fileNumber}${extension}`;

    addFile(name, codeEditor.language);
    autoEditNewFileRef.current = 'new';
  };

  const handleFileNameSubmit = (fileId: string) => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      updateFileName(fileId, filename);

      // Auto-detect language from new extension
      const detectedLanguage = getLanguageFromExtension(filename);
      if (detectedLanguage !== codeEditor.language) {
        setLanguage(detectedLanguage);
      }
    }
    setEditingFileName(null);
    setNewFileName('');
  };

  // ============================================================================
  // UI EVENT HANDLERS
  // ============================================================================

  const handleEditorChange = (value: string | undefined) => {
    updateCode(value || '');
  };

  const handleZoomIn = () => {
    const currentFontSize = useAppStore.getState().codeEditor.fontSize;
    setFontSize(Math.min(currentFontSize + 2, 32));
  };

  const handleZoomOut = () => {
    const currentFontSize = useAppStore.getState().codeEditor.fontSize;
    setFontSize(Math.max(currentFontSize - 2, 10));
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    // Update file extension when language changes
    const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);
    if (currentFile) {
      const newExtension = getExtensionFromLanguage(newLanguage);
      const lastDotIndex = currentFile.name.lastIndexOf('.');

      if (lastDotIndex !== -1 && lastDotIndex !== 0) {
        const oldExtension = currentFile.name.substring(lastDotIndex);
        if (oldExtension !== newExtension) {
          const newFileName = currentFile.name.replace(oldExtension, newExtension);
          updateFileName(codeEditor.currentFileId!, newFileName);
        }
      } else {
        const newFileName = currentFile.name + newExtension;
        updateFileName(codeEditor.currentFileId!, newFileName);
      }
    }
  };

  // Console resize handlers
  const handleConsoleResizeStart = useCallback(() => {
    setIsConsoleResizing(true);
  }, []);

  const handleConsoleResize = useCallback((e: MouseEvent) => {
    if (!isConsoleResizing || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height - y;

    const minHeight = MIN_CONSOLE_HEIGHT;
    const maxHeight = rect.height * MAX_CONSOLE_HEIGHT_RATIO;
    const newHeight = Math.min(Math.max(height, minHeight), maxHeight);

    setConsoleHeight(newHeight);
  }, [isConsoleResizing, setConsoleHeight]);

  const handleConsoleResizeEnd = useCallback(() => {
    setIsConsoleResizing(false);
  }, []);

  useEffect(() => {
    if (isConsoleResizing) {
      window.addEventListener('mousemove', handleConsoleResize);
      window.addEventListener('mouseup', handleConsoleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleConsoleResize);
        window.removeEventListener('mouseup', handleConsoleResizeEnd);
      };
    }
  }, [isConsoleResizing, handleConsoleResize, handleConsoleResizeEnd]);

  // Laser pointer tracking
  useEffect(() => {
    if (!laserMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setLaserPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [laserMode]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${laserMode ? 'laser-mode-active' : ''}`} ref={containerRef}>
      {/* File Tabs & Toolbar */}
      {/* Glass Header / Toolbar */}
      <div className="h-12 flex items-center px-2 border-b border-white/5 glass z-10">
        {/* Left: File tabs */}
        <div className="flex items-center overflow-x-auto flex-1">
          <AnimatePresence initial={false}>
            {codeEditor.files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative flex items-center gap-2 px-4 py-2 border-r border-white/5 min-w-fit cursor-pointer transition-colors duration-200 ${codeEditor.currentFileId === file.id
                  ? 'bg-zinc-800/50 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                  }`}
                onClick={() => selectFile(file.id)}
              >
                {editingFileName === file.id ? (
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={() => handleFileNameSubmit(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFileNameSubmit(file.id);
                      if (e.key === 'Escape') setEditingFileName(null);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-zinc-700 text-white px-2 py-1 rounded w-32 border border-indigo-500/50 focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span
                      className="text-sm font-medium"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingFileName(file.id);
                        setNewFileName(file.name);
                      }}
                    >
                      {file.name}
                    </span>
                    {/* Active Tab Indicator */}
                    {codeEditor.currentFileId === file.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      />
                    )}
                    {codeEditor.files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="hover:bg-red-500/20 hover:text-red-400 rounded p-1 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            onClick={handleAddNewFile}
            className="px-3 py-2 text-zinc-400 hover:bg-zinc-800/50 hover:text-indigo-400 transition-colors border-r border-white/5"
            title="Add new file"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 px-4 py-2 border-l border-white/5 flex-shrink-0 bg-black/20 h-full">
          <button
            onClick={() => setLaserMode(!laserMode)}
            className={`p-2 rounded-lg flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-105 ${laserMode
              ? 'bg-red-900 border-red-600 text-red-200'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            title="Laser Pointer: Highlight cursor for teaching"
            aria-label="Toggle laser pointer mode"
          >
            <Flashlight size={18} />
          </button>

          <button
            onClick={() => !isRunning && executeCurrentCode()}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={isRunning}
            title="Run code"
            aria-label="Run code"
          >
            <Play size={18} />
          </button>

          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`p-2 rounded-lg flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-105 ${autoRun
              ? 'bg-green-900 border-green-600 text-green-200'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            title="Auto Run: Automatically execute code when it changes"
            aria-label="Toggle auto-run mode"
          >
            <RotateCcw size={18} />
          </button>

          <select
            value={codeEditor.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <select
            value={codeEditor.theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
          >
            {THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-400">{codeEditor.fontSize}px</span>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-700 rounded"
              title="Zoom Out (Cmd/Ctrl + -)"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-700 rounded"
              title="Zoom In (Cmd/Ctrl + =)"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={codeEditor.language}
          theme={codeEditor.theme}
          value={codeEditor.code}
          onChange={handleEditorChange}
          options={{
            fontSize: codeEditor.fontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
          onMount={(editor, monaco) => {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal,
              handleZoomIn
            );
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus,
              handleZoomOut
            );
          }}
        />

        {/* Laser pointer indicator */}
        {laserMode && (
          <div
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: `${laserPosition.x}px`,
              top: `${laserPosition.y}px`,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping" style={{ animationDuration: '1s' }}></div>
            <div className="absolute inset-0 rounded-full bg-red-500" style={{ boxShadow: '0 0 20px 4px rgba(239, 68, 68, 1)' }}></div>
          </div>
        )}
      </div>

      {/* Console Panel */}
      <HorizontalResizer onMouseDown={handleConsoleResizeStart} />
      <div style={{ height: `${consoleHeight}px` }} className="flex flex-col">
        <Console output={consoleOutput} onClear={() => setConsoleOutput('')} />
      </div>
    </div>
  );
}

