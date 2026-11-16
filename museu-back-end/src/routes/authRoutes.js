import { Router } from 'express';

export function createAuthRoutes(controller) {
  const router = Router();
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
  router.get('/profile', controller.requireAuth, controller.profile);
  router.put('/profile', controller.requireAuth, controller.updateProfile);
  return router;
}
