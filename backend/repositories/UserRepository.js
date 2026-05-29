const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

/**
 * Repository pattern:
 * UserRepository centralizes user persistence behind an object-oriented class.
 * Auth controllers ask for users by business intent, such as "find by email"
 * or "list users without passwords", instead of knowing the Mongoose syntax.
 *
 * Inherits findById, create, save, and deleteById from BaseRepository.
 */
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
