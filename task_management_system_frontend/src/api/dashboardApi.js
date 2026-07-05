import api from './axiosInstance';

export const dashboardApi = {
    getAll: (params) => api.get('/dashboard', { params }),
};