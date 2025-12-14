import axiosClient from './axiosClient';

const authApi = {
  login(data) {
    // data = { username, password }
    return axiosClient.post('/auth/login', data); 
  },

  register(data) {
    return axiosClient.post('/auth/register', data);
  }
};

export default authApi;