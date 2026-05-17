import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { X, Key, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiSettingsModal({ isOpen, onClose }: AiSettingsModalProps) {
  const { ai, setAiApiKey } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(ai.apiKey || '');
      setIsSaved(false);
    }
  }, [isOpen, ai.apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    setAiApiKey(apiKeyInput.trim() || null);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleRemove = () => {
    setAiApiKey(null);
    setApiKeyInput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 text-accent">
            <Key size={24} />
            <h2 className="text-xl font-bold">AI Assistant Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300">
            Enter your Google Gemini API key to enable the AI coding assistant. Your key is stored locally in your browser and is never sent to our servers.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-blue-400 transition-colors mt-2"
          >
            Get a free API key from Google AI Studio <ExternalLink size={14} />
          </a>
          
          {isSaved && (
             <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-2 rounded">
               <Check size={16} />
               <span>Settings saved successfully!</span>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
           <button
            onClick={handleRemove}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Remove Key
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
              className="px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
