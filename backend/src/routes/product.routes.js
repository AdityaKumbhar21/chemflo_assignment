const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { productValidators } = require('../validators');
const validate = require('../middleware/validate');

// GET /api/products - Get all products with search/filter
router.get('/', productValidators.search, validate, productController.getAll);

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock', productController.getLowStock);

// GET /api/products/:id - Get product by ID
router.get('/:id', productValidators.getById, validate, productController.getById);

// POST /api/products - Create new product
router.post('/', productValidators.create, validate, productController.create);

// PUT /api/products/:id - Update product
router.put('/:id', productValidators.update, validate, productController.update);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productValidators.delete, validate, productController.remove);

module.exports = router;
