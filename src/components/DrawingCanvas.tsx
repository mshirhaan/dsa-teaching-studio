'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/appStore';
import { Plus, X } from 'lucide-react';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function DrawingCanvas() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const drawing = useAppStore((state) => state.drawing);
  const addDrawingFile = useAppStore((state) => state.addDrawingFile);
  const selectDrawingFile = useAppStore((state) => state.selectDrawingFile);
  const updateDrawingFileName = useAppStore((state) => state.updateDrawingFileName);
  const deleteDrawingFile = useAppStore((state) => state.deleteDrawingFile);
  const updateDrawingFileData = useAppStore((state) => state.updateDrawingFileData);
  const updateLibraryItems = useAppStore((state) => state.updateLibraryItems);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const newlyCreatedFileId = useRef<string | null>(null);


  // Ensure at least one file exists
  useEffect(() => {
    if (drawing.files.length === 0) {
      addDrawingFile('Canvas1');
    }
  }, [drawing.files.length, addDrawingFile]);

  // Auto-edit newly created untitled files
  useEffect(() => {
    if (drawing.currentFileId && newlyCreatedFileId.current === 'new') {
      const current = drawing.files.find(f => f.id === drawing.currentFileId);
      if (current && current.name.toLowerCase().startsWith('canvas') && current.elements.length === 0) {
        setTimeout(() => {
          setEditingFileName(drawing.currentFileId!);
          setNewFileName(current.name);
          newlyCreatedFileId.current = null;
        }, 50);
      } else {
        newlyCreatedFileId.current = null;
      }
    }
  }, [drawing.currentFileId, drawing.files]);

  // Load tab state when switching tabs
  useEffect(() => {
    if (!excalidrawAPI || !drawing.currentFileId) return;
    
    const currentFile = drawing.files.find(f => f.id === drawing.currentFileId);
    if (!currentFile) return;

    // Save current tab before switching if needed
    // Then load the new tab
    excalidrawAPI.updateScene({
      elements: currentFile.elements,
      appState: {
        theme: 'dark',
      },
      files: currentFile.files,
    });
    
    // Restore files if they exist
    if (Object.keys(currentFile.files).length > 0) {
      excalidrawAPI.addFiles(Object.values(currentFile.files));
    }
    
    setIsInitialized(true);
  }, [excalidrawAPI, drawing.currentFileId, drawing.files]);

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Debounce updates to prevent infinite loops
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(() => {
      // Convert files object to plain object for storage
      const filesObj: Record<string, any> = {};
      if (files) {
        Object.entries(files).forEach(([fileId, file]: [string, any]) => {
          filesObj[fileId] = {
            id: file.id,
            mimeType: file.mimeType,
            dataURL: file.dataURL,
            created: file.created,
          };
        });
      }

      updateDrawingFileData(
        elements,
        {
          viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
          currentItemStrokeColor: appState.currentItemStrokeColor || '#000000',
          currentItemBackgroundColor: appState.currentItemBackgroundColor || '#ffffff',
          currentItemFillStyle: appState.currentItemFillStyle || 'solid',
          currentItemStrokeWidth: appState.currentItemStrokeWidth || 2,
          currentItemRoughness: appState.currentItemRoughness || 1,
          currentItemOpacity: appState.currentItemOpacity || 100,
        },
        filesObj
      );
    }, 300); // Debounce for 300ms
  }, [updateDrawingFileData]);

  const handleLibraryChange = useCallback((libraryItems: readonly any[]) => {
    // Save library items without debouncing (less frequent changes)
    updateLibraryItems([...libraryItems]); // Convert readonly to mutable array
  }, [updateLibraryItems]);

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  const handleFileNameDoubleClick = (fileId: string, currentName: string) => {
    setEditingFileName(fileId);
    setNewFileName(currentName);
  };

  const handleFileNameSubmit = (fileId: string) => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      updateDrawingFileName(fileId, filename);
    }
    setEditingFileName(null);
    setNewFileName('');
  };

  const handleAddNewFile = () => {
    // Generate a unique canvas filename
    const existingFiles = drawing.files;
    const canvasFiles = existingFiles.filter(f => f.name.toLowerCase().startsWith('canvas'));
    const fileNumber = canvasFiles.length + 1;
    const name = `Canvas${fileNumber}`;
    addDrawingFile(name);
    newlyCreatedFileId.current = 'new';
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab selection
    
    if (drawing.files.length === 1) {
      alert('Cannot delete the last canvas. At least one canvas is required.');
      return;
    }
    
    if (window.confirm('Delete this canvas?')) {
      deleteDrawingFile(fileId);
    }
  };

  const currentDrawingFile = drawing.files.find(f => f.id === drawing.currentFileId);

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Canvas Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {drawing.files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-4 py-2 border-r border-gray-700 min-w-fit ${
              drawing.currentFileId === file.id
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
            } cursor-pointer`}
            onClick={() => selectDrawingFile(file.id)}
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
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="bg-transparent outline-none text-white w-24"
              />
            ) : (
              <>
                <span 
                  className="text-sm" 
                  onDoubleClick={() => handleFileNameDoubleClick(file.id, file.name)}
                >
                  {file.name}
                </span>
                <button
                  onClick={(e) => handleDeleteFile(file.id, e)}
                  className="hover:bg-gray-600 rounded p-1 transition-colors"
                  title="Delete canvas"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        ))}
        
        <button
          onClick={handleAddNewFile}
          className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border-r border-gray-700"
          title="New canvas"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 overflow-hidden">
        {currentDrawingFile && (
          <Excalidraw
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            onChange={handleChange}
            onLibraryChange={handleLibraryChange}
            theme="dark"
            initialData={{
              elements: currentDrawingFile.elements,
              appState: {
                theme: 'dark',
              } as any,
              files: currentDrawingFile.files,
              libraryItems: drawing.libraryItems,
            }}
          />
        )}
      </div>
    </div>
  );
}
