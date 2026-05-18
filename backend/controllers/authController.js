const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/UserRepository');

// Helper: generate a signed JWT for the given user ID
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc  Register a new user account (role defaults to 'customer')
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await userRepository.findByEmail(email);
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await userRepository.create({ name, email, password });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc  Authenticate a user and return a JWT
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userRepository.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc  Get the authenticated user's profile
 * @route GET /api/auth/profile
 * @access Private (authenticated users)
 */
const getProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc  Update the authenticated user's profile (name and email only)
 * @route PUT /api/auth/profile
 * @access Private (authenticated users)
 */
const updateUserProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;

        const updatedUser = await userRepository.save(user);
        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc  List all registered users (name, email, role, createdAt — no passwords)
 * @route GET /api/auth/users
 * @access Private (admin only)
 */
const getUsers = async (req, res) => {
    try {
        const users = await userRepository.findAllWithoutPassword();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateUserProfile, getUsers };
