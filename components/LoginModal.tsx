
import React, { useState } from 'react';
import { signUp, signIn, UserProfile } from '../services/supabaseService.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 회원가입
        const { user, profile, error: signUpError } = await signUp(email, password);

        if (signUpError) {
          if (signUpError.includes('already registered')) {
            setError('이미 가입된 이메일입니다.');
          } else if (signUpError.includes('email')) {
            setError('유효한 이메일 주소를 입력해주세요.');
          } else {
            setError(signUpError);
          }
          return;
        }

        if (user && profile) {
          onLoginSuccess(profile);
          alert('회원가입을 축하합니다! 5 크레딧이 지급되었습니다.');
        } else if (user && !profile) {
          // 이메일 확인이 필요하거나 프로필 생성 실패
          setError('회원가입은 완료되었으나 프로필 생성에 실패했습니다. 다시 로그인해주세요.');
        }
      } else {
        // 로그인
        const { user, profile, error: signInError } = await signIn(email, password);

        if (signInError) {
          if (signInError.includes('Invalid login credentials')) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          } else if (signInError.includes('Email not confirmed')) {
            setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
          } else {
            setError(signInError);
          }
          return;
        }

        if (user && profile) {
          onLoginSuccess(profile);
        } else if (user && !profile) {
          setError('프로필을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } catch (err: any) {
      console.error('인증 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">비밀번호</label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1 ml-1">비밀번호는 6자 이상이어야 합니다.</p>
            )}
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] ${
              isLoading
                ? 'bg-gray-700 text-gray-400 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {isLoading ? '처리 중...' : isSignUp ? '가입하고 5크레딧 받기' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            disabled={isLoading}
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
