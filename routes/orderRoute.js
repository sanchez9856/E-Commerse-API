const express = require('express');
const router = express.Router();
const {authenticateUser,authorizeUserPermission} = require('../middleware/authentication');
const {
    createOrder,
    updateOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders
} = require('../controllers/orderController');

router
.route('/')
.post(authenticateUser,createOrder)
.get([authenticateUser,authorizeUserPermission('admin')],getAllOrders);

router
.route('/showAllMyOrders')
.get(authenticateUser,getCurrentUserOrders);

router
.route('/:id')
.get(authenticateUser,getSingleOrder)
.patch(authenticateUser,updateOrder);

module.exports = router;