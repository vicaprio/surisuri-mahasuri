import apiClient from './client';

export const matchingAPI = {
  // 자동 매칭 시작
  startAutoMatch: (serviceRequestId) =>
    apiClient.post('/matches/auto-match', { serviceRequestId }),

  // 매칭 상태 조회
  getMatchStatus: (serviceRequestId) =>
    apiClient.get(`/matches/service-request/${serviceRequestId}`),

  // 매칭 수락 (기사님)
  acceptMatch: (matchId) =>
    apiClient.post(`/matches/${matchId}/accept`),

  // 매칭 거절 (기사님)
  rejectMatch: (matchId, reason = '') =>
    apiClient.post(`/matches/${matchId}/reject`, { reason }),

  // 기사님 대기중인 매칭 조회
  getPendingMatches: () =>
    apiClient.get('/matches/technician/pending')
};
