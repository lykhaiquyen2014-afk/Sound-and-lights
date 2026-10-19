import { WaveformType, NoiseType, SoundPreset, MaterialAbsorption } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Single tone generator
  private osc: OscillatorNode | null = null;
  private oscGain: GainNode | null = null;
  private isTonePlaying: boolean = false;
  private currentFrequency: number = 440;
  private currentWaveform: WaveformType = 'sine';

  // Noise generator
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private activeNoiseType: NoiseType = 'none';

  // Binaural beat generator
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;
  private isBinauralPlaying: boolean = false;

  // Microphone stream analyzer
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private isMicActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Safe initial volume

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  // --- TONE OSCILLATOR ---
  public startTone(frequency: number = 440, waveform: WaveformType = 'sine') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopTone();

    this.currentFrequency = frequency;
    this.currentWaveform = waveform;

    this.osc = this.ctx.createOscillator();
    this.osc.type = waveform;
    this.osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    this.oscGain = this.ctx.createGain();
    this.oscGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.oscGain.gain.exponentialRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);

    this.osc.connect(this.oscGain);
    this.oscGain.connect(this.masterGain);

    this.osc.start();
    this.isTonePlaying = true;
  }

  public updateTone(frequency: number, waveform?: WaveformType) {
    if (!this.ctx || !this.osc) return;
    this.currentFrequency = frequency;
    this.osc.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.03);

    if (waveform && waveform !== this.currentWaveform) {
      this.currentWaveform = waveform;
      this.osc.type = waveform;
    }
  }

  public stopTone() {
    if (this.osc && this.oscGain && this.ctx) {
      try {
        this.oscGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
        const oldOsc = this.osc;
        setTimeout(() => {
          try {
            oldOsc.stop();
            oldOsc.disconnect();
          } catch {}
        }, 60);
      } catch {
        this.osc.stop();
        this.osc.disconnect();
      }
      this.osc = null;
      this.oscGain = null;
    }
    this.isTonePlaying = false;
  }

  // --- NOISE GENERATION (White, Pink, Brown) ---
  public startNoise(type: NoiseType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopNoise();
    if (type === 'none') return;

    this.activeNoiseType = type;
    const bufferSize = 5 * this.ctx.sampleRate; // 5 seconds looped buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Paul Kellet's filter method
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Boost amplitude
      }
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.noiseGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.1);

    this.noiseNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  public stopNoise() {
    if (this.noiseNode && this.noiseGain && this.ctx) {
      try {
        this.noiseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
        const node = this.noiseNode;
        setTimeout(() => {
          try {
            node.stop();
            node.disconnect();
          } catch {}
        }, 60);
      } catch {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      }
      this.noiseNode = null;
      this.noiseGain = null;
    }
    this.activeNoiseType = 'none';
  }

  // --- BINAURAL BEATS GENERATOR ---
  // Plays carrier frequency in Left ear, carrier + beatOffset in Right ear
  public startBinauralBeats(carrierFreq: number = 216, beatOffset: number = 10) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopBinauralBeats();

    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    // Left channel panner
    const leftPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (leftPanner) leftPanner.pan.setValueAtTime(-1, this.ctx.currentTime);

    this.binauralLeftOsc = this.ctx.createOscillator();
    this.binauralLeftOsc.type = 'sine';
    this.binauralLeftOsc.frequency.setValueAtTime(carrierFreq, this.ctx.currentTime);

    // Right channel panner
    const rightPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (rightPanner) rightPanner.pan.setValueAtTime(1, this.ctx.currentTime);

    this.binauralRightOsc = this.ctx.createOscillator();
    this.binauralRightOsc.type = 'sine';
    this.binauralRightOsc.frequency.setValueAtTime(carrierFreq + beatOffset, this.ctx.currentTime);

    if (leftPanner && rightPanner) {
      this.binauralLeftOsc.connect(leftPanner);
      leftPanner.connect(this.binauralGain);

      this.binauralRightOsc.connect(rightPanner);
      rightPanner.connect(this.binauralGain);
    } else {
      this.binauralLeftOsc.connect(this.binauralGain);
      this.binauralRightOsc.connect(this.binauralGain);
    }

    this.binauralGain.connect(this.masterGain);

    this.binauralLeftOsc.start();
    this.binauralRightOsc.start();
    this.isBinauralPlaying = true;
  }

  public stopBinauralBeats() {
    if (this.binauralLeftOsc && this.binauralRightOsc) {
      try {
        this.binauralLeftOsc.stop();
        this.binauralRightOsc.stop();
        this.binauralLeftOsc.disconnect();
        this.binauralRightOsc.disconnect();
      } catch {}
      this.binauralLeftOsc = null;
      this.binauralRightOsc = null;
    }
    this.isBinauralPlaying = false;
  }

  // --- MICROPHONE LIVE INPUT ---
  public async startMicrophone(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.isMicActive && this.micStream) {
        return true;
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.ctx.createAnalyser();
      this.micAnalyser.fftSize = 2048;
      this.micAnalyser.smoothingTimeConstant = 0.8;

      this.micSource.connect(this.micAnalyser);
      // NOTE: Do NOT connect micAnalyser to ctx.destination to avoid audio feedback loop howl!
      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn("Could not access microphone:", err);
      this.isMicActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.micAnalyser = null;
    this.isMicActive = false;
  }

  // Visualizer data getters
  public getOscillatorAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  public getIsTonePlaying(): boolean {
    return this.isTonePlaying;
  }

  public getActiveNoise(): NoiseType {
    return this.activeNoiseType;
  }

  public getIsBinauralPlaying(): boolean {
    return this.isBinauralPlaying;
  }

  public getIsMicActive(): boolean {
    return this.isMicActive;
  }

  public stopAll() {
    this.stopTone();
    this.stopNoise();
    this.stopBinauralBeats();
  }

  // --- QUIZ SOUND EFFECTS ---
  public playQuizCorrect() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public playQuizWrong() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.2); // E3
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  public playQuizComplete() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  public playQuizTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }
}

