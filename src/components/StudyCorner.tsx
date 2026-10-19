import React, { useState, useEffect, useRef } from 'react';
import { StudySubject, StudySource, StudySourceType } from '../types';
import {
  loadStudySubjects,
  saveStudySubjects,
  loadStudySources,
  saveStudySources,
  getStorageDiagnostics,
  runStorageLiveTest,
  StorageDiagnostics,
  SOURCES_KEY,
  ALIAS_SOURCES_KEY,
  seedSampleLessons,
  updateSourceSummaryInStorage,
  batchUpdateSourceSummariesInStorage,
  ensureAllSourcesHaveSummaryAndKeyPoints,
  createSmartSummaryAndKeyPoints,
  loadSubjectSummaries,
  saveSubjectSummaryToStorage,
  syncFlashcardsFromAllSources,
  SUBJECT_SNAPSHOTS_KEY,
  LESSON_CHATS_STORAGE_KEY,
  FLASHCARD_VERSIONS_KEY,
  FLASHCARD_CHATS_KEY,
  QUIZ_CHATS_KEY,
  AI_MENTOR_SESSIONS_KEY,
} from '../utils/studyStorage';
import { FlashcardModal } from './FlashcardModal';
import { StudyPackModal } from './StudyPackModal';
import { AddQuizQuestionModal } from './AddQuizQuestionModal';
import { SubjectSnapshotModal } from './SubjectSnapshotModal';
import {
  BookOpen,
  Plus,
  PlusCircle,
  FileText,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  Trash2,
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  UploadCloud,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Tag,
  ArrowRight,
  Maximize2,
  Edit3,
  Check,
  AlertTriangle,
  Database,
  HardDrive,
  RefreshCw,
  Copy,
  Brain,
  Zap,
  ListChecks,
  Layers,
  Package,
  Target,
} from 'lucide-react';

interface StudyCornerProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
  onOpenAiReview?: (sourceId?: string) => void;
  onOpenQuiz?: (sourceId?: string, subjectId?: string) => void;
}

