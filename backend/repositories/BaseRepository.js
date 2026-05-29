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
