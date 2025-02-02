// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const postRoutes = require('./routes/posts'); 
const imageRoutes = require('./routes/images');
const liveUpdateRoutes = require('./routes/liveUpdateRoutes');

require('./tasks/cronJobs');

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3001', // Allow your frontend origin
    credentials: true, // Include cookies if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow required HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  }));
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => res.send('CMS Backend is running'));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/live-updates', liveUpdateRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
