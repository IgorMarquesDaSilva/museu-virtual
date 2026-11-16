<template>
  <section id="colecao" class="collection-section">
    <div class="section-heading">
      <div><p class="section-kicker">COLEÇÃO DIGITAL / 02</p><h2>Sua coleção pessoal</h2></div>
      <p>As obras que você escolheu guardar.</p>
    </div>
    <ListaObras
      :artworks="favorites" :favorites="favorites" :favorite-busy="favoriteBusy"
      :error="error" :loading="loading" empty-title="Sua coleção começa aqui."
      empty-description="Explore as obras e toque no coração para guardar as que você mais gosta."
      :show-explore-link="true" @toggle-favorite="removeFavorite"
    />
  </section>
</template>

<script>
import ListaObras from '../components/ListaObras.vue';
import { museumController, errorMessage } from '../controllers/museumController';

export default {
  name: 'FavoritosView',
  components: { ListaObras },
  emits: ['favorites-changed'],
  data() {
    return { favorites: [], loading: true, favoriteBusy: null, error: '' };
  },
  mounted() {
    this.loadFavorites();
  },
  methods: {
    async loadFavorites() {
      try {
        this.favorites = await museumController.listarFavoritos();
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    async removeFavorite(artwork) {
      if (this.favoriteBusy) return;
      this.favoriteBusy = artwork.id;
      this.error = '';
      try {
        this.favorites = await museumController.removerFavorito(artwork.id);
        this.$emit('favorites-changed');
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.favoriteBusy = null;
      }
    }
  }
};
</script>
