const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

// ================= AUTH ROUTES =================

// Register
router.post('/register', ctrl.register);

// Login
router.post('/login', (req, res, next) => {
  console.log('🔥 LOGIN ROUTE TERPANGGIL');
  next();
}, ctrl.login);

// Get current user
router.get('/me', verifyToken, ctrl.me);

module.exports = router;