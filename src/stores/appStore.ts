import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import LZString from 'lz-string';
import { initialRoadmapQuestions } from '@/data/roadmapQuestions';

export type ViewMode = 'split' | 'code-only' | 'draw-only' | 'roadmap';
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

export interface DrawingFile {
  id: string;
  name: string;
  elements: any[];
  appState: {
    viewBackgroundColor?: string;
    currentItemStrokeColor?: string;
    currentItemBackgroundColor?: string;
    currentItemFillStyle?: string;
    currentItemStrokeWidth?: number;
    currentItemRoughness?: number;
    currentItemOpacity?: number;
    // Viewport properties for scroll position and zoom
    scrollX?: number;
    scrollY?: number;
    zoom?: { value: number };
    // Allow other appState properties
    [key: string]: any;
  };
  files: Record<string, any>; // Store image files as { [fileId]: { mimeType, id, dataURL, created } }
}

export interface DrawingState {
  currentFileId: string | null;
  files: DrawingFile[];
  libraryItems?: any[]; // Shared across all canvas files
}

export interface RoadmapQuestion {
  id: string;
  number: number; // LeetCode question number (or serial number for non-LeetCode problems)
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[]; // ['Array', 'Two Pointers', etc.]
  leetcodeUrl?: string; // Optional - for non-LeetCode problems
  solved: boolean;
  solvedAt?: number; // timestamp when marked as solved
  notes?: string; // optional user notes
  gitCommitUrl?: string; // GitHub blob/commit URL for submitted solution
  submittedAt?: number; // timestamp when submitted to GitHub
  gitFilePath?: string; // Path to file in repo
}

export interface RoadmapState {
  questions: RoadmapQuestion[];
  solvedCount: number;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  codeEditor: CodeEditorState;
  drawing: DrawingState;
}

export interface GitHubConfig {
  token: string | null;
  repoOwner: string | null;
  repoName: string | null;
  basePath: string; // e.g., "solutions" or ""
  initialized: boolean;
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
  addDrawingFile: (name: string) => void;
  selectDrawingFile: (fileId: string) => void;
  updateDrawingFileName: (fileId: string, name: string) => void;
  deleteDrawingFile: (fileId: string) => void;
  updateDrawingFileData: (elements: any[], appState: any, files: Record<string, any>, fileId?: string) => void;
  updateLibraryItems: (libraryItems: any[]) => void;
  
  roadmap: RoadmapState;
  toggleQuestionSolved: (questionId: string) => void;
  updateQuestionNotes: (questionId: string, notes: string) => void;
  updateQuestionGitInfo: (questionId: string, gitCommitUrl: string, submittedAt: number, gitFilePath: string) => void;
  deleteQuestionGitInfo: (questionId: string) => void;
  
  github: GitHubConfig;
  setGitHubConfig: (config: Partial<GitHubConfig>) => void;
  
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
  
