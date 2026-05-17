import { useState, useEffect } from 'react';
import { useAppStore, RoadmapQuestion } from '@/stores/appStore';
import { X } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string | null;
}

export default function QuestionModal({ isOpen, onClose, questionId }: QuestionModalProps) {
  const { roadmap, addRoadmapQuestion, updateRoadmapQuestion } = useAppStore();
  
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topics, setTopics] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (questionId) {
        // Edit mode
        const question = roadmap.questions.find(q => q.id === questionId);
        if (question) {
          setNumber(question.number.toString());
          setTitle(question.title);
          setDifficulty(question.difficulty);
          setTopics(question.topics.join(', '));
          setLeetcodeUrl(question.leetcodeUrl || '');
        }
      } else {
        // Add mode
        setNumber('');
        setTitle('');
        setDifficulty('Medium');
        setTopics('');
        setLeetcodeUrl('');
      }
    }
  }, [isOpen, questionId, roadmap.questions]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const topicsArray = topics
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (topicsArray.length === 0) {
      alert('At least one topic is required');
      return;
    }

    const questionData = {
      number: number ? parseInt(number, 10) || 0 : 0,
      title: title.trim(),
      difficulty,
      topics: topicsArray,
      leetcodeUrl: leetcodeUrl.trim() || undefined,
    };

    if (questionId) {
      updateRoadmapQuestion(questionId, questionData);
    } else {
      addRoadmapQuestion(questionData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-accent">
            {questionId ? 'Edit Question' : 'Add Question'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Number (Optional)
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topics (Comma separated) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Array, Hash Table"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">The first topic will be used as the category group.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LeetCode URL (Optional)
            </label>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-700 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !topics.trim()}
            className="px-4 py-2 bg-accent hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
