// For user we will have 3 functionality 
// 1. Register
// 2. Login
// 3. Logout
const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors/custom-api');
const {attachCookieToResponse} = require('../utils/jwt'); 
const {BadRequestError,UnauthenticatedError} = require('../errors/index');
const { use } = require('express/lib/router');

const register = async (req,res) => {
    const {name,email,password} = req.body;

    // First user as an admin
    const isFirstAccount = await User.count({}) === 0;
    const role = isFirstAccount? "admin":"user";

    const user = await User.create({name,email,password,role});
    const userPayload = {name:user.name,id:user._id,role:user.role};
    attachCookieToResponse(res,userPayload);
    res.status(StatusCodes.CREATED).send({user:{name:user.name,id:user._id,role:user.role}});
};

const login = async (req,res) => {
    const {email,password} = req.body;
    if (!email || !password)
    {
        throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({email});
    if(!user)
    {
        throw new UnauthenticatedError('This user doesnt exists');
    }
    
    const isPasswordCorrect = await user.comparePasswords(password);
    if (!isPasswordCorrect)
    {
        throw new UnauthenticatedError('PLease check the email or password provided');
    }

    const userPayload = {name:user.name,id:user._id,role:user.role};
    attachCookieToResponse(res,userPayload);
    res.status(StatusCodes.OK).send({user:{name:user.name,id:user._id,role:user.role}});
}

// Here we are going to remove the cookie.For this we will set the token to a random value and will
// remove the cookie 

// We are setting the existing token to a random value and expiring it
const logout = async (req,res) => {
    res.cookie('token','random',{
        httpOnly : true,
        expires : new Date(Date.now()),
    })
    res.status(StatusCodes.OK).json({msg:'Logout Succesfull'});
}

module.exports = {register,login,logout};