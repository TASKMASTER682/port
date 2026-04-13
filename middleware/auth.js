// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};