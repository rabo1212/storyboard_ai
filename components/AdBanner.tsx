
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot?: string; // AdSense 광고 슬롯 ID
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

// Google AdSense 광고 배너 컴포넌트
// 실제 사용 시 data-ad-client와 data-ad-slot을 본인의 AdSense 정보로 교체
const AdBanner: React.FC<AdBannerProps> = ({
  slot = 'XXXXXXXXXX', // 테스트용 슬롯 ID
  format = 'auto',
  style,
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdSenseLoaded = useRef(false);

  useEffect(() => {
    // AdSense 스크립트가 로드되었는지 확인
    if (typeof window !== 'undefined' && (window as any).adsbygoogle && !isAdSenseLoaded.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isAdSenseLoaded.current = true;
      } catch (e) {
        console.error('AdSense 로드 오류:', e);
      }
    }
  }, []);

  // 테스트 모드: AdSense 승인 전까지 플레이스홀더 표시
  const isTestMode = slot === 'XXXXXXXXXX';

  if (isTestMode) {
    return (
      <div
        className={`bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl flex items-center justify-center ${className}`}
        style={{ minHeight: '90px', ...style }}
      >
        <div className="text-center p-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Advertisement</p>
          <p className="text-gray-600 text-[10px]">광고 영역 (AdSense 승인 후 표시)</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 본인의 AdSense Publisher ID로 교체
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
