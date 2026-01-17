import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-8 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          이용약관
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <p className="text-gray-300 text-lg leading-relaxed">
            본 약관은 Visionary Storyboard AI(이하 "회사")가 제공하는 AI 스토리보드 생성 서비스(이하 "서비스")의 이용과 관련하여
            회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제1조 (목적)</h2>
            <p className="text-gray-300">
              본 약관은 Visionary Storyboard AI가 제공하는 AI 기반 스토리보드 이미지 생성 서비스 및 관련 제반 서비스의 이용과 관련하여,
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제2조 (정의)</h2>
            <p className="text-gray-300 mb-4">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li><strong className="text-white">"서비스"</strong>란 회사가 제공하는 AI 스토리보드 이미지 생성 서비스 및 이에 부수되는 제반 서비스를 말합니다.</li>
              <li><strong className="text-white">"회원"</strong>이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</li>
              <li><strong className="text-white">"아이디(ID)"</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인한 이메일 주소를 말합니다.</li>
              <li><strong className="text-white">"비밀번호"</strong>란 회원의 동일성 확인과 회원정보의 보호를 위하여 회원이 설정한 문자와 숫자의 조합을 말합니다.</li>
              <li><strong className="text-white">"크레딧"</strong>이란 서비스 내에서 AI 이미지 생성에 사용되는 가상의 재화를 말합니다.</li>
              <li><strong className="text-white">"콘텐츠"</strong>란 회원이 서비스를 이용하여 생성한 스토리보드 이미지 및 관련 텍스트를 말합니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.</li>
              <li>본 약관의 내용은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 회사는 변경 약관을 적용하고자 하는 날로부터 7일 전에 공지합니다. 다만, 회원에게 불리한 약관 변경의 경우에는 30일 전에 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제4조 (이용계약의 체결)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>이용계약은 회원이 되고자 하는 자가 본 약관에 동의하고 회원가입 신청을 한 후 회사가 이를 승낙함으로써 체결됩니다.</li>
              <li>회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나, 사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 요청하는 정보를 제공하지 않은 경우</li>
                  <li>만 14세 미만인 경우</li>
                  <li>이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>기타 회사가 정한 이용신청 요건을 충족하지 못한 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제5조 (서비스의 내용)</h2>
            <p className="text-gray-300 mb-4">회사가 제공하는 서비스의 내용은 다음과 같습니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>AI 기반 스토리보드 이미지 생성 서비스</li>
              <li>텍스트 프롬프트를 기반으로 한 시각적 스토리보드 제작</li>
              <li>다양한 아트 스타일 선택 기능</li>
              <li>생성된 이미지 다운로드 및 저장 기능</li>
              <li>크레딧 충전 및 관리 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제6조 (서비스 이용료 및 크레딧)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>서비스 이용을 위해서는 크레딧이 필요하며, 크레딧은 유료로 구매하거나 광고 시청 등을 통해 무료로 획득할 수 있습니다.</li>
              <li>회원가입 시 일정량의 무료 크레딧이 지급됩니다.</li>
              <li>크레딧의 가격 및 사용량은 회사의 정책에 따라 변경될 수 있으며, 변경 시 사전에 공지합니다.</li>
              <li>구매한 크레딧의 유효기간은 구매일로부터 1년입니다.</li>
              <li>무료로 지급된 크레딧의 유효기간은 지급일로부터 30일입니다.</li>
              <li>크레딧은 현금으로 환불되지 않으며, 타인에게 양도할 수 없습니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제7조 (회원의 의무)</h2>
            <p className="text-gray-300 mb-4">회원은 다음 각 호의 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              <li>불법적이거나 부적절한 콘텐츠 생성을 위해 서비스를 이용하는 행위</li>
              <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 조장하거나 상업적으로 이용하는 행위</li>
              <li>자동화된 수단을 사용하여 서비스에 액세스하거나 크레딧을 부정하게 획득하는 행위</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제8조 (콘텐츠의 저작권)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회원이 서비스를 이용하여 생성한 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.</li>
              <li>회원은 자신이 생성한 콘텐츠를 자유롭게 사용, 수정, 배포할 수 있습니다.</li>
              <li>회사는 서비스 개선 및 품질 향상을 위해 익명화된 형태로 생성된 콘텐츠를 분석할 수 있습니다.</li>
              <li>회원은 제3자의 저작권, 상표권 등 지적재산권을 침해하는 콘텐츠를 생성해서는 안 됩니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제9조 (서비스의 변경 및 중단)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
              <li>회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                  <li>전기통신사업법에 규정된 기간통신사업자가 전기통신서비스를 중단한 경우</li>
                  <li>천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
                </ul>
              </li>
              <li>회사는 서비스의 변경 또는 중단으로 인하여 발생하는 문제에 대해서는 책임을 지지 않습니다. 단, 회사의 고의 또는 중대한 과실이 있는 경우에는 그러하지 아니합니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제10조 (이용계약의 해지)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회원은 언제든지 서비스 내 회원탈퇴 기능을 이용하여 이용계약을 해지할 수 있습니다.</li>
              <li>회사는 회원이 본 약관을 위반한 경우 사전 통보 후 이용계약을 해지할 수 있습니다. 다만, 회원이 현행법 위반 및 고의 또는 중대한 과실로 회사에 손해를 입힌 경우에는 사전 통보 없이 이용계약을 해지할 수 있습니다.</li>
              <li>이용계약이 해지된 경우 회원의 개인정보는 관련 법령 및 개인정보처리방침에 따라 처리됩니다.</li>
              <li>이용계약 해지 시 미사용 크레딧은 환불되지 않습니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제11조 (면책조항)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 AI가 생성한 콘텐츠의 정확성, 완전성, 적법성을 보증하지 않으며, 생성된 콘텐츠의 사용으로 인해 발생하는 문제에 대해 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스를 이용하여 기대하는 효용을 얻지 못한 것에 대하여 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제12조 (손해배상)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회사 또는 회원이 본 약관을 위반하여 상대방에게 손해를 입힌 경우, 그 손해를 배상할 책임이 있습니다.</li>
              <li>회사의 손해배상 책임은 회원이 지불한 서비스 이용료를 한도로 합니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">제13조 (분쟁해결 및 관할법원)</h2>
            <ul className="list-decimal list-inside text-gray-300 space-y-3">
              <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.</li>
              <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 민사소송법에 따른 관할법원에 제기합니다.</li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">부칙</h2>
            <p className="text-gray-300">
              본 약관은 2024년 1월 1일부터 시행됩니다.
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

export default TermsPage;
