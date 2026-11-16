import { createRouter, createWebHashHistory } from 'vue-router';
import ExplorarView from '../views/ExplorarView.vue';
import FavoritosView from '../views/FavoritosView.vue';

const routes = [
  { path: '/', name: 'explorar', component: ExplorarView },
  { path: '/favoritos', name: 'favoritos', component: FavoritosView }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
