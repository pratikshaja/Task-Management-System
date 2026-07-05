import api from './axiosInstance';

// Employee CRUD endpoints
export const employeeApi = {
    getAll: (params) => api.get('/employees', { params }),
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
};
