const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';
const MET_SEARCH = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search';
const CMA_BASE = 'https://openaccess-api.clevelandart.org/api';
const CACHE_MS = 5 * 60 * 1000;

const translations = {
  flor: 'flower', flores: 'flowers', gato: 'cat', gatos: 'cats',
  retrato: 'portrait', paisagem: 'landscape', paisagens: 'landscape',
  mulher: 'woman', mulheres: 'women', mar: 'sea', natureza: 'nature',
  cavalo: 'horse', cavalos: 'horses', cidade: 'city'
};

function searchTerm(query) {
  return translations[query.toLocaleLowerCase('pt-BR').trim()] ?? query.trim();
}

async function getJson(fetchImpl, url) {
  const response = await fetchImpl(url, {
    headers: { 'User-Agent': 'MuseuVirtual/1.0 (projeto educacional)' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Fonte externa respondeu ${response.status}`);
  return response.json();
}

function fromCma(item) {
  if (!item.images?.web?.url) return null;
  return {
    id: `cma-${item.id}`,
    source: 'cma',
    title: item.title || 'Sem título',
    artist: item.creators?.[0]?.description || 'Artista desconhecido',
    date: item.creation_date || 'Data desconhecida',
    image: item.images.web.url,
    url: item.url || `https://www.clevelandart.org/art/collection/search/${item.id}`
  };
}

function fromMet(item) {
  if (!item.primaryImageSmall) return null;
  return {
    id: `met-${item.objectID}`,
    source: 'met',
    title: item.title || 'Sem título',
    artist: item.artistDisplayName || 'Artista desconhecido',
    date: item.objectDate || 'Data desconhecida',
    image: item.primaryImageSmall,
    url: item.objectURL || `https://www.metmuseum.org/art/collection/search/${item.objectID}`
  };
}

export function createArtworkModel(fetchImpl = fetch) {
  const cache = new Map();

  async function searchCma(query) {
    const url = new URL(`${CMA_BASE}/artworks/`);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '10');
    url.searchParams.set('has_image', '1');
    url.searchParams.set('cc0', '1');
    const body = await getJson(fetchImpl, url);
    return (body.data || []).map(fromCma).filter(Boolean);
  }

  async function searchMet(query) {
    const url = new URL(MET_SEARCH);
    url.searchParams.set('hasImages', 'true');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '14');
    const body = await getJson(fetchImpl, url);
    const ids = (body.objectIDs || []).slice(0, 14);
    const details = await Promise.allSettled(ids.map(id => getJson(fetchImpl, `${MET_BASE}/objects/${id}`)));
    return details.filter(result => result.status === 'fulfilled')
      .map(result => fromMet(result.value)).filter(Boolean).slice(0, 10);
  }

  async function search(query) {
    const term = searchTerm(query);
    const key = term.toLowerCase();
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

    const [met, cma] = await Promise.allSettled([searchMet(term), searchCma(term)]);
    if (met.status === 'rejected' && cma.status === 'rejected') {
      throw new Error('Os dois museus estão indisponíveis no momento.');
    }
    const value = {
      artworks: [
        ...(met.status === 'fulfilled' ? met.value : []),
        ...(cma.status === 'fulfilled' ? cma.value : [])
      ],
      warnings: [
        ...(met.status === 'rejected' ? ['Não foi possível consultar The Met.'] : []),
        ...(cma.status === 'rejected' ? ['Não foi possível consultar o Cleveland Museum of Art.'] : [])
      ]
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  return { search };
}
