'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { CheckSquare, Square, Search, ExternalLink, StickyNote, X, ChevronDown, ChevronRight, Github, Upload, AlertCircle } from 'lucide-react';
import SubmissionModal from './SubmissionModal';
import { generateAndUploadReadme, uploadFile } from '@/utils/githubApi';
import Toast from './Toast';

export default function Roadmap() {
  const { roadmap, toggleQuestionSolved, updateQuestionNotes, updateQuestionGitInfo, deleteQuestionGitInfo, github } = useAppStore();
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('roadmap-filter-search') || '';
  });
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>(() => {
    if (typeof window === 'undefined') return 'All';
    const stored = localStorage.getItem('roadmap-filter-difficulty');
    return stored === 'Easy' || stored === 'Medium' || stored === 'Hard' ? stored : 'All';
  });
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>(() => {
    if (typeof window === 'undefined') return 'All';
    const stored = localStorage.getItem('roadmap-filter-status');
    return stored === 'Solved' || stored === 'Unsolved' ? stored : 'All';
  });
  const [topicFilter, setTopicFilter] = useState<string>(() => {
    if (typeof window === 'undefined') return 'All';
    return localStorage.getItem('roadmap-filter-topic') || 'All';
  });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  // Initialize expanded topics from localStorage
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roadmap-expanded-topics');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          return new Set();
        }
      }
    }
    return new Set();
  });
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollSaveRef = useRef<number>(0);

  // Persist filters to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('roadmap-filter-search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('roadmap-filter-difficulty', difficultyFilter);
  }, [difficultyFilter]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('roadmap-filter-status', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('roadmap-filter-topic', topicFilter);
  }, [topicFilter]);

  // Get all unique topics
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    roadmap.questions.forEach(q => q.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [roadmap.questions]);

  // Ensure persisted topic filter is still valid
  useEffect(() => {
    if (topicFilter !== 'All' && !allTopics.includes(topicFilter)) {
      setTopicFilter('All');
    }
  }, [allTopics, topicFilter]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return roadmap.questions.filter(q => {
      // Search filter
      if (searchTerm && !q.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !q.number.toString().includes(searchTerm)) {
        return false;
      }
      
      // Difficulty filter
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter === 'Solved' && !q.solved) return false;
      if (statusFilter === 'Unsolved' && q.solved) return false;
      
      // Topic filter
      if (topicFilter !== 'All' && !q.topics.includes(topicFilter)) {
        return false;
      }
      
      return true;
    });
  }, [roadmap.questions, searchTerm, difficultyFilter, statusFilter, topicFilter]);

  // Group questions by main topic (first topic)
  const questionsByTopic = useMemo(() => {
    const grouped: Record<string, typeof filteredQuestions> = {};
    filteredQuestions.forEach(q => {
      const mainTopic = q.topics[0] || 'Other';
      if (!grouped[mainTopic]) {
        grouped[mainTopic] = [];
      }
      grouped[mainTopic].push(q);
    });
    return grouped;
  }, [filteredQuestions]);

  // Restore scroll position on mount, after topics are loaded
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('roadmap-scroll-position');
    if (savedScrollPosition && scrollContainerRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const position = parseInt(savedScrollPosition, 10);
          scrollContainerRef.current.scrollTop = position;
        }
      }, 100);
    }
  }, [filteredQuestions.length, expandedTopics]);

  // Save scroll position on scroll (throttled)
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollSaveRef.current > 200) { // Throttle to max once per 200ms
        localStorage.setItem('roadmap-scroll-position', scrollContainer.scrollTop.toString());
        lastScrollSaveRef.current = now;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Save expanded topics when they change
  useEffect(() => {
    localStorage.setItem('roadmap-expanded-topics', JSON.stringify(Array.from(expandedTopics)));
  }, [expandedTopics]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };

  const handleNotesClick = (questionId: string, currentNotes?: string) => {
    setEditingNotes(questionId);
    setNotesValue(currentNotes || '');
  };

  const handleNotesSave = (questionId: string) => {
    updateQuestionNotes(questionId, notesValue);
    setEditingNotes(null);
  };

  const handleDeleteSubmission = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This will update your README.md file.')) {
      return;
    }

    try {
      // Clear the submission info from local state
      deleteQuestionGitInfo(questionId);

      // If GitHub is configured, update the README.md file
      if (github.token && github.repoOwner && github.repoName) {
        const updatedState = useAppStore.getState();
        const readmeResult = await generateAndUploadReadme(
          { token: github.token, repoOwner: github.repoOwner, repoName: github.repoName, basePath: github.basePath },
          updatedState.roadmap.questions
        );

        if (readmeResult.success) {
          setToast({ message: 'Submission deleted and README.md updated successfully!', type: 'success' });
        } else {
          setToast({ message: 'Submission deleted locally, but README update failed.', type: 'error' });
        }
      } else {
        setToast({ message: 'Submission deleted locally.', type: 'success' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete submission', type: 'error' });
    }
  };

  const handleCodeUpload = async (questionId: string, code: string, language: string) => {
    if (!github.token || !github.repoOwner || !github.repoName) {
      setToast({ message: 'Please configure GitHub in settings first', type: 'error' });
      return;
    }

    setSubmittingQuestionId(questionId);

    try {
      const question = roadmap.questions.find(q => q.id === questionId);
      if (!question) return;

      // Generate file path and filename
      const toKebabCase = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const getExtension = (lang: string) => {
        const ext: Record<string, string> = { javascript: '.js', python: '.py', cpp: '.cpp', java: '.java', typescript: '.ts', c: '.c', csharp: '.cs', go: '.go', rust: '.rs', php: '.php', ruby: '.rb', swift: '.swift', kotlin: '.kt' };
        return ext[lang.toLowerCase()] || '.txt';
      };

      const fileName = `${question.id}-${toKebabCase(question.title)}${getExtension(language)}`;
      const filePath = `${github.basePath}/${question.topics[0]}/${fileName}`;
      
      // Upload to GitHub using the utility function (handles SHA for updates)
      const uploadResult = await uploadFile(
        { token: github.token!, repoOwner: github.repoOwner!, repoName: github.repoName!, basePath: github.basePath },
        filePath,
        code,
        `Add solution: ${question.title}`
      );

      if (uploadResult.success && uploadResult.blobUrl) {
        updateQuestionGitInfo(questionId, uploadResult.blobUrl, Date.now(), filePath);
        
        // Auto-update README.md with fresh state
        const updatedState = useAppStore.getState();
        const readmeResult = await generateAndUploadReadme(
          { token: github.token!, repoOwner: github.repoOwner!, repoName: github.repoName!, basePath: github.basePath },
          updatedState.roadmap.questions
        );
        
        if (readmeResult.success) {
          setToast({ message: `Successfully uploaded to GitHub! README.md updated automatically.`, type: 'success' });
        } else {
          setToast({ message: `File uploaded, but README update failed.`, type: 'error' });
        }
      } else {
        setToast({ message: uploadResult.error || 'Failed to upload to GitHub', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Network error', type: 'error' });
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const progress = roadmap.questions.length > 0 
    ? Math.round((roadmap.solvedCount / roadmap.questions.length) * 100)
    : 0;

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-accent">DSA Roadmap</h2>
            <p className="text-gray-400 text-sm mt-1">
              Track your LeetCode problem-solving journey
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent">{roadmap.solvedCount}/{roadmap.questions.length}</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-400 mt-1">{progress}% Complete</div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
          >
            <option value="All">All Topics</option>
            {allTopics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <div className="text-sm text-gray-400 flex items-center ml-auto">
            Showing {filteredQuestions.length} of {roadmap.questions.length} problems
          </div>
        </div>
      </div>

      {/* Questions List - Grouped by Topic */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg">No questions found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          Object.entries(questionsByTopic).map(([topic, questions]) => {
            const isExpanded = expandedTopics.has(topic);
            const solvedCount = questions.filter(q => q.solved).length;
            
            return (
              <div key={topic} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopic(topic)}
                  className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                    <h3 className="text-xl font-bold text-accent">{topic}</h3>
                    <span className="text-sm text-gray-400">
                      ({solvedCount}/{questions.length} solved)
                    </span>
                  </div>
                  <div className="w-48 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${questions.length > 0 ? (solvedCount / questions.length) * 100 : 0}%` }}
                    />
                  </div>
                </button>

                {/* Questions in this topic */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className={`bg-gray-900 border rounded-lg p-4 transition-all hover:border-accent ${
                          question.solved ? 'border-green-600' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleQuestionSolved(question.id)}
                            className="mt-1 text-gray-400 hover:text-accent transition-colors flex-shrink-0"
                          >
                            {question.solved ? (
                              <CheckSquare size={24} className="text-green-500" />
                            ) : (
                              <Square size={24} />
                            )}
                          </button>

                          {/* Question Info */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Difficulty Row */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                {question.leetcodeUrl ? (
                                  <a
                                    href={question.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-lg hover:text-accent transition-colors cursor-pointer hover:underline"
                                  >
                                    <h3 className={question.solved ? 'text-green-400' : 'text-white'}>
                                      {question.number}. {question.title}
                                    </h3>
                                  </a>
                                ) : (
                                  <h3 className={`font-semibold text-lg ${question.solved ? 'text-green-400' : 'text-white'}`}>
                                    {question.number}. {question.title}
                                  </h3>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                              </div>
                              
                              {/* Solved Date - Top Right */}
                              {question.solved && question.solvedAt && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  Solved {new Date(question.solvedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                          {/* Action Buttons - Optimized UX Layout */}
                            <div className="flex items-center gap-3 mt-3">
                              {/* Primary Actions Group */}
                              <div className="flex items-center gap-2">
                                {/* View Solution - Primary CTA */}
                                {question.gitCommitUrl && (
                                  <a
                                    href={question.gitCommitUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-md transition-all duration-200 text-sm text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-green-400/30"
                                    title="View solution on GitHub"
                                  >
                                    <Github size={17} />
                                    <span>View Solution</span>
                                  </a>
                                )}
                              </div>

                              {/* Secondary Actions Group */}
                              {!editingNotes && (
                                <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
                                  <button
                                    onClick={() => {
                                      setCurrentQuestionId(question.id);
                                      setShowSubmissionModal(true);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                                      question.gitCommitUrl
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-accent'
                                    } ${!github.token ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={!github.token ? 'Configure GitHub settings first to enable submission' : (question.gitCommitUrl ? 'Update solution on GitHub' : 'Submit solution to GitHub')}
                                    disabled={!github.token}
                                  >
                                    <Github size={16} />
                                    <span>{question.gitCommitUrl ? 'Update' : 'Submit'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleNotesClick(question.id, question.notes)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-accent transition-all duration-200 text-sm border border-gray-600"
                                    title={question.notes ? 'Edit notes' : 'Add notes'}
                                  >
                                    <StickyNote size={16} />
                                    <span>Notes</span>
                                  </button>
                                </div>
                              )}

                              {/* Destructive Action - Icon only, visually separated */}
                              {!editingNotes && question.gitCommitUrl && (
                                <button
                                  onClick={() => handleDeleteSubmission(question.id)}
                                  className="ml-auto p-2 bg-red-950/30 hover:bg-red-900/50 rounded-md text-red-400 hover:text-red-300 transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
                                  title="Delete submission"
                                  aria-label="Delete submission"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>

                            {/* Topics (all topics, not just main) */}
                            {question.topics.length > 1 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {question.topics.slice(1).map(t => (
                                  <span key={t} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Notes Section */}
                            {editingNotes === question.id ? (
                              <div className="mt-3">
                                <textarea
                                  value={notesValue}
                                  onChange={(e) => setNotesValue(e.target.value)}
                                  placeholder="Add your notes here..."
                                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-accent focus:outline-none text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleNotesSave(question.id)}
                                    className="px-3 py-1 bg-accent hover:bg-blue-700 rounded text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : question.notes ? (
                              <div className="mt-3 p-2 bg-gray-700 rounded text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-gray-300 whitespace-pre-wrap">{question.notes}</p>
                                  <button
                                    onClick={() => handleNotesClick(question.id, question.notes)}
                                    className="text-gray-400 hover:text-accent transition-colors flex-shrink-0"
                                  >
                                    <StickyNote size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        questionId={currentQuestionId || ''}
        onUpload={async (code, language) => {
          if (currentQuestionId) {
            await handleCodeUpload(currentQuestionId, code, language);
          }
        }}
        onManualLink={async (url, date) => {
          if (currentQuestionId) {
            const question = roadmap.questions.find(q => q.id === currentQuestionId);
            if (question) {
              // Extract file path from URL or generate one
              const filePath = url.includes('/blob/') 
                ? url.split('/blob/')[1] 
                : `${github.basePath}/${question.topics[0]}/manual-link.txt`;
              
              updateQuestionGitInfo(currentQuestionId, url, date, filePath);
              
              // Auto-update README.md with fresh state
              const updatedState = useAppStore.getState();
              const readmeResult = await generateAndUploadReadme(
                { token: github.token!, repoOwner: github.repoOwner!, repoName: github.repoName!, basePath: github.basePath },
                updatedState.roadmap.questions
              );
              
              if (readmeResult.success) {
                setToast({ message: 'Successfully linked GitHub URL! README.md updated automatically.', type: 'success' });
              } else {
                setToast({ message: 'Link created, but README update failed.', type: 'error' });
              }
            }
          }
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

