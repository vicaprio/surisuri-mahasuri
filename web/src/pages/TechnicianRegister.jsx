import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Upload } from 'lucide-react';

function TechnicianRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 회원가입 방식 선택, 2: 상세 정보 입력
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialties: [],
    serviceAreas: [],
    experience: '',
    businessNumber: '',
    bankAccount: '',
    bankName: '',
  });

  const specialtyOptions = [
    '전기', '배관', '에어컨', '보일러', '도배', '싱크대',
    '가구조립', '목공', '타일', '방충망', '페인트', '기타'
  ];

  const areaOptions = [
    '서울 전체', '강남구', '서초구', '송파구', '강동구', '동작구',
    '관악구', '영등포구', '구로구', '금천구', '양천구', '강서구'
  ];

  const handleSocialLogin = (provider) => {
    // OAuth 플로우를 시작하기 전에 accountType을 localStorage에 저장
    localStorage.setItem('oauth_account_type', 'technician');

    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/oauth/${provider}/callback`;

    let authUrl = '';

    if (provider === 'kakao') {
      const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID || 'your-kakao-client-id';
      authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    } else if (provider === 'naver') {
      const naverClientId = import.meta.env.VITE_NAVER_CLIENT_ID || 'your-naver-client-id';
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('naver_state', state);
      authUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=${naverClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    } else if (provider === 'google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
    }

    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.specialties.length === 0) {
      alert('최소 1개 이상의 전문분야를 선택해주세요.');
      return;
    }

    if (formData.serviceAreas.length === 0) {
      alert('최소 1개 이상의 서비스 지역을 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // TODO: API 호출하여 기사님 등록
      console.log('Registering technician:', formData);

      // 임시: 로그인 페이지로 이동
      alert('기사님 등록이 완료되었습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {step === 1 ? '홈으로 돌아가기' : '이전 단계'}
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            기사님 등록
          </h2>
          <p className="text-center text-gray-600 mb-8">
            마하수리와 함께 더 많은 고객을 만나보세요
          </p>

          {step === 1 ? (
            // Step 1: 회원가입 방식 선택
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">소셜 계정으로 간편 등록</h3>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('kakao')}
                  className="w-full py-3 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.9 1.88 5.45 4.68 7.01L5.5 21.5l3.93-2.35C10.22 19.5 11.1 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                  </svg>
                  카카오로 시작하기
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('naver')}
                  className="w-full py-3 px-4 bg-[#03C75A] hover:bg-[#02B350] text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                  네이버로 시작하기
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  구글로 시작하기
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                이메일로 등록하기
              </button>

              <p className="text-sm text-center text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  로그인
                </button>
              </p>
            </div>
          ) : (
            // Step 2: 상세 정보 입력
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="010-1234-5678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="8자 이상"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="비밀번호 재입력"
                    required
                  />
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">전문 분야 *</h3>
                <div className="grid grid-cols-3 gap-2">
                  {specialtyOptions.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                        formData.specialties.includes(specialty)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              {/* 서비스 지역 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">서비스 지역 *</h3>
                <div className="grid grid-cols-2 gap-2">
                  {areaOptions.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleAreaToggle(area)}
                      className={`py-2 px-4 rounded-lg border-2 transition-colors ${
                        formData.serviceAreas.includes(area)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* 경력 및 사업자 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">추가 정보</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    경력 (년)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자등록번호 (선택)
                  </label>
                  <input
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="123-45-67890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    은행명
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="국민은행"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="123456-78-901234"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '등록 중...' : '기사님 등록 완료'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechnicianRegister;
