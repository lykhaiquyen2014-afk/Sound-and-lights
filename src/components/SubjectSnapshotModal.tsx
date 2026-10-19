import React, { useState, useEffect } from 'react';
import {
  Save,
  FolderOpen,
  X,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  FileText,
  Package,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { StudySubjectSnapshot, StudySubject } from '../types';
import {
  loadSubjectSnapshots,
  createSubjectSnapshot,
  restoreSubjectFromSnapshot,
  deleteSubjectSnapshot,
  renameSubjectSnapshot,
} from '../utils/studyStorage';

interface SubjectSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject: StudySubject;
  sourcesCount: number;
  onSnapshotRestored: (subjectId: string, message: string) => void;
}

export const SubjectSnapshotModal: React.FC<SubjectSnapshotModalProps> = ({
  isOpen,
  onClose,
  activeSubject,
  sourcesCount,
  onSnapshotRestored,
}) => {
  const [snapshots, setSnapshots] = useState<StudySubjectSnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'save' | 'list'>('save');

  // Form Lưu Snapshot mới
  const [saveName, setSaveName] = useState<string>('');
  const [saveNote, setSaveNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Trạng thái chỉnh sửa tên snapshot
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string>('');

  // Trạng thái xác nhận phục hồi snapshot
  const [confirmRestoreSnapshot, setConfirmRestoreSnapshot] = useState<StudySubjectSnapshot | null>(null);

  useEffect(() => {
    if (isOpen) {
      const list = loadSubjectSnapshots();
      setSnapshots(list);
      const defaultName = `Snapshot: ${activeSubject.title} (${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
      setSaveName(defaultName);
      setSaveNote('');
      setStatusMessage(null);
      setEditingSnapshotId(null);
      setConfirmRestoreSnapshot(null);
    }
  }, [isOpen, activeSubject]);

  if (!isOpen) return null;

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) {
      setStatusMessage({ text: 'Vui lòng nhập tên nhận diện cho bản lưu Snapshot!', type: 'error' });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const res = createSubjectSnapshot({
        subjectId: activeSubject.id,
        snapshotName: saveName.trim(),
        note: saveNote.trim() || undefined,
      });

      setIsSaving(false);
      if (res.success && res.snapshot) {
        const updatedList = loadSubjectSnapshots();
        setSnapshots(updatedList);
        setStatusMessage({ text: res.message, type: 'success' });
        setActiveTab('list');
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    }, 250);
  };

  const handleStartEditing = (s: StudySubjectSnapshot) => {
    setEditingSnapshotId(s.id);
    setEditingName(s.name);
    setEditingNote(s.note || '');
  };

  const handleSaveRename = (snapshotId: string) => {
    if (!editingName.trim()) return;
    const updated = renameSubjectSnapshot(snapshotId, editingName.trim(), editingNote.trim());
    setSnapshots(updated);
    setEditingSnapshotId(null);
    setStatusMessage({ text: 'Đã cập nhật tên bản lưu thành công!', type: 'success' });
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    const updated = deleteSubjectSnapshot(snapshotId);
    setSnapshots(updated);
    setStatusMessage({ text: 'Đã xóa bản lưu snapshot thành công.', type: 'info' });
  };

  const handleRestoreSnapshot = (s: StudySubjectSnapshot) => {
    const res = restoreSubjectFromSnapshot(s.id);
    if (res.success && res.subjectId) {
      onSnapshotRestored(res.subjectId, res.message);
      onClose();
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Lưu & Mở Bản Snapshot Môn Học</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Local Storage
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Lưu toàn bộ môn học, bài viết, flashcards & đề cương thành bản sao dự phòng hoặc mở lại bất kỳ lúc nào
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'save'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>1. Lưu Bản Sao (Tạo Snapshot Mới)</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'list'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>2. Danh Sách Bản Lưu & Mở Ra ({snapshots.length})</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/80 border border-rose-700/60 text-rose-300'
                : 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'save' && (
            <div className="space-y-5">
              {/* Card thông tin môn hiện tại sẽ được lưu */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Môn học đang chọn để lưu snapshot:</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {activeSubject.gradeLevel || 'Môn học'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-100">{activeSubject.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{activeSubject.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Số bài học / tài liệu:</span>
                    <strong className="text-cyan-300 font-bold">{sourcesCount} bài</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Dữ liệu đi kèm:</span>
                    <strong className="text-emerald-300 font-bold">Summary + Key Points</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Gói học tập:</span>
                    <strong className="text-purple-300 font-bold">Study Packs 5-in-1</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Thẻ ghi nhớ:</span>
                    <strong className="text-amber-300 font-bold">Flashcard Bank</strong>
                  </div>
                </div>
              </div>

              {/* Form đặt tên snapshot */}
              <form onSubmit={handleSaveSnapshot} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Tên bản lưu Snapshot <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Ví dụ: Ôn thi giữa kỳ I - Âm học & Sóng âm (Bản hoàn chỉnh)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Gợi ý: Đặt tên kèm ngày giờ hoặc mốc ôn tập để dễ phân biệt khi mở lại sau này.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Ghi chú bản lưu (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={saveNote}
                    onChange={(e) => setSaveNote(e.target.value)}
                    placeholder="Ví dụ: Đã tóm tắt đủ 5 bài học và tạo 15 flashcards ghi nhớ công thức sóng âm..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{isSaving ? 'Đang Lưu Snapshot...' : 'Lưu Bản Sao Snapshot Ngay'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              {snapshots.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 p-6 space-y-3">
                  <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">Chưa có bản Snapshot nào được lưu</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Em có thể bấm vào tab "Lưu Bản Sao (Tạo Snapshot Mới)" ở trên để lưu lại trạng thái trọn vẹn của môn học hiện tại nhé!
                  </p>
                  <button
                    onClick={() => setActiveTab('save')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Snapshot Đầu Tiên</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Tìm thấy <strong>{snapshots.length}</strong> bản snapshot lưu trong Local Storage:</span>
                    <span>Bấm "Mở Bản Lưu" để tải lại toàn bộ nội dung</span>
                  </div>

                  {snapshots.map((item) => {
                    const isEditing = editingSnapshotId === item.id;
                    const dateStr = new Date(item.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3"
                      >
                        {isEditing ? (
                          <div className="space-y-2.5">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full bg-slate-900 border border-cyan-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100"
                              placeholder="Tên mới của snapshot"
                            />
                            <input
                              type="text"
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                              placeholder="Ghi chú mới (tùy chọn)"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingSnapshotId(null)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSaveRename(item.id)}
                                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs"
                              >
                                Lưu Thay Đổi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-100">{item.name}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                                  {item.subject?.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{dateStr}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-cyan-400" />
                                  <span>{item.sources?.length || 0} bài học</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3 text-purple-400" />
                                  <span>{item.studyPacks?.length || 0} study pack</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  <span>{item.flashcards?.length || 0} flashcard</span>
                                </span>
                              </div>
                              {item.note && (
                                <p className="text-xs text-slate-400 italic">“{item.note}”</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleStartEditing(item)}
                                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                                title="Đổi tên hoặc ghi chú"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSnapshot(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                                title="Xóa snapshot này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmRestoreSnapshot(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-slate-950" />
                                <span>Mở Bản Lưu</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal xác nhận mở / khôi phục */}
        {confirmRestoreSnapshot && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Xác Nhận Mở Bản Lưu Snapshot</h3>
                  <p className="text-xs text-slate-400">Bạn chuẩn bị khôi phục dữ liệu môn học</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-cyan-300">{confirmRestoreSnapshot.name}</div>
                <div className="text-slate-400">
                  Môn học: <strong className="text-slate-200">{confirmRestoreSnapshot.subject.title}</strong>
                </div>
                <div className="text-slate-400">
                  Bao gồm: {confirmRestoreSnapshot.sources.length} bài học, {confirmRestoreSnapshot.studyPacks?.length || 0} study pack, {confirmRestoreSnapshot.flashcards?.length || 0} flashcards.
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Khi mở bản lưu này, toàn bộ tài liệu và bài học của môn học tương ứng trong Local Storage sẽ được cập nhật đồng bộ về trạng thái của bản Snapshot đã lưu.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmRestoreSnapshot(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRestoreSnapshot(confirmRestoreSnapshot);
                    setConfirmRestoreSnapshot(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-slate-950" />
                  <span>Xác Nhận Mở Bản Lưu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Lưu trữ 100% trên Local Storage máy của bạn</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
