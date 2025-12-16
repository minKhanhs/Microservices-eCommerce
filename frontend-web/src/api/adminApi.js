import axiosClient from './axiosClient';

const adminApi = {
  // --- THỐNG KÊ ---
  getTotalUsers() {
    return axiosClient.get('/user/admin/total');
  },
  getNewUsersThisMonth() {
    return axiosClient.get('/user/admin/new-this-month');
  },
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

  // --- ĐƠN HÀNG ---
  getAllOrders() {
    // Giả định URL này. Nếu bạn chưa có, cần tạo bên OrderController
    return axiosClient.get('/orders'); 
  },
  updateOrderStatus(orderId, status) {
    // Gọi PUT /orders/{id}/status?status=...
    return axiosClient.put(`/orders/${orderId}/status`, null, {
      params: { status } 
    });
  },
  getOrderById(orderId) {
    return axiosClient.get(`/orders/${orderId}`);
  },

  // --- USER  ---
  getAllUsers() {
    return axiosClient.get('/user');
  },
  // 2. Lấy user theo role: {{baseURL}}/user/role/ADMIN
  getUsersByRole(roleName) {
    return axiosClient.get(`/user/role/${roleName}`);
  },
  // 3. Lấy chi tiết user: {{baseURL}}/user/id
  getUserById(id) {
    return axiosClient.get(`/user/${id}`);
  },

  // 4. Đổi quyền: {{baseURL}}/user/id/role
  changeUserRole(id, roleValue) {
    const data = { newRole: roleValue };
    return axiosClient.put(`/user/${id}/role`, data);
  },

  // --- CÁ NHÂN (Dùng cho trang Profile, không nhất thiết dùng ở trang Admin) ---
  getMyProfile() {
    return axiosClient.get('/user/profile');
  },
  updateMyProfile(data) {
    return axiosClient.put('/user/profile', data);
  },
  changePassword(data) {
    return axiosClient.put('/user/change-password', data);
  }



};

export default adminApi;