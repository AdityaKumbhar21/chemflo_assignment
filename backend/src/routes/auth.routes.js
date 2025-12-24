const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
