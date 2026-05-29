const Category = require('../models/Category');
const BaseRepository = require('./BaseRepository');

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
