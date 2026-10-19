import {
  StudySubject,
  StudySource,
  AiComprehensiveReview,
  AiSourceReview,
  AiQuizItem,
  StudyFlashcard,
  StudyPack,
  PracticeQuestion,
  QaSeedItem,
  QuizQuestion,
  QuizSession,
  QuizDiagnosticReport,
  StudySubjectSnapshot,
  StudyPackVersion,
  LessonChatMessage,
  FlashcardVersion,
  AiMentorChatSession,
  QuizChatMessage,
  ChatMessage,
} from '../types';

export const SUBJECTS_KEY = 'school_study_subjects_v1';
export const SOURCES_KEY = 'school_study_sources_v1';
export const ALIAS_SOURCES_KEY = 'study_sources';
export const ALIAS_SUBJECTS_KEY = 'study_subjects';
export const STORAGE_TIMESTAMP_KEY = 'study_storage_last_saved';
export const AI_REVIEWS_STORAGE_KEY = 'study_ai_reviews_v1';
export const FLASHCARDS_STORAGE_KEY = 'school_study_flashcards_v1';
export const STUDY_PACKS_STORAGE_KEY = 'school_study_packs_v1';
export const QUIZ_HISTORY_KEY = 'school_quiz_history_v1';
export const QUIZ_MISTAKES_KEY = 'school_quiz_mistakes_v1';
export const CUSTOM_QUIZ_STORAGE_KEY = 'school_custom_quiz_questions_v1';
export const SUBJECT_SNAPSHOTS_KEY = 'school_subject_snapshots_v1';
export const LESSON_CHATS_STORAGE_KEY = 'school_lesson_chats_v1';
export const FLASHCARD_VERSIONS_KEY = 'school_flashcard_versions_v1';
export const FLASHCARD_CHATS_KEY = 'school_flashcard_chats_v1';
export const QUIZ_CHATS_KEY = 'school_quiz_chats_v1';
export const AI_MENTOR_SESSIONS_KEY = 'school_ai_mentor_sessions_v1';
export const AI_MENTOR_ACTIVE_SESSION_KEY = 'school_ai_mentor_active_id_v1';


