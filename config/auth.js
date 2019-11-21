const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/users/login');
}

const ensureAccess = (role) => {
    return function (req, res, next) {
        if(role == 'admin' && req.user.isAdmin ) {
            return next();
        }
        res.redirect('/dashboard');
    }
}

module.exports = {
    ensureAuthenticated ,
    ensureAccess
}