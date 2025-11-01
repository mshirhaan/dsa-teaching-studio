'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface GitHubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubSettingsModal({ isOpen, onClose }: GitHubSettingsModalProps) {
  const { github, setGitHubConfig } = useAppStore();
  const [token, setToken] = useState(github.token || '');
  const [repoOwner, setRepoOwner] = useState(github.repoOwner || '');
  const [repoName, setRepoName] = useState(github.repoName || '');
  const [basePath, setBasePath] = useState(github.basePath || 'solutions');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: `Connected to ${data.full_name}` });
      } else {
        setTestResult({ success: false, message: 'Connection failed. Check your token and repository details.' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setGitHubConfig({ token, repoOwner, repoName, basePath });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-accent">GitHub Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* GitHub Token */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Generate at: Settings → Developer settings → Personal access tokens → Tokens (classic)
            </p>
          </div>

          {/* Repository Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repository Owner
            </label>
            <input
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="username"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your GitHub username or organization name
            </p>
          </div>

          {/* Repository Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repository Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="repository-name"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Name of the repository where solutions will be stored
            </p>
          </div>

          {/* Base Path */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Path
            </label>
            <input
              type="text"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              placeholder="solutions"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Folder path where solutions will be organized (e.g., &quot;solutions&quot;)
            </p>
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              testResult.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              {testResult.success ? (
                <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-white">{testResult.message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !token || !repoOwner || !repoName}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!token || !repoOwner || !repoName}
              className="px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

