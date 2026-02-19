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
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [detailedAddress, setDetailedAddress] = useState('');

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

      // Load available technicians for display (only on first load)
      if (availableTechnicians.length === 0 && statusData.availableTechnicians) {
        setAvailableTechnicians(statusData.availableTechnicians || []);
      }

      // 매칭 완료되면 상세 주소 입력 모달 표시
      if (statusData.status === 'MATCHED' && !showAddressModal) {
        setTimeout(() => {
          setShowAddressModal(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to load match status:', error);
      setError(error.response?.data?.error || '매칭 상태를 불러오지 못했습니다.');
      setLoading(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (!detailedAddress.trim()) {
      alert('상세 주소를 입력해주세요.');
      return;
    }

    try {
      // TODO: API call to update service request with detailed address
      // await serviceRequestAPI.updateAddress(serviceRequestId, detailedAddress);

      // 상세 주소 입력 완료 후 이력으로 이동
      setShowAddressModal(false);
      navigate('/history');
    } catch (error) {
      console.error('Failed to update address:', error);
      alert('주소 업데이트에 실패했습니다.');
    }
  };

  const handleSkipAddress = () => {
    // 나중에 입력하기
    setShowAddressModal(false);
    navigate('/history');
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
              최적의 전문가를 매칭하는 중입니다. 잠시만 기다려주세요(최대 5분)
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
                    응답을 기다리는 중... (최대 5분)
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
            <div className="relative overflow-hidden bg-white rounded-xl shadow-sm p-8 text-center">
              {/* Character (드릴) — 매칭 완료 */}
              <img
                src="/char-drill.png"
                alt=""
                className="absolute bottom-0 right-4 hidden sm:block pointer-events-none"
                style={{ height: '130px', width: 'auto', opacity: 0.9 }}
              />
              <div className="relative z-10">
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
                  <span>작업 완료 후 디지털 하자보증보험증권이 발급됩니다.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Scrolling Reviews Carousel - 매칭 중일 때만 표시 */}
        {(matchStatus?.status === 'SEARCHING' || matchStatus?.status === 'NOTIFYING') && (
          <div className="mt-8 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center tracking-wide uppercase">
              ⭐ 마하수리 고객 실제 후기
            </h3>
            <div className="relative">
              <div className="flex animate-scroll-left space-x-4">
                {[...Array(2)].map((_, repeatIndex) => (
                  <div key={`repeat-${repeatIndex}`} className="flex space-x-4">
                    {[
                      {
                        id: 1,
                        name: '김전기',
                        rating: 5,
                        category: '전기/조명',
                        reviewer: '박**님',
                        date: '2025.01.08',
                        review: '두꺼비집이 자꾸 내려가서 불렀는데 원인까지 정확히 짚어주셨어요. 단순 교체가 아니라 배선 문제까지 해결해 주셔서 너무 만족합니다!',
                      },
                      {
                        id: 2,
                        name: '이배관',
                        rating: 5,
                        category: '배관/수도',
                        reviewer: '최**님',
                        date: '2025.01.14',
                        review: '싱크대 아래가 계속 물이 새서 불안했는데 빠르게 연락 주시고 당일 처리해 주셨어요. 꼼꼼하게 마감까지 깔끔하게 해주셔서 감사합니다.',
                      },
                      {
                        id: 3,
                        name: '박에어컨',
                        rating: 5,
                        category: '에어컨',
                        reviewer: '정**님',
                        date: '2025.01.20',
                        review: '여름철 냉방이 안 돼서 급하게 연락했는데 2시간 내로 오셨어요. 냉매 부족이었는데 괜한 부품 교체 없이 정직하게 처리해 주신 점이 인상적이었어요.',
                      },
                      {
                        id: 4,
                        name: '최도배',
                        rating: 5,
                        category: '도배/장판',
                        reviewer: '김**님',
                        date: '2025.01.25',
                        review: '이사 전 도배 맡겼는데 기존 벽지 뜯는 것부터 마감까지 하루 만에 끝내주셨어요. 이음새 하나 없이 완벽해서 입주할 때 기분이 너무 좋았습니다.',
                      },
                      {
                        id: 5,
                        name: '정목공',
                        rating: 4,
                        category: '목공/가구',
                        reviewer: '이**님',
                        date: '2025.02.01',
                        review: '붙박이장 문짝이 틀어져서 맡겼더니 다른 곳 하자까지 미리 체크해 주셨어요. 꼼꼼한 분이라 믿고 맡길 수 있었어요.',
                      },
                      {
                        id: 6,
                        name: '강전기',
                        rating: 5,
                        category: '전기/조명',
                        reviewer: '손**님',
                        date: '2025.02.05',
                        review: '조명 교체 간단한 작업인데도 안전 점검까지 해주셔서 놀랐어요. 작업 후 보증서까지 챙겨주셔서 마하수리 믿고 쓰게 됐습니다.',
                      },
                      {
                        id: 7,
                        name: '윤배관',
                        rating: 5,
                        category: '배관/수도',
                        reviewer: '홍**님',
                        date: '2025.02.10',
                        review: '화장실 변기 막힘으로 연락했는데 막힘 원인을 카메라로 직접 보여주시면서 설명해 주셨어요. 투명하게 처리해 주셔서 너무 신뢰가 갔어요.',
                      },
                      {
                        id: 8,
                        name: '오도배',
                        rating: 5,
                        category: '도배/장판',
                        reviewer: '나**님',
                        date: '2025.02.14',
                        review: '장판이 들떠서 교체했는데 기존 것보다 훨씬 깔끔하게 시공해 주셨어요. 가격도 합리적이고 뒷정리까지 완벽하게 해주셔서 감동받았습니다.',
                      },
                    ].map((item) => (
                      <div
                        key={`${repeatIndex}-${item.id}`}
                        className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                      >
                        {/* 별점 */}
                        <div className="flex items-center space-x-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-400">{item.date}</span>
                        </div>

                        {/* 리뷰 내용 */}
                        <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                          "{item.review}"
                        </p>

                        {/* 작성자 + 전문가 정보 */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{item.name} 기사님</p>
                              <p className="text-xs text-gray-400">{item.reviewer} 작성</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상세 주소 입력 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                상세 주소 입력
              </h3>
              <p className="text-sm text-gray-600">
                기사님의 정확한 방문을 위해<br/>
                상세 주소를 입력해주세요
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기본 주소
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                {matchStatus?.serviceRequest?.address || '주소 정보 없음'}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                placeholder="동/호수를 입력해주세요 (예: 101동 1001호)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAddressSubmit}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                확인
              </button>
              <button
                onClick={handleSkipAddress}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                나중에 입력하기
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 상세 주소는 수리 이력에서 언제든 수정 가능합니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingStatus;
