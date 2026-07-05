import api from './axiosInstance';

export const reportApi = {
    getCompleted: () => api.get('/reports', { params: { reportType: 'completed' } }),
    getPending: () => api.get('/reports', { params: { reportType: 'pending' } }),
    getEmployeeWise: () => api.get('/reports', { params: { reportType: 'employee-wise' } }),
    export: (reportType, format) =>
        api.get('/reports', {
            params: { reportType, format },
            responseType: 'blob', 
        }),
};