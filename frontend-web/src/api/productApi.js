import axiosClient from './axiosClient';

const productApi = {
  getAll(params) {
    // Gọi API: GET /products (Public)
    const url = '/products';
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/products/${id}`;
    return axiosClient.get(url);
  }
};

export default productApi;