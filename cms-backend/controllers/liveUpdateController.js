// controllers/liveUpdateController.js
const Post = require('../models/post');
const LiveUpdate = require('../models/LiveUpdate');

const MAX_PINNED = 2;


exports.createLiveUpdate = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, createdBy } = req.body;

    // ensure post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (!content) {
      return res.status(400).json({ message: 'Update content is required.' });
    }

    const newUpdate = await LiveUpdate.create({
      postId,
      title,
      content,
      createdBy,
    });

    res.status(201).json(newUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating live update.' });
  }
};

exports.getLiveUpdatesByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const updates = await LiveUpdate.find({ postId }).sort({ postedAt: 1 });
    res.json(updates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching live updates.' });
  }
};

/**
 * Edit a specific live update.
 * PUT /api/live-updates/:updateId
 * Body: { title, content, pinned }
 */
exports.editLiveUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { title, content, pinned } = req.body;

    // 1) Find existing live update
    const updateDoc = await LiveUpdate.findById(updateId);
    if (!updateDoc) {
      return res.status(404).json({ message: 'Live update not found.' });
    }

    // 2) If "pinned" is set to true, check pin limit
    if (pinned === true) {
      // Count how many pinned updates already exist for this postId
      const pinnedCount = await LiveUpdate.countDocuments({
        postId: updateDoc.postId,
        pinned: true
      });
      // If we already have MAX_PINNED => can't pin more
      if (pinnedCount >= MAX_PINNED && updateDoc.pinned === false) {
        return res.status(400).json({
          message: `Cannot pin more than ${MAX_PINNED} updates.`
        });
      }
    }

    // 3) Update fields if provided
    if (typeof title !== 'undefined') {
      updateDoc.title = title;
    }
    if (typeof content !== 'undefined') {
      updateDoc.content = content;
    }
    if (typeof pinned !== 'undefined') {
      updateDoc.pinned = pinned;
    }

    await updateDoc.save();

    return res.json({
      message: 'Live update edited successfully.',
      liveUpdate: updateDoc
    });
  } catch (error) {
    console.error('Error editing live update:', error);
    return res
      .status(500)
      .json({ message: 'Error editing live update.' });
  }
};

/**
 * Delete a specific live update.
 * DELETE /api/live-updates/:updateId
 */
exports.deleteLiveUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;

    const removed = await LiveUpdate.findByIdAndDelete(updateId);
    if (!removed) {
      return res.status(404).json({ message: 'Live update not found.' });
    }
    return res.json({
      message: 'Live update deleted successfully.',
      removed
    });
  } catch (error) {
    console.error('Error deleting live update:', error);
    return res
      .status(500)
      .json({ message: 'Error deleting live update.' });
  }
};

/**
 * Optional: If you prefer a dedicated route for "pin/unpin".
 * PUT /api/live-updates/pin/:updateId
 * Body: { pin: true or false }
 */
exports.pinLiveUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { pin } = req.body; // boolean

    const updateDoc = await LiveUpdate.findById(updateId);
    if (!updateDoc) {
      return res.status(404).json({ message: 'Live update not found.' });
    }

    if (pin === true) {
      // check how many pinned updates for this post
      const pinnedCount = await LiveUpdate.countDocuments({
        postId: updateDoc.postId,
        pinned: true
      });
      if (pinnedCount >= MAX_PINNED && !updateDoc.pinned) {
        return res
          .status(400)
          .json({ message: `Cannot pin more than ${MAX_PINNED} updates.` });
      }
    }

    updateDoc.pinned = !!pin;
    await updateDoc.save();

    return res.json({
      message: pin ? 'Update pinned!' : 'Update unpinned!',
      liveUpdate: updateDoc
    });
  } catch (error) {
    console.error('Error pinning live update:', error);
    return res
      .status(500)
      .json({ message: 'Error pinning live update.' });
  }
};

