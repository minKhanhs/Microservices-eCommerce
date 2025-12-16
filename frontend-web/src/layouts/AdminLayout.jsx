import { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space } from 'antd'; // Thêm Dropdown, Avatar, Space
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Menu bên trái (Sidebar)
  const sidebarItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Báo cáo thống kê',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý sản phẩm',
    },
    {
      key: '/admin/orders',
      icon: <FileTextOutlined />,
      label: 'Quản lý đơn hàng',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
  ];

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  // 2. Menu Dropdown góc phải trên cùng (User Menu)
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/profile'), // Link tới trang UserProfile vừa tạo
    },
    {
      type: 'divider', // Đường gạch ngang
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true, // Màu đỏ cảnh báo
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical p-4 text-center">
           {/* Logo thay đổi khi thu gọn */}
           <h1 className="text-white font-bold text-xl truncate transition-all duration-300">
             {collapsed ? "MS" : "MyStore Admin"}
           </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/admin/dashboard']}
          selectedKeys={[location.pathname]} // Highlight đúng menu đang đứng
          items={sidebarItems}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      
      <Layout style={{ overflow: 'hidden' }}>
        <Header style={{ padding: 0,height: 64, background: colorBgContainer }} className="flex justify-between items-center pr-6 shadow-sm">
          
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          {/* 3. Phần thông tin User ở góc phải (Đã nâng cấp) */}
          <div className="flex items-center gap-4">
             <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Space className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                    {/* Avatar hiển thị chữ cái đầu của tên hoặc icon */}
                    <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                    
                    <span className="font-semibold text-gray-700">
                        {localStorage.getItem('username') || "Admin"}
                    </span>
                </Space>
             </Dropdown>
          </div>

        </Header>
        
        <Content
          style={{
            margin: '0 16px',
            padding: 24,
            height: 'calc(100vh - 64px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;