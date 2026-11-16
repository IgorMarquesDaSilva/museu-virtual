export const museumNames = {
  met: 'The Met',
  cma: 'Cleveland Museum of Art'
};

export function filterArtworks(artworks, source) {
  return source === 'all' ? artworks : artworks.filter(artwork => artwork.source === source);
}
