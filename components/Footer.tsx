import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 border-t border-white/5 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Visionary Storyboard AI
              </h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI 기술로 당신의 상상을 스토리보드로 구현합니다.
              영화, 광고, 웹툰, 게임 등 모든 창작 프로젝트에 활용하세요.
            </p>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="text-white font-bold mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  스토리보드 생성
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  서비스 소개
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 링크 */}
          <div>
            <h4 className="text-white font-bold mb-4">고객지원</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  문의하기
                </Link>
              </li>
              <li>
                <a href="mailto:support@visionary-ai.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  이메일 문의
                </a>
              </li>
            </ul>
          </div>

          {/* 법적 링크 */}
          <div>
            <h4 className="text-white font-bold mb-4">약관 및 정책</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-white/5 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Visionary Storyboard AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                이용약관
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                개인정보처리방침
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
