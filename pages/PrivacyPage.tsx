import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          개인정보처리방침
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <p className="text-gray-300 text-lg leading-relaxed">
            Visionary Storyboard AI(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
            회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
            개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제1조 (개인정보의 수집 및 이용 목적)</h2>
            <p className="text-gray-300 mb-4">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지와 비인가 사용방지, 가입의사 확인, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달</li>
              <li>서비스 제공: AI 스토리보드 생성 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공, 본인인증</li>
              <li>마케팅 및 광고: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제2조 (수집하는 개인정보의 항목)</h2>
            <p className="text-gray-300 mb-4">회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">필수 수집 항목</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>서비스 이용 기록</li>
                  <li>접속 로그</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">자동 수집 항목</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>IP 주소</li>
                  <li>쿠키</li>
                  <li>방문 일시</li>
                  <li>서비스 이용 기록</li>
                  <li>기기 정보 (브라우저 종류, OS 등)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제3조 (개인정보의 보유 및 이용기간)</h2>
            <p className="text-gray-300 mb-4">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>회원 가입 정보: 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보존)</li>
              <li>서비스 이용 기록: 3년</li>
              <li>결제 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li>접속 로그: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-gray-300 mb-4">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제5조 (개인정보처리의 위탁)</h2>
            <p className="text-gray-300 mb-4">회사는 서비스 향상을 위해 아래와 같이 개인정보를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-gray-300 text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-4">수탁업체</th>
                    <th className="text-left py-2 px-4">위탁업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-4">Supabase</td>
                    <td className="py-2 px-4">회원 데이터 저장 및 인증 서비스</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-4">Google Cloud</td>
                    <td className="py-2 px-4">AI 이미지 생성 서비스</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-4">Vercel</td>
                    <td className="py-2 px-4">웹 서비스 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p className="text-gray-300 mb-4">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="text-gray-300 mt-4">
              위의 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제7조 (개인정보의 파기)</h2>
            <p className="text-gray-300 mb-4">회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제</li>
              <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제8조 (개인정보의 안전성 확보조치)</h2>
            <p className="text-gray-300 mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>관리적 조치: 내부관리계획 수립·시행, 직원 정기 교육</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제9조 (쿠키의 사용)</h2>
            <p className="text-gray-300 mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
            </p>
            <p className="text-gray-300 mb-4">
              쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에게 보내는 아주 작은 텍스트 파일로 이용자 컴퓨터의 하드디스크에 저장됩니다.
            </p>
            <p className="text-gray-300">
              이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.
            </p>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제10조 (개인정보 보호책임자)</h2>
            <p className="text-gray-300 mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-gray-300">개인정보 보호책임자</p>
              <p className="text-white font-semibold">Visionary Storyboard AI 운영팀</p>
              <p className="text-gray-400">이메일: privacy@visionary-ai.com</p>
            </div>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제11조 (개인정보처리방침의 변경)</h2>
            <p className="text-gray-300">
              이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다. 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <p className="text-gray-500 text-sm mt-8">
            시행일자: 2024년 1월 1일
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
