const {StatusCodes} = require('http-status-codes');
const User = require('../models/User');
const {NotFoundError,UnauthenticatedError, BadRequestError} = require('../errors/index');
const {isTokenValid, attachCookieToResponse} = require('../utils/jwt');
const checkPermissions = require('../utils/checkPermissions');


const getAllUsers = async (req,res) => {
    const users = await User.find({role:'user'}).select('-password');
    if (!users)
    {
        throw new NotFoundError('No user found');
    } 
    res.status(StatusCodes.OK).json({users:users});
};

const getSingleUser = async (req,res) => {
    const userid = req.params.id;
    const user = await User.findOne({_id:userid}).select('-password');
    if (!user)
    {
        throw new NotFoundError('User not found');
    }
    checkPermissions(req.user,user._id);
    res.status(StatusCodes.OK).json({user});
};


// This is used when we refresh the page if a user exists the show else not
const showCurrentUser = async (req,res) => {
    res.status(StatusCodes.OK).json({user:req.user});
};

const updateUser = async (req,res) => {
    const {name,email} = req.body;
    if (!name || !email)
    {
        throw new BadRequestError('Please provide the name and email');
    }
    // Problem: We updated the name and email in db, but the values in the cookie is still the same, so we need to update it as wells
    const updatedUser = await User.findOneAndUpdate({_id:req.user.id},{name,email},{new:true,runValidators:true});
    if(!updatedUser)
    {
        throw new UnauthenticatedError('User not found');
    }
    console.log(updatedUser);
    const userToken = {name:updatedUser.name,id:updatedUser.id,role:updatedUser.role};
    attachCookieToResponse(res,userToken);
    res.status(StatusCodes.OK).json({user:userToken})
};

const updateUserPassword = async (req,res) => {
    const {email,oldpassword,newpassword} = req.body;
    if(!email || !oldpassword || !newpassword)
    {
        throw new BadRequestError('Please provide email,old password and new password');
    }
    const user = await User.findOne({_id:req.user.id});
    if (!user)
    {
        throw new UnauthenticatedError('User doesnt exists');
    }

    const isPasswordMatched = user.comparePasswords(oldpassword);
    if (!isPasswordMatched)
    {
        throw new UnauthenticatedError('Please check the password entered');
    }
    user.password = newpassword;
    
    // vvip method for updating documents and saving to db and it also invokes the presave method defined in the model
    await user.save();
    res.status(StatusCodes.OK).json({msg:"Success, password is updated"});
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}