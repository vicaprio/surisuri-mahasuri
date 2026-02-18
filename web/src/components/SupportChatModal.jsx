import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, AlertCircle, Phone } from 'lucide-react';
import { supportAPI } from '../api/services';

const WELCOME = {
  role: 'assistant',
  id: 'welcome',
  content: '안녕하세요! 마하수리 AI 고객지원입니다 😊\n서비스 이용, 견적, 결제, 보증 등 궁금하신 사항을 편하게 물어보세요.',
};

const QUICK_QUESTIONS = [
  'AI 견적은 어떻게 받나요?',
  '기사님 매칭은 얼마나 걸리나요?',
  '결제는 어떻게 하나요?',
  '보증 기간은 얼마나 되나요?',
];

function TypingDots() {
  return (
    <div className="flex space-x-1 py-1 px-1">
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function SupportChatModal({ onClose }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content, id: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    inputRef.current?.focus();

    try {
      const apiMessages = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content: c }) => ({ role, content: c }));

      const res = await supportAPI.chat(apiMessages);
      const { reply, needsEscalation } = res.data.data;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, id: Date.now() + 1 },
      ]);
      if (needsEscalation) setShowEscalation(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '일시적인 오류가 발생했습니다. 고객센터(1588-0000)로 연락해 주세요.',
          id: Date.now() + 1,
        },
      ]);
      setShowEscalation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOnlyWelcome = messages.length === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div
        className="w-full sm:w-[400px] sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '76vh', maxHeight: '640px' }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-600 sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">마하수리 고객지원</p>
              <p className="text-xs text-blue-200 leading-tight">AI 어시스턴트 · 24시간 운영</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Messages ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mb-0.5">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick Questions (welcome 상태일 때만) ─────────── */}
        {isOnlyWelcome && (
          <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
            <p className="text-xs text-gray-400 mb-2">자주 묻는 질문</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Escalation Banner ─────────────────────────────── */}
        {showEscalation && (
          <div className="mx-3 my-1 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-800">담당자 연결이 필요하신가요?</p>
              <p className="text-xs text-amber-600">평일 09:00–18:00 운영</p>
            </div>
            <a
              href="tel:15880000"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0"
            >
              <Phone className="w-3 h-3" />
              전화 연결
            </a>
          </div>
        )}

        {/* ── Input ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white sm:rounded-b-2xl flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="문의사항을 입력하세요..."
            disabled={loading}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupportChatModal;
