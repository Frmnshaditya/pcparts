const db = require('../config/db');

// POST /api/orders  — checkout oleh buyer
exports.createOrder = async (req, res) => {
  const { items, shipping_address } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Keranjang kosong' });
  }
  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({ message: 'Alamat pengiriman wajib diisi' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let totalPrice = 0;

    // Validasi stok dan hitung total
    for (const item of items) {
      const [[product]] = await conn.query(
        'SELECT id, name, price, stock FROM products WHERE id = ?',
        [item.product_id]
      );
      if (!product) throw new Error(`Produk ID ${item.product_id} tidak ditemukan`);
      if (product.stock < item.quantity) {
        throw new Error(`Stok "${product.name}" tidak mencukupi (tersisa: ${product.stock})`);
      }
      totalPrice += parseFloat(product.price) * item.quantity;
    }

    // Buat order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_price, shipping_address) VALUES (?, ?, ?)',
      [req.user.id, totalPrice, shipping_address]
    );
    const orderId = orderResult.insertId;

    // Insert order_items dan kurangi stok
    for (const item of items) {
      const [[product]] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product.price]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Kosongkan keranjang user
    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await conn.commit();

    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      order_id: orderId,
      total_price: totalPrice,
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

// GET /api/orders/my  — riwayat pesanan buyer
exports.getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.total_price, o.shipping_address, o.status, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Ambil item untuk setiap pesanan
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/orders  — semua pesanan (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.total_price, o.shipping_address, o.status, o.created_at,
              u.name AS buyer_name, u.email AS buyer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, oi.price, p.name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/orders/:id/status  — update status (admin)
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatus = ['diproses', 'dikirim', 'selesai'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid. Pilih: diproses, dikirim, atau selesai' });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json({ message: 'Status pesanan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/orders/:id  — detail satu pesanan
exports.getOne = async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
