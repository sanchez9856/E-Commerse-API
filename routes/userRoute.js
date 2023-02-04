const express = require('express');
const router = express.Router();
const {getAllUsers,getSingleUser,showCurrentUser,updateUser,updateUserPassword} = require('../controllers/userController');
const {authenticateUser,authorizeUserPermission} = require('../middleware/authentication');

// Before accessing any user route we are doing 2 things
// 1. Authenicating user to check weather the user is a logged in user or a  registered user
// 2. Checking the roles of the user(authorizing the user), because depending upon role the user wil
//    have access to certain routes. For eg admin will have access to getAllUser route.

router.route('/').get(authorizeUserPermission('admin'),getAllUsers);
router.route('/showme').get(showCurrentUser);
router.route('/updatepassword').post(authenticateUser,updateUserPassword);
router.route('/updateuser').patch(authenticateUser,updateUser);
router.route('/:id').get(getSingleUser);

module.exports = router;