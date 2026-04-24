// index.js — UniConnect Express server entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize database (creates tables on first run)
require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const partnerRoutes = require('./routes/partners');
const groupRoutes = require('./routes/groups');
const resourceRoutes = require('./routes/resources');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const lostfoundRoutes = require('./routes/lostfound');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');
const todosRoutes = require('./routes/todos');
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lost-found', lostfoundRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found or method not supported' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("[Global Error]:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: 'Internal server error occurred',
    details: err.message || 'Unknown error'
  });
});

// Start server
// boots up the server — everything’s wired, time to listen for incoming requests
app.listen(PORT, () => {
  console.log(`UniConnect server running on http://localhost:${PORT}`);
});
