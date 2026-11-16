import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp, createFavoritesModel } from '../src/app.js';
import { createArtworkModel } from '../src/models/artworkModel.js';

const artwork = {
  id: 'met-123', source: 'met', title: 'Obra teste', artist: 'Artista',
  date: '1900', image: 'https://example.com/image.jpg', url: 'https://example.com/art'
};

test('integra as duas fontes e usa o cache na busca', async () => {
  const calls = [];
  const fakeFetch = async url => {
    calls.push(String(url));
    const address = String(url);
    let body;
    if (address.includes('metmuseum.org') && address.includes('/search')) body = { objectIDs: [123] };
    else if (address.includes('metmuseum.org')) body = {
      objectID: 123, title: 'Met teste', artistDisplayName: 'Artista Met',
      objectDate: '1880', primaryImageSmall: 'https://example.com/met.jpg', objectURL: 'https://example.com/met'
    };
    else body = { data: [{ id: 45, title: 'Cleveland teste',
      creators: [{ description: 'Artista CMA' }], creation_date: '1890',
      images: { web: { url: 'https://example.com/cma.jpg' } }, url: 'https://example.com/cma' }] };
    return { ok: true, json: async () => body };
  };
  const model = createArtworkModel(fakeFetch);
  const first = await model.search('flores');
  assert.equal(first.artworks.length, 2);
  assert.deepEqual(first.artworks.map(item => item.source), ['met', 'cma']);
  assert.ok(calls.some(url => url.includes('q=flowers')));
  await model.search('flores');
  assert.equal(calls.length, 3);
});

test('busca e favoritos funcionam pelas rotas HTTP', async t => {
  const temp = await mkdtemp(join(tmpdir(), 'museu-test-'));
  const app = createApp({
    artworkModel: { search: async () => ({ artworks: [artwork], warnings: [] }) },
    favoritesModel: createFavoritesModel(join(temp, 'favorites.json'))
  });
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { server.close(); await rm(temp, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = (path, options) => fetch(`${base}${path}`, options);

  const invalid = await request('/artworks?q=a');
  assert.equal(invalid.status, 400);
  const search = await (await request('/artworks?q=arte')).json();
  assert.equal(search.data.artworks[0].id, 'met-123');

  const add = await request('/favorites', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(artwork)
  });
  assert.equal(add.status, 201);
  assert.equal((await (await request('/favorites')).json()).data.length, 1);
  await request('/favorites/met-123', { method: 'DELETE' });
  assert.deepEqual((await (await request('/favorites')).json()).data, []);
});
