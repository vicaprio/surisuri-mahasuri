import { useState } from 'react';
import ChatModal from '../components/ChatModal';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Star,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  Calendar
} from 'lucide-react';

function TechnicianDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, jobs, map
  const [chatRoom, setChatRoom] = useState(null);

  // Mock data
  const stats = {
    monthlyEarnings: 3200000,
    completedJobs: 45,
    rating: 4.8,
    acceptanceRate: 92
  };

  const availableJobs = [
    {
      id: 1,
      category: '배관/수도',
      description: '싱크대 배수구 누수',
      location: '서울시 강남구 테헤란로 123',
      distance: 1.2,
      estimatedCost: 65000,
      estimatedTime: '1-2시간',
      urgency: 'high',
      requestTime: '5분 전'
    },
    {
      id: 2,
      category: '전기/조명',
      description: '거실 조명 교체',
      location: '서울시 서초구 반포대로 456',
      distance: 2.5,
      estimatedCost: 45000,
      estimatedTime: '1시간',
      urgency: 'normal',
      requestTime: '12분 전'
    },
    {
      id: 3,
      category: '에어컨',
      description: '에어컨 청소 및 점검',
      location: '서울시 송파구 올림픽로 789',
      distance: 3.8,
      estimatedCost: 80000,
      estimatedTime: '2시간',
      urgency: 'normal',
      requestTime: '25분 전'
    }
  ];

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: { text: '긴급', color: 'bg-red-100 text-red-800' },
      normal: { text: '일반', color: 'bg-blue-100 text-blue-800' },
      low: { text: '예약', color: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[urgency] || badges.normal;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const handleAcceptJob = (jobId) => {
    alert(`일감 #${jobId}를 수락했습니다. 고객 정보를 확인해주세요.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-blue-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </button>
            <span className="font-semibold text-white">기사님 대시보드</span>
            <button className="text-white">
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2" />
                <span className="text-sm opacity-90">이번 달 수익</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyEarnings)}</p>
              <p className="text-xs opacity-75 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                전월 대비 +15%
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm opacity-90">완료 건수</span>
              </div>
              <p className="text-2xl font-bold">{stats.completedJobs}</p>
              <p className="text-xs opacity-75 mt-1">이번 달</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />
                <span className="text-sm opacity-90">평점</span>
              </div>
              <p className="text-2xl font-bold">{stats.rating}</p>
              <p className="text-xs opacity-75 mt-1">리뷰 128개</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-sm opacity-90">수락률</span>
              </div>
              <p className="text-2xl font-bold">{stats.acceptanceRate}%</p>
              <p className="text-xs opacity-75 mt-1">우수</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-2 font-medium transition-colors relative ${
                activeTab === 'jobs'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              일감 보기
              <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {availableJobs.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">오늘의 일정</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">오전 10:00 - 배관 수리</p>
                    <p className="text-sm text-gray-600">서울시 강남구 테헤란로 123</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
                    출발
                  </button>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">오후 2:00 - 조명 교체</p>
                    <p className="text-sm text-gray-600">서울시 서초구 반포대로 456</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg">
                    예정
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">이번 주 실적</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">월요일</span>
                  <span className="font-semibold text-gray-900">8건 / {formatCurrency(520000)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">화요일</span>
                  <span className="font-semibold text-gray-900">10건 / {formatCurrency(650000)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">수요일</span>
                  <span className="font-semibold text-gray-900">7건 / {formatCurrency(480000)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-gray-900 font-medium">오늘 (목요일)</span>
                  <span className="font-semibold text-primary-600">2건 진행중</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                가까운 위치의 일감을 우선적으로 보여드립니다. 빠른 수락이 높은 평점으로 이어집니다!
              </p>
            </div>

            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.category}
                        </h3>
                        {getUrgencyBadge(job.urgency)}
                        <span className="text-xs text-gray-500">{job.requestTime}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{job.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {job.location}
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {job.distance}km
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          예상 소요시간: {job.estimatedTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          예상 수익: {formatCurrency(job.estimatedCost)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => alert('고객에게 전화를 겁니다...')}
                      className="py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      전화하기
                    </button>
                    <button
                      onClick={() => setChatRoom({ roomId: String(job.id), title: `${job.category} 채팅` })}
                      className="py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      채팅하기
                    </button>
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      수락하기
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {availableJobs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">현재 사용 가능한 일감이 없습니다</p>
                <p className="text-sm text-gray-400">새로운 요청이 들어오면 즉시 알려드립니다</p>
              </div>
            )}
          </div>
        )}

      </div>

      {chatRoom && (
        <ChatModal
          roomId={chatRoom.roomId}
          senderType="technician"
          senderName="기사님"
          title={chatRoom.title}
          onClose={() => setChatRoom(null)}
        />
      )}
    </div>
  );
}

export default TechnicianDashboard;
