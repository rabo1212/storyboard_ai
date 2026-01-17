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
import { generateStoryboardScript, generatePanelImage, generateStyleContext } from './services/openaiService.ts';
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

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          let profile = await getUserProfile(user.id);
          if (!profile) {
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

    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        let profile = await getUserProfile(user.id);
        if (!profile) {
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

  useEffect(() => {
    const handlePaymentResult = async () => {
      const successResult = parsePaymentSuccess();
      const failResult = parsePaymentFail();

      if (successResult && currentUser) {
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

  const handleGenerate = async (prompt: string, styleId: string, panelCount: number, title: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    
    const isAdmin = currentUser.email === '311015330@naver.com';
    
    if (!isAdmin && currentUser.credits < panelCount) {
      setError("크레딧이 부족합니다.");
      setIsPricingOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const artStyle = ART_STYLES.find(s => s.id === styleId)?.name || '시네마틱';

      if (!isAdmin) {
        const newCredits = await deductCredits(currentUser.id, panelCount);
        if (newCredits === null) {
          throw new Error('크레딧 차감에 실패했습니다.');
        }
        setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);
      }

      const styleContext = await generateStyleContext(prompt, artStyle);
      const initialPanels = await generateStoryboardScript(prompt, panelCount);

      const newProject: StoryboardProject = {
        id: `project-${Date.now()}`,
        title: title || "새 스토리보드 프로젝트",
        originalPrompt: prompt,
        style: artStyle,
        styleContext,
        status: PanelStatus.GENERATING_IMAGES,
        panels: initialPanels.map(p => ({ ...p, isImageLoading: true })),
        userId: currentUser.id
      };

      setProject(newProject);
      setIsGenerating(false);

      // 🚀 병렬 이미지 생성 (모든 패널 동시에!)
      const imagePromises = initialPanels.map(async (panel) => {
        try {
          const imageUrl = await generatePanelImage(
            panel.visualPrompt, 
            artStyle, 
            styleContext,
            panel.shotType
          );
          return { panelId: panel.id, imageUrl, success: true };
        } catch (err: any) {
          console.error('이미지 생성 오류:', err);
          return { panelId: panel.id, imageUrl: null, success: false };
        }
      });

      // 모든 이미지 생성 완료 대기
      const results = await Promise.all(imagePromises);

      // 결과 업데이트
      results.forEach(result => {
        if (result.success && result.imageUrl) {
          updatePanel(result.panelId, { imageUrl: result.imageUrl, isImageLoading: false });
        } else {
          updatePanel(result.panelId, { isImageLoading: false });
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

  const handleRegenerateImage = async (panelId: string, newPrompt?: string) => {
    if (!currentUser) return;
    
    const isAdmin = currentUser.email === '311015330@naver.com';
    
    if (!isAdmin && currentUser.credits < 1) return;
    
    const panel = project?.panels.find(p => p.id === panelId);
    if (!panel || !project) return;

    if (!isAdmin) {
      const newCredits = await deductCredits(currentUser.id, 1);
      if (newCredits === null) return;
      setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);
    }
    
    // 프롬프트가 수정된 경우 업데이트
    const promptToUse = newPrompt || panel.visualPrompt;
    if (newPrompt) {
      updatePanel(panelId, { visualPrompt: newPrompt, isImageLoading: true });
    } else {
      updatePanel(panelId, { isImageLoading: true });
    }

    try {
      const imageUrl = await generatePanelImage(
        promptToUse, 
        project.style, 
        project.styleContext,
        panel.shotType
      );
      updatePanel(panelId, { imageUrl, isImageLoading: false });
    } catch (err) {
      updatePanel(panelId, { isImageLoading: false });
    }
  };

  const handleReset = () => {
    setProject(null);
    setError(null);
  };

  // PDF 내보내기 - html2canvas 방식 (한글 지원, 비율 유지)
  const handleExportPDF = async () => {
    if (!project || !storyboardRef.current) return;
    
    // 모든 이미지가 로딩 완료되었는지 확인
    const hasLoadingImages = project.panels.some(p => p.isImageLoading);
    if (hasLoadingImages) {
      alert('이미지 생성이 완료될 때까지 기다려주세요.');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const element = storyboardRef.current;
      
      // 이미지 로딩 완료 대기 함수
      const waitForImages = async (container: HTMLElement) => {
        const images = container.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            // 타임아웃 5초
            setTimeout(() => resolve(), 5000);
          });
        });
        await Promise.all(promises);
      };
      
      // 이미지 로딩 대기
      await waitForImages(element);
      
      // 잠시 대기 (렌더링 안정화)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // html2canvas로 전체 캡처 (화면 그대로 캡처 - 한글 OK)
      const canvas = await html2canvas(element, {
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a',
        logging: false,
        imageTimeout: 15000,
        onclone: async (clonedDoc) => {
          // 클론된 문서의 이미지도 로딩 대기
          const clonedImages = clonedDoc.querySelectorAll('img');
          await Promise.all(
            Array.from(clonedImages).map(img => {
              if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
              return new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(() => resolve(), 5000);
              });
            })
          );
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // PDF 생성 (A4 가로 - 스토리보드에 적합)
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' = landscape (가로)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지 비율 유지하면서 페이지에 맞추기
      const canvasRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;
      
      let imgWidth, imgHeight, offsetX, offsetY;
      
      if (canvasRatio > pageRatio) {
        // 캔버스가 더 넓음 - 너비에 맞춤
        imgWidth = pageWidth - 20;
        imgHeight = imgWidth / canvasRatio;
        offsetX = 10;
        offsetY = (pageHeight - imgHeight) / 2;
      } else {
        // 캔버스가 더 높음 - 높이에 맞춤
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * canvasRatio;
        offsetX = (pageWidth - imgWidth) / 2;
        offsetY = 10;
      }
      
      // 이미지가 페이지보다 큰 경우 여러 페이지로 분할
      const totalPages = Math.ceil(canvas.height / (canvas.width * (pageHeight / pageWidth)));
      
      if (totalPages <= 1) {
        // 한 페이지에 들어가는 경우
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
      } else {
        // 여러 페이지로 분할
        const sourceHeight = canvas.width * (pageHeight / pageWidth) * (canvas.height / imgHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          
          // 페이지별로 캔버스의 일부분만 그리기
          const sourceY = page * (canvas.height / totalPages);
          
          pdf.addImage(
            imgData, 
            'PNG', 
            10, 
            10, 
            pageWidth - 20, 
            pageHeight - 20
          );
        }
      }
      
      // PDF 다운로드
      const fileName = `${project.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '')}-${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (err) {
      console.error('PDF 내보내기 오류:', err);
      alert('PDF 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

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

  const userForHeader = currentUser ? {
    email: currentUser.email,
    credits: currentUser.credits,
    dailyAdCount: currentUser.daily_ad_count,
    lastAdDate: currentUser.last_ad_date,
  } : null;

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
              <div className="text-center">
                <h2 className="text-2xl font-bold">{project.title}</h2>
                <p className="text-sm text-gray-500">{project.style} 스타일 • DALL-E 3 (병렬 생성)</p>
              </div>
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
            
            {/* PDF로 캡처될 영역 */}
            <div ref={storyboardRef} className="space-y-6 bg-[#0a0a0a] p-6 rounded-2xl">
              {/* 헤더 - 로고 & 제목 */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h1 className="text-xl font-bold">Visionary <span className="text-indigo-400">AI</span></h1>
                    <p className="text-xs text-gray-500">Storyboard Generator</p>
                  </div>
                </button>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-white">{project.title}</h2>
                  <p className="text-xs text-gray-500">{project.style} • {new Date().toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
              
              {/* 스토리보드 패널 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.panels.map((panel) => (
                  <StoryboardPanel
                    key={panel.id}
                    panel={panel}
                    onRegenerateImage={handleRegenerateImage}
                  />
                ))}
              </div>
              
              {/* 푸터 */}
              <div className="text-center text-xs text-gray-600 pt-4 border-t border-white/10">
                Generated by Visionary Storyboard AI • © Studio RNU
              </div>
            </div>
          </div>
        )}
        {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-center">{error}</div>}

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
