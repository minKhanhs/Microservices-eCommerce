import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  HistoryOutlined, 
  DownOutlined,
  ProfileOutlined
} from '@ant-design/icons';
import { Dropdown, Avatar, Badge } from 'antd'; 
import cartApi from '../api/cartApi';

const ShopLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  // Lấy thông tin user từ LocalStorage
  const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  // --- HÀM 1: LẤY SỐ LƯỢNG TỪ API ---
  const fetchCartCount = async () => {
    // Nếu không có token (chưa login) thì set = 0 luôn
    if (!token) {
        setCartCount(0);
        return;
    }

    try {
      const res = await cartApi.getMyCart();
      // Xử lý dữ liệu trả về từ API giỏ hàng
      const items = res.data.items || (Array.isArray(res.data) ? res.data : []);
      setCartCount(items.length);

    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ:", error);
    }
  };

  // --- HÀM 2: LẮNG NGHE SỰ KIỆN ---
  useEffect(() => {
    // 1. Gọi ngay khi component load lần đầu
    fetchCartCount();

    // 2. Định nghĩa hàm xử lý khi nhận tín hiệu
    const handleCartUpdate = () => {
        fetchCartCount();
    };

    // 3. Đăng ký lắng nghe sự kiện tên là "CART_UPDATED"
    window.addEventListener('CART_UPDATED', handleCartUpdate);

    // 4. Cleanup khi component unmount
    return () => {
      window.removeEventListener('CART_UPDATED', handleCartUpdate);
    };
  }, [token]);

  // --- XỬ LÝ MENU USER ---
  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token, role, username
    setCartCount(0);
    navigate('/');
    window.location.reload();
  };

  // Định nghĩa các mục trong Dropdown
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <ProfileOutlined />,
      onClick: () => navigate('/profile'), 
    },
    {
      key: 'orders',
      label: 'Đơn hàng của tôi',
      icon: <HistoryOutlined />,
      onClick: () => navigate('/orders'), 
    },
    {
      type: 'divider', 
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true, 
      onClick: handleLogout,
    },
  ];

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
          
          {/* Giỏ hàng */}
          <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition pt-1">
            <Badge count={cartCount} size="small" offset={[0, -5]}>
                <ShoppingCartOutlined style={{ fontSize: '26px' }} />
            </Badge>
          </Link>

          {/* Logic Hiển thị Login/User */}
          {token ? (
            // --- GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP (DROPDOWN) ---
            <Dropdown 
                menu={{ items: userMenuItems }} 
                trigger={['click']} 
                placement="bottomRight"
                arrow
            >
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 py-1 px-3 rounded-full transition duration-200 border border-transparent hover:border-gray-200">
                    <Avatar 
                        style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }} 
                        icon={<UserOutlined />} 
                        size="small"
                    >
                        {username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    
                    <div className="hidden md:flex flex-col items-start">
                        <span className="font-semibold text-gray-700 text-sm leading-none">{username}</span>
                    </div>
                    
                    <DownOutlined className="text-xs text-gray-400" />
                </div>
            </Dropdown>
          ) : (
            // --- GIAO DIỆN CHƯA ĐĂNG NHẬP (KHÁCH VÃNG LAI) ---
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
          <p className="text-gray-400 text-sm">Lê Minh Khánh - 20227235</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;