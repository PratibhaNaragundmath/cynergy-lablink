import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User as UserIcon, 
  ArrowRight, 
  Cpu, 
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { geminiService, ChatMessage } from '../../services/geminiService';
import { LabResource } from '../../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "👋 Hi! I'm **LabLink AI Assistant**.\n\nI can help you find lab equipment across campus, check real-time availability, recommend optimal resources for your project, or explain booking allocation scores.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'I need an A100 GPU for final-year vision transformer training',
    'Find rapid prototyping equipment for a lightweight drone chassis',
    'How does the Intelligent Fair Allocation score work?',
    'What should I do if my requested time slot has a conflict?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await geminiService.sendMessage(textToSend, messages);
      setMessages((prev) => [...prev, response]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I encountered an issue while generating a response. Please check your network or try asking another question.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectResource = (resource: LabResource) => {
    onClose();
    navigate(`/resources/${resource.id}`);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-brand-900 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">LabLink AI Assistant</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Gemini-Powered Allocation & Resource Advisor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Safety Notice Bar */}
      <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-800">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
        <span>AI assists with recommendations. Authoritative approvals are verified by faculty.</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 border border-brand-200">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Recommended Equipment Cards */}
              {m.recommendedResources && m.recommendedResources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <p className="font-semibold text-slate-600 text-[11px]">Matching Campus Resources:</p>
                  {m.recommendedResources.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectResource(res)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/80 border border-slate-200/80 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={res.imageUrl}
                          alt={res.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-brand-700 line-clamp-1">
                            {res.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {res.departmentName.split(' ')[0]} • Room {res.location.split(',')[1] || res.location}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`block text-[9px] mt-1.5 ${
                  m.sender === 'user' ? 'text-brand-200 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="h-8 w-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-slate-500 text-xs">
            <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center border border-brand-200">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1">Analyzing lab resources...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested Inquiries</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 px-2.5 py-1 rounded-lg border border-slate-200/70 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-slate-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about equipment, specifications, or slots..."
          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="rounded-xl bg-brand-600 px-3.5 py-2.5 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
