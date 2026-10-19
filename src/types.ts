export type TabType = 'study' | 'sound' | 'light' | 'essentials' | 'live-meter' | 'ai-mentor' | 'ai-review' | 'quiz';

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'multi_select' | 'fill_blank' | 'phenomenon_analysis';

export interface QuizQuestion {
  id: string;
  sourceId?: string;
  sourceTitle?: string;
  subjectId?: string;
  subjectTitle?: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correctAnswer: string | number | number[]; // index or text or array of indices
  explanation: string;
  hint?: string;
  reviewHint?: string; // Gợi ý ngắn để ôn lại
  difficulty: 'easy' | 'medium' | 'hard';
  points: number; // e.g., 10
  misconceptionTrap?: string; // Common misconception pointed out
  category?: string;
  isCustom?: boolean; // Tự soạn từ góc học tập
  createdAt?: number;
}

export interface QuizDiagnosticReport {
  grade: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Cần củng cố';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestedFlashcards: string[];
  suggestedSources: string[];
  aiMentorAdvice: string;
}

export interface QuizSession {
  id: string;
  mode: 'practice' | 'exam' | 'speed' | 'mistakes' | 'self_study';
  feedbackTiming?: 'immediate' | 'after_quiz'; // Xem kết quả sau mỗi câu hoặc sau mỗi lượt quiz
  title: string;
  subjectTitle: string;
  totalQuestions: number;
  timeLimitSeconds?: number;
  elapsedSeconds: number;
  score: number; // 0 - 100
  correctCount: number;
  streak: number;
  maxStreak: number;
  completedAt: number;
  userAnswers: Record<string, any>;
  diagnostic?: QuizDiagnosticReport;
}

export interface AiSourceReview {
  sourceId: string;
  sourceTitle: string;
  subjectTitle?: string;
  summary: string;
  coreConcepts: string[];
  formulasAndRules?: string[];
  realWorldApplications: string[];
  keyTakeaway: string;
  comprehensionLevel: 'Tốt' | 'Rất cao' | 'Hoàn hảo';
  aiAdvice: string;
}

export interface AiQuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AiComprehensiveReview {
  id: string;
  scope: 'all' | 'subject' | 'source';
  scopeTitle: string;
  totalSourcesAnalyzed: number;
  overallScore: number; // 0 - 100
  statusSummary: string;
  overviewSummary: string;
  masteredConcepts: string[];
  extractedFormulas: { formula: string; explanation: string }[];
  crossConnections: string[];
  sourceReviews: AiSourceReview[];
  quizQuestions: AiQuizItem[];
  generatedAt: number;
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in' | 'explain_phenomenon';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface QaSeedItem {
  id: string;
  question: string;
  shortAnswer: string;
  followUpPrompt?: string;
  category?: 'Khái niệm thường hỏi' | 'Hiện tượng đời sống' | 'Sai lầm thường gặp' | 'Tư duy liên hệ';
}

export interface StudyPackVersion {
  id: string; // e.g. "ver-1"
  versionNumber: number; // 1, 2, 3...
  name: string; // Tên phiên bản: "Phiên bản 1 (Bản gốc)", "Phiên bản 2 (Tập trung nâng cao)"
  createdAt: number;
  generatorMode?: 'standard' | 'advanced' | 'practical' | 'custom';
  customPrompt?: string;
  summary: string;
  keyPoints: string[];
  flashcards: StudyFlashcard[];
  practiceQuestions: PracticeQuestion[];
  qaSeeds: QaSeedItem[];
  note?: string;
}

export interface LessonChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedFollowUps?: string[];
}

export interface StudyPack {
  id: string;
  sourceId?: string;
  sourceTitle: string;
  subjectId: string;
  subjectTitle: string;
  gradeLevel?: string;
  createdAt: number;
  updatedAt?: number;
  currentVersionId?: string;
  versions?: StudyPackVersion[];
  summary: string;
  keyPoints: string[];
  flashcards: StudyFlashcard[];
  practiceQuestions: PracticeQuestion[];
  qaSeeds: QaSeedItem[];
}

export interface StudyFlashcard {
  id: string;
  sourceId: string;
  sourceTitle: string;
  subjectId: string;
  subjectTitle?: string;
  front: string; // Question, concept name, rule, or phenomenon
  back: string; // Detailed answer, definition, formula, or explanation
  category: 'concept' | 'formula' | 'distinction' | 'application' | 'rule';
  difficulty: 'Dễ' | 'Trung bình' | 'Nâng cao';
  status: 'learning' | 'mastered' | 'review_needed';
  mnemonic?: string; // Mẹo nhớ nhanh
  createdAt: number;
  updatedAt?: number; // Thời điểm cập nhật thẻ
}

export type StudySourceType = 'text' | 'image' | 'url';

export interface StudySubject {
  id: string;
  title: string;
  gradeLevel?: string;
  description: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
  createdAt: number;
}

export interface StudySource {
  id: string;
  subjectId: string;
  type: StudySourceType;
  title: string;
  content: string;
  note?: string;
  url?: string;
  imageUrl?: string;
  createdAt: number;
  tags?: string[];
  summary?: string;
  keyPoints?: string[];
  summaryGeneratedAt?: number;
}

export interface SubjectSummary {
  subjectId: string;
  subjectTitle: string;
  summary: string;
  keyPoints: string[];
  generatedAt: number;
}

export interface StudySubjectSnapshot {
  id: string; // snapshot-xxx
  name: string; // Tên bản lưu snapshot (ví dụ: Snapshot Âm học 12/10)
  createdAt: number;
  subject: StudySubject;
  sources: StudySource[];
  studyPacks: StudyPack[];
  flashcards: StudyFlashcard[];
  subjectSummary?: { summary: string; keyPoints: string[]; generatedAt?: number };
  note?: string;
}

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type NoiseType = 'white' | 'pink' | 'brown' | 'none';

export interface SoundPreset {
  name: string;
  frequency: number;
  waveform: WaveformType;
  description: string;
  category: 'hearing' | 'musical' | 'acoustic' | 'binaural';
}

export interface MaterialAbsorption {
  name: string;
  coefficient: number; // 0 (reflective) to 1 (absorbent)
  typicalUse: string;
  category: 'wall' | 'floor' | 'furniture' | 'acoustic';
}

export interface RefractionMedium {
  name: string;
  nameVi: string;
  refractiveIndex: number;
  color: string;
  description: string;
}

export interface ColorTemperaturePoint {
  kelvin: number;
  name: string;
  description: string;
  melatoninImpact: 'Rất cao (Ngăn buồn ngủ)' | 'Cao' | 'Trung bình' | 'Thấp' | 'Không ảnh hưởng';
  recommendedUse: string;
  rgb: string;
}

export interface LightingBenchmark {
  room: string;
  luxMin: number;
  luxMax: number;
  kelvinRange: string;
  tips: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  topic?: string;
  experimentContext?: string;
  suggestedFollowUps?: string[];
}

export interface AiMentorChatSession {
  id: string;
  title: string;
  topic: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface FlashcardVersion {
  id: string;
  versionNumber: number;
  name: string;
  createdAt: number;
  generatorMode?: 'standard' | 'advanced' | 'practical' | 'mnemonic' | 'custom';
  customPrompt?: string;
  flashcards: StudyFlashcard[];
  note?: string;
}

export interface QuizChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedFollowUps?: string[];
}

