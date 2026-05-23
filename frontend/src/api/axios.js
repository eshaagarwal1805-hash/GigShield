import axios from 'axios';

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://gigshield-backend-jlel.onrender.com";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const isEmployerRoute = config.url?.startsWith('/employer');

  const token = isEmployerRoute
    ? localStorage.getItem('employer_token')
    : localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;