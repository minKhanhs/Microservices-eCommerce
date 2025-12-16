import axiosClient from './axiosClient';

const paymentApi = {
  // Tạo thanh toán (VNPay / COD...)
  // Input: { "orderId": "...", "paymentMethod": "VNPAY" }
  createPayment(data) {
    return axiosClient.post('/payment/create', data);
  }
};

export default paymentApi;