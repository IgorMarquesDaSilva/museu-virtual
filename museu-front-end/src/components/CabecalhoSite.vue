<template>
  <header class="site-header">
    <router-link class="brand" to="/" aria-label="Entre Museus, início">
      <span class="brand-icon" aria-hidden="true">✳</span>
      <span>entre<span class="brand-italic">museus</span><small>GALERIA VIRTUAL</small></span>
    </router-link>
    <nav class="main-nav" aria-label="Navegação principal">
      <router-link to="/">Explorar</router-link>
      <template v-if="user">
        <router-link to="/favoritos">Favoritos <span class="favorite-count">{{ favoriteCount }}</span></router-link>
        <router-link to="/perfil">Perfil</router-link>
        <button class="nav-logout" type="button" @click="$emit('logout')">Sair</button>
      </template>
      <template v-else>
        <router-link to="/login">Entrar</router-link>
        <router-link to="/cadastro">Cadastro</router-link>
      </template>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'CabecalhoSite',
  emits: ['logout'],
  props: {
    favoriteCount: { type: Number, required: true },
    user: { type: Object, default: null }
  }
};
</script>
