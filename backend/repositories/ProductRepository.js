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
 * Inherits findById, create, save, and deleteById from BaseRepository.
 */
class ProductRepository extends BaseRepository {
    constructor(productModel = Product) {
        super(productModel);
    }

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

    async countByCategory(categoryId) {
        return this.model.countDocuments({ category: categoryId });
    }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
