import React, { useState } from 'react';
import { TabType } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { Volume2, VolumeX, Sparkles, Activity, SunMedium, Waves, Compass, GraduationCap, Brain, Target } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isTonePlaying: boolean;
  activeNoise: string;
  isBinauralPlaying: boolean;
  isMicActive: boolean;
  onStopAllAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isTonePlaying,
  activeNoise,
  isBinauralPlaying,
  isMicActive,
  onStopAllAudio,
}) => {
  const [volume, setVolume] = useState<number>(0.3);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
    audioEngine.setMasterVolume(isMuted ? 0 : val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setMasterVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setMasterVolume(0);
    }
  };

  const isAudioActive = isTonePlaying || activeNoise !== 'none' || isBinauralPlaying;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'study', label: 'Góc Học Tập', icon: <GraduationCap className="w-4 h-4 text-indigo-400" /> },
    { id: 'quiz', label: 'Đấu Trường Quiz', icon: <Target className="w-4 h-4 text-emerald-400" />, badge: 'BUỔI 4' },
    { id: 'sound', label: 'Nghiên Cứu Âm Thanh', icon: <Waves className="w-4 h-4" /> },
    { id: 'light', label: 'Nghiên Cứu Ánh Sáng', icon: <SunMedium className="w-4 h-4" /> },
    { id: 'essentials', label: 'Ứng Dụng Đời Sống', icon: <Compass className="w-4 h-4" /> },
    { id: 'live-meter', label: 'Máy Đo Trực Tiếp', icon: <Activity className="w-4 h-4" />, badge: isMicActive ? 'MIC ON' : undefined },
    { id: 'ai-review', label: 'Review AI Hiểu Gì', icon: <Brain className="w-4 h-4 text-purple-400" /> },
    { id: 'ai-mentor', label: 'Trợ Lý Khoa Học AI', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-amber-300 bg-clip-text text-transparent">
                  Ψ
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                  Lý Học Đời Sống
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-full">
                  Sound & Light Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Nghiên cứu âm thanh, quang học & môi trường sống
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Master Sound & Safety Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            {isAudioActive && (
              <button
                id="stop-all-audio-btn"
                onClick={onStopAllAudio}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
                title="Dừng phát toàn bộ âm thanh"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Dừng Âm
              </button>
            )}

            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 gap-2">
              <button
                id="toggle-master-mute-btn"
                onClick={toggleMute}
                className="text-slate-400 hover:text-slate-200 transition"
                title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>
              <input
                id="master-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <span className="text-[11px] font-mono text-slate-400 w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 border-t border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1 py-0.2 text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
