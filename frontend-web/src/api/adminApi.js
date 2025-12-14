import axiosClient from './axiosClient';

const adminApi = {
  // --- THỐNG KÊ ---
  getDashboardStats() {
    return axiosClient.get('/orders/admin/dashboard');
  },
  getRevenueChart(month, year) {
    return axiosClient.get(`/orders/admin/revenue-daily?month=${month}&year=${year}`);
  },
  getLowStock() {
    return axiosClient.get('/products/admin/low-stock');
  },
  
  getTotalProductCount() {
    return axiosClient.get('/products/admin/count');
  },

  // --- SẢN PHẨM ---
  getAllProducts() {
    return axiosClient.get('/products');
  },
  createProduct(data) {
    return axiosClient.post('/products', data);
  },
  updateProduct(id, data) {
    return axiosClient.put(`/products/${id}`, data);s
  },
  deleteProduct(id) {
    return axiosClient.delete(`/products/${id}`);
  },
  searchProducts(keyword) {
    return axiosClient.get(`/products/search?keyword=${keyword}`);
  },


  // --- DANH MỤC (Category) ---
  getAllCategories() {
    return axiosClient.get('/products/category');
  },

  createCategory(data) {
    // Input: name
    return axiosClient.post('/products/category', data);
  },

  getProductsByCategory(categoryId) {
    return axiosClient.get(`/products/category/${categoryId}`);
  },

  // --- ĐƠN HÀNG (Cần bạn xác nhận URL chính xác) ---
  getAllOrders() {
    // Giả định URL này. Nếu bạn chưa có, cần tạo bên OrderController
    return axiosClient.get('/orders'); 
  },
  updateOrderStatus(orderId, status) {
    // API dành cho Admin cập nhật trạng thái
    return axiosClient.put(`/orders/${orderId}/status?status=${status}`);
  },

  // --- USER (Cần bạn xác nhận URL chính xác) ---
  getAllUsers() {
    return axiosClient.get('/user');
  }
};

export default adminApi;