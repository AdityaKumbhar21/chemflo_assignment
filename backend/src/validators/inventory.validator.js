const { body, param, query } = require('express-validator');

const inventoryValidators = {
  updateStock: [
    param('productId').isUUID().withMessage('Invalid product ID'),
    body('type')
      .notEmpty()
      .withMessage('Movement type is required')
      .isIn(['IN', 'OUT'])
      .withMessage('Type must be either IN or OUT'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isFloat({ gt: 0 })
      .withMessage('Quantity must be a positive number'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters'),
  ],

  getByProductId: [param('productId').isUUID().withMessage('Invalid product ID')],

  getMovements: [
    query('productId')
      .optional({ nullable: true })
      .custom((value) => {
        if (!value || value === '' || value === null) return true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      })
      .withMessage('Invalid product ID'),
    query('type')
      .optional({ nullable: true })
      .custom((value) => {
        if (!value || value === '') return true;
        return ['IN', 'OUT'].includes(value);
      })
      .withMessage('Type must be either IN or OUT'),
    query('startDate')
      .optional({ nullable: true })
      .custom((value) => {
        if (!value || value === '') return true;
        return !isNaN(Date.parse(value));
      })
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional({ nullable: true })
      .custom((value) => {
        if (!value || value === '') return true;
        return !isNaN(Date.parse(value));
      })
      .withMessage('Invalid end date format'),
    query('page')
      .optional()
      .toInt()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .toInt()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
};

module.exports = inventoryValidators;
