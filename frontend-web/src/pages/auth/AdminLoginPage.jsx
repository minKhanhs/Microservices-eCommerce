import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';
import { jwtDecode } from "jwt-decode";

const AdminLoginPage = () => {
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
      const response = await authApi.login(formData);
      const token = response.data?.accessToken || response.data;
      
      const decoded = jwtDecode(token);

      // --- LOGIC CHẶN USER THƯỜNG ---
      if (decoded.role !== 'ADMIN') {
        toast.error("Bạn không có quyền truy cập trang quản trị!");
        setLoading(false);
        return; // Dừng lại, không lưu token
      }

      // Nếu là ADMIN thì mới lưu
      localStorage.setItem('access_token', token);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('username', decoded.sub);

      toast.success("Chào mừng Admin quay trở lại!");
      navigate('/admin/dashboard');

    } catch (error) {
      toast.error("Sai tài khoản hoặc không có quyền truy cập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ADMIN LOGIN</h2>
        
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
      </div>
    </div>
  );
};

export default AdminLoginPage;