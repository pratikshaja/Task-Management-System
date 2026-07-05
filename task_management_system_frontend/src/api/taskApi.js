import api from './axiosInstance';

export const taskApi = {
    getAll: (params) => api.get('/tasks', { params }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    uploadFile: (id, formData) =>
        api.put(`/tasks/upload/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};