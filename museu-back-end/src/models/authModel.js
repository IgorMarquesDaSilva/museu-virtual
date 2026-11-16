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
  const findByEmail = database.prepare('SELECT * FROM users WHERE email = ?');
  const findById = database.prepare('SELECT * FROM users WHERE id = ?');
  const insertUser = database.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  const updateUser = database.prepare(`
    UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  const insertSession = database.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)
  `);
  const findSession = database.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > unixepoch()
  `);
  const deleteSession = database.prepare('DELETE FROM sessions WHERE token_hash = ?');
  const deleteExpired = database.prepare('DELETE FROM sessions WHERE expires_at <= unixepoch()');

  function createSession(userId) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
    deleteExpired.run();
    insertSession.run(userId, tokenHash(token), expiresAt);
    return { token, maxAge: SESSION_DAYS * 86400 };
  }

  return {
    async register({ name, email, password }) {
      if (findByEmail.get(email)) {
        const error = new Error('Este e-mail já está cadastrado.');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
      const result = insertUser.run(name, email, await hashPassword(password));
      const user = publicUser(findById.get(result.lastInsertRowid));
      return { user, session: createSession(user.id) };
    },
    async login({ email, password }) {
      const user = findByEmail.get(email);
      if (!user || !(await verifyPassword(password, user.password_hash))) return null;
      return { user: publicUser(user), session: createSession(user.id) };
    },
    authenticate(token) {
      return token ? publicUser(findSession.get(tokenHash(token))) : null;
    },
    logout(token) {
      if (token) deleteSession.run(tokenHash(token));
    },
    update(userId, { name, email }) {
      const existing = findByEmail.get(email);
      if (existing && existing.id !== userId) {
        const error = new Error('Este e-mail já está cadastrado.');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
      updateUser.run(name, email, userId);
      return publicUser(findById.get(userId));
    }
  };
}
