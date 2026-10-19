import React, { useState, useEffect, useRef } from 'react';
import { WaveformType, NoiseType } from '../types';
import { audioEngine, SOUND_PRESETS, MATERIAL_ABSORPTIONS } from '../utils/audioEngine';
import { Play, Pause, AlertTriangle, ShieldCheck, HelpCircle, Info, Sparkles, Sliders } from 'lucide-react';

interface SoundLabProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
}

export const SoundLab: React.FC<SoundLabProps> = ({ onAskAIAboutTopic }) => {
  const [frequency, setFrequency] = useState<number>(440);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Noise & Binaural states
  const [activeNoise, setActiveNoise] = useState<NoiseType>('none');
  const [binauralActive, setBinauralActive] = useState<boolean>(false);
  const [binauralState, setBinauralState] = useState<{ carrier: number; beat: number; stateName: string }>({
    carrier: 216,
    beat: 10,
    stateName: 'Alpha (10 Hz - Thư thái, tiếp thu nhanh)',
  });

  // Visualizer Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Toggle tone generator
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stopTone();
      setIsPlaying(false);
    } else {
      audioEngine.startTone(frequency, waveform);
      setIsPlaying(true);
    }
  };

  const handleFrequencyChange = (val: number) => {
    const clamped = Math.max(20, Math.min(20000, val));
    setFrequency(clamped);
    if (isPlaying) {
      audioEngine.updateTone(clamped, waveform);
    }
  };

  const handleWaveformChange = (type: WaveformType) => {
    setWaveform(type);
    if (isPlaying) {
      audioEngine.updateTone(frequency, type);
    }
  };

  const applyPreset = (freq: number, wf: WaveformType) => {
    setFrequency(freq);
    setWaveform(wf);
    audioEngine.startTone(freq, wf);
    setIsPlaying(true);
  };

  // Noise controls
  const handleNoiseToggle = (type: NoiseType) => {
    if (activeNoise === type) {
      audioEngine.stopNoise();
      setActiveNoise('none');
    } else {
      audioEngine.startNoise(type);
      setActiveNoise(type);
    }
  };

  // Binaural controls
  const handleBinauralToggle = () => {
    if (binauralActive) {
      audioEngine.stopBinauralBeats();
      setBinauralActive(false);
    } else {
      audioEngine.startBinauralBeats(binauralState.carrier, binauralState.beat);
      setBinauralActive(true);
    }
  };

  const setBinauralPreset = (carrier: number, beat: number, name: string) => {
    setBinauralState({ carrier, beat, stateName: name });
    audioEngine.startBinauralBeats(carrier, beat);
    setBinauralActive(true);
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      const analyser = audioEngine.getOscillatorAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
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

      if (analyser && (isPlaying || activeNoise !== 'none' || binauralActive)) {
        const bufferLength = analyser.fftSize;
        const timeData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);

        // Draw real-time waveform
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#22d3ee';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();

        // Frequency domain glow underlay
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);

        ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
        const barWidth = width / 64;
        for (let i = 0; i < 64; i++) {
          const val = freqData[i * 2] / 255.0;
          const barHeight = val * (height * 0.7);
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
      } else {
        // Idle straight wave indicator
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Bật máy phát để hiển thị đồ thị sóng thời gian thực (Oscilloscope)', width / 2, height / 2 - 14);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isSubscribed = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, activeNoise, binauralActive]);

  // Frequency categorization info
  const getFrequencyClassification = (f: number) => {
    if (f < 60) return { range: 'Sub-bass (20-60 Hz)', desc: 'Cực trầm, thường chỉ cảm nhận bằng độ rung lồng ngực và cấu trúc xương.' };
    if (f < 250) return { range: 'Bass (60-250 Hz)', desc: 'Dải trầm cơ bản, nốt trầm guitar bass, tiếng trống kick, giọng nam trầm.' };
    if (f < 500) return { range: 'Low-Mid (250-500 Hz)', desc: 'Dải trung trầm, chứa nốt Đô trung (C4), quyết định độ ấm của âm thanh.' };
    if (f < 2000) return { range: 'Midrange (500-2000 Hz)', desc: 'Dải trung tâm của giọng nói con người, nghe điện thoại rõ ràng.' };
    if (f < 4000) return { range: 'High-Mid (2000-4000 Hz)', desc: 'Vùng nhạy nhất của màng nhĩ và ống tai người (tiếng còi, tiếng khóc).' };
    if (f < 8000) return { range: 'Presence (4000-8000 Hz)', desc: 'Độ sắc nét, tiếng xì xào phát âm chữ s, x, ch trong tiếng nói.' };
    return { range: 'Brilliance (8000-20000 Hz)', desc: 'Âm bổng không gian, tiếng leng keng kim khí. Người già thường suy giảm dải này.' };
  };

  const freqInfo = getFrequencyClassification(frequency);

  // Speed of sound at standard 20°C: 343 m/s -> wavelength lambda = v / f
  const wavelengthCm = ((343 / frequency) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Introduction Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Phòng Thí Nghiệm Sóng Cơ & Âm Học</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Khám Phá Sóng Âm & Thính Lực Con Người
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Âm thanh là dao động sóng cơ học truyền qua môi trường vật chất (không khí, nước, chất rắn).
              Thử nghiệm các dải tần số từ 20 Hz đến 20.000 Hz, các loại sóng dao động, tiếng ồn sinh học
              (White/Pink/Brown noise) và cách phòng chống tổn thương thính lực trong đời sống.
            </p>
          </div>

          <button
            onClick={() =>
              onAskAIAboutTopic?.(
                'Âm học & Thính lực',
                'Giải thích tại sao tai người lại nhạy cảm nhất ở dải 3000-4000 Hz và nguyên lý tổn thương tế bào lông thính giác khi tiếp xúc tiếng ồn kéo dài?'
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium shrink-0 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hỏi Cố Vấn AI về Âm Học</span>
          </button>
        </div>
      </div>

      {/* Grid: Tone Generator & Oscilloscope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Tone Generator */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Máy Phát Tần Số Âm Thanh (Tone Generator)
            </h2>
            <button
              id="toggle-tone-btn"
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Dừng Phát Sóng' : 'Phát Âm Thanh'}</span>
            </button>
          </div>

          {/* Current Frequency Display & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Tần số dao động</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-cyan-300">{frequency}</span>
                <span className="text-xs font-mono text-slate-500">Hz</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Bước sóng (trong không khí)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-amber-300">
                  {Number(wavelengthCm) > 100 ? (Number(wavelengthCm) / 100).toFixed(2) : wavelengthCm}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {Number(wavelengthCm) > 100 ? 'm' : 'cm'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 block mb-1">Dải thính giác</span>
              <span className="text-xs font-semibold text-slate-200 block truncate" title={freqInfo.range}>
                {freqInfo.range.split('(')[0]}
              </span>
              <span className="text-[10px] text-slate-400">{freqInfo.desc.slice(0, 35)}...</span>
            </div>
          </div>

          {/* Frequency Sliders (Logarithmic Scale) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Điều chỉnh tần số (20 Hz - 20,000 Hz)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="20"
                  max="20000"
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono text-cyan-300"
                />
                <span className="text-slate-500">Hz</span>
              </div>
            </div>

            <input
              id="frequency-slider"
              type="range"
              min="20"
              max="20000"
              step="1"
              value={frequency}
              onChange={(e) => handleFrequencyChange(Number(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />

            {/* Quick Frequency Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[50, 100, 261, 440, 1000, 3500, 8000, 12000, 16000].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFrequencyChange(f)}
                  className={`px-2 py-1 rounded text-xs font-mono border transition ${
                    frequency === f
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {f >= 1000 ? `${f / 1000}kHz` : `${f}Hz`}
                </button>
              ))}
            </div>
          </div>

          {/* Waveform Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Dạng sóng âm học (Waveform)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'sine', label: 'Sin (Sine)', desc: 'Thuần khiết, êm dịu nhất' },
                { type: 'triangle', label: 'Tam giác', desc: 'Có họa âm lẻ nhẹ' },
                { type: 'square', label: 'Sóng vuông', desc: 'Âm thanh điện tử cổ điển' },
                { type: 'sawtooth', label: 'Răng cưa', desc: 'Họa âm phong phú, sắc nhọn' },
              ].map((w) => (
                <button
                  key={w.type}
                  onClick={() => handleWaveformChange(w.type as WaveformType)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    waveform === w.type
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold">{w.label}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{w.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Lab Demos */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block">Thí nghiệm chuẩn âm học</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUND_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.frequency, preset.waveform)}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{preset.frequency} Hz</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Oscilloscope & Spectrogram Canvas */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Đồ Thị Dao Động Sóng (Oscilloscope)
                </h3>
                <p className="text-xs text-slate-400">
                  Biểu diễn li độ áp suất không khí theo thời gian thực (Time-domain) & phổ tần số
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                <span>FFT: 2048 pts</span>
              </div>
            </div>

            <div className="relative flex-1 min-h-[220px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={640}
                height={260}
                className="w-full h-full object-cover block"
              />
              <div className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-cyan-400 border border-cyan-800/60 backdrop-blur">
                Tốc độ truyền âm: ~343 m/s (20°C)
              </div>
            </div>

            {/* Scientific Explanation Box */}
            <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Info className="w-4 h-4" />
                <span>Quy luật vật lý cốt lõi:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tần số <code className="text-cyan-300 font-mono">f</code> tỉ lệ nghịch với bước sóng{' '}
                <code className="text-amber-300 font-mono">λ = v / f</code>. Âm trầm (50 Hz) có bước sóng dài tới{' '}
                <strong className="text-amber-300">6.8 mét</strong>, dễ dàng luồn lách qua tường và khe hở, trong khi
                âm bổng (10.000 Hz) bước sóng chỉ <strong className="text-amber-300">3.4 cm</strong>, dễ bị chặn bởi
                vật cản nhỏ.
              </p>
            </div>
          </div>

          {/* Biological Noise & Sleep / Focus Tools */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Tiếng Ồn Sinh Học (Bio-Noise) & Sóng Não</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ứng dụng che tiếng ồn môi trường, giảm stress và hỗ trợ giấc ngủ sâu
                </p>
              </div>
            </div>

            {/* White / Pink / Brown Noise Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  type: 'white',
                  title: 'White Noise',
                  sub: 'Tiếng ồn trắng (0dB/oct)',
                  desc: 'Phân bố năng lượng đều, át tiếng nói chuyện đột ngột.',
                },
                {
                  type: 'pink',
                  title: 'Pink Noise',
                  sub: 'Tiếng ồn hồng (-3dB/oct)',
                  desc: 'Như tiếng mưa rào êm ái, tối ưu thư giãn & trí nhớ.',
                },
                {
                  type: 'brown',
                  title: 'Brown Noise',
                  sub: 'Tiếng ồn nâu (-6dB/oct)',
                  desc: 'Trầm ấm như thác đổ, sâu lắng, hỗ trợ người khó ngủ.',
                },
              ].map((n) => {
                const active = activeNoise === n.type;
                return (
                  <button
                    key={n.type}
                    onClick={() => handleNoiseToggle(n.type as NoiseType)}
                    className={`p-3 rounded-xl text-left border transition ${
                      active
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{n.title}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          active ? 'bg-amber-400 animate-ping' : 'bg-slate-700'
                        }`}
                      ></span>
                    </div>
                    <span className="block text-[10px] text-slate-400">{n.sub}</span>
                    <span className="block text-[10px] text-slate-500 mt-1 line-clamp-2">{n.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Binaural Beats Player */}
            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Nhịp Song Nhĩ (Binaural Beats - Cần đeo tai nghe Stereo)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Phát 2 tần số lệch nhau vào 2 tai để kích hoạt tần số sóng não tương ứng
                  </span>
                </div>
                <button
                  onClick={handleBinauralToggle}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    binauralActive
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {binauralActive ? 'Dừng Nhịp' : 'Bật Nhịp'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Delta (3 Hz)', carrier: 200, beat: 3, label: 'Ngủ sâu & Phục hồi' },
                  { name: 'Theta (6 Hz)', carrier: 210, beat: 6, label: 'Thiền định & Sáng tạo' },
                  { name: 'Alpha (10 Hz)', carrier: 216, beat: 10, label: 'Thư thái & Học tập' },
                  { name: 'Beta (18 Hz)', carrier: 220, beat: 18, label: 'Tập trung cao độ' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setBinauralPreset(item.carrier, item.beat, `${item.name} - ${item.label}`)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                      binauralActive && binauralState.beat === item.beat
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({item.label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decibel (dB) Safety & Health Scale */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Thang Đo Decibel (dB) & Cảnh Báo An Toàn Thính Giác</span>
            </h2>
            <p className="text-xs text-slate-400">
              Thang Decibel là thang Logarithm: tăng 10 dB tương đương năng lượng âm tăng gấp 10 lần, tăng 20 dB tăng gấp 100 lần!
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Ngưỡng nguy hại: &gt; 85 dB</span>
          </div>
        </div>

        {/* Visual dB Bar Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              db: '20 - 30 dB',
              title: 'Thì thầm / Đêm yên tĩnh',
              risk: 'An toàn tuyệt đối',
              color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
              desc: 'Tiếng lá xào xạc, thư viện, phòng ngủ lý tưởng cho sức khỏe tinh thần.',
            },
            {
              db: '50 - 60 dB',
              title: 'Nói chuyện bình thường',
              risk: 'An toàn sinh hoạt',
              color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
              desc: 'Văn phòng làm việc, cuộc trò chuyện cự ly 1 mét, tiếng mưa rào nhẹ.',
            },
            {
              db: '85 - 90 dB',
              title: 'Giao thông đông đúc / Máy xay',
              risk: 'Bắt đầu có nguy cơ tổn thương',
              color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
              desc: 'Giới hạn an toàn tối đa 8 giờ/ngày theo chuẩn WHO/OSHA. Cần đeo nút bịt tai bảo hộ.',
            },
            {
              db: '110 - 130 dB',
              title: 'Tai nghe max volume / Phản lực',
              risk: 'Tổn hại vĩnh viễn cấp tính',
              color: 'border-rose-500/50 bg-rose-950/30 text-rose-300',
              desc: 'Chỉ 15 phút nghe tai nghe ở 100 dB có thể làm chết các tế bào lông ốc tai không thể hồi phục.',
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-mono">{item.db}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-950/60">
                  {item.risk}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Materials Acoustics & Soundproofing */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>Vật Liệu Cách Âm & Tiêu Âm Trong Nhà Ở</span>
            </h2>
            <p className="text-xs text-slate-400">
              Hệ số tiêu âm (NRC: 0 = phản xạ hoàn toàn, 1.0 = hấp thụ triệt để không có tiếng vang)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MATERIAL_ABSORPTIONS.map((mat) => (
            <div
              key={mat.name}
              className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{mat.name}</span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  NRC: {(mat.coefficient * 100).toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  style={{ width: `${mat.coefficient * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-400">{mat.typicalUse}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
