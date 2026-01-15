
// 토스페이먼츠 결제 서비스
// 테스트 클라이언트 키 (실서비스 시 환경변수로 교체)
const TOSS_CLIENT_KEY = process.env.TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

declare global {
  interface Window {
    TossPayments: any;
  }
}

export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentKey?: string;
  amount?: number;
  error?: string;
}

// 주문 ID 생성
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${randomStr}`.toUpperCase();
};

// 토스페이먼츠 결제 요청
export const requestPayment = async (request: PaymentRequest): Promise<void> => {
  if (!window.TossPayments) {
    throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.');
  }

  const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);

  // 결제창 열기
  await tossPayments.requestPayment('카드', {
    amount: request.amount,
    orderId: request.orderId,
    orderName: request.orderName,
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};

// 간편결제 요청 (카카오페이, 네이버페이 등)
export const requestEasyPayment = async (
  request: PaymentRequest,
  easyPay: 'KAKAOPAY' | 'NAVERPAY' | 'TOSSPAY'
): Promise<void> => {
  if (!window.TossPayments) {
    throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.');
  }

  const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);

  await tossPayments.requestPayment('카드', {
    amount: request.amount,
    orderId: request.orderId,
    orderName: request.orderName,
    customerName: request.customerName,
    customerEmail: request.customerEmail,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
    flowMode: 'DIRECT',
    easyPay: easyPay,
  });
};

// 결제 금액 계산 (크레딧 티어별)
export const PAYMENT_AMOUNTS: Record<string, number> = {
  'basic': 4900,
  'basic2': 9900,
  'pro': 15900,
  'vip': 19900,
};

// 결제 성공 처리 (URL 파라미터에서 결과 파싱)
export const parsePaymentSuccess = (): PaymentResult | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentKey = urlParams.get('paymentKey');
  const orderId = urlParams.get('orderId');
  const amount = urlParams.get('amount');

  if (paymentKey && orderId && amount) {
    return {
      success: true,
      paymentKey,
      orderId,
      amount: parseInt(amount, 10),
    };
  }
  return null;
};

// 결제 실패 처리
export const parsePaymentFail = (): PaymentResult | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const message = urlParams.get('message');
  const orderId = urlParams.get('orderId');

  if (code || message) {
    return {
      success: false,
      orderId: orderId || undefined,
      error: message || code || '결제에 실패했습니다.',
    };
  }
  return null;
};
