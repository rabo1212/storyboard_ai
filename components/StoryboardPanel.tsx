
import React, { useState } from 'react';
import { StoryboardPanel as IStoryboardPanel } from '../types.ts';

interface PanelProps {
  panel: IStoryboardPanel;
  onRegenerateImage: (id: string, newPrompt?: string) => void;
}

const StoryboardPanel: React.FC<PanelProps> = ({ panel, onRegenerateImage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(panel.visualPrompt);

  const handleSaveAndRegenerate = () => {
    setIsEditing(false);
    onRegenerateImage(panel.id, editedPrompt);
  };

  const handleCancel = () => {
    setEditedPrompt(panel.visualPrompt);
    setIsEditing(false);
  };

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

        {/* 프롬프트 편집 영역 */}
        <div className="pt-4 mt-auto border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">비주얼 프롬프트</span>
            {!isEditing && !panel.isImageLoading && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                편집
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                rows={3}
                placeholder="이미지 생성 프롬프트를 수정하세요..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAndRegenerate}
                  disabled={panel.isImageLoading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  저장 & 재생성
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500 opacity-60 leading-relaxed">
              {panel.visualPrompt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryboardPanel;
