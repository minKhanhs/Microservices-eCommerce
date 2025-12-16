import axiosClient from './axiosClient';

const orderApi = {
  // 1. Lấy danh sách đơn hàng của tôi
  getMyOrders() {
    return axiosClient.get('/orders');
  },

  // 2. Lấy chi tiết đơn hàng theo ID
  getById(orderId) {
    return axiosClient.get(`/orders/${orderId}`);
  },

  // 3. Hủy đơn hàng
  cancelOrder(orderId) {
    return axiosClient.put(`/orders/${orderId}/cancel`);
  },
  // 4. Đặt hàng ngay (Buy Now)
  // Input: { productId, quantity, addressId }
  placeOrderBuyNow(data) {
    return axiosClient.post('/orders/place/buy-now', data);
  },

  // 5. Đặt hàng từ giỏ (Buy From Cart)
  // Input: { addressId, selectedProductIds: [...] }
  placeOrderCart(data) {
    return axiosClient.post('/orders/place/cart', data);
  }
};

export default orderApi;