import { sendData, sendError } from '../views/jsonView.js';

function validArtwork(value) {
  return value && typeof value === 'object' &&
    /^(met|cma)-\d+$/.test(value.id) &&
    ['met', 'cma'].includes(value.source) &&
    [value.title, value.artist, value.date, value.image, value.url]
      .every(field => typeof field === 'string' && field.length > 0) &&
    value.title.length <= 500 && value.artist.length <= 500 && value.date.length <= 200 &&
    /^https:\/\//.test(value.image) && /^https:\/\//.test(value.url);
}

export function createMuseumController(artworkModel, favoritesModel) {
  return {
    async search(request, response) {
      const query = String(request.query.q || '').trim();
      if (query.length < 2 || query.length > 80) {
        return sendError(response, 'Digite uma busca de 2 a 80 caracteres.', 400);
      }
      try {
        sendData(response, await artworkModel.search(query));
      } catch (error) {
        sendError(response, error.message);
      }
    },
    async listFavorites(request, response) {
      try {
        sendData(response, await favoritesModel.list(request.user.id));
      } catch {
        sendError(response, 'Não foi possível carregar os favoritos.');
      }
    },
    async addFavorite(request, response) {
      if (!validArtwork(request.body)) return sendError(response, 'Obra inválida.', 400);
      try {
        sendData(response, await favoritesModel.add(request.user.id, request.body), 201);
      } catch {
        sendError(response, 'Não foi possível salvar o favorito.');
      }
    },
    async removeFavorite(request, response) {
      if (!/^(met|cma)-\d+$/.test(request.params.id)) return sendError(response, 'ID inválido.', 400);
      try {
        sendData(response, await favoritesModel.remove(request.user.id, request.params.id));
      } catch {
        sendError(response, 'Não foi possível remover o favorito.');
      }
    }
  };
}
