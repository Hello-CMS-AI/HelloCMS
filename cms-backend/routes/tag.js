const express = require('express');
const { createTag, getTagById, updateTag, deleteTag, listTags, getTrendingTags, markAsTrending } = require('../controllers/tagController');
const router = express.Router();

// Route to create a new tag
router.post('/add-tag', createTag);

// Route to get all tags
router.get('/list-tags', listTags); // Moved listTags to controller

// Route to get a tag by ID
router.get('/:id', getTagById);

// Route to update a tag by ID
router.put('/update-tag/:id', updateTag);

// Route to delete a tag by ID
router.delete('/delete-tag/:id', deleteTag);

router.get('/trending-tags', getTrendingTags); 

router.put('/mark-as-trending/:id', markAsTrending);

module.exports = router;
