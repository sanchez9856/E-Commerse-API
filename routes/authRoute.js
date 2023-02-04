const express = require('express');
const router = express.Router();
const {register,login,logout} = require('../controllers/authController');

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout); // Logout is always a get request, because we only click a logout buttoN and dont pass any info as such 

module.exports = router;