export const DEFAULT_SUBJECTS: StudySubject[] = [
  {
    id: 'subj-sound',
    title: 'Vật lý: Âm học & Sóng âm trong đời sống',
    gradeLevel: 'Lớp 7 & Lớp 10',
    description: 'Nghiên cứu về nguồn âm, tần số (Hz), độ to (dB), hiện tượng phản xạ âm và ô nhiễm tiếng ồn.',
    color: 'cyan',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'subj-light',
    title: 'Vật lý: Quang học, Khúc xạ & Tán sắc ánh sáng',
    gradeLevel: 'Lớp 9 & Lớp 11',
    description: 'Khám phá định luật khúc xạ Snell, phản xạ toàn phần trong cáp quang và bản chất các màu sắc.',
    color: 'amber',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'subj-health',
    title: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    gradeLevel: 'Khoa học thường thức',
    description: 'Quy tắc 20-20-20 khi học bài, độ rọi bàn học (Lux) chống cận thị và tác hại ánh sáng xanh ban đêm.',
    color: 'emerald',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'subj-thunder',
    title: 'KHTN: Hiện tượng sấm sét & Tốc độ truyền âm',
    gradeLevel: 'Khám phá tự nhiên',
    description: 'Ứng dụng sự chênh lệch giữa tốc độ ánh sáng (300.000 km/s) và tốc độ âm thanh (343 m/s) để đo khoảng cách bão giông.',
    color: 'indigo',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const DEFAULT_SOURCES: StudySource[] = [
  {
    id: 'src-1',
    subjectId: 'subj-sound',
    type: 'text',
    title: 'Ghi chép bài học: Khái niệm tần số và ngưỡng nghe tai người',
    content: `1. Khái niệm tần số: Là số dao động trong một giây, đơn vị là Hertz (Hz).
- Âm có tần số càng lớn thì nghe càng bổng (cao).
- Âm có tần số càng nhỏ thì nghe càng trầm (thấp).

2. Giới hạn thính giác người:
- Tai người bình thường nghe được các âm từ 20 Hz đến 20.000 Hz.
- Dưới 20 Hz gọi là Hạ âm (voi, cá voi dùng để liên lạc xa).
- Trên 20.000 Hz gọi là Siêu âm (dơi dùng để định vị con mồi, bác sĩ dùng để siêu âm thai nhi).

3. Chú ý bảo vệ tai:
- Tiếng ồn liên tục trên 85 dBA (tiếng xe cộ đông đúc, mở tai nghe quá lớn) gây tổn thương vĩnh viễn màng nhĩ và tế bào lông tai trong.`,
    note: 'Kiến thức trọng tâm kiểm tra học kỳ 1 môn Vật lý.',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['Định nghĩa', 'Ghi nhớ', 'Kiểm tra'],
    summary: 'Tần số là số dao động trong 1 giây (đơn vị Hz). Tai người bình thường cảm thụ được âm thanh từ 20 Hz đến 20.000 Hz, dưới ngưỡng này là hạ âm và trên là siêu âm. Cần hạn chế tiếng ồn trên 85 dBA để tránh suy giảm thính lực vĩnh viễn.',
    keyPoints: [
      'Tần số (Hz) quyết định độ cao của âm: Tần số càng lớn âm càng bổng (cao), tần số càng nhỏ âm càng trầm (thấp).',
      'Giới hạn nghe của tai người: Dao động từ 20 Hz đến 20.000 Hz.',
      'Hạ âm (<20 Hz) và Siêu âm (>20.000 Hz): Con người không nghe thấy nhưng các loài vật (voi, dơi, cá voi) và thiết bị y tế ứng dụng rất phổ biến.',
      'Ngưỡng an toàn bảo vệ tai: Mức âm lượng trên 85 dBA kéo dài gây tổn thương không thể hồi phục cho tế bào lông trong ốc tai.'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'src-2',
    subjectId: 'subj-sound',
    type: 'image',
    title: 'Sơ đồ minh họa: Cấu tạo tai người và đường đi sóng âm',
    content: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    note: 'Vành tai hứng sóng âm -> Ống tai dẫn truyền -> Màng nhĩ rung động -> Chuỗi xương tai khuếch đại -> Ốc tai cảm thụ tín hiệu gửi về não.',
    createdAt: Date.now() - 86400000 * 1.5,
    tags: ['Sơ đồ', 'Hình vẽ', 'Sinh học'],
    summary: 'Sơ đồ giải thích quá trình thu nhận và chuyển đổi cơ học của sóng âm qua 3 phần: Tai ngoài (hứng sóng), tai giữa (khuếch đại rung động qua màng nhĩ và chuỗi xương búa - đe - bàn đạp) và tai trong (ốc tai sinh xung thần kinh gửi lên não).',
    keyPoints: [
      'Đường đi của âm thanh: Vành tai hứng âm -> Ống tai -> Rung màng nhĩ -> Chuỗi xương tai -> Dịch ốc tai -> Não bộ.',
      'Cơ chế khuếch đại cơ học: Chuỗi 3 xương tai nhỏ nhất cơ thể giúp nhân lực rung động lên hơn 20 lần trước khi vào dịch tai trong.',
      'Chức năng ốc tai: Tế bào lông cảm thụ dao động cơ học và chuyển hóa thành xung điện sinh học truyền theo dây thần kinh thính giác.'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'src-3',
    subjectId: 'subj-sound',
    type: 'url',
    title: 'Trang thí nghiệm vật lý ảo: Mô phỏng sóng âm và giao thoa PhET Colorado',
    content: 'https://phet.colorado.edu/vi/simulations/sound-waves',
    url: 'https://phet.colorado.edu/vi/simulations/sound-waves',
    note: 'Trang web thí nghiệm ảo trực quan của Đại học Colorado rất dễ làm thử, giúp xem chuyển động của các phân tử không khí khi âm thanh truyền qua.',
    createdAt: Date.now() - 86400000 * 1,
    tags: ['Thí nghiệm ảo', 'PhET', 'Thực hành'],
    summary: 'Mô phỏng tương tác giúp học sinh quan sát trực quan sự nén giãn tuần hoàn của các phân tử không khí khi sóng âm truyền qua và hiện tượng giao thoa sóng khi có hai loa cùng phát âm thanh.',
    keyPoints: [
      'Bản chất sóng âm trong không khí: Là sóng dọc, lan truyền qua các vùng không khí nén và giãn nối tiếp nhau.',
      'Môi trường truyền âm: Các phân tử chỉ dao động quanh vị trí cân bằng, không chuyển động tịnh tiến theo sóng.',
      'Hiện tượng giao thoa sóng âm: Khi hai nguồn âm kết hợp gặp nhau, tạo ra các vùng âm thanh to hơn (cùng pha) hoặc nhỏ đi/triệt tiêu (ngược pha).'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'src-4',
    subjectId: 'subj-light',
    type: 'text',
    title: 'Tóm tắt công thức Định luật khúc xạ ánh sáng (Định luật Snell)',
    content: `Khi tia sáng truyền xiên góc từ môi trường trong suốt này sang môi trường trong suốt khác, tại mặt phân cách xảy ra hiện tượng khúc xạ ánh sáng.

Định luật Snell:
  n1 * sin(i) = n2 * sin(r)

Trong đó:
- n1: Chiết suất môi trường chứa tia tới.
- n2: Chiết suất môi trường chứa tia khúc xạ.
- i: Góc tới (hợp bởi tia tới và pháp tuyến).
- r: Góc khúc xạ (hợp bởi tia khúc xạ và pháp tuyến).

Đặc biệt: Khi ánh sáng truyền từ môi trường có chiết suất lớn sang môi trường có chiết suất nhỏ (n1 > n2), nếu góc tới i >= góc tới hạn θc (với sin θc = n2 / n1) thì toàn bộ chùm sáng bị phản xạ lại môi trường cũ. Đây gọi là hiện tượng PHẢN XẠ TOÀN PHẦN (ứng dụng trong cáp quang viễn thông).`,
    note: 'Lưu ý nhớ điều kiện để có phản xạ toàn phần: n1 > n2 và góc tới i >= i_gh.',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['Công thức', 'Khúc xạ', 'Cáp quang'],
    summary: 'Khi truyền xiên góc giữa hai môi trường trong suốt khác nhau, tia sáng bị lệch hướng theo định luật Snell: n1·sin(i) = n2·sin(r). Nếu đi từ môi trường chiết quang hơn sang kém hơn với góc tới đủ lớn, toàn bộ tia sáng sẽ bị phản xạ toàn phần.',
    keyPoints: [
      'Công thức định luật Snell: n1 · sin(i) = n2 · sin(r), phản ánh sự thay đổi vận tốc của ánh sáng khi đổi môi trường.',
      'Chiết suất tỉ đối: Khi ánh sáng đi từ không khí (n≈1) vào nước (n≈1,33) hay thủy tinh (n≈1,5), góc khúc xạ luôn nhỏ hơn góc tới (r < i).',
      'Điều kiện phản xạ toàn phần: Ánh sáng phải đi từ môi trường có n1 > n2 và góc tới i ≥ góc tới hạn θc (sin θc = n2/n1).',
      'Ứng dụng then chốt: Sợi quang trong mạng Internet xuyên lục địa giam giữ tia sáng bằng phản xạ toàn phần liên tục bên trong lõi thủy tinh.'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'src-5',
    subjectId: 'subj-light',
    type: 'image',
    title: 'Hình ảnh: Lăng kính tán sắc chùm ánh sáng trắng thành 7 sắc cầu vồng',
    content: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
    note: 'Thí nghiệm tán sắc của nhà bác học Isaac Newton năm 1666. Ánh sáng đỏ lệch ít nhất, ánh sáng tím lệch nhiều nhất do chiết suất của thủy tinh đối với ánh sáng tím lớn hơn đối với ánh sáng đỏ.',
    createdAt: Date.now() - 86400000 * 1.2,
    tags: ['Newton', 'Tán sắc', 'Lăng kính'],
    summary: 'Thí nghiệm kinh điển của Isaac Newton chứng minh ánh sáng trắng Mặt Trời là tập hợp vô số ánh sáng đơn sắc từ đỏ đến tím. Khi qua lăng kính thủy tinh, do chiết suất khác nhau theo bước sóng nên các tia màu bị bẻ cong lệch góc khác nhau.',
    keyPoints: [
      'Bản chất ánh sáng trắng: Là chùm sáng phức tạp gồm vô số ánh sáng đơn sắc có màu biến thiên liên tục từ đỏ đến tím.',
      'Quy luật lệch góc: Tia đỏ bị lệch ít nhất, tia tím bị lệch nhiều nhất (n_tím > n_đỏ).',
      'Giải thích hiện tượng tự nhiên: Cầu vồng sau cơn mưa hình thành do hàng triệu giọt nước li ti đóng vai trò như các lăng kính tự nhiên tán sắc ánh nắng.'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 1.2,
  },
  {
    id: 'src-6',
    subjectId: 'subj-health',
    type: 'text',
    title: 'Bí quyết bảo vệ mắt học đường: Áp dụng quy tắc 20-20-20',
    content: `Quy tắc 20 - 20 - 20 được khuyến nghị bởi Hiệp hội Nhãn khoa Hoa Kỳ (AOA):
- Cứ sau mỗi 20 PHÚT ngồi học bài hoặc nhìn màn hình máy tính/điện thoại:
- Hãy tạm dừng và phóng tầm mắt nhìn ra xa ít nhất 20 FEET (~ 6 mét, ví dụ nhìn qua cửa sổ ra hàng cây xanh).
- Thư giãn mắt trong ít nhất 20 GIÂY và chớp mắt đều đặn.

Lý do: Khi nhìn gần liên tục, cơ thể mi trong mắt bị gồng cứng gây nhức mỏi, khô giác mạc và tăng độ cận thị. Nhìn xa 6m giúp cơ thể mi thư giãn 100%.`,
    note: 'Mẹo học tập hàng ngày cho học sinh.',
    createdAt: Date.now() - 86400000 * 0.8,
    tags: ['Bảo vệ mắt', 'Quy tắc 20-20-20', 'Thói quen tốt'],
    summary: 'Quy tắc 20-20-20 (cứ 20 phút nhìn gần thì nhìn ra xa 6 mét trong 20 giây) giúp cơ thể mi của mắt thư giãn hoàn toàn, giảm căng thẳng thị giác và ngăn ngừa nguy cơ tăng độ cận thị học đường.',
    keyPoints: [
      'Cơ chế điều tiết mắt: Khi nhìn gần <30cm, thể mi co bóp liên tục làm phồng thủy tinh thể gây mỏi cơ mắt.',
      'Khoảng cách 20 feet (~6m): Ở cự ly này, các tia sáng đi vào mắt gần như song song, cơ thể mi giãn tối đa giúp mắt nghỉ ngơi.',
      'Chớp mắt đều đặn: Tránh tình trạng nhìn màn hình chăm chú làm giảm tần số chớp mắt, gây khô và rát giác mạc.',
      'Độ rọi bàn học: Cần đảm bảo đèn học đạt 300 - 500 Lux, không đặt màn hình quá sáng so với ánh sáng phòng.'
    ],
    summaryGeneratedAt: Date.now() - 86400000 * 0.8,
  },
];

export const loadStudySubjects = (): StudySubject[] => {
  try {
    let raw = localStorage.getItem(SUBJECTS_KEY) || localStorage.getItem(ALIAS_SUBJECTS_KEY);
    if (!raw) {
      // Khởi tạo ghi ngay vào localStorage ngay lần đầu truy cập
      const defaultStr = JSON.stringify(DEFAULT_SUBJECTS);
      try {
        localStorage.setItem(SUBJECTS_KEY, defaultStr);
        localStorage.setItem(ALIAS_SUBJECTS_KEY, defaultStr);
      } catch (err) {
        console.warn('Không thể khởi tạo subjects vào localStorage:', err);
      }
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch (e) {
    console.warn('Lỗi đọc subjects từ localStorage:', e);
    return DEFAULT_SUBJECTS;
  }
};

export const saveStudySubjects = (subjects: StudySubject[]): { success: boolean; error?: string } => {
  try {
    const dataStr = JSON.stringify(subjects);
    localStorage.setItem(SUBJECTS_KEY, dataStr);
    localStorage.setItem(ALIAS_SUBJECTS_KEY, dataStr);
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
    return { success: true };
  } catch (e: any) {
    console.error('Lỗi lưu study subjects vào localStorage:', e);
    return { success: false, error: e?.message || 'Không thể lưu vào localStorage' };
  }
};

export const createSmartSummaryAndKeyPoints = (
  title: string,
  content: string,
  subjectTitle?: string
): { summary: string; keyPoints: string[] } => {
  const t = (title || 'Bài học').trim();
  const c = (content || '').trim();
  const tLower = t.toLowerCase();
  const cLower = c.toLowerCase();

  let summary = `Bài học "${t}" thuộc môn ${subjectTitle || 'Vật lý & KHTN'}, cung cấp kiến thức thực nghiệm khoa học chuẩn mực và các ứng dụng đời sống thiết thực.`;
  const keyPoints: string[] = [];

  if (tLower.includes('chống ồn') || tLower.includes('anc') || cLower.includes('ngược pha') || cLower.includes('anti-noise')) {
    summary = 'Công nghệ chống ồn chủ động (ANC) vận dụng hiện tượng giao thoa sóng triệt tiêu, phát ra sóng âm ngược pha 180° để triệt tiêu tiếng ồn môi trường.';
    keyPoints.push('Nguyên lý cốt lõi: Giao thoa triệt tiêu khi hai sóng cùng tần số có độ lệch pha là số lẻ lần số π (ngược pha 180°).');
    keyPoints.push('Cơ chế DSP: Mic thu tiếng ồn bên ngoài, vi xử lý tạo ra sóng âm đối lập (Anti-noise) với độ trễ cực nhỏ.');
    keyPoints.push('Bảo vệ thính giác: Giảm đáng kể tiếng ồn môi trường mà không cần bật âm lượng nghe nhạc quá to trên 85 dBA.');
    keyPoints.push('Ứng dụng: Tai nghe không dây cao cấp, cabin máy bay, phòng thu âm chuyên nghiệp.');
  } else if (tLower.includes('rayleigh') || tLower.includes('màu xanh') || tLower.includes('hoàng hôn') || cLower.includes('bước sóng')) {
    summary = 'Định luật tán xạ Rayleigh (I ~ 1/λ⁴) giải thích vì sao bầu trời ban ngày có màu xanh lam và Mặt Trời hoàng hôn lại có màu đỏ cam rực rỡ.';
    keyPoints.push('Định luật Rayleigh: Cường độ tán xạ tỉ lệ nghịch với lũy thừa bậc 4 của bước sóng (I ~ 1/λ⁴).');
    keyPoints.push('Bầu trời ban ngày: Ánh sáng lam bước sóng ngắn bị tán xạ mạnh gấp ~10 lần ánh sáng đỏ, tỏa khắp bầu khí quyển.');
    keyPoints.push('Mặt Trời hoàng hôn: Đường đi tia sáng qua khí quyển dày gấp ~10 lần, ánh sáng xanh bị tán xạ hết, chỉ tia đỏ cam bước sóng dài xuyên qua.');
    keyPoints.push('Ứng dụng quan sát: Giúp dự báo độ trong của bầu khí quyển và giải thích hiện tượng quang học tự nhiên.');
  } else if (tLower.includes('tần số') || tLower.includes('âm') || cLower.includes('hz')) {
    summary = 'Tần số là số dao động trong 1 giây (Hz). Tai người bình thường nghe được từ 20 Hz đến 20.000 Hz, dưới ngưỡng là hạ âm và trên là siêu âm.';
    keyPoints.push('Tần số (Hz) quyết định độ cao của âm: Tần số lớn âm nghe bổng (thanh), tần số nhỏ âm nghe trầm.');
    keyPoints.push('Dải thính giác người: Tai bình thường cảm nhận từ 20 Hz đến 20.000 Hz; không nghe được hạ âm và siêu âm.');
    keyPoints.push('Ngưỡng an toàn thính lực: Mức âm lượng trên 85 dBA kéo dài gây tổn thương vĩnh viễn tế bào lông trong ốc tai.');
    keyPoints.push('Môi trường truyền âm: Vận tốc v_rắn > v_lỏng > v_khí; sóng âm tuyệt đối không truyền được trong chân không.');
  } else if (tLower.includes('khúc xạ') || tLower.includes('snell') || tLower.includes('quang') || tLower.includes('ánh sáng')) {
    summary = 'Khi truyền xiên góc giữa hai môi trường trong suốt khác nhau, tia sáng bị lệch hướng theo định luật Snell: n1·sin(i) = n2·sin(r). Có thể xảy ra phản xạ toàn phần khi n1 > n2.';
    keyPoints.push('Định luật Snell: n1 · sin(i) = n2 · sin(r), phản ánh sự thay đổi vận tốc của tia sáng khi đổi môi trường.');
    keyPoints.push('Điều kiện phản xạ toàn phần: Đi từ môi trường chiết quang hơn sang kém hơn (n1 > n2) và góc tới i ≥ góc tới hạn θc (sin θc = n2/n1).');
    keyPoints.push('Ứng dụng công nghệ: Sợi cáp quang truyền dữ liệu Internet xuyên đại dương bằng phản xạ toàn phần bên trong lõi thủy tinh.');
  } else if (tLower.includes('mắt') || tLower.includes('thị giác') || tLower.includes('20-20-20')) {
    summary = 'Quy tắc 20-20-20 (cứ 20 phút nhìn gần thì nhìn ra xa 6 mét trong 20 giây) giúp cơ thể mi của mắt thư giãn hoàn toàn, giảm căng thẳng thị giác và chống cận thị.';
    keyPoints.push('Cơ chế điều tiết mắt: Khi nhìn gần liên tục, cơ thể mi bị co thắt gây mỏi và đẩy nhanh tiến trình cận thị.');
    keyPoints.push('Khoảng cách 20 feet (~6m): Tia sáng đi vào mắt song song, cơ thể mi thư giãn 100% không cần điều tiết.');
    keyPoints.push('Độ rọi học đường: Đèn bàn học cần đạt độ rọi 300 - 500 Lux, ánh sáng tự nhiên, không chói lóa và không rung nháy.');
    keyPoints.push('Tác hại ánh sáng xanh: Bước sóng 415 - 455 nm ức chế tiết melatonin, gây khó ngủ và thoái hóa điểm vàng.');
  } else if (tLower.includes('sấm') || tLower.includes('sét') || tLower.includes('khoảng cách')) {
    summary = 'Do ánh sáng truyền tức thời (300.000 km/s) còn âm thanh truyền 343 m/s (~1 km sau 3 giây), học sinh có thể lấy số giây đếm được giữa chớp và sấm chia cho 3 để tính cự ly cơn sét.';
    keyPoints.push('Chênh lệch vận tốc: c(ánh sáng) ≈ 300.000 km/s nhanh gấp gần 1 triệu lần v(âm thanh) ≈ 343 m/s.');
    keyPoints.push('Quy tắc nhẩm 3 giây = 1 km: Lấy số giây chênh lệch chia 3 ra cự ly cơn sét (ví dụ 6s = 2 km, 9s = 3 km).');
    keyPoints.push('Quy tắc an toàn 30/30: Nếu đếm < 30 giây (dưới 10 km), phải vào nơi trú ẩn kiên cố ngay lập tức.');
  } else {
    summary = c.length > 180 ? c.slice(0, 180) + '...' : c || `Tóm tắt nội dung bài học "${t}".`;
    keyPoints.push(`Khái niệm cốt lõi: Nắm vững định nghĩa và bản chất khoa học của ${t}.`);
    keyPoints.push(`Đơn vị & Quy chuẩn: Chú ý các đại lượng vật lý chuẩn trong hệ đo lường SI.`);
    keyPoints.push(`Ứng dụng đời sống: Hiện tượng có thể quan sát trực tiếp và ứng dụng trong thực tế thường ngày.`);
  }

  return { summary, keyPoints };
};

export const loadStudySources = (): StudySource[] => {
  try {
    let raw = localStorage.getItem(SOURCES_KEY) || localStorage.getItem(ALIAS_SOURCES_KEY);
    if (!raw) {
      // Khởi tạo ghi ngay vào localStorage ngay lần đầu truy cập
      const defaultStr = JSON.stringify(DEFAULT_SOURCES);
      try {
        localStorage.setItem(SOURCES_KEY, defaultStr);
        localStorage.setItem(ALIAS_SOURCES_KEY, defaultStr);
      } catch (err) {
        console.warn('Không thể khởi tạo sources vào localStorage:', err);
      }
      return DEFAULT_SOURCES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Bảo đảm 100% mọi bài học trong Local Storage đều có summary và keyPoints
      let needsSave = false;
      const verified = parsed.map((s: StudySource) => {
        const hasSummary = Boolean(s.summary && s.summary.trim().length > 10);
        const hasKeyPoints = Boolean(s.keyPoints && Array.isArray(s.keyPoints) && s.keyPoints.length > 0);
        if (!hasSummary || !hasKeyPoints) {
          needsSave = true;
          const gen = createSmartSummaryAndKeyPoints(s.title, s.content || s.note || '', '');
          return {
            ...s,
            summary: s.summary || gen.summary,
            keyPoints: (s.keyPoints && s.keyPoints.length > 0) ? s.keyPoints : gen.keyPoints,
            summaryGeneratedAt: s.summaryGeneratedAt || Date.now(),
          };
        }
        return s;
      });
      if (needsSave) {
        saveStudySources(verified);
      }
      return verified;
    }
    return DEFAULT_SOURCES;
  } catch (e) {
    console.warn('Lỗi đọc study sources từ localStorage:', e);
    return DEFAULT_SOURCES;
  }
};

export const saveStudySources = (sources: StudySource[]): { success: boolean; error?: string } => {
  try {
    const dataStr = JSON.stringify(sources);
    localStorage.setItem(SOURCES_KEY, dataStr);
    localStorage.setItem(ALIAS_SOURCES_KEY, dataStr);
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
    return { success: true };
  } catch (e: any) {
    console.error('Lỗi lưu study sources vào localStorage:', e);
    return { success: false, error: e?.message || 'Không thể lưu vào localStorage (Có thể do bộ nhớ đầy hoặc bị chặn)' };
  }
};

export const EXTRA_SAMPLE_LESSONS: StudySource[] = [
  {
    id: 'src-sample-anc',
    subjectId: 'subj-sound',
    type: 'text',
    title: 'Công nghệ Khử Ồn Chủ Động (ANC) & Hiện tượng Giao thoa Sóng Âm Ngược Pha',
    content: `1. Bản chất vật lý:
- Khử ồn chủ động (Active Noise Cancellation - ANC) hoạt động dựa trên nguyên lý GIAO THOA SÓNG ÂM TRIỆT TIÊU.
- Khi hai sóng âm có cùng tần số, cùng biên độ nhưng ngược pha nhau 180 độ (pha đối lập) gặp nhau tại cùng một điểm, chúng sẽ giao thoa và triệt tiêu lẫn nhau hoàn toàn (biên độ dao động tổng hợp = 0).

2. Cách tai nghe chống ồn hoạt động:
- Microphone thu tiếng ồn bên ngoài (ví dụ tiếng động cơ máy bay, tiếng xe buýt).
- Mạch vi xử lý DSP phân tích tức thì tần số và pha của sóng ồn.
- Loa tai nghe phát ra một sóng âm "ngược pha 180°" (Anti-noise) đập vào tai cùng lúc. Kết quả là tai người hầu như không nghe thấy tiếng ồn nền.

3. Ứng dụng đời sống:
- Tai nghe chống ồn bảo vệ thính giác khi đi máy bay, tàu hỏa hoặc học tập ở nơi đông người mà không cần bật âm lượng nhạc quá to.`,
    note: 'Hiện tượng giao thoa sóng triệt tiêu khi độ lệch pha Δφ = (2k + 1)π.',
    createdAt: Date.now() - 3600000,
    tags: ['Giao thoa sóng', 'Âm học', 'ANC', 'Công nghệ'],
    summary: 'Công nghệ ANC hoạt động bằng cách phát ra sóng âm đối pha 180 độ (anti-noise) có cùng tần số và biên độ với tiếng ồn môi trường, khiến hai sóng giao thoa và triệt tiêu lẫn nhau tại tai người nghe.',
    keyPoints: [
      'Nguyên lý vật lý cốt lõi: Giao thoa triệt tiêu khi hai sóng kết hợp ngược pha nhau 180° (độ lệch pha là số lẻ lần số π).',
      'Cơ chế xử lý DSP: Mic thu tiếng ồn ngoại cảnh, chip âm thanh tạo sóng ngược pha với độ trễ cực nhỏ mili-giây.',
      'Ứng dụng y học & đời sống: Giảm ô nhiễm tiếng ồn động cơ xe cộ, bảo vệ thính giác mà không cần tăng âm lượng phát nhạc.'
    ],
    summaryGeneratedAt: Date.now() - 3600000,
  },
  {
    id: 'src-sample-rayleigh',
    subjectId: 'subj-light',
    type: 'text',
    title: 'Tại Sao Bầu Trời Màu Xanh & Hoàng Hôn Màu Đỏ? (Tán Xạ Rayleigh)',
    content: `1. Hiện tượng tán xạ Rayleigh:
- Khi ánh sáng Mặt Trời (ánh sáng trắng chứa đủ 7 sắc cầu vồng) đi qua bầu khí quyển Trái Đất, nó va chạm với các phân tử nitơ và oxy.
- Định luật tán xạ Rayleigh phát biểu: Cường độ tán xạ tỉ lệ nghịch với lũy thừa bậc 4 của bước sóng: I ~ 1 / λ⁴.

2. Lý giải màu sắc bầu trời:
- Ban ngày: Ánh sáng xanh lam và tím có bước sóng rất ngắn (~400 - 450 nm) nên bị tán xạ mạnh gấp gần 10 lần so với ánh sáng đỏ (bước sóng dài ~700 nm). Ánh sáng xanh bị tán xạ tỏa ra khắp vòm trời, mắt người lại nhạy cảm với màu xanh hơn màu tím -> Bầu trời ban ngày có màu xanh biếc.
- Lúc hoàng hôn hoặc bình minh: Mặt Trời ở sát đường chân trời, ánh sáng phải đi qua tầng khí quyển dày gấp nhiều lần. Toàn bộ ánh sáng xanh lam bị tán xạ tán lạc ra ngoài hết trước khi đến mắt ta, chỉ còn lại các tia sáng có bước sóng dài (đỏ, cam, vàng) xuyên thẳng qua được -> Hoàng hôn có màu đỏ rực rỡ.`,
    note: 'Nhớ công thức cường độ tán xạ Rayleigh I ~ 1/λ^4 (bước sóng càng ngắn tán xạ càng mạnh).',
    createdAt: Date.now() - 7200000,
    tags: ['Quang học', 'Tán xạ Rayleigh', 'Màu sắc khí quyển', 'Thiên nhiên'],
    summary: 'Định luật tán xạ Rayleigh (cường độ I ~ 1/λ⁴) giải thích vì sao ánh sáng xanh lam có bước sóng ngắn bị tán xạ mạnh ra khắp bầu trời ban ngày, trong khi hoàng hôn ánh sáng đỏ bước sóng dài xuyên thẳng qua tầng khí quyển dày.',
    keyPoints: [
      'Định luật Rayleigh: Cường độ tán xạ tỉ lệ nghịch với lũy thừa bậc 4 của bước sóng (I ~ 1/λ⁴) đối với các hạt phân tử nhỏ hơn bước sóng.',
      'Bầu trời ban ngày: Ánh sáng xanh lam (λ ~ 450nm) tán xạ mạnh gấp ~10 lần ánh sáng đỏ (λ ~ 700nm), tỏa khắp vòm khí quyển.',
      'Mặt trời hoàng hôn: Đường đi tia sáng qua khí quyển dài gấp ~10 lần, ánh sáng xanh bị tán xạ tán lạc hết trước khi đến mắt, chỉ còn lại tia đỏ cam xuyên qua.'
    ],
    summaryGeneratedAt: Date.now() - 7200000,
  },
  {
    id: 'src-sample-lightning',
    subjectId: 'subj-thunder',
    type: 'text',
    title: 'Đo Khoảng Cách Cơn Dông Sấm Sét Bằng Quy Tắc 3 Giây',
    content: `1. Sự chênh lệch tốc độ:
- Vận tốc ánh sáng trong không khí: c ≈ 300.000 km/s (truyền đến mắt ta gần như tức thời).
- Vận tốc âm thanh trong không khí ở 20°C: v ≈ 343 m/s (chỉ khoảng 1/3 km mỗi giây).

2. Quy tắc đếm 3 giây xác định khoảng cách:
- Khi nhìn thấy tia chớp lóe lên, bắt đầu đếm số giây cho đến khi nghe thấy tiếng sấm rền:
  Khoảng cách (mét) = Số giây đếm được × 343 m
  Hoặc tính nhẩm nhanh: Cứ mỗi 3 GIÂY chênh lệch tương ứng khoảng 1 KILÔMÉT.
  Ví dụ: Đếm được 6 giây -> Cơn sét đánh cách ta khoảng 2 km!

3. Quy tắc an toàn 30/30 khi có giông sét:
- Nếu khoảng cách đếm được dưới 30 giây (dưới 10 km), phải tìm nơi trú ẩn trong nhà ngay lập tức. Không trú dưới gốc cây to, không cầm vật dụng kim loại ở bãi đất trống.`,
    note: 'Ứng dụng thực tế sống còn khi đi dã ngoại hoặc gặp trời mưa bão.',
    createdAt: Date.now() - 10800000,
    tags: ['Sấm sét', 'Tốc độ âm thanh', 'Kỹ năng an toàn', 'Vận tốc'],
    summary: 'Do ánh sáng truyền tức thời (300.000 km/s) còn âm thanh truyền 343 m/s (~1 km sau 3 giây), học sinh có thể lấy số giây đếm được giữa chớp và sấm chia cho 3 để tính nhanh khoảng cách cơn sét (km).',
    keyPoints: [
      'Chênh lệch vận tốc: c(ánh sáng) ≈ 300.000 km/s nhanh gấp gần 1 triệu lần v(âm thanh) ≈ 343 m/s.',
      'Quy tắc nhẩm 3 giây = 1 km: Lấy số giây chênh lệch chia 3 ra cự ly cơn sét (ví dụ 6s = 2 km, 9s = 3 km).',
      'Quy tắc an toàn 30/30: Nếu đếm < 30 giây (dưới 10 km), phải vào nơi trú ẩn kiên cố ngay lập tức.'
    ],
    summaryGeneratedAt: Date.now() - 10800000,
  }
];

export const SUBJECT_SUMMARIES_KEY = 'school_study_subject_summaries_v1';

export const loadSubjectSummaries = (): Record<string, { summary: string; keyPoints: string[]; generatedAt: number }> => {
  try {
    const raw = localStorage.getItem(SUBJECT_SUMMARIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const saveSubjectSummaryToStorage = (
  subjectId: string,
  summary: string,
  keyPoints: string[]
) => {
  try {
    const current = loadSubjectSummaries();
    current[subjectId] = {
      summary,
      keyPoints,
      generatedAt: Date.now(),
    };
    localStorage.setItem(SUBJECT_SUMMARIES_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Lỗi lưu subject summary vào localStorage:', e);
  }
};

export const updateSourceSummaryInStorage = (
  sourceId: string,
  summary: string,
  keyPoints: string[]
): StudySource[] => {
  const current = loadStudySources();
  const updated = current.map((s) => {
    if (s.id === sourceId) {
      return {
        ...s,
        summary,
        keyPoints,
        summaryGeneratedAt: Date.now(),
      };
    }
    return s;
  });
  saveStudySources(updated);
  return updated;
};

export const batchUpdateSourceSummariesInStorage = (
  updates: Array<{ id: string; summary: string; keyPoints: string[] }>
): StudySource[] => {
  const current = loadStudySources();
  const updateMap = new Map(updates.map((u) => [u.id, u]));
  const updated = current.map((s) => {
    const u = updateMap.get(s.id);
    if (u) {
      return {
        ...s,
        summary: u.summary,
        keyPoints: u.keyPoints,
        summaryGeneratedAt: Date.now(),
      };
    }
    return s;
  });
  saveStudySources(updated);
  return updated;
};

export const ensureAllSourcesHaveSummaryAndKeyPoints = (): { updatedSources: StudySource[]; countUpdated: number } => {
  const current = loadStudySources();
  let countUpdated = 0;
  const updated = current.map((s) => {
    const hasSummary = Boolean(s.summary && s.summary.trim().length > 10);
    const hasKeyPoints = Boolean(s.keyPoints && Array.isArray(s.keyPoints) && s.keyPoints.length > 0);
    if (!hasSummary || !hasKeyPoints) {
      countUpdated++;
      const gen = createSmartSummaryAndKeyPoints(s.title, s.content || s.note || '', '');
      return {
        ...s,
        summary: s.summary || gen.summary,
        keyPoints: (s.keyPoints && s.keyPoints.length > 0) ? s.keyPoints : gen.keyPoints,
        summaryGeneratedAt: s.summaryGeneratedAt || Date.now(),
      };
    }
    return s;
  });

  if (countUpdated > 0) {
    saveStudySources(updated);
  }
  return { updatedSources: updated, countUpdated };
};

export const seedSampleLessons = (): StudySource[] => {
  const current = loadStudySources();
  const existingTitles = new Set(current.map(s => s.title));
  const toAdd = [...DEFAULT_SOURCES, ...EXTRA_SAMPLE_LESSONS].filter(s => !existingTitles.has(s.title));
  const updated = [...toAdd, ...current];
  saveStudySources(updated);
  return updated;
};

// Kiểm tra chẩn đoán trạng thái Local Storage trực tiếp trên trình duyệt
export interface StorageDiagnostics {
  isAvailable: boolean;
  sourcesCount: number;
  subjectsCount: number;
  snapshotsCount: number;
  flashcardsCount: number;
  flashcardVersionsCount: number;
  studyPacksCount: number;
  studyPackVersionsCount: number;
  lessonChatsCount: number;
  flashcardChatsCount: number;
  quizChatsCount: number;
  aiMentorSessionsCount: number;
  sourcesSizeKB: number;
  subjectsSizeKB: number;
  primaryKey: string;
  aliasKey: string;
  lastSaved: string;
  rawJsonPreview: string;
  error?: string;
}

export const getStorageDiagnostics = (): StorageDiagnostics => {
  try {
    const testKey = '__test_ls_probe__';
    localStorage.setItem(testKey, '1');
    const isAvailable = localStorage.getItem(testKey) === '1';
    localStorage.removeItem(testKey);

    const sourcesRaw = localStorage.getItem(SOURCES_KEY) || localStorage.getItem(ALIAS_SOURCES_KEY) || '[]';
    const subjectsRaw = localStorage.getItem(SUBJECTS_KEY) || localStorage.getItem(ALIAS_SUBJECTS_KEY) || '[]';
    const snapshotsRaw = localStorage.getItem(SUBJECT_SNAPSHOTS_KEY) || '[]';
    const flashcardsRaw = localStorage.getItem(FLASHCARDS_STORAGE_KEY) || '[]';
    const flashcardVersionsRaw = localStorage.getItem(FLASHCARD_VERSIONS_KEY) || '[]';
    const studyPacksRaw = localStorage.getItem(STUDY_PACKS_STORAGE_KEY) || '[]';
    const lessonChatsRaw = localStorage.getItem(LESSON_CHATS_STORAGE_KEY) || '{}';
    const flashcardChatsRaw = localStorage.getItem(FLASHCARD_CHATS_KEY) || '{}';
    const quizChatsRaw = localStorage.getItem(QUIZ_CHATS_KEY) || '{}';
    const aiMentorSessionsRaw = localStorage.getItem(AI_MENTOR_SESSIONS_KEY) || '[]';
    const lastSaved = localStorage.getItem(STORAGE_TIMESTAMP_KEY) || 'Vừa xong';

    const sourcesParsed = JSON.parse(sourcesRaw);
    const subjectsParsed = JSON.parse(subjectsRaw);
    const snapshotsParsed = JSON.parse(snapshotsRaw);
    const flashcardsParsed = JSON.parse(flashcardsRaw);
    const flashcardVersionsParsed = JSON.parse(flashcardVersionsRaw);
    const studyPacksParsed = JSON.parse(studyPacksRaw);
    const lessonChatsParsed = JSON.parse(lessonChatsRaw);
    const flashcardChatsParsed = JSON.parse(flashcardChatsRaw);
    const quizChatsParsed = JSON.parse(quizChatsRaw);
    const aiMentorSessionsParsed = JSON.parse(aiMentorSessionsRaw);

    let versionsTotal = 0;
    if (Array.isArray(studyPacksParsed)) {
      studyPacksParsed.forEach((p: any) => {
        if (Array.isArray(p.versions)) {
          versionsTotal += p.versions.length;
        } else {
          versionsTotal += 1;
        }
      });
    }

    let totalChatMessages = 0;
    if (typeof lessonChatsParsed === 'object' && lessonChatsParsed !== null) {
      Object.values(lessonChatsParsed).forEach((arr: any) => {
        if (Array.isArray(arr)) totalChatMessages += arr.length;
      });
    }

    let totalFcChats = 0;
    if (typeof flashcardChatsParsed === 'object' && flashcardChatsParsed !== null) {
      Object.values(flashcardChatsParsed).forEach((arr: any) => {
        if (Array.isArray(arr)) totalFcChats += arr.length;
      });
    }

    let totalQuizChats = 0;
    if (typeof quizChatsParsed === 'object' && quizChatsParsed !== null) {
      Object.values(quizChatsParsed).forEach((arr: any) => {
        if (Array.isArray(arr)) totalQuizChats += arr.length;
      });
    }

    const sourcesBytes = new Blob([sourcesRaw]).size;
    const subjectsBytes = new Blob([subjectsRaw]).size;

    return {
      isAvailable,
      sourcesCount: Array.isArray(sourcesParsed) ? sourcesParsed.length : 0,
      subjectsCount: Array.isArray(subjectsParsed) ? subjectsParsed.length : 0,
      snapshotsCount: Array.isArray(snapshotsParsed) ? snapshotsParsed.length : 0,
      flashcardsCount: Array.isArray(flashcardsParsed) ? flashcardsParsed.length : 0,
      flashcardVersionsCount: Array.isArray(flashcardVersionsParsed) ? flashcardVersionsParsed.length : 0,
      studyPacksCount: Array.isArray(studyPacksParsed) ? studyPacksParsed.length : 0,
      studyPackVersionsCount: versionsTotal,
      lessonChatsCount: totalChatMessages,
      flashcardChatsCount: totalFcChats,
      quizChatsCount: totalQuizChats,
      aiMentorSessionsCount: Array.isArray(aiMentorSessionsParsed) ? aiMentorSessionsParsed.length : 0,
      sourcesSizeKB: Math.round((sourcesBytes / 1024) * 10) / 10,
      subjectsSizeKB: Math.round((subjectsBytes / 1024) * 10) / 10,
      primaryKey: SOURCES_KEY,
      aliasKey: ALIAS_SOURCES_KEY,
      lastSaved,
      rawJsonPreview: sourcesRaw,
    };
  } catch (e: any) {
    return {
      isAvailable: false,
      sourcesCount: 0,
      subjectsCount: 0,
      snapshotsCount: 0,
      flashcardsCount: 0,
      flashcardVersionsCount: 0,
      studyPacksCount: 0,
      studyPackVersionsCount: 0,
      lessonChatsCount: 0,
      flashcardChatsCount: 0,
      quizChatsCount: 0,
      aiMentorSessionsCount: 0,
      sourcesSizeKB: 0,
      subjectsSizeKB: 0,
      primaryKey: SOURCES_KEY,
      aliasKey: ALIAS_SOURCES_KEY,
      lastSaved: 'Không rõ',
      rawJsonPreview: '[]',
    };
  }
};


// Thử nghiệm trực tiếp đọc ghi
export const runStorageLiveTest = (): { success: boolean; message: string; timestamp: string } => {
  try {
    const probeKey = '__probe_test_' + Date.now();
    const probeVal = 'LiveTest-Success-' + Math.random().toString(36).substring(7);
    localStorage.setItem(probeKey, probeVal);
    const readBack = localStorage.getItem(probeKey);
    localStorage.removeItem(probeKey);

    if (readBack === probeVal) {
      return {
        success: true,
        message: 'Trình duyệt đã ghi và đọc lại dữ liệu từ Local Storage thành công 100%!',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      };
    } else {
      return {
        success: false,
        message: 'Dữ liệu đọc lại không khớp.',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Không thể ghi vào Local Storage: ${e?.message || 'Bị chặn quyền truy cập'}`,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };
  }
};

// ==========================================
// AI COMPREHENSION REVIEWS PERSISTENCE & SYNTHESIS
// ==========================================

export const loadStoredAiReviews = (): Record<string, AiComprehensiveReview> => {
  try {
    const raw = localStorage.getItem(AI_REVIEWS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.warn('Lỗi đọc AI reviews từ localStorage:', e);
    return {};
  }
};

export const saveAiReviewToStorage = (review: AiComprehensiveReview): boolean => {
  try {
    const existing = loadStoredAiReviews();
    existing[review.id] = review;
    localStorage.setItem(AI_REVIEWS_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Lỗi lưu AI review vào localStorage:', e);
    return false;
  }
};

export const clearAiReviewsFromStorage = (): boolean => {
  try {
    localStorage.removeItem(AI_REVIEWS_STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

// Intelligent baseline synthesis of what AI understands from current sources
export const generateSmartSynthesizedReview = (
  sources: StudySource[],
  subjects: StudySubject[],
  scope: 'all' | 'subject' | 'source',
  selectedId?: string
): AiComprehensiveReview => {
  const activeSources =
    scope === 'all'
      ? sources
      : scope === 'subject'
      ? sources.filter((s) => s.subjectId === selectedId)
      : sources.filter((s) => s.id === selectedId);

  const scopeTitle =
    scope === 'all'
      ? 'Toàn Bộ Kho Tri Thức Local Storage'
      : scope === 'subject'
      ? subjects.find((s) => s.id === selectedId)?.title || 'Chủ đề học tập'
      : activeSources[0]?.title || 'Bài học đơn lẻ';

  // Per source review extraction
  const sourceReviews: AiSourceReview[] = activeSources.map((source) => {
    const isSound = source.title.toLowerCase().includes('âm') || source.content.toLowerCase().includes('hz');
    const isLight = source.title.toLowerCase().includes('sáng') || source.content.toLowerCase().includes('khúc xạ');
    const isHealth = source.title.toLowerCase().includes('mắt') || source.title.toLowerCase().includes('20-20-20');

    let summary = source.summary || '';
    let coreConcepts: string[] = (source.keyPoints && source.keyPoints.length > 0) ? [...source.keyPoints] : [];
    let formulas: string[] = [];
    let apps: string[] = [];
    let takeaway = '';
    let advice = '';

    if (isSound) {
      if (!summary) {
        summary = `AI đã nhận diện bài học về bản chất dao động cơ học tạo ra sóng âm. Tần số quyết định độ cao của âm (Hz cao = âm bổng, Hz thấp = âm trầm). Con người có giới hạn thính giác sinh học 20 Hz - 20.000 Hz.`;
      }
      if (coreConcepts.length === 0) {
        coreConcepts = ['Dao động cơ học', 'Tần số sóng âm (Hz)', 'Ngưỡng nghe người (20 - 20.000 Hz)', 'Hạ âm & Siêu âm', 'Cường độ âm dBA'];
      }
      formulas = ['f = 1 / T (Tần số và chu kỳ)', 'v = λ · f (Vận tốc truyền sóng)', 'Ngưỡng an toàn: < 85 dBA'];
      apps = ['Máy siêu âm y tế chẩn đoán', 'Định vị hồi âm của loài dơi và cá heo', 'Tai nghe chống ồn chủ động (ANC)'];
      takeaway = 'Không nghe âm lượng quá 60% khi đeo tai nghe và bảo vệ thính lực trong môi trường > 85 dBA.';
      advice = 'Học sinh nên nhớ con số 20 Hz (dưới là hạ âm) và 20.000 Hz (trên là siêu âm) vì câu hỏi này rất thường xuất hiện trong các bài thi!';
    } else if (isLight) {
      if (!summary) {
        summary = `AI đã nắm được quy luật khúc xạ ánh sáng khi tia sáng đổi hướng tại mặt phân cách giữa hai môi trường trong suốt khác chiết suất. Đồng thời hiểu rõ hiện tượng phản xạ toàn phần và tán sắc quang học.`;
      }
      if (coreConcepts.length === 0) {
        coreConcepts = ['Khúc xạ ánh sáng', 'Định luật Snell', 'Chiết suất tuyệt đối & tỉ đối', 'Phản xạ toàn phần', 'Góc tới hạn', 'Tán sắc ánh sáng qua lăng kính'];
      }
      formulas = ['n₁ · sin(i) = n₂ · sin(r)', 'sin(θc) = n₂ / n₁ (với n₁ > n₂)', 'C = 300.000 km/s (Vận tốc ánh sáng)'];
      apps = ['Sợi quang viễn thông truyền Internet tốc độ cao', 'Kính cận, kính viễn và kính hiển vi', 'Giải thích hiện tượng cầu vồng sau mưa'];
      takeaway = 'Điều kiện phản xạ toàn phần: Ánh sáng phải truyền từ môi trường chiết quang hơn sang kém hơn và góc tới i ≥ góc tới hạn.';
      advice = 'Vẽ hình và phân biệt rõ góc tới i và góc khúc xạ r đều được tính so với ĐƯỜNG PHÁP TUYẾN, không phải so với mặt phân cách!';
    } else if (isHealth) {
      if (!summary) {
        summary = `AI hiểu được sinh lý điều tiết của mắt: khi nhìn gần quá 20 phút, cơ thể mi bị co thắt gây mỏi và đẩy nhanh tiến trình cận thị. Quy tắc 20-20-20 giúp mắt thư giãn hoàn toàn.`;
      }
      if (coreConcepts.length === 0) {
        coreConcepts = ['Cơ thể mi & thể thủy tinh', 'Quy tắc 20-20-20', 'Độ rọi bàn học (Lux)', 'Nhiệt độ màu ban đêm (Kelvin)', 'Ánh sáng xanh'];
      }
      formulas = ['Quy tắc 20 min - 20 feet (6m) - 20 s', 'Độ rọi tối thiểu học bài: 500 Lux', 'Ban đêm dùng đèn: < 3000K'];
      apps = ['Bố trí đèn học chống cận thị học đường', 'Bật chế độ Night Shift/Eye Comfort trên điện thoại', 'Nghỉ giải lao chủ động giữa các tiết học'];
      takeaway = 'Cứ 20 phút học nhìn gần hãy phóng tầm mắt ra xa 6 mét trong 20 giây.';
      advice = 'Hãy áp dụng ngay quy tắc này mỗi khi tự học tại nhà để giữ đôi mắt luôn sáng khỏe!';
    } else {
      if (!summary) {
        summary = `AI đã đọc và phân tích nội dung: "${source.title}". AI nhận diện đây là kiến thức khoa học thiết thực với các liên hệ thực tiễn trong cuộc sống.`;
      }
      if (coreConcepts.length === 0) {
        coreConcepts = source.tags && source.tags.length > 0 ? source.tags : ['Khoa học đời sống', 'Vật lý ứng dụng', 'Thực nghiệm'];
      }
      formulas = ['Độ đo thực nghiệm'];
      apps = ['Áp dụng vào đời sống hàng ngày', 'Giải thích hiện tượng tự nhiên'];
      takeaway = source.note || 'Ghi nhớ trọng tâm bài học và ứng dụng thực tiễn.';
      advice = 'Em hãy thường xuyên liên hệ bài học với các hiện tượng thực tế xung quanh nhà!';
    }

    return {
      sourceId: source.id,
      sourceTitle: source.title,
      subjectTitle: subjects.find((s) => s.id === source.subjectId)?.title,
      summary,
      coreConcepts,
      formulasAndRules: formulas,
      realWorldApplications: apps,
      keyTakeaway: takeaway,
      comprehensionLevel: 'Hoàn hảo',
      aiAdvice: advice,
    };
  });

  const quizQuestions: AiQuizItem[] = [
    {
      id: 'quiz-1',
      question: 'Dựa trên tài liệu đã lưu, tai người bình thường có thể nghe được âm thanh trong dải tần số nào?',
      options: [
        'Từ 0 Hz đến 100 Hz',
        'Từ 20 Hz đến 20.000 Hz',
        'Từ 20.000 Hz đến 100.000 Hz',
        'Tất cả các tần số âm thanh'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Theo ghi chép trong Local Storage, tai người nghe được từ 20 Hz đến 20.000 Hz. Dưới 20 Hz là hạ âm, trên 20.000 Hz là siêu âm.'
    },
    {
      id: 'quiz-2',
      question: 'Hiện tượng phản xạ toàn phần được ứng dụng vào công nghệ then chốt nào trong đời sống hiện đại?',
      options: [
        'Cáp quang viễn thông truyền dữ liệu Internet',
        'Chế tạo bóng đèn dây tóc',
        'Chế tạo máy phát điện gió',
        'Làm pin mặt trời'
      ],
      correctIndex: 0,
      explanation: 'Chính xác! Nhờ hiện tượng phản xạ toàn phần bên trong lõi sợi thủy tinh quang học (n1 > n2), tín hiệu ánh sáng truyền đi hàng ngàn cây số mà hầu như không bị thất thoát ra ngoài.'
    },
    {
      id: 'quiz-3',
      question: 'Theo khuyến nghị của Hiệp hội Nhãn khoa Hoa Kỳ trong bài học, quy tắc 20-20-20 bảo vệ mắt yêu cầu sau mỗi 20 phút học ta nên làm gì?',
      options: [
        'Uống một ly nước đá lạnh',
        'Chớp mắt thật nhanh 50 cái',
        'Nhìn ra xa ít nhất 20 feet (~6m) trong 20 giây',
        'Tắt hết đèn trong phòng tối'
      ],
      correctIndex: 2,
      explanation: 'Chính xác! Nhìn ra khoảng cách xa từ 6 mét trở lên giúp cơ thể mi của mắt thư giãn tối đa sau 20 phút co gập điều tiết khi nhìn gần sách vở hoặc màn hình.'
    }
  ];

  return {
    id: `review-${scope}-${selectedId || 'all'}`,
    scope,
    scopeTitle,
    totalSourcesAnalyzed: activeSources.length,
    overallScore: Math.min(99, 90 + Math.min(activeSources.length * 2, 9)),
    statusSummary: `AI đã đọc hiểu toàn diện ${activeSources.length} tài liệu học tập trong Local Storage với độ chính xác cao.`,
    overviewSummary: `Từ các ghi chép văn bản, hình ảnh quang học và liên kết thí nghiệm được lưu trữ, AI đã hệ thống hóa thành công bức tranh toàn cảnh về Sóng cơ học (Âm thanh), Quang học sóng (Khúc xạ & Tán sắc) và Y học thể chất (Bảo vệ thị giác và thính lực). AI nhận diện rõ ràng các định luật vật lý nền tảng cùng với ứng dụng đời sống hàng ngày của học sinh.`,
    masteredConcepts: [
      'Sóng âm & Dao động tuần hoàn',
      'Độ cao (Hz) & Cường độ âm (dBA)',
      'Hạ âm (<20Hz) & Siêu âm (>20kHz)',
      'Định luật khúc xạ ánh sáng (Snell)',
      'Hiện tượng phản xạ toàn phần (TIR)',
      'Tán sắc ánh sáng qua lăng kính',
      'Quy tắc 20-20-20 bảo vệ cơ thể mi',
      'Độ rọi chuẩn Lux & Nhiệt độ màu Kelvin'
    ],
    extractedFormulas: [
      { formula: 'v = λ · f', explanation: 'Vận tốc truyền sóng = Bước sóng nhân tần số dao động' },
      { formula: 'n₁ · sin(i) = n₂ · sin(r)', explanation: 'Định luật Snell mô tả khúc xạ tại mặt phân cách 2 môi trường' },
      { formula: 'sin(θc) = n₂ / n₁', explanation: 'Công thức tính góc tới hạn xảy ra hiện tượng phản xạ toàn phần' },
      { formula: '20 min - 20 ft - 20 sec', explanation: 'Chu kỳ giải phóng áp lực điều tiết mắt của cơ thể mi' },
      { formula: '< 85 dBA', explanation: 'Ngưỡng âm lượng tối đa an toàn cho màng nhĩ tai người' }
    ],
    crossConnections: [
      'Tương đồng sóng: Cả Âm thanh và Ánh sáng đều có bản chất sóng, tuân theo hiện tượng phản xạ, khúc xạ và giao thoa.',
      'Sự khác biệt tốc độ: Ánh sáng truyền 300.000 km/s trong chân không, còn âm thanh chỉ truyền 343 m/s trong không khí (giải thích thấy chớp trước khi nghe tiếng sấm).',
      'Bảo vệ giác quan kép: Thị giác cần ánh sáng đủ Lux và tránh ánh sáng xanh ban đêm; Thính giác cần kiểm soát dBA dưới 85 dB để tránh tổn thương tế bào lông tai trong.'
    ],
    sourceReviews,
    quizQuestions,
    generatedAt: Date.now(),
  };
};

export const DEFAULT_FLASHCARDS: StudyFlashcard[] = [
  {
    id: 'fc-1',
    sourceId: 'src-1',
    sourceTitle: 'Ghi chép: Tần số và ngưỡng nghe tai người',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Tần số (Frequency) là gì và tai người bình thường nghe được trong dải tần số nào?',
    back: '• Tần số là số chu kỳ dao động trong 1 giây, đơn vị là Hertz (Hz).\n• Tần số càng cao âm càng bổng (thanh), tần số càng thấp âm càng trầm.\n• Dải thính giác người: Từ 20 Hz đến 20.000 Hz.\n• Dưới 20 Hz gọi là Hạ âm (voi, cá voi dùng).\n• Trên 20.000 Hz gọi là Siêu âm (dơi định vị, y học siêu âm thai).',
    category: 'concept',
    difficulty: 'Dễ',
    status: 'learning',
    mnemonic: 'Nhớ mốc 20 đến 20.000: Dưới 20 là voi nói chuyện xa, trên 20k là dơi định vị mồi!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-2',
    sourceId: 'src-1',
    sourceTitle: 'Ghi chép: Tần số và ngưỡng nghe tai người',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Mức âm lượng nào bắt đầu gây nguy cơ tổn thương thính giác vĩnh viễn?',
    back: '• Tiếng ồn liên tục trên 85 dBA (tương đương tiếng xe cộ đông đúc hoặc mở tai nghe > 70% âm lượng).\n• Nguy cơ: Gây đứt gãy và tiêu biến tế bào lông cảm thụ dao động trong ốc tai (tế bào này không thể tái sinh).\n• Khuyến nghị: Áp dụng quy tắc 60-60 (nghe dưới 60% âm lượng tối đa, không nghe liên tục quá 60 phút).',
    category: 'rule',
    difficulty: 'Dễ',
    status: 'learning',
    mnemonic: 'Quy tắc 85 dB & 60-60: Trên 85 dBA tế bào lông tai bị hủy hoại vĩnh viễn!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-3',
    sourceId: 'src-1',
    sourceTitle: 'Sơ đồ: Cấu tạo tai người và đường đi sóng âm',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Đường truyền và chuyển hóa sóng âm từ không khí vào não bộ diễn ra qua những bộ phận nào?',
    back: '1. Vành tai: Thu nhận và định hướng sóng âm.\n2. Ống tai: Dẫn truyền sóng âm đến màng nhĩ.\n3. Màng nhĩ: Rung động cơ học đồng pha theo sóng âm.\n4. Chuỗi xương tai (Búa - Đe - Bàn đạp): Khuếch đại lực rung động lên hơn 20 lần.\n5. Ốc tai (Tai trong): Dịch tai chuyển động làm tế bào lông uốn lượn, sinh điện thế thần kinh gửi về vỏ não.',
    category: 'concept',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'Đường đi âm thanh: Vành -> Ống -> Nhĩ -> Xương (Búa/Đe/Bàn đạp) -> Ốc tai -> Não!',
    createdAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'fc-4',
    sourceId: 'src-sound-anc',
    sourceTitle: 'Công nghệ chống ồn chủ động (ANC)',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Nguyên lý vật lý nào giúp tai nghe chống ồn chủ động (Active Noise Cancellation - ANC) triệt tiêu tiếng ồn môi trường?',
    back: '• Nguyên lý: Hiện tượng giao thoa sóng triệt tiêu (Destructive Interference).\n• Cơ chế hoạt động: Microphone bên ngoài thu tiếng ồn môi trường -> Vi xử lý DSP tạo sóng âm ngược pha 180° (đối đỉnh - đáy) cùng tần số và biên độ -> Khi hai sóng gặp nhau tại tai, tổng biên độ bằng 0.\n• Môi trường tối ưu: Tiếng ồn trầm tuần hoàn ổn định (động cơ máy bay, xe buýt, máy điều hòa).',
    category: 'application',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'Đỉnh gặp Đáy ngược pha 180° = Triệt tiêu hoàn toàn! Biến ồn thành tĩnh lặng.',
    createdAt: Date.now() - 86400000 * 1.2,
  },
  {
    id: 'fc-5',
    sourceId: 'src-4',
    sourceTitle: 'Định luật khúc xạ ánh sáng và phản xạ toàn phần',
    subjectId: 'subj-light',
    subjectTitle: 'Vật lý: Quang học, Khúc xạ & Tán sắc ánh sáng',
    front: 'Công thức định luật khúc xạ ánh sáng Snell là gì? Giải thích các đại lượng.',
    back: '• Công thức: n₁ · sin(i) = n₂ · sin(r)\n• n₁: Chiết suất môi trường chứa tia tới.\n• n₂: Chiết suất môi trường chứa tia khúc xạ.\n• i: Góc tới (hợp bởi tia tới và pháp tuyến).\n• r: Góc khúc xạ (hợp bởi tia khúc xạ và pháp tuyến).\n• Quy luật: Khi đi từ môi trường chiết quang kém sang môi trường chiết quang hơn (n₁ < n₂), tia khúc xạ bị bẻ lệch lại gần pháp tuyến hơn (r < i).',
    category: 'formula',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'n1 sin i = n2 sin r: Môi trường càng đặc, ánh sáng càng bẻ gập sát pháp tuyến!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-6',
    sourceId: 'src-4',
    sourceTitle: 'Định luật khúc xạ ánh sáng và phản xạ toàn phần',
    subjectId: 'subj-light',
    subjectTitle: 'Vật lý: Quang học, Khúc xạ & Tán sắc ánh sáng',
    front: 'Hai điều kiện bắt buộc để xảy ra hiện tượng Phản Xạ Toàn Phần (TIR)? Ứng dụng thực tế lớn nhất là gì?',
    back: '• Cần thỏa mãn đồng thời 2 điều kiện:\n1. Ánh sáng truyền từ môi trường chiết quang hơn sang môi trường kém chiết quang hơn (n₁ > n₂).\n2. Góc tới lớn hơn hoặc bằng góc giới hạn: i ≥ θc (với sin(θc) = n₂ / n₁).\n• Ứng dụng đột phá: Dẫn truyền toàn bộ chùm sáng bên trong lõi sợi cáp quang Internet với khoảng cách hàng ngàn km mà không bị tán xạ ra ngoài.',
    category: 'rule',
    difficulty: 'Nâng cao',
    status: 'learning',
    mnemonic: 'Phản xạ toàn phần: Từ Đặc ra Loãng (n1 > n2) và Góc tới lớn hơn góc giới hạn (i >= θc)!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-7',
    sourceId: 'src-rayleigh',
    sourceTitle: 'Tán xạ Rayleigh & Màu sắc bầu trời',
    subjectId: 'subj-light',
    subjectTitle: 'Vật lý: Quang học, Khúc xạ & Tán sắc ánh sáng',
    front: 'Vì sao bầu trời ban ngày có màu xanh lam còn hoàng hôn Mặt Trời lại đỏ cam rực rỡ?',
    back: '• Dựa trên Định luật tán xạ Rayleigh: Cường độ tán xạ tỉ lệ nghịch với lũy thừa bậc 4 của bước sóng (I ~ 1/λ⁴).\n• Ban ngày: Ánh sáng lam có bước sóng ngắn (~400-450 nm) bị các phân tử khí N₂, O₂ tán xạ mạnh gấp ~10 lần ánh sáng đỏ (~700 nm), văng tung tóe khắp vòm trời.\n• Hoàng hôn: Ánh sáng xuyên qua lớp khí quyển dày hơn gấp 10 lần, ánh sáng lam bị tán xạ mất hết dọc đường, chỉ còn các tia đỏ-cam bước sóng dài ít bị tán xạ xuyên thẳng tới mắt.',
    category: 'concept',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'Đỏ dài Lam ngắn: Lam văng tứ phía tạo nền trời, Đỏ kiên cường xuyên thẳng mắt lúc hoàng hôn!',
    createdAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'fc-8',
    sourceId: 'src-health-eye',
    sourceTitle: 'Quy tắc 20-20-20 & Tiêu chuẩn ánh sáng bàn học',
    subjectId: 'subj-health',
    subjectTitle: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    front: 'Quy tắc 20-20-20 trong chăm sóc mắt học đường là gì và tại sao lại hiệu quả?',
    back: '• Nội dung: Sau mỗi 20 PHÚT học bài hoặc nhìn màn hình thiết bị điện tử, hãy nhìn ra xa ít nhất 20 FEET (~6 mét) trong thời gian 20 GIÂY.\n• Cơ chế sinh học: Khi nhìn gần dưới 40cm, cơ thể mi phải co thắt liên tục để làm phồng thủy tinh thể. Nhìn ra xa từ 6 mét trở lên đưa mắt về trạng thái vô cực, cơ mi được giãn nghỉ ngơi hoàn toàn, ngăn chặn mỏi mắt và cận thị tiến triển.',
    category: 'application',
    difficulty: 'Dễ',
    status: 'learning',
    mnemonic: '20-20-20: 20 phút nhìn gần -> 20 feet (6 mét) nhìn xa -> 20 giây thả lỏng cơ mắt!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-9',
    sourceId: 'src-health-eye',
    sourceTitle: 'Quy tắc 20-20-20 & Tiêu chuẩn ánh sáng bàn học',
    subjectId: 'subj-health',
    subjectTitle: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    front: 'Độ rọi tiêu chuẩn trên mặt bàn học là bao nhiêu Lux và nên chọn đèn nhiệt độ màu thế nào vào buổi tối?',
    back: '• Tiêu chuẩn độ rọi bàn học: Từ 300 đến 500 Lux (với đọc sách, viết bài bình thường) và 500 - 750 Lux (khi vẽ kỹ thuật, thủ công chi tiết).\n• Dưới 200 Lux khiến mắt phải co đồng tử và căng thẳng liên tục.\n• Buổi tối: Nên dùng ánh sáng trắng ấm hoặc vàng nhạt (3000K - 4000K). Tránh ánh sáng trắng xanh lạnh (> 5500K) vì ức chế hormone Melatonin gây mất ngủ và rối loạn nhịp sinh học.',
    category: 'rule',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'Bàn học: 300 - 500 Lux, ban ngày 5000K tỉnh táo, ban đêm 3500K êm dịu bảo vệ giấc ngủ!',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'fc-10',
    sourceId: 'src-thunder',
    sourceTitle: 'Sấm sét & Tốc độ truyền âm thanh',
    subjectId: 'subj-thunder',
    subjectTitle: 'KHTN: Hiện tượng sấm sét & Tốc độ truyền âm',
    front: 'Vì sao ta thấy ánh chớp lóe lên trước rồi một lát sau mới nghe thấy tiếng sấm? Làm sao tính khoảng cách sét đánh?',
    back: '• Do chênh lệch vận tốc khổng lồ:\n- Vận tốc ánh sáng: c ≈ 300.000 km/s -> đến mắt người gần như tức thời (0.00001 giây).\n- Vận tốc âm thanh trong không khí: v ≈ 343 m/s (~1 km trong khoảng 3 giây).\n• Công thức tính khoảng cách (d):\nd = v · t ≈ (Số giây đếm được giữa chớp và sấm) / 3 (km).\nVí dụ: Đếm được 6 giây -> Sét đánh cách ta: 6 / 3 = 2 km.',
    category: 'distinction',
    difficulty: 'Dễ',
    status: 'learning',
    mnemonic: 'Thấy chớp đếm giây: Chia cho 3 ra số km khoảng cách sét đánh!',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'fc-11',
    sourceId: 'src-speed-sound',
    sourceTitle: 'Vận tốc truyền sóng âm qua các môi trường',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Vận tốc truyền âm thanh phụ thuộc vào yếu tố nào và so sánh vận tốc trong Rắn, Lỏng, Khí, Chân không?',
    back: '• Quy luật mật độ phân tử: Sóng âm lan truyền nhờ va chạm cơ học giữa các phân tử vật chất. Môi trường càng dày đặc và tính đàn hồi càng cao thì âm truyền càng nhanh:\nv(Rắn) > v(Lỏng) > v(Khí) >> Chân không (= 0).\n• Con số cụ thể:\n- Thép: ~5.000 m/s\n- Nước biển: ~1.530 m/s\n- Không khí (20°C): ~343 m/s\n- Chân không: 0 m/s (sóng cơ học hoàn toàn không truyền được trong chân không).',
    category: 'concept',
    difficulty: 'Dễ',
    status: 'learning',
    mnemonic: 'Rắn > Lỏng > Khí: Càng đặc truyền càng nhanh, ngoài vũ trụ chân không tuyệt đối im lặng!',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'fc-12',
    sourceId: 'src-doppler',
    sourceTitle: 'Hiệu ứng Doppler trong sóng âm và ánh sáng',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    front: 'Hiệu ứng Doppler là gì? Nêu ví dụ thực tế khi xe cứu thương chạy lại gần và chạy ra xa.',
    back: '• Khái niệm: Là hiện tượng tần số sóng mà người quan sát nhận được bị thay đổi khi nguồn phát sóng chuyển động tương đối so với người quan sát.\n• Ví dụ xe cứu thương:\n- Khi xe chạy lại gần: Các đỉnh sóng bị nén lại gần nhau -> Bước sóng biểu kiến ngắn lại -> Tần số nghe được TĂNG LÊN (âm nghe bổng/thanh hơn).\n- Khi xe chạy ra xa: Các đỉnh sóng bị kéo dài ra -> Bước sóng biểu kiến dài hơn -> Tần số GIẢM XUỐNG (âm nghe trầm hẳn xuống).',
    category: 'concept',
    difficulty: 'Trung bình',
    status: 'learning',
    mnemonic: 'Lại gần nén sóng nghe bổng hơn (The - The), Ra xa dãn sóng nghe trầm hơn (Ùm - Ùm)!',
    createdAt: Date.now() - 86400000 * 0.8,
  }
];

export const loadStoredFlashcards = (): StudyFlashcard[] => {
  try {
    const raw = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(DEFAULT_FLASHCARDS));
      return DEFAULT_FLASHCARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(DEFAULT_FLASHCARDS));
    return DEFAULT_FLASHCARDS;
  } catch (err) {
    console.error('Error reading flashcards from storage:', err);
    return DEFAULT_FLASHCARDS;
  }
};

export const saveFlashcardsToStorage = (cards: StudyFlashcard[]): void => {
  try {
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.error('Error saving flashcards to storage:', err);
  }
};

export const generateFlashcardsFromSource = (
  source: StudySource,
  subjectTitle?: string
): StudyFlashcard[] => {
  const cards: StudyFlashcard[] = [];
  const sTitle = source.title || 'Bài học';
  const sLower = sTitle.toLowerCase();
  const cLower = (source.content || '').toLowerCase();
  const subj = subjectTitle || 'Khoa học tự nhiên';
  const now = Date.now();

  // If source has summary and key points, generate high quality cards from them
  if (source.summary) {
    cards.push({
      id: `fc-gen-${source.id}-summary-${Math.random().toString(36).slice(2, 7)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      subjectId: source.subjectId,
      subjectTitle: subj,
      front: `Bản chất cốt lõi và nội dung tổng quát của bài học "${sTitle}" là gì?`,
      back: source.summary,
      category: 'concept',
      difficulty: 'Dễ',
      status: 'learning',
      mnemonic: `Nắm vững ý chính của "${sTitle}" để trả lời tự tin phần lý thuyết kiểm tra!`,
      createdAt: now,
    });
  }

  if (Array.isArray(source.keyPoints) && source.keyPoints.length > 0) {
    source.keyPoints.slice(0, 3).forEach((kp, idx) => {
      let cat: StudyFlashcard['category'] = 'concept';
      let diff: StudyFlashcard['difficulty'] = 'Trung bình';

      if (kp.toLowerCase().includes('công thức') || kp.includes('=') || kp.includes('lux') || kp.includes('hz') || kp.includes('db')) {
        cat = 'formula';
      } else if (kp.toLowerCase().includes('ứng dụng') || kp.toLowerCase().includes('bảo vệ') || kp.toLowerCase().includes('tai nghe') || kp.toLowerCase().includes('máy tính')) {
        cat = 'application';
      } else if (kp.toLowerCase().includes('quy tắc') || kp.toLowerCase().includes('định luật') || kp.toLowerCase().includes('ngưỡng')) {
        cat = 'rule';
      } else if (kp.toLowerCase().includes('phân biệt') || kp.toLowerCase().includes('so sánh') || kp.toLowerCase().includes('ngược')) {
        cat = 'distinction';
      }

      cards.push({
        id: `fc-gen-${source.id}-kp-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        subjectId: source.subjectId,
        subjectTitle: subj,
        front: `[Trọng tâm #${idx + 1}] Điểm cần ghi nhớ sâu trong bài "${sTitle}"?`,
        back: kp,
        category: cat,
        difficulty: diff,
        status: 'learning',
        mnemonic: `Trọng tâm #${idx + 1}: Thường xuyên xuất hiện trong các câu hỏi trắc nghiệm!`,
        createdAt: now,
      });
    });
  }

  // Fallback domain awareness if no summary/keyPoints exist yet
  if (cards.length === 0) {
    cards.push({
      id: `fc-gen-${source.id}-fallback-1-${Math.random().toString(36).slice(2, 7)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      subjectId: source.subjectId,
      subjectTitle: subj,
      front: `Định nghĩa hoặc khái niệm nền tảng trong bài "${sTitle}"?`,
      back: source.content ? source.content.slice(0, 300) : `Bài học ${sTitle} thuộc lĩnh vực ${subj}.`,
      category: 'concept',
      difficulty: 'Dễ',
      status: 'learning',
      createdAt: now,
    });
  }

  return cards;
};

export const generateAllFlashcards = (
  sources?: StudySource[],
  subjects?: StudySubject[]
): StudyFlashcard[] => {
  const activeSources = sources || loadStudySources();
  const activeSubjects = subjects || loadStudySubjects();
  const existingCards = loadStoredFlashcards();
  const existingSourceIds = new Set(existingCards.map((c) => c.sourceId));

  const newCards: StudyFlashcard[] = [...existingCards];

  for (const src of activeSources) {
    const subj = activeSubjects.find((s) => s.id === src.subjectId);
    const generatedForSrc = generateFlashcardsFromSource(src, subj?.title);
    
    // Check if card with similar front already exists
    for (const card of generatedForSrc) {
      const isDuplicate = newCards.some(
        (c) => c.sourceId === card.sourceId && c.front.slice(0, 25) === card.front.slice(0, 25)
      );
      if (!isDuplicate) {
        newCards.push(card);
      }
    }
  }

  saveFlashcardsToStorage(newCards);
  return newCards;
};

export const toggleFlashcardStatus = (
  cardId: string,
  newStatus: 'learning' | 'mastered' | 'review_needed'
): StudyFlashcard[] => {
  const cards = loadStoredFlashcards();
  const updated = cards.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c));
  saveFlashcardsToStorage(updated);
  return updated;
};

export const deleteFlashcardFromStorage = (cardId: string): StudyFlashcard[] => {
  const cards = loadStoredFlashcards();
  const updated = cards.filter((c) => c.id !== cardId);
  saveFlashcardsToStorage(updated);
  return updated;
};

// Cập nhật nội dung thẻ flashcard đã có trong bộ nhớ
export const updateFlashcardInStorage = (
  updatedCard: Partial<StudyFlashcard> & { id: string }
): StudyFlashcard[] => {
  const cards = loadStoredFlashcards();
  const updated = cards.map((c) => {
    if (c.id === updatedCard.id) {
      return {
        ...c,
        ...updatedCard,
        updatedAt: Date.now(),
      };
    }
    return c;
  });
  saveFlashcardsToStorage(updated);
  return updated;
};

// Cập nhật lại toàn bộ Flashcards từ các bài học mới nhất trong Góc Học Tập
export const syncFlashcardsFromAllSources = (): {
  addedCount: number;
  updatedCount: number;
  totalCount: number;
  flashcards: StudyFlashcard[];
} => {
  const sources = loadStudySources();
  const subjects = loadStudySubjects();
  const currentCards = loadStoredFlashcards();

  const cardMap = new Map<string, StudyFlashcard>();
  currentCards.forEach((c) => {
    const key = c.front.trim().toLowerCase().slice(0, 35);
    cardMap.set(key, c);
  });

  let addedCount = 0;
  let updatedCount = 0;

  sources.forEach((src) => {
    const subj = subjects.find((s) => s.id === src.subjectId);
    const generated = generateFlashcardsFromSource(src, subj?.title);
    generated.forEach((gen) => {
      const key = gen.front.trim().toLowerCase().slice(0, 35);
      const existing = cardMap.get(key);
      if (existing) {
        if (existing.back !== gen.back || existing.mnemonic !== gen.mnemonic) {
          cardMap.set(key, {
            ...existing,
            back: gen.back,
            mnemonic: gen.mnemonic || existing.mnemonic,
            category: gen.category || existing.category,
            difficulty: gen.difficulty || existing.difficulty,
            sourceTitle: src.title,
            updatedAt: Date.now(),
          });
          updatedCount++;
        }
      } else {
        cardMap.set(key, gen);
        addedCount++;
      }
    });
  });

  const merged = Array.from(cardMap.values());
  saveFlashcardsToStorage(merged);
  return { addedCount, updatedCount, totalCount: merged.length, flashcards: merged };
};

// Cập nhật flashcard bên trong Study Pack
export const updateFlashcardInStudyPack = (
  packId: string,
  updatedCard: Partial<StudyFlashcard> & { id: string }
): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.map((pack) => {
    if (pack.id === packId) {
      const updatedCards = (pack.flashcards || []).map((c) =>
        c.id === updatedCard.id ? { ...c, ...updatedCard, updatedAt: Date.now() } : c
      );
      return { ...pack, flashcards: updatedCards };
    }
    return pack;
  });
  saveStudyPacksToStorage(updated);
  return updated;
};

export const addCustomFlashcard = (card: Partial<StudyFlashcard>): StudyFlashcard[] => {
  const cards = loadStoredFlashcards();
  const newCard: StudyFlashcard = {
    id: `fc-custom-${Date.now()}`,
    sourceId: card.sourceId || 'custom',
    sourceTitle: card.sourceTitle || 'Thẻ tự tạo',
    subjectId: card.subjectId || 'subj-custom',
    subjectTitle: card.subjectTitle || 'Ghi nhớ tự chọn',
    front: card.front || 'Câu hỏi hoặc khái niệm?',
    back: card.back || 'Câu trả lời hoặc giải thích chi tiết.',
    category: card.category || 'concept',
    difficulty: card.difficulty || 'Dễ',
    status: 'learning',
    mnemonic: card.mnemonic,
    createdAt: Date.now(),
  };
  const updated = [newCard, ...cards];
  saveFlashcardsToStorage(updated);
  return updated;
};

export const resetFlashcardsToDefault = (): StudyFlashcard[] => {
  saveFlashcardsToStorage(DEFAULT_FLASHCARDS);
  return DEFAULT_FLASHCARDS;
};

// ==========================================
// BUỔI 3: STUDY PACK AI GENERATION PIPELINE
// 5 Thành phần:
// 1. summary
// 2. key points
// 3. flashcards
// 4. câu hỏi luyện tập cơ bản nhiều dạng
// 5. Q&A seed
// ==========================================

export const DEFAULT_STUDY_PACKS: StudyPack[] = [
  {
    id: 'sp-sound-freq',
    sourceId: 'src-1',
    sourceTitle: 'Nguồn âm, Tần số dao động & Độ cao của âm thanh',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    gradeLevel: 'Lớp 7 (KHTN 7)',
    createdAt: Date.now() - 86400000 * 2,
    summary:
      'Tất cả các nguồn âm khi phát ra âm thanh đều dao động. Tần số dao động được định nghĩa là số dao động mà vật thực hiện được trong 1 giây (đơn vị Hertz - Hz). Tần số dao động quyết định trực tiếp độ cao (bổng hay trầm) của âm thanh: vật dao động càng nhanh thì tần số càng lớn, âm phát ra càng bổng (cao); ngược lại dao động càng chậm thì tần số nhỏ, âm càng trầm (thấp). Tai người bình thường chỉ nghe được âm có tần số từ 20 Hz đến 20.000 Hz.',
    keyPoints: [
      'Nguồn âm là vật phát ra âm thanh. Mọi nguồn âm khi phát ra âm đều dao động.',
      'Tần số (f) là số dao động thực hiện được trong 1 giây. Đơn vị đo là Héc (Hz).',
      'Dao động càng nhanh ➔ tần số càng lớn ➔ âm phát ra càng bổng (cao).',
      'Dao động càng chậm ➔ tần số càng nhỏ ➔ âm phát ra càng trầm (thấp).',
      'Giới hạn thính giác con người: 20 Hz đến 20.000 Hz. Dưới 20 Hz là hạ âm, trên 20.000 Hz là siêu âm.',
    ],
    flashcards: [
      {
        id: 'sp-fc-1',
        sourceId: 'src-1',
        sourceTitle: 'Nguồn âm & Tần số dao động',
        subjectId: 'subj-sound',
        subjectTitle: 'Vật lý Âm học',
        front: 'Khái niệm Tần số dao động là gì và đơn vị đo chuẩn là gì?',
        back: 'Tần số dao động là số lần dao động toàn phần mà một vật thực hiện được trong thời gian 1 giây. Ký hiệu là f, đơn vị đo là Héc (Hz).',
        category: 'concept',
        difficulty: 'Dễ',
        status: 'learning',
        mnemonic: 'f = số dao động / 1 giây (Héc - Hz)',
        createdAt: Date.now(),
      },
      {
        id: 'sp-fc-2',
        sourceId: 'src-1',
        sourceTitle: 'Độ cao và Tần số',
        subjectId: 'subj-sound',
        subjectTitle: 'Vật lý Âm học',
        front: 'Mối quan hệ giữa tần số dao động và độ cao của âm thanh phát ra?',
        back: '• Tần số càng lớn (dao động càng nhanh) ➔ Âm phát ra càng BỔNG (cao).\n• Tần số càng nhỏ (dao động càng chậm) ➔ Âm phát ra càng TRẦM (thấp).',
        category: 'rule',
        difficulty: 'Dễ',
        status: 'learning',
        mnemonic: 'Nhanh - Tần số lớn - Âm bổng! Chậm - Tần số nhỏ - Âm trầm!',
        createdAt: Date.now(),
      },
      {
        id: 'sp-fc-3',
        sourceId: 'src-1',
        sourceTitle: 'Phân biệt Độ cao và Độ to',
        subjectId: 'subj-sound',
        subjectTitle: 'Vật lý Âm học',
        front: 'Phân biệt sự khác nhau bản chất giữa Độ cao và Độ to của âm?',
        back: '• Độ cao (bổng/trầm): Do TẦN SỐ dao động quyết định (đơn vị Hz).\n• Độ to (lớn/nhỏ): Do BIÊN ĐỘ dao động quyết định (đơn vị Decibel - dB). Gõ mạnh thì âm to chứ không làm âm bổng hơn.',
        category: 'distinction',
        difficulty: 'Trung bình',
        status: 'learning',
        mnemonic: 'Tần số tạo Độ cao - Biên độ tạo Độ to!',
        createdAt: Date.now(),
      },
      {
        id: 'sp-fc-4',
        sourceId: 'src-1',
        sourceTitle: 'Ứng dụng Siêu âm & Hạ âm',
        subjectId: 'subj-sound',
        subjectTitle: 'Vật lý Âm học',
        front: 'Siêu âm và Hạ âm là gì? Tai người có nghe được không?',
        back: '• Hạ âm: Tần số dưới 20 Hz (voi, cá voi dùng giao tiếp xa).\n• Siêu âm: Tần số trên 20.000 Hz (dơi định vị săn mồi, y tế siêu âm chẩn đoán).\n• Cả hai dải này tai người đều KHÔNG nghe thấy được.',
        category: 'application',
        difficulty: 'Dễ',
        status: 'learning',
        mnemonic: 'Dưới 20 là Hạ, trên 20k là Siêu - Người chỉ nghe khúc giữa!',
        createdAt: Date.now(),
      },
    ],
    practiceQuestions: [
      {
        id: 'sp-q-1',
        type: 'multiple_choice',
        question: 'Khi nghệ sĩ vặn chốt căng dây đàn guitar và gảy, âm thanh phát ra thay đổi như thế nào?',
        options: [
          'A. Âm phát ra trầm hơn vì dây đàn dài hơn',
          'B. Âm phát ra bổng hơn vì dây căng làm tần số dao động tăng',
          'C. Âm phát ra to hơn nhưng độ cao không đổi',
          'D. Âm thanh không thay đổi',
        ],
        correctAnswer: 'B. Âm phát ra bổng hơn vì dây căng làm tần số dao động tăng',
        explanation: 'Khi dây đàn được kéo căng hơn, nó sẽ dao động nhanh hơn trong 1 giây ➔ tần số dao động f tăng lên ➔ âm phát ra bổng (cao) hơn.',
        hint: 'Nhớ lại mối quan hệ giữa tốc độ dao động, tần số và độ bổng của âm.',
      },
      {
        id: 'sp-q-2',
        type: 'true_false',
        question: 'Khẳng định sau ĐÚNG hay SAI: "Khi gảy đàn guitar thật mạnh, âm phát ra sẽ bổng hơn so với khi gảy nhẹ."',
        correctAnswer: 'SAI',
        explanation: 'SAI. Khi gảy mạnh, ta cung cấp năng lượng lớn làm tăng BIÊN ĐỘ dao động, khiến âm phát ra TO HƠN (độ to), chứ không thay đổi tần số dao động nên độ cao (bổng/trầm) không đổi.',
        hint: 'Phân biệt giữa gảy mạnh (biên độ dao động) và gảy dây căng/chùng (tần số).',
      },
      {
        id: 'sp-q-3',
        type: 'fill_in',
        question: 'Số dao động mà một vật thực hiện được trong một giây gọi là __________ của dao động, đơn vị đo ký hiệu là __________.',
        correctAnswer: 'tần số / Hz (Héc)',
        explanation: 'Theo định nghĩa chuẩn sách giáo khoa KHTN 7: Tần số là số dao động trong 1 giây, đơn vị là Héc, viết tắt là Hz.',
        hint: 'Đại lượng này quyết định âm bổng hay trầm.',
      },
      {
        id: 'sp-q-4',
        type: 'explain_phenomenon',
        question: 'Giải thích hiện tượng: Tại sao khi một con muỗi bay qua tai ta nghe thấy tiếng vo ve rất bổng, trong khi chim bồ câu đập cánh bay thì ta không nghe thấy âm bổng như vậy?',
        correctAnswer: 'Cánh muỗi đập rất nhanh (~500 - 600 lần/giây ➔ f = 500-600 Hz nằm trong vùng tai người nghe rõ và âm rất bổng). Còn cánh chim bồ câu đập rất chậm (~3 - 5 lần/giây ➔ f = 3-5 Hz thuộc vùng hạ âm dưới 20 Hz mà tai người không nghe được thành âm bổng).',
        explanation: 'Tần số dao động của cánh muỗi rất lớn so với cánh chim, dao động càng nhanh thì âm phát ra càng bổng.',
        hint: 'So sánh số lần vỗ cánh trong 1 giây (tần số) giữa muỗi và bồ câu.',
      },
    ],
    qaSeeds: [
      {
        id: 'sp-qa-1',
        question: 'Tại sao khi em đặt tay lên cổ họng lúc đang hát thì thấy cổ họng rung lên?',
        shortAnswer: 'Vì nguồn âm chính của giọng nói là hai dây thanh quản trong thanh quản; khi không khí từ phổi đẩy lên làm chúng dao động rung động liên tục để tạo ra âm thanh.',
        followUpPrompt: 'Nếu dây thanh quản căng hơn hoặc chùng hơn thì giọng nói của em sẽ thay đổi như thế nào?',
        category: 'Hiện tượng đời sống',
      },
      {
        id: 'sp-qa-2',
        question: 'Nếu hai người đứng trên Mặt Trăng nói chuyện bình thường thì có nghe thấy nhau không?',
        shortAnswer: 'Không thể nghe thấy, vì Mặt Trăng là môi trường chân không, không có các phân tử không khí để truyền sóng dao động âm thanh.',
        followUpPrompt: 'Vậy các phi hành gia trên trạm vũ trụ nói chuyện với nhau ngoài không gian bằng cách nào?',
        category: 'Khái niệm thường hỏi',
      },
      {
        id: 'sp-qa-3',
        question: 'Làm sao để nhớ không bị nhầm lẫn giữa Độ Cao (Hz) và Độ To (dB)?',
        shortAnswer: 'Mẹo nhớ: "Cao do Nhanh, To do Mạnh". Nhanh/chậm là Tần số (Hz) quyết định âm Bổng/Trầm. Mạnh/yếu là Biên độ (dB) quyết định âm To/Nhỏ.',
        followUpPrompt: 'Hãy lấy một ví dụ thực tế về một âm thanh vừa RẤT TRẦM nhưng lại RẤT TO?',
        category: 'Sai lầm thường gặp',
      },
      {
        id: 'sp-qa-4',
        question: 'Tại sao loài chó có thể nghe thấy những tiếng động lạ từ rất xa mà con người hoàn toàn không hay biết?',
        shortAnswer: 'Tai loài chó có ngưỡng thính giác rộng hơn con người rất nhiều, nghe được dải siêu âm lên tới 45.000 - 67.000 Hz, trong khi tai người chỉ dừng lại ở 20.000 Hz.',
        followUpPrompt: 'Còi siêu âm huấn luyện chó hoạt động trên nguyên lý này như thế nào?',
        category: 'Tư duy liên hệ',
      },
    ],
  },
  {
    id: 'sp-light-reflection',
    sourceId: 'src-2',
    sourceTitle: 'Định luật phản xạ ánh sáng & Tính chất ảnh của gương phẳng',
    subjectId: 'subj-light',
    subjectTitle: 'Vật lý: Quang học, Khúc xạ & Tán sắc ánh sáng',
    gradeLevel: 'Lớp 7 (KHTN 7)',
    createdAt: Date.now() - 86400000,
    summary:
      'Định luật phản xạ ánh sáng nêu rõ: Tia phản xạ luôn nằm trong mặt phẳng tới (mặt phẳng chứa tia tới và pháp tuyến của gương tại điểm tới), và góc phản xạ luôn luôn bằng góc tới (i\' = i). Gương phẳng tạo ra ảnh ảo (không hứng được trên màn chắn), có kích thước lớn bằng đúng vật và khoảng cách từ ảnh đến gương bằng khoảng cách từ vật đến gương.',
    keyPoints: [
      'Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới.',
      'Góc phản xạ luôn bằng góc tới: i\' = i.',
      'Góc tới (i) là góc hợp bởi tia tới SI và pháp tuyến IN, KHÔNG PHẢI góc hợp với mặt gương.',
      'Ảnh của một vật tạo bởi gương phẳng là ảnh ảo, không hứng được trên màn chắn.',
      'Độ lớn của ảnh bằng độ lớn của vật, khoảng cách từ ảnh đến gương bằng khoảng cách từ vật đến gương.',
    ],
    flashcards: [
      {
        id: 'sp-fc-light-1',
        sourceId: 'src-2',
        sourceTitle: 'Định luật phản xạ ánh sáng',
        subjectId: 'subj-light',
        subjectTitle: 'Vật lý Quang học',
        front: 'Phát biểu công thức và nội dung góc của Định luật phản xạ ánh sáng?',
        back: 'Góc phản xạ luôn luôn bằng góc tới: i\' = i (với tia phản xạ nằm trong cùng mặt phẳng tới chứa tia tới và pháp tuyến tại điểm tới).',
        category: 'rule',
        difficulty: 'Dễ',
        status: 'learning',
        mnemonic: 'i\' = i (Tới bao nhiêu thì Dội lại bấy nhiêu so với pháp tuyến!)',
        createdAt: Date.now(),
      },
      {
        id: 'sp-fc-light-2',
        sourceId: 'src-2',
        sourceTitle: 'Góc tới và Góc hợp với gương',
        subjectId: 'subj-light',
        subjectTitle: 'Vật lý Quang học',
        front: 'Nếu tia sáng tới chiếu tới gương phẳng tạo với mặt gương một góc 30°, thì góc tới i và góc phản xạ i\' bằng bao nhiêu?',
        back: '• Pháp tuyến IN vuông góc với mặt gương (90°).\n• Góc tới i = 90° - 30° = 60°.\n• Theo định luật phản xạ: Góc phản xạ i\' = i = 60° (Lưu ý: Không được nhầm góc hợp với mặt gương là góc tới!).',
        category: 'distinction',
        difficulty: 'Trung bình',
        status: 'learning',
        mnemonic: 'Góc tới đo từ PHÁP TUYẾN, không đo từ mặt gương!',
        createdAt: Date.now(),
      },
      {
        id: 'sp-fc-light-3',
        sourceId: 'src-2',
        sourceTitle: 'Tính chất ảnh gương phẳng',
        subjectId: 'subj-light',
        subjectTitle: 'Vật lý Quang học',
        front: 'Ảnh của một vật tạo bởi gương phẳng có những đặc điểm gì?',
        back: '1. Là ảnh ảo, không hứng được trên màn chắn.\n2. Lớn bằng vật thật.\n3. Cách gương một khoảng bằng khoảng cách từ vật đến gương (đối xứng qua gương).',
        category: 'concept',
        difficulty: 'Dễ',
        status: 'learning',
        mnemonic: 'Ảnh ảo - Bằng vật - Cách đều gương!',
        createdAt: Date.now(),
      },
    ],
    practiceQuestions: [
      {
        id: 'sp-ql-1',
        type: 'multiple_choice',
        question: 'Chiếu một tia sáng vuông góc với bề mặt gương phẳng. Góc tới và góc phản xạ lần lượt bằng bao nhiêu?',
        options: [
          'A. Góc tới = 90°, góc phản xạ = 90°',
          'B. Góc tới = 0°, góc phản xạ = 0°',
          'C. Góc tới = 0°, góc phản xạ = 90°',
          'D. Góc tới = 45°, góc phản xạ = 45°',
        ],
        correctAnswer: 'B. Góc tới = 0°, góc phản xạ = 0°',
        explanation: 'Khi tia sáng vuông góc với gương, nó trùng với pháp tuyến IN. Do đó góc tới i = 0°, và góc phản xạ i\' = 0° (tia phản xạ bật ngược trở lại theo phương cũ).',
        hint: 'Góc tới là góc hợp giữa tia tới và pháp tuyến. Pháp tuyến vuông góc với mặt gương.',
      },
      {
        id: 'sp-ql-2',
        type: 'true_false',
        question: 'Khẳng định sau ĐÚNG hay SAI: "Một người cao 1,6 m đứng trước gương phẳng cách gương 1 m, khi lùi xa thêm 1 m nữa thì chiều cao của ảnh trong gương sẽ bị nhỏ đi."',
        correctAnswer: 'SAI',
        explanation: 'SAI. Tính chất của gương phẳng là độ lớn của ảnh luôn luôn bằng vật thật (người cao 1,6 m thì ảnh luôn cao 1,6 m). Mắt nhìn thấy ảnh có vẻ nhỏ đi chỉ là do góc trông vật giảm đi khi đứng xa, bản chất kích thước ảnh không đổi.',
        hint: 'Phân biệt giữa kích thước thực của ảnh và góc trông của mắt.',
      },
      {
        id: 'sp-ql-3',
        type: 'fill_in',
        question: 'Một học sinh đứng cách gương phẳng 1,5 mét. Khoảng cách giữa học sinh đó và ảnh của mình trong gương là __________ mét.',
        correctAnswer: '3 (hoặc 3 mét)',
        explanation: 'Khoảng cách từ học sinh đến gương là 1,5 m. Khoảng cách từ gương đến ảnh là 1,5 m. Vậy khoảng cách giữa người và ảnh là 1,5 + 1,5 = 3 mét.',
        hint: 'Ảnh và vật đối xứng nhau qua mặt phẳng gương.',
      },
      {
        id: 'sp-ql-4',
        type: 'explain_phenomenon',
        question: 'Tại sao chữ "AMBULANCE" ở đầu các xe cứu thương thường được dán ngược theo chiều ngang (in đối xứng)?',
        correctAnswer: 'Vì khi các tài xế xe phía trước nhìn qua gương chiếu hậu (gương phẳng), hiện tượng phản xạ gương phẳng sẽ đảo ngược chiều trái-phải của chữ, giúp tài xế đọc đúng chữ "AMBULANCE" xuôi một cách nhanh chóng và nhường đường kịp thời.',
        explanation: 'Ảnh qua gương phẳng có tính chất đối xứng trục, đảo chiều trái - phải so với vật thực tế.',
        hint: 'Tính chất đảo trái phải của ảnh qua gương phẳng.',
      },
    ],
    qaSeeds: [
      {
        id: 'sp-qal-1',
        question: 'Tại sao mặt nước hồ phẳng lặng lại có thể soi bóng bầu trời và cây cối y như một chiếc gương phẳng?',
        shortAnswer: 'Mặt nước phẳng lặng đóng vai trò như một bề mặt phản xạ nhẵn bóng, xảy ra hiện tượng phản xạ ánh sáng định hướng (phản xạ gương) tạo nên ảnh ảo đối xứng của cảnh vật.',
        followUpPrompt: 'Nếu có gió thổi làm mặt nước gợn sóng thì hiện tượng gì sẽ xảy ra với hình ảnh soi bóng?',
        category: 'Hiện tượng đời sống',
      },
      {
        id: 'sp-qal-2',
        question: 'Làm sao để phân biệt giữa "Phản xạ thông thường" và "Tán xạ ánh sáng"?',
        shortAnswer: 'Bề mặt nhẵn bóng (gương, kính) phản xạ các tia sáng song song theo cùng một hướng (phản xạ gương). Bề mặt gồ ghề (tờ giấy, bức tường) hắt các tia sáng tán xạ ra đủ mọi hướng khác nhau.',
        followUpPrompt: 'Nhờ có tán xạ mà chúng ta có thể nhìn thấy tờ giấy từ mọi góc nhìn như thế nào?',
        category: 'Sai lầm thường gặp',
      },
      {
        id: 'sp-qal-3',
        question: 'Một người cần một chiếc gương phẳng có chiều cao tối thiểu bằng bao nhiêu để có thể soi được toàn bộ cơ thể của mình?',
        shortAnswer: 'Cần một chiếc gương có chiều cao tối thiểu bằng đúng một nửa chiều cao cơ thể (H/2), và đặt ở độ cao thích hợp, bất kể người đó đứng gần hay xa gương.',
        followUpPrompt: 'Hãy vẽ đường đi tia sáng từ đỉnh đầu và chân tới mắt để chứng minh kết luận thú vị này?',
        category: 'Tư duy liên hệ',
      },
    ],
  },
];

export const ensureStudyPackVersions = (pack: StudyPack): StudyPack => {
  if (!Array.isArray(pack.versions) || pack.versions.length === 0) {
    const v1: StudyPackVersion = {
      id: `ver-${pack.id || Date.now()}-1`,
      versionNumber: 1,
      name: 'Phiên bản 1 (Bản gốc)',
      createdAt: pack.createdAt || Date.now(),
      generatorMode: 'standard',
      summary: pack.summary || '',
      keyPoints: pack.keyPoints || [],
      flashcards: pack.flashcards || [],
      practiceQuestions: pack.practiceQuestions || [],
      qaSeeds: pack.qaSeeds || [],
      note: 'Bản tạo lập ban đầu của bài học',
    };
    return {
      ...pack,
      currentVersionId: v1.id,
      versions: [v1],
    };
  }
  return pack;
};

export const loadStoredStudyPacks = (): StudyPack[] => {
  try {
    const raw = localStorage.getItem(STUDY_PACKS_STORAGE_KEY);
    let list: StudyPack[] = [];
    if (!raw) {
      list = DEFAULT_STUDY_PACKS;
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        list = DEFAULT_STUDY_PACKS;
      } else {
        list = parsed;
      }
    }
    // Ensure all packs have valid versions array
    const ensured = list.map(ensureStudyPackVersions);
    return ensured;
  } catch (e) {
    console.warn('Lỗi đọc study packs từ storage:', e);
    return DEFAULT_STUDY_PACKS.map(ensureStudyPackVersions);
  }
};

export const saveStudyPacksToStorage = (packs: StudyPack[]): void => {
  try {
    const ensured = packs.map(ensureStudyPackVersions);
    localStorage.setItem(STUDY_PACKS_STORAGE_KEY, JSON.stringify(ensured));
  } catch (e) {
    console.error('Lỗi lưu study packs vào storage:', e);
  }
};

export const addOrUpdateStudyPackInStorage = (pack: StudyPack): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const ensuredPack = ensureStudyPackVersions(pack);
  const index = packs.findIndex((p) => p.id === ensuredPack.id || (ensuredPack.sourceId && p.sourceId === ensuredPack.sourceId));
  let updated: StudyPack[];
  if (index >= 0) {
    updated = [...packs];
    // Merge versions if existing has more
    const existing = packs[index];
    const mergedVersions = ensuredPack.versions && ensuredPack.versions.length > 0
      ? ensuredPack.versions
      : existing.versions || [];
    updated[index] = {
      ...ensuredPack,
      id: existing.id,
      versions: mergedVersions,
      currentVersionId: ensuredPack.currentVersionId || existing.currentVersionId,
    };
  } else {
    updated = [ensuredPack, ...packs];
  }
  saveStudyPacksToStorage(updated);
  return updated;
};

export const deleteStudyPackFromStorage = (packId: string): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.filter((p) => p.id !== packId);
  saveStudyPacksToStorage(updated);
  return updated;
};

/**
 * Thêm phiên bản mới vào Study Pack
 * @param packId ID của gói học tập
 * @param version Phiên bản mới được sinh
 * @param setActive Nếu true, kích hoạt nội dung phiên bản này làm nội dung hiện tại
 */
export const addStudyPackVersion = (
  packId: string,
  version: StudyPackVersion,
  setActive: boolean = true
): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.map((p) => {
    if (p.id === packId) {
      const ensured = ensureStudyPackVersions(p);
      const currentVersions = ensured.versions || [];
      const newVersions = [version, ...currentVersions.filter((v) => v.id !== version.id)];
      if (setActive) {
        return {
          ...ensured,
          currentVersionId: version.id,
          updatedAt: Date.now(),
          summary: version.summary,
          keyPoints: version.keyPoints,
          flashcards: version.flashcards,
          practiceQuestions: version.practiceQuestions,
          qaSeeds: version.qaSeeds,
          versions: newVersions,
        };
      }
      return {
        ...ensured,
        updatedAt: Date.now(),
        versions: newVersions,
      };
    }
    return p;
  });
  saveStudyPacksToStorage(updated);
  return updated;
};

/**
 * Chuyển đổi và kích hoạt một phiên bản cụ thể của Study Pack
 */
export const switchStudyPackVersion = (packId: string, versionId: string): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.map((p) => {
    if (p.id === packId) {
      const ensured = ensureStudyPackVersions(p);
      const targetVersion = (ensured.versions || []).find((v) => v.id === versionId);
      if (targetVersion) {
        return {
          ...ensured,
          currentVersionId: targetVersion.id,
          updatedAt: Date.now(),
          summary: targetVersion.summary,
          keyPoints: targetVersion.keyPoints,
          flashcards: targetVersion.flashcards,
          practiceQuestions: targetVersion.practiceQuestions,
          qaSeeds: targetVersion.qaSeeds,
        };
      }
    }
    return p;
  });
  saveStudyPacksToStorage(updated);
  return updated;
};

/**
 * Xóa một phiên bản của Study Pack (giữ lại tối thiểu 1 phiên bản)
 */
export const deleteStudyPackVersion = (packId: string, versionId: string): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.map((p) => {
    if (p.id === packId) {
      const ensured = ensureStudyPackVersions(p);
      const currentVersions = ensured.versions || [];
      if (currentVersions.length <= 1) {
        return ensured; // Không xóa nếu chỉ còn 1 bản duy nhất
      }
      const filtered = currentVersions.filter((v) => v.id !== versionId);
      let newCurrentId = ensured.currentVersionId;
      let newPack = { ...ensured, versions: filtered };
      // Nếu phiên bản bị xóa đang là phiên bản kích hoạt, chuyển sang bản đầu tiên còn lại
      if (ensured.currentVersionId === versionId && filtered.length > 0) {
        const fallbackVersion = filtered[0];
        newPack = {
          ...newPack,
          currentVersionId: fallbackVersion.id,
          summary: fallbackVersion.summary,
          keyPoints: fallbackVersion.keyPoints,
          flashcards: fallbackVersion.flashcards,
          practiceQuestions: fallbackVersion.practiceQuestions,
          qaSeeds: fallbackVersion.qaSeeds,
        };
      }
      return newPack;
    }
    return p;
  });
  saveStudyPacksToStorage(updated);
  return updated;
};

/**
 * Đổi tên hoặc ghi chú của một phiên bản
 */
export const renameStudyPackVersion = (
  packId: string,
  versionId: string,
  newName: string,
  newNote?: string
): StudyPack[] => {
  const packs = loadStoredStudyPacks();
  const updated = packs.map((p) => {
    if (p.id === packId) {
      const ensured = ensureStudyPackVersions(p);
      const updatedVersions = (ensured.versions || []).map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            name: newName.trim() || v.name,
            note: newNote !== undefined ? newNote.trim() : v.note,
          };
        }
        return v;
      });
      return {
        ...ensured,
        versions: updatedVersions,
      };
    }
    return p;
  });
  saveStudyPacksToStorage(updated);
  return updated;
};

// ==========================================
// LESSON CHATBOT LOCAL STORAGE FUNCTIONS
// ==========================================
export const loadLessonChatMessages = (contextId: string): LessonChatMessage[] => {
  try {
    const raw = localStorage.getItem(LESSON_CHATS_STORAGE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    return Array.isArray(store[contextId]) ? store[contextId] : [];
  } catch {
    return [];
  }
};

export const saveLessonChatMessage = (
  contextId: string,
  message: LessonChatMessage
): LessonChatMessage[] => {
  try {
    const raw = localStorage.getItem(LESSON_CHATS_STORAGE_KEY);
    const store: Record<string, LessonChatMessage[]> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(store[contextId]) ? store[contextId] : [];
    const updated = [...existing, message];
    store[contextId] = updated;
    localStorage.setItem(LESSON_CHATS_STORAGE_KEY, JSON.stringify(store));
    return updated;
  } catch (e) {
    console.error('Lỗi lưu tin nhắn chat bài học vào storage:', e);
    return [message];
  }
};

export const clearLessonChatMessages = (contextId: string): void => {
  try {
    const raw = localStorage.getItem(LESSON_CHATS_STORAGE_KEY);
    if (!raw) return;
    const store = JSON.parse(raw);
    delete store[contextId];
    localStorage.setItem(LESSON_CHATS_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Lỗi xóa lịch sử chat bài học:', e);
  }
};

// ==========================================
// FLASHCARD VERSIONS & CHAT LOCAL STORAGE FUNCTIONS
// ==========================================
export const loadFlashcardVersions = (): FlashcardVersion[] => {
  try {
    const raw = localStorage.getItem(FLASHCARD_VERSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveFlashcardVersions = (versions: FlashcardVersion[]): void => {
  try {
    localStorage.setItem(FLASHCARD_VERSIONS_KEY, JSON.stringify(versions));
  } catch (e) {
    console.error('Lỗi lưu danh sách phiên bản flashcards:', e);
  }
};

export const addFlashcardVersion = (version: FlashcardVersion): FlashcardVersion[] => {
  const versions = loadFlashcardVersions();
  const updated = [version, ...versions.filter((v) => v.id !== version.id)];
  saveFlashcardVersions(updated);
  return updated;
};

export const deleteFlashcardVersion = (versionId: string): FlashcardVersion[] => {
  const versions = loadFlashcardVersions();
  const updated = versions.filter((v) => v.id !== versionId);
  saveFlashcardVersions(updated);
  return updated;
};

export const renameFlashcardVersion = (versionId: string, newName: string): FlashcardVersion[] => {
  const versions = loadFlashcardVersions();
  const updated = versions.map((v) => (v.id === versionId ? { ...v, name: newName.trim() || v.name } : v));
  saveFlashcardVersions(updated);
  return updated;
};

export const loadFlashcardChatMessages = (cardId: string): LessonChatMessage[] => {
  try {
    const raw = localStorage.getItem(FLASHCARD_CHATS_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    return Array.isArray(store[cardId]) ? store[cardId] : [];
  } catch {
    return [];
  }
};

export const saveFlashcardChatMessage = (
  cardId: string,
  message: LessonChatMessage
): LessonChatMessage[] => {
  try {
    const raw = localStorage.getItem(FLASHCARD_CHATS_KEY);
    const store: Record<string, LessonChatMessage[]> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(store[cardId]) ? store[cardId] : [];
    const updated = [...existing, message];
    store[cardId] = updated;
    localStorage.setItem(FLASHCARD_CHATS_KEY, JSON.stringify(store));
    return updated;
  } catch (e) {
    console.error('Lỗi lưu tin nhắn chat flashcard:', e);
    return [message];
  }
};

export const clearFlashcardChatMessages = (cardId: string): void => {
  try {
    const raw = localStorage.getItem(FLASHCARD_CHATS_KEY);
    if (!raw) return;
    const store = JSON.parse(raw);
    delete store[cardId];
    localStorage.setItem(FLASHCARD_CHATS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Lỗi xóa lịch sử chat flashcard:', e);
  }
};

// ==========================================
// QUIZ QUESTION CHATBOT LOCAL STORAGE FUNCTIONS
// ==========================================
export const loadQuizChatMessages = (questionId: string): QuizChatMessage[] => {
  try {
    const raw = localStorage.getItem(QUIZ_CHATS_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    return Array.isArray(store[questionId]) ? store[questionId] : [];
  } catch {
    return [];
  }
};

export const saveQuizChatMessage = (
  questionId: string,
  message: QuizChatMessage
): QuizChatMessage[] => {
  try {
    const raw = localStorage.getItem(QUIZ_CHATS_KEY);
    const store: Record<string, QuizChatMessage[]> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(store[questionId]) ? store[questionId] : [];
    const updated = [...existing, message];
    store[questionId] = updated;
    localStorage.setItem(QUIZ_CHATS_KEY, JSON.stringify(store));
    return updated;
  } catch (e) {
    console.error('Lỗi lưu tin nhắn chat quiz:', e);
    return [message];
  }
};

export const clearQuizChatMessages = (questionId: string): void => {
  try {
    const raw = localStorage.getItem(QUIZ_CHATS_KEY);
    if (!raw) return;
    const store = JSON.parse(raw);
    delete store[questionId];
    localStorage.setItem(QUIZ_CHATS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Lỗi xóa lịch sử chat quiz:', e);
  }
};

// ==========================================
// AI MENTOR CONVERSATION SESSIONS (LOCAL STORAGE)
// ==========================================
export const loadAiMentorSessions = (): AiMentorChatSession[] => {
  try {
    const raw = localStorage.getItem(AI_MENTOR_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAiMentorSessions = (sessions: AiMentorChatSession[]): void => {
  try {
    localStorage.setItem(AI_MENTOR_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Lỗi lưu danh sách phiên AI Mentor:', e);
  }
};

export const getActiveAiMentorSessionId = (): string | null => {
  try {
    return localStorage.getItem(AI_MENTOR_ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
};

export const setActiveAiMentorSessionId = (id: string): void => {
  try {
    localStorage.setItem(AI_MENTOR_ACTIVE_SESSION_KEY, id);
  } catch (e) {
    console.error('Lỗi lưu active session id:', e);
  }
};

export const createAiMentorSession = (
  title?: string,
  topic: string = 'Vật lý & Khoa học Đời sống',
  initialMessage?: ChatMessage
): AiMentorChatSession => {
  const sessions = loadAiMentorSessions();
  const now = Date.now();
  const defaultTitle = title || `Nghiên cứu: ${topic} (${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
  const newSession: AiMentorChatSession = {
    id: `session-ai-${now}`,
    title: defaultTitle,
    topic,
    createdAt: now,
    updatedAt: now,
    messages: initialMessage ? [initialMessage] : [
      {
        id: `welcome-${now}`,
        sender: 'assistant',
        text: `Xin chào! Tôi là **Cố Vấn Khoa Học AI (Gemini 3.8 Flash)**.

Phiên nghiên cứu này đã được **tự động lưu vào Local Storage** của trình duyệt. Tôi sẵn sàng hỗ trợ bạn khám phá:
• Các hiện tượng **sóng âm, thính lực, tiếng ồn, tần số và decibel**.
• **Quang học, khúc xạ, tán sắc, ánh sáng xanh & bảo vệ mắt**.
• Các ứng dụng thực tế trong sinh hoạt, mẹo thí nghiệm tại nhà.`,
        timestamp: now,
        topic,
      }
    ],
  };

  const updated = [newSession, ...sessions];
  saveAiMentorSessions(updated);
  setActiveAiMentorSessionId(newSession.id);
  return newSession;
};

export const updateAiMentorSessionMessages = (
  sessionId: string,
  messages: ChatMessage[],
  newTopic?: string
): void => {
  const sessions = loadAiMentorSessions();
  const now = Date.now();
  const updated = sessions.map((s) => {
    if (s.id === sessionId) {
      // Tự động cập nhật tiêu đề nếu tiêu đề mặc định và có câu hỏi đầu tiên của người dùng
      let newTitle = s.title;
      const firstUserMsg = messages.find((m) => m.sender === 'user');
      if (firstUserMsg && s.title.startsWith('Nghiên cứu:')) {
        newTitle = firstUserMsg.text.slice(0, 35) + (firstUserMsg.text.length > 35 ? '...' : '');
      }
      return {
        ...s,
        title: newTitle,
        topic: newTopic || s.topic,
        updatedAt: now,
        messages,
      };
    }
    return s;
  });
  saveAiMentorSessions(updated);
};

export const deleteAiMentorSession = (sessionId: string): AiMentorChatSession[] => {
  const sessions = loadAiMentorSessions();
  const updated = sessions.filter((s) => s.id !== sessionId);
  saveAiMentorSessions(updated);
  return updated;
};

export const renameAiMentorSession = (sessionId: string, newTitle: string): AiMentorChatSession[] => {
  const sessions = loadAiMentorSessions();
  const updated = sessions.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() || s.title } : s));
  saveAiMentorSessions(updated);
  return updated;
};


/**
 * Sinh Study Pack 5 thành phần hoàn chỉnh từ một bài học cụ thể
 * Theo thứ tự sư phạm tối ưu cho học sinh lớp 7 trở lên:
 * 1. Summary
 * 2. Key Points
 * 3. Flashcards
 * 4. Practice Questions (nhiều dạng)
 * 5. Q&A Seeds
 */
export const generateStudyPackFromSource = (
  source: StudySource,
  subjectTitle?: string
): StudyPack => {
  const title = source.title || 'Bài học Khoa học Tự nhiên';
  const content = source.content || '';
  const now = Date.now();

  // 1. Summary
  const summary = source.summary || createSmartSummaryAndKeyPoints(source.title, content).summary;

  // 2. Key Points
  const keyPoints =
    source.keyPoints && source.keyPoints.length > 0
      ? source.keyPoints
      : createSmartSummaryAndKeyPoints(source.title, content).keyPoints;

  // 3. Flashcards (đã tích hợp logic)
  const flashcards = generateFlashcardsFromSource(source, subjectTitle);

  // 4. Practice Questions nhiều dạng phù hợp lớp 7
  const practiceQuestions: PracticeQuestion[] = [
    {
      id: `sp-q-${source.id}-1`,
      type: 'multiple_choice',
      question: `Nội dung cốt lõi nhất được đề cập trong bài học "${title}" là gì?`,
      options: [
        `A. Bản chất khoa học và nguyên lý vận hành của ${title}`,
        `B. Lịch sử chi tiết các nhà khoa học cổ đại`,
        `C. Các bài toán tính toán phức tạp trên máy tính`,
        `D. Chỉ là lý thuyết sách vở không có ứng dụng`,
      ],
      correctAnswer: `A. Bản chất khoa học và nguyên lý vận hành của ${title}`,
      explanation: `Bài học tập trung làm sáng tỏ các quy luật khách quan, nguyên lý cơ bản và ứng dụng thực tế của "${title}".`,
      hint: 'Dựa vào phần tóm tắt và các điểm then chốt của bài học.',
    },
    {
      id: `sp-q-${source.id}-2`,
      type: 'true_false',
      question: `Khẳng định sau ĐÚNG hay SAI: "Các nguyên lý trong bài học '${title}' chỉ áp dụng được trong phòng thí nghiệm, không xuất hiện trong đời sống hàng ngày."`,
      correctAnswer: 'SAI',
      explanation: `SAI. Các kiến thức Khoa học Tự nhiên gắn liền chặt chẽ với các hiện tượng thực tế xung quanh chúng ta hàng ngày.`,
      hint: 'Hãy quan sát các ứng dụng thực tế được nêu trong bài.',
    },
    {
      id: `sp-q-${source.id}-3`,
      type: 'fill_in',
      question: `Để hiểu sâu bài học "${title}", học sinh cần nắm vững các __________ cốt lõi và biết vận dụng giải thích các hiện tượng __________ trong cuộc sống.`,
      correctAnswer: 'khái niệm (hoặc nguyên lý) / thực tế (hoặc tự nhiên)',
      explanation: 'Học khoa học hiệu quả cần kết hợp giữa hiểu bản chất khái niệm và liên hệ giải thích thực tiễn.',
      hint: 'Hai yếu tố: lý thuyết nền tảng và vận dụng đời sống.',
    },
    {
      id: `sp-q-${source.id}-4`,
      type: 'explain_phenomenon',
      question: `Hãy nêu một ví dụ thực tế trong đời sống minh họa trực tiếp cho bài học "${title}" mà em có thể tự quan sát được?`,
      correctAnswer: `Trong đời sống, ta có thể quan sát thấy nguyên lý của "${title}" qua các thiết bị quen thuộc hoặc hiện tượng tự nhiên xung quanh.`,
      explanation: `Khả năng liên hệ kiến thức bài học với thế giới thực tế giúp ghi nhớ lâu bền theo nguyên lý Active Recall.`,
      hint: 'Liên hệ với âm thanh, ánh sáng, thị giác hoặc sinh hoạt thường ngày.',
    },
  ];

  // 5. Q&A Seeds chuẩn bị cho Chatbot
  const qaSeeds: QaSeedItem[] = [
    {
      id: `sp-qa-${source.id}-1`,
      question: `Điểm quan trọng nhất mà em cần nhớ ngay sau khi học xong bài "${title}" là gì?`,
      shortAnswer: summary.slice(0, 180) + '...',
      followUpPrompt: `Có điều gì trong bài "${title}" khiến em còn cảm thấy khó hiểu hoặc mâu thuẫn không?`,
      category: 'Khái niệm thường hỏi',
    },
    {
      id: `sp-qa-${source.id}-2`,
      question: `Học sinh lớp 7 khi làm bài tập về chủ đề "${title}" hay mắc lỗi sai hoặc nhầm lẫn gì nhất?`,
      shortAnswer: 'Thường nhầm lẫn giữa định nghĩa và ứng dụng, hoặc nhầm giữa các đại lượng đo lường (như tần số và biên độ, góc tới và góc hợp với gương).',
      followUpPrompt: 'Em có muốn làm thử một câu trắc nghiệm bẫy về lỗi này không?',
      category: 'Sai lầm thường gặp',
    },
    {
      id: `sp-qa-${source.id}-3`,
      question: `Bài học "${title}" có thể ứng dụng vào việc bảo vệ sức khỏe hoặc giải quyết vấn đề gì trong gia đình em?`,
      shortAnswer: 'Giúp giải thích các biện pháp an toàn, cách bố trí chiếu sáng hoặc cách giảm thiểu tiếng ồn khoa học trong học tập và sinh hoạt.',
      followUpPrompt: 'Góc học tập ở nhà của em đã áp dụng các tiêu chuẩn khoa học này chưa?',
      category: 'Hiện tượng đời sống',
    },
    {
      id: `sp-qa-${source.id}-4`,
      question: `Nếu mở rộng bài học "${title}" lên các lớp trên thì kiến thức này sẽ phát triển tiếp như thế nào?`,
      shortAnswer: 'Kiến thức sẽ được phát triển lên mức định lượng cao hơn với các công thức toán học, đồ thị sóng và ứng dụng kỹ thuật công nghệ sâu hơn.',
      followUpPrompt: 'Em có muốn tìm hiểu trước một công thức nâng cao liên quan không?',
      category: 'Tư duy liên hệ',
    },
  ];

  return {
    id: `sp-${source.id}-${now}`,
    sourceId: source.id,
    sourceTitle: source.title,
    subjectId: source.subjectId,
    subjectTitle: subjectTitle || 'Khoa học Tự nhiên',
    gradeLevel: 'Lớp 7+',
    createdAt: now,
    summary,
    keyPoints,
    flashcards,
    practiceQuestions,
    qaSeeds,
  };
};

export const generateAllStudyPacks = (
  sources?: StudySource[],
  subjects?: StudySubject[]
): StudyPack[] => {
  const activeSources = sources || loadStudySources();
  const activeSubjects = subjects || loadStudySubjects();
  const existingPacks = loadStoredStudyPacks();

  const newPacks: StudyPack[] = [...existingPacks];

  for (const src of activeSources) {
    const subj = activeSubjects.find((s) => s.id === src.subjectId);
    const generated = generateStudyPackFromSource(src, subj?.title);
    
    const existingIndex = newPacks.findIndex(
      (p) => p.sourceId === src.id || p.sourceTitle.toLowerCase().trim() === src.title.toLowerCase().trim()
    );
    if (existingIndex >= 0) {
      newPacks[existingIndex] = { ...generated, id: newPacks[existingIndex].id };
    } else {
      newPacks.push(generated);
    }
  }

  saveStudyPacksToStorage(newPacks);
  return newPacks;
};

// ==========================================
// BUỔI 4: QUIZ MODE & ĐẤU TRƯỜNG ĐÁNH GIÁ THÔNG MINH
// ==========================================

export const DEFAULT_QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'quiz-snd-01',
    sourceId: 'src-sound-1',
    sourceTitle: 'Nguồn âm & Sự dao động',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Điều kiện tất yếu để một vật phát ra âm thanh là gì?',
    options: [
      'Vật đó phải được làm nóng lên',
      'Vật đó phải đứng yên tuyệt đối',
      'Vật đó phải dao động (rung động)',
      'Vật đó phải đặt trong môi trường chân không'
    ],
    correctAnswer: 2,
    explanation: 'Mọi vật phát ra âm thanh đều đang dao động (rung động). Khi gảy đàn ghita, dây đàn rung; khi ta nói, dây thanh quản trong cổ họng rung.',
    hint: 'Hãy thử chạm tay nhẹ vào cổ họng khi đang phát âm "Aaaa" xem có cảm nhận thấy gì rung không.',
    reviewHint: 'Âm thanh bắt nguồn từ dao động. Muốn phát ra âm thì vật phải rung động dao động.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Học sinh hay nhầm rằng chỉ cần va đập là có âm, nhưng bản chất của cú va đập là kích hoạt sự dao động cơ học của vật thể.',
    category: 'Khái niệm cơ bản'
  },
  {
    id: 'quiz-snd-02',
    sourceId: 'src-sound-2',
    sourceTitle: 'Độ cao của âm & Tần số dao động',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Tại sao tiếng đập cánh của con muỗi vo ve rất chói tai (âm bổng), còn tiếng đập cánh của chim bồ câu lại không nghe thấy tiếng vo ve?',
    options: [
      'Vì cánh chim bồ câu quá nhẹ không tạo được sóng âm',
      'Vì muỗi đập cánh với tần số rất cao (500 - 600 Hz), còn bồ câu đập rất chậm (vài Hz, dưới ngưỡng nghe của tai)',
      'Vì chim bồ câu bay cao hơn nên sóng âm bị triệt tiêu hết',
      'Vì muỗi có cơ quan phát âm đặc biệt ở miệng chứ không phải từ cánh'
    ],
    correctAnswer: 1,
    explanation: 'Độ cao của âm phụ thuộc vào tần số dao động (số dao động trong 1 giây, đơn vị Hz). Muỗi đập cánh 500-600 lần/giây (tần số cao -> âm bổng chói). Bồ câu chỉ đập cánh vài lần/giây (dưới 20 Hz, thuộc vùng hạ âm tai người không nghe được).',
    hint: 'Nhớ lại mối quan hệ: Dao động càng nhanh -> Tần số càng lớn -> Âm phát ra càng bổng (cao).',
    reviewHint: 'Dao động càng nhanh -> Tần số càng lớn (Hz) -> Âm phát ra càng bổng (cao).',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Học sinh dễ nhầm lẫn giữa "Độ to" (to/nhỏ) và "Độ cao" (trầm/bổng).',
    category: 'Hiện tượng đời sống'
  },
  {
    id: 'quiz-snd-03',
    sourceId: 'src-sound-3',
    sourceTitle: 'Độ to của âm & Biên độ',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'true_false',
    question: 'Gõ trống càng mạnh thì biên độ dao động của mặt trống càng lớn, dẫn đến âm thanh phát ra càng cao (bổng).',
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 1, // SAI
    explanation: 'SAI! Gõ trống càng mạnh thì biên độ dao động càng lớn, âm thanh phát ra càng TO (lớn), chứ KHÔNG làm thay đổi độ cao (trầm/bổng) của âm. Độ cao do tần số quyết định.',
    hint: 'Phân biệt rõ: Biên độ quyết định Độ TO (dB); Tần số quyết định Độ CAO (Hz).',
    reviewHint: 'Biên độ dao động quyết định Độ To (dB); Tần số quyết định Độ Cao (Hz). Biên độ lớn chỉ làm âm to hơn.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Sai lầm kinh điển: Đồng nhất "nói to" với "nói giọng cao".',
    category: 'Bẫy khái niệm'
  },
  {
    id: 'quiz-snd-04',
    sourceId: 'src-sound-1',
    sourceTitle: 'Sự truyền âm trong các môi trường',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Thứ tự tốc độ truyền âm thanh giảm dần trong các môi trường là:',
    options: [
      'Chất khí > Chất lỏng > Chất rắn > Chân không',
      'Chất rắn > Chất lỏng > Chất khí (Chân không không truyền được âm)',
      'Chân không > Chất khí > Chất lỏng > Chất rắn',
      'Chất lỏng > Chất rắn > Chất khí'
    ],
    correctAnswer: 1,
    explanation: 'Sóng âm là sóng cơ học truyền qua sự va chạm của các phân tử vật chất. Mật độ phân tử ở chất rắn dày đặc nhất -> truyền nhanh nhất (~5000 m/s trong thép); chất lỏng trung bình (~1500 m/s trong nước); chất khí thưa thớt nhất (~340 m/s trong không khí). Chân không không có vật chất nên âm không truyền được.',
    hint: 'Hãy nhớ lại tại sao ngày xưa người lính thường áp tai xuống đất để nghe tiếng vó ngựa quân địch từ xa.',
    reviewHint: 'Tốc độ truyền âm: Rắn > Lỏng > Khí. Môi trường chân không hoàn toàn không truyền được âm thanh.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Xem phim khoa học viễn tưởng thấy tàu vũ trụ nổ ầm ầm trong không gian là phi thực tế!',
    category: 'Quy luật vật lý'
  },
  {
    id: 'quiz-snd-05',
    sourceId: 'src-sound-2',
    sourceTitle: 'Phản xạ âm & Tiếng vang',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'fill_blank',
    question: 'Tai người chỉ phân biệt được âm trực tiếp và âm phản xạ (tiếng vang) khi hai âm này đến tai cách nhau ít nhất là bao nhiêu giây?',
    options: [
      '1/15 giây (khoảng 0.067 giây)',
      '1 giây',
      '0.001 giây',
      '5 giây'
    ],
    correctAnswer: 0,
    explanation: 'Tai người có khả năng ghi nhận âm thanh trong khoảng 1/15 giây. Nếu âm phản xạ đến sau âm trực tiếp từ 1/15 giây trở lên (tương đương khoảng cách từ nguồn âm đến vật cản tối thiểu khoảng 11.3 mét trong không khí), ta mới nghe rõ tiếng vang.',
    hint: 'Với vận tốc âm trong không khí v = 340 m/s, quãng đường cả đi lẫn về s = 2d = v * t = 340 * (1/15) ≈ 22.6m -> d ≈ 11.3m.',
    reviewHint: 'Tiếng vang xuất hiện khi âm phản xạ đến sau âm trực tiếp ít nhất 1/15 giây (khoảng cách cản d ≥ 11.3m).',
    difficulty: 'hard',
    points: 15,
    misconceptionTrap: 'Trong phòng nhỏ vẫn có âm phản xạ, nhưng vì đến trước 1/15s nên âm phản xạ hòa lẫn vào âm trực tiếp làm âm nghe to hơn chứ không tạo tiếng vang riêng biệt.',
    category: 'Vận dụng tính toán'
  },
  {
    id: 'quiz-light-01',
    sourceId: 'src-light-1',
    sourceTitle: 'Nguồn sáng & Vật sáng',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'multiple_choice',
    question: 'Trong các vật sau, vật nào là "NGUỒN SÁNG" thực sự?',
    options: [
      'Mặt Trăng tròn ngày rằm',
      'Tấm gương phẳng phản chiếu ánh nắng',
      'Con đom đóm đang phát sáng trong đêm',
      'Biển báo giao thông dạ quang'
    ],
    correctAnswer: 2,
    explanation: 'Nguồn sáng là vật TỰ NÓ phát ra ánh sáng. Con đom đóm nhờ phản ứng hóa sinh tự phát ra ánh sáng lạnh. Mặt Trăng, gương và biển báo chỉ là VẬT SÁNG vì chúng hắt lại (phản xạ) ánh sáng từ nguồn khác chiếu vào.',
    hint: 'Hỏi tự thân: Vật này có tự tạo ra photon ánh sáng được không hay chỉ phản chiếu ánh sáng nơi khác?',
    reviewHint: 'Nguồn sáng tự nó phát ra ánh sáng (Mặt Trời, đom đóm, ngọn nến). Mặt Trăng chỉ là vật sáng phản xạ.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Rất nhiều người lầm tưởng Mặt Trăng là nguồn sáng vì ban đêm thấy nó sáng rực rỡ.',
    category: 'Khái niệm cơ bản'
  },
  {
    id: 'quiz-light-02',
    sourceId: 'src-light-1',
    sourceTitle: 'Định luật phản xạ ánh sáng',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'multiple_choice',
    question: 'Chiếu một tia sáng tới bề mặt gương phẳng với góc tới i = 35 độ. Góc phản xạ i\' đo được là bao nhiêu?',
    options: [
      '55 độ',
      '35 độ',
      '70 độ',
      '90 độ'
    ],
    correctAnswer: 1,
    explanation: 'Theo định luật phản xạ ánh sáng: Góc phản xạ luôn luôn bằng góc tới (i\' = i). Do đó khi góc tới i = 35° thì góc phản xạ i\' = 35°.',
    hint: 'Lưu ý: Góc tới là góc hợp bởi tia tới và PHÁP TUYẾN của gương, không phải góc hợp với mặt gương.',
    reviewHint: 'Định luật phản xạ ánh sáng: Góc phản xạ luôn bằng góc tới (i\' = i). Chú ý góc được so với đường pháp tuyến.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Bẫy đề thi hay cho góc giữa tia tới và MẶT GƯƠNG (ví dụ 55°), học sinh vội vàng lấy số đó làm góc tới là sai.',
    category: 'Định luật vật lý'
  },
  {
    id: 'quiz-light-03',
    sourceId: 'src-light-2',
    sourceTitle: 'Hiện tượng khúc xạ ánh sáng',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'phenomenon_analysis',
    question: 'Khi nhúng một chiếc đũa thẳng vào cốc nước trong suốt, ta nhìn thấy chiếc đũa dường như bị gãy tại mặt nước. Hiện tượng này là do:',
    options: [
      'Nước làm chiếc đũa bị mềm ra và uốn cong cơ học',
      'Hiện tượng khúc xạ ánh sáng: tia sáng từ phần đũa dưới nước bị đổi phương khi truyền qua mặt phân cách giữa nước và không khí',
      'Hiện tượng ảo ảnh do nhiệt độ nước cao hơn không khí',
      'Định luật truyền thẳng của ánh sáng bị vi phạm hoàn toàn'
    ],
    correctAnswer: 1,
    explanation: 'Hiện tượng khúc xạ ánh sáng: Khi tia sáng truyền xiên góc từ môi trường trong suốt này (nước) sang môi trường trong suốt khác (không khí), tia sáng bị gãy khúc tại mặt phân cách, khiến mắt ta nhìn thấy ảnh ảo của phần đũa dưới nước bị nâng cao hơn vị trí thật.',
    hint: 'Chiếc đũa thật vẫn hoàn toàn thẳng tắp, mắt bị đánh lừa do đường truyền của tia sáng bị gãy.',
    reviewHint: 'Khúc xạ là hiện tượng tia sáng bị đổi phương (gãy khúc) khi truyền xiên góc qua mặt phân cách giữa 2 môi trường trong suốt.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Khi bắn cá dưới nước, người có kinh nghiệm phải ngắm chếch xuống dưới vị trí con cá nhìn thấy một chút vì con cá thật ở sâu hơn ảnh nhìn thấy.',
    category: 'Hiện tượng thực tế'
  },
  {
    id: 'quiz-life-01',
    sourceId: 'src-sound-3',
    sourceTitle: 'Ô nhiễm tiếng ồn & Sức khỏe thính giác',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Theo Tổ chức Y tế Thế giới (WHO), tiếp xúc liên tục với tiếng ồn vượt quá bao nhiêu Decibel (dB) mỗi ngày có nguy cơ gây tổn thương vĩnh viễn tế bào lông thính giác trong tai?',
    options: [
      '40 dB (tiếng thì thầm)',
      '60 dB (cuộc trò chuyện bình thường)',
      '85 dB (tiếng cưa máy, xe máy phân khối lớn, đeo tai nghe max âm lượng)',
      '140 dB'
    ],
    correctAnswer: 2,
    explanation: 'Mức 85 dB là ngưỡng an toàn nghề nghiệp tối đa trong 8 giờ. Vượt quá 85 dB (đặc biệt khi đeo tai nghe âm lượng trên 60%), các tế bào lông nhỏ li ti ở ốc tai bị xô đổ và không có khả năng tái sinh, dẫn đến điếc tiếp nhận vĩnh viễn.',
    hint: 'Quy tắc 60-60: Nghe tối đa 60% âm lượng và không quá 60 phút liên tục khi dùng tai nghe.',
    reviewHint: 'Ngưỡng an toàn thính lực là 85 dB. Áp dụng quy tắc 60-60: âm lượng < 60% và không nghe quá 60 phút liên tục.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Thính lực giảm dần dần và không gây đau đớn ngay, nên người trẻ thường chủ quan cho đến khi xuất hiện tiếng ù tai mạn tính (Tinnitus).',
    category: 'Bảo vệ sức khỏe'
  },
  {
    id: 'quiz-life-02',
    sourceId: 'src-light-2',
    sourceTitle: 'Ánh sáng xanh & Giấc ngủ sinh học',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'true_false',
    question: 'Dùng điện thoại hoặc máy tính trong phòng tối trước khi ngủ 1 tiếng làm mắt tiếp nhận nhiều ánh sáng xanh (bước sóng 400-480nm), kích thích tuyến tùng ngừng tiết hormone Melatonin, gây khó ngủ và rối loạn nhịp sinh học.',
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 0, // ĐÚNG
    explanation: 'ĐÚNG! Tế bào cảm quang ipRGC trong võng mạc cực kỳ nhạy cảm với ánh sáng xanh 460-480nm. Khi có ánh sáng này, não hiểu nhầm là ban ngày và ức chế tiết hormone ngủ Melatonin, khiến bạn trằn trọc và suy giảm chất lượng giấc ngủ sâu.',
    hint: 'Nên bật chế độ Night Shift / Lọc ánh sáng vàng và ngưng dùng thiết bị điện tử ít nhất 30-45 phút trước khi đi ngủ.',
    reviewHint: 'Ánh sáng xanh (400-480nm) ức chế tiết hormone ngủ Melatonin. Hãy tắt màn hình trước giờ ngủ 30-45 phút.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Nhiều người nghĩ chỉ cần giảm độ sáng màn hình là an toàn, nhưng ánh sáng xanh vẫn xuyên qua và ức chế não bộ.',
    category: 'Khoa học đời sống'
  },
  {
    id: 'quiz-opt-03',
    sourceId: 'src-light-1',
    sourceTitle: 'Định luật truyền thẳng ánh sáng',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'multiple_choice',
    question: 'Trong hiện tượng Nhật thực, bóng tối của thiên thể nào đổ lên thiên thể nào?',
    options: [
      'Bóng của Trái Đất đổ lên Mặt Trăng',
      'Bóng của Mặt Trăng đổ lên Trái Đất',
      'Bóng của Mặt Trời đổ lên Trái Đất',
      'Bóng của Sao Hỏa đổ lên Mặt Trời'
    ],
    correctAnswer: 1,
    explanation: 'Nhật thực xảy ra khi Mặt Trăng nằm chính giữa Mặt Trời và Trái Đất. Do ánh sáng truyền thẳng, Mặt Trăng chắn ánh sáng Mặt Trời và đổ bóng đen lên một vùng trên bề mặt Trái Đất. Người đứng trong vùng bóng đen đó sẽ thấy Nhật thực toàn phần.',
    hint: 'Nhật = Mặt Trời, Thực = bị che khuất. Mặt Trời bị che khuất khi nhìn từ Trái Đất do Mặt Trăng đứng chắn đường truyền thẳng của ánh sáng.',
    reviewHint: 'Nhật thực: Mặt Trăng nằm giữa che Mặt Trời, bóng Mặt Trăng đổ lên Trái Đất (do ánh sáng truyền thẳng).',
    difficulty: 'medium',
    points: 15,
    misconceptionTrap: 'Hay nhầm lẫn giữa Nhật thực (Mặt Trăng chắn Mặt Trời) và Nguyệt thực (Trái Đất chắn Mặt Trời, bóng Trái Đất đổ lên Mặt Trăng).',
    category: 'Thiên văn học vật lý'
  },
  {
    id: 'quiz-life-03',
    sourceId: 'src-light-2',
    sourceTitle: 'Bảo vệ thị lực trong học đường',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'fill_blank',
    question: 'Quy tắc "20 - 20 - 20" nổi tiếng trong việc chống mỏi mắt và cận thị học đường nghĩa là: Sau mỗi 20 phút nhìn màn hình/sách vở, hãy nhìn vào vật cách xa ít nhất bao nhiêu feet (khoảng 6 mét) trong 20 giây?',
    options: [
      '20 feet (khoảng 6 mét)',
      '20 mét',
      '2 feet (khoảng 60 cm)',
      '200 feet'
    ],
    correctAnswer: 0,
    explanation: 'Quy tắc 20 - 20 - 20 của Hiệp hội Nhãn khoa Hoa Kỳ: Cứ 20 phút làm việc, nhìn xa 20 feet (khoảng 6 mét) trong vòng ít nhất 20 giây để cơ thể mi (ciliary muscles) của mắt được thả lỏng hoàn toàn, tránh tình trạng co thắt điều tiết dẫn đến cận thị giả hoặc tăng độ cận.',
    hint: '20 phút - 20 feet (6m) - 20 giây.',
    reviewHint: 'Quy tắc 20-20-20: Cứ 20 phút học tập, nhìn xa 20 feet (6 mét) trong ít nhất 20 giây để mắt thư giãn.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Nghỉ giải lao nhưng lại lướt điện thoại thì mắt vẫn phải điều tiết ở cự ly gần và không được nghỉ ngơi.',
    category: 'Vệ sinh học đường'
  },
  {
    id: 'quiz-snd-06',
    sourceId: 'src-1',
    sourceTitle: 'Khái niệm tần số và ngưỡng nghe tai người',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Ngưỡng nghe thấy được của tai người bình thường nằm trong dải tần số nào?',
    options: [
      'Từ 20 Hz đến 20.000 Hz',
      'Từ 1 Hz đến 100 Hz',
      'Từ 20.000 Hz đến 100.000 Hz',
      'Mọi dải tần số đều nghe được'
    ],
    correctAnswer: 0,
    explanation: 'Dải tần số âm nghe được của người khỏe mạnh là từ 20 Hz đến 20.000 Hz. Dưới 20 Hz là hạ âm, trên 20.000 Hz là siêu âm mà tai người không cảm nhận được.',
    hint: 'Nhớ hai con số mốc: 20 và 20 ngàn.',
    reviewHint: 'Giới hạn thính giác người: 20 Hz - 20.000 Hz. < 20 Hz là hạ âm, > 20.000 Hz là siêu âm.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Nhiều người nghĩ tiếng chó sủa hay tiếng còi siêu âm là không có sóng âm, thực ra sóng vẫn tồn tại nhưng vượt ngưỡng 20.000 Hz.',
    category: 'Giới hạn thính giác'
  },
  {
    id: 'quiz-snd-07',
    sourceId: 'src-2',
    sourceTitle: 'Cấu tạo tai người và đường đi sóng âm',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'multiple_choice',
    question: 'Chuỗi xương nhỏ nhất trong cơ thể người nằm ở tai giữa có tên lần lượt là:',
    options: [
      'Xương búa, xương đe, xương bàn đạp',
      'Xương cánh tay, xương trụ, xương quay',
      'Xương đùi, xương chày, xương mác',
      'Xương sườn, xương ức, xương bả vai'
    ],
    correctAnswer: 0,
    explanation: 'Tai giữa chứa chuỗi 3 xương nhỏ nhất cơ thể: Xương búa (Malleus), Xương đe (Incus) và Xương bàn đạp (Stapes). Chúng hoạt động như một đòn bẩy cơ học khuếch đại lực rung màng nhĩ lên hơn 20 lần trước khi truyền vào ốc tai.',
    hint: 'Tên 3 công cụ nghề rèn truyền thống: Búa - Đe - Bàn đạp.',
    reviewHint: 'Chuỗi xương tai giữa: Xương búa - Xương đe - Xương bàn đạp, có tác dụng khuếch đại cơ học dao động âm thanh.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Học sinh hay nghĩ xương bàn đạp là ở chân, nhưng trong giải phẫu xương bàn đạp tai là xương nhỏ nhất cơ thể.',
    category: 'Cơ chế thính giác'
  },
  {
    id: 'quiz-snd-08',
    sourceId: 'src-1',
    sourceTitle: 'Sự truyền âm trong các môi trường',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'phenomenon_analysis',
    question: 'Đặt một chuông điện đang kêu bên trong một bình thủy tinh kín rồi từ từ hút hết không khí ra. Hiện tượng quan sát được là:',
    options: [
      'Tiếng chuông vẫn kêu to như bình thường',
      'Tiếng chuông nhỏ dần rồi hoàn toàn không còn nghe thấy gì nữa',
      'Tiếng chuông kêu bổng và to hơn gấp đôi',
      'Bình thủy tinh tự vỡ tung do áp suất sóng âm'
    ],
    correctAnswer: 1,
    explanation: 'Sóng âm là sóng cơ học đòi hỏi môi trường vật chất (chất rắn, lỏng, khí) để truyền dao động. Khi không khí trong bình bị hút cạn tạo thành chân không, không còn các phân tử vật chất truyền dao động nên ta không nghe thấy tiếng chuông nữa dù búa chuông vẫn đang gõ.',
    hint: 'Chân không không chứa vật chất -> không thể truyền được sóng cơ học.',
    reviewHint: 'Âm thanh không thể truyền qua chân không. Thí nghiệm chuông trong bình chân không chứng minh sóng âm cần môi trường vật chất.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Quan sát thấy búa chuông vẫn chuyển động nhưng tai không nghe thấy âm, chứng tỏ ánh sáng truyền được trong chân không còn âm thanh thì không.',
    category: 'Bản chất sóng âm'
  },
  {
    id: 'quiz-snd-09',
    sourceId: 'src-1',
    sourceTitle: 'Ứng dụng của sóng âm trong sinh học & kỹ thuật',
    subjectId: 'subj-sound',
    subjectTitle: 'Vật lý: Âm học & Sóng âm trong đời sống',
    type: 'true_false',
    question: 'Loài dơi bay và săn mồi trong bóng đêm hoàn toàn không cần dựa vào mắt nhờ phát ra chùm sóng siêu âm rồi lắng nghe âm phản xạ trở lại (Định vị bằng hồi âm - Echolocation).',
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 0,
    explanation: 'ĐÚNG! Dơi phát ra xung siêu âm tần số 20.000 - 120.000 Hz qua miệng hoặc mũi. Khi sóng gặp chướng ngại vật hoặc côn trùng sẽ phản xạ về tai dơi. Não dơi phân tích thời gian trễ và cường độ âm để dựng bản đồ 3D cực kỳ chính xác.',
    hint: 'Nguyên lý tương tự máy quét Sonar tàu ngầm quân sự và máy siêu âm thai nhi.',
    reviewHint: 'Định vị hồi âm (Echolocation): Dơi và cá heo dùng siêu âm phản xạ để định vị con mồi và vật cản trong đêm.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Nhiều người nghĩ mắt dơi bị mù hoàn toàn, thực ra mắt dơi vẫn nhìn được nhưng trong bóng tối dơi dùng siêu âm chính xác hơn.',
    category: 'Ứng dụng sinh học'
  },
  {
    id: 'quiz-light-04',
    sourceId: 'src-light-1',
    sourceTitle: 'Tán sắc ánh sáng qua lăng kính',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'multiple_choice',
    question: 'Khi chiếu một chùm ánh sáng trắng Mặt Trời qua lăng kính thủy tinh, chùm sáng bị tách thành dải màu biến thiên liên tục từ:',
    options: [
      'Đỏ đến Tím (Đỏ, da cam, vàng, lục, lam, chàm, tím)',
      'Chỉ có 2 màu Đen và Trắng',
      'Chỉ có 3 màu Đỏ, Xanh lục và Xanh lam',
      'Chùm sáng đi thẳng không bị đổi màu'
    ],
    correctAnswer: 0,
    explanation: 'Nhà bác học Isaac Newton năm 1666 đã làm thí nghiệm chứng minh ánh sáng trắng Mặt Trời là tập hợp của vô số ánh sáng đơn sắc. Vì chiết suất của thủy tinh đối với các màu khác nhau là khác nhau (tia tím bị lệch nhiều nhất, tia đỏ bị lệch ít nhất), lăng kính đã phân tách chúng thành dải 7 sắc cầu vồng.',
    hint: 'Khẩu quyết nhớ màu: Đỏ - Cam - Vàng - Lục - Lam - Chàm - Tím.',
    reviewHint: 'Tán sắc ánh sáng: Ánh sáng trắng qua lăng kính tách thành 7 màu chính: Đỏ - Cam - Vàng - Lục - Lam - Chàm - Tím (tia tím lệch nhiều nhất, tia đỏ lệch ít nhất).',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Lăng kính không tự nhuộm màu cho ánh sáng, nó chỉ phân tách các thành phần màu có sẵn trong ánh sáng trắng.',
    category: 'Hiện tượng quang học'
  },
  {
    id: 'quiz-light-05',
    sourceId: 'src-light-1',
    sourceTitle: 'Phản xạ toàn phần trong sợi quang học',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'multiple_choice',
    question: 'Công nghệ cáp quang Internet tốc độ cao truyền tín hiệu ánh sáng đi xuyên lục địa dựa trên hiện tượng vật lý nào?',
    options: [
      'Hiện tượng phản xạ toàn phần (Total Internal Reflection)',
      'Hiện tượng phân rã hạt nhân',
      'Hiện tượng từ trường xoay chiều',
      'Hiện tượng khuếch tán nhiệt lượng'
    ],
    correctAnswer: 0,
    explanation: 'Sợi quang có lõi thủy tinh trong suốt chiết suất n1 được bọc bởi lớp vỏ chiết suất n2 nhỏ hơn (n1 > n2). Khi góc tới lớn hơn góc giới hạn phản xạ toàn phần (i > igh), toàn bộ tia sáng bị phản xạ giữ lại trong lõi mà không bị thoát ra ngoài, cho phép truyền dữ liệu tốc độ cực nhanh với suy hao tối thiểu.',
    hint: 'Tia sáng liên tục đập vào thành sợi thủy tinh và dội ngược lại 100% không bị khúc xạ ra ngoài.',
    reviewHint: 'Cáp quang Internet hoạt động dựa trên Hiện tượng phản xạ toàn phần ánh sáng ở mặt phân cách giữa lõi và vỏ sợi quang.',
    difficulty: 'hard',
    points: 15,
    misconceptionTrap: 'Cáp quang không truyền bằng dòng điện electron như dây đồng mà truyền bằng chùm photon ánh sáng laser.',
    category: 'Công nghệ vật lý'
  },
  {
    id: 'quiz-light-06',
    sourceId: 'src-light-1',
    sourceTitle: 'Tính chất ảnh tạo bởi gương phẳng',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'true_false',
    question: 'Khi bạn đứng cách gương phẳng 1 mét, ảnh của bạn nhìn thấy trong gương là ảnh ảo, có kích thước bằng người thật và cách gương đúng 1 mét (cách bạn 2 mét).',
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 0,
    explanation: 'ĐÚNG! Tính chất ảnh tạo bởi gương phẳng: Là ảnh ảo (không hứng được trên màn chắn), có độ lớn bằng đúng độ lớn của vật thật, và đối xứng với vật qua mặt phẳng gương (khoảng cách từ ảnh tới gương bằng khoảng cách từ vật tới gương). Do đó khoảng cách giữa bạn và ảnh của bạn là 1m + 1m = 2m.',
    hint: 'Gương phẳng: Ảnh ảo, bằng vật, đối xứng qua gương.',
    reviewHint: 'Gương phẳng cho ảnh ảo bằng vật, khoảng cách từ vật tới gương bằng khoảng cách từ ảnh tới gương.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Đề thi hay hỏi khoảng cách từ người tới ẢNH (phải nhân đôi khoảng cách từ người tới gương).',
    category: 'Quy luật quang hình'
  },
  {
    id: 'quiz-light-07',
    sourceId: 'src-light-1',
    sourceTitle: 'Sự hình thành cầu vồng sau mưa',
    subjectId: 'subj-light',
    subjectTitle: 'Quang học: Ánh sáng & Thị giác đời sống',
    type: 'phenomenon_analysis',
    question: 'Tại sao cầu vồng thường chỉ xuất hiện sau cơn mưa rào khi trời hửng nắng, và muốn ngắm cầu vồng bạn phải đứng ở vị trí nào?',
    options: [
      'Đứng nhìn thẳng về phía Mặt Trời',
      'Đứng quay lưng lại Mặt Trời, nhìn về phía màn hơi nước mưa',
      'Đứng trong phòng kín nhìn qua kính cửa sổ',
      'Cầu vồng chỉ nhìn thấy vào ban đêm khi có trăng tròn'
    ],
    correctAnswer: 1,
    explanation: 'Sau mưa, không khí chứa hàng triệu giọt nước nhỏ li ti. Ánh sáng Mặt Trời chiếu vào giọt nước bị khúc xạ vào trong, phản xạ một phần ở mặt sau giọt nước và khúc xạ trở lại không khí (tán sắc thành dải màu). Để nhìn thấy các tia sáng này dội lại, người quan sát phải đứng quay lưng về phía Mặt Trời.',
    hint: 'Mặt Trời chiếu từ sau lưng bạn -> tia sáng dội từ các giọt nước phía trước tới mắt bạn.',
    reviewHint: 'Cầu vồng sinh ra do tán sắc và phản xạ ánh sáng qua các giọt nước mưa. Để thấy cầu vồng, người quan sát phải quay lưng lại Mặt Trời.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Nhiều người nghĩ cầu vồng là vật thể cố định trên trời, thực chất nó là hiện tượng quang học phụ thuộc góc nhìn của mắt người.',
    category: 'Hiện tượng tự nhiên'
  },
  {
    id: 'quiz-health-01',
    sourceId: 'src-light-2',
    sourceTitle: 'Tiêu chuẩn độ rọi đèn bàn học chống cận thị',
    subjectId: 'subj-health',
    subjectTitle: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    type: 'multiple_choice',
    question: 'Theo tiêu chuẩn vệ sinh học đường của Bộ Y tế, độ rọi sáng (Lux) tối ưu trên mặt bàn học của học sinh để mắt không phải điều tiết quá mức là bao nhiêu?',
    options: [
      'Từ 300 đến 500 Lux',
      'Từ 10 đến 30 Lux (tương đương ánh trăng)',
      'Trên 10.000 Lux (như ánh nắng gắt giữa trưa)',
      'Càng tối càng tốt để rèn luyện mắt'
    ],
    correctAnswer: 0,
    explanation: 'Tiêu chuẩn quốc gia TCVN 7114 quy định độ rọi trên mặt bàn làm việc, bàn học tối thiểu từ 300 đến 500 Lux. Dưới 300 Lux mắt phải căng cơ điều tiết gây cận thị; trên 1000 Lux gây chói lóa mỏi mắt.',
    hint: 'Khoảng 300 - 500 Lux, ánh sáng đèn LED màu vàng ấm hoặc trắng trung tính phân bố đều không nhấp nháy.',
    reviewHint: 'Độ rọi bàn học chuẩn: 300 - 500 Lux. Ánh sáng đều, không chói lóa và không đổ bóng bàn tay khi viết bài.',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Dùng đèn ngủ vàng le lói để học bài làm tăng nguy cơ cận thị tiến triển cực kỳ nhanh.',
    category: 'Vệ sinh học đường'
  },
  {
    id: 'quiz-health-02',
    sourceId: 'src-light-2',
    sourceTitle: 'Cơ chế tật cận thị và kính khắc phục',
    subjectId: 'subj-health',
    subjectTitle: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    type: 'multiple_choice',
    question: 'Người bị tật cận thị khi nhìn vật ở xa thì ảnh của vật hội tụ ở đâu, và cần đeo loại kính nào để đưa ảnh về đúng màng lưới (võng mạc)?',
    options: [
      'Ảnh hội tụ ở TRƯỚC màng lưới -> Cần đeo kính có thấu kính phân kỳ',
      'Ảnh hội tụ ở SAU màng lưới -> Cần đeo kính có thấu kính hội tụ',
      'Ảnh hội tụ ngay trên màng lưới -> Không cần đeo kính gì',
      'Ảnh bị lệch sang một bên -> Cần đeo kính râm chống nắng'
    ],
    correctAnswer: 0,
    explanation: 'Ở mắt cận thị, trục nhãn cầu quá dài hoặc thể thủy tinh quá phồng khiến các tia sáng từ vật ở xa hội tụ ở TRƯỚC màng lưới (võng mạc), làm ảnh bị nhòe. Kính cận là thấu kính phân kỳ giúp làm chùm sáng hơi loe ra trước khi vào mắt, kéo vị trí ảnh lùi về hội tụ đúng trên màng lưới.',
    hint: 'Cận thị: Hội tụ TRƯỚC võng mạc -> Cần thấu kính PHÂN KỲ (mép dày, giữa mỏng).',
    reviewHint: 'Mắt cận thị: Ảnh của vật ở xa hội tụ trước màng lưới. Khắc phục bằng cách đeo kính có thấu kính phân kỳ.',
    difficulty: 'hard',
    points: 15,
    misconceptionTrap: 'Nhầm lẫn giữa mắt cận thị (đeo thấu kính phân kỳ) và mắt viễn thị / lão thị (đeo thấu kính hội tụ).',
    category: 'Quang học mắt'
  },
  {
    id: 'quiz-health-03',
    sourceId: 'src-light-2',
    sourceTitle: 'Khoảng cách an toàn đọc sách và tư thế ngồi học',
    subjectId: 'subj-health',
    subjectTitle: 'KHTN: Thị giác, Bảo vệ mắt & Tiêu chuẩn ánh sáng',
    type: 'multiple_choice',
    question: 'Khoảng cách an toàn tiêu chuẩn từ mắt đến mặt trang sách hoặc vở khi ngồi học bài là:',
    options: [
      '25 cm đến 30 cm (khoảng một gang tay rưỡi của học sinh)',
      '5 cm đến 10 cm (áp sát mắt vào trang vở)',
      '70 cm đến 1 mét',
      'Tùy ý thích, nằm đọc sách trên giường cũng được'
    ],
    correctAnswer: 0,
    explanation: 'Khoảng cách 25 - 30 cm là cự ly nhìn gần lý tưởng giúp cơ vòng mi của thể thủy tinh ở trạng thái điều tiết nhẹ nhàng nhất. Cúi gập người quá gần (<20 cm) khiến cơ mi phải co bóp tối đa liên tục, dẫn đến co quắp điều tiết và cận thị học đường.',
    hint: 'Quy tắc một thước kẻ nhỏ (25 - 30 cm) hoặc một sải gang tay.',
    reviewHint: 'Cự ly nhìn sách vở chuẩn: 25 - 30 cm. Lưng thẳng, ngực không tỳ vào bàn học.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Thói quen cúi sát mặt khi viết bài là nguyên nhân hàng đầu khiến độ cận tăng nhanh chóng.',
    category: 'Vệ sinh học đường'
  },
  {
    id: 'quiz-thunder-01',
    sourceId: 'src-1',
    sourceTitle: 'Hiện tượng sấm sét & Tốc độ truyền sóng',
    subjectId: 'subj-thunder',
    subjectTitle: 'KHTN: Hiện tượng sấm sét & Tốc độ truyền âm',
    type: 'phenomenon_analysis',
    question: 'Khi trời giông bão có sét đánh, tại sao ta luôn nhìn thấy ánh chớp lóe lên trước rồi một lát sau mới nghe thấy tiếng sấm rền?',
    options: [
      'Vì tia chớp phóng ra trước, sau đó 5 phút tia sét mới tạo ra âm thanh',
      'Vì tốc độ ánh sáng trong không khí (~300.000 km/s) nhanh gấp gần một triệu lần tốc độ âm thanh (~343 m/s = 0.343 km/s)',
      'Vì tai người phản xạ chậm hơn mắt người',
      'Vì mây mưa chắn hết âm thanh chỉ cho ánh sáng đi qua'
    ],
    correctAnswer: 1,
    explanation: 'Chớp và sấm được sinh ra cùng một thời điểm khi có sự phóng tia lửa điện giữa các đám mây giông. Ánh sáng truyền với vận tốc ánh sáng c ≈ 300.000 km/s (gần như tức thời đến mắt ta), trong khi âm thanh tiếng sấm chỉ truyền trong không khí với vận tốc khoảng 340 m/s (~1 km trong 3 giây), do đó tiếng sấm đến tai ta muộn hơn.',
    hint: 'So sánh tốc độ: Ánh sáng (300.000.000 m/s) vs Âm thanh (340 m/s).',
    reviewHint: 'Thấy chớp trước nghe sấm do vận tốc ánh sáng (~300.000 km/s) lớn hơn rất nhiều so với vận tốc âm thanh (~340 m/s).',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Nhiều người nghĩ chớp và sấm là 2 sự kiện xảy ra ở hai thời điểm khác nhau, thực chất chúng diễn ra đồng thời.',
    category: 'Hiện tượng tự nhiên'
  },
  {
    id: 'quiz-thunder-02',
    sourceId: 'src-1',
    sourceTitle: 'Đo khoảng cách bão sét bằng quy tắc đếm giây',
    subjectId: 'subj-thunder',
    subjectTitle: 'KHTN: Hiện tượng sấm sét & Tốc độ truyền âm',
    type: 'multiple_choice',
    question: 'Khi thấy chớp lóe lên, bạn bắt đầu đếm nhẩm: "1, 2, 3, 4, 5, 6 giây" thì nghe thấy tiếng sấm ầm ầm. Ước tính vị trí sét đánh cách bạn bao xa?',
    options: [
      'Khoảng 2 km (Lấy 6 giây chia cho 3)',
      'Khoảng 6 km',
      'Khoảng 20 km',
      'Sét đánh ngay tại chỗ bạn đứng'
    ],
    correctAnswer: 0,
    explanation: 'Âm thanh truyền trong không khí với tốc độ v ≈ 340 m/s. Quãng đường âm thanh đi được trong 3 giây xấp xỉ 1000m = 1 km (340 * 3 = 1020m). Do đó, quy tắc bỏ túi: Lấy số giây đo được chia cho 3 sẽ ra cự ly sét đánh theo kilomet (d = t / 3 = 6 / 3 = 2 km).',
    hint: 'Cứ 3 giây trôi qua = sóng âm đi được 1 km. 6 giây = 2 km.',
    reviewHint: 'Quy tắc đo khoảng cách giông sét: Khoảng cách (km) ≈ Số giây đếm được giữa chớp và sấm chia cho 3 (d = t / 3).',
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Học sinh lấy số giây nhân với 3 thay vì chia 3, dẫn đến tính sai khoảng cách gấp 9 lần.',
    category: 'Vận dụng tính toán'
  },
  {
    id: 'quiz-thunder-03',
    sourceId: 'src-1',
    sourceTitle: 'Cột thu lôi & An toàn phòng chống sét',
    subjectId: 'subj-thunder',
    subjectTitle: 'KHTN: Hiện tượng sấm sét & Tốc độ truyền âm',
    type: 'true_false',
    question: 'Cột thu lôi (cột chống sét do Benjamin Franklin phát minh) có đầu nhọn bằng kim loại cắm trên nóc tòa nhà cao tầng và nối dây dẫn lớn xuống đất nhằm chủ động hút và dẫn dòng điện tích khổng lồ của tia sét xuống lòng đất an toàn.',
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 0,
    explanation: 'ĐÚNG! Cột thu lôi hoạt động dựa trên hiệu ứng phóng điện mũi nhọn của vật dẫn tích điện. Khi đám mây giông tích điện bay qua, điện trường mạnh tập trung ở đầu nhọn cột thu lôi tạo dòng ion hóa, tạo đường dẫn điện có điện trở thấp nhất để sét phóng qua cột và truyền thẳng xuống đất thay vì đánh vào mái nhà hay thiết bị.',
    hint: 'Đầu nhọn tập trung điện trường cao nhất để hút tia sét về dây nối đất.',
    reviewHint: 'Cột thu lôi (cột chống sét) dùng đầu nhọn kim loại trên cao nối đất an toàn để dẫn dòng điện sét xuống đất bảo vệ công trình.',
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Cột thu lôi không xua đuổi sét mà là "chủ động mời sét đánh vào điểm an toàn nhất" để triệt tiêu năng lượng xuống đất.',
    category: 'An toàn tự nhiên'
  }
];

// Load Quiz History from Local Storage
export const loadQuizHistory = (): QuizSession[] => {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse quiz history:', err);
    return [];
  }
};

// Save a completed quiz session
export const saveQuizResult = (session: QuizSession): void => {
  try {
    const history = loadQuizHistory();
    // Keep max 50 recent sessions
    const updated = [session, ...history].slice(0, 50);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save quiz result:', err);
  }
};

// Load mistake questions for targeted review
export const loadMistakeQuestions = (): QuizQuestion[] => {
  try {
    const raw = localStorage.getItem(QUIZ_MISTAKES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse mistake questions:', err);
    return [];
  }
};

export const saveMistakeQuestions = (questions: QuizQuestion[]): void => {
  try {
    localStorage.setItem(QUIZ_MISTAKES_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save mistake questions:', err);
  }
};

export const addMistakeQuestion = (q: QuizQuestion): void => {
  const current = loadMistakeQuestions();
  if (!current.some((item) => item.id === q.id || item.question === q.question)) {
    const updated = [q, ...current].slice(0, 40);
    saveMistakeQuestions(updated);
  }
};

export const removeMistakeQuestion = (id: string): void => {
  const current = loadMistakeQuestions();
  const updated = current.filter((item) => item.id !== id);
  saveMistakeQuestions(updated);
};

// Custom Quiz Questions (Tự soạn câu hỏi từ Góc Học Tập)
export const loadCustomQuizQuestions = (): QuizQuestion[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZ_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse custom quiz questions:', err);
    return [];
  }
};

export const saveCustomQuizQuestions = (questions: QuizQuestion[]): void => {
  try {
    localStorage.setItem(CUSTOM_QUIZ_STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save custom quiz questions:', err);
  }
};

export const addCustomQuizQuestion = (q: Omit<QuizQuestion, 'id' | 'createdAt'>): QuizQuestion => {
  const current = loadCustomQuizQuestions();
  const newQuestion: QuizQuestion = {
    ...q,
    id: `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    isCustom: true,
    reviewHint: q.reviewHint || q.hint || 'Hãy đọc lại phần lý thuyết liên quan trong bài học.',
  };
  const updated = [newQuestion, ...current];
  saveCustomQuizQuestions(updated);
  return newQuestion;
};

export const deleteCustomQuizQuestion = (id: string): void => {
  const current = loadCustomQuizQuestions();
  const updated = current.filter((item) => item.id !== id);
  saveCustomQuizQuestions(updated);
};

export const clearAllCustomQuizQuestions = (): void => {
  try {
    localStorage.removeItem(CUSTOM_QUIZ_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear custom quiz questions:', err);
  }
};

// Tự động trích xuất các câu hỏi trắc nghiệm từ một bài học trong Góc Học Tập
export const extractQuestionsFromSource = (source: StudySource, subjectTitle?: string): QuizQuestion[] => {
  const keyPoints = source.keyPoints || [];
  const kp1 = keyPoints[0] || source.summary || source.title;
  const kp2 = keyPoints[1] || 'Đọc kỹ phần lý thuyết trọng tâm của bài.';
  const kp3 = keyPoints[2] || 'Vận dụng hiện tượng vào thực tiễn đời sống.';

  const questions: QuizQuestion[] = [];

  // Question 1: Multiple Choice from Core Concept
  questions.push({
    id: `auto-q-${source.id}-1-${Date.now()}`,
    sourceId: source.id,
    sourceTitle: source.title,
    subjectId: source.subjectId,
    subjectTitle: subjectTitle || 'Góc Học Tập',
    type: 'multiple_choice',
    question: `Theo nội dung bài học "${source.title}", phát biểu nào sau đây là ĐÚNG nhất?`,
    options: [
      kp1.slice(0, 110),
      `Hiện tượng xảy ra ngược lại hoàn toàn so với nội dung trong "${source.title}".`,
      'Không có mối liên hệ nào giữa các đại lượng vật lý đã nêu trong bài.',
      'Hiện tượng này chỉ áp dụng trong phòng thí nghiệm, không có trong đời sống.'
    ],
    correctAnswer: 0,
    explanation: `Khái niệm trọng tâm từ bài học: ${kp1}.`,
    hint: `Hãy nhớ lại ý chính của bài: ${source.title}.`,
    reviewHint: `Ôn lại bài "${source.title}": ${kp1.slice(0, 100)}...`,
    difficulty: 'medium',
    points: 10,
    misconceptionTrap: 'Học sinh dễ nhầm lẫn các khái niệm tương tự nếu không đọc kỹ tóm tắt bài học.',
    category: `Bài: ${source.title.slice(0, 30)}`,
    isCustom: true,
    createdAt: Date.now(),
  });

  // Question 2: True/False from Key Point 2
  questions.push({
    id: `auto-q-${source.id}-2-${Date.now()}`,
    sourceId: source.id,
    sourceTitle: source.title,
    subjectId: source.subjectId,
    subjectTitle: subjectTitle || 'Góc Học Tập',
    type: 'true_false',
    question: `[Khẳng định bài "${source.title}"]: "${kp2}" là một nguyên lý / kết luận chính xác đã được chứng minh.`,
    options: ['ĐÚNG', 'SAI'],
    correctAnswer: 0,
    explanation: `ĐÚNG! Nội dung này được ghi rõ trong bài học: ${kp2}.`,
    hint: `Xem lại các điểm ghi nhớ quan trọng của bài học "${source.title}".`,
    reviewHint: `Ghi nhớ từ bài học: "${kp2.slice(0, 90)}...".`,
    difficulty: 'easy',
    points: 10,
    misconceptionTrap: 'Hãy phân biệt rõ giữa giả thuyết và kết luận khoa học đã được thực nghiệm kiểm chứng.',
    category: `Bài: ${source.title.slice(0, 30)}`,
    isCustom: true,
    createdAt: Date.now() + 1,
  });

  // Question 3: Phenomenon / Application
  if (keyPoints.length >= 3 || source.summary) {
    questions.push({
      id: `auto-q-${source.id}-3-${Date.now()}`,
      sourceId: source.id,
      sourceTitle: source.title,
      subjectId: source.subjectId,
      subjectTitle: subjectTitle || 'Góc Học Tập',
      type: 'phenomenon_analysis',
      question: `Trong thực tiễn, việc ứng dụng kiến thức từ bài "${source.title}" được giải thích bởi:`,
      options: [
        kp3.slice(0, 110),
        'Sự suy hao hoàn toàn của năng lượng trong quá trình chuyển hóa.',
        'Sóng và hạt không tuân theo các quy luật bảo toàn tự nhiên.',
        'Hiện tượng chỉ mang tính ngẫu nhiên không dự đoán trước được.'
      ],
      correctAnswer: 0,
      explanation: `Ứng dụng thực tế gắn liền với: ${kp3}.`,
      hint: `Liên hệ nội dung bài học với ứng dụng thực tế hoặc thí nghiệm minh họa.`,
      reviewHint: `Ứng dụng thực tế bài "${source.title}": ${kp3.slice(0, 95)}...`,
      difficulty: 'medium',
      points: 10,
      category: `Bài: ${source.title.slice(0, 30)}`,
      isCustom: true,
      createdAt: Date.now() + 2,
    });
  }

  return questions;
};

// Nhập câu hỏi từ 1 bài học vào ngân hàng đề tự soạn
export const importSourceToCustomQuiz = (source: StudySource, subjectTitle?: string): number => {
  const extracted = extractQuestionsFromSource(source, subjectTitle);
  const current = loadCustomQuizQuestions();
  // Filter out any duplicates
  const existingQuestions = new Set(current.map((q) => q.question.toLowerCase().trim()));
  const newToAdd = extracted.filter((q) => !existingQuestions.has(q.question.toLowerCase().trim()));
  const updated = [...newToAdd, ...current];
  saveCustomQuizQuestions(updated);
  return newToAdd.length;
};

// Nhập câu hỏi từ toàn bộ các bài học trong Góc Học Tập
export const importAllSourcesToQuizBank = (): { importedCount: number; totalCount: number } => {
  const sources = loadStudySources();
  const subjects = loadStudySubjects();
  let importedCount = 0;

  sources.forEach((src) => {
    const subj = subjects.find((s) => s.id === src.subjectId);
    const count = importSourceToCustomQuiz(src, subj?.title);
    importedCount += count;
  });

  const totalCustom = loadCustomQuizQuestions().length;
  return { importedCount, totalCount: totalCustom };
};

// Get quiz questions filtered by scope or fallback
export const getQuizQuestionsForSession = (options: {
  sourceId?: string;
  subjectId?: string;
  mode?: 'practice' | 'exam' | 'speed' | 'mistakes' | 'self_study' | 'custom';
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
}): QuizQuestion[] => {
  if (options.mode === 'mistakes') {
    const mistakes = loadMistakeQuestions();
    if (mistakes.length > 0) {
      return options.count ? mistakes.slice(0, options.count) : mistakes;
    }
  }

  const customQuestions = loadCustomQuizQuestions();

  if (options.mode === 'custom') {
    if (customQuestions.length > 0) {
      return options.count ? customQuestions.slice(0, options.count) : customQuestions;
    }
  }

  // Also harvest questions from stored study packs if available
  const storedPacks = loadStoredStudyPacks();
  const harvestedFromPacks: QuizQuestion[] = [];
  storedPacks.forEach((pack) => {
    (pack.practiceQuestions || []).forEach((pq, idx) => {
      let optionsList: string[] = [];
      let correctIdx: any = pq.correctAnswer;
      if (pq.type === 'multiple_choice' && pq.options && pq.options.length > 0) {
        optionsList = pq.options;
        const found = pq.options.findIndex((opt) => opt === pq.correctAnswer);
        correctIdx = found >= 0 ? found : 0;
      } else if (pq.type === 'true_false') {
        optionsList = ['ĐÚNG', 'SAI'];
        correctIdx = pq.correctAnswer.toUpperCase().includes('ĐÚNG') ? 0 : 1;
      } else {
        optionsList = [pq.correctAnswer, 'Phương án nhiễu 1', 'Phương án nhiễu 2', 'Phương án nhiễu 3'];
        correctIdx = 0;
      }

      harvestedFromPacks.push({
        id: `pack-q-${pack.id}-${idx}`,
        sourceId: pack.sourceId,
        sourceTitle: pack.sourceTitle,
        subjectId: pack.subjectId,
        subjectTitle: pack.subjectTitle,
        type: pq.type === 'true_false' ? 'true_false' : 'multiple_choice',
        question: pq.question,
        options: optionsList,
        correctAnswer: correctIdx,
        explanation: pq.explanation,
        hint: pq.hint,
        reviewHint: pq.hint || `Ôn lại bài học: ${pack.sourceTitle}`,
        difficulty: 'medium',
        points: 10,
        category: 'Từ Study Pack'
      });
    });
  });

  const pool = [...customQuestions, ...DEFAULT_QUIZ_BANK, ...harvestedFromPacks];

  let filtered = pool;
  if (options.sourceId) {
    filtered = filtered.filter((q) => q.sourceId === options.sourceId);
    if (filtered.length === 0) filtered = pool; // fallback
  } else if (options.subjectId && options.subjectId !== 'all') {
    filtered = filtered.filter((q) => q.subjectId === options.subjectId);
    if (filtered.length === 0) filtered = pool;
  }

  if (options.difficulty && options.difficulty !== 'all') {
    const byDiff = filtered.filter((q) => q.difficulty === options.difficulty);
    if (byDiff.length >= 3) filtered = byDiff;
  }

  // Shuffle pool
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const targetCount = options.count || 10;
  return shuffled.slice(0, targetCount);
};

// Evaluate user quiz answers & generate a pedagogical diagnostic report
export const evaluateQuizAnswers = (
  questions: QuizQuestion[],
  userAnswers: Record<string, any>
): { score: number; correctCount: number; report: QuizDiagnosticReport } => {
  let correctCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  const incorrectQuestions: QuizQuestion[] = [];
  const correctCategories: Record<string, number> = {};
  const incorrectCategories: Record<string, number> = {};

  questions.forEach((q) => {
    const qPoints = q.points || 10;
    totalPoints += qPoints;
    const ans = userAnswers[q.id];
    let isCorrect = false;

    if (typeof q.correctAnswer === 'number') {
      isCorrect = ans === q.correctAnswer;
    } else if (typeof q.correctAnswer === 'string') {
      if (typeof ans === 'string') {
        isCorrect = ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      } else if (typeof ans === 'number' && q.options && q.options[ans]) {
        isCorrect = q.options[ans].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }
    }

    const cat = q.category || 'Vật lý ứng dụng';
    if (isCorrect) {
      correctCount++;
      earnedPoints += qPoints;
      correctCategories[cat] = (correctCategories[cat] || 0) + 1;
    } else {
      incorrectQuestions.push(q);
      incorrectCategories[cat] = (incorrectCategories[cat] || 0) + 1;
      // Automatically save to mistakes bank
      addMistakeQuestion(q);
    }
  });

  const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  let grade: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Cần củng cố' = 'Cần củng cố';
  if (finalScore >= 90) grade = 'Xuất sắc';
  else if (finalScore >= 75) grade = 'Giỏi';
  else if (finalScore >= 50) grade = 'Khá';

  const strengths = Object.keys(correctCategories).slice(0, 3);
  if (strengths.length === 0) strengths.push('Tinh thần học hỏi & nỗ lực làm bài');

  const weaknesses = Object.keys(incorrectCategories).slice(0, 3);
  if (weaknesses.length === 0) weaknesses.push('Không có lỗ hổng lớn nào, kiến thức nắm rất chắc');

  const recommendations: string[] = [];
  const suggestedFlashcards: string[] = [];
  const suggestedSources: string[] = [];

  if (incorrectQuestions.length > 0) {
    incorrectQuestions.slice(0, 3).forEach((iq) => {
      recommendations.push(`Củng cố lại khái niệm: "${iq.question.slice(0, 60)}..."`);
      if (iq.sourceTitle) suggestedSources.push(iq.sourceTitle);
      if (iq.misconceptionTrap) suggestedFlashcards.push(iq.misconceptionTrap);
    });
  } else {
    recommendations.push('Đã nắm vững toàn bộ kiến thức mục tiêu. Sẵn sàng thử sức với các bài thi nâng cao!');
  }

  let aiMentorAdvice = '';
  if (finalScore >= 90) {
    aiMentorAdvice = 'Tuyệt vời! Bạn thể hiện khả năng phân biệt sâu sắc giữa các đại lượng vật lý (như tần số và biên độ, nguồn sáng và vật sáng). Tư duy phản xạ rất nhạy bén!';
  } else if (finalScore >= 70) {
    aiMentorAdvice = 'Rất tốt! Bạn đã nắm chắc bức tranh tổng thể và các quy luật cốt lõi. Hãy chú ý kỹ hơn các bẫy câu hỏi về đơn vị đo (dB, Hz) và các hiện tượng khúc xạ ánh sáng đời sống.';
  } else {
    aiMentorAdvice = 'Đừng lo lắng! Những câu sai chính là cơ hội vàng để bóc tách lỗ hổng tư duy. Hãy ghé tab "Trạm Cứu Điểm - Ôn Câu Sai" hoặc mở Flashcard trong Study Pack để lật xem lại các mẹo nhớ nhanh nhé!';
  }

  return {
    score: finalScore,
    correctCount,
    report: {
      grade,
      strengths,
      weaknesses,
      recommendations,
      suggestedFlashcards: Array.from(new Set(suggestedFlashcards)),
      suggestedSources: Array.from(new Set(suggestedSources)),
      aiMentorAdvice
    }
  };
};

// ==========================================
// SNAPSHOT STORAGE: Lưu & Mở Snapshot Môn Học
// ==========================================

export const loadSubjectSnapshots = (): StudySubjectSnapshot[] => {
  try {
    const raw = localStorage.getItem(SUBJECT_SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Lỗi đọc snapshots từ Local Storage:', e);
    return [];
  }
};

export const saveSubjectSnapshotsToStorage = (snapshots: StudySubjectSnapshot[]): void => {
  try {
    localStorage.setItem(SUBJECT_SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (e) {
    console.error('Lỗi ghi snapshots vào Local Storage:', e);
  }
};

/**
 * Tạo một bản lưu Snapshot hoàn chỉnh cho môn học hiện tại
 * Bao gồm: Thông tin môn, tất cả bài học (nguồn tài liệu), study packs, flashcards, và tóm tắt môn
 */
export const createSubjectSnapshot = (params: {
  subjectId: string;
  snapshotName: string;
  note?: string;
}): { success: boolean; snapshot?: StudySubjectSnapshot; message: string } => {
  try {
    const subjects = loadStudySubjects();
    const targetSubject = subjects.find((s) => s.id === params.subjectId);
    if (!targetSubject) {
      return { success: false, message: 'Không tìm thấy môn học để tạo bản lưu snapshot!' };
    }

    const allSources = loadStudySources();
    const subjectSources = allSources.filter((s) => s.subjectId === params.subjectId);

    const allPacks = loadStoredStudyPacks();
    const subjectPacks = allPacks.filter((p) => p.subjectId === params.subjectId);

    const allCards = loadStoredFlashcards();
    const subjectCards = allCards.filter((c) => c.subjectId === params.subjectId);

    const summaries = loadSubjectSummaries();
    const subSummary = summaries[params.subjectId];

    const newSnapshot: StudySubjectSnapshot = {
      id: `snapshot-${Date.now()}`,
      name: params.snapshotName.trim() || `Bản lưu ${targetSubject.title} - ${new Date().toLocaleDateString('vi-VN')}`,
      createdAt: Date.now(),
      subject: targetSubject,
      sources: subjectSources,
      studyPacks: subjectPacks,
      flashcards: subjectCards,
      subjectSummary: subSummary,
      note: params.note?.trim(),
    };

    const existingSnapshots = loadSubjectSnapshots();
    const updatedSnapshots = [newSnapshot, ...existingSnapshots];
    saveSubjectSnapshotsToStorage(updatedSnapshots);

    return {
      success: true,
      snapshot: newSnapshot,
      message: `Đã lưu thành công Snapshot "${newSnapshot.name}" với ${subjectSources.length} bài học, ${subjectPacks.length} study packs và ${subjectCards.length} flashcards vào Local Storage!`,
    };
  } catch (err: any) {
    console.error('Lỗi khi tạo snapshot:', err);
    return { success: false, message: err?.message || 'Có lỗi xảy ra khi lưu snapshot môn học.' };
  }
};

/**
 * Mở và khôi phục (Restore) môn học từ một bản lưu Snapshot
 * Đồng bộ môn học, bài học, study packs, và flashcards vào Local Storage
 */
export const restoreSubjectFromSnapshot = (
  snapshotId: string
): { success: boolean; subjectId?: string; message: string } => {
  try {
    const snapshots = loadSubjectSnapshots();
    const targetSnapshot = snapshots.find((s) => s.id === snapshotId);
    if (!targetSnapshot) {
      return { success: false, message: 'Không tìm thấy bản snapshot tương ứng!' };
    }

    const { subject, sources, studyPacks, flashcards, subjectSummary } = targetSnapshot;

    // 1. Phục hồi Subject
    const currentSubjects = loadStudySubjects();
    const existingSubjIndex = currentSubjects.findIndex((s) => s.id === subject.id);
    let updatedSubjects: StudySubject[];
    if (existingSubjIndex >= 0) {
      updatedSubjects = [...currentSubjects];
      updatedSubjects[existingSubjIndex] = subject;
    } else {
      updatedSubjects = [...currentSubjects, subject];
    }
    saveStudySubjects(updatedSubjects);

    // 2. Phục hồi Sources
    const currentSources = loadStudySources();
    // Xóa các nguồn cũ của môn này (nếu có) và thay bằng các nguồn từ snapshot
    const otherSources = currentSources.filter((s) => s.subjectId !== subject.id);
    const updatedSources = [...sources, ...otherSources];
    saveStudySources(updatedSources);

    // 3. Phục hồi Study Packs
    if (studyPacks && studyPacks.length > 0) {
      const currentPacks = loadStoredStudyPacks();
      const otherPacks = currentPacks.filter((p) => p.subjectId !== subject.id);
      saveStudyPacksToStorage([...studyPacks, ...otherPacks]);
    }

    // 4. Phục hồi Flashcards
    if (flashcards && flashcards.length > 0) {
      const currentCards = loadStoredFlashcards();
      const otherCards = currentCards.filter((c) => c.subjectId !== subject.id);
      saveFlashcardsToStorage([...flashcards, ...otherCards]);
    }

    // 5. Phục hồi Subject Summary
    if (subjectSummary) {
      saveSubjectSummaryToStorage(subject.id, subjectSummary.summary, subjectSummary.keyPoints || []);
    }

    return {
      success: true,
      subjectId: subject.id,
      message: `Đã mở và khôi phục thành công môn "${subject.title}" từ bản lưu "${targetSnapshot.name}"! (${sources.length} tài liệu, ${studyPacks?.length || 0} gói học tập, ${flashcards?.length || 0} thẻ ghi nhớ)`,
    };
  } catch (err: any) {
    console.error('Lỗi phục hồi snapshot:', err);
    return { success: false, message: err?.message || 'Có lỗi xảy ra khi mở bản lưu.' };
  }
};

/**
 * Xóa một bản lưu Snapshot
 */
export const deleteSubjectSnapshot = (snapshotId: string): StudySubjectSnapshot[] => {
  const snapshots = loadSubjectSnapshots();
  const updated = snapshots.filter((s) => s.id !== snapshotId);
  saveSubjectSnapshotsToStorage(updated);
  return updated;
};

/**
 * Đổi tên hoặc cập nhật ghi chú cho một bản lưu Snapshot
 */
export const renameSubjectSnapshot = (
  snapshotId: string,
  newName: string,
  newNote?: string
): StudySubjectSnapshot[] => {
  const snapshots = loadSubjectSnapshots();
  const updated = snapshots.map((s) => {
    if (s.id === snapshotId) {
      return {
        ...s,
        name: newName.trim() || s.name,
        note: newNote !== undefined ? newNote.trim() : s.note,
      };
    }
    return s;
  });
  saveSubjectSnapshotsToStorage(updated);
  return updated;
};

