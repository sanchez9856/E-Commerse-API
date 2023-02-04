const {UnauthenticatedError} = require('../errors/index');

const checkPermission = (requestUser,retrievedUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.id === retrievedUserId.toString()) return;
    throw new UnauthenticatedError('Not Authorized to access this route');
}

module.exports = checkPermission;