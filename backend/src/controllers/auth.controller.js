const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ================= REGISTER =================
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Nama, email, dan password wajib diisi',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password minimal 6 karakter',
    });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Email sudah terdaftar',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'buyer']
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user_id: result.insertId,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  const { email, password } = req.body;

  // ❌ cegah cache (biar tidak 304 lagi)
  res.set('Cache-Control', 'no-store');

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password wajib diisi',
    });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Email atau password salah',
      });
    }

    const user = users[0];

    let isMatch = false;

    // 🔥 HANDLE HASH & PLAIN TEXT
    if (user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({
        message: 'Email atau password salah',
      });
    }

    // 🔥 AUTO HASH kalau masih plain
    if (!user.password.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashed, user.id]
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ================= GET ME =================
const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// 🔥 EXPORT WAJIB (INI YANG BIKIN TADI ERROR)
module.exports = {
  register,
  login,
  me,
};