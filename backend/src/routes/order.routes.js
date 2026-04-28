const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', ctrl.createOrder);
router.get('/my', ctrl.getUserOrders);
router.get('/', adminOnly, ctrl.getAllOrders);
router.get('/:id', ctrl.getOne);
router.put('/:id/status', adminOnly, ctrl.updateStatus);

module.exports = router;
