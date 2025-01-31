const express = require('express');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const router = express.Router();

router.post('/add-category', createCategory);
router.get('/list-categories', getAllCategories);
router.get('/:id', getCategoryById); // Fetch category details by ID
router.put('/update-category/:id', updateCategory); // Update category details
router.delete('/delete-category/:id', deleteCategory); 

module.exports = router;
