import axiosInstance from '../services/axiosInstance';

function dataFrom(response) {
  return response.data.data;
}

export function errorMessage(error) {
  return error.response?.data?.error || error.message || 'Não foi possível conectar à API.';
}

// O controller coordena as ações da interface; o Axios cuida da comunicação HTTP.
export const museumController = {
  async buscarObras(query) {
    return dataFrom(await axiosInstance.get('/artworks', { params: { q: query } }));
  },
  async listarFavoritos() {
    return dataFrom(await axiosInstance.get('/favorites'));
  },
  async salvarFavorito(artwork) {
    return dataFrom(await axiosInstance.post('/favorites', artwork));
  },
  async removerFavorito(id) {
    return dataFrom(await axiosInstance.delete(`/favorites/${encodeURIComponent(id)}`));
  }
};
