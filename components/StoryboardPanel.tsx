
import React from 'react';
import { StoryboardPanel as IStoryboardPanel } from '../types.ts';

interface PanelProps {
  panel: IStoryboardPanel;
  onRegenerateImage: (id: string) => void;
}

const StoryboardPanel: React.FC<PanelProps> = ({ panel, onRegenerateImage }) => {
  return (
    <div className="glass rounded-2xl overflow-hidden group">
      <div className="aspect-video relative bg-neutral-900 flex items-center justify-center overflow-hidden">
        {panel.isImageLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-semibold text-indigo-400 uppercase tracking-widest">프레임 렌더링 중</p>
          </div>
        ) : panel.imageUrl ? (
          <img src={panel.imageUrl} alt={panel.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="text-gray-600 text-sm italic">이미지 생성 대기 중...</div>
        )}
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-white border border-white/10">
          장면 #{panel.sceneNumber}
        </div>

        {!panel.isImageLoading && (
          <button 
            onClick={() => onRegenerateImage(panel.id)}
            className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
            title="이미지 다시 생성"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{panel.shotType}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{panel.description}</p>
        </div>

        {panel.dialogue && (
          <div className="pl-4 border-l-2 border-indigo-500/30 py-1">
            <p className="text-gray-400 text-xs italic">
              <span className="text-indigo-400/80 font-bold not-italic text-[10px] uppercase mr-2">대사:</span>
              "{panel.dialogue}"
            </p>
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-white/5">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter truncate opacity-60">
            비주얼 프롬프트: {panel.visualPrompt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPanel;
