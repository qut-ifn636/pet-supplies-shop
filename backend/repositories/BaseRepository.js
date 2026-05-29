/**
 * Repository pattern — base class:
 * Defines the four CRUD operations shared by every repository. Subclasses extend
 * this class and inherit these methods, then add their own domain-specific queries.
 *
 * The Mongoose model is injected via the constructor so tests can pass a fake model
 * without touching the database.
 */
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async create(data) {
        return this.model.create(data);
    }

    async save(doc) {
        return doc.save();
    }

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = BaseRepository;
