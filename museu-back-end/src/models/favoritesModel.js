export function createFavoritesModel(database) {
  const list = database.prepare(`
    SELECT artwork_id AS id, source, title, artist, artwork_date AS date, image, url
    FROM favorites WHERE user_id = ? ORDER BY created_at DESC
  `);
  const add = database.prepare(`
    INSERT OR IGNORE INTO favorites
      (user_id, artwork_id, source, title, artist, artwork_date, image, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const remove = database.prepare('DELETE FROM favorites WHERE user_id = ? AND artwork_id = ?');

  return {
    list(userId) {
      return list.all(userId);
    },
    add(userId, artwork) {
      add.run(userId, artwork.id, artwork.source, artwork.title, artwork.artist,
        artwork.date, artwork.image, artwork.url);
      return list.all(userId);
    },
    remove(userId, id) {
      remove.run(userId, id);
      return list.all(userId);
    }
  };
}
