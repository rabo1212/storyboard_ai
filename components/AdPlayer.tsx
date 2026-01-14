
import React, { useState, useEffect, useRef } from 'react';

interface AdPlayerProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const AdPlayer: React.FC<AdPlayerProps> = ({ isOpen, onComplete, onCancel }) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [adErrorMessage, setAdErrorMessage] = useState<string | null>(null);
  
  const adContainerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      resetState();
      // IMA SDK 로드 확인 및 초기화
      if (window.google && window.google.ima) {
        initAds();
      } else {
        setAdErrorMessage("광고 SDK를 불러오지 못했습니다. 광고 차단 해제 후 시도해 주세요.");
        // SDK 로드 실패 시에도 보상은 가능하게 하려면 여기서 canClaim을 바로 true로 줄 수도 있음 (정책 선택)
      }
    }
    return () => destroyAds();
  }, [isOpen]);

  const resetState = () => {
    setTimeLeft(15);
    setCanClaim(false);
    setIsFinished(false);
    setIsAdLoaded(false);
    setAdErrorMessage(null);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const destroyAds = () => {
    if (adsManagerRef.current) {
      adsManagerRef.current.destroy();
      adsManagerRef.current = null;
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initAds = () => {
    try {
      const google = window.google;
      const adDisplayContainer = new google.ima.AdDisplayContainer(
        adContainerRef.current,
        videoElementRef.current
      );
      adDisplayContainer.initialize();

      const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      adsLoaderRef.current = adsLoader;

      adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (e: any) => onAdsManagerLoaded(e),
        false
      );
      adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (e: any) => onAdError(e),
        false
      );

      const adsRequest = new google.ima.AdsRequest();
      
      // [중요] 실제 서비스 시 아래 URL을 본인의 구글 에드센스/Ad Manager 태그로 교체해야 합니다.
      adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator=';

      adsRequest.linearAdSlotWidth = adContainerRef.current!.clientWidth;
      adsRequest.linearAdSlotHeight = adContainerRef.current!.clientHeight;
      
      adsLoader.requestAds(adsRequest);
    } catch (e) {
      console.error("IMA Init error", e);
      setAdErrorMessage("광고 초기화 중 오류가 발생했습니다.");
    }
  };

  const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
    const google = window.google;
    const adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    const adsManager = adsManagerLoadedEvent.getAdsManager(
      videoElementRef.current,
      adsRenderingSettings
    );
    adsManagerRef.current = adsManager;

    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, () => {
      setIsAdLoaded(true);
      startTimer();
    });
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
      setIsFinished(true);
      setCanClaim(true);
    });

    try {
      adsManager.init(
        adContainerRef.current?.clientWidth,
        adContainerRef.current?.clientHeight,
        google.ima.ViewMode.NORMAL
      );
      adsManager.start();
    } catch (adError) {
      onAdError(adError);
    }
  };

  const onAdError = (adErrorEvent: any) => {
    console.error('Ad Error:', adErrorEvent);
    setAdErrorMessage("광고를 표시할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    // 광고 오류 시에도 유저가 기다렸다면 보상을 줄지 결정 (보통 5~10초 대기 후 지급)
    setIsAdLoaded(true);
    startTimer(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl aspect-video bg-neutral-900 overflow-hidden md:rounded-3xl shadow-2xl border border-white/10 mx-4">
        
        {/* 광고 컨테이너 */}
        <div id="ad-container" ref={adContainerRef} className="w-full h-full">
          <video ref={videoElementRef} className="hidden"></video>
        </div>

        {/* 로딩 및 에러 상태 표시 */}
        {!isAdLoaded && !adErrorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-gray-400 animate-pulse">안전한 광고를 불러오는 중...</p>
          </div>
        )}

        {adErrorMessage && !isAdLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-8 text-center">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white font-bold mb-4">{adErrorMessage}</p>
            <button onClick={onCancel} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors">닫기</button>
          </div>
        )}

        {/* 상단 보상 정보 바 */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase text-white">REWARD AD</span>
              <span className="text-white/60 text-[10px] font-bold tracking-tighter uppercase">무료 크레딧 충전소</span>
            </div>
            {isAdLoaded && !canClaim && (
              <span className="text-xl font-black text-white ml-1">
                {timeLeft} <span className="text-sm font-normal opacity-60">seconds left</span>
              </span>
            )}
          </div>
          
          <div className="pointer-events-auto">
            {(isFinished || canClaim) ? (
              <button 
                onClick={onComplete}
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-black px-6 py-3 rounded-full shadow-lg shadow-green-500/40 transition-all transform hover:scale-110 active:scale-95 animate-bounce"
              >
                지금 2 크레딧 받기
              </button>
            ) : (
              <button 
                onClick={onCancel}
                className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
              >
                Close Ad
              </button>
            )}
          </div>
        </div>

        {/* 하단 프로그레스 바 */}
        {isAdLoaded && !canClaim && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1] transition-all duration-1000 ease-linear" 
              style={{ width: `${(15 - timeLeft) / 15 * 100}%` }}
            ></div>
          </div>
        )}
      </div>
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40">
        <p className="text-white text-[10px] uppercase tracking-[0.3em]">The reward is provided after 15 seconds of viewing.</p>
      </div>
    </div>
  );
};

export default AdPlayer;
