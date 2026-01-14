import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 로컬 .env 파일에서 환경변수 로드
    const env = loadEnv(mode, process.cwd(), '');

    // Vercel 배포 시: process.env에서 직접 읽기
    // 로컬 개발 시: loadEnv로 .env.local에서 읽기
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 브라우저에서 접근 가능하도록 전역 변수로 정의
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
