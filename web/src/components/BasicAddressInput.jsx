import { useState } from 'react';
import { MapPin, Search, Lock } from 'lucide-react';

function BasicAddressInput({ address, onAddressChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 기본 주소만 사용 (시/구/동 레벨)
        const basicAddress = data.address; // 예: "서울 강남구 역삼동"
        const district = data.sido + ' ' + data.sigungu + ' ' + data.bname;

        // 부모 컴포넌트에 기본 주소만 전달
        onAddressChange({
          address: basicAddress,
          district: district, // 시/구/동 레벨
          zonecode: data.zonecode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          sido: data.sido,
          sigungu: data.sigungu,
          bname: data.bname,
        });

        setIsOpen(false);
      },
      onclose: function() {
        setIsOpen(false);
      },
      width: '100%',
      height: '100%',
    }).open();
    setIsOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* 주소 검색 버튼 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 지역(우선 동네만 알려주세요) <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={address || ''}
            readOnly
            placeholder="주소 검색 버튼을 클릭해주세요"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSearchAddress}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
          >
            <Search className="w-5 h-5" />
            <span>주소 검색</span>
          </button>
        </div>
      </div>

      {/* 주소 미리보기 */}
      {address && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm flex-1">
              <p className="font-medium text-gray-900">{address}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                견적 산출용이며, 매칭 확정 전까지 기사님에게 공개되지 않습니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          💡 <strong>상세 주소는 매칭 확정 후 입력하시면 됩니다.</strong><br/>
          현재는 견적 산출을 위한 대략적인 지역만 필요합니다.
        </p>
      </div>
    </div>
  );
}

export default BasicAddressInput;
