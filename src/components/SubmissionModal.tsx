'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onUpload: (code: string, language: string) => Promise<void>;
  onManualLink?: (url: string, date: number) => void;
}

type Tab = 'save-code' | 'link-url' | 'update-meta';

export default function SubmissionModal({ isOpen, onClose, questionId, onUpload, onManualLink }: SubmissionModalProps) {
  const { roadmap, codeEditor, updateQuestionNotes } = useAppStore();
  const question = roadmap.questions.find(q => q.id === questionId);

  const [activeTab, setActiveTab] = useState<Tab>('save-code');
  const [code, setCode] = useState(codeEditor.code || '');
  const [language, setLanguage] = useState(codeEditor.language || 'javascript');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [notes, setNotes] = useState('');
  const [metaDate, setMetaDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTab, setSuccessTab] = useState<Tab | null>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', ext: '.js' },
    { value: 'python', label: 'Python', ext: '.py' },
    { value: 'java', label: 'Java', ext: '.java' },
    { value: 'cpp', label: 'C++', ext: '.cpp' },
    { value: 'typescript', label: 'TypeScript', ext: '.ts' },
    { value: 'c', label: 'C', ext: '.c' },
  ];

  useEffect(() => {
    if (question) {
      setManualUrl(question.gitCommitUrl || '');
      setNotes(question.notes || '');
      if (question.submittedAt) {
        const dateStr = new Date(question.submittedAt).toISOString().split('T')[0];
        setManualDate(dateStr);
        setMetaDate(dateStr);
      }
    }
  }, [question]);

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
    const selectedFile = codeEditor.files.find(f => f.id === fileId);
    if (selectedFile) {
      setCode(selectedFile.code);
      setLanguage(selectedFile.language);
    }
  };

  if (!isOpen || !question) return null;

  const showSuccess = (tab: Tab) => {
    setSuccessTab(tab);
    setTimeout(() => setSuccessTab(null), 2500);
  };

  const handleSaveCode = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    try {
      if (notes.trim()) updateQuestionNotes(questionId, notes);
      await onUpload(code, language);
      showSuccess('save-code');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkUrl = async () => {
    if (!manualUrl.trim()) return;
    setIsSubmitting(true);
    try {
      let timestamp = Date.now();
      if (manualDate) {
        const parsed = new Date(manualDate).getTime();
        if (!isNaN(parsed)) timestamp = parsed;
      }
      await onManualLink?.(manualUrl, timestamp);
      showSuccess('link-url');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMeta = () => {
    if (notes.trim()) updateQuestionNotes(questionId, notes);
    if (metaDate && onManualLink) {
      const timestamp = new Date(metaDate).getTime();
      if (!isNaN(timestamp)) onManualLink(question.gitCommitUrl || manualUrl || '', timestamp);
    }
    showSuccess('update-meta');
    onClose();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'save-code',
      label: 'Save New Code',
      icon: <Upload size={15} />,
      description: 'Upload a new solution to GitHub',
    },
    {
      id: 'link-url',
      label: 'Link GitHub URL',
      icon: <LinkIcon size={15} />,
      description: 'Point to an existing file on GitHub',
    },
    {
      id: 'update-meta',
      label: 'Update Notes / Date',
      icon: <FileText size={15} />,
      description: 'Edit notes or change the solved date',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Manage Solution</h2>
            <p className="text-sm text-gray-400 mt-0.5">{question.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-xs text-gray-500 px-6 pt-2 pb-1">
          {tabs.find(t => t.id === activeTab)?.description}
        </p>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ── Tab: Save New Code ── */}
          {activeTab === 'save-code' && (
            <div className="space-y-4">
              {codeEditor.files.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Load from Editor File
                  </label>
                  <select
                    value={selectedFileId}
                    onChange={e => handleFileSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm"
                  >
                    <option value="">-- Select a file --</option>
                    {codeEditor.files.map(file => (
                      <option key={file.id} value={file.id}>{file.name} ({file.language})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Code
                </label>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Paste your solution code here..."
                  className="w-full px-3 py-2 bg-gray-950 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none font-mono text-sm resize-none"
                  rows={14}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Approach, time complexity, key insight..."
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="text-xs text-gray-500 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
                Will be saved as:{' '}
                <code className="text-accent">
                  {question.id}-{question.title.toLowerCase().replace(/\s+/g, '-')}
                </code>
              </div>
            </div>
          )}

          {/* ── Tab: Link GitHub URL ── */}
          {activeTab === 'link-url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/..."
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Point to an existing file already on GitHub — no upload needed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Date Solved
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use today&apos;s date.</p>
              </div>
            </div>
          )}

          {/* ── Tab: Update Notes / Date ── */}
          {activeTab === 'update-meta' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Approach, time complexity, key insight..."
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm resize-none"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Date Solved
                </label>
                <input
                  type="date"
                  value={metaDate}
                  onChange={e => setMetaDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent focus:outline-none text-sm"
                />
              </div>

              {question.gitCommitUrl && (
                <div className="text-xs text-gray-500 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                  <LinkIcon size={12} className="text-accent flex-shrink-0" />
                  <span className="truncate">{question.gitCommitUrl}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {successTab === activeTab && (
              <span className="flex items-center gap-1.5 text-sm text-green-400 animate-fade-in">
                <CheckCircle size={15} /> Saved!
              </span>
            )}

            {activeTab === 'save-code' && (
              <button
                onClick={handleSaveCode}
                disabled={!code.trim() || isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-blue-700 rounded-lg text-sm text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Save to GitHub
                  </>
                )}
              </button>
            )}

            {activeTab === 'link-url' && (
              <button
                onClick={handleLinkUrl}
                disabled={!manualUrl.trim() || isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-blue-700 rounded-lg text-sm text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Linking...
                  </>
                ) : (
                  <>
                    <LinkIcon size={15} />
                    Link URL
                  </>
                )}
              </button>
            )}

            {activeTab === 'update-meta' && (
              <button
                onClick={handleUpdateMeta}
                className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-blue-700 rounded-lg text-sm text-white font-medium transition-colors"
              >
                <FileText size={15} />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
