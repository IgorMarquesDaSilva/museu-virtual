async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Ocorreu um erro na comunicação com a API.');
  return payload.data;
}

export const museumApi = {
  search(query) {
    return request(`/artworks?q=${encodeURIComponent(query)}`);
  },
  favorites() {
    return request('/favorites');
  },
  addFavorite(artwork) {
    return request('/favorites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(artwork)
    });
  },
  removeFavorite(id) {
    return request(`/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
};
