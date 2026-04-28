const mysql = require('mysql2/promise');
require('dotenv').config();

// 🔍 DEBUG ENV (hapus nanti kalau sudah aman)
console.log('DB CONFIG:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : '(kosong)',
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // default kosong (XAMPP)
  database: process.env.DB_NAME || 'pcparts',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🔥 TEST KONEKSI SAAT START SERVER
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

module.exports = pool;