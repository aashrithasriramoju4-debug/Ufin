const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { addProduce, getAllProduce, getMyProduce, updateProduceStatus, matchProduce } = require('../controllers/produceController');
const { authMiddleware, roleCheck } = require('../services/auth');

router.post('/add', authMiddleware, roleCheck(['farmer']), [
  body('type').notEmpty(),
  body('quantity').isNumeric(),
  body('freshness').isNumeric().custom(v => v >= 0 && v <= 10),
  body('damage').isNumeric().custom(v => v >= 0 && v <= 10),
  body('location').isArray().custom(arr => arr.length === 2),
  body('sellerName').notEmpty(),
  body('sellerPhone').notEmpty(),
  body('sellerEmail').isEmail()
], addProduce);

router.get('/all', getAllProduce);
router.get('/mine', authMiddleware, getMyProduce);
router.put('/:id/status', authMiddleware, updateProduceStatus);
router.post('/match', authMiddleware, matchProduce);

module.exports = router;
