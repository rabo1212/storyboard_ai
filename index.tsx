import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

const renderError = (message: string, subMessage?: string) => {
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0a0a0a; color: #ff4444; font-family: sans-serif; padding: 40px; text-align: center;">
        <div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.2); padding: 30px; border-radius: 24px; max-width: 500px;">
          <svg style="width: 48px; height: 48px; margin: 0 auto 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 style="font-size: 20px; margin-bottom: 12px; font-weight: bold; color: white;">애플리케이션 오류</h2>
          <p style="color: #bbb; font-size: 14px; line-height: 1.6;">${message}</p>
          ${subMessage ? `<p style="margin-top: 15px; font-size: 12px; color: #666; background: #111; padding: 10px; border-radius: 8px;">${subMessage}</p>` : ''}
          <button onclick="location.reload()" style="margin-top: 25px; padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s;">다시 시도</button>
        </div>
      </div>
    `;
  }
};

// API 키 체크 함수 - 빌드 타임에 주입된 값 확인
const checkApiKey = (): boolean => {
  const apiKey = process.env.API_KEY;

  // 디버깅용 로그 (프로덕션에서는 제거 가능)
  console.log('[API Key Check] Key exists:', !!apiKey);
  console.log('[API Key Check] Key length:', apiKey ? apiKey.length : 0);

  // API 키가 없거나 빈 문자열이거나 'undefined' 문자열인 경우 false
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    console.error('[API Key Check] Invalid API key detected');
    return false;
  }

  return true;
};

if (!rootElement) {
  console.error("Could not find root element to mount to");
} else {
  // 앱 시작 전 API 키 체크
  if (!checkApiKey()) {
    renderError(
      "API 키가 설정되지 않았습니다.",
      "Vercel Dashboard → Settings → Environment Variables에서 'GEMINI_API_KEY'를 추가한 후 Redeploy 해주세요."
    );
  } else {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (error) {
      console.error("Critical rendering error:", error);
      renderError(
        "애플리케이션을 초기화하는 중 오류가 발생했습니다.",
        error instanceof Error ? error.message : "알 수 없는 런타임 오류"
      );
    }
  }
}
