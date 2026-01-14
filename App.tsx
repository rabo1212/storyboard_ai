
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header.tsx';
import PromptForm from './components/PromptForm.tsx';
import StoryboardPanel from './components/StoryboardPanel.tsx';
import PricingModal from './components/PricingModal.tsx';
import LoginModal from './components/LoginModal.tsx';
import AdPlayer from './components/AdPlayer.tsx';
import { StoryboardProject, PanelStatus, ART_STYLES, PricingTier, User } from './types.ts';
import { generateStoryboardScript, generatePanelImage } from './services/geminiService.ts';

const App: React.FC = () => {
  const [project, setProject] = useState<StoryboardProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 사용자 계정 상태 관리
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('visionary_current_user');
      if (!saved) return null;
      const user: User = JSON.parse(saved);
      
      const today = new Date().toDateString();
      if (user.lastAdDate !== today) {
        user.dailyAdCount = 0;
        user.lastAdDate = today;
      }
      return user;
    } catch (e) {
      return null;
    }
  });

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('visionary_current_user', JSON.stringify(currentUser));
      const usersStr = localStorage.getItem('visionary_users') || '[]';
      const users: User[] = JSON.parse(usersStr);
      const updatedUsers = users.map(u => u.email === currentUser.email ? currentUser : u);
      localStorage.setItem('visionary_users', JSON.stringify(updatedUsers));
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProject(null);
  };

  const handleOpenPricing = () => setIsPricingOpen(true);
  const handleClosePricing = () => setIsPricingOpen(false);

  const handlePurchase = (tier: PricingTier) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, credits: prev.credits + tier.credits } : null);
    setIsPricingOpen(false);
    alert(`${tier.name} 결제가 완료되었습니다.`);
  };

  const handleWatchAdTrigger = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const today = new Date().toDateString();
    if (currentUser.dailyAdCount >= 5 && currentUser.lastAdDate === today) {
      alert("오늘의 무료 광고 시청 한도를 초과했습니다.");
      return;
    }
    setIsPricingOpen(false);
    setIsAdPlaying(true);
  };

  const handleAdComplete = () => {
    setIsAdPlaying(false);
    const today = new Date().toDateString();
    setCurrentUser(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        credits: prev.credits + 2, 
        dailyAdCount: prev.dailyAdCount + 1,
        lastAdDate: today
      };
    });
    alert("보상이 지급되었습니다.");
  };

  const handleAdCancel = () => {
    if (confirm("광고 시청을 중단하면 보상이 지급되지 않습니다.")) {
      setIsAdPlaying(false);
    }
  };

  const handleGenerate = async (prompt: string, styleId: string, panelCount: number) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    if (currentUser.credits < panelCount) {
      setError("크레딧이 부족합니다.");
      setIsPricingOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const artStyle = ART_STYLES.find(s => s.id === styleId)?.name || '시네마틱';
      setCurrentUser(prev => prev ? { ...prev, credits: prev.credits - panelCount } : null);
      
      const initialPanels = await generateStoryboardScript(prompt, panelCount);
      
      const newProject: StoryboardProject = {
        id: `project-${Date.now()}`,
        title: "새 스토리보드 프로젝트",
        originalPrompt: prompt,
        style: artStyle,
        status: PanelStatus.GENERATING_IMAGES,
        panels: initialPanels.map(p => ({ ...p, isImageLoading: true })),
        userId: currentUser.email
      };
      
      setProject(newProject);
      setIsGenerating(false);

      initialPanels.forEach(async (panel) => {
        try {
          const imageUrl = await generatePanelImage(panel.visualPrompt, artStyle);
          updatePanel(panel.id, { imageUrl, isImageLoading: false });
        } catch (err) {
          updatePanel(panel.id, { isImageLoading: false });
        }
      });
    } catch (err: any) {
      setError(err.message || "생성 중 오류 발생");
      setIsGenerating(false);
    }
  };

  const updatePanel = useCallback((panelId: string, updates: Partial<StoryboardProject['panels'][0]>) => {
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        panels: prev.panels.map(p => p.id === panelId ? { ...p, ...updates } : p)
      };
    });
  }, []);

  const handleRegenerateImage = async (panelId: string) => {
    if (!currentUser || currentUser.credits < 1) return;
    const panel = project?.panels.find(p => p.id === panelId);
    if (!panel || !project) return;

    setCurrentUser(prev => prev ? { ...prev, credits: prev.credits - 1 } : null);
    updatePanel(panelId, { isImageLoading: true });
    
    try {
      const imageUrl = await generatePanelImage(panel.visualPrompt, project.style);
      updatePanel(panelId, { imageUrl, isImageLoading: false });
    } catch (err) {
      updatePanel(panelId, { isImageLoading: false });
    }
  };

  const handleReset = () => {
    setProject(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        credits={currentUser?.credits || 0} 
        user={currentUser}
        onLogin={() => setIsLoginOpen(true)} 
        onLogout={handleLogout}
        onOpenPricing={handleOpenPricing} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!project ? (
          <PromptForm 
            onSubmit={handleGenerate} 
            isLoading={isGenerating} 
            userCredits={currentUser?.credits || 0} 
          />
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <button onClick={handleReset} className="text-gray-400 hover:text-white flex items-center gap-2">
                ← 돌아가기
              </button>
              <h2 className="text-2xl font-bold">{project.style} 스토리보드</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 glass rounded-lg text-sm">저장</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.panels.map((panel) => (
                <StoryboardPanel 
                  key={panel.id} 
                  panel={panel} 
                  onRegenerateImage={handleRegenerateImage} 
                />
              ))}
            </div>
          </div>
        )}
        {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-center">{error}</div>}
      </main>

      <PricingModal 
        isOpen={isPricingOpen} onClose={handleClosePricing}
        onPurchase={handlePurchase} onWatchAd={handleWatchAdTrigger}
        dailyAdCount={currentUser?.dailyAdCount || 0}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <AdPlayer isOpen={isAdPlaying} onComplete={handleAdComplete} onCancel={handleAdCancel} />
    </div>
  );
};

export default App;
