const productRepository = require('../repositories/ProductRepository');
const categoryRepository = require('../repositories/CategoryRepository');
const ResponseFactory = require('../responseFactory');

/**
 * @desc  Get all products with optional search and category filter.
 *        Supports ?search= (case-insensitive name match) and ?category= (ObjectId filter).
 *        Populates the category name on each product.
 * @route GET /api/products
 * @access Private (admin only)
 */
const getProducts = async (req, res) => {
    try {
        const filter = {};

        // Optional name search — case-insensitive regex match
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Optional category filter — must be a valid Category ObjectId
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const products = await productRepository.findAll(filter);

        res.json(ResponseFactory.ok(products));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Get a single product by ID, with category name populated
 * @route GET /api/products/:id
 * @access Private (admin only)
 */
const getProduct = async (req, res) => {
    try {
        const product = await productRepository.findByIdWithCategory(req.params.id);
        if (!product) {
            return res.status(404).json(ResponseFactory.notFound('Product not found'));
        }
        res.json(ResponseFactory.ok(product));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Create a new product. Validates that the referenced category exists.
 * @route POST /api/products
 * @access Private (admin only)
 */
const createProduct = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Validate required fields before hitting the database
    if (!name || price === undefined || !category) {
        return res.status(400).json(
            ResponseFactory.badRequest('Name, price, and category are required')
        );
    }
    if (price < 0) {
        return res.status(400).json(ResponseFactory.badRequest('Price cannot be negative'));
    }

    try {
        // Confirm the referenced category actually exists
        const categoryExists = await categoryRepository.findById(category);
        if (!categoryExists) {
            return res.status(400).json(
                ResponseFactory.badRequest('Referenced category does not exist')
            );
        }

        const product = await productRepository.create({ name, description, price, category, stock, imageUrl });

        // Return the product with category name populated
        const populated = await productRepository.populateCategory(product);
        res.status(201).json(ResponseFactory.created(populated));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Update an existing product by ID. Validates category if it is being changed.
 * @route PUT /api/products/:id
 * @access Private (admin only)
 */
const updateProduct = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    try {
        const product = await productRepository.findById(req.params.id);
        if (!product) {
            return res.status(404).json(ResponseFactory.notFound('Product not found'));
        }

        // If a new category is supplied, confirm it exists before saving
        if (category && category.toString() !== product.category.toString()) {
            const categoryExists = await categoryRepository.findById(category);
            if (!categoryExists) {
                return res.status(400).json(
                    ResponseFactory.badRequest('Referenced category does not exist')
                );
            }
        }

        // Only update fields that were provided in the request body
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (category !== undefined) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (imageUrl !== undefined) product.imageUrl = imageUrl;

        const updatedProduct = await productRepository.save(product);
        const populated = await productRepository.populateCategory(updatedProduct);
        res.json(ResponseFactory.ok(populated, 'Product updated successfully'));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

/**
 * @desc  Delete a product by ID
 * @route DELETE /api/products/:id
 * @access Private (admin only)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await productRepository.findById(req.params.id);
        if (!product) {
            return res.status(404).json(ResponseFactory.notFound('Product not found'));
        }

        await productRepository.deleteById(req.params.id);
        res.json(ResponseFactory.ok(null, 'Product deleted successfully'));
    } catch (error) {
        res.status(500).json(ResponseFactory.error(error.message));
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
