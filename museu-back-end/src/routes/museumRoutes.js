import { Router } from 'express';

export function createMuseumRoutes(controller, requireAuth) {
  const router = Router();
  router.get('/artworks', controller.search);
  router.get('/favorites', requireAuth, controller.listFavorites);
  router.post('/favorites', requireAuth, controller.addFavorite);
  router.delete('/favorites/:id', requireAuth, controller.removeFavorite);
  return router;
}
