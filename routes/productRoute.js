const express = require('express');
const router = express.Router();
const {authenticateUser,authorizeUserPermission} = require('../middleware/authentication');

const {
    createProduct, 
    getAllProducts,
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    uploadImage
} = require('../controllers/productController');

const {getSingleProductReview} = require('../controllers/reviewController');

// Passing multiple middlewear
router
.route('/')
.post([authenticateUser,authorizeUserPermission('admin')],createProduct)
.get(getAllProducts);

router
.route('/:id')
.get(getSingleProduct)
.patch([authenticateUser,authorizeUserPermission('admin')],updateProduct)
.delete([authenticateUser,authorizeUserPermission('admin')],deleteProduct);

router
.route('/uploadimage')
.post([authenticateUser,authorizeUserPermission('admin')],uploadImage);

router
.route('/:id/reviews')
.get(getSingleProductReview);

module.exports = router;


