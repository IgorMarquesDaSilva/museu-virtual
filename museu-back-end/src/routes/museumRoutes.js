import { Router } from 'express';

export function createMuseumRoutes(controller) {
  const router = Router();
  router.get('/artworks', controller.search);
  router.get('/favorites', controller.listFavorites);
  router.post('/favorites', controller.addFavorite);
  router.delete('/favorites/:id', controller.removeFavorite);
  return router;
}
