import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createArtworkModel } from '../src/models/artworkModel.js';

const artwork = {
  id: 'met-123', source: 'met', title: 'Obra teste', artist: 'Artista',
  date: '1900', image: 'https://example.com/image.jpg', url: 'https://example.com/art'
};

function createTestModels() {
  let user = null;
  let activeToken = '';
  let favorites = [];
  return {
    authModel: {
      async register(data) {
        user = { id: 1, name: data.name, email: data.email, createdAt: '2026-11-16 12:00:00' };
        activeToken = 'test-token';
        return { user, session: { token: activeToken, maxAge: 604800 } };
      },
      async login() {
        return { user, session: { token: activeToken, maxAge: 604800 } };
      },
      async authenticate(token) {
        return token === activeToken ? user : null;
      },
      async logout() {
        activeToken = '';
      },
      async update(_id, data) {
        user = { ...user, ...data };
        return user;
      }
    },
    favoritesModel: {
      async list() { return favorites; },
      async add(_userId, item) {
        if (!favorites.some(favorite => favorite.id === item.id)) favorites = [...favorites, item];
        return favorites;
      },
      async remove(_userId, id) {
        favorites = favorites.filter(item => item.id !== id);
        return favorites;
      }
    }
  };
}

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

test('autenticação, perfil e favoritos funcionam pelas rotas HTTP', async t => {
  const models = createTestModels();
  const app = createApp({
    artworkModel: { search: async () => ({ artworks: [artwork], warnings: [] }) },
    ...models
  });
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = (path, options = {}) => fetch(`${base}${path}`, options);

  const invalid = await request('/artworks?q=a');
  assert.equal(invalid.status, 400);
  const search = await (await request('/artworks?q=arte')).json();
  assert.equal(search.data.artworks[0].id, 'met-123');

  assert.equal((await request('/favorites')).status, 401);

  const register = await request('/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Pessoa Teste', email: 'teste@example.com', password: 'senha-segura' })
  });
  assert.equal(register.status, 201);
  const cookie = register.headers.get('set-cookie').split(';')[0];
  assert.equal((await register.json()).data.email, 'teste@example.com');

  const authenticated = (path, options = {}) => request(path, {
    ...options, headers: { Cookie: cookie, ...(options.headers || {}) }
  });
  const profile = await (await authenticated('/auth/profile')).json();
  assert.equal(profile.data.name, 'Pessoa Teste');

  const add = await authenticated('/favorites', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(artwork)
  });
  assert.equal(add.status, 201);
  assert.equal((await (await authenticated('/favorites')).json()).data.length, 1);
  await authenticated('/favorites/met-123', { method: 'DELETE' });
  assert.deepEqual((await (await authenticated('/favorites')).json()).data, []);

  const logout = await authenticated('/auth/logout', { method: 'POST' });
  assert.equal(logout.status, 200);
  assert.equal((await authenticated('/auth/profile')).status, 401);
});
