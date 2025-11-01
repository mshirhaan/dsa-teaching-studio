'use client';

import { useEffect, useState } from 'react';
import { X, Download, Upload, LogOut } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { signInWithGoogle, logout, backupRoadmapData, restoreRoadmapData, backupWorkspaceData, restoreWorkspaceData, onAuthStateChanged, auth, User } from '@/lib/firebase';
import Toast from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { roadmap, codeEditor, drawing } = useAppStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setToast({ message: 'Successfully signed in!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to sign in', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupRoadmap = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await backupRoadmapData(user.uid, roadmap);
      setToast({ message: 'Roadmap data backed up successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to backup data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreRoadmap = async () => {
    if (!user) return;
    
    if (!confirm('This will overwrite your current roadmap data. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      const restoredData = await restoreRoadmapData(user.uid);
      if (restoredData) {
        useAppStore.getState().roadmap = restoredData;
        setToast({ message: 'Roadmap data restored successfully!', type: 'success' });
      } else {
        setToast({ message: 'No backup found', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to restore data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupWorkspace = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await backupWorkspaceData(user.uid, codeEditor, drawing);
      setToast({ message: 'Workspace backed up successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to backup workspace', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreWorkspace = async () => {
    if (!user) return;
    
    if (!confirm('This will overwrite your current code files and canvas files. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      const restoredData = await restoreWorkspaceData(user.uid);
      
      if (restoredData) {
        useAppStore.setState({ 
          codeEditor: restoredData.codeEditor,
          drawing: restoredData.drawing 
        });
        
        setToast({ message: 'Workspace restored successfully!', type: 'success' });
      } else {
        setToast({ message: 'No backup found', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to restore workspace', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-accent">Cloud Backup</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {!user ? (
              <div>
                <p className="text-gray-300 mb-4">
                  Sign in with Google to backup your roadmap progress to the cloud.
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-green-200 text-sm">
                    Signed in as: <span className="font-medium">{user.email}</span>
                  </p>
                </div>

                <p className="text-gray-300 mb-4">
                  Back up your data to the cloud and restore it from any device.
                </p>

                {/* Roadmap Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Roadmap</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleBackupRoadmap}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Backing up...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Backup Roadmap
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRestoreRoadmap}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Restore Roadmap
                    </button>
                  </div>
                </div>

                {/* Workspace Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Workspace (Code & Canvas)</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleBackupWorkspace}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Backing up...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Backup Workspace
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRestoreWorkspace}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Restore Workspace
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await logout();
                      setToast({ message: 'Signed out successfully', type: 'success' });
                    } catch (error: any) {
                      setToast({ message: error.message || 'Failed to sign out', type: 'error' });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

