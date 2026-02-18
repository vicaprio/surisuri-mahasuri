import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceRequestAPI } from '../api/services';
import {
  ArrowLeft,
  FileText,
  Shield,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Loader2,
  Download,
  Star,
  Edit,
  MessageSquare
} from 'lucide-react';
import ChatModal from '../components/ChatModal';

function RepairHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState(null); // { roomId, title }

  useEffect(() => {
    const loadRepairs = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await serviceRequestAPI.getAll();
        setRepairs(response.data.data || []);
      } catch (error) {
        console.error('Failed to load repairs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRepairs();
  }, [user, navigate]);

  // Mock data for demo (remove when API returns data)
  const mockRepairs = [
    {
      id: 1,
      category: '배관/수도',
      description: '싱크대 배수구 누수 수리',
      date: '2026-02-10',
      status: 'completed',
      cost: 65000,
      technician: '김기사',
      location: '서울시 강남구 테헤란로 123',
      warrantyUntil: '2027-02-10',
      beforeImage: 'https://placehold.co/150x150',
      afterImage: 'https://placehold.co/150x150'
    },
    {
      id: 2,
      category: '전기/조명',
      description: '거실 조명 교체 및 스위치 수리',
      date: '2026-01-28',
      status: 'completed',
      cost: 45000,
      technician: '이기사',
      location: '서울시 강남구 테헤란로 123',
      warrantyUntil: '2027-01-28',
      beforeImage: 'https://placehold.co/150x150',
      afterImage: 'https://placehold.co/150x150'
    },
    {
      id: 3,
      category: '에어컨',
      description: '에어컨 청소 및 필터 교체',
      date: '2026-01-15',
      status: 'warranty',
      cost: 80000,
      technician: '박기사',
      location: '서울시 강남구 테헤란로 123',
      warrantyUntil: '2027-01-15',
      beforeImage: 'https://placehold.co/150x150',
      afterImage: 'https://placehold.co/150x150'
    }
  ];

  // Use real data if available, otherwise use mock data
  const allRepairs = repairs.length > 0 ? repairs : mockRepairs;

  const filteredRepairs = allRepairs.filter(repair => {
    if (filter === 'all') return true;
    return repair.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">수리 이력을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleDownloadWarranty = async (repairId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/warranties/${repairId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download warranty');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warranty-${repairId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download warranty error:', error);
      alert('하자보증보험증권 다운로드에 실패했습니다.');
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { text: '완료', color: 'bg-green-100 text-green-800' },
      warranty: { text: '보증기간', color: 'bg-blue-100 text-blue-800' },
      inProgress: { text: '진행중', color: 'bg-yellow-100 text-yellow-800' }
    };
    const badge = badges[status] || badges.completed;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </button>
            <span className="font-semibold text-gray-900">수리 이력</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">3</span>
            </div>
            <p className="text-gray-600">총 수리 건수</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">3</span>
            </div>
            <p className="text-gray-600">완료된 수리</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">3</span>
            </div>
            <p className="text-gray-600">보증 진행중</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            완료
          </button>
          <button
            onClick={() => setFilter('warranty')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              filter === 'warranty'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            보증기간
          </button>
        </div>

        {/* Repair List */}
        <div className="space-y-6">
          {filteredRepairs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">수리 이력이 없습니다</p>
              <button
                onClick={() => navigate('/estimate')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                첫 수리 요청하기
              </button>
            </div>
          ) : (
            filteredRepairs.map((repair) => (
              <div
                key={repair.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {repair.category}
                        </h3>
                        {getStatusBadge(repair.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{repair.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {repair.date}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {repair.technician}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {repair.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(repair.cost)}
                      </p>
                    </div>
                  </div>

                  {/* Before/After Images */}
                  {(repair.beforeImage || repair.photoUrls) && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-2">수리 전</p>
                        {repair.beforeImage || (repair.photoUrls && repair.photoUrls[0]) ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${repair.beforeImage || repair.photoUrls[0]}`}
                            alt="수리 전"
                            className="w-full aspect-video object-cover bg-gray-200 rounded-lg"
                          />
                        ) : (
                          <div className="aspect-video bg-gray-200 rounded-lg"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">수리 후</p>
                        {repair.afterImage || (repair.photoUrls && repair.photoUrls[1]) ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${repair.afterImage || repair.photoUrls[1]}`}
                            alt="수리 후"
                            className="w-full aspect-video object-cover bg-gray-200 rounded-lg"
                          />
                        ) : (
                          <div className="aspect-video bg-gray-200 rounded-lg"></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warranty Info & Actions */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">보증 기간</p>
                          <p className="text-xs text-gray-600">
                            {repair.warrantyUntil}까지
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setChatRoom({ roomId: String(repair.id), title: `${repair.category} 채팅` })}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>채팅하기</span>
                      </button>
                      <button
                        onClick={() => handleDownloadWarranty(repair.id)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>하자보증보험증권</span>
                      </button>

                      {repair.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/review/write?serviceRequestId=${repair.id}&serviceName=${encodeURIComponent(repair.description)}`)}
                          className="flex-1 px-4 py-2 bg-accent-500 text-white text-sm font-medium rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Star className="w-4 h-4" />
                          <span>리뷰 작성</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {chatRoom && (
        <ChatModal
          roomId={chatRoom.roomId}
          senderType="customer"
          senderName={user?.name || '고객'}
          title={chatRoom.title}
          onClose={() => setChatRoom(null)}
        />
      )}
    </div>
  );
}

export default RepairHistory;
