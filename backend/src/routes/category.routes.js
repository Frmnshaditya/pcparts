const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.post('/', verifyToken, adminOnly, ctrl.create);
router.put('/:id', verifyToken, adminOnly, ctrl.update);
router.delete('/:id', verifyToken, adminOnly, ctrl.remove);

module.exports = router;
