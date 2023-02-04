const jwt = require('jsonwebtoken');

const createToken = ({payload}) => {
const token = jwt.sign(payload,process.env.SECRET_KEY,{expiresIn:process.env.JWT_LIFETIME});
return token;
}

const isTokenValid = ({token}) => jwt.verify(token,process.env.SECRET_KEY);

const attachCookieToResponse = (res,user) =>{
    // creating the token
    const token = createToken({payload:user});
    // setting the browser cookie
    const oneday = 1000 *60*60*24;
    res.cookie('token',token,{expires: new Date(Date.now() + oneday), httpOnly: true})
}

module.exports = {
    createToken,isTokenValid,attachCookieToResponse
};
