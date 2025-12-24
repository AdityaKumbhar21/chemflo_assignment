const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { categoryValidators } = require('../validators');
const validate = require('../middleware/validate');

// GET /api/categories - Get all categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryValidators.getById, validate, categoryController.getById);

// POST /api/categories - Create new category
router.post('/', categoryValidators.create, validate, categoryController.create);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryValidators.update, validate, categoryController.update);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryValidators.delete, validate, categoryController.remove);

module.exports = router;
