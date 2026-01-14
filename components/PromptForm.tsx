
import React, { useState } from 'react';
import { ART_STYLES } from '../types';

interface PromptFormProps {
  onSubmit: (prompt: string, style: string, panelCount: number) => void;
  isLoading: boolean;
  userCredits: number;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading, userCredits }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(ART_STYLES[0].id);
  const [panels, setPanels] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, style, panels);
  };

  const isCreditInsufficient = userCredits < panels;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12 overflow-hidden">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-6 whitespace-nowrap tracking-tight">
          상상하는 이야기를 <span className="gradient-text">현실로 만드세요</span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          장면 설명이나 전체 스크립트를 입력해 주세요. AI가 전문적인 스토리보드 패널로 구성해 드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-8 shadow-2xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider ml-1">
            시나리오 / 스크립트
          </label>
          <textarea
            required
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder-gray-600"
            placeholder="예: 네오 도쿄의 마천루 위에서 비를 맞으며 네온사인을 바라보는 사이보그 사무라이..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider ml-1">
              비주얼 아트 스타일
            </label>
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {ART_STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider ml-1">
                생성할 패널 수 (최대 20)
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCreditInsufficient ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {panels} 크레딧 소모
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                className="flex-1 accent-indigo-500"
                value={panels}
                onChange={(e) => setPanels(parseInt(e.target.value))}
              />
              <span className="text-2xl font-bold text-indigo-400 w-12 text-center">{panels}</span>
            </div>
          </div>
        </div>

        <button
          disabled={isLoading || isCreditInsufficient}
          type="submit"
          className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex flex-col items-center justify-center gap-1 ${
            isLoading || isCreditInsufficient
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-indigo-50 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <span>이야기 분석 중...</span>
          ) : isCreditInsufficient ? (
            <span>크레딧이 부족합니다</span>
          ) : (
            <>
              <span>스토리보드 생성하기</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">잔여: {userCredits}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PromptForm;
