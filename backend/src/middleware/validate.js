const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.badRequest(res, 'Validation failed', errors.array());
  }
  next();
};

module.exports = validate;
