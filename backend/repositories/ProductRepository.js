const Product = require('../models/Product');

/**
 * Repository pattern:
 * This class is the only layer that knows how product data is stored with Mongoose.
 * Controllers call these methods instead of calling Product.find(), Product.create(),
 * or other database APIs directly.
 *
 * Why this is useful:
 * - Encapsulation: database details stay in one class.
 * - Single responsibility: controllers handle HTTP flow; repositories handle persistence.
 * - Dependency inversion: the model is injected, so tests or future data sources can swap it.
 */
class ProductRepository {
    constructor(productModel = Product) {
        this.productModel = productModel;
    }

    async findAll(filter = {}) {
        return this.productModel.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return this.productModel.findById(id);
    }

    async findByIdWithCategory(id) {
        return this.productModel.findById(id).populate('category', 'name');
    }

    async create(productData) {
        return this.productModel.create(productData);
    }

    async save(product) {
        return product.save();
    }

    async populateCategory(product) {
        return product.populate('category', 'name');
    }

    async deleteById(id) {
        return this.productModel.findByIdAndDelete(id);
    }

    async countByCategory(categoryId) {
        return this.productModel.countDocuments({ category: categoryId });
    }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
