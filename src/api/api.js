import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 globally — redirect to login if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ Auth endpoints
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  registerTenant: (token, data) => api.post(`/api/auth/register-tenant?token=${token}`, data),
  login: (data) => api.post('/api/auth/login', data),
};

// ✅ Invoice endpoints
export const invoiceAPI = {
    getAllInvoices: () => api.get('/api/invoices/admin/all'),
    getMyInvoices: (residentId) => api.get(`/api/invoices/resident/${residentId}`),
    triggerBilling: (data) => api.post('/api/invoices/admin/trigger-billing', data),
    createInvoice: (data) => api.post('/api/invoices/admin/create', data),
    deleteInvoice: (invoiceId) => api.delete(`/api/invoices/admin/${invoiceId}`),
};

// ✅ Payment endpoints
export const paymentAPI = {
    createOrder: (data) => api.post('/api/payments/create-order', data),
    verifyPayment: (data) => api.post('/api/payments/verify', data),
};

export const propertyAPI = {
    getAllProperties: () => api.get('/api/properties/admin/all'),
    createProperty: (data) => api.post('/api/properties/admin/create', data),
    assignOwner: (propertyId, ownerId) => api.put(`/api/properties/admin/${propertyId}/assign-owner/${ownerId}`),
    assignTenant: (propertyId, tenantId) => api.put(`/api/properties/admin/${propertyId}/assign-tenant/${tenantId}`),
    unassignOwner: (propertyId) => api.put(`/api/properties/admin/${propertyId}/unassign-owner`),
    unassignTenant: (propertyId) => api.put(`/api/properties/admin/${propertyId}/unassign-tenant`),
    getAllResidents: () => api.get('/api/properties/admin/residents'),
    deleteProperty: (propertyId) => api.delete(`/api/properties/admin/${propertyId}`),
    deactivateResident: (residentId) => api.delete(`/api/properties/admin/residents/${residentId}`),
    inviteTenant: (ownerId, propertyId, data) => api.post(`/api/properties/resident/${ownerId}/property/${propertyId}/invite-tenant`, data),
    getMyProperties: (residentId) => api.get(`/api/properties/resident/${residentId}`),
};


export const visitorAPI = {
    preApproveVisitor: (residentId, data) => api.post(`/api/visitors/resident/${residentId}/preapprove`, data),
    getMyVisitors: (residentId) => api.get(`/api/visitors/resident/${residentId}`),
    getAllVisitors: () => api.get('/api/visitors/admin/all'),
    lookupByToken: (token) => api.get(`/api/visitors/gate/lookup/${token}`),
    gateAction: (data) => api.post('/api/visitors/gate/action', data),
};

export const userAPI = {
    getPendingUsers: () => api.get('/api/users/admin/pending'),
    getAllUsers: () => api.get('/api/users/admin/all'),
    approveUser: (userId) => api.put(`/api/users/admin/${userId}/approve`),
    rejectUser: (userId) => api.put(`/api/users/admin/${userId}/reject`),
};

export const complaintAPI = {
    raiseComplaint: (residentId, data) => api.post(`/api/complaints/resident/${residentId}`, data),
    getMyComplaints: (residentId) => api.get(`/api/complaints/resident/${residentId}`),
    getAllComplaints: () => api.get('/api/complaints/admin/all'),
    updateComplaint: (complaintId, data) => api.put(`/api/complaints/admin/${complaintId}`, data),
};

export const announcementAPI = {
    create: (adminId, data) => api.post(`/api/announcements/admin/${adminId}`, data),
    getActive: () => api.get('/api/announcements/active'),
    getAll: () => api.get('/api/announcements/admin/all'),
    deactivate: (id) => api.put(`/api/announcements/admin/${id}/deactivate`),
};

export const facilityAPI = {
    // Admin
    createFacility: (data) => api.post('/api/facilities/admin/create', data),
    getAllFacilities: () => api.get('/api/facilities/admin/all'),
    toggleFacility: (id) => api.put(`/api/facilities/admin/${id}/toggle`),
    getAllBookings: () => api.get('/api/facilities/admin/bookings'),
    updateBookingStatus: (bookingId, status) =>
        api.put(`/api/facilities/admin/bookings/${bookingId}/status`, null, { params: { status } }),
    deleteBooking: (id) => api.delete(`/api/facilities/admin/bookings/${id}`),
    // Resident
    getActiveFacilities: () => api.get('/api/facilities/active'),
    createBooking: (residentId, data) => api.post(`/api/facilities/resident/${residentId}/book`, data),
    getMyBookings: (residentId) => api.get(`/api/facilities/resident/${residentId}/bookings`),
    cancelBooking: (bookingId) => api.put(`/api/facilities/resident/bookings/${bookingId}/cancel`),
};

export const staffAPI = {
    addStaff: (data) => api.post('/api/staff/admin/add', data),
    getAllStaff: () => api.get('/api/staff/admin/all'),
    deactivateStaff: (id) => api.put(`/api/staff/admin/${id}/deactivate`),
    activateStaff: (id) => api.put(`/api/staff/admin/${id}/activate`),
    markAttendance: (data) => api.post('/api/staff/admin/attendance', data),
    getAttendanceByDate: (date) => api.get('/api/staff/admin/attendance/date', { params: { date } }),
    getAttendanceByMonth: (year, month) =>
        api.get('/api/staff/admin/attendance/month', { params: { year, month } }),
};

export const reportAPI = {
    getFinancialReport: (year) => api.get('/api/reports/admin/financial', { params: { year } }),
};

export default api;
