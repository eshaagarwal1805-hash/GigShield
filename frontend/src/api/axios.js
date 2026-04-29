import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  // Employer-scoped routes use a separate localStorage key so that a logged-in
  // worker session is never silently overridden by an employer token (and vice versa).
  const isEmployerRoute = config.url?.startsWith('/employer');

  const token = isEmployerRoute
    ? localStorage.getItem('employer_token')
    : localStorage.getItem('token');          // worker / user token key

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
