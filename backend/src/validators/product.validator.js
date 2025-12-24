const { body, param, query } = require('express-validator');

const productValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Product name must be between 2 and 200 characters'),
    body('casNumber')
      .trim()
      .notEmpty()
      .withMessage('CAS Number is required')
      .matches(/^\d{1,7}-\d{2}-\d$/)
      .withMessage('CAS Number must be in valid format (e.g., 7732-18-5)'),
    body('unit')
      .notEmpty()
      .withMessage('Unit is required')
      .isIn(['KG', 'MT', 'LITRE'])
      .withMessage('Unit must be one of: KG, MT, LITRE'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Invalid category ID'),
    body('lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative integer'),
    body('initialStock')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Initial stock must be a non-negative number'),
  ],

  update: [
    param('id').isUUID().withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Product name must be between 2 and 200 characters'),
    body('casNumber')
      .optional()
      .trim()
      .matches(/^\d{1,7}-\d{2}-\d$/)
      .withMessage('CAS Number must be in valid format (e.g., 7732-18-5)'),
    body('unit')
      .optional()
      .isIn(['KG', 'MT', 'LITRE'])
      .withMessage('Unit must be one of: KG, MT, LITRE'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('categoryId')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      })
      .withMessage('Invalid category ID'),
    body('lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative integer'),
  ],

  getById: [param('id').isUUID().withMessage('Invalid product ID')],

  delete: [param('id').isUUID().withMessage('Invalid product ID')],

  search: [
    query('search')
      .optional()
      .trim(),
    query('categoryId')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      })
      .withMessage('Invalid category ID'),
    query('page')
      .optional()
      .toInt(),
    query('limit')
      .optional()
      .toInt(),
  ],
};

module.exports = productValidators;
