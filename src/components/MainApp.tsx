'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import LayoutContainer from './LayoutContainer';
import Toolbar from './Toolbar';

export default function MainApp() {
  const { createSession, currentSession, codeEditor } = useAppStore();

  useEffect(() => {
    // Only create a session if we don't have one AND we don't have any persisted files
    if (!currentSession && codeEditor.files.length === 0) {
      createSession();
    }
  }, [currentSession, createSession, codeEditor.files.length]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <Toolbar />
      <LayoutContainer />
    </div>
  );
}

