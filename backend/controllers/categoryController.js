const categoryRepository = require('../repositories/CategoryRepository');
const productRepository = require('../repositories/ProductRepository');
const ResponseFactory = require('../responseFactory');

/**
 * @desc  Get all categories
 * @route GET /api/categories
 * @access Private (admin only)
 */
const getCategories = async (req, res) => {
    try {
        const categories = await categoryRepository.findAll();
        res.json(ResponseFactory.ok(categories));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Get a single category by ID
 * @route GET /api/categories/:id
 * @access Private (admin only)
 */
const getCategory = async (req, res) => {
    try {
        const category = await categoryRepository.findById(req.params.id);
        if (!category) {
            return res.status(404).json(ResponseFactory.notFound('Category not found'));
        }
        res.json(ResponseFactory.ok(category));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Create a new category
 * @route POST /api/categories
 * @access Private (admin only)
 */
const createCategory = async (req, res) => {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json(ResponseFactory.badRequest('Category name is required'));
    }

    try {
        const category = await categoryRepository.create({ name, description });
        res.status(201).json(ResponseFactory.created(category));
    } catch (error) {
        // Handle duplicate name (MongoDB unique index violation)
        if (error.code === 11000) {
            return res.status(409).json(
                ResponseFactory.conflict('A category with that name already exists')
            );
        }
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Update an existing category by ID
 * @route PUT /api/categories/:id
 * @access Private (admin only)
 */
const updateCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const category = await categoryRepository.findById(req.params.id);
        if (!category) {
            return res.status(404).json(ResponseFactory.notFound('Category not found'));
        }

        // Only update fields that were provided in the request body
        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;

        const updatedCategory = await categoryRepository.save(category);
        res.json(ResponseFactory.ok(updatedCategory, 'Category updated successfully'));
    } catch (error) {
        // Handle duplicate name on update
        if (error.code === 11000) {
            return res.status(409).json(
                ResponseFactory.conflict('A category with that name already exists')
            );
        }
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Delete a category by ID
 *        Blocked if any products currently reference this category.
 * @route DELETE /api/categories/:id
 * @access Private (admin only)
 */
const deleteCategory = async (req, res) => {
    try {
        const category = await categoryRepository.findById(req.params.id);
        if (!category) {
            return res.status(404).json(ResponseFactory.notFound('Category not found'));
        }

        // Prevent deletion if products are still assigned to this category
        const productCount = await productRepository.countByCategory(req.params.id);
        if (productCount > 0) {
            return res.status(400).json(
                ResponseFactory.badRequest(
                    `Cannot delete — ${productCount} product(s) still reference this category`
                )
            );
        }

        await categoryRepository.deleteById(req.params.id);
        res.json(ResponseFactory.ok(null, 'Category deleted successfully'));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