  showToolbarButtons: boolean;
  setShowToolbarButtons: (show: boolean) => void;
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
      code: '// Welcome to WorkPad\n// Start coding here...\n',
      language: 'javascript',
    };
    const session: Session = {
      id: Date.now().toString(),
      name: `Session ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      codeEditor: {
        code: initialFile.code,
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        currentFileId: '1',
        files: [initialFile],
      },
      drawing: {
        currentFileId: '1',
        files: [{
          id: '1',
          name: 'Canvas1',
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
          files: {},
        }],
        libraryItems: [],
      },
    };
    set({ 
      currentSession: session, 
      codeEditor: session.codeEditor,
      drawing: session.drawing 
    });
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
    
    const sessions = JSON.parse(localStorage.getItem('workpad-sessions') || '[]');
    const index = sessions.findIndex((s: Session) => s.id === updatedSession.id);
    if (index >= 0) {
      sessions[index] = updatedSession;
    } else {
      sessions.push(updatedSession);
    }
    localStorage.setItem('workpad-sessions', JSON.stringify(sessions));
    set({ currentSession: updatedSession });
  },
  
  loadSession: (session) => {
    // Migrate legacy drawing format to new format
    let drawing: DrawingState = session.drawing;
    
    // Check if this is legacy format (has elements directly, not files array)
    if (drawing && 'elements' in drawing && !Array.isArray((drawing as any).files)) {
      const legacyDrawing = drawing as any;
      drawing = {
        currentFileId: '1',
        files: [{
          id: '1',
          name: 'Canvas1',
          elements: legacyDrawing.elements || [],
          appState: legacyDrawing.appState || {
            viewBackgroundColor: '#ffffff',
            currentItemStrokeColor: '#000000',
            currentItemBackgroundColor: '#ffffff',
            currentItemFillStyle: 'solid',
            currentItemStrokeWidth: 2,
            currentItemRoughness: 1,
            currentItemOpacity: 100,
          },
          files: legacyDrawing.files || {},
        }],
        libraryItems: [],
      };
    }
    
    set({ 
      currentSession: { ...session, drawing },
      codeEditor: session.codeEditor,
      drawing: drawing,
    });
  },
  
  codeEditor: {
    code: '// Welcome to WorkPad\n// Start coding here...\n',
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
    // Language-specific default code
    const getDefaultCode = (lang: string): string => {
      switch (lang) {
        case 'javascript':
          return '// Welcome to WorkPad\n// Start coding here...\n';
        case 'python':
          return '# Welcome to WorkPad\n# Start coding here...\n';
        case 'cpp':
          return '// Welcome to WorkPad\n// Start coding here...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n';
        case 'java':
          return '// Welcome to WorkPad\n// Start coding here...\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n';
        default:
          return '';
      }
    };
    
    const defaultCode = getDefaultCode(language);
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      code: defaultCode,
      language,
    };
    return {
      codeEditor: {
        ...state.codeEditor,
        files: [...state.codeEditor.files, newFile],
        currentFileId: newFile.id,
        code: defaultCode,
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
    currentFileId: null,
    files: [],
    libraryItems: [],
  },
  updateDrawing: (drawing) => set({ drawing }),
  addDrawingFile: (name) => set((state) => {
      const newFile: DrawingFile = {
      id: Date.now().toString(),
      name,
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
      files: {},
    };
    return {
      drawing: {
        ...state.drawing,
        files: [...state.drawing.files, newFile],
        currentFileId: newFile.id,
      },
    };
  }),
  selectDrawingFile: (fileId) => set((state) => {
    return {
      drawing: {
        ...state.drawing,
        currentFileId: fileId,
      },
    };
  }),
  updateDrawingFileName: (fileId, name) => set((state) => {
    const updatedFiles = state.drawing.files.map(file =>
      file.id === fileId ? { ...file, name } : file
    );
    return {
      drawing: { ...state.drawing, files: updatedFiles },
    };
  }),
  deleteDrawingFile: (fileId) => set((state) => {
    const filteredFiles = state.drawing.files.filter(f => f.id !== fileId);
    const newCurrentFileId = filteredFiles.length > 0 ? filteredFiles[0].id : null;
    return {
      drawing: {
        ...state.drawing,
        files: filteredFiles,
        currentFileId: newCurrentFileId,
      },
    };
  }),
  updateDrawingFileData: (elements, appState, files, fileId) => set((state) => {
    // Use provided fileId or fall back to currentFileId
    const targetFileId = fileId || state.drawing.currentFileId;
    if (!targetFileId) return state;
    
    const updatedFiles = state.drawing.files.map(file =>
      file.id === targetFileId
        ? { ...file, elements, appState, files }
        : file
    );
    return {
      drawing: { ...state.drawing, files: updatedFiles },
    };
  }),
  updateLibraryItems: (libraryItems) => set((state) => ({
    drawing: { ...state.drawing, libraryItems },
  })),
  
  roadmap: {
    questions: initialRoadmapQuestions,
    solvedCount: 0,
  },
  toggleQuestionSolved: (questionId) => set((state) => {
    const questions = state.roadmap.questions.map(q => 
      q.id === questionId 
        ? { ...q, solved: !q.solved, solvedAt: !q.solved ? Date.now() : undefined }
        : q
    );
    const solvedCount = questions.filter(q => q.solved).length;
    return { roadmap: { ...state.roadmap, questions, solvedCount } };
  }),
  updateQuestionNotes: (questionId, notes) => set((state) => ({
    roadmap: {
      ...state.roadmap,
      questions: state.roadmap.questions.map(q =>
        q.id === questionId ? { ...q, notes } : q
      ),
    },
  })),
  updateQuestionGitInfo: (questionId, gitCommitUrl, submittedAt, gitFilePath) => set((state) => ({
    roadmap: {
      ...state.roadmap,
      questions: state.roadmap.questions.map(q =>
        q.id === questionId ? { ...q, gitCommitUrl, submittedAt, gitFilePath } : q
      ),
    },
  })),
  deleteQuestionGitInfo: (questionId) => set((state) => ({
    roadmap: {
      ...state.roadmap,
      questions: state.roadmap.questions.map(q =>
        q.id === questionId ? { ...q, gitCommitUrl: undefined, submittedAt: undefined, gitFilePath: undefined } : q
      ),
    },
  })),
  
  github: {
    token: null,
    repoOwner: null,
    repoName: null,
    basePath: 'solutions',
    initialized: false,
  },
  setGitHubConfig: (config) => set((state) => ({
    github: { ...state.github, ...config, initialized: true }
  })),
  
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
  
  showToolbarButtons: true,
  setShowToolbarButtons: (show) => set({ showToolbarButtons: show }),
}),
    {
      name: 'workpad-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const decompressed = LZString.decompressFromUTF16(str);
            // If decompressed is null/empty, it might be uncompressed data (legacy)
            return JSON.parse(decompressed || str);
          } catch {
            // Fallback for uncompressed data
            return JSON.parse(str);
          }
        },
        setItem: (name, value) => {
          const compressed = LZString.compressToUTF16(JSON.stringify(value));
          localStorage.setItem(name, compressed);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
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
        drawing: state.drawing,
        roadmap: state.roadmap,
        github: state.github,
        autoRun: state.autoRun,
        laserMode: state.laserMode,
        splitRatio: state.splitRatio,
        consoleHeight: state.consoleHeight,
        showToolbarButtons: state.showToolbarButtons,
      }),
      onRehydrateStorage: () => (state) => {
        // Migrate legacy drawing format if present
        if (state && state.drawing) {
          const drawing = state.drawing as any;
          
          // Check if this is legacy format (has elements directly, not files array)
          if (drawing && 'elements' in drawing && !Array.isArray(drawing.files)) {
            const legacyDrawing = drawing;
            state.drawing = {
              currentFileId: '1',
              files: [{
                id: '1',
                name: 'Canvas1',
                elements: legacyDrawing.elements || [],
                appState: legacyDrawing.appState || {
                  viewBackgroundColor: '#ffffff',
                  currentItemStrokeColor: '#000000',
                  currentItemBackgroundColor: '#ffffff',
                  currentItemFillStyle: 'solid',
                  currentItemStrokeWidth: 2,
                  currentItemRoughness: 1,
                  currentItemOpacity: 100,
                },
                files: legacyDrawing.files || {},
              }],
            };
          }
        }
      },
    }
  )
);

