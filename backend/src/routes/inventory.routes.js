const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { inventoryValidators } = require('../validators');
const validate = require('../middleware/validate');

// GET /api/inventory - Get all inventory
router.get('/', inventoryController.getAll);

// GET /api/inventory/stats - Get dashboard statistics
router.get('/stats', inventoryController.getStats);

// GET /api/inventory/movements - Get stock movements history
router.get('/movements', inventoryValidators.getMovements, validate, inventoryController.getMovements);

// GET /api/inventory/:productId - Get inventory by product ID
router.get('/:productId', inventoryValidators.getByProductId, validate, inventoryController.getByProductId);

// POST /api/inventory/:productId/stock - Update stock (IN/OUT)
router.post(
  '/:productId/stock',
  inventoryValidators.updateStock,
  validate,
  inventoryController.updateStock
);

module.exports = router;
