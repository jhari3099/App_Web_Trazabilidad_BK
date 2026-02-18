import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Solicitudes
export const solicitudesService = {
  getAll: (params) => api.get('/solicitudes', { params }),
  getById: (id) => api.get(`/solicitudes/${id}`),
  create: (data) => api.post('/solicitudes', data),
  update: (id, data) => api.put(`/solicitudes/${id}`, data),
  getDashboard: () => api.get('/solicitudes/dashboard'),
};

// Clientes Históricos
export const clientesService = {
  getAll: (params) => api.get('/clientes-historicos', { params }),
  getByRuc: (ruc) => api.get(`/clientes-historicos/ruc/${ruc}`),
  create: (data) => api.post('/clientes-historicos', data),
  update: (id, data) => api.put(`/clientes-historicos/${id}`, data),
  importarExcel: (formData) => api.post('/clientes-historicos/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Sheriff
export const sheriffService = {
  consultar: (data) => api.post('/sheriff/consultar', data),
  getDatos: (solicitudId) => api.get(`/sheriff/solicitud/${solicitudId}`),
  generarExcel: (solicitudId) => api.get(`/sheriff/excel/${solicitudId}`, {
    responseType: 'blob',
  }),
};

// Dictámenes
export const dictamenesService = {
  getAll: (params) => api.get('/dictamenes', { params }),
  getBySolicitud: (solicitudId) => api.get(`/dictamenes/solicitud/${solicitudId}`),
  create: (data) => api.post('/dictamenes', data),
  update: (id, data) => api.put(`/dictamenes/${id}`, data),
};

// Trazabilidad
export const trazabilidadService = {
  getAll: (params) => api.get('/trazabilidad', { params }),
  getBySolicitud: (solicitudId) => api.get(`/trazabilidad/solicitud/${solicitudId}`),
  getEstadisticas: (params) => api.get('/trazabilidad/estadisticas', { params }),
  registrar: (data) => api.post('/trazabilidad', data),
};

// Usuarios
export const usuariosService = {
  getAll: (params) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  desactivar: (id) => api.post(`/usuarios/${id}/desactivar`),
  activar: (id) => api.post(`/usuarios/${id}/activar`),
};

export default api;
