
import React from 'react';
import { PRICING_TIERS, PricingTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (tier: PricingTier) => void;
  onWatchAd: () => void;
  dailyAdCount: number;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onPurchase, onWatchAd, dailyAdCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative glass w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">크레딧 충전</h2>
            <p className="text-gray-400">필요한 만큼 충전하고 창작을 이어가세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRICING_TIERS.map((tier) => {
            const isAdTier = tier.id === 'free';
            const isLimitReached = isAdTier && dailyAdCount >= 5;

            return (
              <div 
                key={tier.id}
                className={`relative flex flex-col p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                  tier.isPopular ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-xs text-gray-400 mb-4 h-8">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-2xl font-bold text-indigo-400">{tier.credits}</span>
                  <span className="text-gray-500 text-sm ml-1">크레딧</span>
                </div>
                <div className="mt-auto">
                  <div className="text-lg font-bold mb-4">{tier.price}</div>
                  {isAdTier ? (
                    <div className="space-y-2">
                      <button 
                        disabled={isLimitReached}
                        onClick={onWatchAd}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                          isLimitReached 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                          : 'bg-white text-black hover:bg-indigo-50'
                        }`}
                      >
                        {isLimitReached ? '오늘 제한 도달' : '광고 시청하기'}
                      </button>
                      <p className="text-[10px] text-center text-gray-500 font-medium">
                        오늘의 시청: {dailyAdCount} / 5회
                      </p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onPurchase(tier)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        tier.isPopular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      구매하기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
          <p className="text-sm text-gray-400">
            * 1크레딧은 스토리보드 1컷 생성에 사용됩니다. 광고 보상은 하루 최대 5회까지만 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
