<template>
  <div>
    <div class="collection-toolbar">
      <div class="filter-list" role="group" aria-label="Filtrar por museu">
        <button :class="{ selected: source === 'all' }" @click="source = 'all'">Todos</button>
        <button :class="{ selected: source === 'met' }" @click="source = 'met'">The Met</button>
        <button :class="{ selected: source === 'cma' }" @click="source = 'cma'">Cleveland Museum of Art</button>
      </div>
      <span class="result-count">{{ filteredArtworks.length }} {{ filteredArtworks.length === 1 ? 'obra' : 'obras' }}</span>
    </div>

    <div v-if="error" class="notice error" role="alert">{{ error }}</div>
    <div v-for="warning in warnings" :key="warning" class="notice" role="status">{{ warning }}</div>
    <div v-if="loading" class="loading-state" role="status">Buscando obras nos dois museus<span class="loading-dots">...</span></div>
    <div v-else-if="filteredArtworks.length" class="art-grid">
      <article v-for="(artwork, index) in filteredArtworks" :key="artwork.id" class="art-card">
        <button class="art-image-button" type="button" @click="selected = artwork" :aria-label="`Ver detalhes de ${artwork.title}`">
          <img :src="artwork.image" :alt="artwork.title" loading="lazy" />
          <span class="art-view">Ver obra <span aria-hidden="true">↗</span></span>
        </button>
        <div class="art-info">
          <div class="art-meta"><span>{{ museumNames[artwork.source] }}</span><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
          <h3>{{ artwork.title }}</h3>
          <div class="art-bottom">
            <p>{{ artwork.artist }} <span>·</span> {{ artwork.date }}</p>
            <button class="heart-button" :disabled="favoriteBusy === artwork.id" :aria-label="favoriteIds.has(artwork.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" :aria-pressed="favoriteIds.has(artwork.id)" @click="$emit('toggle-favorite', artwork)">{{ favoriteIds.has(artwork.id) ? '♥' : '♡' }}</button>
          </div>
        </div>
      </article>
    </div>
    <div v-else-if="!error" class="empty-state">
      <span aria-hidden="true">✳</span>
      <h3>{{ emptyTitle }}</h3>
      <p>{{ emptyDescription }}</p>
      <router-link v-if="showExploreLink" class="empty-link" to="/">Explorar obras ↗</router-link>
    </div>

    <div v-if="selected" class="modal-backdrop" @click.self="selected = null">
      <section class="art-modal" role="dialog" aria-modal="true" :aria-label="selected.title" @keydown.esc="selected = null">
        <button class="modal-close" aria-label="Fechar detalhes" @click="selected = null">×</button>
        <div class="modal-image"><img :src="selected.image" :alt="selected.title" /></div>
        <div class="modal-copy">
          <p class="section-kicker">{{ museumNames[selected.source] }}</p>
          <h2>{{ selected.title }}</h2>
          <dl><div><dt>Artista</dt><dd>{{ selected.artist }}</dd></div><div><dt>Data</dt><dd>{{ selected.date }}</dd></div></dl>
          <div class="modal-actions">
            <a :href="selected.url" target="_blank" rel="noopener noreferrer">Ver no museu ↗</a>
            <button @click="$emit('toggle-favorite', selected)">{{ favoriteIds.has(selected.id) ? '♥ Salvo' : '♡ Favoritar' }}</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { filterArtworks, museumNames } from '../models/artwork';

export default {
  name: 'ListaObras',
  props: {
    artworks: { type: Array, required: true },
    favorites: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    favoriteBusy: { type: String, default: null },
    error: { type: String, default: '' },
    warnings: { type: Array, default: () => [] },
    emptyTitle: { type: String, required: true },
    emptyDescription: { type: String, required: true },
    showExploreLink: { type: Boolean, default: false }
  },
  emits: ['toggle-favorite'],
  data() {
    return { source: 'all', selected: null, museumNames };
  },
  computed: {
    filteredArtworks() {
      return filterArtworks(this.artworks, this.source);
    },
    favoriteIds() {
      return new Set(this.favorites.map(item => item.id));
    }
  }
};
</script>
