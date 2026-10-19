import React, { useState, useEffect } from 'react';
import { LIGHTING_BENCHMARKS } from '../utils/opticsCalculations';
import { audioEngine } from '../utils/audioEngine';
import {
  CloudLightning,
  Sparkles,
  BookOpen,
  Eye,
  CheckCircle,
  HelpCircle,
  Volume2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LifeEssentialsProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
}

export const LifeEssentials: React.FC<LifeEssentialsProps> = ({ onAskAIAboutTopic }) => {
  // Lightning distance stopwatch
  const [isTimingLightning, setIsTimingLightning] = useState<boolean>(false);
  const [lightningSeconds, setLightningSeconds] = useState<number>(0);
  const [calculatedDistanceMeters, setCalculatedDistanceMeters] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (isTimingLightning) {
      const start = Date.now();
      timer = setInterval(() => {
        setLightningSeconds((Date.now() - start) / 1000);
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isTimingLightning]);

  const handleStartLightning = () => {
    setLightningSeconds(0);
    setCalculatedDistanceMeters(null);
    setIsTimingLightning(true);
  };

  const handleStopLightning = () => {
    setIsTimingLightning(false);
    // Sound speed at 20C is ~343 m/s
    const dist = lightningSeconds * 343;
    setCalculatedDistanceMeters(dist);
  };

  // Workspace Lighting Audit
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const currentBenchmark = LIGHTING_BENCHMARKS[selectedRoomIdx];

  // Daily Atmosphere Preset player
  const [activeAtmosphere, setActiveAtmosphere] = useState<string | null>(null);

  const startAtmosphere = (type: string) => {
    audioEngine.stopAll();
    if (activeAtmosphere === type) {
      setActiveAtmosphere(null);
      return;
    }

    setActiveAtmosphere(type);
    if (type === 'focus') {
      audioEngine.startNoise('brown');
      audioEngine.startBinauralBeats(220, 14); // Beta 14Hz focus
    } else if (type === 'relax') {
      audioEngine.startNoise('pink');
      audioEngine.startBinauralBeats(216, 10); // Alpha 10Hz
    } else if (type === 'sleep') {
      audioEngine.startNoise('brown');
      audioEngine.startBinauralBeats(180, 3); // Delta 3Hz
    }
  };

  // Life Physics Questions accordions
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Tại sao bầu trời ban ngày màu xanh lam nhưng lúc hoàng hôn lại đỏ cam?',
      topic: 'Tán xạ Rayleigh',
      a: 'Bầu khí quyển chứa các phân tử khí (N₂, O₂) có kích thước nhỏ hơn nhiều so với bước sóng ánh sáng. Theo định luật tán xạ Rayleigh, cường độ tán xạ tỉ lệ nghịch với lũy thừa bậc 4 của bước sóng (I ∝ 1/λ⁴). Ánh sáng xanh (λ ≈ 450nm) bị tán xạ mạnh gấp ~10 lần ánh sáng đỏ (λ ≈ 700nm), làm cả bầu trời rực màu xanh. Vào hoàng hôn, ánh nắng phải đi qua lớp khí quyển dày gấp nhiều lần, phần lớn ánh sáng xanh bị tán xạ đi mất, chỉ còn các bước sóng dài (cam, đỏ) truyền thẳng tới mắt bạn.',
    },
    {
      q: 'Tai nghe chống ồn chủ động (Active Noise Cancellation - ANC) hoạt động ra sao?',
      topic: 'Giao thoa sóng ngược pha',
      a: 'Tai nghe ANC sử dụng micro siêu nhỏ bên ngoài để thu âm thanh tiếng ồn môi trường (ví dụ tiếng động cơ máy bay). Một chip xử lý kỹ thuật số (DSP) ngay lập tức tính toán và tạo ra một sóng âm có cùng tần số, cùng biên độ nhưng ngược pha chính xác 180° (anti-phase wave). Khi sóng âm môi trường gặp sóng âm nhân tạo này tại màng nhĩ, hiện tượng giao thoa triệt tiêu xảy ra, khiến tổng biên độ bằng 0!',
    },
    {
      q: 'Quy tắc 20-20-20 bảo vệ mắt khi dùng màn hình máy tính?',
      topic: 'Ergonomics thị giác',
      a: 'Khi nhìn màn hình ở khoảng cách gần liên tục, cơ thể mi trong mắt phải co lại liên tục để điều tiết thấu kính mắt. Để tránh co thắt cơ thể mi và cận thị tiến triển: Cứ sau 20 phút làm việc, hãy nhìn vào một vật cách xa ít nhất 20 feet (~6 mét) trong vòng ít nhất 20 giây. Điều này giúp cơ mắt giãn hoàn toàn về trạng thái nghỉ tự nhiên.',
    },
    {
      q: 'Tại sao âm thanh truyền trong nước nhanh hơn trong không khí gấp hơn 4 lần?',
      topic: 'Tốc độ sóng cơ',
      a: 'Vận tốc âm thanh phụ thuộc vào mật độ và mô-đun đàn hồi (độ cứng liên kết phân tử) của môi trường. Trong không khí (chất khí lỏng lẻo), âm thanh đi với tốc độ ~343 m/s. Trong nước (chất lỏng có mật độ phân tử cao hơn và liên kết chặt hơn), âm truyền đi với vận tốc ~1,482 m/s. Trong thép (chất rắn), âm thanh có thể truyền nhanh tới ~5,960 m/s!',
    },
    {
      q: 'Tại sao cáp quang biển lại truyền được dữ liệu internet toàn cầu?',
      topic: 'Phản xạ toàn phần',
      a: 'Cáp quang cấu tạo từ sợi thủy tinh siêu tinh khiết gồm 2 lớp: Lõi (core) có chiết suất cao và Lớp vỏ (cladding) có chiết suất thấp hơn. Khi chùm laser tín hiệu được chiếu vào lõi với góc lớn hơn góc tới hạn θc, ánh sáng bị giam cầm và phản xạ toàn phần 100% bên trong lõi mà không bị rò rỉ ra ngoài. Nhờ đó, hàng terabit dữ liệu có thể vượt qua đáy đại dương với tốc độ gần bằng tốc độ ánh sáng!',
    },
    {
      q: 'Hiệu ứng Doppler: Tại sao tiếng còi xe cứu thương cao hơn khi chạy lại gần và trầm xuống khi chạy ra xa?',
      topic: 'Hiệu ứng Doppler',
      a: 'Khi nguồn phát âm chuyển động về phía bạn, mỗi đỉnh sóng phát ra ở vị trí gần bạn hơn đỉnh sóng trước, khiến các bước sóng bị nén lại (bước sóng ngắn hơn -> tần số f cao hơn -> nghe thanh hơn). Ngược lại, khi xe chạy ra xa, các đỉnh sóng bị kéo dãn ra (bước sóng dài hơn -> tần số f giảm -> nghe trầm hơn).',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ứng Dụng Vật Lý Trong Đời Sống Thực Tiễn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Tối Ưu Tiện Nghi Sống & Bảo Vệ Sức Khỏe Hàng Ngày
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Vật lý âm thanh và ánh sáng hiện diện trong từng khoảnh khắc thường nhật: từ việc đo khoảng cách cơn giông sấm sét,
              căn chỉnh độ rọi ánh sáng bàn học để bảo vệ mắt, cho đến việc sử dụng âm thanh sinh học để tập trung làm việc hoặc đi vào giấc ngủ.
            </p>
          </div>

          <button
            onClick={() =>
              onAskAIAboutTopic?.(
                'Ứng dụng đời sống',
                'Hãy tư vấn cách thiết kế hệ thống ánh sáng và âm thanh tối ưu nhất cho một góc làm việc và học tập tại nhà (Work from Home)?'
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium shrink-0 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hỏi AI về Không Gian Sống</span>
          </button>
        </div>
      </div>

      {/* Grid: Lightning Distance + Daily Focus/Sleep Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool 1: Lightning Distance Stopwatch */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CloudLightning className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Máy Đo Khoảng Cách Sét & Cơn Giông</h3>
                <p className="text-xs text-slate-400">Ứng dụng độ chênh lệch tốc độ ánh sáng và tốc độ âm thanh</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Ánh chớp truyền đi với tốc độ ánh sáng (<code className="text-amber-300">~300.000 km/s</code>) nên tới mắt bạn gần như tức thì.
            Trong khi tiếng sấm truyền đi với tốc độ âm thanh (<code className="text-cyan-300">~343 m/s</code>, mất khoảng 3 giây để đi được 1 km).
          </p>

          {/* Stopwatch Interface */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4">
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
                {lightningSeconds.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-slate-400">giây</span>
            </div>

            <div className="flex justify-center gap-3">
              {!isTimingLightning ? (
                <button
                  id="start-lightning-btn"
                  onClick={handleStartLightning}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
                >
                  ⚡ Vừa Thấy Chớp Sáng!
                </button>
              ) : (
                <button
                  id="stop-lightning-btn"
                  onClick={handleStopLightning}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-500/20 animate-pulse"
                >
                  🔊 Vừa Nghe Tiếng Sấm Nổ!
                </button>
              )}
            </div>

            {calculatedDistanceMeters !== null && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                <span className="text-xs text-slate-400 block">Khoảng cách tới vị trí sét đánh:</span>
                <div className="text-2xl font-black font-mono text-cyan-300">
                  {calculatedDistanceMeters >= 1000
                    ? `${(calculatedDistanceMeters / 1000).toFixed(2)} km`
                    : `${Math.round(calculatedDistanceMeters)} mét`}
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    calculatedDistanceMeters < 3000
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : calculatedDistanceMeters < 10000
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {calculatedDistanceMeters < 3000
                    ? '⚠️ NGUY HIỂM CỰC CAO: Cơn dông ở ngay trên đầu bạn, hãy tìm nơi trú ẩn kín ngay!'
                    : calculatedDistanceMeters < 10000
                    ? '⚡ CẢNH BÁO: Áp dụng quy tắc 30/30, không đứng dưới gốc cây to hoặc nơi trống trải!'
                    : '✅ An toàn: Cơn dông đang ở khoảng cách tương đối xa.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Daily Focus & Sleep Acoustic Suite */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Bộ Môi Trường Âm Thanh Sinh Học</h3>
                <p className="text-xs text-slate-400">Kết hợp Bio-noise và nhịp sóng não cho các hoạt động thường ngày</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'focus',
                title: 'Tập Trung Sâu (Deep Work)',
                desc: 'Brown Noise trầm ấm + Sóng Beta 14Hz giúp giữ sự chú ý bền bỉ.',
                color: 'from-cyan-900/30 to-slate-900 border-cyan-800/80 text-cyan-300',
              },
              {
                id: 'relax',
                title: 'Thư Giãn (Relaxation)',
                desc: 'Pink Noise như tiếng mưa + Sóng Alpha 10Hz xoa dịu thần kinh.',
                color: 'from-indigo-900/30 to-slate-900 border-indigo-800/80 text-indigo-300',
              },
              {
                id: 'sleep',
                title: 'Giấc Ngủ Sâu (Deep Sleep)',
                desc: 'Brown Noise mượt mà + Sóng Delta 3Hz ru ngủ tự nhiên.',
                color: 'from-amber-900/30 to-slate-900 border-amber-800/80 text-amber-300',
              },
            ].map((preset) => {
              const active = activeAtmosphere === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => startAtmosphere(preset.id)}
                  className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden bg-gradient-to-b ${
                    preset.color
                  } ${active ? 'ring-2 ring-cyan-400 shadow-lg' : 'hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-100">{preset.title}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        active ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                      }`}
                    ></span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{preset.desc}</p>
                  <span className="mt-3 inline-block text-[11px] font-semibold text-cyan-400">
                    {active ? '■ Đang phát' : '▶ Bắt đầu'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
            <Eye className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-200">Mẹo đời sống:</strong> Hãy sử dụng tai nghe trùm đầu (Over-ear) có khả năng cách âm thụ động tốt
              để trải nghiệm hiệu ứng nhịp song nhĩ (Binaural Beats) rõ nét nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Tool 3: Workspace Light & Ergonomics Auditor */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span>Tiêu Chuẩn Chiếu Sáng & Độ Rọi (Lux) Cho Từng Không Gian</span>
            </h2>
            <p className="text-xs text-slate-400">
              Độ rọi (Lux = Lumen/m²) quyết định sự tỉnh táo, độ tinh tường thị giác và ngăn ngừa mỏi mắt
            </p>
          </div>
        </div>

        {/* Room selection tabs */}
        <div className="flex flex-wrap gap-2">
          {LIGHTING_BENCHMARKS.map((item, idx) => (
            <button
              key={item.room}
              onClick={() => setSelectedRoomIdx(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                selectedRoomIdx === idx
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.room}
            </button>
          ))}
        </div>

        {/* Room benchmark detail card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Độ rọi tiêu chuẩn khuyến nghị</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-300">
                {currentBenchmark.luxMin} - {currentBenchmark.luxMax}
              </span>
              <span className="text-xs font-mono text-slate-500">Lux (lm/m²)</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              1 Lux tương đương ánh sáng của 1 ngọn nến ở khoảng cách 1 mét.
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Dải nhiệt độ màu phù hợp</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-300">
                {currentBenchmark.kelvinRange}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Giúp cân bằng nhịp sinh học theo mục đích sử dụng phòng.
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Lời khuyên công thái học (Ergonomics)</span>
            <p className="text-xs text-slate-300 leading-relaxed">{currentBenchmark.tips}</p>
          </div>
        </div>
      </div>

      {/* Tool 4: Frequently Asked Daily Physics Questions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Giải Mã Hiện Tượng Khoa Học Quanh Ta</span>
            </h2>
            <p className="text-xs text-slate-400">Các câu hỏi vật lý thường gặp trong cuộc sống được giải thích cặn kẽ</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 shrink-0">
                      {faq.topic}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{faq.q}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-900 space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => onAskAIAboutTopic?.(faq.topic, `Hãy đào sâu hơn về câu hỏi: "${faq.q}"`)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hỏi chuyên sâu hơn cùng AI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
