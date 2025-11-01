'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onUpload: (code: string, language: string) => Promise<void>;
  onManualLink?: (url: string, date: number) => void;
}

export default function SubmissionModal({ isOpen, onClose, questionId, onUpload, onManualLink }: SubmissionModalProps) {
  const { roadmap, codeEditor, updateQuestionNotes } = useAppStore();
  const question = roadmap.questions.find(q => q.id === questionId);
  const [code, setCode] = useState(codeEditor.code || '');
  const [language, setLanguage] = useState(codeEditor.language || 'javascript');
  const [manualUrl, setManualUrl] = useState(question?.gitCommitUrl || '');
  const [manualDate, setManualDate] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [notes, setNotes] = useState(question?.notes || '');

  const languages = [
    { value: 'javascript', label: 'JavaScript', ext: '.js' },
    { value: 'python', label: 'Python', ext: '.py' },
    { value: 'java', label: 'Java', ext: '.java' },
    { value: 'cpp', label: 'C++', ext: '.cpp' },
    { value: 'typescript', label: 'TypeScript', ext: '.ts' },
    { value: 'c', label: 'C', ext: '.c' },
  ];

  // Update manual URL and notes when question changes
  useEffect(() => {
    if (question) {
      setManualUrl(question.gitCommitUrl || '');
      setNotes(question.notes || '');
      if (question.submittedAt) {
        const dateStr = new Date(question.submittedAt).toISOString().split('T')[0];
        setManualDate(dateStr);
      }
    }
  }, [question]);

  // Handle file selection from editor files
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
    const selectedFile = codeEditor.files.find(f => f.id === fileId);
    if (selectedFile) {
      setCode(selectedFile.code);
      setLanguage(selectedFile.language);
    }
  };

  if (!isOpen || !question) return null;

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please enter code to submit');
      return;
    }
    
    // Save notes first
    if (notes.trim()) {
      updateQuestionNotes(questionId, notes);
    }
    
    await onUpload(code, language);
    onClose();
  };

  const handleManualLink = () => {
    if (!manualUrl.trim()) {
      alert('Please enter a GitHub URL');
      return;
    }
    
    // Save notes first
    if (notes.trim()) {
      updateQuestionNotes(questionId, notes);
    }
    
    let timestamp: number;
    if (manualDate) {
      timestamp = new Date(manualDate).getTime();
      if (isNaN(timestamp)) {
        alert('Invalid date format');
        return;
      }
    } else {
      timestamp = Date.now();
    }
    onManualLink?.(manualUrl, timestamp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-accent">Submit to GitHub</h2>
            <p className="text-sm text-gray-400 mt-1">{question.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* File selector from editor */}
            {codeEditor.files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select from Editor Files
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
                >
                  <option value="">-- Select a file --</option>
                  {codeEditor.files.map(file => (
                    <option key={file.id} value={file.id}>{file.name} ({file.language})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your solution code here..."
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none font-mono text-sm"
                rows={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this solution (approach, time complexity, etc.)..."
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <AlertCircle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                Your code will be uploaded to GitHub in the format: <br />
                <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {question.id}-{question.title.toLowerCase().replace(/\s+/g, '-')}
                </code>
              </p>
            </div>

            {/* Manual Link Section */}
            {onManualLink && (
              <>
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-sm text-gray-400">OR</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={18} className="text-accent" />
                    <h3 className="font-semibold text-white">Link Existing Solution</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://github.com/user/repo/blob/main/solutions/..."
                      className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date Solved (optional)
                    </label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Leave empty to use today&apos;s date
                    </p>
                  </div>

                  <button
                    onClick={handleManualLink}
                    disabled={!manualUrl.trim()}
                    className="w-full px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LinkIcon size={16} />
                    Link GitHub URL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!code.trim()}
            className="px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit to GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

