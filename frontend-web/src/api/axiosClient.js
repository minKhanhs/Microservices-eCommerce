import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080', // Trỏ thẳng vào GATEWAY
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Lấy token khi user đăng nhập
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;