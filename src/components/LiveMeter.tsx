import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { Mic, MicOff, AlertOctagon, Activity, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

interface LiveMeterProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
  isMicActive: boolean;
  setIsMicActive: (active: boolean) => void;
}

export const LiveMeter: React.FC<LiveMeterProps> = ({
  onAskAIAboutTopic,
  isMicActive,
  setIsMicActive,
}) => {
  const [currentDb, setCurrentDb] = useState<number>(30);
  const [peakDb, setPeakDb] = useState<number>(30);
  const [dominantFreq, setDominantFreq] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const toggleMic = async () => {
    setMicError(null);
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
      setCurrentDb(30);
    } else {
      const ok = await audioEngine.startMicrophone();
      if (ok) {
        setIsMicActive(true);
      } else {
        setMicError('Không thể truy cập Microphone. Vui lòng cấp quyền micro trên trình duyệt của bạn.');
        setIsMicActive(false);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;
    let localPeak = 30;

    const render = () => {
      if (!isSubscribed) return;

      const analyser = audioEngine.getMicAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (analyser && isMicActive) {
        const bufferLength = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);

        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // 1. Calculate RMS for decibels
        let sumSquares = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / timeData.length);
        // Approximate Decibel mapping (ambient baseline ~30-40dB, peak ~100dB)
        let rawDb = rms > 0 ? 20 * Math.log10(rms) + 95 : 30;
        rawDb = Math.max(25, Math.min(115, rawDb));
        setCurrentDb(Math.round(rawDb));

        if (rawDb > localPeak) {
          localPeak = Math.round(rawDb);
          setPeakDb(localPeak);
        }

        // 2. Detect dominant frequency (peak in FFT)
        let maxVal = 0;
        let maxIndex = 0;
        // Search in 50Hz to 8000Hz
        const binSizeHz = 24000 / bufferLength; // ~23Hz per bin
        for (let i = 2; i < bufferLength / 2; i++) {
          if (freqData[i] > maxVal) {
            maxVal = freqData[i];
            maxIndex = i;
          }
        }
        if (maxVal > 50) {
          setDominantFreq(Math.round(maxIndex * binSizeHz));
        }

        // 3. Draw Frequency Spectrum Bars
        const barCount = 64;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const binIdx = Math.floor(Math.pow(i / barCount, 1.8) * (bufferLength / 2));
          const val = freqData[binIdx] / 255.0;
          const barHeight = val * (height * 0.85);

          // Color gradient according to frequency (Bass cyan -> Mid amber -> Treble rose)
          if (i < 20) {
            ctx.fillStyle = '#22d3ee'; // Bass
          } else if (i < 45) {
            ctx.fillStyle = '#f59e0b'; // Mid
          } else {
            ctx.fillStyle = '#f43f5e'; // Treble
          }

          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1.5, barHeight);
        }

        // 4. Draw Oscilloscope overlay wave
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const sliceWidth = width / timeData.length;
        let x = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Idle message
        ctx.fillStyle = '#64748b';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn "Bật Microphone" để bắt đầu đo tiếng ồn & tần số thực tế', width / 2, height / 2);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isSubscribed = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isMicActive]);

  const resetPeak = () => {
    setPeakDb(currentDb);
  };

  const getNoiseEvaluation = (db: number) => {
    if (db < 45) {
      return {
        label: 'Yên tĩnh lý tưởng',
        color: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50',
        desc: 'Môi trường hoàn hảo cho giấc ngủ sâu, đọc sách nghiên cứu và phục hồi tế bào thần kinh.',
      };
    }
    if (db < 65) {
      return {
        label: 'Mức ồn sinh hoạt bình thường',
        color: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/50',
        desc: 'Phòng khách, văn phòng làm việc nhóm, cuộc trò chuyện nhẹ nhàng.',
      };
    }
    if (db < 80) {
      return {
        label: 'Mức ồn đáng chú ý (Cần chú ý)',
        color: 'bg-amber-950/40 text-amber-300 border-amber-500/50',
        desc: 'Giao thông mặt đường, quán cafe ồn ào. Nếu kéo dài nhiều giờ có thể gây căng thẳng thần kinh và tăng huyết áp.',
      };
    }
    return {
      label: 'CẢNH BÁO: NGUY HẠI THÍNH LỰC',
      color: 'bg-rose-950/50 text-rose-300 border-rose-500/80 animate-pulse',
      desc: 'Vượt ngưỡng an toàn 85 dBA! Nguy cơ phá hủy vĩnh viễn các tế bào lông ốc tai. Hãy rời khỏi khu vực hoặc đeo nút tai bảo hộ.',
    };
  };

  const noiseEval = getNoiseEvaluation(currentDb);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Máy Đo Môi Trường Trực Tiếp (Live Audio Meter)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Đo Độ Ồn (Decibel) & Phổ Tần Số Môi Trường Xung Quanh
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Sử dụng microphone của thiết bị để phân tích mức áp suất âm thanh (dB), phát hiện tần số áp đảo
              (tiếng còi, tiếng ù điện 50Hz, tiếng huýt sáo) và đánh giá độ an toàn tiếng ồn trong phòng học hoặc văn phòng của bạn.
            </p>
          </div>

          <button
            id="toggle-mic-btn"
            onClick={toggleMic}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shrink-0 shadow-lg ${
              isMicActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isMicActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isMicActive ? 'Tắt Microphone' : 'Bật Microphone Đo Ngay'}</span>
          </button>
        </div>

        {micError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{micError}</span>
          </div>
        )}
      </div>

      {/* Main Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Decibel Gauge */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Mức Độ Ồn Thời Gian Thực</span>
              </h3>
              <button
                onClick={resetPeak}
                className="text-[11px] text-slate-400 hover:text-cyan-300 underline"
              >
                Đặt lại đỉnh (Peak)
              </button>
            </div>

            {/* Large Digital dB Readout */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Mức Áp Suất Âm Thanh
              </span>
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-6xl sm:text-7xl font-black font-mono text-cyan-300">
                  {currentDb}
                </span>
                <span className="text-base font-mono text-slate-500">dB</span>
              </div>

              <div className="flex justify-center gap-6 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Đỉnh cao nhất (Peak):</span>
                  <span className="font-mono font-bold text-amber-300">{peakDb} dB</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tần số áp đảo:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {dominantFreq > 0 ? `${dominantFreq} Hz` : 'Đang quét...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual VU Meter Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 dB</span>
                <span>40 dB</span>
                <span>60 dB</span>
                <span className="text-amber-400 font-bold">85 dB (Ngưỡng)</span>
                <span className="text-rose-400">120 dB</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    currentDb > 85
                      ? 'bg-rose-500'
                      : currentDb > 70
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (currentDb / 120) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Assessment badge */}
          <div className={`p-4 rounded-xl border ${noiseEval.color} space-y-1.5`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase">{noiseEval.label}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{noiseEval.desc}</p>
          </div>
        </div>

        {/* Right: Spectrogram & FFT Visualizer */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Phổ Tần Số Âm Thanh (FFT Spectrogram)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Phân bổ năng lượng âm thanh theo dải tần số từ 20 Hz đến 10.000 Hz
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded bg-cyan-400"></span> Bass
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded bg-amber-400"></span> Mid
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded bg-rose-400"></span> Treble
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[260px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={560}
              height={260}
              className="w-full h-full object-cover block"
            />
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Bạn có thể huýt sáo hoặc tạo tiếng gõ để quan sát đỉnh nhọn (peak) xuất hiện trên phổ tần số!
            </span>
            <button
              onClick={() =>
                onAskAIAboutTopic?.(
                  'Đo lường âm thanh',
                  `Hiện tại máy đo tiếng ồn của tôi ghi nhận ${currentDb} dB và tần số áp đảo ${dominantFreq} Hz. Hãy phân tích mức này có ảnh hưởng thế nào đến sức khỏe và sự tập trung?`
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium shrink-0 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân Tích Bằng AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
