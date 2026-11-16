<template>
  <header class="site-header">
    <router-link class="brand" to="/" aria-label="Entre Museus, início">
      <span class="brand-icon" aria-hidden="true">✳</span>
      <span>entre<span class="brand-italic">museus</span><small>GALERIA VIRTUAL</small></span>
    </router-link>
    <nav class="main-nav" aria-label="Navegação principal">
      <router-link to="/">Explorar</router-link>
      <router-link to="/favoritos">Favoritos <span class="favorite-count">{{ favoriteCount }}</span></router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'CabecalhoSite',
  props: {
    favoriteCount: { type: Number, required: true }
  }
};
</script>
