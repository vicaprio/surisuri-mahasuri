import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadAPI } from '../api/services';
import {
  ArrowLeft,
  Star,
  Camera,
  X,
  CheckCircle,
  Loader2,
  Upload
} from 'lucide-react';

function WriteReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const serviceRequestId = searchParams.get('serviceRequestId');
  const serviceName = searchParams.get('serviceName') || '수리 서비스';

  const [ratings, setRatings] = useState({
    overall: 0,
    serviceQuality: 0,
    technicianRating: 0,
    cleanliness: 0,
    punctuality: 0
  });
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({});

  const ratingCategories = [
    { key: 'overall', label: '전체 만족도', description: '전반적인 서비스에 대한 평가' },
    { key: 'serviceQuality', label: '서비스 품질', description: '작업 결과의 완성도' },
    { key: 'technicianRating', label: '기사님 친절도', description: '전문성과 친절함' },
    { key: 'cleanliness', label: '작업 청결도', description: '정리정돈 및 청소 상태' },
    { key: 'punctuality', label: '시간 엄수', description: '약속 시간 준수 여부' }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    // Validation
    if (ratings.overall === 0) {
      alert('전체 만족도를 선택해주세요.');
      return;
    }

    if (Object.values(ratings).some(r => r === 0)) {
      alert('모든 항목의 별점을 선택해주세요.');
      return;
    }

    if (images.length === 0) {
      alert('최소 1장의 사진을 업로드해주세요.');
      return;
    }

    if (comment.trim().length < 10) {
      alert('리뷰 내용을 10자 이상 작성해주세요.');
      return;
    }

    setLoading(true);

    try {
      // Upload images
      const files = images.map(img => img.file);
      const uploadResponse = await uploadAPI.multiple(files);
      const photoUrls = uploadResponse.data.data.map(file => file.url);

      // Submit review
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceRequestId,
          rating: ratings.overall,
          serviceQuality: ratings.serviceQuality,
          technicianRating: ratings.technicianRating,
          cleanliness: ratings.cleanliness,
          punctuality: ratings.punctuality,
          comment: comment.trim(),
          photoUrls
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Success
      alert('리뷰가 등록되었습니다!');
      navigate('/history');
    } catch (error) {
      console.error('Submit review error:', error);
      alert('리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (categoryKey) => {
    const currentRating = ratings[categoryKey];
    const hovered = hoveredRating[categoryKey] || 0;

    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings({ ...ratings, [categoryKey]: star })}
            onMouseEnter={() => setHoveredRating({ ...hoveredRating, [categoryKey]: star })}
            onMouseLeave={() => setHoveredRating({ ...hoveredRating, [categoryKey]: 0 })}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hovered || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">
          {currentRating > 0 ? currentRating.toFixed(1) : '-'}
        </span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            로그인하기
          </button>
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
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
            <span className="font-semibold text-gray-900">리뷰 작성</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{serviceName}</h2>
          <p className="text-sm text-gray-600">서비스 만족도를 평가해주세요</p>
        </div>

        {/* Rating Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">별점 평가</h3>
          <div className="space-y-6">
            {ratingCategories.map((category) => (
              <div key={category.key} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                {renderStars(category.key)}
              </div>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            사진 등록 <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            최소 1장 이상의 사진을 등록해주세요 (최대 5장)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">사진 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            리뷰 작성 <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            자세한 리뷰는 다른 고객에게 큰 도움이 됩니다 (최소 10자)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="서비스 경험을 자세히 알려주세요&#10;&#10;예시:&#10;- 어떤 점이 좋았나요?&#10;- 개선이 필요한 점은 무엇인가요?&#10;- 다른 고객에게 추천하고 싶은 이유는?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows="8"
          />
          <p className="text-sm text-gray-500 mt-2">
            {comment.length} / 최소 10자
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || ratings.overall === 0 || images.length === 0 || comment.trim().length < 10}
          className="w-full py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>등록 중...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6" />
              <span>리뷰 등록하기</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          작성하신 리뷰는 수정 및 삭제가 불가능하니 신중하게 작성해주세요.
        </p>
      </div>
    </div>
  );
}

export default WriteReview;
