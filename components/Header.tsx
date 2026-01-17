import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types.ts';

interface HeaderProps {
  credits: number;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenPricing: () => void;
}

const Header: React.FC<HeaderProps> = ({ credits, user, onLogin, onLogout, onOpenPricing }) => {
  return (
    <header className="py-6 px-8 border-b border-white/10 glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Visionary <span className="text-indigo-400">AI</span></h1>
            <p className="text-xs text-gray-500 font-medium">스토리보드 생성기</p>
          </div>
        </Link>
        
        <nav className="flex items-center gap-4 md:gap-8">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={onOpenPricing}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full border border-white/10 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-black">C</span>
                </div>
                <span className="text-sm font-bold text-gray-200">{credits.toLocaleString()}</span>
                <div className="w-px h-3 bg-white/20 mx-1"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">충전</span>
              </button>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-300">{user.email.split('@')[0]}</span>
                <button onClick={onLogout} className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase transition-colors">로그아웃</button>
              </div>
              <div className="hidden md:block w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt="avatar" />
              </div>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              로그인 / 가입
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
