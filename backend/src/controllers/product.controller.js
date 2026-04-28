const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// ================= GET ALL =================
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('GET ALL ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET ONE =================
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET ONE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= CREATE =================
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  console.log('UPLOAD FILE:', image);

  try {
    await db.query(
      `INSERT INTO products 
      (name, description, price, stock, image, category_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        price,
        stock || 0,
        image,
        category_id || null,
      ]
    );

    res.json({ message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    console.error('CREATE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= UPDATE =================
exports.updateProduct = async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT image FROM products WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const oldImage = rows[0].image;
    const newImage = req.file ? req.file.filename : oldImage;

    // 🔥 hapus gambar lama kalau upload baru
    if (req.file && oldImage) {
      const filePath = path.join(__dirname, '../../uploads', oldImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query(
      `UPDATE products 
       SET name=?, description=?, price=?, stock=?, image=?, category_id=? 
       WHERE id=?`,
      [
        name,
        description,
        price,
        stock,
        newImage,
        category_id,
        req.params.id,
      ]
    );

    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= DELETE =================
exports.deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT image FROM products WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Produk tidak ditemukan',
      });
    }

    const image = rows[0].image;

    // 🔥 hapus file gambar
    if (image) {
      const filePath = path.join(__dirname, '../../uploads', image);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Gambar dihapus:', image);
      }
    }

    await db.query(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Produk & gambar berhasil dihapus',
    });

  } catch (err) {
    console.error('DELETE ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};