export const audioEngine = new AudioEngine();

export const SOUND_PRESETS: SoundPreset[] = [
  {
    name: 'Concert A (La 440 Hz)',
    frequency: 440,
    waveform: 'sine',
    description: 'Tần số chuẩn quốc tế để lên dây cho mọi dàn nhạc giao hưởng (ISO 16).',
    category: 'musical',
  },
  {
    name: 'Đô Trung (Middle C4 - 261.6 Hz)',
    frequency: 261.6,
    waveform: 'triangle',
    description: 'Phím Đô ở giữa đàn piano, điểm mốc cơ bản trong nhạc lý.',
    category: 'musical',
  },
  {
    name: 'Sub-bass Trầm (60 Hz)',
    frequency: 60,
    waveform: 'sine',
    description: 'Tần số rung cực trầm của loa Subwoofer, rung cảm cả lồng ngực.',
    category: 'acoustic',
  },
  {
    name: 'Vùng Thính Giác Nhạy Nhất (3,500 Hz)',
    frequency: 3500,
    waveform: 'sine',
    description: 'Ống tai người cộng hưởng tự nhiên ở 3-4 kHz, tiến hóa để nhạy với tiếng trẻ khóc và cảnh báo nguy hiểm.',
    category: 'hearing',
  },
  {
    name: 'Kiểm Tra Tần Số Cao (12,000 Hz)',
    frequency: 12000,
    waveform: 'sine',
    description: 'Âm kim cao vút; người lớn tuổi thường suy giảm thính lực bắt đầu từ dải này (Presbycusis).',
    category: 'hearing',
  },
  {
    name: 'Ngưỡng Giới Hạn Trẻ Em (16,000 Hz)',
    frequency: 16000,
    waveform: 'sine',
    description: 'Âm thanh muỗi (Mosquito sound) - thường chỉ thanh thiếu niên dưới 25 tuổi nghe rõ.',
    category: 'hearing',
  },
];

export const MATERIAL_ABSORPTIONS: MaterialAbsorption[] = [
  {
    name: 'Mút xốp tiêu âm phòng thu (Acoustic Foam)',
    coefficient: 0.85,
    typicalUse: 'Triệt tiêu tiếng vang phản xạ, gắn phòng thu âm và phòng họp.',
    category: 'acoustic',
  },
  {
    name: 'Thảm lông dày trải sàn (Thick Carpet)',
    coefficient: 0.55,
    typicalUse: 'Giảm tiếng bước chân và tiếng dội sàn nhà chung cư.',
    category: 'floor',
  },
  {
    name: 'Rèm vải nhung hai lớp (Heavy Drapes)',
    coefficient: 0.45,
    typicalUse: 'Hấp thụ âm thanh trung-cao và che sáng tuyệt đối cho phòng ngủ.',
    category: 'furniture',
  },
  {
    name: 'Tấm ốp gỗ xẻ rãnh (Wood Paneling)',
    coefficient: 0.25,
    typicalUse: 'Tạo độ ấm cho âm thanh mà không làm phòng bị "câm", dùng trong nhà hát.',
    category: 'wall',
  },
  {
    name: 'Cửa kính dày 2 lớp cách âm (Double Glazed Window)',
    coefficient: 0.12,
    typicalUse: 'Chặn tiếng ồn xe cộ ngoài phố truyền vào qua khe hở.',
    category: 'wall',
  },
  {
    name: 'Tường bê tông quét vôi phẳng (Smooth Concrete)',
    coefficient: 0.02,
    typicalUse: 'Phản xạ hầu như 98% sóng âm, gây hiện tượng vang vọng nhức đầu.',
    category: 'wall',
  },
];
