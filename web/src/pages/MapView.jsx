import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { matchingAPI } from '../api/matching';
import {
  ArrowLeft, Crosshair, MapPin, Loader2,
  RefreshCw, X, DollarSign, AlertCircle
} from 'lucide-react';

const CATEGORY = {
  ELECTRICAL: { color: '#EAB308', label: '전기/조명', emoji: '⚡' },
  PLUMBING:   { color: '#3B82F6', label: '배관/수도', emoji: '💧' },
  WALLPAPER:  { color: '#22C55E', label: '도배/장판', emoji: '🎨' },
  AIRCON:     { color: '#06B6D4', label: '에어컨',   emoji: '❄️' },
  CARPENTRY:  { color: '#F97316', label: '목공/가구', emoji: '🪚' },
  GENERAL:    { color: '#6B7280', label: '기타수리', emoji: '🔧' },
};

const FILTERS = [
  { key: 'ALL',       label: '전체',   emoji: '🗺️' },
  { key: 'ELECTRICAL',label: '전기',   emoji: '⚡' },
  { key: 'PLUMBING',  label: '배관',   emoji: '💧' },
  { key: 'WALLPAPER', label: '도배',   emoji: '🎨' },
  { key: 'AIRCON',    label: '에어컨', emoji: '❄️' },
  { key: 'CARPENTRY', label: '목공',   emoji: '🪚' },
  { key: 'GENERAL',   label: '기타',   emoji: '🔧' },
];

