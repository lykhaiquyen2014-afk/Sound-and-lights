import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSession, QuizDiagnosticReport, StudySubject, StudySource, QuizChatMessage } from '../types';
import {
  loadStudySubjects,
  loadStudySources,
  getQuizQuestionsForSession,
  saveQuizResult,
  loadQuizHistory,
  loadMistakeQuestions,
  loadCustomQuizQuestions,
  deleteCustomQuizQuestion,
  evaluateQuizAnswers,
  DEFAULT_QUIZ_BANK,
  clearAllCustomQuizQuestions,
  loadQuizChatMessages,
  saveQuizChatMessage,
  clearQuizChatMessages,
  QUIZ_CHATS_KEY,
} from '../utils/studyStorage';
import { AddQuizQuestionModal } from './AddQuizQuestionModal';
import { audioEngine } from '../utils/audioEngine';
import {
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  PlusCircle,
  RotateCw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  ListChecks,
  Eye,
  CheckCheck,
  HelpCircle,
  Bookmark,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
} from 'lucide-react';

interface QuizArenaProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
  onNavigateToStudy?: () => void;
  initialSourceId?: string;
  initialSubjectId?: string;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  onAskAIAboutTopic,
  onNavigateToStudy,
  initialSourceId,
  initialSubjectId,
}) => {
  // Data sources
  const [subjects] = useState<StudySubject[]>(() => loadStudySubjects());
  const [sources] = useState<StudySource[]>(() => loadStudySources());

  // Timing: 'immediate' (xem kết quả ngay sau mỗi câu) | 'after_quiz' (xem sau khi hoàn thành lượt quiz)
  const [feedbackTiming, setFeedbackTiming] = useState<'immediate' | 'after_quiz'>('immediate');

  // Study Mode: 'all' | 'custom' | 'mistakes' | 'source'
  const [quizScope, setQuizScope] = useState<'all' | 'custom' | 'mistakes' | 'source'>('all');

  // Configuration
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'all');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialSourceId || '');
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState<boolean>(false);

  // Active quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // Results & Diagnostic report
  const [sessionReport, setSessionReport] = useState<{
    score: number;
    correctCount: number;
    report: QuizDiagnosticReport;
  } | null>(null);

  // Modal create custom question
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>(() => loadCustomQuizQuestions());
  const [mistakesCount, setMistakesCount] = useState<number>(() => loadMistakeQuestions().length);
  const [quizHistory, setQuizHistory] = useState<QuizSession[]>(() => loadQuizHistory());

  // Sound & copy & feedback
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [showAllCustom, setShowAllCustom] = useState<boolean>(false);

  // Refresh custom questions
  const refreshCustomQuestions = () => {
    setCustomQuestions(loadCustomQuizQuestions());
    setMistakesCount(loadMistakeQuestions().length);
  };

  // Keyboard support for super fast and engaging self-study
  useEffect(() => {
    if (!isQuizActive || isQuizCompleted || !quizQuestions[currentIndex]) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'a' || key === '1') {
        handleSelectAnswer(0);
      } else if (key === 'b' || key === '2') {
        handleSelectAnswer(1);
      } else if (key === 'c' || key === '3') {
        if (quizQuestions[currentIndex]?.options?.length > 2) handleSelectAnswer(2);
      } else if (key === 'd' || key === '4') {
        if (quizQuestions[currentIndex]?.options?.length > 3) handleSelectAnswer(3);
      } else if (key === 'arrowright' || key === 'enter') {
        if (currentIndex < quizQuestions.length - 1) {
          setCurrentIndex((idx) => idx + 1);
        } else if (userAnswers[quizQuestions[currentIndex]?.id] !== undefined) {
          handleCompleteQuiz();
        }
      } else if (key === 'arrowleft') {
        setCurrentIndex((idx) => Math.max(0, idx - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizActive, isQuizCompleted, currentIndex, quizQuestions, userAnswers]);

  // Start a quiz session
  const startQuiz = (scopeOverride?: 'all' | 'custom' | 'mistakes' | 'source', customList?: QuizQuestion[]) => {
    const scopeToUse = scopeOverride || quizScope;
    let questionsToUse: QuizQuestion[] = [];

    if (customList && customList.length > 0) {
      questionsToUse = customList;
    } else if (scopeToUse === 'custom') {
      const customs = loadCustomQuizQuestions();
      questionsToUse = customs.length > 0 ? customs.slice(0, questionCount) : DEFAULT_QUIZ_BANK.slice(0, questionCount);
    } else if (scopeToUse === 'mistakes') {
      const mistakes = loadMistakeQuestions();
      questionsToUse = mistakes.length > 0 ? mistakes.slice(0, questionCount) : DEFAULT_QUIZ_BANK.slice(0, questionCount);
    } else {
      questionsToUse = getQuizQuestionsForSession({
        sourceId: selectedSourceId || undefined,
        subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : undefined,
        count: questionCount,
      });
    }

    if (questionsToUse.length === 0) {
      questionsToUse = DEFAULT_QUIZ_BANK.slice(0, questionCount);
    }

    setQuizQuestions(questionsToUse);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsQuizActive(true);
    setIsQuizCompleted(false);
    setSessionReport(null);
  };

  // User selects an option
  const handleSelectAnswer = (optionIndex: number) => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;

    const isCorrect = optionIndex === currentQ.correctAnswer;
    const newAnswers = { ...userAnswers, [currentQ.id]: optionIndex };
    setUserAnswers(newAnswers);

    if (soundEnabled) {
      if (isCorrect) {
        audioEngine.playQuizCorrect();
      } else {
        audioEngine.playQuizWrong();
      }
    }
  };

  // Complete and evaluate
  const handleCompleteQuiz = () => {
    const evaluated = evaluateQuizAnswers(quizQuestions, userAnswers);
    setIsQuizCompleted(true);
    setIsQuizActive(false);
    setSessionReport(evaluated);
    setMistakesCount(loadMistakeQuestions().length);

    if (soundEnabled) {
      audioEngine.playQuizComplete();
    }

    // Save session
    const session: QuizSession = {
      id: `session-${Date.now()}`,
      mode: 'self_study',
      feedbackTiming,
      title: `Luyện tập tự học (${feedbackTiming === 'immediate' ? 'Xem từng câu' : 'Xem cả lượt'})`,
      subjectTitle: subjects.find((s) => s.id === selectedSubjectId)?.title || 'Vật lý & Khoa học',
      totalQuestions: quizQuestions.length,
      elapsedSeconds: 0,
      score: evaluated.score,
      correctCount: evaluated.correctCount,
      streak: 0,
      maxStreak: 0,
      completedAt: Date.now(),
      userAnswers,
      diagnostic: evaluated.report,
    };

    saveQuizResult(session);
    setQuizHistory(loadQuizHistory());
  };

  // Generate AI quiz
  const handleGenerateAiQuiz = async () => {
    setIsGeneratingAiQuiz(true);
    try {
      const activeSource = sources.find((s) => s.id === selectedSourceId);
      const activeSubj = subjects.find((s) => s.id === selectedSubjectId);

      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTitle: activeSource?.title,
          subjectTitle: activeSubj?.title,
          content: activeSource?.content,
          questionCount,
          difficulty: 'medium',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          startQuiz(quizScope, data.questions);
        }
      }
    } catch {
      startQuiz(quizScope);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  // AI Question Tutor Chatbot state
  const [chattingQuestion, setChattingQuestion] = useState<QuizQuestion | null>(null);
  const [quizChatMessages, setQuizChatMessages] = useState<QuizChatMessage[]>([]);
  const [quizChatInput, setQuizChatInput] = useState<string>('');
  const [isQuizChatLoading, setIsQuizChatLoading] = useState<boolean>(false);
  const [quizChatSpeakingId, setQuizChatSpeakingId] = useState<string | null>(null);

  const handleOpenQuestionChat = (q: QuizQuestion) => {
    setChattingQuestion(q);
    const storedMsgs = loadQuizChatMessages(q.id);
    if (storedMsgs.length === 0) {
      const studentAnsIdx = userAnswers[q.id];
      const isCorrect = studentAnsIdx !== undefined && studentAnsIdx === q.correctAnswer;
      const initialAssistantMsg: QuizChatMessage = {
        id: `welcome-quiz-${Date.now()}`,
        sender: 'assistant',
        text: `Chào em! Thầy là **Gia Sư Khảo Thí AI**.

Về câu hỏi: **"${q.question}"**
${studentAnsIdx !== undefined ? `• Lựa chọn của em: **${q.options[studentAnsIdx]}** (${isCorrect ? '✅ ĐÚNG' : '❌ CHƯA ĐÚNG'})\n` : ''}• Đáp án chuẩn: **${typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.correctAnswer}**
${q.explanation ? `\n💡 **Giải thích cốt lõi:** ${q.explanation}` : ''}
${q.misconceptionTrap ? `\n⚠️ **Bẫy tư duy thường gặp:** ${q.misconceptionTrap}` : ''}

Toàn bộ trao đổi này được **lưu tự động vào Local Storage**. Em hãy chọn câu hỏi gợi ý bên dưới hoặc gõ câu hỏi để thầy giải thích cặn kẽ nhé!`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Vì sao đáp án này đúng và các phương án khác sai?',
          'Phân tích bẫy tư duy mà học sinh hay gặp ở câu này',
          'Cho em một ví dụ thực tế liên quan đến hiện tượng này',
          'Cho em 1 câu hỏi tương tự để em thử sức lại',
        ],
      };
      saveQuizChatMessage(q.id, initialAssistantMsg);
      setQuizChatMessages([initialAssistantMsg]);
    } else {
      setQuizChatMessages(storedMsgs);
    }
  };

  const handleSendQuizChatMessage = async (customText?: string) => {
    const textToSend = customText || quizChatInput.trim();
    if (!textToSend || !chattingQuestion || isQuizChatLoading) return;

    const userMsg: QuizChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const updated = saveQuizChatMessage(chattingQuestion.id, userMsg);
    setQuizChatMessages(updated);
    if (!customText) setQuizChatInput('');
    setIsQuizChatLoading(true);

    try {
      const studentAnsIdx = userAnswers[chattingQuestion.id];
      const isCorrect = studentAnsIdx !== undefined && studentAnsIdx === chattingQuestion.correctAnswer;
      const resp = await fetch('/api/ai/quiz-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionData: chattingQuestion,
          studentChoice: studentAnsIdx !== undefined ? chattingQuestion.options[studentAnsIdx] : undefined,
          wasCorrect: isCorrect,
          userQuestion: textToSend,
          chatHistory: updated,
        }),
      });

      const data = await resp.json();
      const botMsg: QuizChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Gia sư AI đã ghi nhận câu hỏi của em!',
        timestamp: Date.now(),
        suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
      };
      const finalUpdated = saveQuizChatMessage(chattingQuestion.id, botMsg);
      setQuizChatMessages(finalUpdated);
    } catch {
      const fallbackMsg: QuizChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Không thể kết nối với máy chủ AI, nhưng câu hỏi của em đã được lưu vào Local Storage.',
        timestamp: Date.now(),
      };
      const finalUpdated = saveQuizChatMessage(chattingQuestion.id, fallbackMsg);
      setQuizChatMessages(finalUpdated);
    } finally {
      setIsQuizChatLoading(false);
    }
  };

  const handleSpeakQuizChatMessage = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (quizChatSpeakingId === msgId) {
        window.speechSynthesis.cancel();
        setQuizChatSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`>]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.onend = () => setQuizChatSpeakingId(null);
      utterance.onerror = () => setQuizChatSpeakingId(null);
      setQuizChatSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };


  const currentQ = quizQuestions[currentIndex];
  const isCurrentAnswered = currentQ ? userAnswers[currentQ.id] !== undefined : false;
  const currentSelectedOpt = currentQ ? userAnswers[currentQ.id] : undefined;

  const handleCopyReport = () => {
    if (!sessionReport) return;
    const text = `📊 KẾT QUẢ TỰ HỌC QUIZ: ${sessionReport.correctCount} / ${quizQuestions.length} CÂU ĐÚNG (${sessionReport.score}%)
• Xếp loại: ${sessionReport.report.grade}
• Lời khuyên ôn tập: ${sessionReport.report.aiMentorAdvice}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Target className="w-3.5 h-3.5" />
              <span>GÓC TỰ HỌC & TRẮC NGHIỆM THÔNG MINH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Luyện Trắc Nghiệm & Xem Kết Quả Tự Học
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tùy chọn xem kết quả ngay sau mỗi câu hoặc sau khi làm xong cả lượt. Phù hợp tự học nhẹ nhàng, có gợi ý ngắn để ôn lại và phản ánh trung thực số câu đúng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Soạn Câu Hỏi Mới</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST BANNER */}
      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500/60 text-indigo-200 text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-indigo-400 hover:text-white cursor-pointer px-1">
            ✕
          </button>
        </div>
      )}

      {/* TIMING SELECTION TOGGLE (Yêu cầu chính của ảnh) */}
      {!isQuizActive && !isQuizCompleted && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Chế Độ Xem Kết Quả (Tùy Chọn Theo Cách Tự Học Của Bạn)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFeedbackTiming('immediate')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                feedbackTiming === 'immediate'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  feedbackTiming === 'immediate' ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'
                }`}
              >
                {feedbackTiming === 'immediate' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                  <span>1. Xem kết quả ngay sau mỗi câu</span>
                  {feedbackTiming === 'immediate' && (
                    <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold">
                      Khuyên dùng
                    </span>
                  )}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chọn đáp án là biết ngay Đúng / Sai. Hiển thị đáp án đúng và <strong>gợi ý ngắn để ôn lại</strong> giúp nắm chắc kiến thức trước khi qua câu tiếp theo.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFeedbackTiming('after_quiz')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                feedbackTiming === 'after_quiz'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  feedbackTiming === 'after_quiz' ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'
                }`}
              >
                {feedbackTiming === 'after_quiz' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs sm:text-sm text-slate-100">
                  2. Xem kết quả sau khi hoàn thành cả lượt quiz
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Làm một mạch toàn bộ các câu hỏi. Sau khi bấm nộp bài sẽ xem bảng tổng kết chi tiết từng câu, số câu đúng / tổng số câu và gợi ý ôn tập.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* QUIZ SCOPE / SOURCE SELECTOR */}
      {!isQuizActive && !isQuizCompleted && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Nguồn Đề Thi & Bài Học</h2>
            </div>

            {customQuestions.length > 0 && (
              <span className="text-xs text-emerald-400 font-semibold">
                Đã có {customQuestions.length} câu tự soạn trong kho
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setQuizScope('all')}
              className={`p-3 rounded-xl border text-left transition ${
                quizScope === 'all'
                  ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs block">Ngân hàng đề chuẩn</span>
              <span className="text-[11px] text-slate-500">Toàn bộ KHTN 7</span>
            </button>

            <button
              onClick={() => setQuizScope('custom')}
              className={`p-3 rounded-xl border text-left transition relative ${
                quizScope === 'custom'
                  ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {customQuestions.length > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  {customQuestions.length}
                </span>
              )}
              <span className="text-xs block">Đề tự soạn từ góc học tập</span>
              <span className="text-[11px] text-slate-500">Do bạn tự tạo</span>
            </button>

            <button
              onClick={() => setQuizScope('mistakes')}
              className={`p-3 rounded-xl border text-left transition relative ${
                quizScope === 'mistakes'
                  ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {mistakesCount > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {mistakesCount}
                </span>
              )}
              <span className="text-xs block">Ôn lại những câu sai</span>
              <span className="text-[11px] text-slate-500">Lỗ hổng cần vá</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-3 rounded-xl border border-dashed border-emerald-600/60 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 text-left transition flex flex-col justify-center"
            >
              <span className="text-xs font-bold flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Thêm câu hỏi mới</span>
              </span>
              <span className="text-[11px] text-slate-400">Soạn đề theo bài học</span>
            </button>
          </div>

          {/* Subject & Lesson Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Môn học</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedSourceId('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả môn học (Âm thanh & Ánh sáng)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bài học trong Góc Học Tập</label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Tất cả bài học</option>
                {sources
                  .filter((s) => selectedSubjectId === 'all' || s.subjectId === selectedSubjectId)
                  .map((src) => (
                    <option key={src.id} value={src.id}>
                      {src.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Số câu hỏi mỗi lượt</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 8, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      questionCount === cnt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cnt} câu
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Đang chọn: <strong>{feedbackTiming === 'immediate' ? 'Xem kết quả ngay sau mỗi câu' : 'Xem kết quả sau khi hoàn thành cả lượt'}</strong>
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => startQuiz(quizScope)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Target className="w-4 h-4" />
                <span>Bắt Đầu Làm Quiz</span>
              </button>

              <button
                onClick={handleGenerateAiQuiz}
                disabled={isGeneratingAiQuiz}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isGeneratingAiQuiz ? 'Đang tạo đề...' : 'AI Sinh Đề Mới'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ SCREEN */}
      {isQuizActive && currentQ && (
        <div className="space-y-4">
          {/* TOP BAR STATUS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-bold">
                Câu {currentIndex + 1} / {quizQuestions.length}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {currentQ.sourceTitle || currentQ.subjectTitle || 'Khoa học tự nhiên'}
              </span>
              {currentQ.isCustom && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Tự soạn
                </span>
              )}
            </div>

            {/* Timing mode indicator badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                {feedbackTiming === 'immediate' ? '👁️ Xem kết quả ngay sau mỗi câu' : '📋 Xem kết quả sau khi nộp bài'}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có muốn dừng lượt quiz này không?')) {
                    setIsQuizActive(false);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition"
              >
                Dừng
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* QUESTION CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = currentSelectedOpt === optIdx;
                const isCorrect = currentQ.correctAnswer === optIdx;
                const showImmediateFeedback = feedbackTiming === 'immediate' && isCurrentAnswered;

                let optStyle =
                  'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-slate-700';

                if (showImmediateFeedback) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    optStyle = 'bg-slate-950/60 border-slate-900 text-slate-500';
                  }
                } else if (isSelected) {
                  optStyle = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectAnswer(optIdx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                          showImmediateFeedback && isCorrect
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                            : showImmediateFeedback && isSelected
                            ? 'bg-rose-500 text-white border-rose-400'
                            : isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {showImmediateFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {showImmediateFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* IMMEDIATE FEEDBACK & GỢI Ý NGẮN ĐỂ ÔN LẠI (Yêu cầu chính của ảnh) */}
            {feedbackTiming === 'immediate' && isCurrentAnswered && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
                {/* Status notice */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    currentSelectedOpt === currentQ.correctAnswer
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-700 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentSelectedOpt === currentQ.correctAnswer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {currentSelectedOpt === currentQ.correctAnswer
                        ? 'Chính xác! Bạn đã chọn đúng.'
                        : `Chưa đúng! Đáp án đúng là: ${
                            typeof currentQ.correctAnswer === 'number'
                              ? currentQ.options[currentQ.correctAnswer]
                              : currentQ.correctAnswer
                          }`}
                    </span>
                  </div>
                </div>

                {/* Gợi ý ngắn để ôn lại */}
                {(currentQ.reviewHint || currentQ.hint) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-700/60 text-xs text-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gợi ý ngắn để ôn lại:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5">
                      {currentQ.reviewHint || currentQ.hint}
                    </p>
                  </div>
                )}

                {/* Nút Hỏi Gia Sư AI Về Câu Này */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionChat(currentQ)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 hover:border-purple-500 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>💬 Hỏi Gia Sư AI Về Câu Này</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM NAVIGATION */}
          <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            {/* Quick Question Selector */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-sm">
              {quizQuestions.map((q, qIdx) => {
                const isAns = userAnswers[q.id] !== undefined;
                const isCur = qIdx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center transition shrink-0 ${
                      isCur
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isAns
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-slate-950 text-slate-500 border border-slate-850'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {currentIndex < quizQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(quizQuestions.length - 1, idx + 1))}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Câu kế tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteQuiz}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Hoàn Thành Lượt Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUIZ RESULTS VIEW (Phản ánh đúng số câu đúng / tổng số câu, phù hợp tự học) */}
      {isQuizCompleted && sessionReport && (
        <div className="space-y-5 animate-fadeIn">
          {/* SUMMARY SCORE CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Kết Quả Lượt Quiz</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                    {sessionReport.correctCount} / {quizQuestions.length}
                  </span>
                  <span className="text-sm font-bold text-slate-300">câu đúng ({sessionReport.score}%)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Xếp loại: {sessionReport.report.grade}
                </span>

                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'Đã sao chép' : 'Sao chép kết quả'}</span>
                </button>
              </div>
            </div>

            {/* AI Mentor advice if available */}
            {sessionReport.report.aiMentorAdvice && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">Nhận xét tự học: </span>
                  {sessionReport.report.aiMentorAdvice}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => startQuiz(quizScope)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Làm Lại Lượt Này</span>
              </button>

              {mistakesCount > 0 && (
                <button
                  onClick={() => startQuiz('mistakes')}
                  className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ôn Lại {mistakesCount} Câu Sai</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsQuizCompleted(false);
                  setIsQuizActive(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Quay lại sảnh
              </button>
            </div>
          </div>

          {/* DETAILED QUESTION-BY-QUESTION REVIEW (Kèm gợi ý ngắn để ôn lại từng câu) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <span>Chi Tiết Từng Câu & Gợi Ý Ôn Lại</span>
              </h3>
              <span className="text-xs text-slate-400">
                {sessionReport.correctCount} câu đúng, {quizQuestions.length - sessionReport.correctCount} câu cần xem lại
              </span>
            </div>

            <div className="space-y-3">
              {quizQuestions.map((q, qIdx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                      isCorrect ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/15 border-rose-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span className="font-bold text-slate-200">
                          Câu {qIdx + 1}: {q.question}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {isCorrect ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>

                    <div className="pl-6 space-y-1 text-slate-400">
                      <div>
                        <span>Bạn đã chọn: </span>
                        <span className={isCorrect ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                          {userAns !== undefined && q.options[userAns] ? q.options[userAns] : 'Chưa chọn'}
                        </span>
                      </div>

                      {!isCorrect && typeof q.correctAnswer === 'number' && (
                        <div>
                          <span>Đáp án chuẩn: </span>
                          <span className="text-emerald-300 font-semibold">{q.options[q.correctAnswer]}</span>
                        </div>
                      )}
                    </div>

                    {/* GỢI Ý NGẮN ĐỂ ÔN LẠI (Yêu cầu chính của ảnh) */}
                    {(q.reviewHint || q.hint) && (
                      <div className="ml-6 p-2.5 rounded-lg bg-slate-900 border border-emerald-900/40 text-xs text-slate-300 flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-400">Gợi ý ngắn ôn lại: </span>
                          <span>{q.reviewHint || q.hint}</span>
                        </div>
                      </div>
                    )}

                    {/* Nút Hỏi Gia Sư AI Về Câu Này */}
                    <div className="ml-6 flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenQuestionChat(q)}
                        className="px-3 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                        <span>💬 Hỏi Gia Sư AI Về Câu Này</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM QUESTIONS MANAGER LIST (Trong sảnh khi không làm bài) */}
      {!isQuizActive && !isQuizCompleted && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Kho Câu Hỏi Trắc Nghiệm Tự Soạn Từ Góc Học Tập</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold">
                {customQuestions.length} câu
              </span>
            </div>

            <div className="flex items-center gap-2">
              {customQuestions.length > 0 && (
                <>
                  <button
                    onClick={() => startQuiz('custom')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Làm Đề Này</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa toàn bộ câu hỏi trắc nghiệm tự soạn?')) {
                        clearAllCustomQuizQuestions();
                        refreshCustomQuestions();
                        setFeedbackToast('Đã xóa sạch các câu hỏi tự soạn.');
                        setTimeout(() => setFeedbackToast(null), 3000);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
                    title="Xóa toàn bộ câu hỏi tự soạn"
                  >
                    Xóa tất cả
                  </button>
                </>
              )}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Soạn câu mới</span>
              </button>
            </div>
          </div>

          {customQuestions.length > 0 ? (
            <div className="space-y-2">
              {(showAllCustom ? customQuestions : customQuestions.slice(0, 5)).map((cq) => (
                <div
                  key={cq.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs flex items-start justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5 overflow-hidden">
                    <span className="font-bold text-slate-200 block">{cq.question}</span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {cq.sourceTitle || cq.subjectTitle || 'Bài học tự soạn'}
                      </span>
                      {cq.reviewHint && (
                        <span className="text-emerald-400/90 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Gợi ý: {cq.reviewHint}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      deleteCustomQuizQuestion(cq.id);
                      refreshCustomQuestions();
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0 cursor-pointer"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {customQuestions.length > 5 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllCustom(!showAllCustom)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold transition cursor-pointer"
                  >
                    {showAllCustom ? '▲ Thu gọn danh sách' : `▼ Xem toàn bộ ${customQuestions.length} câu tự soạn`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">
                Chưa có câu hỏi tự soạn nào. Bạn có thể bấm vào nút "Soạn Câu Hỏi Mới" để tự soạn câu hỏi theo từng bài học.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  + Tự Soạn Câu Hỏi Mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      <AddQuizQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        subjects={subjects}
        sources={sources}
        initialSourceId={selectedSourceId}
        initialSubjectId={selectedSubjectId !== 'all' ? selectedSubjectId : undefined}
        onQuestionCreated={() => {
          refreshCustomQuestions();
        }}
      />

      {/* QUIZ QUESTION AI TUTOR CHATBOT MODAL */}
      {chattingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      Gia Sư Khảo Thí & Phân Tích Câu Hỏi AI
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      Local Storage
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    Giải đáp chi tiết cơ chế vật lý, vạch trần bẫy tư duy và cung cấp bài toán tương tự
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setChattingQuestion(null);
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setQuizChatSpeakingId(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Quick Overview Banner */}
            <div className="px-4 sm:px-5 py-3 bg-slate-950 border-b border-slate-800/80 space-y-1.5 shrink-0 text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-semibold">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>Câu hỏi đang thảo luận:</span>
              </div>
              <p className="text-slate-200 font-medium pl-5 line-clamp-2">
                {chattingQuestion.question}
              </p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 min-h-[300px] max-h-[460px] bg-slate-900/60">
              {quizChatMessages.map((msg) => {
                const isBot = msg.sender === 'assistant';
                const isSpeaking = quizChatSpeakingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        isBot
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                                onClick={() => handleSpeakQuizChatMessage(msg.id, msg.text)}
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
                                  setFeedbackToast('Đã sao chép lời giải thích!');
                                  setTimeout(() => setFeedbackToast(null), 2500);
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
                              onClick={() => handleSendQuizChatMessage(prompt)}
                              disabled={isQuizChatLoading}
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

              {isQuizChatLoading && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Gia sư AI đang đối chiếu quy luật vật lý và phân tích bẫy tư duy...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form & Storage Badge */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuizChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={quizChatInput}
                  onChange={(e) => setQuizChatInput(e.target.value)}
                  placeholder="Hỏi thầy vì sao sai, cơ chế hiện tượng hoặc cho câu đố tương tự..."
                  disabled={isQuizChatLoading}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!quizChatInput.trim() || isQuizChatLoading}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-md"
                >
                  <span>Hỏi</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Lưu 100% trong Local Storage ({QUIZ_CHATS_KEY})</span>
                </span>
                <button
                  onClick={() => {
                    if (chattingQuestion) {
                      clearQuizChatMessages(chattingQuestion.id);
                      setQuizChatMessages([]);
                      setFeedbackToast('Đã xóa lịch sử chat của câu hỏi này.');
                      setTimeout(() => setFeedbackToast(null), 2500);
                    }
                  }}
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                >
                  Xóa lịch sử chat câu này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
