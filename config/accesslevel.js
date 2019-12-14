
module.exports = {
    ensureAccess: (req, res, next) => {
        console.log('ensure access');
        // return next();
        res.redirect('/dashboard');
    }
}