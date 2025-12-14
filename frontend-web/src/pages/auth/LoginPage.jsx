import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Gọi API Login
      const response = await authApi.login(formData);
      
      const token = response.data?.accessToken || response.data;

      if (!token) {
         toast.error("Đăng nhập thất bại: Không nhận được Token");
         setLoading(false);
         return;
      }

      // 2. Lưu Token
      localStorage.setItem('access_token', token);

      // 3. Giải mã Token để lấy Role & User Info
      const decoded = jwtDecode(token);
      
      // Lưu role để dùng cho việc bảo vệ Route sau này
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('username', decoded.sub);

      toast.success(`Xin chào, ${decoded.sub}!`);

      // 4. Điều hướng
      if (decoded.role === 'ADMIN') {
        navigate('/');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tài khoản</label>
            <input
              type="text"
              name="username"
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;