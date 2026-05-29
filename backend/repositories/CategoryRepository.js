const Category = require('../models/Category');
const BaseRepository = require('./BaseRepository');

/**
 * Repository pattern:
 * CategoryRepository wraps every Mongoose operation for categories behind
 * intention-revealing methods. The rest of the application depends on this
 * object-oriented interface instead of depending directly on the Category model.
 *
 * Inherits findById, create, save, and deleteById from BaseRepository.
 */
class CategoryRepository extends BaseRepository {
    constructor(categoryModel = Category) {
        super(categoryModel);
    }

    async findAll() {
        return this.model.find().sort({ name: 1 });
    }
}

module.exports = new CategoryRepository();
module.exports.CategoryRepository = CategoryRepository;
