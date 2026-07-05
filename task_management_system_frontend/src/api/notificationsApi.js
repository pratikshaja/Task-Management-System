// src/api/notificationApi.js
import api from './axiosInstance';

export const notificationsApi = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
};