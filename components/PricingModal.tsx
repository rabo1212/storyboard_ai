
import React, { useState } from 'react';
import { PRICING_TIERS, PricingTier } from '../types';
import { requestPayment, generateOrderId, PAYMENT_AMOUNTS } from '../services/paymentService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (tier: PricingTier) => void;
  onWatchAd: () => void;
  dailyAdCount: number;
  userEmail?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  onWatchAd,
  dailyAdCount,
  userEmail
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async (tier: PricingTier) => {
    if (tier.id === 'free') {
      onWatchAd();
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const amount = PAYMENT_AMOUNTS[tier.id];
      if (!amount) {
        throw new Error('잘못된 상품입니다.');
      }

      // 결제 정보를 로컬스토리지에 저장 (결제 완료 후 크레딧 지급용)
      const orderId = generateOrderId();
      localStorage.setItem('pending_payment', JSON.stringify({
        orderId,
        tierId: tier.id,
        credits: tier.credits,
        amount,
      }));

      // 토스페이먼츠 결제창 호출
      await requestPayment({
        orderId,
        orderName: `${tier.name} - ${tier.credits} 크레딧`,
        amount,
        customerName: userEmail?.split('@')[0] || '고객',
        customerEmail: userEmail || 'guest@visionary.ai',
      });

    } catch (error: any) {
      // 사용자가 결제창을 닫은 경우
      if (error.code === 'USER_CANCEL') {
        setPaymentError(null);
      } else {
        setPaymentError(error.message || '결제 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

        {/* 결제 오류 메시지 */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {paymentError}
          </div>
        )}

        {/* 테스트 모드 안내 */}
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>현재 테스트 모드입니다. 실제 결제가 이루어지지 않습니다.</span>
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
                      onClick={() => handlePayment(tier)}
                      disabled={isProcessing}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        isProcessing
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : tier.isPopular
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {isProcessing ? '처리 중...' : '구매하기'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 결제 수단 안내 */}
        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-center gap-6 mb-4">
            <img src="https://static.toss.im/icons/png/4x/icon-toss-logo.png" alt="Toss" className="h-6 opacity-60" />
            <span className="text-gray-500">|</span>
            <span className="text-xs text-gray-400">신용카드 · 체크카드 · 간편결제</span>
          </div>
          <p className="text-sm text-gray-400 text-center">
            * 1크레딧은 스토리보드 1컷 생성에 사용됩니다. 광고 보상은 하루 최대 5회까지만 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
