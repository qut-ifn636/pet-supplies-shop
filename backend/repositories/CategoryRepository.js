const Category = require('../models/Category');

/**
 * Repository pattern:
 * CategoryRepository wraps every Mongoose operation for categories behind
 * intention-revealing methods. The rest of the application depends on this
 * object-oriented interface instead of depending directly on the Category model.
 *
 * This keeps persistence logic isolated, makes controllers easier to read, and
 * gives the project one place to change if category storage rules evolve.
 */
class CategoryRepository {
    constructor(categoryModel = Category) {
        this.categoryModel = categoryModel;
    }

    async findAll() {
        return this.categoryModel.find().sort({ name: 1 });
    }

    async findById(id) {
        return this.categoryModel.findById(id);
    }

    async create(categoryData) {
        return this.categoryModel.create(categoryData);
    }

    async save(category) {
        return category.save();
    }

    async deleteById(id) {
        return this.categoryModel.findByIdAndDelete(id);
    }
}

module.exports = new CategoryRepository();
module.exports.CategoryRepository = CategoryRepository;
