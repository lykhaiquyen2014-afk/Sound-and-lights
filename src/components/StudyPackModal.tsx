import React, { useState, useEffect, useRef } from 'react';
import {
  StudyPack,
  StudySubject,
  StudySource,
  StudyFlashcard,
  StudyPackVersion,
  LessonChatMessage,
} from '../types';
import {
  loadStoredStudyPacks,
  saveStudyPacksToStorage,
  generateStudyPackFromSource,
  generateAllStudyPacks,
  addOrUpdateStudyPackInStorage,
  deleteStudyPackFromStorage,
  updateFlashcardInStorage,
  addStudyPackVersion,
  switchStudyPackVersion,
  deleteStudyPackVersion,
  renameStudyPackVersion,
  ensureStudyPackVersions,
  loadLessonChatMessages,
  saveLessonChatMessage,
  clearLessonChatMessages,
} from '../utils/studyStorage';
import {
  Package,
  Sparkles,
  BookOpen,
  ListChecks,
  Layers,
  HelpCircle,
  MessageSquareQuote,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Copy,
  Check,
  RefreshCw,
  Info,
  Target,
  Edit3,
  GitBranch,
  History,
  Trash2,
  Eye,
  Send,
  Bot,
  User,
  ArrowRight,
  Sliders,
  CheckCheck,
} from 'lucide-react';

interface StudyPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: StudySubject[];
  sources: StudySource[];
  initialSourceId?: string;
  initialSubjectId?: string;
  onOpenQuiz?: (sourceId?: string, subjectId?: string) => void;
}

