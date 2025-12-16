import axiosClient from './axiosClient';

const productApi = {
  // 1. Lấy tất cả sản phẩm (Có thể truyền params phân trang)
  getAll(params) {
    return axiosClient.get('/products', { params });
  },

  // 2. Lấy chi tiết 1 sản phẩm
  getById(id) {
    return axiosClient.get(`/products/${id}`);
  },

  // 3. Lấy danh sách danh mục (Category)
  getAllCategories() {
    return axiosClient.get('/products/category');
  },

  // 4. Lấy sản phẩm theo danh mục
  getByCategory(categoryId) {
    return axiosClient.get(`/products/category/${categoryId}`);
  },

  // 5. Tìm kiếm sản phẩm
  search(keyword) {
    return axiosClient.get('/products/search', { 
        params: { keyword } 
    });
  }
};

export default productApi;