const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:id', ctrl.updateQty);
router.delete('/clear', ctrl.clearCart);
router.delete('/:id', ctrl.removeItem);

module.exports = router;