export const StudyPackModal: React.FC<StudyPackModalProps> = ({
  isOpen,
  onClose,
  subjects,
  sources,
  initialSourceId,
  initialSubjectId,
  onOpenQuiz,
}) => {
  const [packs, setPacks] = useState<StudyPack[]>(() => loadStoredStudyPacks());
  const [activePackId, setActivePackId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'summary' | 'keyPoints' | 'flashcards' | 'practice' | 'qaSeeds' | 'chatbot'
  >('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Practice questions answers state
  const [practiceAnswers, setPracticeAnswers] = useState<
    Record<string, { selectedAnswer?: string; showAnswer?: boolean }>
  >({});

  // Flashcard carousel
  const [currentFcIndex, setCurrentFcIndex] = useState<number>(0);
  const [isFcFlipped, setIsFcFlipped] = useState<boolean>(false);

  // Flashcard editing
  const [editingPackFc, setEditingPackFc] = useState<StudyFlashcard | null>(null);
  const [editFcFront, setEditFcFront] = useState<string>('');
  const [editFcBack, setEditFcBack] = useState<string>('');
  const [editFcMnemonic, setEditFcMnemonic] = useState<string>('');
  const [packToastMessage, setPackToastMessage] = useState<string | null>(null);

  // ==========================================
  // RE-GENERATION STATE
  // ==========================================
  const [isRegenModalOpen, setIsRegenModalOpen] = useState<boolean>(false);
  const [regenMode, setRegenMode] = useState<'standard' | 'advanced' | 'practical' | 'custom'>('standard');
  const [regenCustomPrompt, setRegenCustomPrompt] = useState<string>('');
  const [regenAsNewVersion, setRegenAsNewVersion] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // ==========================================
  // VERSION CONTROL STATE
  // ==========================================
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState<boolean>(false);
  const [previewVersion, setPreviewVersion] = useState<StudyPackVersion | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingVersionName, setEditingVersionName] = useState<string>('');
  const [editingVersionNote, setEditingVersionNote] = useState<string>('');

  // ==========================================
  // INTERACTIVE LESSON CHATBOT STATE
  // ==========================================
  const [chatMessages, setChatMessages] = useState<LessonChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string) => {
    setPackToastMessage(text);
    setTimeout(() => setPackToastMessage(null), 3500);
  };

  // Sync stored packs on open or source change
  useEffect(() => {
    if (isOpen) {
      const stored = loadStoredStudyPacks();
      setPacks(stored);

      if (initialSourceId) {
        const found = stored.find((p) => p.sourceId === initialSourceId);
        if (found) {
          setActivePackId(found.id);
        } else if (stored.length > 0) {
          setActivePackId(stored[0].id);
        }
      } else if (stored.length > 0 && !activePackId) {
        setActivePackId(stored[0].id);
      }
    }
  }, [isOpen, initialSourceId]);

  const filteredPacks = packs.filter((p) => {
    if (selectedSubjectId === 'all') return true;
    return p.subjectId === selectedSubjectId;
  });

  const activePackRaw = packs.find((p) => p.id === activePackId) || filteredPacks[0] || packs[0];
  const activePack: StudyPack | undefined = activePackRaw ? ensureStudyPackVersions(activePackRaw) : undefined;

  // Load chat messages when activePack changes
  useEffect(() => {
    if (activePack?.id) {
      const messages = loadLessonChatMessages(activePack.id);
      setChatMessages(messages);
    }
  }, [activePack?.id]);

  useEffect(() => {
    if (activeTab === 'chatbot') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  if (!isOpen) return null;

  const currentVersion = activePack?.versions?.find((v) => v.id === activePack.currentVersionId) || activePack?.versions?.[0];

  const handleSelectPack = (packId: string) => {
    setActivePackId(packId);
    setCurrentFcIndex(0);
    setIsFcFlipped(false);
    setPracticeAnswers({});
    const messages = loadLessonChatMessages(packId);
    setChatMessages(messages);
  };

  const handleSavePackFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackFc || !activePack) return;
    if (!editFcFront.trim() || !editFcBack.trim()) return;

    const updatedCards = (activePack.flashcards || []).map((c) =>
      c.id === editingPackFc.id
        ? {
            ...c,
            front: editFcFront.trim(),
            back: editFcBack.trim(),
            mnemonic: editFcMnemonic.trim() || undefined,
            updatedAt: Date.now(),
          }
        : c
    );
    const updatedPack = { ...activePack, flashcards: updatedCards };
    const updatedPacks = packs.map((p) => (p.id === activePack.id ? updatedPack : p));
    setPacks(updatedPacks);
    saveStudyPacksToStorage(updatedPacks);

    updateFlashcardInStorage({
      id: editingPackFc.id,
      front: editFcFront.trim(),
      back: editFcBack.trim(),
      mnemonic: editFcMnemonic.trim() || undefined,
    });

    setEditingPackFc(null);
    showToast('Đã cập nhật nội dung thẻ Flashcard trong gói học tập thành công! ✨');
  };

  // ==========================================
  // RE-GENERATION HANDLER
  // ==========================================
  const handlePerformRegeneration = async () => {
    if (!activePack) return;
    setIsRegenerating(true);

    const matchedSource = sources.find((s) => s.id === activePack.sourceId) || sources[0];
    const matchedSubj = subjects.find((s) => s.id === (matchedSource?.subjectId || activePack.subjectId));
    const nextVerNumber = (activePack.versions?.length || 1) + 1;

    try {
      const res = await fetch('/api/ai/regenerate-studypack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: matchedSource,
          subjectTitle: matchedSubj?.title || activePack.subjectTitle,
          gradeLevel: activePack.gradeLevel || 'Lớp 7+',
          generatorMode: regenMode,
          customPrompt: regenCustomPrompt.trim() || undefined,
          versionNumber: nextVerNumber,
          versionName: `Phiên bản ${nextVerNumber} (${
            regenMode === 'advanced'
              ? 'Chuyên sâu & Nâng cao'
              : regenMode === 'practical'
              ? 'Thực tiễn & Đời sống'
              : regenMode === 'custom'
              ? 'Tùy chỉnh riêng'
              : 'Chuẩn sư phạm'
          })`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.version) {
          if (regenAsNewVersion) {
            const updated = addStudyPackVersion(activePack.id, data.version, true);
            setPacks(updated);
            showToast(`⚡ Đã tái tạo thành công Phiên bản ${nextVerNumber} và lưu vào Local Storage!`);
          } else {
            // Overwrite active version
            const updated = addStudyPackVersion(
              activePack.id,
              {
                ...data.version,
                id: activePack.currentVersionId || data.version.id,
                versionNumber: currentVersion?.versionNumber || 1,
                name: `Phiên bản ${currentVersion?.versionNumber || 1} (Tái tạo mới lúc ${new Date().toLocaleTimeString('vi-VN')})`,
              },
              true
            );
            setPacks(updated);
            showToast('⚡ Đã tái tạo và ghi đè phiên bản hiện tại thành công!');
          }
          setIsRegenModalOpen(false);
          setIsRegenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API error, using local fallback generation:', err);
    }

    // Local fallback generation
    const fallbackPack = generateStudyPackFromSource(matchedSource, matchedSubj?.title);
    const fallbackVersion: StudyPackVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVerNumber,
      name: `Phiên bản ${nextVerNumber} (Tái tạo Offline)`,
      createdAt: Date.now(),
      generatorMode: regenMode,
      customPrompt: regenCustomPrompt,
      summary: fallbackPack.summary,
      keyPoints: fallbackPack.keyPoints,
      flashcards: fallbackPack.flashcards,
      practiceQuestions: fallbackPack.practiceQuestions,
      qaSeeds: fallbackPack.qaSeeds,
    };

    const updated = addStudyPackVersion(activePack.id, fallbackVersion, true);
    setPacks(updated);
    setIsRegenModalOpen(false);
    setIsRegenerating(false);
    showToast(`⚡ Đã tái tạo Phiên bản ${nextVerNumber} vào Local Storage!`);
  };

  // ==========================================
  // VERSION CONTROL HANDLERS
  // ==========================================
  const handleSwitchVersion = (versionId: string) => {
    if (!activePack) return;
    const updated = switchStudyPackVersion(activePack.id, versionId);
    setPacks(updated);
    showToast('Đã kích hoạt phiên bản làm bản học tập chính thức! 🔄');
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!activePack) return;
    if ((activePack.versions?.length || 0) <= 1) {
      showToast('Không thể xóa vì bài học chỉ còn 1 phiên bản duy nhất!');
      return;
    }
    const updated = deleteStudyPackVersion(activePack.id, versionId);
    setPacks(updated);
    if (previewVersion?.id === versionId) {
      setPreviewVersion(null);
    }
    showToast('Đã xóa phiên bản khỏi Local Storage. 🗑️');
  };

  const handleSaveRenameVersion = (versionId: string) => {
    if (!activePack || !editingVersionName.trim()) return;
    const updated = renameStudyPackVersion(
      activePack.id,
      versionId,
      editingVersionName.trim(),
      editingVersionNote.trim()
    );
    setPacks(updated);
    setEditingVersionId(null);
    showToast('Đã đổi tên phiên bản thành công! ✏️');
  };

  // ==========================================
  // CHATBOT HANDLERS
  // ==========================================
  const handleSendChatMessage = async (textToSend?: string) => {
    if (!activePack) return;
    const question = textToSend || chatInput.trim();
    if (!question || isChatLoading) return;

    const userMsg: LessonChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: Date.now(),
    };

    const newHistory = saveLessonChatMessage(activePack.id, userMsg);
    setChatMessages(newHistory);
    if (!textToSend) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/lesson-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: activePack.sourceTitle,
          lessonContent: sources.find((s) => s.id === activePack.sourceId)?.content || activePack.summary,
          lessonSummary: activePack.summary,
          question,
          chatHistory: newHistory.slice(-5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: LessonChatMessage = {
          id: `msg-b-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: Date.now(),
          suggestedFollowUps: data.suggestedFollowUps,
        };
        const updated = saveLessonChatMessage(activePack.id, botMsg);
        setChatMessages(updated);
      } else {
        throw new Error('API lesson chat response failed');
      }
    } catch {
      const fallbackMsg: LessonChatMessage = {
        id: `msg-b-${Date.now()}`,
        sender: 'assistant',
        text: `Về câu hỏi **"${question}"**: Trong bài học **"${activePack.sourceTitle}"**, em hãy nhớ quy luật vật lý cốt lõi: ${activePack.summary} Em có thể luyện tập các câu hỏi trắc nghiệm hoặc lật thẻ Flashcard để củng cố nhé!`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Ứng dụng của bài học này trong thực tế là gì?',
          'Mẹo nhớ nhanh công thức của bài này là gì?',
        ],
      };
      const updated = saveLessonChatMessage(activePack.id, fallbackMsg);
      setChatMessages(updated);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAskSeedInChatbot = (seedQuestion: string) => {
    setActiveTab('chatbot');
    setTimeout(() => {
      handleSendChatMessage(seedQuestion);
    }, 150);
  };

  const handleClearChat = () => {
    if (!activePack) return;
    clearLessonChatMessages(activePack.id);
    setChatMessages([]);
    showToast('Đã làm mới lịch sử cuộc trò chuyện!');
  };

  const handleGenerateAllPacks = () => {
    setIsGenerating(true);
    const updated = generateAllStudyPacks(sources, subjects);
    setPacks(updated);
    if (updated.length > 0) {
      setActivePackId(updated[0].id);
    }
    setIsGenerating(false);
    showToast('Đã khởi tạo Study Pack đồng loạt cho tất cả bài học!');
  };

  const handleCopyStudyPack = () => {
    if (!activePack) return;
    const text = `=== STUDY PACK: ${activePack.sourceTitle} ===
Phiên bản: ${currentVersion?.name || 'Bản chính'}
Môn học: ${activePack.subjectTitle} (${activePack.gradeLevel || 'Lớp 7+'})

1. TÓM TẮT (SUMMARY):
${activePack.summary}

2. ĐIỂM CỐT LÕI (KEY POINTS):
${activePack.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}

3. THẺ GHI NHỚ (FLASHCARDS):
${activePack.flashcards.map((fc, i) => `[Thẻ ${i + 1}] (${fc.category}): ${fc.front}\n -> Đáp án: ${fc.back}`).join('\n\n')}

4. CÂU HỎI LUYỆN TẬP (PRACTICE QUESTIONS):
${activePack.practiceQuestions.map((q, i) => `[Câu ${i + 1} - ${q.type}] ${q.question}\nĐáp án: ${q.correctAnswer}\nGiải thích: ${q.explanation}`).join('\n\n')}

5. HẠT GIỐNG Q&A (Q&A SEEDS CHO CHATBOT):
${activePack.qaSeeds.map((qa, i) => `[Hỏi ${i + 1} - ${qa.category || 'Gợi mở'}] ${qa.question}\n -> Trả lời ngắn: ${qa.shortAnswer}\n -> Gợi ý đào sâu: ${qa.followUpPrompt || 'N/A'}`).join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Gói Học Tập Toàn Diện (Study Pack 5-in-1)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Buổi 3 • Lớp 7+
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Local Storage
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tái tạo AI đa phong cách • Quản lý phiên bản v1, v2 • Tích hợp Chatbot Gia sư thông minh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStudyPack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Sao chép toàn bộ gói học tập"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copySuccess ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>

            {/* Nút Quản lý phiên bản */}
            <button
              onClick={() => setIsVersionHistoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Xem danh sách các phiên bản đã lưu của bài học này"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phiên Bản ({activePack?.versions?.length || 1})</span>
            </button>

            {/* Nút Tái tạo AI Re-generate */}
            <button
              onClick={() => setIsRegenModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md shadow-amber-500/20"
              title="Tái tạo lại nội dung bài học bằng AI với các tùy chọn nâng cao"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Tái Tạo AI (Re-generate)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Chủ đề / Bài học:</span>
            <select
              value={activePack?.id || ''}
              onChange={(e) => handleSelectPack(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs focus:outline-none focus:border-indigo-500 max-w-[280px] sm:max-w-xs truncate"
            >
              {filteredPacks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sourceTitle}
                </option>
              ))}
            </select>

            <span className="text-slate-500">|</span>

            {/* Badge Phiên bản hiện tại */}
            <div
              onClick={() => setIsVersionHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-amber-300 font-bold cursor-pointer transition"
              title="Bấm để xem lịch sử và quản lý các phiên bản"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentVersion?.name || 'Phiên bản 1 (Bản gốc)'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({activePack?.versions?.length || 1} bản)
              </span>
            </div>

            <span className="text-slate-500">|</span>

            <span className="text-slate-400">Lọc môn:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">Tất cả môn</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAllPacks}
              disabled={isGenerating}
              className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 hover:underline transition"
              title="Sinh Study Pack đồng loạt cho tất cả bài học trong kho"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tạo tất cả bài ({sources.length})</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs Navigation (including Chatbot!) */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-900/90 overflow-x-auto text-xs scrollbar-thin">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'all'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Toàn Bộ Gói (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Tóm tắt (Summary)</span>
          </button>

          <button
            onClick={() => setActiveTab('keyPoints')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'keyPoints'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>2. Điểm cốt lõi (Key Points)</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'flashcards'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Thẻ ghi nhớ ({activePack?.flashcards?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'practice'
                ? 'border-violet-400 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Luyện tập nhiều dạng ({activePack?.practiceQuestions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('qaSeeds')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'qaSeeds'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>5. Q&A Seed ({activePack?.qaSeeds?.length || 0})</span>
          </button>

          {/* TAB 6: CHATBOT */}
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'chatbot'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-emerald-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="flex items-center gap-1">
              <span>💬 Gia Sư AI Chatbot</span>
              {chatMessages.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!activePack ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="font-semibold">Chưa có Study Pack nào được chọn hoặc khởi tạo.</p>
              <button
                onClick={handleGenerateAllPacks}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Khởi tạo Study Pack ngay
              </button>
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW (ALL 5 TOGETHER) */}
              {activeTab === 'all' && (
                <div className="space-y-6">
                  {/* Pipeline explanation banner with active version */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-indigo-200">
                        <span className="font-bold text-white">Đang mở: </span>
                        <span className="text-amber-300 font-bold">{currentVersion?.name || 'Bản chính'}</span>
                        <span className="mx-2 text-indigo-400">•</span>
                        <span>Quy trình 5 bước: </span>
                        <span className="text-emerald-300 font-semibold">Tóm tắt</span> ➔{' '}
                        <span className="text-amber-300 font-semibold">Điểm neo</span> ➔{' '}
                        <span className="text-cyan-300 font-semibold">Flashcards</span> ➔{' '}
                        <span className="text-violet-300 font-semibold">Luyện tập</span> ➔{' '}
                        <span className="text-rose-300 font-semibold">Hạt giống Q&A</span> ➔{' '}
                        <span className="text-emerald-300 font-semibold">Chatbot</span>.
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVersionHistoryModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 text-indigo-200 text-xs font-semibold shrink-0 transition"
                    >
                      Đổi phiên bản
                    </button>
                  </div>

                  {/* Section 1: Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>1. TÓM TẮT BÀI HỌC (SUMMARY)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {activePack.summary}
                    </p>
                  </div>

                  {/* Section 2: Key Points */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-sm">
                      <ListChecks className="w-4 h-4" />
                      <span>2. CÁC ĐIỂM CỐT LÕI (KEY POINTS)</span>
                    </div>
                    <ul className="space-y-2">
                      {activePack.keyPoints.map((kp, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3: Flashcards preview */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 space-y-3">
                    <div className="flex items-center justify-between text-cyan-400 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>3. THẺ GHI NHỚ FLASHCARD ({activePack.flashcards.length})</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className="text-xs text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lật xem tương tác</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activePack.flashcards.slice(0, 4).map((fc, i) => (
                        <div key={fc.id || i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-cyan-400">
                            Thẻ {i + 1} • {fc.category}
                          </span>
                          <p className="font-semibold text-white line-clamp-2">{fc.front}</p>
                          <p className="text-slate-400 text-[11px] line-clamp-2">{fc.back}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Practice Questions preview */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-violet-500/20 space-y-3">
                    <div className="flex items-center justify-between text-violet-400 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>4. CÂU HỎI LUYỆN TẬP ({activePack.practiceQuestions.length})</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('practice')}
                        className="text-xs text-violet-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Luyện tập ngay</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activePack.practiceQuestions.slice(0, 3).map((q, i) => (
                        <div key={q.id || i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-[10px] font-bold text-violet-400 block mb-1">
                            Câu {i + 1} ({q.type})
                          </span>
                          <p className="text-slate-200">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: Q&A Seeds preview & Chatbot banner */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-3">
                    <div className="flex items-center justify-between text-rose-400 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquareQuote className="w-4 h-4" />
                        <span>5. HẠT GIỐNG Q&A CHO CHATBOT ({activePack.qaSeeds.length})</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('chatbot')}
                        className="text-xs text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mở Chatbot hỏi đáp ngay</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activePack.qaSeeds.slice(0, 3).map((qa, i) => (
                        <div key={qa.id || i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">❓ {qa.question}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">💬 {qa.shortAnswer}</p>
                          </div>
                          <button
                            onClick={() => handleAskSeedInChatbot(qa.question)}
                            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold shrink-0 transition"
                          >
                            Hỏi Chatbot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: SUMMARY */}
              {activeTab === 'summary' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        <span>Tóm Tắt Bức Tranh Tổng Thể (Summary)</span>
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activePack.summary);
                          showToast('Đã sao chép tóm tắt bài học!');
                        }}
                        className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {activePack.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: KEY POINTS */}
              {activeTab === 'keyPoints' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-amber-400" />
                        <span>Danh Sách Các Điểm Neo Cốt Lõi (Key Points)</span>
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activePack.keyPoints.join('\n'));
                          showToast('Đã sao chép các điểm cốt lõi!');
                        }}
                        className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {activePack.keyPoints.map((kp, idx) => (
                        <li key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  {activePack.flashcards.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      Chưa có flashcard cho bài học này.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                        <span>
                          Thẻ {currentFcIndex + 1} / {activePack.flashcards.length}
                        </span>
                        <span className="font-semibold text-cyan-400">
                          {activePack.flashcards[currentFcIndex]?.category?.toUpperCase()}
                        </span>
                      </div>

                      <div
                        onClick={() => setIsFcFlipped(!isFcFlipped)}
                        className="cursor-pointer group relative min-h-[260px] rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 shadow-2xl flex flex-col justify-between transition-all duration-300"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {isFcFlipped ? 'MẶT SAU (ĐÁP ÁN)' : 'MẶT TRƯỚC (CÂU HỎI)'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cur = activePack.flashcards[currentFcIndex];
                                  if (cur) {
                                    setEditingPackFc(cur);
                                    setEditFcFront(cur.front);
                                    setEditFcBack(cur.back);
                                    setEditFcMnemonic(cur.mnemonic || '');
                                  }
                                }}
                                className="px-2 py-0.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-950/80 border border-emerald-800/80 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Sửa thẻ</span>
                              </button>
                              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-indigo-300 transition">
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Bấm để lật</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-center my-6">
                            {!isFcFlipped ? (
                              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                                {activePack.flashcards[currentFcIndex]?.front}
                              </h3>
                            ) : (
                              <div className="text-sm sm:text-base text-cyan-200 whitespace-pre-line font-medium leading-relaxed">
                                {activePack.flashcards[currentFcIndex]?.back}
                              </div>
                            )}
                          </div>
                        </div>

                        {activePack.flashcards[currentFcIndex]?.mnemonic && (
                          <div className="mt-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-center font-medium">
                            💡 Mẹo nhớ: {activePack.flashcards[currentFcIndex]?.mnemonic}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => {
                            setIsFcFlipped(false);
                            setCurrentFcIndex((prev) => (prev > 0 ? prev - 1 : activePack.flashcards.length - 1));
                          }}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Thẻ trước</span>
                        </button>

                        <button
                          onClick={() => setIsFcFlipped(!isFcFlipped)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span>Lật mặt thẻ</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsFcFlipped(false);
                            setCurrentFcIndex((prev) => (prev < activePack.flashcards.length - 1 ? prev + 1 : 0));
                          }}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                          <span>Thẻ kế tiếp</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: PRACTICE */}
              {activeTab === 'practice' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-violet-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-violet-400" />
                      <span>
                        Các câu hỏi luyện tập tự kiểm tra nhiều dạng (Trắc nghiệm, Đúng/Sai, Điền khuyết, Giải thích hiện tượng).
                      </span>
                    </div>
                    {onOpenQuiz && (
                      <button
                        type="button"
                        onClick={() => onOpenQuiz(activePack.sourceId, activePack.subjectId)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-md"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>🚀 Thi Thử (Quiz Mode)</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activePack.practiceQuestions.map((q, idx) => {
                      const state = practiceAnswers[q.id] || {};
                      return (
                        <div key={q.id || idx} className="p-5 rounded-2xl bg-slate-950/80 border border-violet-500/20 shadow-lg space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                                Câu {idx + 1}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {q.type === 'multiple_choice'
                                  ? '• Trắc nghiệm lựa chọn'
                                  : q.type === 'true_false'
                                  ? '• Phán đoán Đúng / Sai'
                                  : q.type === 'fill_in'
                                  ? '• Điền khuyết'
                                  : '• Giải thích hiện tượng đời sống'}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setPracticeAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], showAnswer: !state.showAnswer },
                                }));
                              }}
                              className="text-xs text-violet-300 hover:text-white underline cursor-pointer"
                            >
                              {state.showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                            </button>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                            {q.question}
                          </h4>

                          {/* Options */}
                          {q.type === 'multiple_choice' && q.options && (
                            <div className="space-y-2 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    setPracticeAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: { ...prev[q.id], selectedAnswer: opt, showAnswer: true },
                                    }));
                                  }}
                                  className={`w-full text-left p-3 rounded-xl text-xs transition border cursor-pointer ${
                                    state.selectedAnswer === opt
                                      ? 'bg-violet-600/30 border-violet-400 text-white font-semibold'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {q.type === 'true_false' && (
                            <div className="flex items-center gap-3 pt-1">
                              {['ĐÚNG', 'SAI'].map((choice) => (
                                <button
                                  key={choice}
                                  onClick={() => {
                                    setPracticeAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: { ...prev[q.id], selectedAnswer: choice, showAnswer: true },
                                    }));
                                  }}
                                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                    state.selectedAnswer === choice
                                      ? 'bg-violet-600 text-white border-violet-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Revealed Answer Box */}
                          {state.showAnswer && (
                            <div className="mt-3 p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs space-y-1.5 animate-fade-in">
                              <div className="font-bold text-violet-300 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Đáp án chính xác: {q.correctAnswer}</span>
                              </div>
                              <p className="text-slate-300 leading-relaxed">
                                <span className="font-semibold text-slate-200">Giải thích: </span>
                                {q.explanation}
                              </p>
                              {q.hint && (
                                <p className="text-amber-300 text-[11px]">
                                  💡 Gợi ý tư duy: {q.hint}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: Q&A SEEDS */}
              {activeTab === 'qaSeeds' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Khái niệm Q&A Seed: </span>
                        Các câu hỏi mở chuẩn bị kết nối trực tiếp vào Chatbot. Bấm nút <strong>\"💬 Hỏi Chatbot\"</strong> ở bất kỳ thẻ nào để trò chuyện ngay lập tức!
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('chatbot')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition shadow-sm"
                    >
                      Mở Chatbot
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {activePack.qaSeeds.map((qa, idx) => (
                      <div key={qa.id || idx} className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/20 shadow-md space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
                            {qa.category || 'Gợi mở'}
                          </span>
                          <button
                            onClick={() => handleAskSeedInChatbot(qa.question)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs transition cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5 text-emerald-400" />
                            <span>💬 Trò chuyện về câu này</span>
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-rose-400 shrink-0">❓</span>
                          <span>{qa.question}</span>
                        </h4>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-400 shrink-0">💬</span>
                          <div>
                            <span className="font-semibold text-slate-200">Trả lời ngắn: </span>
                            {qa.shortAnswer}
                          </div>
                        </div>

                        {qa.followUpPrompt && (
                          <div className="text-[11px] text-amber-300 font-medium pl-6">
                            🌱 <span className="underline">Gợi ý đào sâu tiếp theo:</span> {qa.followUpPrompt}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CHATBOT GIA SƯ AI */}
              {activeTab === 'chatbot' && (
                <div className="max-w-3xl mx-auto flex flex-col h-[520px] bg-slate-950/90 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Chat Header */}
                  <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Gia Sư AI: {activePack.sourceTitle}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Local Storage Saved
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Hỏi đáp trực tiếp bám sát nội dung bài học • Trả lời khoa học, dễ hiểu
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClearChat}
                      className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                      title="Xóa lịch sử chat bài này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa đoạn chat</span>
                    </button>
                  </div>

                  {/* Chat Messages Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
                    {/* Welcome message */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed max-w-[85%] space-y-2">
                        <p className="font-bold text-emerald-300">
                          Xin chào em! Thầy/Cô là Gia sư AI đồng hành cùng em trong bài học:
                        </p>
                        <p className="italic text-slate-300 font-semibold">
                          "{activePack.sourceTitle}"
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Em có thắc mắc gì về khái niệm, công thức hoặc hiện tượng thực tế trong bài này không? Em có thể gõ câu hỏi hoặc bấm các gợi ý bên dưới nhé!
                        </p>
                      </div>
                    </div>

                    {/* Messages list */}
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${
                          msg.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {msg.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl leading-relaxed max-w-[85%] space-y-2 ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.text}</div>

                          {/* Follow-up suggestions */}
                          {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                              <span className="text-[10px] text-amber-400 font-bold block">
                                💡 Gợi ý câu hỏi đào sâu tiếp theo:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.suggestedFollowUps.map((prompt, pIdx) => (
                                  <button
                                    key={pIdx}
                                    onClick={() => handleSendChatMessage(prompt)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition text-left cursor-pointer"
                                  >
                                    + {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Loading bubble */}
                    {isChatLoading && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Gia sư AI đang suy nghĩ và tra cứu bài học...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Seed Quick Buttons */}
                  {activePack.qaSeeds && activePack.qaSeeds.length > 0 && (
                    <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 scrollbar-thin">
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">
                        ⚡ Hỏi nhanh từ Q&A Seed:
                      </span>
                      {activePack.qaSeeds.map((seed, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendChatMessage(seed.question)}
                          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-600 text-[11px] text-slate-300 hover:text-indigo-200 transition shrink-0 cursor-pointer"
                        >
                          {seed.question}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Input Bar */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendChatMessage();
                        }
                      }}
                      placeholder="Đặt câu hỏi về bài học này cho Gia sư AI..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <div>
            Đang hiển thị: <span className="font-bold text-white">{activePack?.sourceTitle}</span> •{' '}
            <span className="text-amber-300 font-semibold">{currentVersion?.name || 'Phiên bản 1'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Đóng
          </button>
        </div>

        {/* ======================================================== */}
        {/* SUB-MODAL 1: RE-GENERATION MODAL (TÁI TẠO NỘI DUNG AI) */}
        {/* ======================================================== */}
        {isRegenModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/60 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Tái Tạo Nội Dung Bằng AI (Re-generation)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tạo lại Tóm tắt, Flashcards & Câu hỏi luyện tập từ tài liệu gốc
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegenModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-2">
                    1. Chọn phong cách tái tạo nội dung:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        mode: 'standard' as const,
                        title: '🌟 Chuẩn mực sư phạm',
                        desc: 'Cân bằng lý thuyết và bài tập, chuẩn chương trình THCS.',
                      },
                      {
                        mode: 'advanced' as const,
                        title: '🚀 Nâng cao & Chuyên sâu',
                        desc: 'Đào sâu bản chất, tăng câu hỏi tư duy logic và công thức.',
                      },
                      {
                        mode: 'practical' as const,
                        title: '💡 Thực tiễn & Đời sống',
                        desc: 'Nhiều ví dụ đời thường, công nghệ hiện đại và mẹo nhớ hay.',
                      },
                      {
                        mode: 'custom' as const,
                        title: '🎯 Tùy chỉnh theo yêu cầu',
                        desc: 'Nhập yêu cầu riêng cho AI (ví dụ: tập trung quang học).',
                      },
                    ].map((item) => (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => setRegenMode(item.mode)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          regenMode === item.mode
                            ? 'bg-amber-950/60 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="font-bold text-amber-300">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {regenMode === 'custom' && (
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold">
                      Ghi chú / Yêu cầu bổ sung cho AI:
                    </label>
                    <textarea
                      rows={2}
                      value={regenCustomPrompt}
                      onChange={(e) => setRegenCustomPrompt(e.target.value)}
                      placeholder="Ví dụ: Tập trung vào giải thích hiện tượng cầu vồng và các ứng dụng tán sắc ánh sáng..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {/* Option to save as new version */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regenAsNewVersion}
                      onChange={(e) => setRegenAsNewVersion(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      Lưu thành Phiên bản mới (v{(activePack?.versions?.length || 1) + 1}) trong Local Storage
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                    Khuyến nghị: Giúp em giữ lại bản cũ để đối chiếu, so sánh hoặc quay lại học bất kỳ lúc nào.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegenModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handlePerformRegeneration}
                  disabled={isRegenerating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Đang tái tạo...' : 'Bắt Đầu Tái Tạo Ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-MODAL 2: VERSION CONTROL (QUẢN LÝ CÁC PHIÊN BẢN) */}
        {/* ======================================================== */}
        {isVersionHistoryModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-indigo-500/60 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Quản Lý Các Phiên Bản (Version History)</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                        {activePack?.versions?.length || 1} phiên bản
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      So sánh, kích hoạt lại phiên bản cũ hoặc xóa phiên bản không cần thiết trong Local Storage
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsVersionHistoryModalOpen(false);
                    setPreviewVersion(null);
                    setEditingVersionId(null);
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Version list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {(activePack?.versions || []).map((ver) => {
                  const isActive = ver.id === activePack?.currentVersionId;
                  const isEditing = editingVersionId === ver.id;
                  const isPreview = previewVersion?.id === ver.id;

                  return (
                    <div
                      key={ver.id}
                      className={`p-4 rounded-xl border transition space-y-3 ${
                        isActive
                          ? 'bg-indigo-950/50 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isActive
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {isActive ? '● Đang kích hoạt' : `v${ver.versionNumber}`}
                          </span>

                          {!isEditing ? (
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {ver.name}
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={editingVersionName}
                              onChange={(e) => setEditingVersionName(e.target.value)}
                              className="bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-xs text-white"
                            />
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {new Date(ver.createdAt).toLocaleDateString('vi-VN')} {new Date(ver.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Version details summary */}
                      <p className="text-slate-300 text-xs line-clamp-2 italic">
                        "{ver.summary}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span>🃏 {ver.flashcards?.length || 0} flashcards</span>
                          <span>❓ {ver.practiceQuestions?.length || 0} câu hỏi</span>
                          <span>🌱 {ver.qaSeeds?.length || 0} Q&A seeds</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveRenameVersion(ver.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingVersionId(null)}
                                className="px-2 py-1 rounded bg-slate-800 text-slate-300"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Preview button */}
                              <button
                                onClick={() => setPreviewVersion(isPreview ? null : ver)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{isPreview ? 'Đóng xem' : 'Xem trước'}</span>
                              </button>

                              {/* Rename button */}
                              <button
                                onClick={() => {
                                  setEditingVersionId(ver.id);
                                  setEditingVersionName(ver.name);
                                  setEditingVersionNote(ver.note || '');
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Đổi tên</span>
                              </button>

                              {/* Switch / Restore button */}
                              {!isActive && (
                                <button
                                  onClick={() => handleSwitchVersion(ver.id)}
                                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>Kích hoạt bản này</span>
                                </button>
                              )}

                              {/* Delete button (protected if count <= 1) */}
                              {(activePack?.versions?.length || 0) > 1 && (
                                <button
                                  onClick={() => handleDeleteVersion(ver.id)}
                                  className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                                  title="Xóa phiên bản này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Preview Drawer */}
                      {isPreview && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2 mt-2">
                          <span className="text-[11px] font-bold text-indigo-300 block">
                            👁️ Xem trước nội dung {ver.name}:
                          </span>
                          <p className="text-xs text-slate-200">
                            <strong>Tóm tắt:</strong> {ver.summary}
                          </p>
                          <div className="text-[11px] text-slate-300">
                            <strong>Điểm cốt lõi:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                              {ver.keyPoints?.map((k, idx) => (
                                <li key={idx}>{k}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span>Dữ liệu các phiên bản được tự động lưu trong khóa Local Storage</span>
                <button
                  onClick={() => setIsVersionHistoryModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL 3: EDIT FLASHCARD */}
        {editingPackFc && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-emerald-600/60 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Cập Nhật Thẻ Flashcard (Gói Học Tập)</span>
                </h3>
                <button
                  onClick={() => setEditingPackFc(null)}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackFlashcard} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt trước: Câu hỏi, Khái niệm *
                  </label>
                  <textarea
                    value={editFcFront}
                    onChange={(e) => setEditFcFront(e.target.value)}
                    rows={2}
                    placeholder="Nhập câu hỏi hoặc khái niệm..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt sau: Câu trả lời, Định nghĩa chi tiết *
                  </label>
                  <textarea
                    value={editFcBack}
                    onChange={(e) => setEditFcBack(e.target.value)}
                    rows={3}
                    placeholder="Nhập câu trả lời hoặc định nghĩa chi tiết..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mẹo nhớ nhanh (Mnemonic)
                  </label>
                  <input
                    type="text"
                    value={editFcMnemonic}
                    onChange={(e) => setEditFcMnemonic(e.target.value)}
                    placeholder="Mẹo nhớ ngắn gọn..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingPackFc(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/30"
                  >
                    Lưu Cập Nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Feedback */}
        {packToastMessage && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800/95 border border-emerald-500/80 text-emerald-200 text-xs rounded-xl shadow-xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{packToastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
