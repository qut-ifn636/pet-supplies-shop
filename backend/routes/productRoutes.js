const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');

const router = express.Router();

// All product routes require a valid JWT (protect) and admin role (adminCheck)
router.get('/', protect, adminCheck, getProducts);
router.get('/:id', protect, adminCheck, getProduct);
router.post('/', protect, adminCheck, createProduct);
router.put('/:id', protect, adminCheck, updateProduct);
router.delete('/:id', protect, adminCheck, deleteProduct);

module.exports = router;
