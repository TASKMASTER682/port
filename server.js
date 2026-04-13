// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://molio-ktvp.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Import Routes
const leadRoutes = require('./routes/leadRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const blogRoutes = require('./routes/blogRoutes');

console.log('Loading auth routes...');
const authRoutes = require('./routes/authRoutes');
console.log('Auth routes loaded');

// Use Routes
app.use('/api/leads', leadRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio CRM API is running!' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Keep server alive (prevent Render.com sleep)
const keepAlive = () => {
  const interval = 14 * 60 * 1000; // 14 minutes
  setInterval(() => {
    const url = process.env.KEEP_ALIVE_URL || `http://localhost:${PORT}`;
    fetch(url).catch(console.error);
  }, interval);
  console.log('⏰ Keep-alive cron job started');
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  keepAlive();
});