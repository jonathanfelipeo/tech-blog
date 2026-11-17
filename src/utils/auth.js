const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const PASSWORD_KEY_LENGTH = 64;
const TOKEN_TTL_SECONDS = 24 * 60 * 60;

const getTokenSecret = () => {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('AUTH_TOKEN_SECRET não está configurado.');
  }
  return secret;
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedHash) => {
  if (!storedHash) return false;

  const [salt, key] = storedHash.split(':');
  if (!salt || !key || !/^[a-f0-9]+$/i.test(key)) return false;

  const expectedKey = Buffer.from(key, 'hex');
  if (expectedKey.length !== PASSWORD_KEY_LENGTH) return false;

  const actualKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH);
  return crypto.timingSafeEqual(expectedKey, actualKey);
};

const createAuthToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
};

const verifyAuthToken = (token) => {
  const [payload, signature] = (token || '').split('.');
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest();

  let actualSignature;
  try {
    actualSignature = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }

  if (
    actualSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!user.sub || !['teacher', 'student'].includes(user.role) || user.exp <= Date.now() / 1000) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');
    const user = scheme === 'Bearer' ? verifyAuthToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'Autenticação necessária.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Erro ao validar autenticação:', error.message);
    return res.status(500).json({ error: 'Erro ao validar autenticação.' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ error: 'Você não tem permissão para esta ação.' });
  }
  return next();
};

module.exports = {
  hashPassword,
  verifyPassword,
  createAuthToken,
  verifyAuthToken,
  requireAuth,
  requireRole,
};
