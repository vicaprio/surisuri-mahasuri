import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, FileText, Download } from 'lucide-react';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount') || '0');
  const method = searchParams.get('method') || 'CARD';

  useEffect(() => {
    // Confetti effect (optional)
    console.log('Payment successful!', { orderId, amount, method });
  }, [orderId, amount, method]);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  };

  const getMethodName = (methodId) => {
    const methods = {
      CARD: '신용/체크카드',
      TRANSFER: '계좌이체',
      MOBILE: '휴대폰 결제'
    };
    return methods[methodId] || methodId;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="relative text-center mb-8">
          {/* Character (문서+세척기) — 결제/보증서 발급 */}
          <img
            src="/char-washer.png"
            alt=""
            className="absolute top-0 right-0 hidden sm:block pointer-events-none"
            style={{ height: '130px', width: 'auto', opacity: 0.9 }}
          />
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            결제가 완료되었습니다!
          </h1>
          <p className="text-lg text-gray-600">
            기사님이 곧 배정될 예정입니다.
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">주문번호</span>
              <span className="font-medium text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">결제 수단</span>
              <span className="font-medium text-gray-900">{getMethodName(method)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">결제 일시</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">다음 단계</h3>
          <ol className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>2시간 이내에 가까운 기사님이 자동으로 배정됩니다.</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>기사님 배정 시 알림과 문자로 안내드립니다.</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>작업 완료 후 디지털 하자보증보험증권이 자동 발급됩니다.</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-primary-300 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">수리 이력 보기</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">홈으로 가기</span>
          </button>
        </div>

        {/* Receipt Download */}
        <div className="text-center mt-6">
          <button
            onClick={() => alert('영수증 다운로드 기능 준비중입니다.')}
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>영수증 다운로드</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
