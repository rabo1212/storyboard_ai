
import React, { useState } from 'react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  // 저장된 사용자가 없으면 기본적으로 회원가입 모드로 시작
  const [isSignUp, setIsSignUp] = useState(() => {
    const usersStr = localStorage.getItem('visionary_users') || '[]';
    const users = JSON.parse(usersStr);
    return users.length === 0;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const existingUsers = JSON.parse(localStorage.getItem('visionary_users') || '[]');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usersStr = localStorage.getItem('visionary_users') || '[]';
    const users: User[] = JSON.parse(usersStr);

    if (isSignUp) {
      if (users.some(u => u.email === email)) {
        setError('이미 존재하는 이메일입니다.');
        return;
      }
      const newUser: User = {
        email,
        password,
        credits: 5, // 첫 로그인 시 5크레딧 증정
        hasReceivedWelcomeBonus: true,
        dailyAdCount: 0,
        lastAdDate: new Date().toDateString()
      };
      users.push(newUser);
      localStorage.setItem('visionary_users', JSON.stringify(users));
      onLoginSuccess(newUser);
      alert('회원가입을 축하합니다! 5 크레딧이 지급되었습니다.');
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative glass w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{isSignUp ? '회원가입' : '로그인'}</h2>
          <p className="text-gray-400 text-sm">비저너리 AI의 창작 커뮤니티에 참여하세요.</p>
        </div>

        {/* 저장된 계정이 없을 때 안내 */}
        {existingUsers.length === 0 && !isSignUp && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs text-center">
            저장된 계정이 없습니다. 먼저 회원가입을 진행해주세요.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">이메일 주소</label>
            <input 
              required
              type="email"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">비밀번호</label>
            <input 
              required
              type="password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            {isSignUp ? '가입하고 5크레딧 받기' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 지금 가입하세요'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
