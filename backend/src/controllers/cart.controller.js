const db = require('../config/db');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) return res.status(400).json({ message: 'product_id wajib diisi' });

  try {
    // Cek stok produk
    const [[product]] = await db.query('SELECT id, stock FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Stok tidak mencukupi' });

    // Insert atau update quantity jika sudah ada
    await db.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, quantity, quantity]
    );

    res.json({ message: 'Produk ditambahkan ke keranjang' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/cart/:id
exports.updateQty = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantity minimal 1' });
  }

  try {
    const [result] = await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Item keranjang tidak ditemukan' });
    res.json({ message: 'Keranjang diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/cart/:id
exports.removeItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Item keranjang tidak ditemukan' });
    res.json({ message: 'Item dihapus dari keranjang' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/cart  (hapus semua)
exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Keranjang dikosongkan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
