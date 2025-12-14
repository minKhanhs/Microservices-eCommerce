import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';

const ShopLayout = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin user từ LocalStorage
  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');
  // Không cần lấy 'role' nữa vì trang này không quan tâm Admin hay User

  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token, role, username
    navigate('/login');   // Quay về trang đăng nhập khách
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        
        {/* 1. Logo Thương Hiệu */}
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-500 transition">
          MyStore
        </Link>

        {/* 2. Menu Bên Phải */}
        <div className="flex items-center gap-6">
          
          {/* Giỏ hàng (Ai cũng thấy) */}
          <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition">
            <ShoppingCartOutlined style={{ fontSize: '26px' }} />
            {/* Badge số lượng (Tạm để 0, sau này bạn call API lấy số lượng thật) */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>

          {/* Logic Hiển thị Login/User */}
          {token ? (
            // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sm text-gray-500">Xin chào,</span>
                <span className="font-bold text-gray-700">{username}</span>
              </div>

              <button 
                onClick={handleLogout} 
                className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (KHÁCH VÃNG LAI)
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className="text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded transition"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 shadow-md transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="flex-1 bg-gray-50 p-6 container mx-auto">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-800 text-white text-center py-8 mt-auto">
        <div className="container mx-auto">
          <p className="font-bold text-lg mb-2">MyStore E-commerce</p>
          <p className="text-gray-400 text-sm">© 2025 All rights reserved. Designed for Java Spring Boot Microservices.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;