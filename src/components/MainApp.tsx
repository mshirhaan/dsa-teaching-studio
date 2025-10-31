'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import LayoutContainer from './LayoutContainer';
import Toolbar from './Toolbar';

export default function MainApp() {
  const { createSession, currentSession } = useAppStore();

  useEffect(() => {
    if (!currentSession) {
      createSession();
    }
  }, [currentSession, createSession]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <Toolbar />
      <LayoutContainer />
    </div>
  );
}

