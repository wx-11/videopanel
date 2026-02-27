import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const loadDotEnv = (envPath = path.resolve(process.cwd(), '.env')) => {
  try {
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) return;
      const key = trimmed.slice(0, eqIndex).trim();
      if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) return;
      let value = trimmed.slice(eqIndex + 1).trim();
      if (!value) {
        process.env[key] = '';
        return;
      }
      const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
      if (quoted) value = value.slice(1, -1);
      process.env[key] = value;
    });
  } catch (e) {
    // ignore dotenv failures
  }
};

loadDotEnv();

const envFlag = (value, fallback = false) => {
  const str = String(value ?? '').trim().toLowerCase();
  if (!str) return fallback;
  return str === '1' || str === 'true' || str === 'yes' || str === 'on';
};

const AUTH_ENABLED = envFlag(process.env.AUTH_ENABLED, false);
const AUTH_PASSWORD = String(process.env.AUTH_PASSWORD || '').trim();
const AUTH_SECRET = String(process.env.AUTH_SECRET || AUTH_PASSWORD || 'sora2-manager').trim();
const AUTH_COOKIE_NAME = String(process.env.AUTH_COOKIE_NAME || 'sora2_manager_session_v1').trim() || 'sora2_manager_session_v1';
const AUTH_SESSION_DAYS = Math.max(1, parseInt(process.env.AUTH_SESSION_DAYS || '7', 10) || 7);

const SORA2API_BASE_URL = String(process.env.SORA2API_BASE_URL || '').trim();
const SORA2API_KEY = String(process.env.SORA2API_KEY || '').trim();

const PORT = Math.max(1, parseInt(process.env.PORT || '18130', 10) || 18130);
const HOST = String(process.env.HOST || '0.0.0.0').trim() || '0.0.0.0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const json = (res, statusCode, data) => {
  const payload = Buffer.from(JSON.stringify(data ?? {}));
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
};

const readJsonBody = async (req, maxBytes = 64 * 1024) => {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maxBytes) {
      const err = new Error('Payload too large');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return null;
  return JSON.parse(text);
};

