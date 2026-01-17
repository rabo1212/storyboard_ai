import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 구현에서는 이메일 전송 API를 호출
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center glass p-12 rounded-3xl max-w-md mx-4">
          <div className="text-6xl mb-6">✉️</div>
          <h2 className="text-2xl font-bold mb-4">문의가 접수되었습니다</h2>
          <p className="text-gray-300 mb-8">
            빠른 시일 내에 입력하신 이메일로 답변 드리겠습니다.
            보통 1-2 영업일 이내에 회신해 드립니다.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          문의하기
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 문의 폼 */}
          <div className="glass p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">메시지 보내기</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  문의 유형
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                >
                  <option value="">선택해주세요</option>
                  <option value="general">일반 문의</option>
                  <option value="technical">기술 지원</option>
                  <option value="billing">결제 문의</option>
                  <option value="partnership">제휴 문의</option>
                  <option value="feedback">서비스 피드백</option>
                  <option value="bug">버그 신고</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-400 uppercase mb-2">
                  문의 내용
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white resize-none"
                  placeholder="문의하실 내용을 자세히 적어주세요..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  isSubmitting
                    ? 'bg-gray-700 text-gray-400 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isSubmitting ? '전송 중...' : '문의 보내기'}
              </button>
            </form>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">연락처 정보</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="font-bold text-white">이메일</h3>
                    <a href="mailto:support@visionary-ai.com" className="text-indigo-400 hover:text-indigo-300">
                      support@visionary-ai.com
                    </a>
                    <p className="text-gray-400 text-sm mt-1">일반 문의 및 기술 지원</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">💼</span>
                  <div>
                    <h3 className="font-bold text-white">비즈니스 문의</h3>
                    <a href="mailto:business@visionary-ai.com" className="text-indigo-400 hover:text-indigo-300">
                      business@visionary-ai.com
                    </a>
                    <p className="text-gray-400 text-sm mt-1">제휴 및 협업 문의</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">운영 시간</h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>AI 서비스</span>
                  <span className="text-green-400">24시간 운영</span>
                </div>
                <div className="flex justify-between">
                  <span>고객 지원</span>
                  <span>평일 09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>주말/공휴일</span>
                  <span className="text-gray-500">휴무</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                * 문의는 24시간 접수 가능하며, 영업일 기준 1-2일 내에 답변드립니다.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">자주 묻는 질문</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">크레딧은 어떻게 충전하나요?</h3>
                  <p className="text-gray-400 text-sm">
                    로그인 후 상단 메뉴의 '충전' 버튼을 클릭하여 원하는 크레딧 패키지를 구매하실 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">생성된 이미지의 저작권은 누구에게 있나요?</h3>
                  <p className="text-gray-400 text-sm">
                    서비스를 통해 생성된 이미지의 저작권은 생성한 회원에게 귀속됩니다. 상업적 사용이 가능합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">환불 정책이 어떻게 되나요?</h3>
                  <p className="text-gray-400 text-sm">
                    미사용 크레딧에 대한 환불은 구매 후 7일 이내에 요청하실 수 있습니다. 자세한 내용은 이용약관을 참조해주세요.
                  </p>
                </div>
              </div>
              <Link
                to="/terms"
                className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                이용약관 보기 →
              </Link>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">빠른 링크</h2>
              <div className="space-y-2">
                <Link to="/about" className="block text-indigo-400 hover:text-indigo-300">
                  → 서비스 소개
                </Link>
                <Link to="/terms" className="block text-indigo-400 hover:text-indigo-300">
                  → 이용약관
                </Link>
                <Link to="/privacy" className="block text-indigo-400 hover:text-indigo-300">
                  → 개인정보처리방침
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
