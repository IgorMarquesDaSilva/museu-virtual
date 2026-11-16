import express from 'express';
import { createMuseumRoutes } from './routes/museumRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createMuseumController } from './controllers/museumController.js';
import { createAuthController } from './controllers/authController.js';
import { createArtworkModel } from './models/artworkModel.js';
import { createFavoritesModel } from './models/favoritesModel.js';
import { createAuthModel } from './models/authModel.js';
import { createDatabase } from './models/databaseModel.js';

export function createApp({ artworkModel, favoritesModel, authModel, database } = {}) {
  const app = express();
  if (!database && (!authModel || !favoritesModel)) {
    throw new Error('Informe a conexão MySQL ou os models da aplicação.');
  }
  const appAuthModel = authModel || createAuthModel(database);
  const appFavoritesModel = favoritesModel || createFavoritesModel(database);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '30kb' }));
  const authController = createAuthController(appAuthModel);
  const controller = createMuseumController(artworkModel || createArtworkModel(), appFavoritesModel);
  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api', createMuseumRoutes(controller, authController.requireAuth));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use((error, _request, response, _next) => {
    response.status(error.status || 500).json({ error: error.status === 400 ? 'JSON inválido.' : 'Erro interno.' });
  });
  return app;
}

export { createDatabase };
