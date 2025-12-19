import http from '../../../../api/http';

export const getChatSessions = () => {
  return http.get('/api/chat/admin/sessions');
};

export const getChatSessionDetails = (id: number) => {
  return http.get(`/api/chat/admin/session/${id}`);
};
