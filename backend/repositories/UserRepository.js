const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor(userModel = User) {
        super(userModel);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async findAllWithoutPassword() {
        return this.model.find().select('-password');
    }
}

module.exports = new UserRepository();
module.exports.UserRepository = UserRepository;