const parseCookies = (cookieHeader) => {
  const out = {};
  const raw = String(cookieHeader || '');
  if (!raw) return out;
  raw.split(';').forEach((part) => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
};

const base64UrlEncode = (input) => Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const base64UrlDecode = (input) => {
  const str = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  return Buffer.from(str + pad, 'base64').toString('utf8');
};

const signToken = (payloadObj) => {
  const payload = base64UrlEncode(JSON.stringify(payloadObj));
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `${payload}.${sig}`;
};

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const verifyToken = (token) => {
  try {
    const [payload, sig] = String(token || '').split('.');
    if (!payload || !sig) return { ok: false };
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    if (!safeEqual(expected, sig)) return { ok: false };
    const data = JSON.parse(base64UrlDecode(payload));
    const exp = Number(data?.exp || 0);
    if (!Number.isFinite(exp) || exp <= Date.now()) return { ok: false };
    return { ok: true, data };
  } catch (e) {
    return { ok: false };
  }
};

const isHttpsRequest = (req) => {
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return proto === 'https';
};

const setSessionCookie = (res, token, req) => {
  const maxAgeSeconds = AUTH_SESSION_DAYS * 24 * 60 * 60;
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isHttpsRequest(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

const clearSessionCookie = (res, req) => {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttpsRequest(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

const getAuthStatus = (req) => {
  if (!AUTH_ENABLED) return { enabled: false, authed: true };
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return { enabled: true, authed: false };
  return { enabled: true, authed: verifyToken(token).ok };
};

const getUpstreamUrl = (reqUrl) => {
  if (!SORA2API_BASE_URL) return null;
  const base = new URL(SORA2API_BASE_URL);
  const basePath = base.pathname && base.pathname !== '/' ? base.pathname.replace(/\/+$/g, '') : '';
  const incoming = String(reqUrl || '/');
  const incomingPath = incoming.startsWith('/') ? incoming : `/${incoming}`;
  const hasPrefix = basePath && incomingPath.startsWith(`${basePath}/`);
  const finalPath = hasPrefix ? incomingPath : `${basePath}${incomingPath}`;
  return new URL(finalPath, base.origin);
};

const proxyToUpstream = (req, res) => {
  const upstream = getUpstreamUrl(req.url);
  if (!upstream) {
    json(res, 500, { error: 'Missing SORA2API_BASE_URL' });
    return;
  }

  const isHttps = upstream.protocol === 'https:';
  const transport = isHttps ? https : http;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers.upgrade;
  delete headers['proxy-connection'];
  delete headers['sec-websocket-key'];
  delete headers['sec-websocket-version'];
  delete headers['sec-websocket-protocol'];
  delete headers['sec-websocket-extensions'];

  if (SORA2API_KEY) headers.authorization = `Bearer ${SORA2API_KEY}`;

  const proxyReq = transport.request(
    {
      protocol: upstream.protocol,
      hostname: upstream.hostname,
      port: upstream.port || (isHttps ? 443 : 80),
      method: req.method,
      path: `${upstream.pathname}${upstream.search}`,
      headers,
    },
    (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['transfer-encoding'];

      res.writeHead(proxyRes.statusCode || 500, responseHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    if (res.headersSent) return;
    json(res, 502, { error: 'Upstream request failed', message: String(err?.message || err) });
  });

  req.on('aborted', () => {
    try { proxyReq.destroy(); } catch (e) { }
  });

  req.pipe(proxyReq);
};

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

const serveFile = (req, res, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES.get(ext) || 'application/octet-stream';

    const headers = {
      'Content-Type': mime,
      'Content-Length': stat.size,
    };

    const urlPath = String(req.url || '').split('?')[0];
    if (urlPath.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=604800, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return true;
    }

    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch (e) {
    return false;
  }
};

const serveStatic = (req, res) => {
  const requestPath = String(req.url || '/').split('?')[0];
  const decodedPath = (() => {
    try { return decodeURIComponent(requestPath); } catch { return requestPath; }
  })();

  const safePath = decodedPath.replace(/\\/g, '/');
  const rel = safePath.startsWith('/') ? safePath.slice(1) : safePath;
  const candidate = path.resolve(DIST_DIR, rel);

  if (!candidate.startsWith(DIST_DIR)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Bad Request');
    return;
  }

  const hasExtension = path.basename(candidate).includes('.');
  const served = serveFile(req, res, candidate);
  if (served) return;

  if (hasExtension) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Not Found');
    return;
  }

  const indexPath = path.resolve(DIST_DIR, 'index.html');
  if (serveFile(req, res, indexPath)) return;

  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end('Missing dist build');
};

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const pathname = String(req.url || '/').split('?')[0];

  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('ok');
    return;
  }

  if (pathname === '/auth/status') {
    json(res, 200, getAuthStatus(req));
    return;
  }

  if (pathname === '/auth/login') {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method Not Allowed' });
      return;
    }
    if (!AUTH_ENABLED) {
      json(res, 200, { ok: true, enabled: false });
      return;
    }
    if (!AUTH_PASSWORD) {
      json(res, 500, { error: 'AUTH_PASSWORD is required when AUTH_ENABLED=true' });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const password = String(body?.password || '').trim();
      if (!password || !safeEqual(password, AUTH_PASSWORD)) {
        json(res, 401, { ok: false, error: 'Invalid password' });
        return;
      }
      const exp = Date.now() + AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000;
      const token = signToken({ v: 1, exp });
      setSessionCookie(res, token, req);
      json(res, 200, { ok: true });
    } catch (e) {
      const status = Number(e?.statusCode || 500);
      json(res, status, { ok: false, error: String(e?.message || e) });
    }
    return;
  }

  if (pathname === '/auth/logout') {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method Not Allowed' });
      return;
    }
    clearSessionCookie(res, req);
    json(res, 200, { ok: true });
    return;
  }

  if (pathname.startsWith('/v1/')) {
    const auth = getAuthStatus(req);
    if (auth.enabled && !auth.authed) {
      res.setHeader('X-Sora2-Manager-Auth', 'required');
      json(res, 401, { error: 'Unauthorized' });
      return;
    }
    proxyToUpstream(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Method Not Allowed');
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[sora2-manager] gateway listening on http://${HOST}:${PORT}`);
  // eslint-disable-next-line no-console
  if (AUTH_ENABLED) console.log(`[sora2-manager] auth enabled: cookie=${AUTH_COOKIE_NAME}, sessionDays=${AUTH_SESSION_DAYS}`);
  // eslint-disable-next-line no-console
  if (SORA2API_BASE_URL) console.log(`[sora2-manager] upstream: ${SORA2API_BASE_URL}`);
});
