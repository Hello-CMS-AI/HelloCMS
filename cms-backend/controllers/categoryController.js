const Category = require('../models/category');
const Post = require('../models/post');

// Function to update the category's "Last Updated" field based on the latest post's publish date
const updateCategoryLastUpdated = async (categoryId) => {
  try {
    // Find the latest published post in the category
    const latestPost = await Post.findOne({ category: categoryId, publishedAt: { $ne: null } }) // Only consider posts with a 'publishedAt' date
      .sort({ publishedAt: -1 }) // Sort by the latest publish date
      .limit(1); // Limit to one post, the most recent

    if (latestPost) {
      // Update the category with the latest post's publish date
      await Category.findByIdAndUpdate(categoryId, {
        lastUpdated: latestPost.publishedAt // Set the category's "Last Updated" field to the latest post's publishedAt
      });
    }
  } catch (error) {
    console.error('Error updating category last updated:', error);
  }
};

// Controller to create a new category
const createCategory = async (req, res) => {
  let { name, slug, parentCategory, description, keywords } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    // Trim and sanitize the name (ensure no extra spaces)
    name = name.trim().replace(/\s+/g, ' '); // Replace multiple spaces with a single space

    // Sanitize the slug: if provided manually, trim and replace spaces with hyphens
    if (slug) {
      slug = slug.trim().replace(/\s+/g, '-').toLowerCase(); // Trim and replace spaces with hyphens
    } else {
      // Generate a slug if not provided
      slug = (parentCategory 
        ? `${name.toLowerCase().replace(/ /g, "-")}-${(await Category.findById(parentCategory)).name.toLowerCase().replace(/ /g, "-")}` 
        : name.toLowerCase().replace(/ /g, "-"));
    }

    // Check slug uniqueness for child categories (parentCategory must not be null)
    const existingSlug = await Category.findOne({ 
      slug: { $regex: `^${slug}$`, $options: 'i' },  // Case-insensitive slug match
      parentCategory: { $ne: null }  // Check for child categories only (parentCategory should not be null)
    });

    if (existingSlug) {
      return res.status(400).json({ message: 'Slug already exists for a child category.' });
    }

    // Check if the selected parent category exists (only for child categories)
    if (parentCategory && parentCategory !== 'none') {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({ message: 'Selected parent category does not exist.' });
      }
    }

    // Create the new category
    const category = new Category({
      name,
      slug,
      parentCategory: parentCategory && parentCategory !== 'none' ? parentCategory : null,
      description: description || '', // Default empty string if not provided
      keywords: keywords || '', // Default empty string if not provided
    });

    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// Controller to fetch all categories with post count (only published posts)
const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find();

    // Add post count (published posts only) and last updated to each category
    const categoriesWithDetails = await Promise.all(categories.map(async (category) => {
      // Count the number of published posts in this category
      const postCount = await Post.countDocuments({ category: category._id, status: 'published' }); // Only count published posts

      // Get the latest post in the category (to set "lastUpdated")
      const latestPost = await Post.findOne({ category: category._id, publishedAt: { $ne: null }, status: 'published' }) // Only consider published posts
        .sort({ publishedAt: -1 }) // Sort by publishedAt date (most recent first)
        .limit(1);

      // Add post count and lastUpdated fields
      return {
        ...category.toObject(),
        postCount, // Only count published posts
        lastUpdated: latestPost ? latestPost.publishedAt : 'N/A', // Set last updated to the latest post's publish date
      };
    }));

    res.status(200).json(categoriesWithDetails);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};


// Controller to fetch a category by ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to fetch category details' });
  }
};

// Controller to update a category by ID
const updateCategory = async (req, res) => {
  const { id } = req.params;
  let { name, slug, parentCategory, description, keywords } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Trim the name and remove extra spaces between words
    name = name.trim().replace(/\s+/g, ' '); // Replace multiple spaces with a single space

    // Sanitize and process the slug
    if (slug) {
      // Trim the slug and replace multiple spaces with a single hyphen
      slug = slug.trim().replace(/\s+/g, '-').toLowerCase();
    } else {
      // Generate a slug if not provided
      slug = (parentCategory
        ? `${name.toLowerCase().replace(/ /g, "-")}-${(await Category.findById(parentCategory)).name.toLowerCase().replace(/ /g, "-")}` 
        : name.toLowerCase().replace(/ /g, "-")).toLowerCase();
    }

    // Check slug uniqueness (case-insensitive), excluding the current category
    const existingSlug = await Category.findOne({ slug: { $regex: `^${slug}$`, $options: 'i' }, _id: { $ne: id } });
    if (existingSlug) {
      return res.status(400).json({ message: 'Slug already exists. Please use a different name or slug.' });
    }

    // Check name uniqueness (case-insensitive), excluding the current category
    const existingName = await Category.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' }, 
      parentCategory: parentCategory === "none" ? null : parentCategory,
      _id: { $ne: id }
    });
    if (existingName) {
      return res.status(400).json({ message: 'Category name must be unique within this parent category.' });
    }

    // Validate parent category if provided
    if (parentCategory && parentCategory !== 'none') {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({ message: 'Selected parent category does not exist.' });
      }
    }

    // Update category fields
    category.name = name;
    category.slug = slug; // Set the sanitized slug
    category.parentCategory = parentCategory === "none" ? null : parentCategory; // Handle "none" as null
    category.description = description || category.description; // Keep existing description if not provided
    category.keywords = keywords || category.keywords; // Keep existing keywords if not provided

    await category.save(); // Save the updated category

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// Controller to delete a category by ID
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
