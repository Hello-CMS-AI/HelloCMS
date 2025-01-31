// models/LiveUpdate.js
const mongoose = require('mongoose');

const liveUpdateSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  title: String,
  content: { type: String, required: true },
  postedAt: { type: Date, default: Date.now },
  createdBy: String,

  // NEW FIELD
  pinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('LiveUpdate', liveUpdateSchema);
