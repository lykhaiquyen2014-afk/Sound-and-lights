import React, { useState, useEffect } from 'react';
import { StudySubject, StudySource, QuizQuestion, QuizQuestionType } from '../types';
import { addCustomQuizQuestion } from '../utils/studyStorage';
import { PlusCircle, X, Check, Lightbulb, BookOpen, HelpCircle } from 'lucide-react';

interface AddQuizQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: StudySubject[];
  sources: StudySource[];
  initialSourceId?: string;
  initialSubjectId?: string;
  onQuestionCreated?: (question: QuizQuestion) => void;
}

export const AddQuizQuestionModal: React.FC<AddQuizQuestionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  sources,
  initialSourceId,
  initialSubjectId,
  onQuestionCreated,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [questionType, setQuestionType] = useState<QuizQuestionType>('multiple_choice');

  // Options
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [optionC, setOptionC] = useState<string>('');
  const [optionD, setOptionD] = useState<string>('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);

  // Revision Hint & Explanation
  const [reviewHint, setReviewHint] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync initial inputs on open
  useEffect(() => {
    if (isOpen) {
      if (initialSourceId) {
        setSelectedSourceId(initialSourceId);
        const matched = sources.find((s) => s.id === initialSourceId);
        if (matched?.subjectId) setSelectedSubjectId(matched.subjectId);
      } else if (initialSubjectId) {
        setSelectedSubjectId(initialSubjectId);
      } else if (subjects.length > 0) {
        setSelectedSubjectId(subjects[0].id);
      }
      setFormError(null);
      setSaveSuccess(false);
    }
  }, [isOpen, initialSourceId, initialSubjectId, sources, subjects]);

  if (!isOpen) return null;

  const filteredSources = sources.filter((s) => !selectedSubjectId || s.subjectId === selectedSubjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    let finalOptions: string[] = [];
    if (questionType === 'multiple_choice') {
      if (!optionA.trim() || !optionB.trim()) {
        setFormError('Vui lòng nhập ít nhất 2 phương án A và B.');
        return;
      }
      finalOptions = [optionA.trim(), optionB.trim()];
      if (optionC.trim()) finalOptions.push(optionC.trim());
      if (optionD.trim()) finalOptions.push(optionD.trim());
    } else {
      finalOptions = ['ĐÚNG', 'SAI'];
    }

    if (!reviewHint.trim()) {
      setFormError('Vui lòng nhập gợi ý ngắn để ôn lại (giúp người học nắm kiến thức khi sai).');
      return;
    }

    const matchedSource = sources.find((s) => s.id === selectedSourceId);
    const matchedSubject = subjects.find((s) => s.id === (matchedSource?.subjectId || selectedSubjectId));

    const newQ = addCustomQuizQuestion({
      sourceId: matchedSource?.id,
      sourceTitle: matchedSource?.title || 'Câu hỏi tự soạn',
      subjectId: matchedSubject?.id || 'subj-custom',
      subjectTitle: matchedSubject?.title || 'Vật lý Tự học',
      type: questionType,
      question: questionText.trim(),
      options: finalOptions,
      correctAnswer: correctOptionIndex < finalOptions.length ? correctOptionIndex : 0,
      explanation: explanation.trim() || reviewHint.trim(),
      hint: reviewHint.trim(),
      reviewHint: reviewHint.trim(),
      difficulty,
      points: 10,
      category: matchedSource?.title ? `Bài: ${matchedSource.title}` : 'Đề tự soạn',
      isCustom: true,
    });

    setSaveSuccess(true);
    if (onQuestionCreated) onQuestionCreated(newQ);

    setTimeout(() => {
      // Reset form
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setReviewHint('');
      setExplanation('');
      setFormError(null);
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Soạn Câu Hỏi Trắc Nghiệm Mới</h2>
              <p className="text-xs text-slate-400">Tự thêm đề từ các bài học trong Góc Học Tập để tự luyện</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 font-semibold">
              {formError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Đã lưu câu hỏi vào ngân hàng đề thành công!</span>
            </div>
          )}

          {/* Subject & Source Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Môn học</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedSourceId('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Chọn môn học</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Gắn với bài học (Góc học tập)</label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Chọn bài học trong kho</option>
                {filteredSources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nội dung câu hỏi <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ví dụ: Đại lượng nào sau đây quyết định độ cao của âm thanh?"
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Loại câu hỏi</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="qType"
                  checked={questionType === 'multiple_choice'}
                  onChange={() => setQuestionType('multiple_choice')}
                  className="accent-emerald-500"
                />
                <span>Trắc nghiệm 4 lựa chọn (A, B, C, D)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="qType"
                  checked={questionType === 'true_false'}
                  onChange={() => setQuestionType('true_false')}
                  className="accent-emerald-500"
                />
                <span>Đúng / Sai</span>
              </label>
            </div>
          </div>

          {/* Options */}
          {questionType === 'multiple_choice' ? (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">
                Các phương án lựa chọn (Tích chọn tròn ở đáp án đúng)
              </label>
              {[
                { label: 'A', val: optionA, set: setOptionA, idx: 0 },
                { label: 'B', val: optionB, set: setOptionB, idx: 1 },
                { label: 'C', val: optionC, set: setOptionC, idx: 2 },
                { label: 'D', val: optionD, set: setOptionD, idx: 3 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOptionIndex(item.idx)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 transition ${
                      correctOptionIndex === item.idx
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                    title={`Chọn phương án ${item.label} là đáp án đúng`}
                  >
                    {item.label}
                  </button>
                  <input
                    type="text"
                    value={item.val}
                    onChange={(e) => item.set(e.target.value)}
                    placeholder={`Nội dung phương án ${item.label}...`}
                    className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                      correctOptionIndex === item.idx
                        ? 'border-emerald-500/80 bg-emerald-950/20'
                        : 'border-slate-700 focus:border-slate-500'
                    }`}
                  />
                  {correctOptionIndex === item.idx && (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                      Đáp án đúng
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">Chọn đáp án đúng cho khẳng định trên</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCorrectOptionIndex(0)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-center transition ${
                    correctOptionIndex === 0
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  ĐÚNG
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectOptionIndex(1)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-center transition ${
                    correctOptionIndex === 1
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  SAI
                </button>
              </div>
            </div>
          )}

          {/* Gợi ý ngắn để ôn lại (Yêu cầu trọng tâm của ảnh) */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Lightbulb className="w-4 h-4" />
              <span>Gợi ý ngắn để ôn lại (Rất quan trọng cho việc tự học) *</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Câu gợi ý súc tích 1-2 dòng giúp học sinh nhận ra ngay kiến thức cốt lõi khi làm sai.
            </p>
            <input
              type="text"
              value={reviewHint}
              onChange={(e) => setReviewHint(e.target.value)}
              placeholder="Ví dụ: Dao động càng nhanh -> Tần số càng lớn (Hz) -> Âm phát ra càng bổng (cao)."
              className="w-full bg-slate-950 border border-emerald-700/60 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400 placeholder:text-slate-600"
            />
          </div>

          {/* Giải thích chi tiết */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Giải thích vì sao đúng (tùy chọn)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Nêu rõ cơ chế hoặc quy luật vật lý giải thích cho đáp án đúng..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
            />
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Mức độ:</span>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold capitalize transition ${
                    difficulty === diff
                      ? 'bg-slate-800 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saveSuccess}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lưu Câu Hỏi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
