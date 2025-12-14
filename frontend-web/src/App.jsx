import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';
import ProductManager from './pages/admin/ProductManager';
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/shop/HomePage';
import Dashboard from './pages/admin/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hàm kiểm tra quyền Admin (đơn giản)
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  return role === 'ADMIN' ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* THẾ GIỚI 1: WEBSITE BÁN HÀNG (SHOP) */}
        {/* ========================================================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<ShopLayout />}>
           <Route index element={<HomePage />} />
           {/* Các trang mua hàng khác */}
        </Route>

        {/* THẾ GIỚI 2: TRANG QUẢN TRỊ (ADMIN PORTAL) */}
        {/* ========================================================= */}
        
        {/* 1. Trang Login dành riêng cho Admin (URL: /admin/login) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 2. Các trang nội bộ Admin */}
        <Route 
            path="/admin" 
            element={
                <AdminRoute>
                    <AdminLayout />
                </AdminRoute>
            }
        >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductManager />} />
            {/* Các trang quản lý Products, Users... */}
        </Route>
      </Routes>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;