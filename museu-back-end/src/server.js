import { resolve } from 'node:path';
import { createApp, createFavoritesModel } from './app.js';

const port = Number(process.env.PORT || 3000);
const favoritesModel = createFavoritesModel(resolve('data/favorites.json'));
const app = createApp({ favoritesModel });

app.listen(port, () => {
  console.log(`Museu API em http://localhost:${port}`);
});
