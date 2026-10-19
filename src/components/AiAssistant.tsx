import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AiMentorChatSession } from '../types';
import {
  loadAiMentorSessions,
  saveAiMentorSessions,
  getActiveAiMentorSessionId,
  setActiveAiMentorSessionId,
  createAiMentorSession,
  updateAiMentorSessionMessages,
  deleteAiMentorSession,
  renameAiMentorSession,
  AI_MENTOR_SESSIONS_KEY,
} from '../utils/studyStorage';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  History,
  MessageSquare,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface AiAssistantProps {
  initialPrompt?: string;
  initialTopic?: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ initialPrompt, initialTopic }) => {
  // Session list state
  const [sessions, setSessions] = useState<AiMentorChatSession[]>(() => {
    const list = loadAiMentorSessions();
    if (list.length === 0) {
      const defaultSess = createAiMentorSession(
        'Khám phá Sóng âm & Quang học',
        initialTopic || 'Vật lý & Khoa học Đời sống'
      );
      return [defaultSess];
    }
    return list;
  });

  // Current session ID
  const [activeSessionId, setActiveSessionIdState] = useState<string>(() => {
    const savedActive = getActiveAiMentorSessionId();
    const list = loadAiMentorSessions();
    if (savedActive && list.some((s) => s.id === savedActive)) {
      return savedActive;
    }
    return list[0]?.id || '';
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>(
    activeSession?.topic || initialTopic || 'Vật lý Đời sống'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Interaction feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Session rename modal state
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>('');

  // Mobile/responsive sidebar toggle
  const [showSessionsDrawer, setShowSessionsDrawer] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external initialPrompt passed down from other tabs
  const handledInitialPromptRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialPrompt && initialPrompt !== handledInitialPromptRef.current) {
      handledInitialPromptRef.current = initialPrompt;
      setInput(initialPrompt);
      if (initialTopic) {
        setSelectedTopic(initialTopic);
      }
    }
  }, [initialPrompt, initialTopic]);

  // Suggested questions
  const suggestedQuestions = [
    {
      title: 'Tối ưu đèn học & ánh sáng',
      topic: 'Quang học & Thị giác',
      q: 'Làm thế nào để chọn đèn học và đèn làm việc (Lux & Kelvin) tối ưu nhất để tránh cận thị và mỏi mắt?',
    },
    {
      title: 'Cách âm phòng ngủ giá rẻ',
      topic: 'Âm học & Đời sống',
      q: 'Giải pháp cách âm và giảm tiếng ồn xe cộ ngoài phố cho phòng ngủ bằng các vật liệu dễ kiếm tại nhà?',
    },
    {
      title: 'Khoa học về tiếng ồn nâu',
      topic: 'Âm thanh & Não bộ',
      q: 'Tại sao tiếng ồn nâu (Brown Noise) lại giúp người có hội chứng ADHD và người khó ngủ tập trung hơn?',
    },
    {
      title: 'Cơ chế tai nghe ANC',
      topic: 'Sóng âm & Công nghệ',
      q: 'Nguyên lý sóng âm ngược pha (Phase Cancellation) của tai nghe chống ồn chủ động ANC hoạt động thế nào trong thực tế?',
    },
    {
      title: 'Tại sao có cầu vồng đôi?',
      topic: 'Quang học Tự nhiên',
      q: 'Giải thích hiện tượng quang học tán sắc và phản xạ tạo ra cầu vồng sau mưa, tại sao cầu vồng phụ lại bị đảo ngược thứ tự màu?',
    },
    {
      title: 'Đo khoảng cách sấm sét',
      topic: 'Vận tốc Sóng',
      q: 'Cách tính khoảng cách từ vị trí đứng đến nơi sét đánh dựa vào chênh lệch thời gian giữa ánh chớp và tiếng sấm?',
    },
  ];

  const handleSelectSession = (id: string) => {
    setActiveSessionIdState(id);
    setActiveAiMentorSessionId(id);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setSelectedTopic(target.topic);
    }
    setShowSessionsDrawer(false);
  };

  const handleCreateNewSession = () => {
    const newSess = createAiMentorSession('Cuộc thảo luận mới', selectedTopic);
    const updated = [newSess, ...sessions];
    setSessions(updated);
    setActiveSessionIdState(newSess.id);
    showToast('Đã tạo phiên thảo luận mới trong Local Storage! ✨');
    setShowSessionsDrawer(false);
  };

  const handleDeleteCurrentSession = (idToDelete: string) => {
    if (sessions.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 phiên trò chuyện!');
      return;
    }
    const updated = deleteAiMentorSession(idToDelete);
    setSessions(updated);
    if (activeSessionId === idToDelete) {
      const nextId = updated[0]?.id || '';
      setActiveSessionIdState(nextId);
      setActiveAiMentorSessionId(nextId);
    }
    showToast('Đã xóa phiên thảo luận khỏi Local Storage.');
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameInput.trim() || !activeSession) return;
    const updated = renameAiMentorSession(activeSession.id, renameInput.trim());
    setSessions(updated);
    setIsRenaming(false);
    showToast('Đã đổi tên phiên thảo luận!');
  };

  const handleSend = async (questionToSend?: string) => {
    const textToSend = questionToSend || input.trim();
    if (!textToSend || isLoading || !activeSession) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      topic: selectedTopic,
    };

    const newMessages = [...messages, userMsg];
    updateAiMentorSessionMessages(activeSession.id, newMessages, selectedTopic);
    setSessions(loadAiMentorSessions());

    if (!questionToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          topic: selectedTopic,
          history: newMessages,
        }),
      });

      const data = await response.json();

      if (data.success && data.answer) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: Date.now(),
          topic: selectedTopic,
          suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
        };
        const updatedList = [...newMessages, botMsg];
        updateAiMentorSessionMessages(activeSession.id, updatedList, selectedTopic);
        setSessions(loadAiMentorSessions());
      } else {
        const errorMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Không thể kết nối:** ${data.error || 'Vui lòng thử lại sau.'}`,
          timestamp: Date.now(),
        };
        const updatedList = [...newMessages, errorMsg];
        updateAiMentorSessionMessages(activeSession.id, updatedList, selectedTopic);
        setSessions(loadAiMentorSessions());
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Lỗi mạng:** Không thể kết nối tới dịch vụ AI. Tin nhắn của bạn vẫn được lưu lại an toàn trong Local Storage.`,
        timestamp: Date.now(),
      };
      const updatedList = [...newMessages, errorMsg];
      updateAiMentorSessionMessages(activeSession.id, updatedList, selectedTopic);
      setSessions(loadAiMentorSessions());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    showToast('Đã sao chép nội dung vào Clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`>]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Trình duyệt không hỗ trợ phát âm.');
    }
  };

  const handleExportChat = () => {
    if (!activeSession) return;
    const content = `=== HỒ SƠ NGHIÊN CỨU KHOA HỌC: ${activeSession.title} ===\nChủ đề: ${activeSession.topic}\nThời gian: ${new Date(activeSession.createdAt).toLocaleString('vi-VN')}\n\n` +
      activeSession.messages
        .map((m) => `[${new Date(m.timestamp).toLocaleTimeString('vi-VN')}] ${m.sender === 'user' ? 'HỌC SINH' : 'CỐ VẤN AI'}:\n${m.text}\n`)
        .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-ai-${activeSession.title.slice(0, 25).replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file ghi chép nghiên cứu TXT!');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-500 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Cố Vấn Khoa Học AI (Gemini 3.8 Flash)
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>100% Local Storage</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gia sư đối thoại thông minh về Âm học, Quang học, Bảo vệ thị giác & Thính lực, phân tích các hiện tượng vật lý đời sống.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCreateNewSession}
              className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Tạo cuộc hội thoại mới"
            >
              <Plus className="w-4 h-4" />
              <span>Cuộc trò chuyện mới</span>
            </button>
            <button
              onClick={() => setShowSessionsDrawer(!showSessionsDrawer)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              title="Xem danh sách các phiên trò chuyện"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>Lịch sử ({sessions.length})</span>
            </button>
          </div>
        </div>

        {/* Topic Quick Pills */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phân hệ:</span>
          </span>
          {[
            'Vật lý & Khoa học Đời sống',
            'Âm học & Độ to dB',
            'Quang học & Khúc xạ Snell',
            'Bảo vệ mắt & Ánh sáng xanh',
            'Hiện tượng tự nhiên & Sấm sét',
          ].map((tp) => (
            <button
              key={tp}
              onClick={() => setSelectedTopic(tp)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
                selectedTopic === tp
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Layout: Sessions Sidebar + Chat View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Sessions List (Desktop & Responsive Drawer) */}
        <div
          className={`${
            showSessionsDrawer ? 'block' : 'hidden lg:block'
          } lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Các phiên đã lưu ({sessions.length})</span>
            </h3>
            {showSessionsDrawer && (
              <button
                onClick={() => setShowSessionsDrawer(false)}
                className="text-slate-500 hover:text-slate-300 lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition text-left group relative ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-slate-100 shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold line-clamp-1 group-hover:text-cyan-300 transition">
                      {sess.title}
                    </span>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrentSession(sess.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                        title="Xóa phiên này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span className="truncate max-w-[100px]">{sess.topic}</span>
                    <span>{sess.messages.length} tin</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Khóa lưu: {AI_MENTOR_SESSIONS_KEY}</span>
          </div>
        </div>

        {/* Right Column: Chat Screen */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Session Info Bar */}
          {activeSession && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="font-semibold text-slate-200 truncate">{activeSession.title}</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px] shrink-0">
                  {activeSession.topic}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setRenameInput(activeSession.title);
                    setIsRenaming(true);
                  }}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-lg transition"
                  title="Đổi tên cuộc trò chuyện"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleExportChat}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 rounded-lg transition"
                  title="Xuất file văn bản TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {sessions.length > 1 && (
                  <button
                    onClick={() => handleDeleteCurrentSession(activeSession.id)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Xóa cuộc trò chuyện này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rename Session Modal */}
          {isRenaming && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Đổi tên cuộc trò chuyện</span>
                </h3>
                <form onSubmit={handleSaveRename} className="space-y-4">
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    placeholder="Nhập tên mới..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRenaming(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Chat Messages Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 min-h-[440px] max-h-[620px] overflow-y-auto shadow-inner">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              const isThisSpeaking = speakingId === msg.id;
              const isThisCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isBot
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-2 max-w-2xl ${isBot ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isBot
                          ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Bot Message Action Toolbar */}
                      {isBot && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSpeakText(msg.id, msg.text)}
                              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[11px] ${
                                isThisSpeaking
                                  ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                                  : 'hover:bg-slate-850 hover:text-slate-200 text-slate-500'
                              }`}
                              title={isThisSpeaking ? 'Dừng đọc' : 'Đọc câu trả lời (TTS)'}
                            >
                              {isThisSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                              <span>{isThisSpeaking ? 'Dừng' : 'Đọc'}</span>
                            </button>

                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="p-1.5 hover:bg-slate-850 text-slate-500 hover:text-slate-200 rounded-lg transition flex items-center gap-1"
                              title="Sao chép câu trả lời"
                            >
                              {isThisCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isThisCopied ? 'Đã chép' : 'Chép'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {!isBot && (
                        <div className="mt-1 text-[10px] text-indigo-200/70 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    {/* Follow-up question chips from AI */}
                    {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-cyan-400" />
                          <span>Hỏi sâu hơn:</span>
                        </span>
                        {msg.suggestedFollowUps.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(q)}
                            disabled={isLoading}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-900/60 hover:border-cyan-700 rounded-lg text-[11px] transition text-left"
                          >
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Cố vấn AI đang phân tích dữ liệu vật lý và tạo giải thích sư phạm...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Gợi ý thảo luận nhanh:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTopic(item.topic);
                    handleSend(item.q);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 transition text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* User Input Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="ai-question-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi bất kỳ điều gì về sóng âm, ánh sáng, thị lực, giấc ngủ, chống ồn..."
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
              />
              <button
                id="submit-ai-question-btn"
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 sm:px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shrink-0 shadow-lg"
              >
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
