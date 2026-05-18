const User = require('../models/User');

/**
 * Repository pattern:
 * UserRepository centralizes user persistence behind an object-oriented class.
 * Auth controllers ask for users by business intent, such as "find by email"
 * or "list users without passwords", instead of knowing the Mongoose syntax.
 *
 * This is necessary because authentication code is sensitive: keeping database
 * access in one layer reduces duplication and makes future changes safer.
 */
class UserRepository {
    constructor(userModel = User) {
        this.userModel = userModel;
    }

    async findByEmail(email) {
        return this.userModel.findOne({ email });
    }

    async findById(id) {
        return this.userModel.findById(id);
    }

    async create(userData) {
        return this.userModel.create(userData);
    }

    async save(user) {
        return user.save();
    }

    async findAllWithoutPassword() {
        return this.userModel.find().select('-password');
    }
}

module.exports = new UserRepository();
module.exports.UserRepository = UserRepository;
