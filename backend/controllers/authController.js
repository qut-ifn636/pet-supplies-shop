const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/UserRepository');
const ResponseFactory = require('../responseFactory');

// Helper: generate a signed JWT for the given user ID
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc Register a new user account (role defaults to 'customer')
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            return res.status(400).json(
                ResponseFactory.badRequest('User already exists')
            );
        }

        const user = await userRepository.create({ name, email, password });

        return res.status(201).json(
            ResponseFactory.created({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            }, 'User registered successfully')
        );
    } catch (error) {
        return res.status(500).json(
            ResponseFactory.error(error.message)
        );
    }
};

/**
 * @desc Authenticate a user and return a JWT
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userRepository.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(200).json(
                ResponseFactory.ok({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user.id)
                }, 'Login successful')
            );
        } else {
            return res.status(401).json(
                ResponseFactory.unauthorized('Invalid email or password')
            );
        }
    } catch (error) {
        return res.status(500).json(
            ResponseFactory.error(error.message)
        );
    }
};

/**
 * @desc Get the authenticated user's profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json(
                ResponseFactory.notFound('User not found')
            );
        }

        return res.json(
            ResponseFactory.ok({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            })
        );
    } catch (error) {
        return res.status(500).json(
            ResponseFactory.error(error.message)
        );
    }
};

/**
 * @desc Update the authenticated user's profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json(
                ResponseFactory.notFound('User not found')
            );
        }

        const { name, email } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;

        const updatedUser = await userRepository.save(user);

        return res.json(
            ResponseFactory.ok({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser.id),
            }, 'Profile updated successfully')
        );
    } catch (error) {
        return res.status(500).json(
            ResponseFactory.error(error.message)
        );
    }
};

/**
 * @desc List all registered users (admin only)
 * @route GET /api/auth/users
 * @access Private (admin)
 */
const getUsers = async (req, res) => {
    try {
        const users = await userRepository.findAllWithoutPassword();
        return res.json(
            ResponseFactory.ok(users, 'Users retrieved successfully')
        );
    } catch (error) {
        return res.status(500).json(
            ResponseFactory.error(error.message)
        );
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateUserProfile, 
    getUsers 
};