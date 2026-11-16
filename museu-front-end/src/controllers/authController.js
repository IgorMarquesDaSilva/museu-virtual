import { reactive } from 'vue';
import axiosInstance from '../services/axiosInstance';

function dataFrom(response) {
  return response.data.data;
}

export const authState = reactive({ user: null, loaded: false });

export const authController = {
  async carregarPerfil(force = false) {
    if (authState.loaded && !force) return authState.user;
    try {
      authState.user = dataFrom(await axiosInstance.get('/auth/profile'));
    } catch (error) {
      if (error.response?.status !== 401) throw error;
      authState.user = null;
    } finally {
      authState.loaded = true;
    }
    return authState.user;
  },
  async entrar(credentials) {
    authState.user = dataFrom(await axiosInstance.post('/auth/login', credentials));
    authState.loaded = true;
    return authState.user;
  },
  async cadastrar(data) {
    authState.user = dataFrom(await axiosInstance.post('/auth/register', data));
    authState.loaded = true;
    return authState.user;
  },
  async atualizar(data) {
    authState.user = dataFrom(await axiosInstance.put('/auth/profile', data));
    return authState.user;
  },
  async sair() {
    await axiosInstance.post('/auth/logout');
    authState.user = null;
    authState.loaded = true;
  }
};
