const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', optionalAuth, reviewController.createReview);

module.exports = router;
