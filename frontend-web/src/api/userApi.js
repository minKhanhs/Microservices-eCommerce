import axiosClient from './axiosClient';

const userApi = {
  // 1. Lấy thông tin cá nhân
  getProfile() {
    return axiosClient.get('/user/profile');
  },

  // 2. Cập nhật thông tin (fullname, email, phone)
  updateProfile(data) {
    return axiosClient.put('/user/profile', data);
  },

  // 3. Đổi mật khẩu
  changePassword(data) {
    return axiosClient.put('/user/change-password', data);
  },

  // --- QUẢN LÝ ĐỊA CHỈ ---

  // 5. Thêm địa chỉ mới (street, city, district)
  addAddress(data) {
    return axiosClient.post('/user/address', data);
  },

  // 6. Xóa địa chỉ theo ID
  deleteAddress(addressId) {
    return axiosClient.delete(`/user/address/${addressId}`);
  }
};

export default userApi;