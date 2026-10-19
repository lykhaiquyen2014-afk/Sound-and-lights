import React, { useState, useEffect, useRef } from 'react';
import {
  wavelengthToRGB,
  calculatePhotonEnergy,
  kelvinToRGB,
  OPTICAL_MEDIA,
  COLOR_TEMPERATURE_PRESETS,
} from '../utils/opticsCalculations';
import { Sun, Sparkles, Eye, Compass, Info, Zap, ShieldAlert } from 'lucide-react';

interface LightLabProps {
  onAskAIAboutTopic?: (topic: string, question: string) => void;
}

export const LightLab: React.FC<LightLabProps> = ({ onAskAIAboutTopic }) => {
  // Wavelength state
  const [wavelength, setWavelength] = useState<number>(532); // Default 532nm (laser green)

  // Refraction Snell's Law states
  const [medium1Index, setMedium1Index] = useState<number>(0); // Air
  const [medium2Index, setMedium2Index] = useState<number>(2); // Glass
  const [incidentAngleDeg, setIncidentAngleDeg] = useState<number>(45);

  // Kelvin state
  const [kelvin, setKelvin] = useState<number>(4000);

  // RGB Additive Mix states
  const [redLight, setRedLight] = useState<number>(255);
  const [greenLight, setGreenLight] = useState<number>(200);
  const [blueLight, setBlueLight] = useState<number>(50);

  // Canvas for Snell's Law
  const refractionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculated values for wavelength
  const currentColor = wavelengthToRGB(wavelength);
  const photonEnergy = calculatePhotonEnergy(wavelength);

  // Calculated values for Snell's law
  const m1 = OPTICAL_MEDIA[medium1Index];
  const m2 = OPTICAL_MEDIA[medium2Index];
  const theta1Rad = (incidentAngleDeg * Math.PI) / 180;
  const sinTheta2 = (m1.refractiveIndex / m2.refractiveIndex) * Math.sin(theta1Rad);
  const isTotalInternalReflection = sinTheta2 > 1.0;
  const theta2Deg = isTotalInternalReflection ? null : ((Math.asin(sinTheta2) * 180) / Math.PI).toFixed(1);

  // Critical angle if n1 > n2
  const criticalAngleDeg =
    m1.refractiveIndex > m2.refractiveIndex
      ? ((Math.asin(m2.refractiveIndex / m1.refractiveIndex) * 180) / Math.PI).toFixed(1)
      : null;

  // Render Snell's law canvas
  useEffect(() => {
    const canvas = refractionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background: Top half is Medium 1, Bottom half is Medium 2
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, cy);

    // Medium 2 background tinted
    ctx.fillStyle = m2.color === '#0f172a' ? '#131b2e' : `${m2.color}25`;
    ctx.fillRect(0, cy, width, height - cy);

    // Boundary interface line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    // Normal line (pháp tuyến n)
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 15);
    ctx.lineTo(cx, height - 15);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    const rayLength = 130;

    // 1. Incident ray (from Top-Left towards Center)
    const incX = cx - rayLength * Math.sin(theta1Rad);
    const incY = cy - rayLength * Math.cos(theta1Rad);

    ctx.strokeStyle = '#fbbf24'; // Yellow incident ray
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incX, incY);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Arrow on incident ray
    const midIncX = (incX + cx) / 2;
    const midIncY = (incY + cy) / 2;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(midIncX, midIncY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Reflected ray (angle of reflection = theta1)
    const refX = cx + rayLength * Math.sin(theta1Rad);
    const refY = cy - rayLength * Math.cos(theta1Rad);

    ctx.strokeStyle = isTotalInternalReflection ? '#f43f5e' : 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = isTotalInternalReflection ? 3.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(refX, refY);
    ctx.stroke();

    // 3. Refracted ray (if no Total Internal Reflection)
    if (!isTotalInternalReflection && theta2Deg !== null) {
      const theta2Rad = (Number(theta2Deg) * Math.PI) / 180;
      const refrX = cx + rayLength * Math.sin(theta2Rad);
      const refrY = cy + rayLength * Math.cos(theta2Rad);

      ctx.strokeStyle = '#38bdf8'; // Cyan refracted ray
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refrX, refrY);
      ctx.stroke();

      // Angle arc for theta 2
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, Math.PI / 2, Math.PI / 2 - theta2Rad, true);
      ctx.stroke();
    }

    // Angle arc for theta 1
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 35, -Math.PI / 2 - theta1Rad, -Math.PI / 2);
    ctx.stroke();

    // Text labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`Môi trường 1: ${m1.nameVi} (n₁ = ${m1.refractiveIndex})`, 16, 26);
    ctx.fillText(`Môi trường 2: ${m2.nameVi} (n₂ = ${m2.refractiveIndex})`, 16, height - 16);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Tia tới: θ₁ = ${incidentAngleDeg}°`, cx - 110, cy - 45);

    if (isTotalInternalReflection) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`PHẢN XẠ TOÀN PHẦN (θ₁ > θc = ${criticalAngleDeg}°)`, cx + 20, cy - 40);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Tia khúc xạ: θ₂ = ${theta2Deg}°`, cx + 25, cy + 45);
    }
  }, [medium1Index, medium2Index, incidentAngleDeg, m1, m2, theta1Rad, isTotalInternalReflection, theta2Deg, criticalAngleDeg]);

  // Kelvin calculation
  const kelvinRgb = kelvinToRGB(kelvin);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-xs font-semibold">
              <Sun className="w-3.5 h-3.5" />
              <span>Phòng Thí Nghiệm Quang Học & Bức Xạ Điện Từ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Nghiên Cứu Bản Chất Ánh Sáng & Quang Học Ứng Dụng
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Ánh sáng vừa có tính chất sóng vừa có tính chất hạt (lưỡng tính sóng-hạt).
              Khám phá dải quang phổ khả kiến (380 - 780 nm), định luật khúc xạ ánh sáng (Snell), hiện tượng phản xạ toàn phần
              tạo nên cáp quang biển, và tác động sinh học của nhiệt độ màu (Kelvin) lên mắt và giấc ngủ.
            </p>
          </div>

          <button
            onClick={() =>
              onAskAIAboutTopic?.(
                'Quang học & Ánh sáng',
                'Giải thích hiện tượng tán sắc ánh sáng tạo thành cầu vồng và tại sao cáp quang truyền dữ liệu internet bằng phản xạ toàn phần?'
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium shrink-0 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hỏi Cố Vấn AI về Quang Học</span>
          </button>
        </div>
      </div>

      {/* Module 1: Visible Spectrum & Photon Explorer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Khám Phá Dải Quang Phổ Ánh Sáng Khả Kiến (380 - 780 nm)
            </h2>
            <p className="text-xs text-slate-400">
              Mỗi bước sóng ứng với một màu sắc thị giác và mang một mức năng lượng photon riêng biệt
            </p>
          </div>

          {/* Color Preview Pill */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div
              className="w-7 h-7 rounded-lg shadow-inner border border-white/20 transition-all duration-150"
              style={{ backgroundColor: currentColor.hex }}
            ></div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">{currentColor.name}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentColor.hex.toUpperCase()} • {wavelength} nm
              </span>
            </div>
          </div>
        </div>

        {/* Wavelength Slider with Visible Spectrum Gradient Track */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kéo chọn bước sóng (λ)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="380"
                max="780"
                value={wavelength}
                onChange={(e) => setWavelength(Math.max(380, Math.min(780, Number(e.target.value))))}
                className="w-20 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono text-amber-300"
              />
              <span className="text-slate-500 font-mono">nm</span>
            </div>
          </div>

          {/* Rainbow Gradient Visual Track */}
          <div className="relative w-full h-8 rounded-xl overflow-hidden p-0.5 border border-slate-700 shadow-inner">
            <div
              className="w-full h-full rounded-lg"
              style={{
                background:
                  'linear-gradient(to right, #4c1d95 0%, #3b82f6 15%, #06b6d4 28%, #10b981 45%, #eab308 65%, #f97316 80%, #ef4444 95%, #7f1d1d 100%)',
              }}
            ></div>
            <input
              id="wavelength-slider"
              type="range"
              min="380"
              max="780"
              value={wavelength}
              onChange={(e) => setWavelength(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Spectrum Quick Landmarks */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
            <button onClick={() => setWavelength(405)} className="hover:text-purple-400">
              405nm (Tím UV)
            </button>
            <button onClick={() => setWavelength(470)} className="hover:text-blue-400">
              470nm (Lam)
            </button>
            <button onClick={() => setWavelength(532)} className="hover:text-emerald-400 font-bold">
              532nm (Lục DPSS)
            </button>
            <button onClick={() => setWavelength(589)} className="hover:text-amber-400">
              589nm (Vàng Natri)
            </button>
            <button onClick={() => setWavelength(650)} className="hover:text-rose-400">
              650nm (Đỏ Laser)
            </button>
          </div>
        </div>

        {/* Physics Metrics Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Tần số sóng ánh sáng</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-300">
                {photonEnergy.frequencyTHz}
              </span>
              <span className="text-xs font-mono text-slate-500">THz (10¹² Hz)</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">f = c / λ (c ≈ 300,000 km/s)</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Năng lượng hạt Photon (eV)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-300">
                {photonEnergy.energyEv}
              </span>
              <span className="text-xs font-mono text-slate-500">eV (Electronvolt)</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {Number(photonEnergy.energyEv) > 2.8
                ? 'Năng lượng cao: có thể gây đứt gãy phân tử tế bào!'
                : 'Năng lượng trung bình: an toàn cho tế bào mắt'}
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Năng lượng theo hệ SI (Joule)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-emerald-300">
                {photonEnergy.energyJoulesExp}
              </span>
              <span className="text-xs font-mono text-slate-500">J</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">E = h · f (h = 6.626×10⁻³⁴ J·s)</span>
          </div>
        </div>

        {/* Full Electromagnetic Scale Reference */}
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Thang Phổ Bức Xạ Điện Từ Toàn Diện (Electromagnetic Spectrum)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-rose-400 block">Tia Gamma</span>
              <span className="text-[10px] text-slate-400">&lt; 0.01 nm</span>
              <span className="text-[9px] text-slate-500 block mt-1">Phóng xạ hạt nhân</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-indigo-400 block">Tia X (X-Ray)</span>
              <span className="text-[10px] text-slate-400">0.01 - 10 nm</span>
              <span className="text-[9px] text-slate-500 block mt-1">Chụp X-quang y tế</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-purple-400 block">Tử ngoại (UV)</span>
              <span className="text-[10px] text-slate-400">10 - 380 nm</span>
              <span className="text-[9px] text-slate-500 block mt-1">UVA/UVB ánh nắng</span>
            </div>
            <div className="p-2 bg-cyan-950/60 rounded-lg border border-cyan-500/50">
              <span className="font-bold text-cyan-300 block">Khả Kiến</span>
              <span className="text-[10px] text-cyan-400 font-mono">380 - 780 nm</span>
              <span className="text-[9px] text-cyan-300 block mt-1">Mắt người nhìn thấy</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-red-400 block">Hồng ngoại (IR)</span>
              <span className="text-[10px] text-slate-400">780nm - 1mm</span>
              <span className="text-[9px] text-slate-500 block mt-1">Bức xạ nhiệt, điều khiển</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-amber-400 block">Sóng Vi Ba</span>
              <span className="text-[10px] text-slate-400">1mm - 1m</span>
              <span className="text-[9px] text-slate-500 block mt-1">Lò vi sóng, Wi-Fi 5GHz</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-emerald-400 block">Sóng Radio</span>
              <span className="text-[10px] text-slate-400">&gt; 1 mét</span>
              <span className="text-[9px] text-slate-500 block mt-1">4G/5G, FM, truyền hình</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Snell's Law & Total Internal Reflection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Mô Phỏng Định Luật Khúc Xạ Snell & Phản Xạ Toàn Phần</span>
            </h2>
            <p className="text-xs text-slate-400">
              Công thức: <code className="text-amber-300 font-mono">n₁ · sin(θ₁) = n₂ · sin(θ₂)</code>
            </p>
          </div>

          {criticalAngleDeg && (
            <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-semibold">
              Góc tới hạn: θc = {criticalAngleDeg}°
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Medium 1 Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Môi trường 1 (Nơi tia sáng xuất phát):
              </label>
              <select
                value={medium1Index}
                onChange={(e) => setMedium1Index(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200"
              >
                {OPTICAL_MEDIA.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m.nameVi} (n₁ = {m.refractiveIndex})
                  </option>
                ))}
              </select>
            </div>

            {/* Medium 2 Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Môi trường 2 (Nơi tia sáng đi vào):
              </label>
              <select
                value={medium2Index}
                onChange={(e) => setMedium2Index(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200"
              >
                {OPTICAL_MEDIA.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m.nameVi} (n₂ = {m.refractiveIndex})
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Angle Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Góc tới (θ₁):</span>
                <span className="font-mono text-amber-300 font-bold text-sm">{incidentAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="1"
                value={incidentAngleDeg}
                onChange={(e) => setIncidentAngleDeg(Number(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Practical Application Explanations */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Ứng dụng thực tiễn của hiện tượng:</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                • <strong>Cáp quang Internet xuyên biển:</strong> Lõi thủy tinh có chiết suất cao hơn lớp vỏ.
                Tia sáng laser đưa vào góc lớn hơn góc giới hạn nên liên tục phản xạ toàn phần bên trong,
                truyền đi hàng ngàn cây số mà hầu như không suy hao!
              </p>
              <p className="leading-relaxed text-slate-400">
                • <strong>Kim cương lấp lánh:</strong> Chiết suất cực lớn (n = 2.42) khiến góc giới hạn chỉ 24.4°.
                Thợ kim hoàn cắt các giác vát để ánh sáng sau khi vào bị phản xạ toàn phần nhiều lần trước khi ló ra mặt trên!
              </p>
            </div>
          </div>

          {/* Canvas Ray Tracer */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex-1 min-h-[300px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <canvas
                ref={refractionCanvasRef}
                width={520}
                height={320}
                className="w-full h-full object-contain block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Kelvin Color Temperature & Circadian Rhythm */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Nhiệt Độ Màu (Kelvin) & Nhịp Sinh Học Con Người (Circadian Rhythm)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Tại sao đèn làm việc khác với đèn ngủ? Cơ chế thụ thể Melanopsin và ức chế Melatonin
            </p>
          </div>

          <div
            className="px-3.5 py-1.5 rounded-xl border border-white/20 text-slate-950 font-bold text-xs shadow"
            style={{ backgroundColor: kelvinRgb.hex }}
          >
            {kelvin} Kelvin
          </div>
        </div>

        {/* Kelvin Interactive Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kéo chọn nhiệt độ màu (1,800K - 10,000K)</span>
            <span className="font-mono text-amber-300">{kelvin} K</span>
          </div>

          {/* Kelvin Gradient */}
          <div className="relative w-full h-8 rounded-xl overflow-hidden p-0.5 border border-slate-700 shadow-inner">
            <div
              className="w-full h-full rounded-lg"
              style={{
                background:
                  'linear-gradient(to right, #ff8912 0%, #ffb46b 20%, #ffe4ce 45%, #f4f6ff 70%, #d6e4ff 90%, #9fc4ff 100%)',
              }}
            ></div>
            <input
              id="kelvin-slider"
              type="range"
              min="1800"
              max="10000"
              step="50"
              value={kelvin}
              onChange={(e) => setKelvin(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Color Temperature Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COLOR_TEMPERATURE_PRESETS.map((item) => {
            const isSelected = Math.abs(kelvin - item.kelvin) < 300;
            return (
              <button
                key={item.kelvin}
                onClick={() => setKelvin(item.kelvin)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: item.rgb }}
                  ></div>
                  <span className="font-mono font-bold text-xs text-slate-200">{item.kelvin}K</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mb-1">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mb-2">{item.description}</p>
                <div className="pt-2 border-t border-slate-800 text-[10px]">
                  <span className="text-slate-500 block">Ức chế Melatonin:</span>
                  <span
                    className={`font-semibold ${
                      item.melatoninImpact.includes('Rất cao') || item.melatoninImpact === 'Cao'
                        ? 'text-rose-400'
                        : item.melatoninImpact === 'Trung bình'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {item.melatoninImpact}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Health Advisory for Screen Blue Light */}
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Quy tắc bảo vệ mắt & giấc ngủ với ánh sáng:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ánh sáng xanh bước sóng 460-480nm đánh lừa bộ não rằng "đang là giữa trưa", làm ngừng sản xuất hoóc-môn
            Melatonin. Nếu sử dụng điện thoại/máy tính trước khi ngủ, hãy bật chế độ <strong>Night Shift / Chống ánh sáng xanh</strong>{' '}
            hoặc giảm nhiệt độ màu về dưới <strong>3000K</strong> ít nhất 1 giờ trước khi đi ngủ.
          </p>
        </div>
      </div>

      {/* Module 4: Additive Color Mixing (RGB Spotlights) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Phép Cộng Màu Quang Học (Additive RGB Color Synthesis)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Nguyên lý hoạt động của mọi màn hình điện thoại, TV OLED, LED: Đỏ + Lục + Lam = Ánh Sáng Trắng!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 3 Color Sliders */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Đèn Đỏ (Red):</span>
                <span className="text-slate-300">{redLight} / 255</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={redLight}
                onChange={(e) => setRedLight(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Đèn Lục (Green):</span>
                <span className="text-slate-300">{greenLight} / 255</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={greenLight}
                onChange={(e) => setGreenLight(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">Đèn Lam (Blue):</span>
                <span className="text-slate-300">{blueLight} / 255</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={blueLight}
                onChange={(e) => setBlueLight(Number(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setRedLight(255);
                  setGreenLight(255);
                  setBlueLight(0);
                }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded border border-slate-700"
              >
                Đỏ + Lục = Vàng (Yellow)
              </button>
              <button
                onClick={() => {
                  setRedLight(0);
                  setGreenLight(255);
                  setBlueLight(255);
                }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700"
              >
                Lục + Lam = Xanh lơ (Cyan)
              </button>
              <button
                onClick={() => {
                  setRedLight(255);
                  setGreenLight(255);
                  setBlueLight(255);
                }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 rounded border border-slate-700"
              >
                Cả ba = Trắng (White)
              </button>
            </div>
          </div>

          {/* Mixed Spotlight Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl">
            <div
              className="w-40 h-40 rounded-full transition-all duration-150 border-4 border-slate-800 shadow-2xl flex items-center justify-center"
              style={{
                backgroundColor: `rgb(${redLight}, ${greenLight}, ${blueLight})`,
                boxShadow: `0 0 50px rgba(${redLight}, ${greenLight}, ${blueLight}, 0.5)`,
              }}
            >
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded bg-black/50 text-white backdrop-blur"
              >
                rgb({redLight}, {greenLight}, {blueLight})
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-4 text-center">
              Khác với pha màu nước (Trừ màu CMYK), pha ánh sáng là cộng thêm năng lượng photon!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
