import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { technicianAPI, reviewAPI } from '../api/services';
import {
  ArrowLeft,
  Star,
  Award,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Briefcase,
  ThumbsUp,
  TrendingUp,
  User,
  Loader2
} from 'lucide-react';

function TechnicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews'); // reviews, certifications

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [techResponse, reviewResponse, statsResponse] = await Promise.all([
          technicianAPI.getById(id),
          reviewAPI.getByTechnician(id),
          reviewAPI.getStatistics(id)
        ]);

        setTechnician(techResponse.data.data);
        setReviews(reviewResponse.data.data.reviews || []);
        setReviewStats(reviewResponse.data.data.statistics || statsResponse.data.data);
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('정보를 불러올 수 없습니다.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">기사님 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return null;
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
            <span className="font-semibold text-gray-900">기사님 프로필</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                {technician.profileImage ? (
                  <img
                    src={technician.profileImage}
                    alt={technician.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              {technician.isAvailable && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{technician.name}</h1>
                {technician.stats.totalJobs >= 50 && (
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    베테랑
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                {renderStars(technician.stats.rating)}
                <span className="text-lg font-semibold text-gray-900">
                  {technician.stats.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({technician.stats.totalJobs}건)
                </span>
              </div>
              <p className="text-gray-600 mb-4">{technician.bio}</p>
              <div className="flex flex-wrap gap-2">
                {technician.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Button */}
            <div className="flex flex-col space-y-2">
              <span
                className={`px-4 py-2 rounded-lg text-center font-medium ${
                  technician.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {technician.isAvailable ? '작업 가능' : '작업중'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                {technician.stats.totalJobs}
              </span>
            </div>
            <p className="text-sm text-gray-600">완료 건수</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {technician.stats.acceptanceRate}%
              </span>
            </div>
            <p className="text-sm text-gray-600">수락률</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {technician.stats.ontimeRate}%
              </span>
            </div>
            <p className="text-sm text-gray-600">정시 도착률</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-accent-600" />
              <span className="text-2xl font-bold text-gray-900">
                {technician.stats.completionRate}%
              </span>
            </div>
            <p className="text-sm text-gray-600">완료율</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                리뷰 ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('certifications')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'certifications'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                자격증 ({technician.certifications.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* Review Statistics */}
                {reviewStats && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">
                          {reviewStats.avgServiceQuality}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">서비스 품질</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">
                          {reviewStats.avgTechnicianRating}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">친절도</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">
                          {reviewStats.avgCleanliness}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">청결도</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">
                          {reviewStats.avgPunctuality}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">시간엄수</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {reviewStats.photoReviewPercentage}%
                        </p>
                        <p className="text-xs text-gray-600 mt-1">사진리뷰</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">아직 리뷰가 없습니다</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {review.userName}
                              </span>
                              {renderStars(review.rating)}
                              {review.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>

                        {/* Rating Details */}
                        <div className="flex space-x-4 mb-3 text-xs text-gray-600">
                          <span>품질 {review.serviceQuality}</span>
                          <span>친절 {review.technicianRating}</span>
                          <span>청결 {review.cleanliness}</span>
                          <span>시간 {review.punctuality}</span>
                        </div>

                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        {/* Review Photos */}
                        {review.photoUrls && review.photoUrls.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {review.photoUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`}
                                alt={`Review photo ${idx + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        <div className="inline-block px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-lg">
                          {review.serviceName}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                {technician.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <Award className="w-10 h-10 text-primary-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cert.issuer} · {cert.year}년
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicianProfile;
