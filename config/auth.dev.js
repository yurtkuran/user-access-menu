const ensureAuthenticated = (req, res, next) => {
    return next();
}

const ensureAccess = (role, req) => {
    return function (req, res, next) {
        return next();
    }
}

module.exports = {
    ensureAuthenticated,
    ensureAccess
}