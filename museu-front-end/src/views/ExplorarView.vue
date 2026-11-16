<template>
  <section id="colecao" class="collection-section">
    <div class="section-heading">
      <div><p class="section-kicker">COLEÇÃO DIGITAL / 01</p><h2>Explore a coleção</h2></div>
      <p>Uma janela para a criatividade através dos séculos.</p>
    </div>
    <BuscaObras :loading="loading" @search="search" />
    <ListaObras
      :artworks="artworks" :favorites="favorites" :loading="loading"
      :favorite-busy="favoriteBusy" :error="error" :warnings="warnings"
      empty-title="Nenhuma obra encontrada."
      empty-description="Tente outro tema. Os catálogos também aceitam buscas em inglês."
      @toggle-favorite="toggleFavorite"
    />
  </section>
</template>

<script>
import BuscaObras from '../components/BuscaObras.vue';
import ListaObras from '../components/ListaObras.vue';
import { museumController, errorMessage } from '../controllers/museumController';

export default {
  name: 'ExplorarView',
  components: { BuscaObras, ListaObras },
  emits: ['favorites-changed'],
  data() {
    return {
      artworks: [], favorites: [], loading: false, favoriteBusy: null,
      error: '', warnings: []
    };
  },
  mounted() {
    this.loadFavorites();
    this.search('flores');
  },
  methods: {
    async loadFavorites() {
      try {
        this.favorites = await museumController.listarFavoritos();
      } catch (error) {
        this.error = errorMessage(error);
      }
    },
    async search(query) {
      if (query.trim().length < 2) {
        this.error = 'Digite pelo menos 2 caracteres para pesquisar.';
        return;
      }
      this.loading = true;
      this.error = '';
      this.warnings = [];
      try {
        const result = await museumController.buscarObras(query.trim());
        this.artworks = result.artworks;
        this.warnings = result.warnings;
      } catch (error) {
        this.artworks = [];
        this.error = errorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    async toggleFavorite(artwork) {
      if (this.favoriteBusy) return;
      this.favoriteBusy = artwork.id;
      this.error = '';
      try {
        this.favorites = this.favorites.some(item => item.id === artwork.id)
          ? await museumController.removerFavorito(artwork.id)
          : await museumController.salvarFavorito(artwork);
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
