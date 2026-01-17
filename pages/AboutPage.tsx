import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Visionary Storyboard AI 소개
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* 히어로 섹션 */}
          <section className="glass p-8 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold mb-4 text-white">상상을 현실로, AI가 그리는 스토리보드</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Visionary Storyboard AI는 텍스트 설명만으로 전문적인 스토리보드 이미지를 생성하는
              혁신적인 AI 서비스입니다. 영화 제작자, 광고 기획자, 웹툰 작가, 게임 개발자 등
              모든 창작자를 위한 강력한 시각화 도구입니다.
            </p>
          </section>

          {/* 서비스 특징 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">주요 기능</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl font-bold mb-2 text-white">AI 기반 이미지 생성</h3>
                <p className="text-gray-300">
                  Google의 최신 Gemini AI 기술을 활용하여 텍스트 프롬프트만으로
                  고품질의 스토리보드 이미지를 생성합니다. 복잡한 장면 설명도
                  정확하게 시각화할 수 있습니다.
                </p>
              </div>

              <div className="glass p-6 rounded-2xl">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-xl font-bold mb-2 text-white">다양한 아트 스타일</h3>
                <p className="text-gray-300">
                  시네마틱, 애니메이션, 만화, 수채화, 픽셀아트 등 다양한 스타일 중에서
                  프로젝트에 맞는 스타일을 선택하세요. 일관된 비주얼 톤을 유지하며
                  스토리보드를 완성할 수 있습니다.
                </p>
              </div>

              <div className="glass p-6 rounded-2xl">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-xl font-bold mb-2 text-white">자동 스크립트 분석</h3>
                <p className="text-gray-300">
                  입력한 시나리오나 스토리 개요를 AI가 분석하여 자동으로
                  씬을 나누고 각 장면에 대한 시각적 프롬프트를 생성합니다.
                  복잡한 스토리도 체계적으로 시각화됩니다.
                </p>
              </div>

              <div className="glass p-6 rounded-2xl">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-bold mb-2 text-white">빠른 생성 속도</h3>
                <p className="text-gray-300">
                  최적화된 AI 파이프라인으로 몇 초 만에 스토리보드 이미지를 생성합니다.
                  빠른 피드백 루프로 다양한 아이디어를 즉시 시각화하고
                  비교해볼 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 사용 사례 */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">활용 분야</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎥</span>
                <div>
                  <h3 className="font-bold text-white">영화 및 영상 제작</h3>
                  <p className="text-gray-300">촬영 전 장면 구성을 미리 시각화하여 제작팀과 효과적으로 소통하고, 촬영 계획을 최적화하세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📺</span>
                <div>
                  <h3 className="font-bold text-white">광고 및 마케팅</h3>
                  <p className="text-gray-300">광고 콘셉트를 빠르게 시각화하여 클라이언트에게 프레젠테이션하고, 승인 프로세스를 가속화하세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className="font-bold text-white">웹툰 및 만화</h3>
                  <p className="text-gray-300">스토리 구성을 빠르게 스케치하고, 각 컷의 구도와 연출을 미리 확인하며 작업 효율을 높이세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-bold text-white">게임 개발</h3>
                  <p className="text-gray-300">게임 시네마틱, 컷씬, 튜토리얼 등의 스토리보드를 제작하여 개발팀과 비전을 공유하세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">✏️</span>
                <div>
                  <h3 className="font-bold text-white">교육 및 프레젠테이션</h3>
                  <p className="text-gray-300">교육 자료, 발표 슬라이드, 스토리텔링 콘텐츠에 시각적 요소를 추가하여 전달력을 높이세요.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 기술 스택 */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">기술 기반</h2>
            <p className="text-gray-300 mb-4">
              Visionary Storyboard AI는 최신 AI 기술과 클라우드 인프라를 기반으로 구축되었습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="font-bold text-white">Google Gemini</p>
                <p className="text-gray-400 text-sm">AI 이미지 생성</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="font-bold text-white">React</p>
                <p className="text-gray-400 text-sm">프론트엔드</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="font-bold text-white">Supabase</p>
                <p className="text-gray-400 text-sm">백엔드 및 인증</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="font-bold text-white">Vercel</p>
                <p className="text-gray-400 text-sm">글로벌 호스팅</p>
              </div>
            </div>
          </section>

          {/* 비전 */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">우리의 비전</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Visionary Storyboard AI는 모든 창작자가 자신의 아이디어를 쉽고 빠르게 시각화할 수 있는
              세상을 만들고자 합니다. 전문적인 그림 실력이 없어도, 막대한 예산이 없어도,
              누구나 자신의 스토리를 프로페셔널한 스토리보드로 표현할 수 있어야 한다고 믿습니다.
            </p>
            <p className="text-gray-300 leading-relaxed">
              AI 기술의 발전과 함께 우리는 계속해서 더 나은 도구를 제공하기 위해 노력하고 있습니다.
              사용자 피드백을 바탕으로 기능을 개선하고, 새로운 스타일과 옵션을 추가하며,
              창작 과정을 더욱 즐겁고 효율적으로 만들어 나가겠습니다.
            </p>
          </section>

          {/* 연락처 */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">문의하기</h2>
            <p className="text-gray-300 mb-4">
              서비스에 대한 질문, 제안, 협업 문의가 있으시면 언제든지 연락해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
              >
                <span>문의하기</span>
                <span>→</span>
              </Link>
              <a
                href="mailto:support@visionary-ai.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                <span>이메일 보내기</span>
              </a>
            </div>
          </section>

          {/* 회사 정보 */}
          <section className="border-t border-white/10 pt-8 mt-8">
            <h2 className="text-xl font-bold mb-4 text-white">서비스 정보</h2>
            <div className="text-gray-400 space-y-2">
              <p><strong className="text-gray-300">서비스명:</strong> Visionary Storyboard AI</p>
              <p><strong className="text-gray-300">이메일:</strong> support@visionary-ai.com</p>
              <p><strong className="text-gray-300">운영 시간:</strong> 24시간 (AI 서비스), 고객 지원 평일 09:00-18:00</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
