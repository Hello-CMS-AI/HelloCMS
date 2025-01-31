const Tag = require('../models/tag'); // Import the Tag model
const Post = require('../models/post'); 

// Controller to create a new tag
// Controller to create a new tag
const createTag = async (req, res) => {
  let { name, slug, description, isTrending } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Tag name is required.' });
  }

  try {
    // Generate the slug if not provided
    slug = slug || name.toLowerCase().replace(/\s+/g, "-");
    // Ensure the manual slug is formatted correctly
    slug = slug.replace(/\s+/g, "-").replace(/-+/g, '-').replace(/^-|-$/g, '').trim();

    // Check if the tag already exists
    const existingTag = await Tag.findOne({ 
      $or: [
        { name: { $regex: `^${name}$`, $options: 'i' } }, // Case-insensitive check
        { slug: { $regex: `^${slug}$`, $options: 'i' } },
      ]
    });

    if (existingTag) {
      return res.status(400).json({ message: 'Tag name or slug already exists.' });
    }

    // Create a new tag
    const tag = new Tag({
      name,
      slug,
      description: description || '',
      isTrending: isTrending || false,  // Handle the trending flag
    });

    await tag.save();
    res.status(201).json({ message: 'Tag created successfully', tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Failed to create tag' });
  }
};

// Controller to fetch all trending tags
const getTrendingTags = async (req, res) => {
  try {
    const trendingTags = await Tag.find({ isTrending: true });  // Find tags that are marked as trending
    res.status(200).json(trendingTags);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({ message: 'Failed to fetch trending tags' });
  }
};

// Controller to mark a tag as trending
const markAsTrending = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Toggle the isTrending flag
    tag.isTrending = !tag.isTrending; // If already trending, set to false, otherwise set to true

    await tag.save();

    res.status(200).json({ message: `Tag marked as ${tag.isTrending ? 'trending' : 'not trending'}`, tag });
  } catch (error) {
    console.error('Error marking tag as trending:', error);
    res.status(500).json({ message: 'Failed to update tag trending status' });
  }
};


// Controller to fetch all tags
const listTags = async (req, res) => {
  try {
    const tags = await Tag.find(); // Fetch all tags

    // For each tag, calculate the number of published posts associated with it
    const tagsWithPostCount = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await Post.countDocuments({
          tags: tag._id,
          status: 'published', // Only count posts with status 'published'
        });
        return { ...tag.toObject(), postCount }; // Attach the post count to the tag object
      })
    );

    res.status(200).json(tagsWithPostCount); // Send the tags with post count as response
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};


// Controller to fetch a single tag by ID
const getTagById = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error('Error fetching tag by ID:', error);
    res.status(500).json({ message: 'Failed to fetch tag' });
  }
};

// Controller to update a tag by ID
const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Tag name is required.' });
  }

  try {
    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // If slug is not provided, generate it automatically
    let updatedSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

    // Ensure the manual slug is formatted correctly (replace spaces with hyphens, remove consecutive hyphens, and trim hyphens)
    updatedSlug = updatedSlug.replace(/\s+/g, "-") // Replace spaces with hyphens
                             .replace(/-+/g, '-') // Replace consecutive hyphens with a single hyphen
                             .replace(/^-|-$/g, '') // Remove hyphens from the beginning and end
                             .trim(); // Trim any extra spaces

    // Check for duplicate name or slug in other tags
    const existingTag = await Tag.findOne({
      _id: { $ne: id },
      $or: [
        { name: { $regex: `^${name}$`, $options: 'i' } },
        { slug: { $regex: `^${updatedSlug}$`, $options: 'i' } },
      ],
    });

    if (existingTag) {
      return res.status(400).json({
        message: 'Another tag with the same name or slug already exists.',
      });
    }

    // Update tag details
    tag.name = name;
    tag.slug = updatedSlug;
    tag.description = description || '';

    await tag.save();

    res.status(200).json({ message: 'Tag updated successfully', tag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: 'Failed to update tag' });
  }
};


// Controller to permanently delete a tag by ID
const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Permanently delete the tag
    await Tag.findByIdAndDelete(id);

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Failed to delete tag' });
  }
};


module.exports = {
  createTag,
  listTags,
  getTagById,
  updateTag,
  deleteTag,
  getTrendingTags,
  markAsTrending,
};
