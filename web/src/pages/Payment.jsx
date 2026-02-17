import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  Shield,
  Lock,
  Loader2
} from 'lucide-react';

function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('CARD');

  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount') || '0');
  const serviceName = searchParams.get('serviceName') || '수리 서비스';

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  const paymentMethods = [
    { id: 'CARD', name: '신용/체크카드', icon: CreditCard, description: '간편하고 빠른 결제' },
    { id: 'TRANSFER', name: '계좌이체', icon: Building2, description: '은행 계좌로 직접 이체' },
    { id: 'MOBILE', name: '휴대폰 결제', icon: Smartphone, description: '휴대폰 소액결제' }
  ];

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, call actual payment API
      const paymentData = {
        orderId: orderId,
        paymentKey: `PAY${Date.now()}`,
        amount: amount,
        method: selectedMethod
      };

      // Navigate to success page
      navigate(`/payment/success?orderId=${orderId}&amount=${amount}&method=${selectedMethod}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  if (!user) {
    return null;
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
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
            <span className="font-semibold text-gray-900">결제하기</span>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">결제 수단 선택</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={loading}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedMethod === method.id ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <method.icon className={`w-6 h-6 ${
                          selectedMethod === method.id ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">안전한 결제</p>
                  <p className="text-sm text-blue-700">
                    모든 결제 정보는 암호화되어 안전하게 처리됩니다.
                    마하수리는 PG사를 통해 안전한 결제를 보장합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">주문 정보</h3>

              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">서비스</span>
                  <span className="font-medium text-gray-900">{serviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-medium text-gray-900">{orderId}</span>
                </div>
              </div>

              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">서비스 금액</span>
                  <span className="text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">부가세 (VAT)</span>
                  <span className="text-gray-900">포함</span>
                </div>
              </div>

              <div className="pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-semibold">최종 결제금액</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>결제 처리 중...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>{formatCurrency(amount)} 결제하기</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                결제 진행 시 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
