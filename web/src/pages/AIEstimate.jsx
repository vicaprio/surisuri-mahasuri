import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, serviceRequestAPI, uploadAPI, aiAPI } from '../api/services';
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
  DollarSign,
  MapPin
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
  const [photoUrls, setPhotoUrls] = useState([]); // 업로드된 사진 URL (서비스 요청 생성 전 보관)
  const [restoredFromLogin, setRestoredFromLogin] = useState(false); // 로그인 후 복원 여부
  const [isStartingMatch, setIsStartingMatch] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false); // 매칭 전 주소 수집 모달
  const [addressForMatching, setAddressForMatching] = useState('');

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

  // 로그인 후 돌아온 경우: localStorage에 저장된 견적 데이터 복원
  // - localStorage 사용: OAuth 외부 리다이렉트에서도 데이터 유지
  // - useEffect에서 즉시 삭제하지 않음: React StrictMode 이중 실행 대응
  useEffect(() => {
    const pending = localStorage.getItem('pendingEstimate');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setEstimateResult(data.estimateResult);
        setPhotoUrls(data.photoUrls);
        setStep(3);
        setRestoredFromLogin(true);
        localStorage.removeItem('pendingReturnTo');
      } catch (e) {
        console.error('Failed to restore pending estimate:', e);
        localStorage.removeItem('pendingEstimate');
      }
    }
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

    if (category === 'GENERAL' && !description) {
      alert('기타수리의 경우 상세 설명을 입력해주세요.');
      return;
    }

    // 로그인 체크 없이 AI 분석 진행 — 매칭 시점에 로그인 요청

    // Step 2: 로딩 시작
    setStep(2);

    try {
      // Upload images first
      let uploadedPhotoUrls = [];
      if (images.length > 0) {
        const files = images.map(img => img.file);
        const uploadResponse = await uploadAPI.multiple(files);
        uploadedPhotoUrls = uploadResponse.data.data.map(file => file.url);
      }
      setPhotoUrls(uploadedPhotoUrls);

      // Call AI analysis
      let aiResult = null;
      try {
        const aiResponse = await aiAPI.analyzeEstimate({
          photoUrls: uploadedPhotoUrls,
          description,
          category,
          serviceName: selectedService?.name || null,
        });
        aiResult = aiResponse.data.data;
      } catch (aiError) {
        console.error('AI analysis failed, using fallback:', aiError);
      }

      // Build estimate result from AI (서비스 요청은 매칭 시작 시 생성)
      const fallbackCost = selectedService?.basePrice || 100000;
      const avgCost = aiResult
        ? Math.round((aiResult.estimatedMinCost + aiResult.estimatedMaxCost) / 2)
        : fallbackCost;

      const estimate = {
        // requestId/requestNumber는 매칭 시작(로그인 후) 시점에 생성됨
        summary: aiResult?.summary || null,
        estimatedCost: {
          min: aiResult?.estimatedMinCost ?? Math.floor(fallbackCost * 0.8),
          max: aiResult?.estimatedMaxCost ?? Math.ceil(fallbackCost * 1.2),
          average: avgCost,
        },
        laborCost: Math.floor(avgCost * 0.6),
        materialCost: Math.floor(avgCost * 0.4),
        estimatedTime: aiResult?.estimatedTime ?? (selectedService
          ? formatDuration(selectedService.estimatedDuration)
          : '현장 확인 후 결정'),
        difficulty: aiResult?.difficulty ?? (selectedService
          ? (selectedService.difficulty === 'A' ? '낮음' : selectedService.difficulty === 'B' ? '중간' : '높음')
          : '현장 확인 필요'),
        urgency: aiResult?.urgency ?? '일반',
        confidence: aiResult ? 92 : (selectedService ? 85 : 70),
        serviceName: selectedService?.name || '기타 수리',
        recommendations: aiResult?.recommendations ?? [
          '전문가 현장 확인 후 정확한 견적 제공',
          '추가 손상 방지를 위해 빠른 조치 권장',
          selectedService
            ? `정품 부품 사용 시 품질 보증 ${selectedService.warrantyDays}일 제공`
            : '작업 완료 후 품질 보증 제공',
        ],
        detectedIssues: aiResult?.detectedIssues ?? [
          selectedService ? `${selectedService.category} 관련 작업 필요` : '상세 설명 및 사진 기반 작업 필요',
          '현장 확인 후 추가 작업 필요 여부 판단',
          '전문 기사님 배정 진행 중',
        ],
        // 서비스 요청 생성에 필요한 폼 데이터 보관
        _formData: {
          serviceId: selectedService?.id || null,
          address,
          description: description || '사진을 참고해주세요',
          category,
          requestType: 'ASAP',
        },
      };

      setEstimateResult(estimate);
      setStep(3);
    } catch (error) {
      console.error('Estimate error:', error);
      alert('견적 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep(1);
    }
  };

  // 로그인 후 복원된 경우 또는 로그인 상태에서 매칭 시작
  const startMatchingWithData = async (estimate, urls, addressOverride = null) => {
    setIsStartingMatch(true);
    localStorage.removeItem('pendingEstimate'); // 매칭 시작 시 저장 데이터 정리
    try {
      const formData = estimate._formData;
      const requestData = {
        serviceId: formData.serviceId,
        address: addressOverride || formData.address || '주소 미입력',
        addressDetail: '',
        latitude: 37.5665,
        longitude: 126.9780,
        description: formData.description,
        photoUrls: urls,
        requestType: formData.requestType,
        category: formData.category,
      };

      const response = await serviceRequestAPI.create(requestData);
      const serviceRequest = response.data.data;

      const matchResponse = await matchingAPI.startAutoMatch(serviceRequest.id);
      console.log('Matching started:', matchResponse.data);

      navigate('/matching-status', {
        state: { serviceRequestId: serviceRequest.id }
      });
    } catch (error) {
      console.error('Failed to start matching:', error);
      const errorMsg = error.response?.data?.error || '매칭 시작에 실패했습니다.';
      alert(`${errorMsg} 수리 이력에서 다시 시도해주세요.`);
      setIsStartingMatch(false);
    }
  };

  const handleStartMatching = async () => {
    try {
      if (!user) {
        try {
          localStorage.setItem('pendingEstimate', JSON.stringify({
            estimateResult,
            photoUrls,
          }));
          localStorage.setItem('pendingReturnTo', '/ai-estimate');
        } catch (e) {
          console.error('Failed to save estimate to localStorage:', e);
        }
        // window.location.href 사용: 모바일에서 navigate()보다 안정적
        window.location.href = '/login';
        return;
      }
      // 주소가 없는 경우 매칭 전 수집
      const currentAddress = estimateResult?._formData?.address;
      if (!currentAddress) {
        setShowAddressModal(true);
        return;
      }
      await startMatchingWithData(estimateResult, photoUrls);
    } catch (e) {
      console.error('handleStartMatching error:', e);
      alert('오류가 발생했습니다. 다시 시도해주세요.\n' + e.message);
    }
  };

  const handleAddressModalConfirm = async () => {
    if (!addressForMatching.trim()) {
      alert('지역을 입력해주세요.');
      return;
    }
    setShowAddressModal(false);
    await startMatchingWithData(estimateResult, photoUrls, addressForMatching.trim());
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}분`;
    if (m === 0) return `${h}시간`;
    return `${h}시간 ${m}분`;
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
                                <span>예상 {formatDuration(service.estimatedDuration)}</span>
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

              {/* Address Input - 로그인 상태에서만 표시 */}
              {user && (
                <div className="mb-6">
                  <BasicAddressInput
                    address={address}
                    onAddressChange={handleAddressChange}
                  />
                </div>
              )}

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

              <button
                onClick={handleSubmit}
                disabled={
                  (category !== 'GENERAL' && !selectedService) ||
                  images.length === 0
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
            {/* Success / Restored Message */}
            {restoredFromLogin ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center">
                <CheckCircle className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">로그인이 완료되었습니다!</h3>
                  <p className="text-sm text-gray-700">
                    이전에 분석한 견적을 불러왔습니다. 아래에서 전문가 매칭을 시작해보세요.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">AI 견적 분석이 완료되었습니다! 🎉</h3>
                  <p className="text-sm text-gray-700">
                    AI가 예상 견적을 산출했습니다. 전문가 매칭을 시작하시면 가장 적합한 기사님을 연결해드립니다.
                  </p>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {estimateResult.summary && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">AI 분석 요약</h2>
                <p className="text-gray-700">{estimateResult.summary}</p>
              </div>
            )}

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
                    localStorage.removeItem('pendingEstimate');
                    setStep(1);
                    setImages([]);
                    setDescription('');
                    setEstimateResult(null);
                    setPhotoUrls([]);
                    setRestoredFromLogin(false);
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  다시 요청하기
                </button>
                <button
                  onClick={handleStartMatching}
                  disabled={isStartingMatch}
                  className="flex-1 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isStartingMatch ? '매칭 시작 중...' : user ? '전문가 매칭 시작하기' : '로그인 후 전문가 매칭하기'}
                </button>
              </div>
              {!user && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  매칭 시작 시 로그인이 필요합니다(구글, 네이버, 카카오 간편 로그인). 입력하신 견적 정보는 로그인 후에도 유지됩니다.
                </p>
              )}
            </div>

            {/* Warranty Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <Shield className="w-8 h-8 text-primary-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">마하수리 보증 프로그램</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ 이행(하자)보증보험증권 자동 발행</li>
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

      {/* 주소 수집 모달 - 주소 없이 매칭 시작할 때 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-3">
                <MapPin className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">서비스 지역을 알려주세요</h3>
              <p className="text-sm text-gray-500">
                가까운 전문가 매칭을 위해 대략적인 지역이 필요합니다.<br/>
                상세 주소는 매칭 확정 후 입력하시면 됩니다.
              </p>
            </div>
            <input
              type="text"
              value={addressForMatching}
              onChange={(e) => setAddressForMatching(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressModalConfirm()}
              placeholder="예: 서울 강남구, 부산 해운대구"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
              autoFocus
            />
            <div className="space-y-2">
              <button
                onClick={handleAddressModalConfirm}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                매칭 시작하기
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIEstimate;
