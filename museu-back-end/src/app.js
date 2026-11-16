import express from 'express';
import { createMuseumRoutes } from './routes/museumRoutes.js';
import { createMuseumController } from './controllers/museumController.js';
import { createArtworkModel } from './models/artworkModel.js';
import { createFavoritesModel } from './models/favoritesModel.js';

export function createApp({ artworkModel, favoritesModel } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '30kb' }));
  const controller = createMuseumController(artworkModel || createArtworkModel(), favoritesModel);
  app.use('/api', createMuseumRoutes(controller));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use((error, _request, response, _next) => {
    response.status(error.status || 500).json({ error: error.status === 400 ? 'JSON inválido.' : 'Erro interno.' });
  });
  return app;
}

export { createFavoritesModel };
