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
  const isUpdatingFromStoreRef = useRef(false);
  const previousFileIdRef = useRef<string | null>(null);
  const previousFilesHashRef = useRef<string>('');
  const pendingSaveDataRef = useRef<{ elements: any; appState: any; files: any; fileId: string } | null>(null);


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

  // Save current canvas state before switching tabs
  // Execute any pending debounced saves immediately when fileId is about to change
  useEffect(() => {
    if (previousFileIdRef.current && previousFileIdRef.current !== drawing.currentFileId) {
      // If there's a pending save for the file we're leaving, execute it immediately
      if (pendingSaveDataRef.current && pendingSaveDataRef.current.fileId === previousFileIdRef.current) {
        // Clear the timer and execute the save immediately
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
          updateTimerRef.current = null;
        }
        
        const { elements, appState, files, fileId } = pendingSaveDataRef.current;
        
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
        
        // Save immediately to the file we're leaving
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
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
            zoom: appState.zoom,
          },
          filesObj,
          fileId
        );
        
        // Clear the pending save
        pendingSaveDataRef.current = null;
      } else if (updateTimerRef.current) {
        // No pending save data, but clear the timer anyway
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    }
  }, [drawing.currentFileId, updateDrawingFileData]);

  // Restore scene data when switching tabs, when API becomes available, or when data is restored from backup
  useEffect(() => {
    if (!excalidrawAPI || !drawing.currentFileId) return;
    
    // Get the latest file data from store (fresh read)
    const currentFile = useAppStore.getState().drawing.files.find(f => f.id === drawing.currentFileId);
    if (!currentFile) return;

    // Only restore when fileId actually changes (tab switch) or on initial load
    const fileIdChanged = previousFileIdRef.current !== drawing.currentFileId;
    
    // Skip if already initialized and fileId hasn't changed (normal drawing operations)
    // We only restore on tab switch, not on every edit
    if (!fileIdChanged && isInitialized && previousFileIdRef.current === drawing.currentFileId) {
      return;
    }
    
    // Calculate hash for tracking (only update after successful restoration)
    const currentFileDataHash = JSON.stringify({
      elementCount: currentFile.elements.length,
      fileCount: Object.keys(currentFile.files || {}).length,
      elementIds: currentFile.elements.slice(0, 10).map((el: any) => el.id).join(','),
    });

    // Mark that we're updating from store to prevent circular updates
    isUpdatingFromStoreRef.current = true;
    
    // Convert stored files back to Excalidraw file format
    const excalidrawFiles: any = {};
    if (currentFile.files && Object.keys(currentFile.files).length > 0) {
      Object.entries(currentFile.files).forEach(([fileId, file]: [string, any]) => {
        excalidrawFiles[fileId] = {
          id: file.id,
          mimeType: file.mimeType,
          dataURL: file.dataURL,
          created: file.created,
        };
      });
    }
    
    // Wait for API to be ready, then restore the scene
    const restoreScene = async () => {
      // Wait a bit for Excalidraw to fully initialize after remount
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get fresh file data in case it changed during the delay
      const freshFile = useAppStore.getState().drawing.files.find(f => f.id === drawing.currentFileId);
      if (!freshFile || freshFile.id !== currentFile.id) {
        // File changed while we were waiting, abort
        isUpdatingFromStoreRef.current = false;
        return;
      }
      
      // First, update elements and appState
      excalidrawAPI.updateScene({
        elements: freshFile.elements,
        appState: {
          theme: 'dark',
          ...freshFile.appState,
        },
      });
      
      // Then, restore files separately using addFiles (this is more reliable for images)
      const freshExcalidrawFiles: any = {};
      if (freshFile.files && Object.keys(freshFile.files).length > 0) {
        Object.entries(freshFile.files).forEach(([fileId, file]: [string, any]) => {
          freshExcalidrawFiles[fileId] = {
            id: file.id,
            mimeType: file.mimeType,
            dataURL: file.dataURL,
            created: file.created,
          };
        });
      }
      
      if (Object.keys(freshExcalidrawFiles).length > 0) {
        // Give updateScene time to process first
        await new Promise(resolve => setTimeout(resolve, 50));
        const fileValues = Object.values(freshExcalidrawFiles);
        excalidrawAPI.addFiles(fileValues);
      }
      
      // Finally, restore scroll position and zoom after files are loaded
      if (freshFile.appState.scrollX !== undefined || 
          freshFile.appState.scrollY !== undefined || 
          freshFile.appState.zoom !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
        excalidrawAPI.updateScene({
          appState: {
            scrollX: freshFile.appState.scrollX,
            scrollY: freshFile.appState.scrollY,
            zoom: freshFile.appState.zoom,
          },
        });
      }
      
      // Update tracking refs after successful restoration
      previousFileIdRef.current = drawing.currentFileId;
      previousFilesHashRef.current = currentFileDataHash;
      setIsInitialized(true);
      
      // Clear any pending save data for this file since we just restored
      if (pendingSaveDataRef.current?.fileId === drawing.currentFileId) {
        pendingSaveDataRef.current = null;
      }
      
      // Reset the flag after Excalidraw processes the update
      setTimeout(() => {
        isUpdatingFromStoreRef.current = false;
      }, 250);
    };

    restoreScene();
  }, [excalidrawAPI, drawing.currentFileId, isInitialized]);

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Skip updates if we're currently updating from the store to prevent circular updates
    if (isUpdatingFromStoreRef.current) {
      return;
    }

    // CRITICAL: Capture the current fileId at the time of the change
    // This prevents race conditions when user switches tabs during debounce
    const currentFileIdAtChange = drawing.currentFileId;
    if (!currentFileIdAtChange) return;

    // Store the latest data for immediate save if needed
    pendingSaveDataRef.current = {
      elements,
      appState,
      files,
      fileId: currentFileIdAtChange,
    };

    // Debounce updates to prevent excessive store updates
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(() => {
      // Skip if still updating from store (race condition protection)
      if (isUpdatingFromStoreRef.current) {
        return;
      }

      // Double-check the pending data is still for the same file
      if (!pendingSaveDataRef.current || pendingSaveDataRef.current.fileId !== currentFileIdAtChange) {
        return;
      }

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

      // Save appState properties including scroll position and zoom
      // Use the captured fileId to ensure we save to the correct file even if user switched tabs
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
          // Save viewport properties for scroll position and zoom
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom,
        },
        filesObj,
        currentFileIdAtChange // Pass the captured fileId to ensure correct file is updated
      );
      
      // Clear pending save after successful save
      if (pendingSaveDataRef.current?.fileId === currentFileIdAtChange) {
        pendingSaveDataRef.current = null;
      }
    }, 300); // Debounce for 300ms
  }, [updateDrawingFileData, drawing.currentFileId]);

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
  
  // Use a stable key based on fileId, but include a restoration trigger
  // The useEffect will handle data restoration, so we only need to remount on tab switch
  const excalidrawKey = drawing.currentFileId || 'default';

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
            key={excalidrawKey}
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            onChange={handleChange}
            onLibraryChange={handleLibraryChange}
            theme="dark"
            initialData={{
              elements: currentDrawingFile.elements,
              appState: {
                ...currentDrawingFile.appState,
                // Ensure theme is always dark
                theme: 'dark',
              } as any,
              // Don't include files in initialData - we'll restore them via API to avoid conflicts
              files: {},
              libraryItems: drawing.libraryItems,
            }}
          />
        )}
      </div>
    </div>
  );
}
