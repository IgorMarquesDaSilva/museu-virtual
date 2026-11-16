import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createFavoritesModel(filePath) {
  let queue = Promise.resolve();

  async function read() {
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function write(items) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
  }

  function update(operation) {
    const next = queue.then(async () => {
      const items = await read();
      const updated = operation(items);
      await write(updated);
      return updated;
    });
    queue = next.catch(() => {});
    return next;
  }

  return {
    list: read,
    add(artwork) {
      return update(items => items.some(item => item.id === artwork.id) ? items : [...items, artwork]);
    },
    remove(id) {
      return update(items => items.filter(item => item.id !== id));
    }
  };
}
