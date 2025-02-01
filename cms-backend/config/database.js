// /cms-backend/config/database.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hellocms:hellocms12345@cms-cluster.ebeio.mongodb.net/news-cms?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('Already connected to MongoDB');
      return;
    }
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;