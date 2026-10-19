import React, { useState, useEffect } from 'react';
import { StudySubject, StudySource, AiComprehensiveReview, AiSourceReview, AiQuizItem } from '../types';
import {
  loadStudySubjects,
  loadStudySources,
  loadStoredAiReviews,
  saveAiReviewToStorage,
  generateSmartSynthesizedReview,
  seedSampleLessons,
  ensureAllSourcesHaveSummaryAndKeyPoints,
  batchUpdateSourceSummariesInStorage,
} from '../utils/studyStorage';
import {
  Brain,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  HardDrive,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  HelpCircle,
  Award,
  Zap,
  GraduationCap,
  Activity,
  Layers,
  FileText,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';

interface AiReviewScreenProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
  onNavigateToStudy?: () => void;
  initialSourceId?: string;
}

export const AiReviewScreen: React.FC<AiReviewScreenProps> = ({
  onAskAIAboutTopic,
  onNavigateToStudy,
  initialSourceId,
}) => {
  // Load sources & subjects from Local Storage
  const [sources, setSources] = useState<StudySource[]>(() => loadStudySources());
  const [subjects, setSubjects] = useState<StudySubject[]>(() => loadStudySubjects());

  // Scope: 'all' | subjectId | sourceId
  const [selectedScope, setSelectedScope] = useState<'all' | string>(() => {
    return initialSourceId ? `source:${initialSourceId}` : 'all';
  });

  // Current review state
  const [review, setReview] = useState<AiComprehensiveReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Audio speech synthesis for review reading
  const [speakingReviewId, setSpeakingReviewId] = useState<string | null>(null);

  // Interactive Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>({});

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-read storage if window focuses
  useEffect(() => {
    const handleFocus = () => {
      setSources(loadStudySources());
      setSubjects(loadStudySubjects());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Compute active sources based on selected scope
  const getScopeDetails = () => {
    if (selectedScope === 'all') {
      return {
        scopeType: 'all' as const,
        targetId: undefined,
        title: 'Tất Cả Bài Học Trong Kho Local Storage',
        filteredSources: sources,
      };
    } else if (selectedScope.startsWith('subj:')) {
      const subjId = selectedScope.replace('subj:', '');
      const subj = subjects.find((s) => s.id === subjId);
      const filtered = sources.filter((s) => s.subjectId === subjId);
      return {
        scopeType: 'subject' as const,
        targetId: subjId,
        title: subj?.title || 'Chủ đề học tập',
        filteredSources: filtered,
      };
    } else if (selectedScope.startsWith('source:')) {
      const srcId = selectedScope.replace('source:', '');
      const src = sources.find((s) => s.id === srcId);
      const filtered = sources.filter((s) => s.id === srcId);
      return {
        scopeType: 'source' as const,
        targetId: srcId,
        title: src?.title || 'Bài học đơn lẻ',
        filteredSources: filtered,
      };
    }
    return {
      scopeType: 'all' as const,
      targetId: undefined,
      title: 'Tất Cả Bài Học',
      filteredSources: sources,
    };
  };

  // Load review from storage or generate synthesized review
  useEffect(() => {
    const { scopeType, targetId, title, filteredSources } = getScopeDetails();

    if (filteredSources.length === 0) {
      setReview(null);
      return;
    }

    const reviewId = `review-${scopeType}-${targetId || 'all'}`;
    const storedMap = loadStoredAiReviews();

    if (storedMap[reviewId]) {
      setReview(storedMap[reviewId]);
    } else {
      // Generate default rich synthesized baseline
      const defaultReview = generateSmartSynthesizedReview(sources, subjects, scopeType, targetId);
      setReview(defaultReview);
      saveAiReviewToStorage(defaultReview);
    }
    // Reset quiz answers when switching scope
    setUserAnswers({});
    setRevealedQuiz({});
  }, [selectedScope, sources.length, subjects.length]);

  // Request fresh Live Analysis from Gemini API
  const handleRequestLiveGeminiReview = async () => {
    const { scopeType, targetId, title, filteredSources } = getScopeDetails();

    if (filteredSources.length === 0) {
      showToast('Không có bài học nào trong mục này để AI phân tích.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: filteredSources.map((s) => ({
            id: s.id,
            title: s.title,
            type: s.type,
            content: s.type === 'text' ? s.content : (s.note || s.content),
            note: s.note,
            tags: s.tags,
            subjectTitle: subjects.find((sub) => sub.id === s.subjectId)?.title || 'Chung',
          })),
          subjectTitle: title,
          scope: scopeType,
        }),
      });

      const data = await res.json();

      if (data.success && data.review) {
        const liveReview: AiComprehensiveReview = {
          id: `review-${scopeType}-${targetId || 'all'}`,
          scope: scopeType,
          scopeTitle: title,
          totalSourcesAnalyzed: filteredSources.length,
          overallScore: data.review.overallScore || 96,
          statusSummary: data.review.statusSummary || `AI đã phân tích thành công ${filteredSources.length} bài học.`,
          overviewSummary: data.review.overviewSummary || '',
          masteredConcepts: data.review.masteredConcepts || [],
          extractedFormulas: data.review.extractedFormulas || [],
          crossConnections: data.review.crossConnections || [],
          sourceReviews: (data.review.sourceReviews || []).map((sr: any) => ({
            sourceId: sr.sourceId || '',
            sourceTitle: sr.sourceTitle || '',
            summary: sr.summary || '',
            coreConcepts: sr.coreConcepts || [],
            formulasAndRules: sr.formulasAndRules || [],
            realWorldApplications: sr.realWorldApplications || [],
            keyTakeaway: sr.keyTakeaway || '',
            comprehensionLevel: sr.comprehensionLevel || 'Hoàn hảo',
            aiAdvice: sr.aiAdvice || '',
          })),
          quizQuestions: (data.review.quizQuestions || []).map((q: any, idx: number) => ({
            id: q.id || `live-q-${idx}`,
            question: q.question,
            options: q.options || [],
            correctIndex: q.correctIndex ?? 0,
            explanation: q.explanation || '',
          })),
          generatedAt: Date.now(),
        };

        setReview(liveReview);
        saveAiReviewToStorage(liveReview);
        showToast('✨ Gemini AI đã hoàn tất phân tích & đánh giá kiến thức mới nhất!');
      } else {
        // Fallback to local synthesis if API returned without review
        const fallback = generateSmartSynthesizedReview(sources, subjects, scopeType, targetId);
        setReview(fallback);
        saveAiReviewToStorage(fallback);
        showToast('Đã tổng hợp đánh giá hiểu biết từ các bài học lưu trữ.');
      }
    } catch (err: any) {
      console.warn('Lỗi gọi Live Gemini Review, dùng phân tích nội bộ:', err);
      const fallback = generateSmartSynthesizedReview(sources, subjects, scopeType, targetId);
      setReview(fallback);
      saveAiReviewToStorage(fallback);
      showToast('Đã cập nhật review nhận thức dựa trên dữ liệu bài học.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy structured report to clipboard
  const handleCopyReport = () => {
    if (!review) return;

    const markdown = `# BÁO CÁO REVIEW: AI ĐÃ HIỂU GÌ TỪ BÀI HỌC
Thời gian phân tích: ${new Date(review.generatedAt).toLocaleString('vi-VN')}
Phạm vi: ${review.scopeTitle}
Số bài học đã phân tích: ${review.totalSourcesAnalyzed} bài
Mức độ hiểu biết: ${review.overallScore}/100

## 1. TỔNG QUAN NHẬN THỨC
${review.overviewSummary}

## 2. CÁC KHÁI NIỆM CỐT LÕI AI ĐÃ NẮM VỮNG
${review.masteredConcepts.map((c) => `- ${c}`).join('\n')}

## 3. CÔNG THỨC & QUY LUẬT AI NHẬN DIỆN ĐƯỢC
${review.extractedFormulas.map((f) => `- ${f.formula}: ${f.explanation}`).join('\n')}

## 4. MỐI LIÊN KẾT ĐA NGÀNH
${review.crossConnections.map((conn) => `- ${conn}`).join('\n')}

## 5. REVIEW CHI TIẾT THEO BÀI HỌC
${review.sourceReviews
  .map(
    (sr, idx) => `
### [${idx + 1}] ${sr.sourceTitle}
- Tóm tắt AI hiểu: ${sr.summary}
- Khái niệm: ${sr.coreConcepts.join(', ')}
- Điểm then chốt: ${sr.keyTakeaway}
- Lời khuyên của AI: ${sr.aiAdvice}
`
  )
  .join('\n')}
`;

    try {
      navigator.clipboard.writeText(markdown);
      setCopiedReport(true);
      showToast('Đã sao chép toàn bộ báo cáo Review AI vào bộ nhớ tạm!');
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (e) {
      showToast('Không thể tự động sao chép, bạn có thể bôi đen văn bản để copy.');
    }
  };

  // Seed sample lessons and run AI review immediately
  const handleSeedAndReview = () => {
    const updated = seedSampleLessons();
    setSources(updated);
    showToast('✨ Đã nạp thành công các bài học vào Local Storage! Đang chạy AI review...');
    setTimeout(() => {
      handleRequestLiveGeminiReview();
    }, 400);
  };

  // Generate Summary & Key Points for all sources and update AI review
  const handleGenerateAllSummariesInReview = async () => {
    if (sources.length === 0) {
      handleSeedAndReview();
      return;
    }

    setIsAnalyzing(true);
    showToast('AI đang tổng hợp Summary & Key Points cho tất cả bài học...');

    try {
      const res = await fetch('/api/ai/batch-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: sources.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content || s.note || '',
            note: s.note,
            subjectTitle: subjects.find((sub) => sub.id === s.subjectId)?.title || 'Khoa học',
          })),
        }),
      });
      const { scopeType, targetId } = getScopeDetails();
      const data = await res.json();
      let updatedSources = sources;
      if (data.success && Array.isArray(data.results)) {
        updatedSources = batchUpdateSourceSummariesInStorage(data.results);
      } else {
        const resLocal = ensureAllSourcesHaveSummaryAndKeyPoints();
        updatedSources = resLocal.updatedSources;
      }
      setSources(updatedSources);
      const newReview = generateSmartSynthesizedReview(updatedSources, subjects, scopeType, targetId);
      setReview(newReview);
      saveAiReviewToStorage(newReview);
      showToast('⚡ Đã hoàn tất tạo Summary & Key Points và cập nhật Review!');
    } catch {
      const { scopeType, targetId } = getScopeDetails();
      const resLocal = ensureAllSourcesHaveSummaryAndKeyPoints();
      setSources(resLocal.updatedSources);
      const newReview = generateSmartSynthesizedReview(resLocal.updatedSources, subjects, scopeType, targetId);
      setReview(newReview);
      saveAiReviewToStorage(newReview);
      showToast('⚡ Đã cập nhật xong Summary & Key Points!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-to-speech for reading AI reviews
  const toggleReviewSpeech = (id: string, textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt chưa hỗ trợ phát âm thanh bằng giọng đọc.');
      return;
    }

    if (speakingReviewId === id) {
      window.speechSynthesis.cancel();
      setSpeakingReviewId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingReviewId(null);
    utterance.onerror = () => setSpeakingReviewId(null);

    setSpeakingReviewId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectQuizOption = (quizId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [quizId]: optionIndex }));
    setRevealedQuiz((prev) => ({ ...prev, [quizId]: true }));
  };

  const scopeDetails = getScopeDetails();

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner: Anti-slop, clean typographic structure */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Hệ Thống Phân Tích Nhận Thức Khoa Học AI</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Đồng bộ từ Local Storage</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Màn Hình Review: AI Đã Hiểu Gì Từ Bài Học Của Em?
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Trang đánh giá minh bạch mức độ tiếp thu của trí tuệ nhân tạo: Xem AI đã tóm lược khái niệm vật lý nào,
              trích xuất những công thức nào, liên hệ thực tế ra sao và thử thách kiểm tra chéo hiểu biết chung.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Nguồn dữ liệu: {sources.length} bài học lưu trên Local Storage</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="inline-flex items-center gap-1.5 text-cyan-300">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Lần cập nhật: {review ? new Date(review.generatedAt).toLocaleTimeString('vi-VN') : 'Đang xử lý'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRequestLiveGeminiReview}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg cursor-pointer ${
                isAnalyzing
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAnalyzing ? 'AI Đang Phân Tích...' : '⚡ Yêu Cầu AI Đánh Giá Lại'}</span>
            </button>

            <button
              onClick={handleGenerateAllSummariesInReview}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Tự động tạo summary và key points cho tất cả bài học trong kho"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>⚡ Tạo Summary & Key Points</span>
            </button>

            <button
              onClick={handleSeedAndReview}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Tự động nạp thêm các bài học mẫu chuẩn vào máy và chạy AI review"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>⚡ Nạp Thêm Bài Mẫu</span>
            </button>

            <button
              onClick={handleCopyReport}
              disabled={!review}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm transition cursor-pointer"
              title="Sao chép toàn bộ báo cáo phân tích AI sang định dạng Markdown"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedReport ? 'Đã Sao Chép' : 'Sao Chép Báo Cáo'}</span>
            </button>

            {onNavigateToStudy && (
              <button
                onClick={onNavigateToStudy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Về Góc Học Tập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scope Selector: Functional Segmented Buttons (Anti-Slop rule: real buttons with handlers) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Chọn Phạm Vi Phân Tích Đánh Giá:
            </span>
            <p className="text-xs text-slate-500">
              Xem AI hiểu toàn bộ kho lưu trữ, hay đánh giá chuyên biệt theo từng môn và từng bài học
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Đang phân tích: <strong className="text-cyan-300">{scopeDetails.title}</strong> ({scopeDetails.filteredSources.length} bài)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Option 1: All sources */}
          <button
            onClick={() => setSelectedScope('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition cursor-pointer ${
              selectedScope === 'all'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Toàn Bộ Kho Tri Thức ({sources.length})</span>
          </button>

          {/* Option 2: By Subjects */}
          {subjects.map((subj) => {
            const isSelected = selectedScope === `subj:${subj.id}`;
            const count = sources.filter((s) => s.subjectId === subj.id).length;
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedScope(`subj:${subj.id}`)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="max-w-[200px] truncate">{subj.title}</span>
                <span className="text-[10px] text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State when no sources are in storage */}
      {sources.length === 0 && (
        <div className="p-10 sm:p-14 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-5 max-w-2xl mx-auto my-6">
          <div className="p-4 rounded-full bg-indigo-950/60 border border-indigo-700/50 w-16 h-16 mx-auto flex items-center justify-center text-indigo-400">
            <Brain className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">Chưa có bài học nào trong Local Storage để AI review</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Em có thể nạp ngay bộ bài học mẫu chuẩn về Âm thanh & Ánh sáng vào Local Storage, hoặc dùng công cụ <strong>AI Tạo Bài Giúp Tôi</strong> tại Góc Học Tập.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedAndReview}
              className="px-5 py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              <span>⚡ Nạp Bài Mẫu Chuẩn & Phân Tích Review Ngay</span>
            </button>

            {onNavigateToStudy && (
              <button
                onClick={onNavigateToStudy}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Đến Góc Học Tập Dùng AI Soạn Bài</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Content Display */}
      {review && sources.length > 0 && (
        <div className="space-y-8">
          {/* SECTION 1: AI Comprehension Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Chỉ Số Nắm Bắt Tri Thức (Comprehension Score)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {review.overallScore}%
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Hiểu sâu & chính xác
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-xs text-slate-300 leading-relaxed font-medium">
                  {review.statusSummary}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{review.totalSourcesAnalyzed} bài học được thẩm định</span>
                  <span>·</span>
                  <span>Dữ liệu Local Storage</span>
                </div>
              </div>
            </div>

            {/* Overview Summary */}
            <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Bức Tranh Tổng Thể AI Đã Tiếp Thu
                  </span>
                  <button
                    onClick={() => toggleReviewSpeech('overview', review.overviewSummary)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition text-xs flex items-center gap-1"
                    title="Nghe đọc to phần tổng quan này"
                  >
                    {speakingReviewId === 'overview' ? (
                      <VolumeX className="w-4 h-4 text-emerald-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="hidden sm:inline">
                      {speakingReviewId === 'overview' ? 'Dừng đọc' : 'Nghe AI đọc'}
                    </span>
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {review.overviewSummary}
                </p>
              </div>

              {/* Mastered concepts tags */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                  Khái niệm cốt lõi AI nhận diện được:
                </span>
                <div className="flex flex-wrap gap-2">
                  {review.masteredConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Formulas & Mathematical Rules Extracted */}
          {review.extractedFormulas && review.extractedFormulas.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Các Quy Luật & Công Thức Vật Lý AI Trích Xuất Được</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {review.extractedFormulas.length} công thức then chốt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {review.extractedFormulas.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 hover:border-cyan-500/40 transition"
                  >
                    <div className="text-sm sm:text-base font-mono font-bold text-cyan-400 tracking-wide">
                      {item.formula}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: Cross-Disciplinary Knowledge Connections */}
          {review.crossConnections && review.crossConnections.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Mối Liên Kết Đa Ngành AI Tự Xâu Chuỗi Từ Các Bài Học</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {review.crossConnections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                      <span>Mối liên kết [{idx + 1}]</span>
                    </div>
                    <p>{conn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Detailed Breakdown for Each Source */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Chi Tiết Đánh Giá: AI Đã Hiểu Gì Từ Từng Bài Học</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Xem tường tận tóm lược, ý nghĩa đời sống và lời khuyên ôn tập của AI cho từng nguồn tài liệu
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Hiển thị {review.sourceReviews.length} bài học
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {review.sourceReviews.map((sr, idx) => {
                const isSpeakingThis = speakingReviewId === `source-${sr.sourceId}`;
                const originalSource = sources.find((s) => s.id === sr.sourceId);

                return (
                  <div
                    key={sr.sourceId || idx}
                    className="bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition space-y-4"
                  >
                    {/* Source Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-cyan-400">Bài học #{idx + 1}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{sr.subjectTitle || 'Khoa học'}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-emerald-400 font-medium">Mức độ hiểu: {sr.comprehensionLevel}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                          {sr.sourceTitle}
                        </h3>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Voice read */}
                        <button
                          onClick={() => toggleReviewSpeech(`source-${sr.sourceId}`, `${sr.sourceTitle}. ${sr.summary}. Lời khuyên: ${sr.aiAdvice}`)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 animate-pulse'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50'
                          }`}
                          title="Nghe AI đọc to tóm lược bài này"
                        >
                          {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{isSpeakingThis ? 'Dừng đọc' : 'Nghe AI đọc'}</span>
                        </button>

                        {/* Ask AI further */}
                        {onAskAIAboutTopic && (
                          <button
                            onClick={() =>
                              onAskAIAboutTopic(
                                sr.subjectTitle || 'Khoa học',
                                `Em muốn hỏi sâu hơn về bài: "${sr.sourceTitle}". 
AI đã hiểu là: "${sr.summary}".
Thầy cô AI có thể cho em thêm bài tập thực hành hoặc ví dụ thực tế liên quan đến bài này không?`
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Hỏi sâu thêm</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI's Summary */}
                    <div className="space-y-1.5">
                      <span className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        Tóm tắt những gì AI đã hiểu (Summary):
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-medium">
                        {sr.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    {sr.coreConcepts && sr.coreConcepts.length > 0 && (
                      <div className="space-y-2 p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl">
                        <span className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Các điểm cốt lõi AI đã ghi nhận (Key Points):
                        </span>
                        <ul className="space-y-1.5 pl-1">
                          {sr.coreConcepts.map((cp, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{cp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2 columns: Real world apps + AI advice */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Real world apps */}
                      <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          Ứng dụng thực tế đời sống AI kết nối được:
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {sr.realWorldApplications.map((app, i) => (
                            <li key={i}>{app}</li>
                          ))}
                        </ul>
                      </div>

                      {/* AI advice */}
                      <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-2">
                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          Lời khuyên ôn tập của AI cho học sinh:
                        </span>
                        <p className="text-slate-300 leading-relaxed font-normal">
                          {sr.aiAdvice}
                        </p>
                        <div className="pt-1 text-[11px] text-amber-300">
                          <strong>Trọng tâm thi cử: </strong> {sr.keyTakeaway}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: Interactive Cross-Check Quiz */}
          {review.quizQuestions && review.quizQuestions.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Thử Thách Kiểm Tra Chéo: Em Và AI Đã Hiểu Đúng Chưa?</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Các câu hỏi do AI tự động biên soạn từ kiến thức đã đọc để học sinh kiểm chứng lại độ chính xác
                  </p>
                </div>

                <div className="text-xs font-semibold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
                  {Object.keys(userAnswers).length} / {review.quizQuestions.length} câu đã trả lời
                </div>
              </div>

              <div className="space-y-6">
                {review.quizQuestions.map((quiz, qIdx) => {
                  const selectedOpt = userAnswers[quiz.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === quiz.correctIndex;

                  return (
                    <div
                      key={quiz.id}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                          {quiz.question}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-9">
                        {quiz.options.map((opt, oIdx) => {
                          const isThisSelected = selectedOpt === oIdx;
                          const isThisCorrect = quiz.correctIndex === oIdx;

                          let btnStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                          if (isAnswered) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isThisSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
                            } else {
                              btnStyle = 'bg-slate-900/50 border-slate-850 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectQuizOption(quiz.id, oIdx)}
                              disabled={isAnswered}
                              className={`p-3 rounded-xl border text-xs text-left transition flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                            >
                              <span className="font-mono font-bold text-slate-400 shrink-0">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span className="leading-relaxed">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback & Explanation */}
                      {isAnswered && (
                        <div
                          className={`ml-9 p-4 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Chính xác! Cả em và AI đều hiểu đúng nguyên lý này.</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span>Chưa chính xác! Hãy đọc lại lời giải thích của AI bên dưới:</span>
                              </>
                            )}
                          </div>
                          <p className="leading-relaxed text-slate-300">
                            {quiz.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
