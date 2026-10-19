import { RefractionMedium, ColorTemperaturePoint, LightingBenchmark } from '../types';

/**
 * Converts a wavelength in nanometers (380 - 780 nm) to RGB and human readable color name.
 * Uses Bruton's algorithm for standard CIE spectrum approximation.
 */
export function wavelengthToRGB(wavelength: number): { r: number; g: number; b: number; hex: string; name: string } {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Intensity falloff near vision limits (380-420 and 700-780)
  let factor = 0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 420 && wavelength <= 700) {
    factor = 1.0;
  } else if (wavelength > 700 && wavelength <= 780) {
    factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
  }

  const R = Math.round(255 * Math.pow(r * factor, 0.8));
  const G = Math.round(255 * Math.pow(g * factor, 0.8));
  const B = Math.round(255 * Math.pow(b * factor, 0.8));

  const hex = `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;

  let name = 'Ánh sáng thấy được';
  if (wavelength < 400) name = 'Tím thẫm cận tử ngoại (Near UV)';
  else if (wavelength < 450) name = 'Tím (Violet)';
  else if (wavelength < 485) name = 'Chàm - Xanh lam (Blue)';
  else if (wavelength < 500) name = 'Xanh lơ (Cyan)';
  else if (wavelength < 565) name = 'Lục (Green)';
  else if (wavelength < 590) name = 'Vàng (Yellow)';
  else if (wavelength < 625) name = 'Cam (Orange)';
  else if (wavelength < 740) name = 'Đỏ (Red)';
  else name = 'Đỏ sẫm cận hồng ngoại (Near IR)';

  return { r: R, g: G, b: B, hex, name };
}

/**
 * Calculates photon energy E = h * c / lambda (in electronvolts eV and Joules J)
 */
export function calculatePhotonEnergy(wavelengthNm: number) {
  const h = 6.62607015e-34; // Planck's constant (J·s)
  const c = 299792458; // Speed of light (m/s)
  const q = 1.602176634e-19; // Elementary charge (C)

  const lambdaM = wavelengthNm * 1e-9;
  const frequencyHz = c / lambdaM;
  const energyJoules = h * frequencyHz;
  const energyEv = energyJoules / q;

  return {
    frequencyTHz: (frequencyHz / 1e12).toFixed(2),
    energyEv: energyEv.toFixed(2),
    energyJoulesExp: energyJoules.toExponential(3),
  };
}

/**
 * Converts Kelvin color temperature to an approximate RGB string using Tanner Helland algorithm.
 */
export function kelvinToRGB(kelvin: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let red = 0;
  let green = 0;
  let blue = 0;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.max(0, Math.min(255, red));
  }

  // Green
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
  }
  green = Math.max(0, Math.min(255, green));

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.max(0, Math.min(255, blue));
  }

  const R = Math.round(red);
  const G = Math.round(green);
  const B = Math.round(blue);
  const hex = `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;

  return { r: R, g: G, b: B, hex };
}

/**
 * Common optical media for Snell's law refraction simulator.
 */
export const OPTICAL_MEDIA: RefractionMedium[] = [
  {
    name: 'Air / Chân không',
    nameVi: 'Không khí (1 atm)',
    refractiveIndex: 1.0,
    color: '#0f172a',
    description: 'Chiết suất chuẩn của không khí và chân không.',
  },
  {
    name: 'Water / Nước',
    nameVi: 'Nước (20°C)',
    refractiveIndex: 1.333,
    color: '#0284c7',
    description: 'Nước lọc thông thường; uốn cong tia sáng gây ảo ảnh khi nhìn vật dưới nước.',
  },
  {
    name: 'Pyrex Glass / Thủy tinh Crown',
    nameVi: 'Thủy tinh quang học',
    refractiveIndex: 1.52,
    color: '#059669',
    description: 'Làm tròng kính mắt, lăng kính và thấu kính máy ảnh.',
  },
  {
    name: 'Flint Glass / Pha lê',
    nameVi: 'Thủy tinh Flint (Chì / Pha lê)',
    refractiveIndex: 1.66,
    color: '#7c3aed',
    description: 'Tán sắc mạnh, làm đồ trang sức pha lê và ống kính viễn vọng cao cấp.',
  },
  {
    name: 'Diamond / Kim cương',
    nameVi: 'Kim cương tự nhiên',
    refractiveIndex: 2.417,
    color: '#06b6d4',
    description: 'Chiết suất cực cao, góc giới hạn cực nhỏ (24.4°), tạo hiện tượng phản xạ toàn phần rực rỡ lấp lánh.',
  },
];

