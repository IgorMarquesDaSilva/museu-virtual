import { sendData, sendError } from '../views/jsonView.js';

const COOKIE_NAME = 'museu_session';

function sessionToken(request) {
  const cookies = String(request.headers.cookie || '').split(';');
  const cookie = cookies.find(item => item.trim().startsWith(`${COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(COOKIE_NAME.length + 1)) : '';
}

function validName(value) {
  return typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 80;
}

function normalizedEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160 ? email : '';
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 72;
}

function setSessionCookie(response, session) {
  response.cookie(COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: session.maxAge * 1000,
    path: '/'
  });
}

export function createAuthController(authModel) {
  return {
    requireAuth(request, response, next) {
      const user = authModel.authenticate(sessionToken(request));
      if (!user) return sendError(response, 'Faça login para continuar.', 401);
      request.user = user;
      next();
    },
    async register(request, response) {
      const name = String(request.body?.name || '').trim();
      const email = normalizedEmail(request.body?.email);
      const password = request.body?.password;
      if (!validName(name)) return sendError(response, 'Informe um nome de 2 a 80 caracteres.', 400);
      if (!email) return sendError(response, 'Informe um e-mail válido.', 400);
      if (!validPassword(password)) return sendError(response, 'A senha deve ter de 8 a 72 caracteres.', 400);
      try {
        const result = await authModel.register({ name, email, password });
        setSessionCookie(response, result.session);
        sendData(response, result.user, 201);
      } catch (error) {
        sendError(response, error.code === 'EMAIL_EXISTS' ? error.message : 'Não foi possível criar a conta.',
          error.code === 'EMAIL_EXISTS' ? 409 : 500);
      }
    },
    async login(request, response) {
      const email = normalizedEmail(request.body?.email);
      const password = request.body?.password;
      if (!email || typeof password !== 'string') return sendError(response, 'E-mail ou senha inválidos.', 401);
      const result = await authModel.login({ email, password });
      if (!result) return sendError(response, 'E-mail ou senha inválidos.', 401);
      setSessionCookie(response, result.session);
      sendData(response, result.user);
    },
    logout(request, response) {
      authModel.logout(sessionToken(request));
      response.clearCookie(COOKIE_NAME, { path: '/' });
      sendData(response, { loggedOut: true });
    },
    profile(request, response) {
      sendData(response, request.user);
    },
    updateProfile(request, response) {
      const name = String(request.body?.name || '').trim();
      const email = normalizedEmail(request.body?.email);
      if (!validName(name)) return sendError(response, 'Informe um nome de 2 a 80 caracteres.', 400);
      if (!email) return sendError(response, 'Informe um e-mail válido.', 400);
      try {
        sendData(response, authModel.update(request.user.id, { name, email }));
      } catch (error) {
        sendError(response, error.code === 'EMAIL_EXISTS' ? error.message : 'Não foi possível atualizar o perfil.',
          error.code === 'EMAIL_EXISTS' ? 409 : 500);
      }
    }
  };
}
