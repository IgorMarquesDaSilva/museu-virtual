import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 7;

function publicUser(user) {
  return user && { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, storedKey] = String(stored).split(':');
  if (!salt || !storedKey) return false;
  const key = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(storedKey, 'hex');
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export function createAuthModel(database) {
  async function findByEmail(email) {
    const [rows] = await database.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0];
  }

  async function findById(id) {
    const [rows] = await database.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  }

  const findSessionSql = `
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > UNIX_TIMESTAMP()
    LIMIT 1
  `;

  async function createSession(userId) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
    await database.execute('DELETE FROM sessions WHERE expires_at <= UNIX_TIMESTAMP()');
    await database.execute('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash(token), expiresAt]);
    return { token, maxAge: SESSION_DAYS * 86400 };
  }

  return {
    async register({ name, email, password }) {
      if (await findByEmail(email)) {
        const error = new Error('Este e-mail já está cadastrado.');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
      try {
        const [result] = await database.execute(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          [name, email, await hashPassword(password)]
        );
        const user = publicUser(await findById(result.insertId));
        return { user, session: await createSession(user.id) };
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') error.code = 'EMAIL_EXISTS';
        throw error;
      }
    },
    async login({ email, password }) {
      const user = await findByEmail(email);
      if (!user || !(await verifyPassword(password, user.password_hash))) return null;
      return { user: publicUser(user), session: await createSession(user.id) };
    },
    async authenticate(token) {
      if (!token) return null;
      const [rows] = await database.execute(findSessionSql, [tokenHash(token)]);
      return publicUser(rows[0]);
    },
    async logout(token) {
      if (token) await database.execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash(token)]);
    },
    async update(userId, { name, email }) {
      const existing = await findByEmail(email);
      if (existing && existing.id !== userId) {
        const error = new Error('Este e-mail já está cadastrado.');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
      try {
        await database.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
        return publicUser(await findById(userId));
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') error.code = 'EMAIL_EXISTS';
        throw error;
      }
    }
  };
}
