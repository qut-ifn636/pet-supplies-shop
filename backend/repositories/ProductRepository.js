const Product = require('../models/Product');
const BaseRepository = require('./BaseRepository');

/**
 * Repository pattern:
 * This class is the only layer that knows how product data is stored with Mongoose.
 * Controllers call these methods instead of calling Product.find() or .create() directly.
 *
 * Why this is useful:
 * - Encapsulation: database details stay in one class.
 * - Single responsibility: controllers handle HTTP flow; repositories handle persistence.
 * - Dependency inversion: the model is injected, so tests or future data sources can swap it.
 *
 * Inherits findById, create, save, deleteById, and count from BaseRepository.
 * Overrides findAll to populate the category name and sort newest-first.
 */
class ProductRepository extends BaseRepository {
    constructor(productModel = Product) {
        super(productModel);
    }

    // Override: products need their category populated and a newest-first sort.
    async findAll(filter = {}) {
        return this.model.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
    }

    async findByIdWithCategory(id) {
        return this.model.findById(id).populate('category', 'name');
    }

    async populateCategory(product) {
        return product.populate('category', 'name');
    }

    // Domain-specific helper that reuses the inherited count().
    async countByCategory(categoryId) {
        return this.count({ category: categoryId });
    }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
