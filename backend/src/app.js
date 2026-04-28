const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes     = require('./routes/cart.routes');
const orderRoutes    = require('./routes/order.routes');

const app = express();

// ================= CORS =================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.options('*', cors());

// ================= BODY PARSER =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILE =================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ================= DEBUG LOGGER =================
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ================= ROUTES =================
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PCParts API berjalan' });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);

  // 🔥 HANDLE ERROR MULTER
  if (err.message.includes('File harus') || err.message.includes('Hanya file')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ PCParts backend berjalan di http://localhost:${PORT}`);
});