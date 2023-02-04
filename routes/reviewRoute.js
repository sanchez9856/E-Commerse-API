const express = require('express');
const router = express.Router();
const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

const {authenticateUser,authorizeUserPermission} = require('../middleware/authentication');

router
.route('/')
.post([authenticateUser,authorizeUserPermission('user')],createReview)
.get(getAllReviews);

router
.route('/:id')
.get(getSingleReview)
.patch([authenticateUser,authorizeUserPermission('user')],updateReview)
.delete([authenticateUser,authorizeUserPermission('user')],deleteReview);

module.exports = router;


