export function createFavoritesModel(database) {
  const listSql = `
    SELECT artwork_id AS id, source, title, artist, artwork_date AS date, image, url
    FROM favorites WHERE user_id = ? ORDER BY created_at DESC
  `;
  const addSql = `
    INSERT IGNORE INTO favorites
      (user_id, artwork_id, source, title, artist, artwork_date, image, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  async function list(userId) {
    const [rows] = await database.execute(listSql, [userId]);
    return rows;
  }

  return {
    list,
    async add(userId, artwork) {
      await database.execute(addSql, [userId, artwork.id, artwork.source, artwork.title,
        artwork.artist, artwork.date, artwork.image, artwork.url]);
      return list(userId);
    },
    async remove(userId, id) {
      await database.execute('DELETE FROM favorites WHERE user_id = ? AND artwork_id = ?', [userId, id]);
      return list(userId);
    }
  };
}
