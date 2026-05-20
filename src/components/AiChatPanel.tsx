import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { streamOpenRouterResponse } from '@/utils/openrouterApi';
import { X, Send, Bot, User, Trash2, Settings, Zap, Bug, BookOpen, Copy, Check } from 'lucide-react';
import AiSettingsModal from './AiSettingsModal';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom component to render syntax highlighted code blocks with a Copy button
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative rounded-lg overflow-hidden my-2 border border-gray-700 bg-[#1e1e1e] max-w-full">
        <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-gray-800 text-xs text-gray-400">
          <span className="font-semibold text-[10px] uppercase tracking-wider">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check size={10} className="text-green-400" />
                <span className="text-green-400 text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="overflow-x-auto text-[13px]">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, padding: '12px', background: 'transparent' }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-accent text-xs font-mono font-semibold" {...props}>
      {children}
    </code>
  );
};

const MarkdownComponents = {
  code: CodeBlock,
  h1: ({ children }: any) => <h1 className="text-base font-bold mt-4 mb-2 text-white border-b border-gray-800 pb-1">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-sm font-bold mt-3 mb-2 text-white">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xs font-bold mt-2 mb-1 text-white">{children}</h3>,
  p: ({ children }: any) => <p className="mb-2 leading-relaxed text-gray-300 text-xs">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-300 text-xs">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-300 text-xs">{children}</ol>,
  li: ({ children }: any) => <li className="mb-0.5">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-accent">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-gray-400">{children}</em>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-accent pl-3 italic my-2 text-gray-400 text-xs">{children}</blockquote>,
};

export default function AiChatPanel() {
  const { ai, setAiChatOpen, addAiChatMessage, clearAiChatHistory, codeEditor, consoleOutput } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ai.chatHistory, isTyping, streamingText]);

  if (!ai.isChatOpen) return null;

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputValue.trim();
    if (!textToSend) return;

    if (!ai.apiKey) {
      setShowSettings(true);
      return;
    }

    // Add user message
    addAiChatMessage({ role: 'user', text: textToSend });
    if (!customMessage) setInputValue('');
    setIsTyping(true);
    setStreamingText('');

    let fullText = '';

    try {
      const context = {
        code: codeEditor.code,
        language: codeEditor.language,
        consoleOutput: consoleOutput,
        selectedCode: codeEditor.selectedText,
      };
      
      await streamOpenRouterResponse(
        ai.apiKey,
        ai.chatHistory,
        textToSend,
        (chunk) => {
          setIsTyping(false); // Hide the dots once we start getting chunks
          fullText += chunk;
          setStreamingText(fullText);
        },
        context
      );
      
      // Save completed message to global history
      addAiChatMessage({ role: 'model', text: fullText });
    } catch (error: any) {
      addAiChatMessage({ role: 'model', text: `Error: ${error.message}` });
    } finally {
      setIsTyping(false);
      setStreamingText(null);
    }
  };

  const QuickActionButton = ({ icon: Icon, label, message }: { icon: any, label: string, message: string }) => (
    <button
      onClick={() => handleSendMessage(message)}
      disabled={isTyping || !ai.apiKey}
      className="flex flex-col items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors flex-1 disabled:opacity-50"
      title={message}
    >
      <Icon size={16} className="text-accent mb-1" />
      <span className="text-xs text-gray-300 whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div 
      style={{ width: `${ai.chatWidth}px` }}
      className="bg-gray-900 flex flex-col h-full z-20 shrink-0"
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-700 bg-gray-800 shrink-0">
        <div className="flex items-center gap-2 text-accent">
          <Bot size={20} />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => clearAiChatHistory()}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="AI Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setAiChatOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-gray-800 bg-gray-800/50 flex gap-2 shrink-0">
        <QuickActionButton 
          icon={BookOpen} 
          label="Explain" 
          message="Can you explain this code line by line?" 
        />
        <QuickActionButton 
          icon={Bug} 
          label="Fix Error" 
          message="My code has an error. Can you find the bug and suggest a fix?" 
        />
        <QuickActionButton 
          icon={Zap} 
          label="Complexity" 
          message="What is the Time and Space Complexity of this code?" 
        />
      </div>
      
      {/* Selected Code Floating Action Bar */}
      {codeEditor.selectedText && codeEditor.selectedText.trim() && (
        <div className="bg-accent/10 border-b border-accent/25 px-4 py-2 flex items-center justify-between text-xs shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="truncate text-gray-300 font-medium">
              Selected <span className="font-mono bg-gray-900 border border-gray-700 px-1 py-0.5 rounded text-accent font-semibold">{codeEditor.selectedText.length} chars</span>
            </span>
          </div>
          <button
            onClick={() => handleSendMessage(`Can you explain what this specific selected block of code does?\n\n\`\`\`${codeEditor.language}\n${codeEditor.selectedText}\n\`\`\``)}
            disabled={isTyping || streamingText !== null}
            className="px-2.5 py-1 bg-accent text-white font-semibold rounded hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            Explain Selection
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ai.chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <Bot size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{"Hi! I'm your AI coding assistant."}</p>
            <p className="text-xs mt-2">I can see your code and console. Ask me anything or use the quick actions above!</p>
            {!ai.apiKey && (
              <button
                onClick={() => setShowSettings(true)}
                className="mt-4 px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
              >
                Configure API Key
              </button>
            )}
          </div>
        ) : (
          ai.chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-lg text-sm max-w-[85%] overflow-hidden ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-xs">{msg.text}</div>
                ) : (
                  <ReactMarkdown components={MarkdownComponents}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Render currently streaming message */}
        {streamingText !== null && streamingText !== '' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-lg text-sm max-w-[85%] overflow-hidden bg-gray-800 border border-gray-700 text-gray-300">
              <ReactMarkdown components={MarkdownComponents}>
                {streamingText}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-700 bg-gray-800 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="relative"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={ai.apiKey ? "Ask about your code..." : "Setup API Key first..."}
            disabled={!ai.apiKey || isTyping || streamingText !== null}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !ai.apiKey || isTyping || streamingText !== null}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <AiSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
