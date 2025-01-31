// routes/liveUpdateRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLiveUpdate,
  getLiveUpdatesByPostId,
  editLiveUpdate,
  deleteLiveUpdate,
  pinLiveUpdate,
} = require('../controllers/liveUpdateController');

// Create a new update for a specific post
router.post('/:postId', createLiveUpdate);

// Retrieve all updates for a given post
router.get('/:postId', getLiveUpdatesByPostId);

/** EDIT a specific update */
router.put('/:updateId', editLiveUpdate);

/** DELETE a specific update */
router.delete('/:updateId', deleteLiveUpdate);

/** (Optional) PIN a specific update */
router.put('/pin/:updateId', pinLiveUpdate);

module.exports = router;
