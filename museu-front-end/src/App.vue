<template>
  <div class="site-shell">
    <CabecalhoSite :favorite-count="favoriteCount" />
    <main id="inicio">
      <section class="hero">
        <div class="hero-content">
          <p class="eyebrow"><span class="eyebrow-line"></span> UMA NOVA FORMA DE EXPLORAR ARTE</p>
          <h1>Dois museus.<br><em>Um universo</em><br>de descobertas.</h1>
          <p class="hero-copy">Obras do The Met e do Cleveland Museum of Art reunidas em uma única experiência. Pesquise, descubra e guarde suas favoritas.</p>
          <a class="hero-link" href="#colecao">Explorar a coleção <span aria-hidden="true">↗</span></a>
        </div>
        <div class="hero-decoration" aria-hidden="true">
          <div class="decoration-frame frame-one"></div>
          <div class="decoration-frame frame-two"></div>
          <div class="decoration-orbit"><span>✳</span></div>
          <p>ARTE SEM FRONTEIRAS<br>EST. 2026</p>
        </div>
      </section>
      <router-view v-slot="{ Component }">
        <component :is="Component" @favorites-changed="refreshFavorites" />
      </router-view>
    </main>
    <RodapeSite />
  </div>
</template>

<script>
import CabecalhoSite from './components/CabecalhoSite.vue';
import RodapeSite from './components/RodapeSite.vue';
import { museumController } from './controllers/museumController';

export default {
  name: 'App',
  components: { CabecalhoSite, RodapeSite },
  data() {
    return { favoriteCount: 0 };
  },
  mounted() {
    this.refreshFavorites();
  },
  methods: {
    async refreshFavorites() {
      try {
        this.favoriteCount = (await museumController.listarFavoritos()).length;
      } catch {
        this.favoriteCount = 0;
      }
    }
  }
};
</script>
