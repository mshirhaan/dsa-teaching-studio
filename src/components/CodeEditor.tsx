'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import Editor, { Monaco } from '@monaco-editor/react';
import Console from './Console';
import HorizontalResizer from './HorizontalResizer';
import { Play, Square, ZoomIn, ZoomOut, Plus, X, RotateCcw, Flashlight } from 'lucide-react';

export default function CodeEditor() {
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
  
  const language = codeEditor.language;
  const [code, setLocalCode] = useState(codeEditor.code);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isConsoleResizing, setIsConsoleResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [laserPosition, setLaserPosition] = useState({ x: 0, y: 0 });
  const newlyCreatedFileId = useRef<string | null>(null); // 'new' means file was just created
  const pendingAutoRun = useRef<boolean>(false); // Track if we need to run after current execution

  useEffect(() => {
    setLocalCode(codeEditor.code);
  }, [codeEditor.code]);

  // Auto-edit newly created untitled files
  useEffect(() => {
    if (codeEditor.currentFileId && newlyCreatedFileId.current === 'new') {
      const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);
      // Check if the file was just created and is untitled
      if (currentFile && currentFile.name.startsWith('untitled') && currentFile.code === '') {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          setEditingFileName(codeEditor.currentFileId);
          setNewFileName(currentFile.name);
          newlyCreatedFileId.current = null; // Clear the flag after use
        }, 50);
      } else {
        newlyCreatedFileId.current = null; // Clear the flag if not matching
      }
    }
  }, [codeEditor.currentFileId, codeEditor.files]);

  // Auto-run when code changes and auto-run is enabled
  useEffect(() => {
    if (!autoRun) return;
    
    // If code is empty, clear the console immediately
    if (!code) {
      setConsoleOutput('');
      return;
    }
    
    // Always set up a new debounce timer when code changes
    const timeoutId = setTimeout(() => {
      // If already running, mark that we need to run again after completion
      if (isRunning) {
        pendingAutoRun.current = true;
      } else {
        handleRun();
      }
    }, 300); // Debounce: wait 300ms after last change
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, autoRun]); // isRunning intentionally not in deps - we check it when timer fires

  // Track mouse position for laser pointer
  useEffect(() => {
    if (!laserMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setLaserPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [laserMode]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setLocalCode(newCode);
    updateCode(newCode);
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'], pistonLang: 'javascript' },
    { value: 'python', label: 'Python', extensions: ['.py', '.pyw', '.pyi'], pistonLang: 'python' },
    { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cxx', '.cc', '.c++'], pistonLang: 'cpp' },
    { value: 'java', label: 'Java', extensions: ['.java'], pistonLang: 'java' },
  ];

  // Helper functions for language/extension mapping
  const getExtensionFromLanguage = (lang: string): string => {
    const langConfig = languages.find(l => l.value === lang);
    return langConfig ? langConfig.extensions[0] : '';
  };

  const getLanguageFromExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    // Only consider it an extension if there's a dot and it's not at the start
    if (lastDotIndex === -1 || lastDotIndex === 0) return 'javascript';
    
    const extension = filename.substring(lastDotIndex);
    const langConfig = languages.find(l => l.extensions.includes(extension));
    return langConfig ? langConfig.value : 'javascript';
  };
  
  const getPistonLanguage = (lang: string): string => {
    const langConfig = languages.find(l => l.value === lang);
    return langConfig?.pistonLang || lang;
  };

  const themes = [
    { value: 'vs-dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'hc-black', label: 'High Contrast' },
  ];

  const executeWithPiston = async (code: string, language: string): Promise<string> => {
    try {
      const pistonLang = getPistonLanguage(language);
      const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);
      const filename = currentFile?.name || 'main' + getExtensionFromLanguage(language);
      
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonLang,
          version: '*',
          files: [
            {
              name: filename,
              content: code,
            },
          ],
          stdin: '',
          args: [],
        }),
      });
      
      const data = await response.json();
      
      if (data.run) {
        const output = [];
        
        // Add stderr if present
        if (data.run.stderr) {
          output.push('ERROR: ' + data.run.stderr);
        }
        
        // Add stdout if present
        if (data.run.stdout) {
          output.push(data.run.stdout);
        }
        
        // Handle exit codes
        if (data.run.code !== 0 && !data.run.stderr) {
          output.push(`Process exited with code ${data.run.code}`);
        }
        
        return output.join('\n') || 'No output';
      }
      
      return 'Failed to execute code';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    pendingAutoRun.current = false; // Clear pending flag at start
    
    try {
      // Use Piston API for all languages to prevent infinite loops from hanging the browser
      const output = await executeWithPiston(code, language);
      setConsoleOutput(output);
    } catch (error: any) {
      setConsoleOutput(`Error: ${error.message}`);
    }
    
    setIsRunning(false);
    
    // If code changed while we were running and auto-run is enabled, run again
    if (pendingAutoRun.current && autoRun) {
      pendingAutoRun.current = false;
      // Small delay to prevent tight loop
      setTimeout(() => handleRun(), 100);
    }
  };

  const handleZoomIn = () => {
    const currentFontSize = useAppStore.getState().codeEditor.fontSize;
    setFontSize(Math.min(currentFontSize + 2, 32));
  };

  const handleZoomOut = () => {
    const currentFontSize = useAppStore.getState().codeEditor.fontSize;
    setFontSize(Math.max(currentFontSize - 2, 10));
  };

  const handleFileNameDoubleClick = (fileId: string, currentName: string) => {
    setEditingFileName(fileId);
    setNewFileName(currentName);
  };

  const handleFileNameSubmit = (fileId: string) => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      updateFileName(fileId, filename);
      
      // Detect language from new extension and update if different
      const detectedLanguage = getLanguageFromExtension(filename);
      if (detectedLanguage !== language) {
        setLanguage(detectedLanguage);
      }
    }
    setEditingFileName(null);
    setNewFileName('');
  };

  const handleAddNewFile = () => {
    // Generate a unique untitled filename
    const existingFiles = codeEditor.files;
    const untitledFiles = existingFiles.filter(f => f.name.startsWith('untitled'));
    const fileNumber = untitledFiles.length + 1;
    
    // Determine extension based on language
    const extension = getExtensionFromLanguage(language);
    
    const name = `untitled${fileNumber}${extension}`;
    addFile(name, language);
    
    // Mark that a new file was just created
    newlyCreatedFileId.current = 'new'; // Use a sentinel value
  };

  const handleConsoleResizeStart = useCallback(() => {
    setIsConsoleResizing(true);
  }, []);

  const handleConsoleResize = useCallback((e: MouseEvent) => {
    if (!isConsoleResizing || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height - y;
    
    // Min height 80px, Max height 70% of container
    const minHeight = 80;
    const maxHeight = rect.height * 0.7;
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

  const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${laserMode ? 'laser-mode-active' : ''}`} ref={containerRef}>
      {/* Combined File Tabs and Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center">
        {/* Left side: File tabs and New File button */}
        <div className="flex items-center overflow-x-auto flex-1">
          {codeEditor.files.length > 0 && (
            <>
              {codeEditor.files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-gray-700 min-w-fit ${
                    codeEditor.currentFileId === file.id
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                  } cursor-pointer`}
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
                      className="bg-gray-600 text-white px-2 py-1 rounded w-32"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span 
                        className="text-sm"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleFileNameDoubleClick(file.id, file.name);
                        }}
                      >
                        {file.name}
                      </span>
                      {codeEditor.files.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="hover:bg-red-600 rounded p-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
          <button
            onClick={handleAddNewFile}
            className="px-2 py-2 text-gray-300 hover:bg-gray-700 border-r border-gray-700"
            title="Add new file"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Right side: Run button, language, theme, and zoom controls */}
        <div className="flex items-center gap-2 px-4 py-2 border-l border-gray-700 flex-shrink-0">
          <button
            onClick={() => setLaserMode(!laserMode)}
            className={`px-3 py-1 rounded-lg flex items-center gap-2 border-2 transition-colors ${
              laserMode 
                ? 'bg-red-900 border-red-600 text-red-200' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
            title="Laser Pointer: Highlight cursor for teaching"
          >
            <Flashlight size={16} />
            Laser
          </button>

          <button
            onClick={() => !isRunning && handleRun()}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
          >
            <Play size={16} />
            Run
          </button>

          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`px-3 py-1 rounded-lg flex items-center gap-2 border-2 transition-colors ${
              autoRun 
                ? 'bg-green-900 border-green-600 text-green-200' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
            title="Auto Run: Automatically execute code when it changes"
          >
            <RotateCcw size={16} />
            Auto
          </button>

          <select
            value={language}
            onChange={(e) => {
              const newLanguage = e.target.value;
              setLanguage(newLanguage);
              
              // Update file extension when language changes
              const currentFile = codeEditor.files.find(f => f.id === codeEditor.currentFileId);
              if (currentFile) {
                const newExtension = getExtensionFromLanguage(newLanguage);
                const lastDotIndex = currentFile.name.lastIndexOf('.');
                // Only replace extension if there actually was one
                if (lastDotIndex !== -1 && lastDotIndex !== 0) {
                  const oldExtension = currentFile.name.substring(lastDotIndex);
                  if (oldExtension !== newExtension) {
                    const newFileName = currentFile.name.replace(oldExtension, newExtension);
                    updateFileName(codeEditor.currentFileId!, newFileName);
                  }
                } else {
                  // No extension, just add the new one
                  const newFileName = currentFile.name + newExtension;
                  updateFileName(codeEditor.currentFileId!, newFileName);
                }
              }
            }}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
          >
            {languages.map((lang) => (
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
            {themes.map((theme) => (
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

      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={language}
          theme={codeEditor.theme}
          value={code}
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
            // Add keyboard shortcuts for zoom
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | (monaco.KeyCode as any).Equal || 187,
              handleZoomIn
            );
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | (monaco.KeyCode as any).Minus || 189,
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

      {/* Horizontal resizer for console */}
      <HorizontalResizer onMouseDown={handleConsoleResizeStart} />

      <div style={{ height: `${consoleHeight}px` }} className="flex flex-col">
        <Console output={consoleOutput} onClear={() => setConsoleOutput('')} />
      </div>
    </div>
  );
}
