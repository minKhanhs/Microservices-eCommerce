import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Cập nhật State khớp với Body trong Postman
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
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
      await authApi.register(formData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      // Hiển thị lỗi từ backend nếu có
      toast.error(error.response?.data || "Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tài khoản *</label>
            <input
              type="text"
              name="username"
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* FullName (Mới) */}
          <div>
             <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
             <input
               type="text"
               name="fullName"
               className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
               value={formData.fullName}
               onChange={handleChange}
             />
           </div>

           {/* Phone (Mới) */}
           <div>
             <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
             <input
               type="text"
               name="phone"
               className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
               value={formData.phone}
               onChange={handleChange}
             />
           </div>

           {/* Address (Mới) */}
           <div>
             <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
             <input
               type="text"
               name="address"
               className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
               value={formData.address}
               onChange={handleChange}
             />
           </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu *</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;