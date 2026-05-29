const Product = require('../models/Product');
const BaseRepository = require('./BaseRepository');

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
