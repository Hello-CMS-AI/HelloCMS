const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String },
  language: { type: String },
  sendNotification: { type: Boolean },
  failedAttempts: { type: Number, default: 0 }, // Number of failed login attempts
  lockUntil: { type: Date }, // Timestamp until the account is locked
});

// Pre-save hook to convert username to lowercase
userSchema.pre('save', function (next) {
  this.username = this.username.toLowerCase();
  next();
});

// Method to check if the account is currently locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
