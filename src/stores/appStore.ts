import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'split' | 'code-only' | 'draw-only' | 'pip';
export type SessionMode = 'teaching' | 'qna' | 'break' | 'challenge';

export interface CodeFile {
  id: string;
  name: string;
  code: string;
  language: string;
}

export interface CodeEditorState {
  code: string;
  language: string;
  theme: string;
  fontSize: number;
  currentFileId: string | null;
  files: CodeFile[];
}

export interface DrawingState {
  elements: any[];
  appState: {
    viewBackgroundColor: string;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: string;
    currentItemStrokeWidth: number;
    currentItemRoughness: number;
    currentItemOpacity: number;
  };
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  codeEditor: CodeEditorState;
  drawing: DrawingState;
}

interface AppStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  sessionMode: SessionMode;
  setSessionMode: (mode: SessionMode) => void;
  
  timerMinutes: number;
  timerSeconds: number;
  timerSetMinutes: number;
  isTimerRunning: boolean;
  setTimerMinutes: (minutes: number) => void;
  setTimerSeconds: (seconds: number) => void;
  setTimerSetMinutes: (minutes: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  resetTimer: () => void;
  
  currentSession: Session | null;
  createSession: () => void;
  saveSession: () => void;
  loadSession: (session: Session) => void;
  
  codeEditor: CodeEditorState;
  updateCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  addFile: (name: string, language: string) => void;
  selectFile: (fileId: string) => void;
  updateFileName: (fileId: string, name: string) => void;
  deleteFile: (fileId: string) => void;
  
  drawing: DrawingState;
  updateDrawing: (state: DrawingState) => void;
  
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  consoleOutput: string;
  setConsoleOutput: (output: string) => void;
  
  autoRun: boolean;
  setAutoRun: (enabled: boolean) => void;
  
  laserMode: boolean;
  setLaserMode: (enabled: boolean) => void;
  
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;
  consoleHeight: number;
  setConsoleHeight: (height: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
  viewMode: 'split',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  sessionMode: 'teaching',
  setSessionMode: (mode) => set({ sessionMode: mode }),
  
  timerMinutes: 5,
  timerSeconds: 0,
  timerSetMinutes: 5,
  isTimerRunning: false,
  setTimerMinutes: (minutes) => set({ timerMinutes: minutes }),
  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
  setTimerSetMinutes: (minutes) => set({ timerSetMinutes: minutes, timerMinutes: minutes, timerSeconds: 0 }),
  setIsTimerRunning: (running) => set({ isTimerRunning: running }),
  resetTimer: () => set((state) => ({ 
    timerMinutes: state.timerSetMinutes, 
    timerSeconds: 0, 
    isTimerRunning: false 
  })),
  
  currentSession: null,
  createSession: () => {
    const initialFile: CodeFile = {
      id: '1',
      name: 'main.js',
      code: '// Welcome to DSA Teaching Studio\n// Start coding here...\n',
      language: 'javascript',
    };
    const session: Session = {
      id: Date.now().toString(),
      name: `Session ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      codeEditor: {
        code: '// Welcome to DSA Teaching Studio\n// Start coding here...\n',
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        currentFileId: '1',
        files: [initialFile],
      },
      drawing: {
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
          currentItemStrokeColor: '#000000',
          currentItemBackgroundColor: '#ffffff',
          currentItemFillStyle: 'solid',
          currentItemStrokeWidth: 2,
          currentItemRoughness: 1,
          currentItemOpacity: 100,
        },
      },
    };
    set({ currentSession: session, codeEditor: session.codeEditor });
  },
  
  saveSession: () => {
    const state = useAppStore.getState();
    if (!state.currentSession) return;
    
    const updatedSession: Session = {
      ...state.currentSession,
      updatedAt: Date.now(),
      codeEditor: state.codeEditor,
      drawing: state.drawing,
    };
    
    const sessions = JSON.parse(localStorage.getItem('dsa-sessions') || '[]');
    const index = sessions.findIndex((s: Session) => s.id === updatedSession.id);
    if (index >= 0) {
      sessions[index] = updatedSession;
    } else {
      sessions.push(updatedSession);
    }
    localStorage.setItem('dsa-sessions', JSON.stringify(sessions));
    set({ currentSession: updatedSession });
  },
  
  loadSession: (session) => set({ 
    currentSession: session,
    codeEditor: session.codeEditor,
    drawing: session.drawing,
  }),
  
  codeEditor: {
    code: '// Welcome to DSA Teaching Studio\n// Start coding here...\n',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    currentFileId: null,
    files: [],
  },
  updateCode: (code) => set((state) => {
    const updatedFiles = state.codeEditor.files.map(file => 
      file.id === state.codeEditor.currentFileId ? { ...file, code } : file
    );
    return { 
      codeEditor: { ...state.codeEditor, code, files: updatedFiles } 
    };
  }),
  setLanguage: (language) => set((state) => {
    const updatedFiles = state.codeEditor.files.map(file =>
      file.id === state.codeEditor.currentFileId ? { ...file, language } : file
    );
    return { 
      codeEditor: { ...state.codeEditor, language, files: updatedFiles } 
    };
  }),
  setTheme: (theme) => set((state) => ({ 
    codeEditor: { ...state.codeEditor, theme } 
  })),
  setFontSize: (fontSize) => set((state) => ({ 
    codeEditor: { ...state.codeEditor, fontSize } 
  })),
  addFile: (name, language) => set((state) => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      code: '',
      language,
    };
    return {
      codeEditor: {
        ...state.codeEditor,
        files: [...state.codeEditor.files, newFile],
        currentFileId: newFile.id,
        code: '',
        language,
      },
    };
  }),
  selectFile: (fileId) => set((state) => {
    const file = state.codeEditor.files.find(f => f.id === fileId);
    if (file) {
      return {
        codeEditor: {
          ...state.codeEditor,
          currentFileId: fileId,
          code: file.code,
          language: file.language,
        },
      };
    }
    return state;
  }),
  updateFileName: (fileId, name) => set((state) => {
    const updatedFiles = state.codeEditor.files.map(file =>
      file.id === fileId ? { ...file, name } : file
    );
    return {
      codeEditor: { ...state.codeEditor, files: updatedFiles },
    };
  }),
  deleteFile: (fileId) => set((state) => {
    const filteredFiles = state.codeEditor.files.filter(f => f.id !== fileId);
    const newCurrentFileId = filteredFiles.length > 0 ? filteredFiles[0].id : null;
    const newCode = filteredFiles.length > 0 ? filteredFiles[0].code : '';
    const newLanguage = filteredFiles.length > 0 ? filteredFiles[0].language : 'javascript';
    return {
      codeEditor: {
        ...state.codeEditor,
        files: filteredFiles,
        currentFileId: newCurrentFileId,
        code: newCode,
        language: newLanguage,
      },
    };
  }),
  
  drawing: {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
      currentItemStrokeColor: '#000000',
      currentItemBackgroundColor: '#ffffff',
      currentItemFillStyle: 'solid',
      currentItemStrokeWidth: 2,
      currentItemRoughness: 1,
      currentItemOpacity: 100,
    },
  },
  updateDrawing: (drawing) => set({ drawing }),
  
  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),
  consoleOutput: '',
  setConsoleOutput: (output) => set({ consoleOutput: output }),
  
  autoRun: false,
  setAutoRun: (enabled) => set({ autoRun: enabled }),
  
  laserMode: false,
  setLaserMode: (enabled) => set({ laserMode: enabled }),
  
  splitRatio: 50,
  setSplitRatio: (ratio) => set({ splitRatio: ratio }),
  consoleHeight: 128, // Default 32 * 4 = 128px (h-32)
  setConsoleHeight: (height) => set({ consoleHeight: height }),
}),
    {
      name: 'dsa-studio-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sessionMode: state.sessionMode,
        timerSetMinutes: state.timerSetMinutes,
        codeEditor: {
          language: state.codeEditor.language,
          theme: state.codeEditor.theme,
          fontSize: state.codeEditor.fontSize,
          currentFileId: state.codeEditor.currentFileId,
          files: state.codeEditor.files,
          code: state.codeEditor.code,
        },
        autoRun: state.autoRun,
        laserMode: state.laserMode,
        splitRatio: state.splitRatio,
        consoleHeight: state.consoleHeight,
      }),
    }
  )
);

