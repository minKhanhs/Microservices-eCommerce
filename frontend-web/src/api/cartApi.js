import axiosClient from './axiosClient';

const cartApi = {
  // 1. Thêm vào giỏ
  addToCart(data) {
    // data: { productId: "...", quantity: 1 }
    return axiosClient.post('/cart/add', data);
  },

  // 2. Lấy danh sách giỏ hàng (Bạn cần xây dựng API này ở backend: GET /cart)
  getMyCart() {
    return axiosClient.get('/cart'); 
  },
  // 4. Cập nhật số lượng (Giả sử: PUT /cart/update)
  updateQuantity(data) {
     return axiosClient.put('/cart/update', data);
  },
    // 3. Xóa sản phẩm khỏi giỏ (Giả sử: DELETE /cart/{productId})
  removeItems(productIds) {
    return axiosClient.delete('/cart', { 
        data: productIds // Gửi trực tiếp mảng ["id1", "id2"]
    });
    }
};

export default cartApi;