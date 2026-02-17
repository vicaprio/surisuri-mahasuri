import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { matchingAPI } from '../api/matching';
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  User,
  Star,
  Phone,
  Clock,
  MapPin
} from 'lucide-react';

function MatchingStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceRequestId = location.state?.serviceRequestId;

  const [matchStatus, setMatchStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serviceRequestId) {
      navigate('/history');
      return;
    }

    loadMatchStatus();

    // 5초마다 폴링
    const interval = setInterval(loadMatchStatus, 5000);

    return () => clearInterval(interval);
  }, [serviceRequestId]);

  const loadMatchStatus = async () => {
    try {
      const response = await matchingAPI.getMatchStatus(serviceRequestId);
      const statusData = response.data?.data || response.data;
      setMatchStatus(statusData);
      setLoading(false);

      // 매칭 완료되면 폴링 중지
      if (statusData.status === 'MATCHED') {
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/history');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to load match status:', error);
      setError(error.response?.data?.error || '매칭 상태를 불러오지 못했습니다.');
      setLoading(false);
    }
  };

  if (loading && !matchStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">매칭 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => navigate('/history')}
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                돌아가기
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/history')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              수리 이력으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              수리이력
            </button>
            <span className="font-semibold text-gray-900">전문가 매칭</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Searching State */}
        {matchStatus?.status === 'SEARCHING' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping"></div>
              <Loader2 className="relative w-16 h-16 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              가까운 전문가를 찾고 있습니다
            </h2>
            <p className="text-gray-600 mb-6">
              최적의 전문가를 매칭하는 중입니다. 잠시만 기다려주세요...
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>매칭 진행률</span>
                <span>분석 중...</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Notifying State */}
        {matchStatus?.status === 'NOTIFYING' && matchStatus.technician && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">전문가에게 알림을 보냈습니다</h3>
                  <p className="text-sm text-gray-600">
                    응답을 기다리는 중... (최대 15분)
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Technician Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">매칭된 전문가</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {matchStatus.technician.profilePhoto ? (
                    <img
                      src={matchStatus.technician.profilePhoto}
                      alt={matchStatus.technician.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">
                    {matchStatus.technician.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{matchStatus.technician.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    전문가가 요청을 확인하는 중입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600">
                ⏱️ 응답이 없을 경우 자동으로 다음 전문가에게 매칭됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Matched State */}
        {matchStatus?.status === 'MATCHED' && matchStatus.technician && (
          <div className="space-y-6">
            {/* Success Animation */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                전문가 매칭 완료! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                전문가가 곧 연락드릴 예정입니다.
              </p>
            </div>

            {/* Matched Technician Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">배정된 전문가</h3>
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {matchStatus.technician.profilePhoto ? (
                    <img
                      src={matchStatus.technician.profilePhoto}
                      alt={matchStatus.technician.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-xl mb-2">
                    {matchStatus.technician.name}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{matchStatus.technician.rating.toFixed(1)}</span>
                    </div>
                    {matchStatus.technician.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{matchStatus.technician.phone}</span>
                      </div>
                    )}
                  </div>
                  {matchStatus.estimatedArrival && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>
                        예상 도착: {new Date(matchStatus.estimatedArrival).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  수리 이력에서 진행 상황 확인하기
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">다음 단계</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>전문가가 곧 전화로 연락드릴 예정입니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>방문 시간과 준비 사항을 안내받으세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>작업 완료 후 디지털 하자이행보증서가 발급됩니다.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchingStatus;
