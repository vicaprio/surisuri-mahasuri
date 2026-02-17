import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </button>
            <span className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              서비스 이용약관
            </span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              서비스 이용약관
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              유한회사 마하수리
            </p>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 1 조 (목적)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                이 약관은 유한회사 마하수리(이하 "당사"라 한다)가 운영, 제공하는 인터넷 웹사이트(이하 "웹사이트"라 합니다) 및 모바일 어플리케이션(이하 "앱"이라 합니다)에서 제공하는 모든 서비스(이하 "마하수리 서비스"라 합니다)를 이용함에 있어 당사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 2 조 (정의)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                이 약관에서 사용하는 용어의 정의는 아래와 같고, 본 조에서 정하는 것을 제외하고는 서비스 화면상 안내, 운영정책, 관계 법령 및 기타 일반적인 상관례에 의합니다.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>"회원"이라 함은 이 약관에 따라 당사에 개인정보를 제공하여 회원등록을 한 자로서, 당사와 이용계약을 체결하여 당사가 제공하는 무료서비스와 유료서비스를 이용하는 자를 말합니다. 회원은 고객과 파트너로 구분됩니다.</li>
                <li>"고객"은 일감 또는 견적 요청에 대한 정보를 제공하는 회원을 말합니다.</li>
                <li>"파트너"는 일감 또는 견적 요청에 대한 정보를 제공받고자 하는 회원을 말합니다.</li>
                <li>"마하수리서비스"라 함은 웹사이트 및 앱에서 당사가 제공하는 모든 서비스를 말합니다.</li>
                <li>"홈서비스"라 함은 파트너가 고객에게 제공하는 모든 서비스(가사도우미 서비스, 이사 서비스 등)를 말합니다.</li>
                <li>"무료서비스"라 함은 회원과 회원이 매칭되기 위하여 당사에 대금을 지급하지 않고 이용할 수 있는 모든 서비스를 말합니다.</li>
                <li>"유료서비스"라 함은 구인 또는 구직을 위한 사이트 결제 및 기타 상품(온라인 콘텐츠 포함)의 유료 제공 및 결제 처리를 위한 제반 서비스를 말합니다.</li>
                <li>"자동결제"라 함은 회원이 웹사이트 또는 앱에 신용카드/체크카드 등 결제수단을 등록한 이후 자동으로 결제가 진행되는 것을 말합니다.</li>
                <li>"견적"이라 함은 "고객"의 요청에 따라 "파트너"가 제공할 수 있는 용역의 내용, 가격 그리고 용역 역량에 관한 정보를 말합니다.</li>
                <li>"구인 수수료"라 함은 당사의 "파트너" 중개의 반대급부로써 "고객"에게 지급받는 금원을 말합니다.</li>
                <li>"구직 수수료"라 함은 당사의 "고객" 중개 또는 "견적" 응찰 기회의 반대급부로써 "파트너"에게 지급받는 금원을 말합니다.</li>
                <li>"예치금"이라 함은 "회원"이 "유료서비스" 이용을 위해 당사에 선급으로 예치한 금원을 말합니다.</li>
                <li>"무상 예치금"이라 함은 당사가 "회원"에게 무상으로 제공하는 "예치금"을 말합니다.</li>
                <li>"쿠폰"이라 함은 당사가 "회원"에게 제공하는 특정 조건의 "유료서비스" 할인권을 말합니다.</li>
                <li>"매칭"이란, "고객"과 "파트너"를 중개하여 연결되는 것을 말합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 3 조 (약관의 명시와 개정)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>당사는 이 약관의 내용과 당사의 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처 등을 회원이 알 수 있도록 웹사이트 및 앱 초기 화면에 게시합니다. 다만, 약관의 내용은 이용자가 연결화면을 통하여 볼 수 있도록 할 수 있습니다.</li>
                <li>당사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>당사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 당사 홈페이지의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 회원에게 불리하게 약관내용을 변경하는 경우에는 최소한 30일 이전의 유예기간을 두고 공지하고, 회원에게 SMS, 모바일 애플리케이션 등 적절한 방법으로 개별 통지합니다.</li>
                <li>회원은 개정된 약관이 공지된 지 15일 이내에 거부의사를 표명할 수 있습니다. 회원이 개정된 약관에 대한 거부의사를 표명하는 경우 당사는 15일의 기간을 정하여 회원에게 사전 통지 후 당해 회원과의 계약을 해지할 수 있습니다.</li>
                <li>회원이 변경된 약관의 내용에 동의하지 않는 경우 당사는 개정된 약관의 내용을 적용할 수 없으며, 이 경우 회원은 이용계약을 해지할 수 있습니다.</li>
                <li>당사는 개별 서비스 별로 별도의 약관(이하 "서비스 별 약관"이라 합니다)을 둘 수 있으며, 해당 내용이 이 약관과 상충할 경우 서비스 별 약관이 우선합니다.</li>
                <li>이 약관이 약관에서 정하지 아니한 사항과 이 약관의 해석에 관하여는 「전자상거래 등에서의 소비자 보호에 관한 법률」, 「약관의 규제 등에 관한 법률」, 「전자상거래 등에서의 소비자보호 지침」 등 관련법령 또는 상관례에 따릅니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 4 조 (이용계약 및 회원가입)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>당사 서비스를 이용하고자 하는 자는 당사가 정한 서비스 신청 양식에 따라 정보를 기입한 후 이 약관 및 개인정보 수집 및 이용에 동의한다는 의사표시를 함으로써 이용계약과 회원가입의 신청을 합니다.</li>
                <li>당사는 제1항과 같이 회원으로 가입할 것을 신청한 회원 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>본인 실명이 아니거나 다른 사람의 명의를 사용하여 신청하였을 때</li>
                    <li>서비스 이용 계약 신청서의 내용을 허위로 기재하였을 때</li>
                    <li>사회의 안녕과 질서 혹은 미풍양속을 저해할 목적으로 신청하였을 때</li>
                    <li>부정한 용도로 본 서비스를 이용하고자 하는 경우</li>
                    <li>기타 이용신청자의 귀책사유로 이용승낙이 곤란한 경우</li>
                  </ul>
                </li>
                <li>이용계약 및 회원가입은 당사가 제1항의 신청에 대한 승낙을 통지함으로써 성립합니다.</li>
                <li>19세 미만의 미성년자는 법정대리인의 동의가 있어야 이용계약 및 회원가입이 성립합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 5 조 (서비스의 제공)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>서비스의 내용은 다음과 같습니다.
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>파트너와 고객 간 매칭 서비스</li>
                    <li>고객과 파트너 간 수수료 대금 지급(결제)대행 서비스</li>
                    <li>맞춤화된 서비스 또는 일감 및 견적 요청의 안내/제공 서비스</li>
                    <li>기타 관련된 부수적 서비스</li>
                  </ul>
                </li>
                <li>당사는 통신판매중개자로서 통신판매의 당사자가 아니며, 마하수리 서비스의 범위는 웹사이트 및 앱 상에서 고객과 파트너가 중개되거나 견적 요청 및 응찰 기회를 주는 것까지로 제한됩니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 6 조 (서비스의 이용 및 중단)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>당사의 서비스는 특별한 사정이 없는 한 연중무휴, 1일 24시간 이용할 수 있습니다.</li>
                <li>당사는 컴퓨터 등 정보통신설비의 보수 점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>당사가 사업종목의 전환, 사업의 포기, 업체 간 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 제8조에서 정한 방법으로 회원에게 통지하고, 당초 웹사이트 및 앱에서 제시한 조건에 따라 회원에게 보상합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 7 조 (회원탈퇴 및 자격 상실 등)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>회원은 당사에 언제든지 탈퇴를 요청할 수 있으며 당사는 즉시 회원탈퇴를 처리합니다. 다만 아래의 경우에는 해당하는 문제가 해결된 후 탈퇴 처리합니다.
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>이용예약이 취소 또는 완료되지 않은 경우</li>
                    <li>대금의 결제, 지급이 완료되지 않은 경우</li>
                    <li>당사, 파트너, 고객 또는 제3자와 발생한 분쟁이 종료되지 않은 경우</li>
                  </ul>
                </li>
                <li>회원이 다음 각 호의 사유에 해당하는 경우, 당사는 회원자격을 제한 및 정지시킬 수 있으며, 이 경우 그 사유를 회원에게 지체 없이 통지합니다. (상세 사유는 원문 참조)</li>
                <li>당사가 회원 자격을 제한, 정지시킨 후 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 당사는 회원자격을 상실시키고, 그 사유를 지체 없이 통지합니다.</li>
                <li>당사가 회원자격을 상실시키는 경우에는 회원등록을 말소합니다. 이 경우 회원에게 이를 통지하고 회원등록 말소 전에 최소한 30일 이상의 기간을 정하여 소명할 기회를 부여합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 8 조 (회원에 대한 통지)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>당사가 회원에 대한 통지를 하는 경우, 전화나 메시지 그리고 어플리케이션을 통할 수 있습니다.</li>
                <li>당사는 불특정다수 회원에 대한 통지의 경우 1주일이상 웹사이트 및 앱에 게시함으로서 개별 통지에 갈음할 수 있습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 9 조 (대금의 지급)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 고객 또는 파트너는 유료 서비스 이용을 결정하면 신용/체크카드, 가상계좌 등 기타의 방법으로 거래 대금을 결제할 수 있는 방법을 제공합니다. 구체적인 결제 방법 및 수수료, 자동결제, 미결제 처리에 대한 상세 내용은 원문을 참조하시기 바랍니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 10 조 (환급)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회원의 귀책사유 없이 시스템 오류 등으로 정상적으로 당사의 서비스를 이용하지 못하거나 초과결제·중복결제 등의 문제가 발생한 경우, 회사는 해당 서비스의 정상적인 이용을 전제로 부과된 이용요금 또는 잘못 결제된 이용요금을 전부 또는 일부 환급합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 11 조 (손해 배상)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 고객과 파트너 간 계약의 중개자로서 고객과 파트너 간의 분쟁이 발생한 경우, 원칙적으로 관련 당사자 간에 해결해야 합니다. 손해배상, 파손사고, 도난 및 분실사고 등에 대한 상세 처리 기준은 원문을 참조하시기 바랍니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 12 조 (면책조항)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 천재지변, 회원의 귀책사유, 기타 당사의 고의 또는 과실 없이 서비스를 제공할 수 없는 경우 이로 인하여 회원에게 발생한 손해에 대해서는 책임을 부담하지 않습니다. 상세한 면책 사항은 원문을 참조하시기 바랍니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 13 조 (개인정보처리방침)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                개인정보보호에 관한 사항은 당사의 웹사이트 또는 모바일 어플리케이션에 게시된 당사의 개인정보처리방침에 규정된 내용에 따릅니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 14 조 (당사의 의무)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 법령과 이 약관이 금지하거나 공공의 질서와 선량한 풍속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하는 데 최선을 다합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 15 조 (회원의 계정 정보 및 비밀번호에 대한 의무)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회원 계정과 비밀번호에 관한 관리책임은 회원에게 있습니다. 회원은 자신의 계정 및 비밀번호를 제3자에게 이용하게 해서는 안 됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 16 조 (회원의 의무)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회원은 당사와의 거래 전에 반드시 거래 조건을 정확하게 확인한 후 거래를 하여야 합니다. 회원은 이 약관 및 당사가 서비스와 관련하여 고지하는 내용을 준수하여야 하며, 약관 및 고지내용을 위반하거나 이행하지 아니하여 발생하는 모든 손해에 관하여는 회원이 책임을 부담합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 17 조 (저작권의 귀속 및 이용제한)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사가 작성한 저작물에 대한 저작권, 기타 지적재산권은 당사에 귀속됩니다. 회원은 당사를 이용함으로써 얻은 정보 중 당사에게 지적재산권이 귀속된 정보를 당사의 사전승낙 없이 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 18 조 (회원의 게시물 및 저작권)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회원이 게시한 게시물의 저작권은 게시한 회원에게 귀속됩니다. 단, 당사는 서비스의 운영, 전시, 홍보의 목적으로 회원의 별도 허락 없이 무상으로 저작권법에 규정하는 공정한 관행에 합치되게 회원의 게시물을 사용할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 19 조 (정보의 제공 및 광고의 게재)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 회원에게 서비스 이용에 필요하다고 인정되는 각종 정보에 대해서 웹사이트 및 이메일, SMS, DM 발송 등 각종 매체에 게재하는 방법 등으로 회원에게 제공할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 20 조 (세금신고 및 납세)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 세금신고에 참고할 서비스 금액에 대한 정산 자료를 파트너에게 제공함으로써 파트너의 세금 미신고분에 대한 책임을 지지 않습니다. 파트너는 제공되는 정산 자료를 참고하여 세금신고 시 누락이 되지 않도록 해야 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 21 조 (분쟁해결)</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                당사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다. 당사와 회원간에 발생한 전자상거래 분쟁과 관련하여 회원의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">제 22 조 (재판권 및 준거법)</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>당사와 회원 간에 발생한 분쟁에 관한 소송의 관할은 민사소송법에 따라 정합니다.</li>
                <li>당사와 회원 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.</li>
              </ol>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                본 약관은 2026년 2월 17일부터 적용됩니다.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
