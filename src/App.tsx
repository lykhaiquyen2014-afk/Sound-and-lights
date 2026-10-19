import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import { audioEngine } from './utils/audioEngine';
import { Navbar } from './components/Navbar';
import { StudyCorner } from './components/StudyCorner';
import { SoundLab } from './components/SoundLab';
import { LightLab } from './components/LightLab';
import { LifeEssentials } from './components/LifeEssentials';
import { LiveMeter } from './components/LiveMeter';
import { AiAssistant } from './components/AiAssistant';
import { AiReviewScreen } from './components/AiReviewScreen';
import { QuizArena } from './components/QuizArena';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('study');

  // Audio Engine runtime states for UI reactivity
  const [isTonePlaying, setIsTonePlaying] = useState<boolean>(false);
  const [activeNoise, setActiveNoise] = useState<string>('none');
  const [isBinauralPlaying, setIsBinauralPlaying] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  // AI query redirection states
  const [aiInitialTopic, setAiInitialTopic] = useState<string>('Vật lý Đời sống');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [aiReviewSourceId, setAiReviewSourceId] = useState<string | undefined>(undefined);
  const [quizInitialSourceId, setQuizInitialSourceId] = useState<string | undefined>(undefined);
  const [quizInitialSubjectId, setQuizInitialSubjectId] = useState<string | undefined>(undefined);

  // Polling audio status for navbar
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTonePlaying(audioEngine.getIsTonePlaying());
      setActiveNoise(audioEngine.getActiveNoise());
      setIsBinauralPlaying(audioEngine.getIsBinauralPlaying());
      setIsMicActive(audioEngine.getIsMicActive());
    }, 200);

    return () => {
      clearInterval(interval);
      audioEngine.stopAll();
      audioEngine.stopMicrophone();
    };
  }, []);

  const handleStopAllAudio = () => {
    audioEngine.stopAll();
    setIsTonePlaying(false);
    setActiveNoise('none');
    setIsBinauralPlaying(false);
  };

  const handleAskAIAboutTopic = (topic: string, question: string) => {
    setAiInitialTopic(topic);
    setAiInitialPrompt(question);
    setActiveTab('ai-mentor');
  };

  const handleOpenAiReview = (sourceId?: string) => {
    setAiReviewSourceId(sourceId);
    setActiveTab('ai-review');
  };

  const handleOpenQuiz = (sourceId?: string, subjectId?: string) => {
    setQuizInitialSourceId(sourceId);
    setQuizInitialSubjectId(subjectId);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTonePlaying={isTonePlaying}
        activeNoise={activeNoise}
        isBinauralPlaying={isBinauralPlaying}
        isMicActive={isMicActive}
        onStopAllAudio={handleStopAllAudio}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'study' && (
          <StudyCorner
            onAskAIAboutTopic={handleAskAIAboutTopic}
            onOpenAiReview={handleOpenAiReview}
            onOpenQuiz={handleOpenQuiz}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizArena
            onAskAIAboutTopic={handleAskAIAboutTopic}
            onNavigateToStudy={() => setActiveTab('study')}
            initialSourceId={quizInitialSourceId}
            initialSubjectId={quizInitialSubjectId}
          />
        )}
        {activeTab === 'sound' && <SoundLab onAskAIAboutTopic={handleAskAIAboutTopic} />}
        {activeTab === 'light' && <LightLab onAskAIAboutTopic={handleAskAIAboutTopic} />}
        {activeTab === 'essentials' && <LifeEssentials onAskAIAboutTopic={handleAskAIAboutTopic} />}
        {activeTab === 'live-meter' && (
          <LiveMeter
            onAskAIAboutTopic={handleAskAIAboutTopic}
            isMicActive={isMicActive}
            setIsMicActive={setIsMicActive}
          />
        )}
        {activeTab === 'ai-mentor' && (
          <AiAssistant initialTopic={aiInitialTopic} initialPrompt={aiInitialPrompt} />
        )}
        {activeTab === 'ai-review' && (
          <AiReviewScreen
            onAskAIAboutTopic={handleAskAIAboutTopic}
            onNavigateToStudy={() => setActiveTab('study')}
            initialSourceId={aiReviewSourceId}
          />
        )}
      </main>

      {/* Scientific Lab Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Nghiên Cứu Âm Thanh & Ánh Sáng</span>
            <span>•</span>
            <span>Ứng Dụng Vật Lý Thiết Yếu Trong Cuộc Sống</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiêu chuẩn an toàn: &lt; 85 dBA • &lt; 5000K ban đêm</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
