import { computed, onMounted, ref } from 'vue';
import { filterArtworks } from '../models/artwork.js';
import { museumApi } from '../services/museumApi.js';

export function useMuseumController() {
  const query = ref('flores');
  const artworks = ref([]);
  const favorites = ref([]);
  const tab = ref('explorar');
  const source = ref('all');
  const selected = ref(null);
  const loading = ref(false);
  const favoriteBusy = ref(null);
  const error = ref('');
  const warnings = ref([]);

  const currentArtworks = computed(() => filterArtworks(
    tab.value === 'favoritos' ? favorites.value : artworks.value,
    source.value
  ));
  const favoriteIds = computed(() => new Set(favorites.value.map(item => item.id)));

  async function search(term = query.value) {
    query.value = term;
    const clean = term.trim();
    if (clean.length < 2) {
      error.value = 'Digite pelo menos 2 caracteres para pesquisar.';
      return;
    }
    tab.value = 'explorar';
    source.value = 'all';
    loading.value = true;
    error.value = '';
    warnings.value = [];
    try {
      const result = await museumApi.search(clean);
      artworks.value = result.artworks;
      warnings.value = result.warnings;
    } catch (failure) {
      artworks.value = [];
      error.value = failure.message;
    } finally {
      loading.value = false;
    }
  }

  async function loadFavorites() {
    try {
      favorites.value = await museumApi.favorites();
    } catch (failure) {
      error.value = failure.message;
    }
  }

  async function toggleFavorite(artwork) {
    if (favoriteBusy.value) return;
    favoriteBusy.value = artwork.id;
    error.value = '';
    try {
      favorites.value = favoriteIds.value.has(artwork.id)
        ? await museumApi.removeFavorite(artwork.id)
        : await museumApi.addFavorite(artwork);
    } catch (failure) {
      error.value = failure.message;
    } finally {
      favoriteBusy.value = null;
    }
  }

  function showTab(nextTab) {
    tab.value = nextTab;
    source.value = 'all';
    error.value = '';
    warnings.value = [];
  }

  onMounted(() => {
    loadFavorites();
    search();
  });

  return {
    query, artworks, favorites, tab, source, selected, loading, favoriteBusy,
    error, warnings, currentArtworks, favoriteIds, search, toggleFavorite, showTab
  };
}
