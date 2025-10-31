'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { CheckSquare, Square, Search, ExternalLink, StickyNote, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function Roadmap() {
  const { roadmap, toggleQuestionSolved, updateQuestionNotes } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Get all unique topics
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    roadmap.questions.forEach(q => q.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [roadmap.questions]);

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            <div className="flex items-start gap-2 flex-wrap">
                              <h3 className={`font-semibold text-lg ${question.solved ? 'text-green-400' : 'text-white'}`}>
                                {question.number}. {question.title}
                              </h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
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

                            {/* Solved timestamp */}
                            {question.solved && question.solvedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Solved on {new Date(question.solvedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <a
                              href={question.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-accent transition-colors"
                              title="Open in LeetCode"
                            >
                              <ExternalLink size={18} />
                            </a>
                            {!editingNotes && (
                              <button
                                onClick={() => handleNotesClick(question.id, question.notes)}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-accent transition-colors"
                                title={question.notes ? 'Edit notes' : 'Add notes'}
                              >
                                <StickyNote size={18} />
                              </button>
                            )}
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
    </div>
  );
}

