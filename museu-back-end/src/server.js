import { resolve } from 'node:path';
import { createApp, createDatabase } from './app.js';

const port = Number(process.env.PORT || 3000);
const database = createDatabase(resolve('data/museu.db'));
const app = createApp({ database });

app.listen(port, () => {
  console.log(`Museu API em http://localhost:${port}`);
});
