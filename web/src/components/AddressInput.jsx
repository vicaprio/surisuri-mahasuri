import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

function AddressInput({ address, addressDetail, onAddressChange, onAddressDetailChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 선택한 주소 데이터 처리
        let fullAddress = data.address;
        let extraAddress = '';

        // 건물명이 있는 경우 추가
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
        }

        // 부모 컴포넌트에 주소 전달
        onAddressChange({
          address: fullAddress,
          zonecode: data.zonecode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
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
          주소 <span className="text-red-500">*</span>
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

      {/* 상세 주소 입력 */}
      {address && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 주소 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={addressDetail || ''}
              onChange={(e) => onAddressDetailChange(e.target.value)}
              placeholder="동/호수를 입력해주세요 (예: 101동 1001호)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* 주소 미리보기 */}
      {address && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{address}</p>
              {addressDetail && (
                <p className="text-gray-600 mt-1">{addressDetail}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressInput;
