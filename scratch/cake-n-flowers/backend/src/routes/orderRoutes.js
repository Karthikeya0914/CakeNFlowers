const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.post('/confirm-payment', orderController.confirmPayment);
router.get('/track/:orderNumber', orderController.getOrderTracking);
router.get('/my-orders', requireAuth, orderController.getMyOrders);

module.exports = router;