// Haversine 거리 계산 (km)
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function MapView() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const mapRef      = useRef(null);   // DOM div
  const mapObj      = useRef(null);   // kakao.maps.Map instance
  const overlaysRef = useRef([]);     // CustomOverlay 목록

  const [sdkReady,     setSdkReady]     = useState(false);
  const [keyMissing,   setKeyMissing]   = useState(false);
  const [jobs,         setJobs]         = useState([]);
  const [filter,       setFilter]       = useState('ALL');
  const [myLoc,        setMyLoc]        = useState(null);   // { lat, lng }
  const [selectedJob,  setSelectedJob]  = useState(null);
  const [accepting,    setAccepting]    = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [fetchError,   setFetchError]   = useState(false);

  // ─── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  // ─── Kakao Maps SDK 동적 로드 ──────────────────────────────────
  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!key) { setKeyMissing(true); return; }

    if (window.kakao?.maps) { setSdkReady(true); return; }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.onload  = () => window.kakao.maps.load(() => setSdkReady(true));
    script.onerror = () => setKeyMissing(true);
    document.head.appendChild(script);
  }, []);

  // ─── 지도 초기화 (SDK 준비 후) ────────────────────────────────
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;

    const K = window.kakao.maps;
    const defaultCenter = new K.LatLng(37.5665, 126.9780); // 서울시청 기본값
    mapObj.current = new K.Map(mapRef.current, {
      center: defaultCenter,
      level: 5,
    });

    // 현위치 요청
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude: lat, longitude: lng } }) => {
          setMyLoc({ lat, lng });
          const pos = new K.LatLng(lat, lng);
          mapObj.current.setCenter(pos);
          placeMyLocationOverlay(pos);

          // 기사님 위치 백엔드 업데이트 (조용히 실패 허용)
          apiClient.patch('/map/location', { latitude: lat, longitude: lng }).catch(() => {});
        },
        () => {} // 권한 거부 시 서울시청 유지
      );
    }

    fetchJobs();
  }, [sdkReady]);

  // ─── 내 위치 마커 (파란 원) ────────────────────────────────────
  const placeMyLocationOverlay = (latLng) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="position:relative;width:22px;height:22px">
        <div style="position:absolute;inset:0;background:#3B82F6;border-radius:50%;opacity:0.25;animation:ripple 2s ease-out infinite"></div>
        <div style="position:absolute;inset:4px;background:#3B82F6;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(59,130,246,0.5)"></div>
      </div>`;
    new window.kakao.maps.CustomOverlay({
      position: latLng,
      content: div,
      yAnchor: 0.5,
      zIndex: 10,
    }).setMap(mapObj.current);
  };

  // ─── 일감 마커 그리기 ─────────────────────────────────────────
  const drawMarkers = useCallback((jobList) => {
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    if (!mapObj.current) return;

    jobList.forEach(job => {
      if (!job.latitude || !job.longitude) return;
      const cfg  = CATEGORY[job.category] || CATEGORY.GENERAL;
      const pos  = new window.kakao.maps.LatLng(job.latitude, job.longitude);

      const div = document.createElement('div');
      div.style.cssText = 'position:relative;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.25))';
      div.innerHTML = `
        <div style="
          width:44px;height:44px;
          background:${cfg.color};
          border-radius:50%;
          border:3px solid white;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;
          transition:transform .15s;
        ">${cfg.emoji}</div>
        <div style="
          position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);
          border-left:9px solid transparent;border-right:9px solid transparent;
          border-top:11px solid ${cfg.color};
        "></div>`;

      div.addEventListener('mouseenter', () => { div.firstElementChild.style.transform = 'scale(1.15)'; });
      div.addEventListener('mouseleave', () => { div.firstElementChild.style.transform = 'scale(1)'; });
      div.addEventListener('click', () => setSelectedJob(job));

      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos, content: div, yAnchor: 1.25, zIndex: 5,
      });
      overlay.setMap(mapObj.current);
      overlaysRef.current.push(overlay);
    });
  }, []);

  // ─── 일감 데이터 fetch ────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      setFetchError(false);
      const res  = await apiClient.get('/map/jobs');
      const data = res.data.data || [];
      setJobs(data);
      setLastUpdated(new Date());
    } catch {
      setFetchError(true);
    }
  }, []);

  // ─── filter 변경 시 마커 재렌더 ───────────────────────────────
  useEffect(() => {
    const visible = filter === 'ALL' ? jobs : jobs.filter(j => j.category === filter);
    drawMarkers(visible);
  }, [jobs, filter, drawMarkers]);

  // ─── 30초 폴링 ────────────────────────────────────────────────
  useEffect(() => {
    if (!sdkReady) return;
    const id = setInterval(fetchJobs, 30_000);
    return () => clearInterval(id);
  }, [sdkReady, fetchJobs]);

  // ─── 매칭 참여 ────────────────────────────────────────────────
  const handleAccept = async (job) => {
    setAccepting(true);
    try {
      await matchingAPI.startAutoMatch(job.id);
      navigate('/matching-status', { state: { serviceRequestId: job.id } });
    } catch (e) {
      alert(e.response?.data?.error || '매칭 요청에 실패했습니다.');
    } finally {
      setAccepting(false);
    }
  };

  const centerMyLocation = () => {
    if (myLoc && mapObj.current) {
      mapObj.current.setCenter(new window.kakao.maps.LatLng(myLoc.lat, myLoc.lng));
    }
  };

  const visibleJobs = filter === 'ALL' ? jobs : jobs.filter(j => j.category === filter);

  // ─── API 키 없음 안내 ─────────────────────────────────────────
  if (keyMissing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">카카오맵 API 키 필요</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            지도를 표시하려면 카카오맵 JavaScript 키가 필요합니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-6">
            <p className="font-semibold text-gray-700">설정 방법</p>
            <ol className="text-gray-600 space-y-1.5 list-decimal pl-4">
              <li><strong>developers.kakao.com</strong> → 내 애플리케이션 → 앱 추가</li>
              <li>앱 키 탭에서 <strong>JavaScript 키</strong> 복사</li>
              <li>플랫폼 → 웹 → 사이트 도메인 등록<br />
                <code className="bg-gray-200 px-1 rounded text-xs">http://localhost:5173</code><br />
                <code className="bg-gray-200 px-1 rounded text-xs">https://*.pages.dev</code>
              </li>
              <li>Cloudflare Pages 환경변수 추가:<br />
                <code className="bg-gray-200 px-1 rounded text-xs">VITE_KAKAO_MAP_KEY=여기에키입력</code>
              </li>
            </ol>
          </div>
          <button
            onClick={() => navigate('/technician')}
            className="w-full py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const selCfg = selectedJob ? (CATEGORY[selectedJob.category] || CATEGORY.GENERAL) : null;

  return (
    <>
      {/* Kakao Maps pulse animation */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>

      <div className="h-screen flex flex-col overflow-hidden">
        {/* ── Header ────────────────────────────────────────────── */}
        <header className="bg-white shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => navigate('/technician')}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">대시보드</span>
            </button>
            <span className="font-semibold text-gray-900">주변 일감 지도</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                {visibleJobs.length}건
              </span>
              <button
                onClick={fetchJobs}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Category filter chips ─────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto z-10 flex-shrink-0 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* ── Map ───────────────────────────────────────────────── */}
        <div className="flex-1 relative">
          {/* Map container */}
          <div ref={mapRef} className="w-full h-full" />

          {/* SDK loading spinner */}
          {!sdkReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
            </div>
          )}

          {/* Fetch error */}
          {fetchError && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs text-red-600 flex items-center gap-1.5 shadow">
              <AlertCircle className="w-3.5 h-3.5" />
              데이터 로딩 실패 – 재시도 중...
            </div>
          )}

          {/* Floating: my location button */}
          <button
            onClick={centerMyLocation}
            className="absolute right-4 bottom-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
            title="내 위치로 이동"
          >
            <Crosshair className="w-5 h-5 text-primary-600" />
          </button>

          {/* Last updated badge */}
          {lastUpdated && (
            <div className="absolute left-4 bottom-6 z-10 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-3 py-1.5 shadow text-xs text-gray-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}

          {/* No jobs hint */}
          {sdkReady && jobs.length === 0 && !fetchError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">현재 주변에 대기 중인 일감이 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">30초마다 자동으로 새로고침됩니다</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Job detail panel (마커 클릭 시) ─────────────────────── */}
        {selectedJob && selCfg && (
          <div className="bg-white border-t border-gray-200 shadow-2xl flex-shrink-0 z-20">
            <div className="px-4 pt-4 pb-5">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: selCfg.color }}
                  >
                    {selCfg.emoji} {selCfg.label}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    #{selectedJob.requestNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-800 font-medium text-sm mb-3 leading-snug line-clamp-2">
                {selectedJob.description || selectedJob.serviceName || '상세 설명 없음'}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{selectedJob.address}</span>
                </span>
                {myLoc && selectedJob.latitude && (
                  <span className="font-semibold text-primary-600">
                    거리 {calcDistance(myLoc.lat, myLoc.lng, selectedJob.latitude, selectedJob.longitude)} km
                  </span>
                )}
              </div>

              {/* Cost + CTA */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">예상 견적</p>
                  <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary-600" />
                    {selectedJob.estimatedCost?.toLocaleString('ko-KR')}원
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(selectedJob)}
                  disabled={accepting}
                  className="flex-shrink-0 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 disabled:bg-gray-300 transition-colors flex items-center gap-2 text-sm"
                >
                  {accepting && <Loader2 className="w-4 h-4 animate-spin" />}
                  매칭 참여하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MapView;
