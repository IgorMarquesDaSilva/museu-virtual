<script setup>
import { museumNames } from '../models/artwork.js';
import { useMuseumController } from '../controllers/useMuseumController.js';

const {
  query, artworks, favorites, tab, source, selected, loading, favoriteBusy,
  error, warnings, currentArtworks, favoriteIds, search, toggleFavorite, showTab
} = useMuseumController();

const suggestions = ['flores', 'retrato', 'paisagem', 'gato'];
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="#inicio" @click="showTab('explorar')" aria-label="Entre Museus, início">
        <span class="brand-icon" aria-hidden="true">✳</span>
        <span>entre<span class="brand-italic">museus</span><small>GALERIA VIRTUAL</small></span>
      </a>
      <nav class="main-nav" aria-label="Navegação principal">
        <button :class="{ active: tab === 'explorar' }" @click="showTab('explorar')">Explorar</button>
        <button :class="{ active: tab === 'favoritos' }" @click="showTab('favoritos')">
          Favoritos <span class="favorite-count">{{ favorites.length }}</span>
        </button>
      </nav>
    </header>

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

      <section id="colecao" class="collection-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">COLEÇÃO DIGITAL / 01</p>
            <h2>{{ tab === 'favoritos' ? 'Sua coleção pessoal' : 'Explore a coleção' }}</h2>
          </div>
          <p>Uma janela para a criatividade através dos séculos.</p>
        </div>

        <form v-if="tab === 'explorar'" class="search-form" @submit.prevent="search()">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <label class="sr-only" for="art-search">Pesquisar obras de arte</label>
          <input id="art-search" v-model="query" type="search" placeholder="Busque por tema, artista ou obra..." autocomplete="off" />
          <button type="submit" :disabled="loading">{{ loading ? 'Buscando...' : 'Pesquisar' }} <span aria-hidden="true">↗</span></button>
        </form>
        <div v-if="tab === 'explorar'" class="suggestions">
          <span>Experimente:</span>
          <button v-for="item in suggestions" :key="item" type="button" @click="search(item)">{{ item }}</button>
        </div>

        <div class="collection-toolbar">
          <div class="filter-list" role="group" aria-label="Filtrar por museu">
            <button :class="{ selected: source === 'all' }" @click="source = 'all'">Todos</button>
            <button :class="{ selected: source === 'met' }" @click="source = 'met'">The Met</button>
            <button :class="{ selected: source === 'cma' }" @click="source = 'cma'">Cleveland Museum of Art</button>
          </div>
          <span class="result-count">{{ currentArtworks.length }} {{ currentArtworks.length === 1 ? 'obra' : 'obras' }}</span>
        </div>

        <div v-if="error" class="notice error" role="alert">{{ error }}</div>
        <div v-for="warning in warnings" :key="warning" class="notice" role="status">{{ warning }}</div>
        <div v-if="loading" class="loading-state" role="status">Buscando obras nos dois museus<span class="loading-dots">...</span></div>
        <div v-else-if="currentArtworks.length" class="art-grid">
          <article v-for="(artwork, index) in currentArtworks" :key="artwork.id" class="art-card">
            <button class="art-image-button" type="button" @click="selected = artwork" :aria-label="`Ver detalhes de ${artwork.title}`">
              <img :src="artwork.image" :alt="artwork.title" loading="lazy" />
              <span class="art-view">Ver obra <span aria-hidden="true">↗</span></span>
            </button>
            <div class="art-info">
              <div class="art-meta"><span>{{ museumNames[artwork.source] }}</span><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
              <h3>{{ artwork.title }}</h3>
              <div class="art-bottom">
                <p>{{ artwork.artist }} <span>·</span> {{ artwork.date }}</p>
                <button class="heart-button" :disabled="favoriteBusy === artwork.id" :aria-label="favoriteIds.has(artwork.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" :aria-pressed="favoriteIds.has(artwork.id)" @click="toggleFavorite(artwork)">{{ favoriteIds.has(artwork.id) ? '♥' : '♡' }}</button>
              </div>
            </div>
          </article>
        </div>
        <div v-else-if="!error" class="empty-state">
          <span aria-hidden="true">✳</span>
          <h3>{{ tab === 'favoritos' ? 'Sua coleção começa aqui.' : 'Nenhuma obra encontrada.' }}</h3>
          <p>{{ tab === 'favoritos' ? 'Explore as obras e toque no coração para guardar as que você mais gosta.' : 'Tente outro tema. Os catálogos também aceitam buscas em inglês.' }}</p>
          <button v-if="tab === 'favoritos'" @click="showTab('explorar')">Explorar obras ↗</button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div><span class="footer-symbol">✳</span><strong>entre<em>museus</em></strong></div>
      <p>Uma experiência educacional com dados públicos de <a href="https://www.metmuseum.org/" target="_blank" rel="noopener noreferrer">The Met</a> e <a href="https://www.clevelandart.org/" target="_blank" rel="noopener noreferrer">Cleveland Museum of Art</a>.</p>
      <span>FEITO PARA DESCOBRIR ARTE</span>
    </footer>

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
            <button @click="toggleFavorite(selected)">{{ favoriteIds.has(selected.id) ? '♥ Salvo' : '♡ Favoritar' }}</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
