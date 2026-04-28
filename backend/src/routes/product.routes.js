const router = require('express').Router();
const ctrl = require('../controllers/product.controller');

const { verifyToken, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 🔥 DEBUG MIDDLEWARE
const logUpload = (req, res, next) => {
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);
  next();
};

// ================= GET =================
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// ================= CREATE =================
router.post(
  '/',
  verifyToken,
  adminOnly,
  upload.single('image'),
  logUpload, // 🔥 debug
  ctrl.createProduct
);

// ================= UPDATE =================
router.put(
  '/:id',
  verifyToken,
  adminOnly,
  upload.single('image'),
  logUpload, // 🔥 debug
  ctrl.updateProduct
);

// ================= DELETE =================
router.delete('/:id', verifyToken, adminOnly, ctrl.deleteProduct);

module.exports = router;