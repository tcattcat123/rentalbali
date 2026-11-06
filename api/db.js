// MySQL connection helper для Vercel serverless.
// Env vars (Vercel -> Settings -> Environment Variables):
//   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
//   ADMIN_SECRET — токен для доступа к админ-API (POST/PUT/DELETE)

const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'rentalbali',
      connectionLimit: 5,
      charset: 'utf8mb4',
      acquireTimeout: 10000,
      timeout: 10000,
    });
  }
  return pool;
}

// Проверка админ-токена. Возвращает true если доступ разрешён, иначе отправляет 401 и возвращает false.
function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SECRET || '';
  const token = (req.headers['authorization'] || '').replace(/^Bearer\s+/, '');
  if (!secret) {
    // dev-режим без секрета — разрешаем (предназначено только для локальной отладки)
    return true;
  }
  if (!token || token !== secret) {
    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({ ok: false, error: 'admin required' });
    return false;
  }
  return true;
}

module.exports = { getPool, requireAdmin };
