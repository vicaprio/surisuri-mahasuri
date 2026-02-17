import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, ArrowLeft } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user'); // user or technician
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', email, userType);
    const result = await login(email, password, userType === 'technician');
    console.log('Login result:', result);

    if (result.success) {
      if (userType === 'technician') {
        navigate('/technician');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error('Login failed:', result.error);
    }

    setLoading(false);
  };

  const handleQuickLogin = async (testEmail, testPassword, type) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setUserType(type);
    setLoading(true);
    setError('');

    console.log('Quick login attempt:', testEmail, type);
    const result = await login(testEmail, testPassword, type === 'technician');
    console.log('Quick login result:', result);

    if (result.success) {
      if (type === 'technician') {
        navigate('/technician');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || '로그인에 실패했습니다.');
      console.error('Quick login failed:', result.error);
    }

    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    // OAuth 플로우를 시작하기 전에 accountType을 localStorage에 저장
    localStorage.setItem('oauth_account_type', userType === 'technician' ? 'technician' : 'user');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          홈으로 돌아가기
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary-600 transition-colors"
            >
              마하수리
            </button>
          </h2>
          <p className="text-center text-gray-600 mb-8">
            투명한 집수리 플랫폼
          </p>

          {/* User Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                userType === 'user'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              사용자
            </button>
            <button
              type="button"
              onClick={() => setUserType('technician')}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                userType === 'technician'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              기사님
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
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
            </div>

          {/* Quick Login for Testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">테스트 계정으로 빠른 로그인</p>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('user@test.com', 'password123', 'user')}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
              >
                👤 일반 사용자로 로그인
              </button>
              <button
                onClick={() => handleQuickLogin('company@test.com', 'password123', 'user')}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
              >
                🏢 기업 사용자로 로그인
              </button>
              <button
                onClick={() => handleQuickLogin('tech1@test.com', 'password123', 'technician')}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
              >
                🔧 기사님 (전기)로 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
