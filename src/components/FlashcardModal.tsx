import React, { useState, useEffect } from 'react';
import { StudyFlashcard, StudySubject, StudySource, FlashcardVersion, LessonChatMessage } from '../types';
import {
  loadStoredFlashcards,
  saveFlashcardsToStorage,
  generateAllFlashcards,
  toggleFlashcardStatus,
  deleteFlashcardFromStorage,
  addCustomFlashcard,
  resetFlashcardsToDefault,
  updateFlashcardInStorage,
  syncFlashcardsFromAllSources,
  loadFlashcardVersions,
  saveFlashcardVersions,
  addFlashcardVersion,
  deleteFlashcardVersion,
  renameFlashcardVersion,
  loadFlashcardChatMessages,
  saveFlashcardChatMessage,
  clearFlashcardChatMessages,
  FLASHCARD_VERSIONS_KEY,
  FLASHCARD_CHATS_KEY,
} from '../utils/studyStorage';
import {
  Brain,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  X,
  Copy,
  Check,
  Zap,
  Bookmark,
  Layers,
  Search,
  Filter,
  Lightbulb,
  Award,
  BookOpen,
  Edit3,
  RefreshCw,
  MessageSquare,
  Send,
  Bot,
  User,
  ShieldCheck,
  History,
} from 'lucide-react';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: StudySubject[];
  sources: StudySource[];
  initialSubjectId?: string;
  initialSourceId?: string;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  subjects,
  sources,
  initialSubjectId,
  initialSourceId,
}) => {
  const [cards, setCards] = useState<StudyFlashcard[]>(() => loadStoredFlashcards());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'study' | 'grid'>('study');

  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'all');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialSourceId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generation & feedback states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Audio speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Custom card creation modal
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [newCategory, setNewCategory] = useState<StudyFlashcard['category']>('concept');
  const [newDifficulty, setNewDifficulty] = useState<StudyFlashcard['difficulty']>('Dễ');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || 'subj-sound');
  const [newSourceId, setNewSourceId] = useState<string>('');
  const [newMnemonic, setNewMnemonic] = useState<string>('');

  // Editing existing card state
  const [editingCard, setEditingCard] = useState<StudyFlashcard | null>(null);
  const [editFront, setEditFront] = useState<string>('');
  const [editBack, setEditBack] = useState<string>('');
  const [editCategory, setEditCategory] = useState<StudyFlashcard['category']>('concept');
  const [editDifficulty, setEditDifficulty] = useState<StudyFlashcard['difficulty']>('Dễ');
  const [editStatus, setEditStatus] = useState<StudyFlashcard['status']>('learning');
  const [editSubjectId, setEditSubjectId] = useState<string>(subjects[0]?.id || 'subj-sound');
  const [editSourceId, setEditSourceId] = useState<string>('');
  const [editMnemonic, setEditMnemonic] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Version management states
  const [versions, setVersions] = useState<FlashcardVersion[]>(() => {
    const list = loadFlashcardVersions();
    if (list.length === 0) {
      const v1: FlashcardVersion = {
        id: `fc-ver-1`,
        versionNumber: 1,
        name: 'Phiên bản 1 (Bản gốc từ bài học)',
        createdAt: Date.now(),
        generatorMode: 'standard',
        flashcards: loadStoredFlashcards(),
      };
      saveFlashcardVersions([v1]);
      return [v1];
    }
    return list;
  });
  const [activeVersionId, setActiveVersionId] = useState<string>(() => {
    const list = loadFlashcardVersions();
    return list[0]?.id || 'fc-ver-1';
  });
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState<boolean>(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingVersionName, setEditingVersionName] = useState<string>('');

  // Re-generation state
  const [isRegenModalOpen, setIsRegenModalOpen] = useState<boolean>(false);
  const [regenMode, setRegenMode] = useState<'standard' | 'advanced' | 'practical' | 'mnemonic' | 'custom'>('standard');
  const [regenCustomPrompt, setRegenCustomPrompt] = useState<string>('');
  const [regenAsNewVersion, setRegenAsNewVersion] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Flashcard AI Tutor Chatbot state
  const [chattingCard, setChattingCard] = useState<StudyFlashcard | null>(null);
  const [fcChatMessages, setFcChatMessages] = useState<LessonChatMessage[]>([]);
  const [fcChatInput, setFcChatInput] = useState<string>('');
  const [isFcChatLoading, setIsFcChatLoading] = useState<boolean>(false);
  const [fcChatSpeakingId, setFcChatSpeakingId] = useState<string | null>(null);

  const handleOpenCardChat = (card: StudyFlashcard) => {
    setChattingCard(card);
    const stored = loadFlashcardChatMessages(card.id);
    if (stored.length === 0) {
      const initialMsg: LessonChatMessage = {
        id: `fc-chat-${Date.now()}`,
        sender: 'assistant',
        text: `Xin chào! Thầy là **Gia Sư Flashcard AI**.

Chúng ta đang cùng nghiên cứu thẻ:
• **Mặt trước:** "${card.front}"
• **Mặt sau:** "${card.back}"
• **Phân loại:** ${card.category} | **Độ khó:** ${card.difficulty}
${card.mnemonic ? `• **Mẹo nhớ:** ${card.mnemonic}\n` : ''}
Toàn bộ trao đổi về thẻ này sẽ được **tự động lưu vào Local Storage**. Em muốn thầy giải thích sâu hơn, đưa ra ví dụ thực tế hay mẹo ghi nhớ nào?`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Giải thích chi tiết hơn bản chất hiện tượng này cho em',
          'Cho em ví dụ thực tế trong đời sống ứng dụng điều này',
          'Mẹo để ghi nhớ công thức/quy tắc này lâu hơn',
          'Có câu đố hoặc bài tập nào liên quan để em tự kiểm tra?',
        ],
      };
      saveFlashcardChatMessage(card.id, initialMsg);
      setFcChatMessages([initialMsg]);
    } else {
      setFcChatMessages(stored);
    }
  };

  const handleSendFcChatMessage = async (customText?: string) => {
    const textToSend = customText || fcChatInput.trim();
    if (!textToSend || !chattingCard || isFcChatLoading) return;

    const userMsg: LessonChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const updated = saveFlashcardChatMessage(chattingCard.id, userMsg);
    setFcChatMessages(updated);
    if (!customText) setFcChatInput('');
    setIsFcChatLoading(true);

    try {
      const resp = await fetch('/api/ai/flashcard-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card: chattingCard,
          subjectTitle: chattingCard.subjectTitle,
          question: textToSend,
          chatHistory: updated,
        }),
      });

      const data = await resp.json();
      const botMsg: LessonChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Gia sư AI đã ghi nhận câu hỏi của em!',
        timestamp: Date.now(),
        suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
      };
      const finalUpdated = saveFlashcardChatMessage(chattingCard.id, botMsg);
      setFcChatMessages(finalUpdated);
    } catch {
      const fallbackMsg: LessonChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Không thể kết nối tới máy chủ AI, nhưng câu hỏi của em đã được lưu vào Local Storage.',
        timestamp: Date.now(),
      };
      const finalUpdated = saveFlashcardChatMessage(chattingCard.id, fallbackMsg);
      setFcChatMessages(finalUpdated);
    } finally {
      setIsFcChatLoading(false);
    }
  };

  const handleSpeakFcMessage = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (fcChatSpeakingId === msgId) {
        window.speechSynthesis.cancel();
        setFcChatSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`>]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.onend = () => setFcChatSpeakingId(null);
      utterance.onerror = () => setFcChatSpeakingId(null);
      setFcChatSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRegenerateFlashcards = async () => {
    if (sources.length === 0) {
      showToast('Chưa có bài học nào trong kho để tái tạo!');
      return;
    }
    setIsRegenerating(true);
    showToast('Đang gọi AI để tái tạo bộ Flashcard mới...');

    try {
      const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
      const payloadSources = selectedSubjectId === 'all'
        ? sources
        : sources.filter((s) => s.subjectId === selectedSubjectId);

      const nextVersionNumber = versions.length + 1;
      const resp = await fetch('/api/ai/regenerate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: payloadSources,
          subjectTitle: activeSubject?.title || 'Khoa học Tự nhiên & Đời sống',
          generatorMode: regenMode,
          customPrompt: regenCustomPrompt,
          versionNumber: nextVersionNumber,
          versionName: `Phiên bản ${nextVersionNumber} (${
            regenMode === 'advanced'
              ? 'Nâng cao & Công thức'
              : regenMode === 'practical'
              ? 'Thực tiễn & Đời sống'
              : regenMode === 'mnemonic'
              ? 'Mẹo nhớ trực quan'
              : 'Chuẩn sư phạm'
          })`,
        }),
      });

      const data = await resp.json();
      if (data.flashcards && Array.isArray(data.flashcards)) {
        if (regenAsNewVersion && data.version) {
          const updatedVersions = addFlashcardVersion(data.version);
          setVersions(updatedVersions);
          setActiveVersionId(data.version.id);
        }
        setCards(data.flashcards);
        saveFlashcardsToStorage(data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsRegenModalOpen(false);
        setRegenCustomPrompt('');
        showToast(
          regenAsNewVersion
            ? `Tái tạo thành công & đã lưu thành Phiên bản ${nextVersionNumber} trong Local Storage! 🎉`
            : 'Đã tái tạo và ghi đè bộ thẻ Flashcard thành công! 🎉'
        );
      }
    } catch {
      showToast('Lỗi khi tái tạo Flashcard.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSwitchVersion = (v: FlashcardVersion) => {
    setActiveVersionId(v.id);
    setCards(v.flashcards);
    saveFlashcardsToStorage(v.flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsVersionsModalOpen(false);
    showToast(`Đã chuyển sang ${v.name}! 📚`);
  };

  const handleDeleteVersion = (vId: string) => {
    if (versions.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 phiên bản bộ thẻ!');
      return;
    }
    const updated = deleteFlashcardVersion(vId);
    setVersions(updated);
    if (activeVersionId === vId) {
      const fallback = updated[0];
      if (fallback) {
        handleSwitchVersion(fallback);
      }
    }
    showToast('Đã xóa phiên bản khỏi Local Storage.');
  };

  const handleRenameVersion = (vId: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = renameFlashcardVersion(vId, newName.trim());
    setVersions(updated);
    setEditingVersionId(null);
    showToast('Đã đổi tên phiên bản!');
  };


  // Sync cards when modal opens
  useEffect(() => {
    if (isOpen) {
      const loaded = loadStoredFlashcards();
      setCards(loaded);
      if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
      if (initialSourceId) setSelectedSourceId(initialSourceId);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, initialSubjectId, initialSourceId]);

  // Keyboard navigation for study mode
  useEffect(() => {
    if (!isOpen || viewMode !== 'study') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkCurrentCard('mastered');
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkCurrentCard('review_needed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Filtered cards list
  const filteredCards = cards.filter((card) => {
    if (selectedSubjectId !== 'all' && card.subjectId !== selectedSubjectId) {
      return false;
    }
    if (selectedSourceId !== 'all' && card.sourceId !== selectedSourceId) {
      return false;
    }
    if (selectedCategory !== 'all' && card.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && card.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFront = card.front.toLowerCase().includes(q);
      const matchBack = card.back.toLowerCase().includes(q);
      const matchSource = card.sourceTitle.toLowerCase().includes(q);
      const matchMnemonic = card.mnemonic?.toLowerCase().includes(q);
      return matchFront || matchBack || matchSource || matchMnemonic;
    }
    return true;
  });

  // Safe current card
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNextCard = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    saveFlashcardsToStorage(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    showToast('Đã trộn ngẫu nhiên toàn bộ bộ thẻ Flashcard!');
  };

  const handleMarkCurrentCard = (newStatus: 'mastered' | 'review_needed' | 'learning') => {
    if (!currentCard) return;
    const updated = toggleFlashcardStatus(currentCard.id, newStatus);
    setCards(updated);
    if (newStatus === 'mastered') {
      showToast('Tuyệt vời! Đã ghi nhận thẻ "Đã thuộc" 🎉');
    } else if (newStatus === 'review_needed') {
      showToast('Đã chuyển thẻ vào danh sách "Cần ôn lại" 🔁');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = deleteFlashcardFromStorage(cardId);
    setCards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    showToast('Đã xóa thẻ khỏi bộ Flashcard.');
  };

  // Generate all flashcards using AI or fallback
  const handleGenerateAllFlashcards = async () => {
    if (sources.length === 0) {
      showToast('Chưa có bài học nào trong kho để tạo Flashcards!');
      return;
    }

    setIsGenerating(true);
    showToast('Đang gọi AI để phân tích bài học và tạo bộ Flashcard 2 mặt...');

    try {
      const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
      const payloadSources = selectedSubjectId === 'all'
        ? sources
        : sources.filter((s) => s.subjectId === selectedSubjectId);

      const resp = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: payloadSources,
          subjectTitle: activeSubject?.title || 'Khoa học Âm thanh, Quang học & Đời sống',
        }),
      });

      if (!resp.ok) throw new Error('API server returned error');
      const data = await resp.json();

      if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        // Merge with existing cards avoiding duplicates
        const currentStored = loadStoredFlashcards();
        const merged = [...currentStored];
        for (const newC of data.flashcards) {
          if (!merged.some((c) => c.front.slice(0, 25) === newC.front.slice(0, 25))) {
            merged.unshift(newC);
          }
        }
        saveFlashcardsToStorage(merged);
        setCards(merged);
        setCurrentIndex(0);
        setIsFlipped(false);
        showToast(`Đã tạo thành công ${data.flashcards.length} thẻ Flashcard AI mới!`);
      } else {
        throw new Error('No flashcards returned');
      }
    } catch (e) {
      console.warn('Fallback to local flashcard generator:', e);
      const generated = generateAllFlashcards(sources, subjects);
      setCards(generated);
      setCurrentIndex(0);
      setIsFlipped(false);
      showToast(`Đã nạp bộ Flashcard đầy đủ (${generated.length} thẻ) từ kho bài học!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Read card out loud using Speech Synthesis
  const handleSpeakCard = () => {
    if (!currentCard) return;
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt không hỗ trợ phát âm.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = isFlipped ? currentCard.back : currentCard.front;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Add Custom Card
  const handleSaveCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) {
      showToast('Vui lòng nhập cả mặt trước (câu hỏi) và mặt sau (đáp án)!');
      return;
    }

    const subj = subjects.find((s) => s.id === newSubjectId);
    const updated = addCustomFlashcard({
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      subjectId: newSubjectId,
      subjectTitle: subj?.title || 'Tự tạo',
      mnemonic: newMnemonic.trim() || undefined,
    });

    setCards(updated);
    setIsAddingCard(false);
    setNewFront('');
    setNewBack('');
    setNewMnemonic('');
    setCurrentIndex(0);
    showToast('Đã thêm thẻ Flashcard mới thành công!');
  };

  // Open edit modal for an existing card
  const handleStartEditCard = (card: StudyFlashcard) => {
    setEditingCard(card);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditCategory(card.category);
    setEditDifficulty(card.difficulty);
    setEditStatus(card.status);
    setEditMnemonic(card.mnemonic || '');
    setEditSubjectId(card.subjectId || subjects[0]?.id || 'subj-sound');
    setEditSourceId(card.sourceId || '');
  };

  // Save changes to existing card
  const handleSaveEditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    if (!editFront.trim() || !editBack.trim()) {
      showToast('Vui lòng nhập đầy đủ mặt trước và mặt sau của thẻ!');
      return;
    }

    const subj = subjects.find((s) => s.id === editSubjectId);
    const src = sources.find((s) => s.id === editSourceId);
    const updated = updateFlashcardInStorage({
      id: editingCard.id,
      front: editFront.trim(),
      back: editBack.trim(),
      category: editCategory,
      difficulty: editDifficulty,
      status: editStatus,
      subjectId: editSubjectId,
      subjectTitle: subj?.title || editingCard.subjectTitle,
      sourceId: editSourceId || editingCard.sourceId,
      sourceTitle: src?.title || editingCard.sourceTitle,
      mnemonic: editMnemonic.trim() || undefined,
    });

    setCards(updated);
    setEditingCard(null);
    showToast('Đã cập nhật nội dung thẻ Flashcard thành công! ✨');
  };

  // Sync / update flashcards from all current sources
  const handleSyncFlashcards = () => {
    setIsGenerating(true);
    try {
      const res = syncFlashcardsFromAllSources();
      setCards(res.flashcards);
      showToast(
        `Đã cập nhật ${res.updatedCount} thẻ và bổ sung ${res.addedCount} thẻ mới từ bài học! (Tổng: ${res.totalCount} thẻ)`
      );
    } catch (err) {
      console.error('Failed to sync flashcards:', err);
      showToast('Lỗi khi đồng bộ flashcard từ bài học.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy all flashcards to clipboard
  const handleCopyAllCards = () => {
    if (cards.length === 0) return;
    const text = cards
      .map((c, i) => {
        return `### Thẻ ${i + 1} [${c.category.toUpperCase()} - ${c.difficulty}] (${c.subjectTitle || 'Môn học'})
**Hỏi:** ${c.front}
**Đáp:** ${c.back}
${c.mnemonic ? `*Mẹo nhớ:* ${c.mnemonic}` : ''}
---`;
      })
      .join('\n\n');

    try {
      navigator.clipboard.writeText(text);
      setCopiedAll(true);
      showToast(`Đã sao chép ${cards.length} thẻ Flashcard vào clipboard!`);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      showToast('Không thể tự động sao chép clipboard.');
    }
  };

  if (!isOpen) return null;

  // Stats calculation
  const totalCount = cards.length;
  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const reviewCount = cards.filter((c) => c.status === 'review_needed').length;
  const learningCount = cards.filter((c) => c.status === 'learning').length;
  const masteryPercentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const categoryColor = (cat: StudyFlashcard['category']) => {
    switch (cat) {
      case 'formula':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'application':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'rule':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'distinction':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
    }
  };

  const categoryName = (cat: StudyFlashcard['category']) => {
    switch (cat) {
      case 'formula':
        return '📐 Công thức & Quy luật';
      case 'application':
        return '🌱 Ứng dụng thực tiễn';
      case 'rule':
        return '🛡️ Quy tắc & Định luật';
      case 'distinction':
        return '⚖️ So sánh & Phân biệt';
      default:
        return '💡 Khái niệm then chốt';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Bộ Thẻ Flashcard Ôn Tập Thông Minh
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Active Recall
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                Lật thẻ hai mặt, ôn tập ngắt quãng (Spaced Repetition) và ghi nhớ bản chất khoa học
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegenModalOpen(true)}
              disabled={isGenerating || isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-200 hover:border-purple-400 hover:bg-purple-500/30 transition disabled:opacity-50 cursor-pointer shadow-sm"
              title="Tái tạo bộ Flashcard bằng AI với nhiều chế độ và quản lý phiên bản trong Local Storage"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>⚡ Tái Tạo Bằng AI</span>
            </button>

            <button
              onClick={() => setIsVersionsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Quản lý lịch sử các phiên bản bộ thẻ đã lưu"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Phiên bản ({versions.length})</span>
            </button>

            <button
              onClick={handleSyncFlashcards}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-900 transition disabled:opacity-50 cursor-pointer shadow-sm"
              title="Cập nhật và đồng bộ toàn bộ thẻ Flashcard với nội dung mới nhất từ các bài học"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-indigo-400'}`} />
              <span className="hidden sm:inline">Đồng Bộ Bài Học</span>
            </button>

            <button
              onClick={() => setIsAddingCard(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Tự tạo thêm thẻ ghi nhớ riêng"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Thêm thẻ</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Stats Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>{versions.find((v) => v.id === activeVersionId)?.name || 'Phiên bản 1'}</span>
            </span>

            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tổng số: <strong>{totalCount}</strong> thẻ</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã thuộc: <strong>{masteredCount}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Cần ôn lại: <strong>{reviewCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mastery bar */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Độ thuộc bài:</span>
              <div className="w-24 sm:w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
              <span className="font-bold text-cyan-300">{masteryPercentage}%</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('study')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'study' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lật thẻ
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Danh sách
              </button>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 sm:px-6 bg-slate-900 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Subject selector */}
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const nextSubj = e.target.value;
                setSelectedSubjectId(nextSubj);
                setSelectedSourceId('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
            >
              <option value="all">📚 Tất Cả Môn Học</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            {/* Source / Lesson selector */}
            <select
              value={selectedSourceId}
              onChange={(e) => {
                setSelectedSourceId(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none max-w-[200px] truncate"
            >
              <option value="all">📖 Tất Cả Bài Học</option>
              {sources
                .filter((src) => selectedSubjectId === 'all' || src.subjectId === selectedSubjectId)
                .map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.title}
                  </option>
                ))}
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
            >
              <option value="all">⚡ Tất Cả Phân Loại</option>
              <option value="concept">💡 Khái niệm</option>
              <option value="formula">📐 Công thức</option>
              <option value="rule">🛡️ Quy tắc & Định luật</option>
              <option value="application">🌱 Ứng dụng</option>
              <option value="distinction">⚖️ So sánh/Phân biệt</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
            >
              <option value="all">🎯 Mọi Trạng Thái</option>
              <option value="learning">📖 Đang học</option>
              <option value="review_needed">🔁 Cần ôn lại</option>
              <option value="mastered">✅ Đã thuộc</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleCards}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer"
              title="Trộn ngẫu nhiên thứ tự thẻ"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trộn thẻ</span>
            </button>

            <button
              onClick={handleCopyAllCards}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center gap-1 cursor-pointer"
              title="Sao chép toàn bộ Flashcard dạng đề cương Markdown"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedAll ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-[380px] flex flex-col justify-center">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">Không tìm thấy thẻ Flashcard phù hợp</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Hãy thử đổi bộ lọc hoặc bấm nút "Tạo Thêm Bằng AI" để tự động sinh bộ thẻ ghi nhớ mới từ các bài học!
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleGenerateAllFlashcards}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  ⚡ Tạo Flashcard Từ Bài Học
                </button>
                <button
                  onClick={() => {
                    setSelectedSubjectId('all');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Bỏ lọc
                </button>
              </div>
            </div>
          ) : viewMode === 'study' ? (
            /* STUDY MODE: SINGLE INTERACTIVE FLIP CARD */
            <div className="max-w-xl w-full mx-auto space-y-4">
              {/* Card Header info */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${categoryColor(currentCard.category)}`}>
                    {categoryName(currentCard.category)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-slate-300 truncate max-w-[200px]">
                    {currentCard.sourceTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditCard(currentCard);
                    }}
                    className="px-2 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 border border-emerald-800/60 transition flex items-center gap-1 cursor-pointer text-[11px] font-semibold"
                    title="Chỉnh sửa / Cập nhật nội dung thẻ Flashcard này"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa thẻ</span>
                  </button>

                  <button
                    onClick={handleSpeakCard}
                    className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                    title={isSpeaking ? 'Dừng đọc' : 'Đọc thẻ bằng giọng AI'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-cyan-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono font-bold text-slate-300">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative min-h-[290px] sm:min-h-[320px] rounded-2xl cursor-pointer select-none transition-all duration-300 perspective group"
                style={{ perspective: '1000px' }}
                title="Bấm vào thẻ hoặc phím Space để lật mặt"
              >
                <div
                  className={`w-full h-full min-h-[290px] sm:min-h-[320px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-500 shadow-xl ${
                    isFlipped
                      ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-700/80 shadow-indigo-950/40'
                      : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700 hover:border-slate-600 shadow-slate-950/60'
                  }`}
                >
                  {/* Top indicator on card */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                      {isFlipped ? 'Mặt Sau: Đáp Án & Bản Chất Khoa Học' : 'Mặt Trước: Câu Hỏi & Thử Thách'}
                    </span>

                    <div className="flex items-center gap-2">
                      {currentCard.updatedAt && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                          ✏️ Đã cập nhật
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                        Độ khó: {currentCard.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Main content body */}
                  <div className="py-4 my-auto">
                    {isFlipped ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                          {currentCard.back}
                        </div>

                        {currentCard.mnemonic && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-200">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-300">Mẹo nhớ nhanh: </strong>
                              <span>{currentCard.mnemonic}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                          {currentCard.front}
                        </div>
                        <p className="text-xs text-slate-400 italic">
                          (Hãy tự nhớ lại trong đầu hoặc nói to câu trả lời trước khi lật mặt nhé!)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom hint inside card */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-300 transition">
                      <RotateCw className="w-3 h-3" />
                      Nhấp chuột hoặc phím Space để lật 🔄
                    </span>

                    <span className="capitalize font-semibold text-slate-300">
                      Trạng thái: {currentCard.status === 'mastered' ? '✅ Đã thuộc' : currentCard.status === 'review_needed' ? '🔁 Cần ôn lại' : '📖 Đang học'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation & Status Actions */}
              <div className="space-y-2 pt-1">
                {/* Status Marking Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMarkCurrentCard('mastered')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      currentCard.status === 'mastered'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-700 hover:bg-emerald-950/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã thuộc (Phím 1)</span>
                  </button>

                  <button
                    onClick={() => handleMarkCurrentCard('review_needed')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      currentCard.status === 'review_needed'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md shadow-amber-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-700 hover:bg-amber-950/30'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Cần ôn lại (Phím 2)</span>
                  </button>
                </div>

                {/* Ask AI Tutor button for active card */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCardChat(currentCard);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>💬 Hỏi Gia Sư AI Về Thẻ Này</span>
                  </button>
                </div>

                {/* Prev / Flip / Next bar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handlePrevCard}
                    disabled={filteredCards.length <= 1}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thẻ Trước</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Lật Thẻ</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    disabled={filteredCards.length <= 1}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    <span>Thẻ Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GRID VIEW: BROWSE ALL CARDS IN CURRENT FILTER */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCards.map((card, idx) => {
                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${categoryColor(card.category)}`}>
                          {categoryName(card.category)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {card.updatedAt && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                              ✏️ Đã sửa
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            card.status === 'mastered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : card.status === 'review_needed'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {card.status === 'mastered' ? 'Đã thuộc' : card.status === 'review_needed' ? 'Cần ôn' : 'Đang học'}
                          </span>
                          <button
                            onClick={() => handleStartEditCard(card)}
                            className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-slate-900 transition cursor-pointer"
                            title="Chỉnh sửa / Cập nhật thẻ này"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition cursor-pointer"
                            title="Xóa thẻ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-100 text-sm leading-snug">
                        {card.front}
                      </h4>

                      <p className="text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-850 pt-2 font-normal">
                        {card.back}
                      </p>

                      {card.mnemonic && (
                        <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/60 text-[11px] text-amber-200 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Mẹo nhớ: </strong>{card.mnemonic}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[180px]">{card.sourceTitle}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const updated = toggleFlashcardStatus(
                              card.id,
                              card.status === 'mastered' ? 'learning' : 'mastered'
                            );
                            setCards(updated);
                          }}
                          className="px-2 py-0.5 rounded border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 transition"
                        >
                          {card.status === 'mastered' ? 'Hủy thuộc' : 'Đánh dấu thuộc'}
                        </button>
                        <button
                          onClick={() => handleOpenCardChat(card)}
                          className="px-2 py-0.5 rounded border border-purple-800 bg-purple-950/60 text-purple-300 hover:border-purple-600 transition flex items-center gap-1 cursor-pointer"
                          title="Hỏi Gia sư AI về thẻ này"
                        >
                          <MessageSquare className="w-3 h-3 text-purple-400" />
                          <span>Hỏi AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tự động đồng bộ và lưu trữ an toàn trong Local Storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn khôi phục bộ Flashcard gốc? Các thẻ tự thêm sẽ bị đặt lại.')) {
                  const def = resetFlashcardsToDefault();
                  setCards(def);
                  setCurrentIndex(0);
                  showToast('Đã đặt lại bộ thẻ về mặc định ban đầu.');
                }
              }}
              className="text-slate-500 hover:text-slate-300 text-[11px] transition"
            >
              Đặt lại mặc định
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* SUB-MODAL: ADD CUSTOM CARD */}
        {isAddingCard && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Tự Thêm Thẻ Flashcard Mới</span>
                </h3>
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomCard} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt trước: Câu hỏi, Khái niệm hoặc Hiện tượng *
                  </label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    rows={2}
                    placeholder="Ví dụ: Tần số là gì? Hoặc: Công thức định luật khúc xạ ánh sáng?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt sau: Câu trả lời, Định nghĩa, Công thức & Giải thích chi tiết *
                  </label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Tần số là số chu kỳ dao động trong 1 giây (Hz). Dải nghe của tai người từ 20 Hz đến 20.000 Hz..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Môn học</label>
                    <select
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phân loại</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                    >
                      <option value="concept">💡 Khái niệm</option>
                      <option value="formula">📐 Công thức</option>
                      <option value="rule">🛡️ Quy tắc & Định luật</option>
                      <option value="application">🌱 Ứng dụng</option>
                      <option value="distinction">⚖️ Phân biệt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mẹo nhớ nhanh (Mnemonic - không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={newMnemonic}
                    onChange={(e) => setNewMnemonic(e.target.value)}
                    placeholder="Ví dụ: 20 đến 20.000: Voi dưới, Dơi trên!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                  >
                    Lưu Thẻ Mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: EDIT EXISTING FLASHCARD */}
        {editingCard && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-emerald-600/60 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Cập Nhật Nội Dung Thẻ Flashcard</span>
                </h3>
                <button
                  onClick={() => setEditingCard(null)}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCard} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt trước: Câu hỏi, Khái niệm hoặc Hiện tượng *
                  </label>
                  <textarea
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    rows={2}
                    placeholder="Nhập câu hỏi hoặc khái niệm..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mặt sau: Câu trả lời, Định nghĩa, Công thức & Giải thích chi tiết *
                  </label>
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    rows={3}
                    placeholder="Nhập nội dung giải thích..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Môn học</label>
                    <select
                      value={editSubjectId}
                      onChange={(e) => {
                        setEditSubjectId(e.target.value);
                        setEditSourceId('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Bài học (Nguồn tài liệu)</label>
                    <select
                      value={editSourceId}
                      onChange={(e) => setEditSourceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none truncate"
                    >
                      <option value="">(Chọn bài học liên kết)</option>
                      {sources
                        .filter((src) => !editSubjectId || src.subjectId === editSubjectId)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phân loại</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                    >
                      <option value="concept">💡 Khái niệm</option>
                      <option value="formula">📐 Công thức</option>
                      <option value="rule">🛡️ Quy tắc & Định luật</option>
                      <option value="application">🌱 Ứng dụng</option>
                      <option value="distinction">⚖️ Phân biệt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Độ khó</label>
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trạng thái học tập</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none"
                  >
                    <option value="learning">📖 Đang học</option>
                    <option value="mastered">✅ Đã thuộc</option>
                    <option value="review_needed">🔁 Cần ôn lại</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mẹo nhớ nhanh (Mnemonic)
                  </label>
                  <input
                    type="text"
                    value={editMnemonic}
                    onChange={(e) => setEditMnemonic(e.target.value)}
                    placeholder="Mẹo nhớ ngắn gọn giúp khắc sâu kiến thức..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition cursor-pointer"
                  >
                    Hủy Bỏ
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

        {/* RE-GENERATION MODAL */}
        {isRegenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    Tái Tạo Bộ Thẻ Flashcard Bằng AI
                  </h3>
                </div>
                <button
                  onClick={() => setIsRegenModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Chọn phong cách tái tạo:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'standard', name: 'Chuẩn Sư Phạm', desc: 'Cân bằng lý thuyết và ứng dụng' },
                      { id: 'advanced', name: 'Nâng Cao & Công Thức', desc: 'Đào sâu định lượng và phân biệt' },
                      { id: 'practical', name: 'Thực Tiễn Đời Sống', desc: 'Gắn liền với hiện tượng thực tế' },
                      { id: 'mnemonic', name: 'Mẹo Nhớ Trực Quan', desc: 'Tập trung mẹo nhớ vần điệu' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRegenMode(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          regenMode === m.id
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold block text-slate-200">{m.name}</span>
                        <span className="text-[10px] text-slate-500">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Yêu cầu bổ sung tùy chỉnh (Tùy chọn):
                  </label>
                  <textarea
                    value={regenCustomPrompt}
                    onChange={(e) => setRegenCustomPrompt(e.target.value)}
                    placeholder="Ví dụ: Tập trung vào hiện tượng giao thoa sóng âm, các câu hỏi so sánh phản xạ ánh sáng..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Lưu thành phiên bản mới:</span>
                    <span className="text-[10px] text-slate-500">
                      Tự động tạo Phiên bản {versions.length + 1} trong Local Storage
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={regenAsNewVersion}
                    onChange={(e) => setRegenAsNewVersion(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegenModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateFlashcards}
                  disabled={isRegenerating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                >
                  {isRegenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isRegenerating ? 'Đang tái tạo...' : 'Tái tạo ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERSIONS MANAGEMENT MODAL */}
        {isVersionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Quản Lý Lịch Sử Các Phiên Bản Flashcard
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Lưu trữ bền vững trong Local Storage ({FLASHCARD_VERSIONS_KEY})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVersionsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {versions.map((ver) => {
                  const isActive = ver.id === activeVersionId;
                  const isRenamingThis = editingVersionId === ver.id;

                  return (
                    <div
                      key={ver.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          {isRenamingThis ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingVersionName}
                                onChange={(e) => setEditingVersionName(e.target.value)}
                                className="bg-slate-900 border border-purple-500 rounded px-2 py-1 text-xs text-slate-100"
                                autoFocus
                              />
                              <button
                                onClick={() => handleRenameVersion(ver.id, editingVersionName)}
                                className="px-2 py-1 bg-purple-600 text-white rounded text-[11px] font-bold"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingVersionId(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[11px]"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200 text-xs">{ver.name}</span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-700">
                                  Đang kích hoạt
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingVersionId(ver.id);
                                  setEditingVersionName(ver.name);
                                }}
                                className="text-slate-500 hover:text-slate-300 p-0.5"
                                title="Đổi tên"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>{new Date(ver.createdAt).toLocaleString('vi-VN')}</span>
                            <span>•</span>
                            <span>{ver.flashcards.length} thẻ</span>
                            {ver.generatorMode && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{ver.generatorMode}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isActive && (
                            <button
                              onClick={() => handleSwitchVersion(ver)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition"
                            >
                              Kích hoạt
                            </button>
                          )}
                          {versions.length > 1 && (
                            <button
                              onClick={() => handleDeleteVersion(ver.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition"
                              title="Xóa phiên bản này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVersionsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLASHCARD AI TUTOR CHATBOT MODAL */}
        {chattingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">
                        Gia Sư Flashcard AI (Active Recall Tutor)
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                        Local Storage
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Giải thích chuyên sâu, đào sâu bản chất khoa học và phân tích ví dụ đời sống
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setChattingCard(null);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setFcChatSpeakingId(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Context Preview */}
              <div className="px-4 sm:px-5 py-3 bg-slate-950 border-b border-slate-800/80 space-y-1.5 shrink-0 text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-semibold">
                  <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                  <span>Nội dung thẻ đang xem:</span>
                </div>
                <div className="pl-5 space-y-1">
                  <p className="text-slate-200 font-bold">
                    Mặt trước: {chattingCard.front}
                  </p>
                  <p className="text-slate-400 text-[11px] line-clamp-2">
                    Mặt sau: {chattingCard.back}
                  </p>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 min-h-[300px] max-h-[460px] bg-slate-900/60">
                {fcChatMessages.map((msg) => {
                  const isBot = msg.sender === 'assistant';
                  const isSpeaking = fcChatSpeakingId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          isBot
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      <div className="space-y-2 max-w-xl">
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isBot
                              ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                              : 'bg-purple-600 text-white rounded-tr-none'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>

                          {/* Bot Toolbar */}
                          {isBot && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleSpeakFcMessage(msg.id, msg.text)}
                                  className={`p-1 rounded transition flex items-center gap-1 ${
                                    isSpeaking ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-slate-800 text-slate-400'
                                  }`}
                                  title="Đọc phát âm"
                                >
                                  {isSpeaking ? <VolumeX className="w-3 h-3 text-purple-400" /> : <Volume2 className="w-3 h-3" />}
                                  <span>{isSpeaking ? 'Dừng' : 'Đọc'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text);
                                    showToast('Đã sao chép lời giải thích!');
                                  }}
                                  className="p-1 hover:bg-slate-800 text-slate-400 rounded transition flex items-center gap-1"
                                  title="Sao chép"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Chép</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Follow-up Prompts */}
                        {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                            {msg.suggestedFollowUps.map((prompt, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => handleSendFcChatMessage(prompt)}
                                disabled={isFcChatLoading}
                                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 text-purple-300 border border-purple-900/60 rounded-lg text-[11px] transition text-left cursor-pointer"
                              >
                                💬 {prompt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isFcChatLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>Gia sư AI đang chuẩn bị câu trả lời chi tiết và liên hệ thực tế...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form & Storage Badge */}
              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendFcChatMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={fcChatInput}
                    onChange={(e) => setFcChatInput(e.target.value)}
                    placeholder="Hỏi thầy giải thích thêm, cho ví dụ đời sống hoặc mẹo nhớ..."
                    disabled={isFcChatLoading}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!fcChatInput.trim() || isFcChatLoading}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-md"
                  >
                    <span>Hỏi</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Lưu 100% trong Local Storage ({FLASHCARD_CHATS_KEY})</span>
                  </span>
                  <button
                    onClick={() => {
                      if (chattingCard) {
                        clearFlashcardChatMessages(chattingCard.id);
                        setFcChatMessages([]);
                        showToast('Đã xóa lịch sử chat của thẻ này.');
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    Xóa lịch sử chat thẻ này
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800/95 border border-indigo-500/80 text-indigo-200 text-xs rounded-xl shadow-xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
