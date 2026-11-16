import mysql from 'mysql2/promise';

export async function createDatabase(options = {}) {
  const databaseName = options.database || process.env.DB_NAME || 'museu_virtual';
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) throw new Error('Nome de banco MySQL inválido.');
  const connectionOptions = {
    host: options.host || process.env.DB_HOST || '127.0.0.1',
    port: Number(options.port || process.env.DB_PORT || 3306),
    user: options.user || process.env.DB_USER || 'root',
    password: options.password ?? process.env.DB_PASSWORD ?? ''
  };
  const setup = await mysql.createConnection(connectionOptions);
  await setup.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await setup.end();

  const database = mysql.createPool({
    ...connectionOptions,
    database: databaseName,
    charset: 'utf8mb4',
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10
  });
  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(160) NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY users_email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at BIGINT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY sessions_token_unique (token_hash),
      KEY sessions_user_idx (user_id),
      CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    CREATE TABLE IF NOT EXISTS favorites (
      user_id BIGINT UNSIGNED NOT NULL,
      artwork_id VARCHAR(64) NOT NULL,
      source VARCHAR(10) NOT NULL,
      title VARCHAR(500) NOT NULL,
      artist VARCHAR(500) NOT NULL,
      artwork_date VARCHAR(200) NOT NULL,
      image TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, artwork_id),
      CONSTRAINT favorites_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  return database;
}
