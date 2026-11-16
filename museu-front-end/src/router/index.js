import { createRouter, createWebHashHistory } from 'vue-router';
import ExplorarView from '../views/ExplorarView.vue';
import FavoritosView from '../views/FavoritosView.vue';
import LoginView from '../views/LoginView.vue';
import CadastroView from '../views/CadastroView.vue';
import PerfilView from '../views/PerfilView.vue';
import { authController } from '../controllers/authController';

const routes = [
  { path: '/', name: 'explorar', component: ExplorarView },
  { path: '/favoritos', name: 'favoritos', component: FavoritosView, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/cadastro', name: 'cadastro', component: CadastroView, meta: { guestOnly: true } },
  { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async to => {
  const user = await authController.carregarPerfil();
  if (to.meta.requiresAuth && !user) return { name: 'login', query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && user) return { name: 'perfil' };
});

export default router;
