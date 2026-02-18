import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from '../components/NotificationDropdown';
import SupportChatModal from '../components/SupportChatModal';
import {
  Wrench,
  Droplet,
  Zap,
  PaintBucket,
  Wind,
  Hammer,
  Shield,
  Camera,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Lightbulb
} from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showSupport, setShowSupport] = useState(false);

  const categories = [
    { name: '전기/조명', icon: Zap, color: 'bg-yellow-500', description: '콘센트, 스위치, 조명 등' },
    { name: '배관/수도', icon: Droplet, color: 'bg-blue-500', description: '누수, 싱크대, 화장실 등' },
    { name: '도배/장판', icon: PaintBucket, color: 'bg-pink-500', description: '벽지, 장판, 페인트 등' },
    { name: '에어컨', icon: Wind, color: 'bg-cyan-500', description: '설치, 청소, 수리' },
    { name: '목공/가구', icon: Hammer, color: 'bg-orange-500', description: '문틀, 싱크대, 붙박이장 등' },
    { name: '기타수리', icon: Wrench, color: 'bg-gray-500', description: '잠금장치, 방충망 등' }
  ];

  const features = [
    {
      icon: Camera,
      title: 'AI 예상 견적',
      description: '사진만 찍으면 즉시 예상 견적을 확인'
    },
    {
      icon: Shield,
      title: '디지털 하자보증보험증권',
      description: 'AS 보증 및 정품 인증'
    },
    {
      icon: Clock,
      title: '빠른 매칭',
      description: '가까운 전문가와 실시간 연결'
    }
  ];

  const faqs = [
    {
      question: '마하수리는 어떤 서비스인가요?',
      answer: '마하수리는 AI 기반 견적 산정과 검증된 기사님 매칭으로 투명하고 합리적인 집수리를 제공하는 플랫폼입니다. 사진만 찍으면 즉시 예상 견적을 확인하고, 가까운 전문 기사님과 매칭됩니다.'
    },
    {
      question: '어떻게 이용하나요?',
      answer: '1) 회원가입 (구글/네이버/카카오 간편 로그인) → 2) 수리가 필요한 부분 사진 촬영 → 3) AI 예상 견적 확인 → 4) 기사님 매칭 및 방문 예약 → 5) 수리 완료 및 디지털 보증서 발급 순서로 진행됩니다.'
    },
    {
      question: '비용은 어떻게 결정되나요?',
      answer: 'AI가 사진을 분석하여 예상 견적을 먼저 제시하고, 기사님이 현장 방문 후 정확한 견적을 확정합니다. 모든 과정이 투명하게 공개되며, 예상 견적과 큰 차이가 있을 경우 고객님께 사전 안내드립니다.'
    },
    {
      question: '결제는 어떻게 하나요?',
      answer: '신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등)를 지원합니다. 모든 결제는 PG사를 통해 안전하게 처리되며, 수리 완료 전까지 에스크로로 보호됩니다.'
    },
    {
      question: '하자보증보험증권은 어떻게 받나요?',
      answer: '수리 완료 후 자동으로 디지털 AS 하자보증보험증권이 발급됩니다. 마이페이지의 수리 이력에서 언제든지 확인 및 다운로드할 수 있으며, 보증 기간 내 무상 AS를 받으실 수 있습니다.'
    },
    {
      question: '취소나 환불이 가능한가요?',
      answer: '기사님 방문 전까지는 전액 환불이 가능합니다. 방문 후 수리를 진행하지 않는 경우 출장비가 발생할 수 있으며, 수리 완료 후에는 하자 발생 시 보증서를 통한 무상 AS로 처리됩니다.'
    },
    {
      question: '어떤 종류의 수리를 할 수 있나요?',
      answer: '전기/조명, 배관/수도, 도배/장판, 에어컨, 목공/가구, 기타 집수리 등 대부분의 생활 수리를 지원합니다. 각 분야별 전문 기사님이 배정되어 안전하고 전문적인 서비스를 제공합니다.'
    },
    {
      question: '기사님은 어떻게 검증하나요?',
      answer: '모든 기사님은 자격증, 경력, 고객 리뷰 등을 통해 엄격하게 검증됩니다. 평점 4.5점 이상 유지 기사님만 활동하실 수 있으며, 정기적인 교육과 품질 관리를 진행합니다.'
    },
    {
      question: '긴급 수리도 가능한가요?',
      answer: '네, 긴급 수리 옵션을 선택하시면 가장 빠르게 방문 가능한 기사님을 우선 매칭해드립니다. 상황에 따라 당일 방문도 가능하며, 긴급 수리는 별도의 추가 요금이 발생할 수 있습니다.'
    },
    {
      question: '회원가입이 꼭 필요한가요?',
      answer: '네, 견적 확인과 기사님 매칭을 위해 회원가입이 필요합니다. 하지만 구글, 네이버, 카카오 계정으로 간편하게 가입할 수 있으며, 가입 후 수리 이력과 하자보증보험증권을 체계적으로 관리하실 수 있습니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-primary-500 dark:text-primary-400">수리수리</span>
                <span className="text-xl font-bold text-primary-900 dark:text-primary-100">마하수리</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/estimate')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                AI 견적
              </button>
              <button
                onClick={() => navigate('/history')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                수리이력
              </button>
              <button
                onClick={() => navigate('/technician')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                기사님 전용
              </button>

              {/* Dark Mode Toggle - Light Bulb */}
              <button
                onClick={toggleDarkMode}
                className="relative group"
                title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                <div className={`relative transition-all duration-300 ${
                  isDarkMode ? 'transform rotate-180' : ''
                }`}>
                  <Lightbulb
                    className={`w-6 h-6 transition-all duration-300 ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-yellow-500 hover:text-yellow-600 fill-yellow-400'
                    }`}
                  />
                  {!isDarkMode && (
                    <div className="absolute inset-0 bg-yellow-300 blur-md opacity-30 rounded-full"></div>
                  )}
                </div>
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationDropdown />
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  로그인
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t dark:border-gray-700">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => {
                    navigate('/estimate');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  AI 견적
                </button>
                <button
                  onClick={() => {
                    navigate('/history');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  수리이력
                </button>
                <button
                  onClick={() => {
                    navigate('/technician');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  기사님 전용
                </button>

                {/* Dark Mode Toggle - Mobile */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-3 px-4 py-2 text-left"
                >
                  <div className={`relative transition-all duration-300 ${
                    isDarkMode ? 'transform rotate-180' : ''
                  }`}>
                    <Lightbulb
                      className={`w-5 h-5 transition-all duration-300 ${
                        isDarkMode
                          ? 'text-gray-400'
                          : 'text-yellow-500 fill-yellow-400'
                      }`}
                    />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {isDarkMode ? '라이트 모드' : '다크 모드'}
                  </span>
                </button>

                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-4 py-2">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-left"
                  >
                    로그인
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1a2e5a 60%, #1e3a6e 100%)' }}
      >
        {/* Desktop: vehicle absolute right, fills section height */}
        <img
          src="/회사차량.png"
          alt="마하수리 차량"
          className="hidden md:block absolute"
          style={{
            bottom: 0,
            right: 0,
            height: '100%',
            width: 'auto',
            maxWidth: '62%',
            pointerEvents: 'none',
          }}
        />

        {/* Text Content */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center"
          style={{ minHeight: '252px' }}
        >
          <div className="py-10 md:py-16" style={{ maxWidth: '480px' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              집수리, 이제는
              <span className="block text-accent-400">정찰제로 안심하세요</span>
            </h1>
            <p className="text-base md:text-lg text-blue-200 mb-8">
              사진 한 장으로 견적 즉시 제공, 근처 집수리 기술자 매칭까지
            </p>
            <button
              onClick={() => navigate('/estimate')}
              className="inline-flex items-center px-8 py-4 bg-accent-500 text-white text-lg font-semibold rounded-xl hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Camera className="w-6 h-6 mr-2" />
              AI 견적 받기
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile: vehicle below text, full width */}
        <div className="md:hidden w-full">
          <img
            src="/회사차량.png"
            alt="마하수리 차량"
            className="w-full object-contain"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-16" style={{ background: '#0f1e3d' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            왜 마하수리인가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              // 0=드릴, 1=문서+세척기, 2=배관호스
              const chars = ['/char-drill.png', '/char-washer.png', '/char-hose.png'];
              return (
                <div
                  key={index}
                  className="relative overflow-hidden p-8 rounded-2xl hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #1a2e5a 0%, #243d6e 100%)' }}
                >
                  {/* Character decoration — bottom-right */}
                  <img
                    src={chars[index]}
                    alt=""
                    className="absolute bottom-0 right-0 pointer-events-none"
                    style={{ height: '110px', width: 'auto', opacity: 0.9 }}
                  />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-5">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-blue-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          어떤 수리가 필요하신가요?
        </h2>
        <p className="text-center text-gray-600 mb-12">
          카테고리를 선택하고 AI 견적을 받아보세요
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <button
                key={index}
                onClick={() => navigate('/estimate', { state: { category: category.name } })}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 text-left"
              >
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            5분이면 예상 견적부터 기사님 매칭까지 완료됩니다
          </p>
          <button
            onClick={() => navigate('/estimate')}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-700 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              마하수리 서비스에 대해 궁금하신 점을 확인하세요
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              더 궁금하신 점이 있으신가요?
            </p>
            <button
              onClick={() => setShowSupport(true)}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              1:1 문의하기
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">마하수리</span>
              </div>
              <p className="text-sm text-gray-400">
                투명한 집수리 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white">AI 견적</button></li>
                <li><button className="hover:text-white">수리이력</button></li>
                <li><button onClick={() => navigate('/technician-register')} className="hover:text-white">기사님 등록</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white">자주 묻는 질문</button></li>
                <li><button onClick={() => setShowSupport(true)} className="hover:text-white">1:1 문의</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white">이용약관</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">문의</h4>
              <p className="text-sm text-gray-400">
                고객센터: 1588-0000<br />
                평일 09:00 - 18:00
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
            © 2026 마하수리. All rights reserved.
          </div>
        </div>
      </footer>

      {showSupport && (
        <SupportChatModal onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
}

export default Home;
