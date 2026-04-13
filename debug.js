// Debug script
const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/auth');

console.log('register type:', typeof authController.register);
console.log('login type:', typeof authController.login);
console.log('authMiddleware type:', typeof authMiddleware);

// Now try to manually use them as Express would
const express = require('express');
const router = express.Router();

// Test registering the route
router.post('/register', authController.register);

console.log('Route registered successfully');
console.log('router.stack:', router.stack.map(l => l.route && l.route.path));