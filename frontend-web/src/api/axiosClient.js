import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080',
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
// --- RESPONSE INTERCEPTOR: Xử lý khi Token hết hạn (Lỗi 401) ---
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra: Nếu lỗi là 401 (Unauthorized) VÀ request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu để tránh vòng lặp vô tận

      try {
        // Lấy refreshToken từ storage
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            // Không có refresh token thì logout luôn
            throw new Error("No refresh token");
        }

        // Gọi API Refresh Token (Đường dẫn API này tùy backend bạn viết)
        const res = await axios.post('http://localhost:8080/auth/refresh', {
           refreshToken: refreshToken 
        });

        // Backend trả về accessToken mới
        const { accessToken } = res.data; 

        // 1. Lưu token mới vào LocalStorage
        localStorage.setItem('access_token', accessToken);

        // 2. Gắn token mới vào header của request đang bị lỗi
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 3. Thực hiện lại request ban đầu với token mới
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn hoặc lỗi -> Logout bắt buộc
        console.error("Phiên đăng nhập hết hạn:", refreshError);
        localStorage.clear();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;