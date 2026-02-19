import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function OAuthCallback() {
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasRun = useRef(false); // Track if callback has already been executed

  useEffect(() => {
    // Prevent duplicate execution (React StrictMode runs effects twice)
    if (hasRun.current) {
      console.log('OAuth callback already executed, skipping');
      return;
    }
    hasRun.current = true;

    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setError('인증 코드가 없습니다.');
          setLoading(false);
          return;
        }

        // For Naver, verify state
        if (provider === 'naver') {
          const savedState = localStorage.getItem('naver_state');
          if (state !== savedState) {
            setError('잘못된 요청입니다.');
            setLoading(false);
            return;
          }
          localStorage.removeItem('naver_state');
        }

        // Get account type from localStorage (set during OAuth initiation)
        const accountType = localStorage.getItem('oauth_account_type') || 'user';
        localStorage.removeItem('oauth_account_type'); // Clean up

        // Send code to backend
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        console.log('Sending OAuth request to:', `${apiUrl}/oauth/${provider}`);
        console.log('Account type:', accountType);

        const response = await axios.post(`${apiUrl}/oauth/${provider}`, {
          code,
          state: state || undefined,
          accountType, // Pass accountType to backend
        });

        console.log('OAuth response received:', response.data);

        // Check if response is successful and has valid data
        if (response.data && response.data.data && response.data.data.user && response.data.data.token) {
          const { user, token } = response.data.data;

          // Validate that user has an id
          if (!user.id) {
            console.error('Invalid user data: missing id');
            throw new Error('로그인 응답이 올바르지 않습니다.');
          }

          // Update auth context
          setUser(user);
          setToken(token);

          // Save token to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          console.log('OAuth login successful:', { userId: user.id, email: user.email, userType: user.userType });

          // 견적 페이지에서 로그인하러 온 경우 복원
          const pendingReturnTo = localStorage.getItem('pendingReturnTo');
          if (pendingReturnTo) {
            localStorage.removeItem('pendingReturnTo');
            navigate(pendingReturnTo);
          } else if (user.userType === 'technician' || user.role === 'technician') {
            navigate('/technician');
          } else {
            navigate('/');
          }
        } else {
          console.error('Invalid response format:', response.data);
          throw new Error('로그인 응답 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);

        // Clear any existing auth data on OAuth failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);

        const errorMessage = err.response?.data?.error ||
                           err.response?.data?.message ||
                           err.message ||
                           '소셜 로그인에 실패했습니다.';

        setError(errorMessage);
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [provider, searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              로그인 처리 중...
            </h2>
            <p className="text-gray-600">
              {provider === 'kakao' && '카카오 계정으로 로그인하고 있습니다.'}
              {provider === 'naver' && '네이버 계정으로 로그인하고 있습니다.'}
              {provider === 'google' && '구글 계정으로 로그인하고 있습니다.'}
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              로그인 실패
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default OAuthCallback;