export const StudyCorner: React.FC<StudyCornerProps> = ({ onAskAIAboutTopic, onOpenAiReview, onOpenQuiz }) => {
  // Subjects state
  const [subjects, setSubjects] = useState<StudySubject[]>(() => loadStudySubjects());
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    const list = loadStudySubjects();
    return list.length > 0 ? list[0].id : 'subj-sound';
  });

  // Sources state
  const [sources, setSources] = useState<StudySource[]>(() => loadStudySources());

  // LocalStorage automatic persistence effect for sources & subjects
  useEffect(() => {
    saveStudySources(sources);
    setStorageDiag(getStorageDiagnostics());
  }, [sources]);

  useEffect(() => {
    saveStudySubjects(subjects);
    setStorageDiag(getStorageDiagnostics());
  }, [subjects]);

  // Toast notification for user feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State for Live Local Storage Inspector Modal & Real-time Diagnostics
  const [showStorageInspector, setShowStorageInspector] = useState<boolean>(false);
  const [storageDiag, setStorageDiag] = useState<StorageDiagnostics>(() => getStorageDiagnostics());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [isTestingStorage, setIsTestingStorage] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const handleRunStorageTest = () => {
    setIsTestingStorage(true);
    setTimeout(() => {
      const res = runStorageLiveTest();
      setTestResult(res);
      setStorageDiag(getStorageDiagnostics());
      setIsTestingStorage(false);
      if (res.success) {
        showToast('Đã kiểm tra ghi & đọc Local Storage thành công 100%!', 'success');
      } else {
        showToast(res.message, 'warning');
      }
    }, 400);
  };

  const handleCopyStorageJson = () => {
    try {
      navigator.clipboard.writeText(storageDiag.rawJsonPreview);
      setCopiedJson(true);
      showToast('Đã sao chép chuỗi JSON từ Local Storage vào bộ nhớ tạm!', 'success');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (e) {
      showToast('Không thể tự động sao chép, vui lòng chọn và copy thủ công nhé!', 'info');
    }
  };

  const handleReloadFromLocalStorage = () => {
    const freshSources = loadStudySources();
    const freshSubjects = loadStudySubjects();
    setSources(freshSources);
    setSubjects(freshSubjects);
    setStorageDiag(getStorageDiagnostics());
    showToast(`Đã đồng bộ lại ${freshSources.length} bài học từ Local Storage!`, 'success');
  };

  // State for Confirmation Dialog before deletion (100% iframe safe, replaces window.confirm)
  const [sourceToDelete, setSourceToDelete] = useState<StudySource | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<StudySubject | null>(null);

  // State for Viewing source details (Read - Xem lại nguồn đã lưu)
  const [viewingSource, setViewingSource] = useState<StudySource | null>(null);

  // State for Editing source (Update - Sửa tiêu đề hoặc nội dung nguồn)
  const [editingSource, setEditingSource] = useState<StudySource | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editType, setEditType] = useState<StudySourceType>('text');

  const openEditModal = (source: StudySource) => {
    setEditingSource(source);
    setEditTitle(source.title);
    setEditContent(source.content);
    setEditNote(source.note || '');
    setEditType(source.type);
  };

  const handleUpdateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;

    if (!editTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề ngắn cho nguồn học liệu nhé!', 'info');
      return;
    }

    if (!editContent.trim()) {
      showToast('Vui lòng nhập nội dung hoặc liên kết cho nguồn học liệu nhé!', 'info');
      return;
    }

    let validContent = editContent.trim();
    let validUrl = editingSource.url;
    let validImageUrl = editingSource.imageUrl;

    if (editType === 'url') {
      if (!/^https?:\/\//i.test(validContent)) {
        validContent = 'https://' + validContent;
      }
      validUrl = validContent;
    } else if (editType === 'image') {
      validImageUrl = validContent;
    }

    const updated = sources.map((s) => {
      if (s.id === editingSource.id) {
        return {
          ...s,
          title: editTitle.trim(),
          content: validContent,
          type: editType,
          note: editNote.trim() || undefined,
          url: validUrl,
          imageUrl: validImageUrl,
        };
      }
      return s;
    });

    setSources(updated);
    saveStudySources(updated);
    setEditingSource(null);
    if (viewingSource && viewingSource.id === editingSource.id) {
      setViewingSource(updated.find((s) => s.id === editingSource.id) || null);
    }
    showToast('Đã lưu chỉnh sửa nguồn học liệu thành công!', 'success');
  };

  // Filter & Search
  const [filterType, setFilterType] = useState<StudySourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add source form toggle & active mode (Text-first by default!)
  const [isAddingSource, setIsAddingSource] = useState<boolean>(false);
  const [newSourceType, setNewSourceType] = useState<StudySourceType>('text');

  // Form fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // New subject modal
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState<string>('');
  const [newSubjectGrade, setNewSubjectGrade] = useState<string>('');
  const [newSubjectDesc, setNewSubjectDesc] = useState<string>('');

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string; note?: string } | null>(null);

  // Text to speech state
  const [speakingSourceId, setSpeakingSourceId] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Generator Modal state ("Tạo giúp tôi bằng AI")
  const [isGeneratingLessonModal, setIsGeneratingLessonModal] = useState<boolean>(false);
  const [aiTopicInput, setAiTopicInput] = useState<string>('');
  const [aiSelectedSubjectId, setAiSelectedSubjectId] = useState<string>(activeSubjectId);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isAiWritingForm, setIsAiWritingForm] = useState<boolean>(false);

  // Summary & Key Points state
  const [summarizingSourceId, setSummarizingSourceId] = useState<string | null>(null);
  const [isSubjectSummaryModal, setIsSubjectSummaryModal] = useState<boolean>(false);
  const [subjectSummary, setSubjectSummary] = useState<{ summary: string; keyPoints: string[]; generatedAt?: number } | null>(null);
  const [isGeneratingSubjectSummary, setIsGeneratingSubjectSummary] = useState<boolean>(false);

  // Batch Summary & Key Points state ("Làm cho tôi tất cả những cái này")
  const [isBatchGeneratingSummary, setIsBatchGeneratingSummary] = useState<boolean>(false);
  const [batchSummaryProgress, setBatchSummaryProgress] = useState<{ current: number; total: number; currentTitle?: string }>({ current: 0, total: 0 });
  const [isAllSummariesModalOpen, setIsAllSummariesModalOpen] = useState<boolean>(false);
  const [allSummariesFilter, setAllSummariesFilter] = useState<string>('all');
  const [copiedAllCheatSheet, setCopiedAllCheatSheet] = useState<boolean>(false);

  // Flashcards state
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState<boolean>(false);
  const [flashcardSubjectId, setFlashcardSubjectId] = useState<string>('all');
  const [flashcardSourceId, setFlashcardSourceId] = useState<string | undefined>(undefined);

  // Buổi 3: Study Pack 5-in-1 state
  const [isStudyPackModalOpen, setIsStudyPackModalOpen] = useState<boolean>(false);
  const [studyPackSourceId, setStudyPackSourceId] = useState<string | undefined>(undefined);
  const [studyPackSubjectId, setStudyPackSubjectId] = useState<string>('all');

  // Custom Quiz question modal state
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState<boolean>(false);
  const [addQuizSourceId, setAddQuizSourceId] = useState<string | undefined>(undefined);
  const [addQuizSubjectId, setAddQuizSubjectId] = useState<string | undefined>(undefined);

  // Snapshot modal state: Lưu & Mở Snapshot môn học
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  // Filtered sources
  const currentSubjectSources = sources.filter((s) => s.subjectId === activeSubjectId);
  const displayedSources = currentSubjectSources.filter((s) => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.note && s.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesType && matchesSearch;
  });

  // Handle Text-to-Speech (Loa đọc bài học)
  const toggleSpeech = (source: StudySource) => {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt chưa hỗ trợ tính năng đọc to bài học bằng giọng nói.', 'info');
      return;
    }

    if (speakingSourceId === source.id) {
      window.speechSynthesis.cancel();
      setSpeakingSourceId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare text to read
    const textToRead = `${source.title}. ${source.type === 'text' ? source.content : ''} ${
      source.note ? 'Ghi chú bài học: ' + source.note : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Friendly, readable pace for students

    utterance.onend = () => {
      setSpeakingSourceId(null);
    };
    utterance.onerror = () => {
      setSpeakingSourceId(null);
    };

    setSpeakingSourceId(source.id);
    window.speechSynthesis.speak(utterance);
  };

  // Image file upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 6MB)
    if (file.size > 6 * 1024 * 1024) {
      showToast('Hình ảnh quá lớn (> 6MB). Vui lòng chọn ảnh dung lượng nhẹ hơn em nhé!', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          // Nén và giới hạn kích thước tối đa 800px để lưu an toàn vào LocalStorage mà không sợ đầy bộ nhớ
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
            setImagePreview(compressedBase64);
            setFormImageUrl(compressedBase64);
          } else {
            setImagePreview(reader.result as string);
            setFormImageUrl(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset form
  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormNote('');
    setFormUrl('');
    setFormImageUrl('');
    setFormTags('');
    setImagePreview(null);
    setIsAddingSource(false);
  };

  // Save source
  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tên hoặc tiêu đề bài học/tài liệu em nhé!', 'info');
      return;
    }

    let finalContent = '';
    let finalImageUrl: string | undefined = undefined;
    let finalUrl: string | undefined = undefined;

    if (newSourceType === 'text') {
      if (!formContent.trim()) {
        showToast('Vui lòng nhập nội dung bài ghi chép nhé!', 'info');
        return;
      }
      finalContent = formContent.trim();
    } else if (newSourceType === 'image') {
      const img = formImageUrl.trim() || imagePreview;
      if (!img) {
        showToast('Vui lòng chọn ảnh từ máy hoặc dán link ảnh nhé!', 'info');
        return;
      }
      finalContent = img;
      finalImageUrl = img;
    } else if (newSourceType === 'url') {
      if (!formUrl.trim()) {
        showToast('Vui lòng nhập đường link bài học nhé!', 'info');
        return;
      }
      let validUrl = formUrl.trim();
      if (!/^https?:\/\//i.test(validUrl)) {
        validUrl = 'https://' + validUrl;
      }
      finalContent = validUrl;
      finalUrl = validUrl;
    }

    const tagList = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newSource: StudySource = {
      id: `source-${Date.now()}`,
      subjectId: activeSubjectId,
      type: newSourceType,
      title: formTitle.trim(),
      content: finalContent,
      note: formNote.trim() || undefined,
      url: finalUrl,
      imageUrl: finalImageUrl,
      createdAt: Date.now(),
      tags: tagList.length > 0 ? tagList : undefined,
    };

    const updated = [newSource, ...sources];
    setSources(updated);
    saveStudySources(updated);
    resetForm();
    showToast('Đã thêm nguồn học liệu mới vào danh sách!', 'success');
  };

  // AI Automatic Lesson Generator ("Tạo giúp tôi bằng AI")
  const handleGenerateLessonWithAi = async (customTopic?: string, targetSubjId?: string) => {
    const topicToUse = (customTopic || aiTopicInput).trim();
    if (!topicToUse) {
      showToast('Vui lòng nhập hoặc chọn chủ đề bạn muốn AI tạo nhé!', 'info');
      return;
    }
    const subjIdToUse = targetSubjId || aiSelectedSubjectId || activeSubjectId;
    const currentSubj = subjects.find((s) => s.id === subjIdToUse) || activeSubject;

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          subjectTitle: currentSubj.title,
          gradeLevel: currentSubj.gradeLevel || 'Lớp 7 - Lớp 10',
        }),
      });

      const data = await res.json();
      if (data.success && data.lesson) {
        const newSrc: StudySource = {
          id: `source-ai-${Date.now()}`,
          subjectId: subjIdToUse,
          type: 'text',
          title: data.lesson.title || topicToUse,
          content: data.lesson.content || '',
          note: data.lesson.note || 'Bài học do AI hỗ trợ soạn thảo chuẩn theo sách giáo khoa.',
          tags: Array.isArray(data.lesson.tags) ? data.lesson.tags : ['AI Soạn Thảo', 'Kiến Thức Mới'],
          createdAt: Date.now(),
        };

        const updated = [newSrc, ...sources];
        setSources(updated);
        saveStudySources(updated);
        setActiveSubjectId(subjIdToUse);
        setIsGeneratingLessonModal(false);
        setAiTopicInput('');
        setViewingSource(newSrc);
        showToast(`✨ Đã tạo & lưu bài học "${newSrc.title}" vào Local Storage thành công!`, 'success');
      } else {
        throw new Error(data.error || 'Không nhận được dữ liệu bài học từ AI');
      }
    } catch (err: any) {
      console.warn('Lỗi gọi AI generate lesson, sử dụng bộ mẫu nội bộ:', err);
      // Fallback: create high quality structured local sample
      const fallbackSrc: StudySource = {
        id: `source-local-${Date.now()}`,
        subjectId: subjIdToUse,
        type: 'text',
        title: `Bài học: ${topicToUse}`,
        content: `1. Bản chất & Định nghĩa khoa học:\nChủ đề: ${topicToUse}.\nHiện tượng khoa học này là nội dung trọng tâm về tương tác sóng, quang học và chuyển hóa năng lượng trong tự nhiên.\n\n2. Kiến thức & Quy luật cốt lõi:\n- Cần ghi nhớ bản chất vật lý, sự bảo toàn và cách các sóng phản xạ hoặc khúc xạ qua môi trường.\n- Chú ý quan sát và đo đạc các thông số (tần số Hz, mức âm lượng dB, bước sóng nm, độ rọi Lux).\n\n3. Ứng dụng thực tế đời sống:\n- Áp dụng vào việc bảo vệ sức khỏe thính giác, thị giác và tận dụng các phát minh công nghệ hiện đại.`,
        note: 'Bài học đã lưu trữ trong Local Storage.',
        tags: ['Khoa học', 'Bài học mới', 'Local Storage'],
        createdAt: Date.now(),
      };
      const updated = [fallbackSrc, ...sources];
      setSources(updated);
      saveStudySources(updated);
      setActiveSubjectId(subjIdToUse);
      setIsGeneratingLessonModal(false);
      setViewingSource(fallbackSrc);
      showToast(`Đã tạo và lưu bài học "${fallbackSrc.title}" vào Local Storage!`, 'success');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Auto Write directly into the Add Form
  const handleAiAutoWriteForForm = async () => {
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tên tài liệu / tiêu đề trước để AI soạn nội dung nhé!', 'info');
      return;
    }
    setIsAiWritingForm(true);
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formTitle.trim(),
          subjectTitle: activeSubject.title,
          gradeLevel: activeSubject.gradeLevel,
        }),
      });
      const data = await res.json();
      if (data.success && data.lesson) {
        if (data.lesson.content) setFormContent(data.lesson.content);
        if (data.lesson.note && !formNote.trim()) setFormNote(data.lesson.note);
        if (Array.isArray(data.lesson.tags) && !formTags.trim()) setFormTags(data.lesson.tags.join(', '));
        showToast('✨ AI đã soạn thảo nội dung bài học xong, em xem và bấm Lưu nhé!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      showToast('Không thể kết nối AI, vui lòng gõ nội dung bài học nhé!', 'info');
    } finally {
      setIsAiWritingForm(false);
    }
  };

  // Seed sample lessons quickly into Local Storage
  const handleSeedExtraSampleLessons = () => {
    const updated = seedSampleLessons();
    setSources(updated);
    setStorageDiag(getStorageDiagnostics());
    showToast(`✨ Đã nạp thành công các bài học mẫu chuẩn vào Local Storage!`, 'success');
  };

  // Generate Summary & Key Points for a specific source
  const handleGenerateSummaryForSource = async (source: StudySource) => {
    setSummarizingSourceId(source.id);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: source.title,
          content: source.type === 'text' ? source.content : (source.note || source.title),
          note: source.note,
          subjectTitle: activeSubject.title,
          gradeLevel: activeSubject.gradeLevel || 'Lớp 7 trở lên',
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        const updated = updateSourceSummaryInStorage(source.id, data.summary, data.keyPoints || []);
        setSources(updated);
        if (viewingSource && viewingSource.id === source.id) {
          setViewingSource({
            ...viewingSource,
            summary: data.summary,
            keyPoints: data.keyPoints || [],
            summaryGeneratedAt: Date.now(),
          });
        }
        showToast('✨ Đã tạo và lưu Summary & Key Points vào Local Storage!', 'success');
      } else {
        throw new Error(data.error || 'Lỗi khi tạo tóm tắt');
      }
    } catch (e: any) {
      console.warn('Lỗi gọi API tóm tắt:', e);
      showToast('Không thể kết nối AI, vui lòng thử lại sau!', 'info');
    } finally {
      setSummarizingSourceId(null);
    }
  };

  // BATCH GENERATOR: "Làm cho tôi tất cả những cái này" - Tạo Summary & Key Points cho TOÀN BỘ bài học
  const handleBatchGenerateSummaries = async () => {
    if (sources.length === 0) {
      showToast('Chưa có bài học nào trong kho để tạo tóm tắt!', 'info');
      return;
    }

    setIsBatchGeneratingSummary(true);
    setBatchSummaryProgress({ current: 0, total: sources.length, currentTitle: 'Đang kết nối AI tổng hợp...' });

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
            subjectTitle: subjects.find((sub) => sub.id === s.subjectId)?.title || activeSubject.title,
          })),
          subjectTitle: activeSubject.title,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const updated = batchUpdateSourceSummariesInStorage(data.results);
        setSources(updated);
        setStorageDiag(getStorageDiagnostics());
        showToast(`⚡ Đã tạo thành công Summary & Key Points cho tất cả ${data.results.length} bài học và lưu vào Local Storage!`, 'success');
      } else {
        const { updatedSources } = ensureAllSourcesHaveSummaryAndKeyPoints();
        setSources(updatedSources);
        setStorageDiag(getStorageDiagnostics());
        showToast(`⚡ Đã hoàn thiện Summary & Key Points cho toàn bộ ${updatedSources.length} bài học!`, 'success');
      }
    } catch (err) {
      console.warn('Batch summarize API fallback:', err);
      const { updatedSources } = ensureAllSourcesHaveSummaryAndKeyPoints();
      setSources(updatedSources);
      setStorageDiag(getStorageDiagnostics());
      showToast(`⚡ Đã tạo và lưu Summary & Key Points cho toàn bộ ${updatedSources.length} bài học vào Local Storage!`, 'success');
    } finally {
      setIsBatchGeneratingSummary(false);
      setBatchSummaryProgress({ current: sources.length, total: sources.length, currentTitle: 'Hoàn tất!' });
    }
  };

  // Open All Summaries Cheat Sheet modal
  const handleOpenAllSummariesModal = () => {
    const { updatedSources } = ensureAllSourcesHaveSummaryAndKeyPoints();
    setSources(updatedSources);
    setIsAllSummariesModalOpen(true);
  };

  // Copy whole cheat sheet to clipboard
  const handleCopyAllCheatSheet = () => {
    try {
      const text = sources
        .map((s, idx) => {
          const sub = subjects.find((sb) => sb.id === s.subjectId)?.title || 'Khoa học';
          const points = s.keyPoints && s.keyPoints.length > 0
            ? s.keyPoints.map((k, i) => `   ${i + 1}. ${k}`).join('\n')
            : '   (Chưa có key points)';
          return `### [Bài ${idx + 1}] ${s.title} (${sub})\n- 📌 Tóm tắt: ${s.summary || 'Chưa có tóm tắt'}\n- 🎯 Key Points:\n${points}\n`;
        })
        .join('\n---\n\n');

      navigator.clipboard.writeText(text);
      setCopiedAllCheatSheet(true);
      showToast('Đã sao chép toàn bộ Đề Cương Tóm Tắt & Key Points vào bộ nhớ tạm!', 'success');
      setTimeout(() => setCopiedAllCheatSheet(false), 2500);
    } catch {
      showToast('Không thể sao chép văn bản!', 'info');
    }
  };

  // Open Subject Summary Modal
  const handleOpenSubjectSummary = () => {
    setIsSubjectSummaryModal(true);
    const stored = loadSubjectSummaries();
    if (stored[activeSubjectId]) {
      setSubjectSummary(stored[activeSubjectId]);
    } else {
      handleGenerateSubjectSummary();
    }
  };

  // Generate Subject-wide Summary
  const handleGenerateSubjectSummary = async () => {
    const subSources = sources.filter((s) => s.subjectId === activeSubjectId);
    if (subSources.length === 0) {
      showToast('Chưa có bài học nào trong môn này để tạo tóm tắt.', 'info');
      return;
    }

    setIsGeneratingSubjectSummary(true);
    try {
      const combinedContent = subSources
        .map((s, idx) => `[Bài ${idx + 1}] ${s.title}: ${s.content || s.note || ''}`)
        .join('\n\n');

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Tổng quan toàn bộ môn học: ${activeSubject.title}`,
          content: combinedContent,
          subjectTitle: activeSubject.title,
          gradeLevel: activeSubject.gradeLevel || 'Lớp 7 trở lên',
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        saveSubjectSummaryToStorage(activeSubjectId, data.summary, data.keyPoints || []);
        setSubjectSummary({
          summary: data.summary,
          keyPoints: data.keyPoints || [],
          generatedAt: Date.now(),
        });
        showToast('✨ Đã tổng hợp tóm tắt và key points môn học vào Local Storage!', 'success');
      }
    } catch (e) {
      console.warn('Lỗi tạo tóm tắt môn học:', e);
    } finally {
      setIsGeneratingSubjectSummary(false);
    }
  };

  // Execute delete source safely (100% reliable in iframes)
  const executeDeleteSource = (id: string) => {
    if (speakingSourceId === id) {
      window.speechSynthesis?.cancel();
      setSpeakingSourceId(null);
    }
    const updated = sources.filter((s) => s.id !== id);
    setSources(updated);
    saveStudySources(updated);
    if (viewingSource?.id === id) {
      setViewingSource(null);
    }
    if (editingSource?.id === id) {
      setEditingSource(null);
    }
    setSourceToDelete(null);
    showToast('Đã xóa nguồn học liệu khỏi danh sách.', 'info');
  };

  // Open delete confirmation modal
  const handleDeleteSource = (id: string) => {
    const target = sources.find((s) => s.id === id);
    if (target) {
      setSourceToDelete(target);
    } else {
      executeDeleteSource(id);
    }
  };

  // Create new subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) {
      showToast('Vui lòng nhập tên môn hoặc chủ đề bài học!', 'info');
      return;
    }

    const newSub: StudySubject = {
      id: `subj-${Date.now()}`,
      title: newSubjectTitle.trim(),
      gradeLevel: newSubjectGrade.trim() || 'Tự học',
      description: newSubjectDesc.trim() || 'Chủ đề học tập cá nhân của em',
      isCustom: true,
      createdAt: Date.now(),
    };

    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveStudySubjects(updated);
    setActiveSubjectId(newSub.id);
    setIsAddingSubject(false);
    setNewSubjectTitle('');
    setNewSubjectGrade('');
    setNewSubjectDesc('');
    showToast('Đã tạo môn học mới thành công!', 'success');
  };

  // Execute delete subject safely
  const executeDeleteSubject = (subjId: string) => {
    const updatedSubs = subjects.filter((s) => s.id !== subjId);
    const updatedSources = sources.filter((s) => s.subjectId !== subjId);
    setSubjects(updatedSubs);
    setSources(updatedSources);
    saveStudySubjects(updatedSubs);
    saveStudySources(updatedSources);
    if (activeSubjectId === subjId && updatedSubs.length > 0) {
      setActiveSubjectId(updatedSubs[0].id);
    }
    setSubjectToDelete(null);
    showToast('Đã xóa môn học và dữ liệu liên quan.', 'info');
  };

  // Open delete subject confirmation modal
  const handleDeleteSubject = (subjId: string) => {
    const target = subjects.find((s) => s.id === subjId);
    if (target) {
      setSubjectToDelete(target);
    } else {
      executeDeleteSubject(subjId);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Student Friendly Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Góc Học Tập & Nguồn Tài Liệu Của Em</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Sổ Tay Bài Học & Kho Kiến Thức Đa Phương Tiện
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Không gian lưu trữ bài học được tối ưu cho học sinh: Thêm ghi chép văn bản, chụp ảnh trang sách giáo khoa,
              lưu đường dẫn bài giảng và lắng nghe giọng đọc ôn bài mọi lúc.
            </p>

            {/* Thông báo dữ liệu được lưu trên Local Storage */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-xs font-bold shadow-sm">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dữ liệu này được lưu trên Local Storage</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStorageDiag(getStorageDiagnostics());
                  setShowStorageInspector(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-700/60 text-cyan-300 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>🔍 Kiểm Tra & Xem Local Storage</span>
              </button>
              {onOpenAiReview && (
                <button
                  type="button"
                  onClick={() => onOpenAiReview()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900/90 border border-purple-700/60 text-purple-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                  title="Mở màn hình xem review AI đã hiểu gì từ kho bài học"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>🧠 Xem AI Đã Hiểu Gì</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSeedExtraSampleLessons}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                title="Tự động nạp thêm các bài học mẫu chuẩn vào Local Storage"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚡ Nạp Thêm Bài Mẫu</span>
              </button>
              <button
                type="button"
                onClick={handleBatchGenerateSummaries}
                disabled={isBatchGeneratingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/60 text-amber-300 text-xs font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
                title="Tự động kiểm tra và tạo Summary & Key Points cho tất cả bài học"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Tạo Summary & Key Points Tất Cả</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlashcardSubjectId('all');
                  setFlashcardSourceId(undefined);
                  setIsFlashcardModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                title="Luyện tập ghi nhớ hai mặt Flashcard với Active Recall và Spaced Repetition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>🃏 Bộ Thẻ Flashcard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = syncFlashcardsFromAllSources();
                  showToast(
                    `Đã cập nhật ${res.updatedCount} thẻ và thêm ${res.addedCount} thẻ Flashcard mới từ bài học! (Tổng: ${res.totalCount} thẻ)`,
                    'success'
                  );
                  setFlashcardSubjectId('all');
                  setFlashcardSourceId(undefined);
                  setIsFlashcardModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                title="Cập nhật và đồng bộ toàn bộ thẻ Flashcard từ các bài học hiện có"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>🔄 Cập Nhật Flashcard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudyPackSubjectId(activeSubjectId);
                  setStudyPackSourceId(undefined);
                  setIsStudyPackModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900/90 border border-purple-700/60 text-purple-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                title="Mở Gói Học Tập Toàn Diện 5 Thành Phần (Buổi 3: Summary, Key Points, Flashcards, Luyện tập, Q&A Seed)"
              >
                <Package className="w-3.5 h-3.5 text-purple-400" />
                <span>📦 Study Pack 5-in-1</span>
              </button>

              {onOpenQuiz && (
                <button
                  type="button"
                  onClick={() => onOpenQuiz(undefined, activeSubjectId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                  title="Mở Đấu Trường Quiz Luyện Thi Thông Minh (Buổi 4: Luyện tập, Tính giờ, Tốc độ, Ôn câu sai)"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🎯 Đấu Trường Quiz AI</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAddQuizSourceId(undefined);
                  setAddQuizSubjectId(activeSubjectId);
                  setIsAddQuizModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950/80 hover:bg-teal-900/90 border border-teal-700/60 text-teal-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                title="Tự soạn thêm câu hỏi trắc nghiệm mới từ các bài học trong góc học tập"
              >
                <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>➕ Soạn Đề Quiz</span>
              </button>
              <span className="text-slate-400 text-xs">
                (Tất cả bài học và tài liệu của em được lưu an toàn trong bộ nhớ Local Storage của trình duyệt)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Nút Đấu Trường Quiz Buổi 4 */}
            {onOpenQuiz && (
              <button
                id="open-quiz-banner-btn"
                onClick={() => onOpenQuiz(undefined, activeSubjectId)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                title="Đấu trường khảo thí & luyện trắc nghiệm chuẩn năng lực THCS (Buổi 4)"
              >
                <Target className="w-4 h-4 text-slate-950" />
                <span>🎯 Đấu Trường Quiz (Buổi 4)</span>
              </button>
            )}

            {/* Nút Gói Học Tập Study Pack Buổi 3 */}
            <button
              id="open-studypack-banner-btn"
              onClick={() => {
                setStudyPackSubjectId(activeSubjectId);
                setStudyPackSourceId(undefined);
                setIsStudyPackModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition cursor-pointer"
              title="Khám phá Gói Học Tập Chuẩn Sư Phạm Buổi 3: Tóm tắt, Điểm cốt lõi, Flashcards, Bài tập nhiều dạng & Q&A Seed"
            >
              <Package className="w-4 h-4 text-white" />
              <span>📦 Gói Học Tập (Study Pack)</span>
            </button>

            {/* Nút Tạo Summary & Key Points Cho Tất Cả Bài Học */}
            <button
              id="batch-generate-summary-banner-btn"
              onClick={handleBatchGenerateSummaries}
              disabled={isBatchGeneratingSummary}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-50"
              title="Tự động tạo summary (tóm tắt) và key points (điểm cốt lõi) cho tất cả bài học trong kho"
            >
              <Zap className={`w-4 h-4 text-slate-950 ${isBatchGeneratingSummary ? 'animate-bounce' : 'fill-current'}`} />
              <span>{isBatchGeneratingSummary ? `Đang tạo (${batchSummaryProgress.current}/${batchSummaryProgress.total})...` : '⚡ Tạo Summary & Key Points Tất Cả'}</span>
            </button>

            {/* Nút Xem Đề Cương Tóm Tắt Toàn Bộ */}
            <button
              id="open-cheat-sheet-btn"
              onClick={handleOpenAllSummariesModal}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              title="Mở Bảng Đề Cương Tóm Tắt & Key Points của toàn bộ bài học"
            >
              <ListChecks className="w-4 h-4 text-amber-400" />
              <span>📋 Đề Cương Summary</span>
            </button>

            {/* Nút Tạo Giúp Tôi Bằng AI */}
            <button
              id="open-ai-generate-lesson-btn"
              onClick={() => {
                setAiSelectedSubjectId(activeSubjectId);
                setIsGeneratingLessonModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              title="Yêu cầu AI tự động soạn thảo và tạo bài học chuẩn vào Local Storage"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              <span>✨ AI Tạo Bài Giúp Tôi</span>
            </button>

            {onOpenAiReview && (
              <button
                id="open-ai-review-banner-btn"
                onClick={() => onOpenAiReview()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition cursor-pointer"
                title="Mở màn hình đánh giá những gì AI đã học và hiểu từ bài của em"
              >
                <Brain className="w-4 h-4 text-purple-200" />
                <span>🧠 Review AI Đã Hiểu Gì</span>
              </button>
            )}

            <button
              id="open-snapshot-banner-btn"
              onClick={() => setIsSnapshotModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              title="Lưu hoặc mở lại toàn bộ bản Snapshot của môn học này trong Local Storage"
            >
              <Save className="w-4 h-4 text-white" />
              <span>💾 Lưu / Mở Snapshot</span>
            </button>

            <button
              id="open-add-source-btn"
              onClick={() => {
                setIsAddingSource(true);
                setNewSourceType('text'); // Text-first priority!
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Tài Liệu Mới</span>
            </button>

            <button
              id="open-add-subject-btn"
              onClick={() => setIsAddingSubject(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm transition"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>+ Môn Học Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Môn/Chủ đề đang học (Select / Open study subject) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Chọn Hoặc Mở Môn/Chủ Đề Đang Học:</span>
            </h2>
            <p className="text-xs text-slate-400">
              Chuyển đổi bài học để xem toàn bộ tài liệu, ghi chép và hình ảnh liên quan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSnapshotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Lưu hoặc mở lại toàn bộ bản Snapshot của môn học này trong Local Storage"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>💾 Lưu / Mở Snapshot</span>
            </button>
            <button
              onClick={handleBatchGenerateSummaries}
              disabled={isBatchGeneratingSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/90 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Tự động tạo Summary & Key Points cho tất cả bài học trong kho"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Tạo Summary & Key Points Tất Cả</span>
            </button>
            <button
              onClick={handleOpenSubjectSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Tổng hợp bản tóm tắt và điểm cốt lõi toàn bộ môn này"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>📑 Tóm Tắt Môn Này</span>
            </button>
            <button
              onClick={handleOpenAllSummariesModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Xem Bảng Đề Cương Tổng Hợp Summary & Key Points Tất Cả Bài Học"
            >
              <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
              <span>📋 Đề Cương Tất Cả</span>
            </button>
            <div className="text-xs text-slate-400 font-medium hidden md:block">
              Đang mở: <strong className="text-cyan-300">{activeSubject?.title}</strong> ({currentSubjectSources.length} tài liệu)
            </div>
          </div>
        </div>

        {/* Subjects horizontal selector badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjects.map((subj) => {
            const isActive = subj.id === activeSubjectId;
            const count = sources.filter((s) => s.subjectId === subj.id).length;
            return (
              <div
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {subj.gradeLevel || 'Môn học'}
                    </span>
                    {subj.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subj.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 transition p-0.5"
                        title="Xóa môn học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3
                    className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${
                      isActive ? 'text-slate-100' : 'text-slate-300'
                    }`}
                  >
                    {subj.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">
                    {count} tài liệu
                  </span>
                  <span
                    className={`font-semibold ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {isActive ? '● Đang học' : 'Mở xem →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Add New Source Form (In-line Drawer or Modal for Text, Image, URL) */}
      {isAddingSource && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Thêm Nguồn Bài Học Vào: <span className="text-cyan-300">{activeSubject?.title}</span>
                </h2>
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  <span>Chọn dạng tài liệu em muốn lưu: Chữ viết (Text), Hình ảnh (Image) hoặc Đường dẫn (URL).</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                    <Database className="w-3 h-3 text-emerald-400" />
                    Được lưu trên Local Storage
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Đóng form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Source Type Selector - Text-First Priority! */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              id="source-type-text-btn"
              onClick={() => setNewSourceType('text')}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition ${
                newSourceType === 'text'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>1. Ghi Chép Bài Học (Text)</span>
            </button>

            <button
              type="button"
              id="source-type-image-btn"
              onClick={() => setNewSourceType('image')}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition ${
                newSourceType === 'image'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-5 h-5 shrink-0" />
              <span>2. Hình Ảnh Sách & Sơ Đồ</span>
            </button>

            <button
              type="button"
              id="source-type-url-btn"
              onClick={() => setNewSourceType('url')}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition ${
                newSourceType === 'url'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-5 h-5 shrink-0" />
              <span>3. Đường Link Bài Giảng (URL)</span>
            </button>
          </div>

          <form onSubmit={handleSaveSource} className="space-y-4">
            {/* Common Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tiêu đề bài học / Tên tài liệu <span className="text-rose-400">*</span>
              </label>
              <input
                id="source-title-input"
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={
                  newSourceType === 'text'
                    ? 'Ví dụ: Tóm tắt bài 12 - Hiện tượng phản xạ âm và tiếng vang'
                    : newSourceType === 'image'
                    ? 'Ví dụ: Sơ đồ khúc xạ ánh sáng qua lăng kính thủy tinh'
                    : 'Ví dụ: Video bài giảng mô phỏng giao thoa sóng âm trường ĐH Bách Khoa'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* DẠNG 1: TEXT-FIRST CONTENT */}
            {newSourceType === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Nội dung văn bản ghi chép <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAiAutoWriteForForm}
                      disabled={isAiWritingForm}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
                      title="AI sẽ dựa vào tiêu đề bạn nhập để tự động viết toàn bộ nội dung bài học"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiWritingForm ? 'animate-spin' : ''}`} />
                      <span>{isAiWritingForm ? 'AI Đang Soạn Bài...' : '✨ AI Viết Giúp Tôi'}</span>
                    </button>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Ưu tiên văn bản rõ ràng, dễ đọc cho học sinh
                    </span>
                  </div>
                </div>
                <textarea
                  id="source-text-content-input"
                  required
                  rows={7}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Gõ hoặc dán nội dung bài học vào đây...
1. Định nghĩa bài học:
2. Các công thức hoặc nội dung cần nhớ:
3. Ví dụ vận dụng thực tế:"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition"
                />
              </div>
            )}

            {/* DẠNG 2: IMAGE CONTENT */}
            {newSourceType === 'image' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Tải ảnh từ máy tính/điện thoại hoặc dán link ảnh <span className="text-rose-400">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl p-5 bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer transition"
                  >
                    <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
                    <span className="text-xs font-bold text-slate-200">Bấm để tải ảnh lên</span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Chụp ảnh trang sách, sơ đồ bài tập (JPG, PNG, GIF &lt; 3MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Or image URL input */}
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-400">Hoặc dán đường dẫn (URL) ảnh trên mạng:</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/anh-so-do.png"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    {imagePreview && (
                      <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormImageUrl('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-rose-600 rounded-md text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 3: URL CONTENT */}
            {newSourceType === 'url' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Địa chỉ liên kết trang web / bài giảng (URL) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="source-url-input"
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://phet.colorado.edu/... hoặc https://youtube.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Em có thể dán link video YouTube, mô phỏng thí nghiệm trực quan hoặc bài viết tham khảo.
                </span>
              </div>
            )}

            {/* Ghi chú & Từ khóa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Lời dặn / Ghi chú của em (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ví dụ: Ôn kỹ công thức này trước khi làm bài kiểm tra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Từ khóa gợi nhớ (phân cách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Ví dụ: Công thức, Lớp 7, Thực hành, Kiểm tra 15p"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="save-source-btn"
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Vào Góc Học Tập</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Hiển thị danh sách nguồn đã thêm (Sources List) */}
      <div className="space-y-4">
        {/* Thông báo trạng thái lưu trữ trên Local Storage */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Được lưu trên Local Storage</span>
            </span>
            <span className="text-slate-300 text-xs">
              Toàn bộ bài học và ghi chép được lưu tự động trên Local Storage của trình duyệt (không bị mất khi tải lại trang web).
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setStorageDiag(getStorageDiagnostics());
                setShowStorageInspector(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Xem Local Storage</span>
            </button>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Đã lưu {currentSubjectSources.length} tài liệu trong môn này</span>
            </div>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          {/* Source Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filterType === 'all'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({currentSubjectSources.length})
            </button>
            <button
              onClick={() => setFilterType('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                filterType === 'text'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ghi chép ({currentSubjectSources.filter((s) => s.type === 'text').length})</span>
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                filterType === 'image'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Hình ảnh ({currentSubjectSources.filter((s) => s.type === 'image').length})</span>
            </button>
            <button
              onClick={() => setFilterType('url')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                filterType === 'url'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Đường link ({currentSubjectSources.filter((s) => s.type === 'url').length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, từ khóa..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Empty state */}
        {displayedSources.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">Chưa có tài liệu nào trong mục này</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Em hãy bấm vào nút &quot;Thêm Tài Liệu Mới&quot; ở trên để bắt đầu lưu ghi chép, hình ảnh trang sách hoặc link bài giảng nhé!
            </p>
            <button
              onClick={() => {
                setIsAddingSource(true);
                setNewSourceType('text');
              }}
              className="mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              + Thêm Ghi Chép Đầu Tiên
            </button>
          </div>
        )}

        {/* List of Source Cards (Text-first emphasized layout!) */}
        <div className="grid grid-cols-1 gap-4">
          {displayedSources.map((source) => {
            const isSpeaking = speakingSourceId === source.id;

            return (
              <div
                key={source.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all space-y-4 relative group"
              >
                {/* Card Top: Source Type Badge + Title + Action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          source.type === 'text'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : source.type === 'image'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                        }`}
                      >
                        {source.type === 'text' && <FileText className="w-3 h-3" />}
                        {source.type === 'image' && <ImageIcon className="w-3 h-3" />}
                        {source.type === 'url' && <LinkIcon className="w-3 h-3" />}
                        <span>
                          {source.type === 'text'
                            ? 'Ghi chép bài học'
                            : source.type === 'image'
                            ? 'Hình ảnh & Sơ đồ'
                            : 'Liên kết bài giảng'}
                        </span>
                      </span>

                      <span className="text-[11px] text-slate-500">
                        {new Date(source.createdAt).toLocaleDateString('vi-VN')}
                      </span>

                      <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/60 inline-flex items-center gap-1">
                        <HardDrive className="w-2.5 h-2.5 text-emerald-400" />
                        Được lưu trên Local Storage
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                      {source.title}
                    </h3>
                  </div>

                  {/* Actions Header Toolbar: CRUD (Xem lại, Sửa, Xóa) + Nghe đọc + Hỏi AI */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Read / Xem lại nguồn đã lưu */}
                    <button
                      onClick={() => setViewingSource(source)}
                      className="p-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Xem lại toàn văn nội dung nguồn học liệu"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Xem lại</span>
                    </button>

                    {/* Update / Sửa tiêu đề hoặc nội dung nguồn */}
                    <button
                      onClick={() => openEditModal(source)}
                      className="p-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Chỉnh sửa tiêu đề hoặc nội dung tài liệu này"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sửa</span>
                    </button>

                    {/* Read Aloud (Loa đọc bài) */}
                    <button
                      onClick={() => toggleSpeech(source)}
                      className={`p-2 px-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                        isSpeaking
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50'
                      }`}
                      title={isSpeaking ? 'Dừng đọc' : 'Bấm để nghe đọc to bài học này'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="hidden md:inline">
                        {isSpeaking ? 'Đang đọc...' : 'Nghe đọc'}
                      </span>
                    </button>

                    {/* Ask AI about this source */}
                    <button
                      onClick={() =>
                        onAskAIAboutTopic?.(
                          activeSubject?.title || 'Bài học',
                          `Em đang học bài: "${source.title}". 
Nội dung tài liệu:
${source.type === 'text' ? source.content : source.note || source.content}

Thầy cô AI hãy giải thích cặn kẽ bài học này bằng ngôn ngữ học sinh dễ hiểu nhất và cho em vài ví dụ minh họa nhé!`
                        )
                      }
                      className="p-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                      title="Hỏi trợ lý AI giải thích sâu hơn về bài học này"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden xl:inline">Hỏi AI</span>
                    </button>

                    {/* Summary & Key Points button */}
                    <button
                      onClick={() => handleGenerateSummaryForSource(source)}
                      disabled={summarizingSourceId === source.id}
                      className="p-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 hover:text-white hover:bg-indigo-950/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Tạo hoặc cập nhật tóm tắt và điểm cốt lõi cho bài này"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${summarizingSourceId === source.id ? 'animate-spin text-cyan-400' : 'text-indigo-400'}`} />
                      <span className="hidden lg:inline">{source.summary ? 'Tóm tắt & Key Points' : 'Tạo Summary'}</span>
                    </button>

                    {/* Study Pack Button */}
                    <button
                      onClick={() => {
                        setStudyPackSubjectId(source.subjectId);
                        setStudyPackSourceId(source.id);
                        setIsStudyPackModalOpen(true);
                      }}
                      className="p-2 px-2.5 rounded-xl bg-purple-950/60 border border-purple-700/60 text-purple-300 hover:text-white hover:bg-purple-900/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Mở gói học tập 5-in-1 (Summary, Key points, Flashcards, Bài tập, Q&A) cho bài này"
                    >
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden lg:inline">Study Pack</span>
                    </button>

                    {/* Quiz Button (Buổi 4) */}
                    {onOpenQuiz && (
                      <button
                        onClick={() => onOpenQuiz(source.id, source.subjectId)}
                        className="p-2 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:text-white hover:bg-emerald-900/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Vào đấu trường Quiz trắc nghiệm đánh giá kiến thức bài học này"
                      >
                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden lg:inline">Luyện Quiz</span>
                      </button>
                    )}

                    {/* Add Custom Quiz Question for this lesson */}
                    <button
                      onClick={() => {
                        setAddQuizSourceId(source.id);
                        setAddQuizSubjectId(source.subjectId);
                        setIsAddQuizModalOpen(true);
                      }}
                      className="p-2 px-2.5 rounded-xl bg-teal-950/40 border border-teal-800/80 text-teal-300 hover:text-white hover:bg-teal-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Tự soạn câu hỏi trắc nghiệm cho bài học này để tự luyện tập"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span className="hidden xl:inline">+ Soạn câu hỏi</span>
                    </button>

                    {/* Flashcards & Cập nhật thẻ ghi nhớ cho bài này */}
                    <button
                      onClick={() => {
                        setFlashcardSubjectId(source.subjectId);
                        setFlashcardSourceId(source.id);
                        setIsFlashcardModalOpen(true);
                      }}
                      className="p-2 px-2.5 rounded-xl bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:text-white hover:bg-indigo-900/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Mở và cập nhật bộ thẻ Flashcard ghi nhớ cho bài học này"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden xl:inline">Flashcard</span>
                    </button>

                    {/* Review what AI understood from this specific source */}
                    {onOpenAiReview && (
                      <button
                        onClick={() => onOpenAiReview(source.id)}
                        className="p-2 px-2.5 rounded-xl bg-purple-950/40 border border-purple-800/80 text-purple-300 hover:text-white hover:bg-purple-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Xem AI đã hiểu và phân tích bài học này như thế nào"
                      >
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden xl:inline">AI hiểu gì?</span>
                      </button>
                    )}

                    {/* Delete / Xóa nguồn không cần nữa */}
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="p-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Xóa nguồn học liệu này khỏi danh sách"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Xóa</span>
                    </button>
                  </div>
                </div>

                {/* CARD BODY: Text-first reading experience */}
                {source.type === 'text' && (
                  <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800/90 rounded-xl">
                    <p className="text-sm sm:text-base text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                      {source.content}
                    </p>
                  </div>
                )}

                {/* CARD BODY: Image Preview */}
                {source.type === 'image' && (
                  <div className="space-y-3">
                    <div
                      onClick={() =>
                        setZoomedImage({
                          url: source.imageUrl || source.content,
                          title: source.title,
                          note: source.note,
                        })
                      }
                      className="relative max-h-96 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group/img cursor-pointer"
                    >
                      <img
                        src={source.imageUrl || source.content}
                        alt={source.title}
                        className="w-full max-h-96 object-contain mx-auto transition group-hover/img:scale-[1.01]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-bold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Bấm để phóng to hình ảnh</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD BODY: URL Link */}
                {source.type === 'url' && (
                  <div className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-slate-400 block">Địa chỉ trang học tập:</span>
                        <a
                          href={source.url || source.content}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline truncate block"
                        >
                          {source.url || source.content}
                        </a>
                      </div>
                    </div>

                    <a
                      href={source.url || source.content}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shrink-0"
                    >
                      <span>Mở xem trang web</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* AI Summary & Key Points Box on the Card */}
                {source.summary ? (
                  <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-cyan-950/30 border border-indigo-500/30 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[11px] font-bold">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Tóm Tắt & Điểm Cốt Lõi (Lớp 7+)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">● Đã lưu Local Storage</span>
                      </div>
                      <button
                        onClick={() => handleGenerateSummaryForSource(source)}
                        disabled={summarizingSourceId === source.id}
                        className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                        title="Tạo lại tóm tắt và điểm cốt lõi bằng AI"
                      >
                        <RefreshCw className={`w-3 h-3 ${summarizingSourceId === source.id ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>{summarizingSourceId === source.id ? 'Đang tóm tắt...' : 'Làm mới'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      📌 <strong className="text-slate-100">Tóm tắt ngắn gọn:</strong> {source.summary}
                    </p>

                    {source.keyPoints && source.keyPoints.length > 0 && (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
                        <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                          <span>🎯 Điểm cốt lõi cần nhớ:</span>
                        </span>
                        <ul className="space-y-1 pl-1">
                          {source.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl">
                    <span className="text-xs text-slate-400">
                      Chưa có tóm tắt & điểm cốt lõi cho bài học này
                    </span>
                    <button
                      onClick={() => handleGenerateSummaryForSource(source)}
                      disabled={summarizingSourceId === source.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${summarizingSourceId === source.id ? 'animate-spin text-cyan-400' : 'text-indigo-400'}`} />
                      <span>{summarizingSourceId === source.id ? 'AI Đang Tóm Tắt...' : '✨ Tạo Summary & Key Points'}</span>
                    </button>
                  </div>
                )}

                {/* Card Footer: Student notes & tags */}
                {(source.note || (source.tags && source.tags.length > 0)) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    {source.note ? (
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-semibold text-amber-400 shrink-0">💡 Lời dặn:</span>
                        <span className="italic">{source.note}</span>
                      </div>
                    ) : (
                      <div></div>
                    )}

                    {source.tags && source.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {source.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Thêm Môn Học Mới */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <span>Thêm Môn Học / Chủ Đề Mới</span>
              </h3>
              <button
                onClick={() => setIsAddingSubject(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tên Môn học hoặc Chủ đề <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  placeholder="Ví dụ: Sinh học 8: Cơ quan thị giác & thính giác"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Khối lớp / Cấp độ học tập:
                </label>
                <input
                  type="text"
                  value={newSubjectGrade}
                  onChange={(e) => setNewSubjectGrade(e.target.value)}
                  placeholder="Ví dụ: Lớp 8, Lớp 11, Ôn thi tốt nghiệp, Tự học"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mô tả ngắn về chủ đề:
                </label>
                <textarea
                  rows={2}
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="Ví dụ: Tổng hợp các bài học về tai, mắt và phản xạ thần kinh..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Tạo Môn Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Phóng to ảnh xem chi tiết */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-3 cursor-default animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {zoomedImage.title}
              </h3>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-h-[70vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {zoomedImage.note && (
              <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                💡 Chú thích: {zoomedImage.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Xem Lại Nguồn Đã Lưu (Read / View Detail) */}
      {viewingSource && (
        <div
          onClick={() => setViewingSource(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl cursor-default animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    viewingSource.type === 'text'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : viewingSource.type === 'image'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {viewingSource.type === 'text' && <FileText className="w-3.5 h-3.5" />}
                  {viewingSource.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                  {viewingSource.type === 'url' && <LinkIcon className="w-3.5 h-3.5" />}
                  <span>
                    {viewingSource.type === 'text'
                      ? 'Ghi chép văn bản'
                      : viewingSource.type === 'image'
                      ? 'Hình ảnh & Sơ đồ'
                      : 'Liên kết bài giảng'}
                  </span>
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(viewingSource.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/60 inline-flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                  Được lưu trên Local Storage
                </span>
              </div>

              <button
                onClick={() => setViewingSource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-100 leading-snug">
                {viewingSource.title}
              </h2>

              {/* Text content */}
              {viewingSource.type === 'text' && (
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl max-h-96 overflow-y-auto">
                  <p className="text-sm sm:text-base text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                    {viewingSource.content}
                  </p>
                </div>
              )}

              {/* Image content */}
              {viewingSource.type === 'image' && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                  <img
                    src={viewingSource.imageUrl || viewingSource.content}
                    alt={viewingSource.title}
                    className="max-h-80 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* URL content */}
              {viewingSource.type === 'url' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs text-slate-400 block">Địa chỉ trang học tập:</span>
                  <a
                    href={viewingSource.url || viewingSource.content}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-semibold text-cyan-400 hover:underline break-all block"
                  >
                    {viewingSource.url || viewingSource.content}
                  </a>
                  <a
                    href={viewingSource.url || viewingSource.content}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    <span>Mở xem trang web</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Student Note */}
              {viewingSource.note && (
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300">
                  <strong className="text-amber-400">💡 Lời dặn / Ghi chú: </strong>
                  <span>{viewingSource.note}</span>
                </div>
              )}

              {/* Summary & Key Points Section in Modal */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-cyan-950/30 border border-indigo-500/30 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-xs font-bold shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tóm Tắt & Điểm Cốt Lõi (Lớp 7+)</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>Đã lưu Local Storage</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleGenerateSummaryForSource(viewingSource)}
                    disabled={summarizingSourceId === viewingSource.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${summarizingSourceId === viewingSource.id ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>{summarizingSourceId === viewingSource.id ? 'AI Đang Tóm Tắt...' : '⚡ Tạo Lại Bằng AI'}</span>
                  </button>
                </div>

                {viewingSource.summary ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                      <span className="text-xs font-bold text-slate-300 block mb-1">📌 Tóm tắt ngắn gọn:</span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                        {viewingSource.summary}
                      </p>
                    </div>

                    {viewingSource.keyPoints && viewingSource.keyPoints.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300">🎯 Điểm cốt lõi quan trọng (Key Points):</span>
                          <button
                            type="button"
                            onClick={() => {
                              const text = viewingSource.keyPoints?.map((k, i) => `${i + 1}. ${k}`).join('\n') || '';
                              navigator.clipboard.writeText(text);
                              showToast('Đã sao chép các điểm cốt lõi vào bộ nhớ tạm!', 'success');
                            }}
                            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </button>
                        </div>
                        <ul className="space-y-2 pl-1">
                          {viewingSource.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-slate-400">
                      Bài học này chưa có tóm tắt và điểm cốt lõi. Bấm nút dưới để AI tự động trích xuất!
                    </p>
                    <button
                      onClick={() => handleGenerateSummaryForSource(viewingSource)}
                      disabled={summarizingSourceId === viewingSource.id}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Bắt Đầu Tạo Summary & Key Points Ngay</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {/* Voice read */}
                <button
                  onClick={() => toggleSpeech(viewingSource)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                    speakingSourceId === viewingSource.id
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50'
                  }`}
                >
                  {speakingSourceId === viewingSource.id ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>
                    {speakingSourceId === viewingSource.id ? 'Dừng đọc' : 'Nghe đọc bài'}
                  </span>
                </button>

                {/* Edit this source */}
                <button
                  onClick={() => {
                    const src = viewingSource;
                    setViewingSource(null);
                    openEditModal(src);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Sửa bài này</span>
                </button>

                {/* Review AI for this source */}
                {onOpenAiReview && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = viewingSource.id;
                      setViewingSource(null);
                      onOpenAiReview(id);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 hover:text-white hover:bg-purple-900/70 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Xem AI đã hiểu bài học này như thế nào"
                  >
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>AI hiểu bài này gì?</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingSource;
                    setViewingSource(null);
                    setSourceToDelete(target);
                  }}
                  className="px-3 py-2 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition flex items-center gap-1.5 cursor-pointer"
                  title="Xóa tài liệu này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSource(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Sửa Tiêu Đề Hoặc Nội Dung Nguồn (Update) */}
      {editingSource && (
        <div
          onClick={() => setEditingSource(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl cursor-default animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Chỉnh Sửa Nguồn Học Liệu</span>
              </h3>
              <button
                onClick={() => setEditingSource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSource} className="space-y-4">
              {/* Type selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Loại nguồn học liệu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('text')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      editType === 'text'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ghi chép</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditType('image')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      editType === 'image'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Hình ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditType('url')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      editType === 'url'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Liên kết</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tiêu đề ngắn <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ví dụ: Định luật phản xạ ánh sáng"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Content input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {editType === 'text'
                    ? 'Nội dung ghi chép bài học'
                    : editType === 'image'
                    ? 'Đường dẫn ảnh hoặc mã Base64'
                    : 'Địa chỉ trang web / liên kết bài giảng'}{' '}
                  <span className="text-rose-400">*</span>
                </label>
                {editType === 'text' ? (
                  <textarea
                    rows={6}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Nhập nội dung bài học..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-normal leading-relaxed"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder={
                      editType === 'image'
                        ? 'https://... hoặc data:image/...'
                        : 'https://hoc247.net/...'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ghi chú hoặc lời dặn của thầy cô:
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ví dụ: Cần học thuộc trước tiết kiểm tra thứ 3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA NGUỒN HỌC LIỆU (100% An toàn, không dùng confirm() bị chặn) */}
      {sourceToDelete && (
        <div
          onClick={() => setSourceToDelete(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl cursor-default animate-fadeIn"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Xác nhận xóa nguồn học liệu
                </h3>
                <p className="text-xs text-slate-400">
                  Thao tác này sẽ gỡ tài liệu khỏi danh sách học tập của em
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Tài liệu chuẩn bị xóa:</span>
              <p className="text-sm font-bold text-slate-100 line-clamp-2">
                {sourceToDelete.title}
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="capitalize">
                  {sourceToDelete.type === 'text'
                    ? 'Dạng văn bản ghi chép'
                    : sourceToDelete.type === 'image'
                    ? 'Dạng hình ảnh sơ đồ'
                    : 'Dạng liên kết trang web'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Em có chắc muốn xóa tài liệu này không? Dữ liệu sẽ được tự động dọn dẹp khỏi bộ nhớ máy của em.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSourceToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSource(sourceToDelete.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Đồng ý xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA MÔN HỌC (Custom Subject Delete) */}
      {subjectToDelete && (
        <div
          onClick={() => setSubjectToDelete(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl cursor-default animate-fadeIn"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Xác nhận xóa môn học
                </h3>
                <p className="text-xs text-slate-400">
                  Xóa môn học này cùng tất cả tài liệu bên trong
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Môn học chuẩn bị xóa:</span>
              <p className="text-sm font-bold text-slate-100">
                {subjectToDelete.title}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Em có chắc muốn xóa môn học này không? Mọi bài học và tài liệu đã lưu trong môn này cũng sẽ được gỡ bỏ.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSubject(subjectToDelete.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Đồng ý xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRÌNH KIỂM TRA & XEM DỮ LIỆU LOCAL STORAGE TRỰC TIẾP */}
      {showStorageInspector && (
        <div
          onClick={() => setShowStorageInspector(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl cursor-default animate-fadeIn max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>Trình Kiểm Tra & Minh Chứng Local Storage</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-medium">
                      Live Storage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Xác minh dữ liệu bài học được lưu trữ thực tế trong bộ nhớ trình duyệt của em
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStorageInspector(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-4 overflow-y-auto pr-1 text-xs">
              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Trạng thái:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Hoạt động tốt
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Tổng tài liệu lưu:</span>
                  <span className="font-bold text-slate-100 text-sm">
                    {storageDiag.sourcesCount} bài học
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Số môn học:</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {storageDiag.subjectsCount} môn
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Bản lưu Snapshot:</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {storageDiag.snapshotsCount} bản sao
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Thẻ Flashcard:</span>
                  <span className="font-bold text-indigo-300 text-sm">
                    {storageDiag.flashcardsCount} thẻ
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Gói Study Pack:</span>
                  <span className="font-bold text-purple-300 text-sm">
                    {storageDiag.studyPacksCount} gói
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Phiên bản Study Pack:</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {storageDiag.studyPackVersionsCount} bản lưu
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Phiên bản Flashcard:</span>
                  <span className="font-bold text-pink-300 text-sm">
                    {storageDiag.flashcardVersionsCount} bản lưu
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Tin nhắn Chatbot Gia Sư:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {storageDiag.lessonChatsCount + storageDiag.flashcardChatsCount + storageDiag.quizChatsCount} tin
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Phiên Cố Vấn AI:</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {storageDiag.aiMentorSessionsCount} cuộc đàm thoại
                  </span>
                </div>
              </div>

              {/* Exact Key Names in LocalStorage */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-slate-300 block text-xs">
                  🔑 Các khóa (Keys) đang lưu trong window.localStorage của em:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa bài học chính:</span>
                    <span className="text-cyan-300 font-bold">{SOURCES_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa bản lưu Snapshot:</span>
                    <span className="text-cyan-400 font-bold">{SUBJECT_SNAPSHOTS_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa bộ thẻ Flashcards:</span>
                    <span className="text-indigo-400 font-bold">school_study_flashcards_v1</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa phiên bản Flashcards:</span>
                    <span className="text-pink-400 font-bold">{FLASHCARD_VERSIONS_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa gói bài học Study Packs:</span>
                    <span className="text-purple-400 font-bold">school_study_packs_v1</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa lịch sử Chatbot Bài học:</span>
                    <span className="text-emerald-400 font-bold">{LESSON_CHATS_STORAGE_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa lịch sử Chatbot Flashcard:</span>
                    <span className="text-purple-400 font-bold">{FLASHCARD_CHATS_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa lịch sử Chatbot Quiz:</span>
                    <span className="text-amber-400 font-bold">{QUIZ_CHATS_KEY}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Khóa các phiên AI Mentor:</span>
                    <span className="text-cyan-400 font-bold">{AI_MENTOR_SESSIONS_KEY}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Live Test & Sync */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRunStorageTest}
                  disabled={isTestingStorage}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingStorage ? 'animate-spin' : ''}`} />
                  <span>{isTestingStorage ? 'Đang thử nghiệm...' : '🧪 Thử Nghiệm Ghi & Đọc Thực Tế'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReloadFromLocalStorage}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đồng Bộ Lại Từ Local Storage</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyStorageJson}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer ml-auto"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedJson ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                </button>
              </div>

              {/* Test Result Message Box */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-700 text-rose-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {testResult.success ? 'Kiểm tra thành công 100%' : 'Kiểm tra thất bại'} ({testResult.timestamp})
                    </span>
                    <span className="text-[11px] opacity-90">{testResult.message}</span>
                  </div>
                </div>
              )}

              {/* Raw JSON Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold text-[11px]">
                    Dữ liệu thô thực tế trong localStorage.getItem('{SOURCES_KEY}'):
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Định dạng JSON tiêu chuẩn
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 max-h-44 overflow-y-auto leading-relaxed break-all select-all">
                  {storageDiag.rawJsonPreview}
                </div>
              </div>

              {/* F12 DevTools Inspection Guide */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>💡 Hướng dẫn xem qua F12 Developer Tools của trình duyệt:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Do ứng dụng chạy trong khung iframe an toàn của AI Studio, trình duyệt bảo mật phân tách Local Storage theo từng tên miền:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                  <li>Bấm phím <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">F12</kbd> (hoặc chuột phải chọn <em>Inspect / Kiểm tra</em>).</li>
                  <li>Chọn tab <strong>Application</strong> (hoặc <strong>Storage</strong>) &gt; chọn mục <strong>Local Storage</strong> ở cột bên trái.</li>
                  <li><strong>Lưu ý quan trọng:</strong> Nhấp chọn dòng domain kết thúc bằng <code className="text-cyan-300">.run.app</code> (tên miền của applet) thay vì dòng <code className="text-slate-400">ai.studio</code>.</li>
                  <li>Em sẽ thấy đầy đủ 2 khóa <strong className="text-cyan-300">{SOURCES_KEY}</strong> và <strong className="text-emerald-300">{ALIAS_SOURCES_KEY}</strong> chứa toàn bộ bài học!</li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowStorageInspector(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI TẠO BÀI HỌC GIÚP TÔI (AI LESSON GENERATOR) */}
      {isGeneratingLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>✨ AI Soạn Bài Giúp Tôi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      Gemini AI + Local Storage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    AI sẽ tự động nghiên cứu, viết nội dung chi tiết, trích xuất công thức và lưu trực tiếp vào Local Storage của em.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGeneratingLessonModal(false)}
                disabled={isAiGenerating}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              {/* Chọn Môn Học Đích */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  Lưu bài học này vào môn / chủ đề:
                </label>
                <select
                  value={aiSelectedSubjectId}
                  onChange={(e) => setAiSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.gradeLevel || 'Môn học'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nhập Chủ Đề Tùy Chọn */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  Em muốn AI tạo bài học về chủ đề gì? <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAiGenerating && aiTopicInput.trim()) {
                      handleGenerateLessonWithAi();
                    }
                  }}
                  placeholder="Ví dụ: Hiện tượng tán sắc ánh sáng, sóng siêu âm của loài dơi, tai nghe chống ồn ANC..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Gợi Ý Các Chủ Đề Khoa Học Thú Vị */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Hoặc bấm chọn nhanh các chủ đề vật lý & đời sống chuẩn:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { title: '🐬 Sóng siêu âm & Định vị của loài dơi', subj: 'subj-sound' },
                    { title: '🌈 Tán sắc ánh sáng & Sự tạo thành cầu vồng', subj: 'subj-light' },
                    { title: '⚡ Đo khoảng cách sấm sét bằng vận tốc âm thanh', subj: 'subj-thunder' },
                    { title: '🎧 Công nghệ chống ồn ANC & Giao thoa triệt tiêu', subj: 'subj-sound' },
                    { title: '🔭 Cáp quang internet & Phản xạ toàn phần', subj: 'subj-light' },
                    { title: '👁️ Tiêu chuẩn độ rọi Lux & Phòng tránh cận thị', subj: 'subj-health' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAiGenerating}
                      onClick={() => {
                        setAiTopicInput(preset.title);
                        if (subjects.some((s) => s.id === preset.subj)) {
                          setAiSelectedSubjectId(preset.subj);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 text-left transition cursor-pointer text-[11px]"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút Nạp Nhanh Bộ Bài Mẫu Chuẩn */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nạp sẵn bộ bài học mẫu chuẩn khoa học:</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bao gồm 3 bài học chuẩn về ANC, tán xạ Rayleigh bầu trời và đo sấm sét.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSeedExtraSampleLessons();
                    setIsGeneratingLessonModal(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition shrink-0 cursor-pointer"
                >
                  ⚡ Nạp Ngay Vào Máy
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGeneratingLessonModal(false)}
                disabled={isAiGenerating}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => handleGenerateLessonWithAi()}
                disabled={isAiGenerating || !aiTopicInput.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg cursor-pointer ${
                  isAiGenerating || !aiTopicInput.trim()
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'AI Đang Soạn Bài Học...' : '🚀 Bắt Đầu Soạn Bài & Lưu'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TỔNG HỢP SUMMARY & KEY POINTS TOÀN BỘ MÔN HỌC */}
      {isSubjectSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>📑 Tóm Tắt & Điểm Cốt Lõi Toàn Môn</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      Local Storage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Môn: <strong className="text-cyan-300">{activeSubject?.title}</strong> ({currentSubjectSources.length} bài học)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSubjectSummaryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isGeneratingSubjectSummary ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">AI đang tổng hợp dữ liệu bài học...</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Đang chắt lọc các khái niệm trọng tâm, công thức định lượng và ứng dụng đời sống phù hợp với học sinh lớp 7 trở lên.
                </p>
              </div>
            ) : subjectSummary ? (
              <div className="space-y-4 text-xs">
                {/* Summary box */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>📌 Tóm tắt ngắn gọn toàn môn (Summary):</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {subjectSummary.summary}
                  </p>
                </div>

                {/* Key points box */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <span>🎯 Các điểm cốt lõi quan trọng nhất (Key Points):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = subjectSummary.keyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n');
                        navigator.clipboard.writeText(text);
                        showToast('Đã sao chép danh sách Key Points!', 'success');
                      }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </button>
                  </div>

                  <ul className="space-y-2">
                    {subjectSummary.keyPoints.map((kp, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60"
                      >
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Chưa có bản tổng hợp cho môn này. Bấm nút dưới để AI tạo ngay từ các bài học có sẵn!
                </p>
                <button
                  type="button"
                  onClick={handleGenerateSubjectSummary}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg"
                >
                  🚀 Bắt Đầu Tạo Tóm Tắt & Key Points Môn Này
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateSubjectSummary}
                disabled={isGeneratingSubjectSummary}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSubjectSummary ? 'animate-spin' : ''}`} />
                <span>⚡ Yêu Cầu AI Tổng Hợp Lại</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubjectSummaryModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BẢNG ĐỀ CƯƠNG TỔNG HỢP SUMMARY & KEY POINTS TOÀN BỘ BÀI HỌC (CHEAT SHEET) */}
      {isAllSummariesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-bold">
                  <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đề Cương Ôn Tập Khoa Học Cốt Lõi</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <span>📋 Bảng Tổng Hợp Summary & Key Points Tất Cả Bài Học</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Xem nhanh toàn bộ {sources.length} bài học đã lưu trên Local Storage kèm Tóm tắt & Điểm cốt lõi chuẩn kiến thức
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllCheatSheet}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Sao chép toàn bộ nội dung đề cương vào bộ nhớ tạm"
                >
                  {copiedAllCheatSheet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedAllCheatSheet ? 'Đã sao chép!' : 'Sao chép đề cương'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAllSummariesModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter by subject pills */}
            <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Lọc theo môn:</span>
              <button
                type="button"
                onClick={() => setAllSummariesFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  allSummariesFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tất cả ({sources.length})
              </button>
              {subjects.map((sb) => {
                const count = sources.filter((s) => s.subjectId === sb.id).length;
                return (
                  <button
                    key={sb.id}
                    type="button"
                    onClick={() => setAllSummariesFilter(sb.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      allSummariesFilter === sb.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sb.title.split(':')[0]} ({count})
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Cards List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {sources
                .filter((s) => allSummariesFilter === 'all' || s.subjectId === allSummariesFilter)
                .map((s, idx) => {
                  const sub = subjects.find((sb) => sb.id === s.subjectId);
                  const isSpeakingThis = speakingSourceId === s.id;
                  return (
                    <div
                      key={s.id}
                      className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-100">{s.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="text-cyan-400 font-semibold">{sub?.title || 'Khoa học'}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">● Đã lưu Local Storage</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleSpeech(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
                              isSpeakingThis
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-300'
                            }`}
                            title="Nghe đọc to bài học"
                          >
                            {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{isSpeakingThis ? 'Dừng đọc' : 'Nghe đọc'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateSummaryForSource(s)}
                            disabled={summarizingSourceId === s.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                            title="Yêu cầu AI cập nhật tóm tắt và key points"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${summarizingSourceId === s.id ? 'animate-spin text-cyan-400' : ''}`} />
                            <span>Tạo lại</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Tóm tắt nội dung khoa học (Summary):</span>
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                          {s.summary || 'Chưa có bản tóm tắt'}
                        </p>
                      </div>

                      {/* Key Points */}
                      {s.keyPoints && s.keyPoints.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span>🎯 Các điểm cốt lõi cần nhớ (Key Points):</span>
                          </span>
                          <ul className="space-y-1 pl-1">
                            {s.keyPoints.map((kp, kIdx) => (
                              <li key={kIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                                <span>{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBatchGenerateSummaries}
                disabled={isBatchGeneratingSummary}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                <span>⚡ Tạo Lại Tất Cả Bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAllSummariesModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Đóng Đề Cương
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLASHCARD MODAL */}
      <FlashcardModal
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        subjects={subjects}
        sources={sources}
        initialSubjectId={flashcardSubjectId}
        initialSourceId={flashcardSourceId}
      />

      {/* BUỔI 3: STUDY PACK MODAL (5 THÀNH PHẦN) */}
      <StudyPackModal
        isOpen={isStudyPackModalOpen}
        onClose={() => setIsStudyPackModalOpen(false)}
        subjects={subjects}
        sources={sources}
        initialSubjectId={studyPackSubjectId}
        initialSourceId={studyPackSourceId}
        onOpenQuiz={(srcId, subjId) => {
          setIsStudyPackModalOpen(false);
          if (onOpenQuiz) onOpenQuiz(srcId, subjId);
        }}
      />

      {/* MODAL SOẠN CÂU HỎI TRẮC NGHIỆM TỪ GÓC HỌC TẬP */}
      <AddQuizQuestionModal
        isOpen={isAddQuizModalOpen}
        onClose={() => setIsAddQuizModalOpen(false)}
        subjects={subjects}
        sources={sources}
        initialSourceId={addQuizSourceId}
        initialSubjectId={addQuizSubjectId}
        onQuestionCreated={(newQ) => {
          showToast(`Đã thêm câu hỏi: "${newQ.question.slice(0, 35)}..." vào ngân hàng đề!`, 'success');
        }}
      />

      {/* MODAL LƯU & MỞ SNAPSHOT MÔN HỌC */}
      <SubjectSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        activeSubject={activeSubject}
        sourcesCount={currentSubjectSources.length}
        onSnapshotRestored={(newSubjId, msg) => {
          const freshSubs = loadStudySubjects();
          const freshSources = loadStudySources();
          setSubjects(freshSubs);
          setSources(freshSources);
          setActiveSubjectId(newSubjId);
          setStorageDiag(getStorageDiagnostics());
          showToast(msg, 'success');
        }}
      />

      {/* TOAST THÔNG BÁO PHẢN HỒI THAO TÁC */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-emerald-300 shadow-emerald-500/10'
                : toastMessage.type === 'warning'
                ? 'bg-slate-900 border-amber-500 text-amber-300 shadow-amber-500/10'
                : 'bg-slate-900 border-cyan-500 text-cyan-300 shadow-cyan-500/10'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
