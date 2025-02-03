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

// ✅ Improved CORS Handling
const allowedOrigins = ['https://hellocms.netlify.app:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, // Ensures OPTIONS requests get handled automatically
}));

app.use(express.json());

// ✅ Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Connect to MongoDB with Improved Error Handling
connectDB().then(() => {
    console.log('✅ MongoDB Connected Successfully');
}).catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // Stop the app if DB connection fails
});

// ✅ Root route to check server status
app.get('/', (req, res) => res.send('CMS Backend is running'));

// ✅ API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/live-updates', liveUpdateRoutes);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('🚨 Server Error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
