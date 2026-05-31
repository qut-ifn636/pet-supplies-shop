const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

/**
 * Repository pattern:
 * UserRepository centralizes user persistence behind an object-oriented class.
 * Auth controllers ask for users by business intent, such as "find by email"
 * or "list users without passwords", instead of knowing the Mongoose syntax.
 *
 * Inherits findById, create, save, deleteById, and count from BaseRepository.
 * Overrides findAll to exclude the password hash from every returned user.
 */
class UserRepository extends BaseRepository {
    constructor(userModel = User) {
        super(userModel);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    // Override: never expose password hashes when listing users.
    async findAll() {
        return this.model.find().select('-password');
    }
}

module.exports = new UserRepository();
module.exports.UserRepository = UserRepository;
