import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import PromptForm from './components/PromptForm.tsx';
import StoryboardPanel from './components/StoryboardPanel.tsx';
import PricingModal from './components/PricingModal.tsx';
import LoginModal from './components/LoginModal.tsx';
import AdPlayer from './components/AdPlayer.tsx';
import AdBanner from './components/AdBanner.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import { StoryboardProject, PanelStatus, ART_STYLES, PricingTier } from './types.ts';
import { generateStoryboardScript, generatePanelImage, generateStyleContext } from './services/geminiService.ts';
import { parsePaymentSuccess, parsePaymentFail } from './services/paymentService.ts';
import {
  UserProfile,
  getCurrentUser,
  getUserProfile,
  createProfile,
  signOut,
  onAuthStateChange,
  addCredits,
  deductCredits,
  updateAdWatch,
} from './services/supabaseService.ts';

const App: React.FC = () => {
  const [project, setProject] = useState<StoryboardProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const storyboardRef = useRef<HTMLDivElement>(null);

  // Supabase 사용자 프로필 상태 관리
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // 앱 초기화 시 현재 로그인된 사용자 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          let profile = await getUserProfile(user.id);

          // 프로필이 없으면 자동 생성
          if (!profile) {
            console.log('앱 초기화: 프로필 없음, 자동 생성 시도...');
            profile = await createProfile(user.id, user.email || '');
          }

          setCurrentUser(profile);
        }
      } catch (err) {
        console.error('인증 초기화 오류:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();

    // 인증 상태 변경 구독
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        let profile = await getUserProfile(user.id);

        // 프로필이 없으면 자동 생성
        if (!profile) {
          console.log('인증 상태 변경: 프로필 없음, 자동 생성 시도...');
          profile = await createProfile(user.id, user.email || '');
        }

        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 결제 성공/실패 처리
  useEffect(() => {
    const handlePaymentResult = async () => {
      const successResult = parsePaymentSuccess();
      const failResult = parsePaymentFail();

      if (successResult && currentUser) {
        // 결제 성공 처리
        const pendingPayment = localStorage.getItem('pending_payment');
        if (pendingPayment) {
          const { credits } = JSON.parse(pendingPayment);
          const newCredits = await addCredits(currentUser.id, credits);
          if (newCredits !== null) {
            setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);
            alert(`결제가 완료되었습니다! ${credits} 크레딧이 지급되었습니다.`);
          }
          localStorage.removeItem('pending_payment');
        }
        window.history.replaceState({}, '', window.location.pathname);
      } else if (failResult) {
        localStorage.removeItem('pending_payment');
        alert(`결제 실패: ${failResult.error}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    if (currentUser) {
      handlePaymentResult();
    }
  }, [currentUser]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setProject(null);
  };

  const handleOpenPricing = () => setIsPricingOpen(true);
  const handleClosePricing = () => setIsPricingOpen(false);

  const handlePurchase = async (tier: PricingTier) => {
    if (!currentUser) return;
    const newCredits = await addCredits(currentUser.id, tier.credits);
    if (newCredits !== null) {
      setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);
      setIsPricingOpen(false);
      alert(`${tier.name} 결제가 완료되었습니다.`);
    }
  };

  const handleWatchAdTrigger = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.daily_ad_count >= 5 && currentUser.last_ad_date === today) {
      alert("오늘의 무료 광고 시청 한도를 초과했습니다.");
      return;
    }
    setIsPricingOpen(false);
    setIsAdPlaying(true);
  };

  const handleAdComplete = async () => {
    setIsAdPlaying(false);
    if (!currentUser) return;

    const result = await updateAdWatch(currentUser.id);
    if (result) {
      setCurrentUser(prev => prev ? {
        ...prev,
        credits: result.credits,
        daily_ad_count: result.dailyAdCount,
        last_ad_date: new Date().toISOString().split('T')[0],
      } : null);
      alert("보상이 지급되었습니다.");
    }
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

      // 크레딧 차감 (Supabase)
      const newCredits = await deductCredits(currentUser.id, panelCount);
      if (newCredits === null) {
        throw new Error('크레딧 차감에 실패했습니다.');
      }
      setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);

      // 스타일 일관성을 위한 컨텍스트 생성
      const styleContext = await generateStyleContext(prompt, artStyle);

      const initialPanels = await generateStoryboardScript(prompt, panelCount);

      const newProject: StoryboardProject = {
        id: `project-${Date.now()}`,
        title: "새 스토리보드 프로젝트",
        originalPrompt: prompt,
        style: artStyle,
        styleContext,
        status: PanelStatus.GENERATING_IMAGES,
        panels: initialPanels.map(p => ({ ...p, isImageLoading: true })),
        userId: currentUser.id
      };

      setProject(newProject);
      setIsGenerating(false);

      // 모든 패널에 동일한 스타일 컨텍스트 적용
      initialPanels.forEach(async (panel) => {
        try {
          const imageUrl = await generatePanelImage(panel.visualPrompt, artStyle, styleContext);
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

    const newCredits = await deductCredits(currentUser.id, 1);
    if (newCredits === null) return;

    setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);
    updatePanel(panelId, { isImageLoading: true });

    try {
      const imageUrl = await generatePanelImage(panel.visualPrompt, project.style, project.styleContext);
      updatePanel(panelId, { imageUrl, isImageLoading: false });
    } catch (err) {
      updatePanel(panelId, { isImageLoading: false });
    }
  };

  const handleReset = () => {
    setProject(null);
    setError(null);
  };

  // PDF 내보내기 함수
  const handleExportPDF = async () => {
    if (!project || !storyboardRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = storyboardRef.current;
      
      // html2canvas로 전체 캡처
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // PDF 생성
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지 비율 계산
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      // 첫 페이지
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
      
      // 여러 페이지 처리
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
      }
      
      // PDF 다운로드
      pdf.save(`storyboard-${Date.now()}.pdf`);
      
    } catch (err) {
      console.error('PDF 내보내기 오류:', err);
      alert('PDF 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 로딩 중 표시
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  // UserProfile을 Header에 전달하기 위한 변환
  const userForHeader = currentUser ? {
    email: currentUser.email,
    credits: currentUser.credits,
    dailyAdCount: currentUser.daily_ad_count,
    lastAdDate: currentUser.last_ad_date,
  } : null;

  // 홈 페이지 콘텐츠
  const HomePage = () => (
    <>
      <Header
        credits={currentUser?.credits || 0}
        user={userForHeader}
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
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting || project.panels.some(p => p.isImageLoading)}
                  className={`px-4 py-2 glass rounded-lg text-sm flex items-center gap-2 ${
                    isExporting || project.panels.some(p => p.isImageLoading)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      내보내는 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF 다운로드
                    </>
                  )}
                </button>
              </div>
            </div>
            <div ref={storyboardRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* 광고 배너 */}
        <div className="mt-12 max-w-4xl mx-auto">
          <AdBanner className="w-full" />
        </div>
      </main>

      <Footer />

      <PricingModal
        isOpen={isPricingOpen} onClose={handleClosePricing}
        onPurchase={handlePurchase} onWatchAd={handleWatchAdTrigger}
        dailyAdCount={currentUser?.daily_ad_count || 0}
        userEmail={currentUser?.email}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <AdPlayer isOpen={isAdPlaying} onComplete={handleAdComplete} onCancel={handleAdCancel} />
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<><PrivacyPage /><Footer /></>} />
        <Route path="/terms" element={<><TermsPage /><Footer /></>} />
        <Route path="/about" element={<><AboutPage /><Footer /></>} />
        <Route path="/contact" element={<><ContactPage /><Footer /></>} />
      </Routes>
    </div>
  );
};

export default App;
