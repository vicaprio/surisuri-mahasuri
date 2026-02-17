import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, serviceRequestAPI, uploadAPI } from '../api/services';
import { matchingAPI } from '../api/matching';
import BasicAddressInput from '../components/BasicAddressInput';
import {
  Camera,
  Upload,
  X,
  ArrowLeft,
  CheckCircle,
  Loader2,
  FileText,
  Shield,
  Calendar,
  DollarSign
} from 'lucide-react';

function AIEstimate() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: 업로드, 2: 로딩, 3: 결과
  const [category, setCategory] = useState(location.state?.category || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [estimateResult, setEstimateResult] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState('');
  const [addressData, setAddressData] = useState(null);

  const categories = [
    { name: '전기/조명', value: 'ELECTRICAL' },
    { name: '배관/수도', value: 'PLUMBING' },
    { name: '도배/장판', value: 'WALLPAPER' },
    { name: '에어컨', value: 'AIRCON' },
    { name: '목공/가구', value: 'CARPENTRY' },
    { name: '기타수리', value: 'GENERAL' }
  ];

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        console.log('Loaded services:', response.data.data.services);
        setServices(response.data.data.services);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };
    loadServices();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleAddressChange = (data) => {
    setAddress(data.address);
    setAddressData(data);
  };

  const handleSubmit = async () => {
    // Validation
    if (category !== 'GENERAL' && !selectedService) {
      alert('서비스를 선택해주세요.');
      return;
    }

    if (images.length === 0) {
      alert('사진을 업로드해주세요.');
      return;
    }

    if (!address) {
      alert('서비스 지역을 선택해주세요.');
      return;
    }

    if (category === 'GENERAL' && !description) {
      alert('기타수리의 경우 상세 설명을 입력해주세요.');
      return;
    }

    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // Step 2: 로딩 시작
    setStep(2);

    try {
      // Upload images first
      let photoUrls = [];
      if (images.length > 0) {
        const files = images.map(img => img.file);
        const uploadResponse = await uploadAPI.multiple(files);
        photoUrls = uploadResponse.data.data.map(file => file.url);
      }

      // Simple geocoding - default to Seoul City Hall coordinates
      // In production, use Kakao Local API or Google Geocoding API
      const latitude = 37.5665;
      const longitude = 126.9780;

      // Create service request
      const requestData = {
        serviceId: selectedService?.id || null,
        address: address,
        addressDetail: '', // 상세 주소는 매칭 확정 후 입력
        latitude: latitude,
        longitude: longitude,
        description: description || '사진을 참고해주세요',
        photoUrls: photoUrls,
        requestType: 'ASAP',
        category: category // Include category for requests without serviceId
      };

      const response = await serviceRequestAPI.create(requestData);
      const serviceRequest = response.data.data;

      // Create estimate result from service request
      const estimate = {
        requestId: serviceRequest.id,
        requestNumber: serviceRequest.requestNumber,
        estimatedCost: {
          min: Math.floor(serviceRequest.estimatedCost * 0.8),
          max: Math.ceil(serviceRequest.estimatedCost * 1.2),
          average: serviceRequest.estimatedCost
        },
        laborCost: Math.floor(serviceRequest.estimatedCost * 0.6),
        materialCost: Math.floor(serviceRequest.estimatedCost * 0.4),
        estimatedTime: selectedService
          ? `${Math.floor(selectedService.estimatedDuration / 60)}-${Math.ceil(selectedService.estimatedDuration / 60)}시간`
          : '현장 확인 후 결정',
        difficulty: selectedService
          ? (selectedService.difficulty === 'A' ? '낮음' : selectedService.difficulty === 'B' ? '중간' : '높음')
          : '현장 확인 필요',
        urgency: '일반',
        confidence: selectedService ? 85 : 70,
        serviceName: selectedService?.name || '기타 수리',
        recommendations: [
          '전문가 현장 확인 후 정확한 견적 제공',
          '추가 손상 방지를 위해 빠른 조치 권장',
          selectedService
            ? `정품 부품 사용 시 품질 보증 ${selectedService.warrantyDays}일 제공`
            : '작업 완료 후 품질 보증 제공'
        ],
        detectedIssues: [
          selectedService
            ? `${selectedService.category} 관련 작업 필요`
            : '상세 설명 및 사진 기반 작업 필요',
          '현장 확인 후 추가 작업 필요 여부 판단',
          '전문 기사님 배정 진행 중'
        ]
      };

      setEstimateResult(estimate);
      setStep(3);
    } catch (error) {
      console.error('Service request error:', error);
      alert('견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep(1);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </button>
            <span className="font-semibold text-gray-900">AI 견적 요청</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">정보 입력</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">AI 분석</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">견적 확인</span>
            </div>
          </div>
        </div>

        {/* Step 1: 정보 입력 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                수리 정보를 입력해주세요
              </h2>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수리 카테고리 *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    console.log('Category changed to:', newCategory);
                    console.log('Services for this category:', services.filter(s => s.category === newCategory));
                    setCategory(newCategory);
                    setSelectedService(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">선택해주세요</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Service Selection */}
              {category && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 선택 {category === 'GENERAL' ? '(선택사항)' : '*'}
                    {selectedService && <span className="text-green-600 ml-2">✓ 선택됨: {selectedService.name}</span>}
                    {!selectedService && category !== 'GENERAL' && (
                      <span className="text-red-600 ml-2">
                        (아래에서 서비스를 선택해주세요)
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {category === 'GENERAL'
                      ? '기타수리는 서비스를 선택하지 않아도 접수 가능합니다. 상세 설명과 사진을 자세히 작성해주세요.'
                      : `총 ${services.filter(s => s.category === category).length}개 서비스 중 하나를 선택하세요`
                    }
                  </p>
                  {services.filter(s => s.category === category).length === 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      ⚠️ 해당 카테고리의 서비스를 불러오는 중입니다...
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    {services
                      .filter(service => service.category === category)
                      .map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            console.log('Service selected:', service);
                            setSelectedService(service);
                          }}
                          className={`text-left p-4 border-2 rounded-lg transition-all ${
                            selectedService?.id === service.id
                              ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-300'
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>예상 {Math.floor(service.estimatedDuration / 60)}시간</span>
                                <span>난이도: {service.difficulty}</span>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-lg font-bold text-primary-600">
                                {new Intl.NumberFormat('ko-KR').format(service.basePrice)}원
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Address Input */}
              <div className="mb-6">
                <BasicAddressInput
                  address={address}
                  onAddressChange={handleAddressChange}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 싱크대 배수구에서 물이 새고 있습니다."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-32 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사진 업로드 * (최대 5장)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">사진을 업로드해주세요</p>
                  <p className="text-sm text-gray-500 mb-4">
                    명확한 사진일수록 정확한 견적을 받을 수 있습니다
                  </p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    사진 선택
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Debug Info */}
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
                <p><strong>버튼 활성화 조건:</strong></p>
                <ul className="mt-2 space-y-1">
                  {category !== 'GENERAL' && (
                    <li className={selectedService ? 'text-green-600' : 'text-red-600'}>
                      ✓ 서비스 선택: {selectedService ? '완료' : '미완료'}
                    </li>
                  )}
                  {category === 'GENERAL' && (
                    <li className="text-gray-600">
                      ✓ 서비스 선택: {selectedService ? '완료 (선택됨)' : '선택사항 (건너뜀)'}
                    </li>
                  )}
                  <li className={images.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    ✓ 사진 업로드: {images.length > 0 ? `${images.length}장` : '미완료'}
                  </li>
                  <li className={address ? 'text-green-600' : 'text-red-600'}>
                    ✓ 서비스 지역 선택: {address ? '완료' : '미완료'}
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  (category !== 'GENERAL' && !selectedService) ||
                  images.length === 0 ||
                  !address
                }
                className="w-full py-4 bg-accent-500 text-white text-lg font-semibold rounded-xl hover:bg-accent-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                AI 견적 받기
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">안심하세요!</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• AI 예상 견적은 무료로 제공됩니다</li>
                    <li>• 정확한 견적은 전문가 현장 확인 후 확정됩니다</li>
                    <li>• 개인정보는 안전하게 보호됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI 분석 중 */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI가 견적을 분석하고 있습니다
            </h2>
            <p className="text-gray-600 mb-8">
              업로드하신 사진을 바탕으로 최적의 견적을 산출하는 중입니다.
              잠시만 기다려주세요...
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>분석 진행률</span>
                <span>85%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 견적 결과 */}
        {step === 3 && estimateResult && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">견적 요청이 접수되었습니다! 🎉</h3>
                <p className="text-sm text-gray-700 mb-2">
                  AI가 예상 견적을 산출했습니다. 전문가가 확인 후 연락드릴 예정입니다.
                  <br />
                  수리 이력 페이지에서 진행 상황을 확인하실 수 있습니다.
                </p>
                {estimateResult.requestNumber && (
                  <p className="text-xs text-gray-500">
                    요청 번호: <span className="font-mono font-semibold">{estimateResult.requestNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-7 h-7 text-primary-600 mr-2" />
                예상 견적
              </h2>

              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8 mb-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">AI 신뢰도 {estimateResult.confidence}%</p>
                  <div className="text-5xl font-bold text-primary-900 mb-2">
                    {formatCurrency(estimateResult.estimatedCost.average)}
                  </div>
                  <p className="text-gray-600">
                    {formatCurrency(estimateResult.estimatedCost.min)} ~ {formatCurrency(estimateResult.estimatedCost.max)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">인건비</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(estimateResult.laborCost)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">재료비</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(estimateResult.materialCost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">예상 소요시간</p>
                  <p className="font-semibold text-gray-900">{estimateResult.estimatedTime}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">난이도</p>
                  <p className="font-semibold text-gray-900">{estimateResult.difficulty}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">긴급도</p>
                  <p className="font-semibold text-gray-900">{estimateResult.urgency}</p>
                </div>
              </div>

              {/* Detected Issues */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">발견된 문제점</h3>
                <ul className="space-y-2">
                  {estimateResult.detectedIssues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">권장사항</h3>
                <ul className="space-y-2">
                  {estimateResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setImages([]);
                    setDescription('');
                    setEstimateResult(null);
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  다시 요청하기
                </button>
                <button
                  onClick={async () => {
                    try {
                      // 자동 매칭 시작
                      const response = await matchingAPI.startAutoMatch(estimateResult.requestId);
                      console.log('Matching started:', response.data);
                      // 매칭 상태 페이지로 이동
                      navigate('/matching-status', {
                        state: { serviceRequestId: estimateResult.requestId }
                      });
                    } catch (error) {
                      console.error('Failed to start matching:', error);
                      const errorMsg = error.response?.data?.error || '매칭 시작에 실패했습니다.';
                      alert(`${errorMsg} 수리 이력에서 다시 시도해주세요.`);
                      navigate('/history');
                    }
                  }}
                  className="flex-1 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
                >
                  전문가 매칭 시작하기
                </button>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <Shield className="w-8 h-8 text-primary-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">마하수리 보증 프로그램</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ 디지털 AS 하자이행보증서 자동 발행</li>
                    <li>✓ 정품 부품 사용 인증</li>
                    <li>✓ 에스크로 결제로 안심 거래</li>
                    <li>✓ 작업 후 1년 품질 보증</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIEstimate;
