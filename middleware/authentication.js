const {UnauthenticatedError,ForbiddenError} = require('../errors/index');
const {isTokenValid} = require('../utils/jwt');


const authenticateUser = async (req,res,next) => {
    const token = req.cookies.token;
    if (!token)
    {
        throw new UnauthenticatedError('Authentication Invalid');
    }
    try {
        const payload = isTokenValid({token});
        // console.log(payload);
        req.user = {name:payload.name,id:payload.id,role:payload.role};
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
};

const authorizeUserPermission = (...roles) => {
    return (req,res,next) => {
    const userRole = req.user.role;
    if(!roles.includes(userRole))
    {
        throw new ForbiddenError('You dont have permission to access this route');
    }
    next();
    }
}

module.exports = {authenticateUser,authorizeUserPermission};