export const COLOR_TEMPERATURE_PRESETS: ColorTemperaturePoint[] = [
  {
    kelvin: 1900,
    name: 'Ánh ngọn nến',
    description: 'Ánh sáng vàng cam rất ấm, hoàn toàn không chứa bức xạ xanh lam bước sóng ngắn.',
    melatoninImpact: 'Không ảnh hưởng',
    recommendedUse: 'Thư giãn hoàn toàn trước giờ ngủ 30 phút, phòng thiền.',
    rgb: '#ff9329',
  },
  {
    kelvin: 2700,
    name: 'Bóng đèn sợi đốt cổ điển (Warm White)',
    description: 'Màu vàng ấm cúng, êm dịu cho mắt sau một ngày làm việc mệt mỏi.',
    melatoninImpact: 'Thấp',
    recommendedUse: 'Đèn ngủ đầu giường, phòng khách buổi tối, bàn ăn gia đình.',
    rgb: '#ffb46b',
  },
  {
    kelvin: 4000,
    name: 'Trắng trung tính (Neutral White)',
    description: 'Cân bằng giữa sự thư thái và tỉnh táo, mô phỏng ánh ban mai.',
    melatoninImpact: 'Trung bình',
    recommendedUse: 'Bàn học trẻ em, nhà bếp, phòng đọc sách thư viện.',
    rgb: '#ffe4ce',
  },
  {
    kelvin: 5500,
    name: 'Ánh sáng ban ngày (Daylight)',
    description: 'Tương đương ánh nắng mặt trời buổi trưa không mây, kích thích sự tập trung tối đa.',
    melatoninImpact: 'Cao',
    recommendedUse: 'Văn phòng làm việc, xưởng thiết kế, phòng chụp ảnh sản phẩm.',
    rgb: '#f4f6ff',
  },
  {
    kelvin: 6500,
    name: 'Trắng xanh mát (Cool Daylight)',
    description: 'Ánh sáng tiêu chuẩn màn hình sRGB/D65, giàu quang phổ xanh (450-480nm).',
    melatoninImpact: 'Rất cao (Ngăn buồn ngủ)',
    recommendedUse: 'Khu vực sản xuất công nghiệp, phòng mổ bệnh viện. Tránh dùng ban đêm!',
    rgb: '#d6e4ff',
  },
];

export const LIGHTING_BENCHMARKS: LightingBenchmark[] = [
  {
    room: 'Bàn làm việc / Đọc sách',
    luxMin: 400,
    luxMax: 600,
    kelvinRange: '4000K - 5000K',
    tips: 'Cần ánh sáng rọi trực tiếp chống chói mỏi mắt, không dùng ánh sáng quá vàng hoặc quá xanh gắt.',
  },
  {
    room: 'Phòng khách sinh hoạt',
    luxMin: 150,
    luxMax: 300,
    kelvinRange: '2700K - 3500K',
    tips: 'Nên dùng chiếu sáng gián tiếp (hắt trần) tạo cảm giác ấm cúng thân mật.',
  },
  {
    room: 'Phòng ngủ ban đêm',
    luxMin: 30,
    luxMax: 80,
    kelvinRange: '2000K - 2700K',
    tips: 'Giữ ánh sáng tối thiểu với dải màu ấm để cơ thể tiết Melatonin tự nhiên thúc đẩy giấc ngủ sâu.',
  },
  {
    room: 'Nhà bếp & Khu vực nấu ăn',
    luxMin: 300,
    luxMax: 500,
    kelvinRange: '4000K - 4500K',
    tips: 'Cần độ hoàn màu CRI cao (CRI > 85) để nhìn rõ độ tươi của thực phẩm.',
  },
  {
    room: 'Màn hình máy tính (Phòng làm việc)',
    luxMin: 250,
    luxMax: 400,
    kelvinRange: '3000K - 4500K',
    tips: 'Độ sáng phòng nên tương đương độ sáng màn hình để đồng tử mắt không phải co giãn liên tục.',
  },
];
