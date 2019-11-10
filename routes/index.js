const express = require('express');
const router  = express.Router();

// authentication middleware
const { ensureAuthenticated } = require('../config/auth');


router.get('/', (req,res) => res.render('index', {layout: 'landing'}));


// welcome page 
// router.get('/', (req,res) => {
//     res.render('welcome', {
//         // title:     'Damwidi Test',
//         // isEnabled: true
//     });
// });

// dashboard page 
router.get('/dashboard', ensureAuthenticated, (req,res) => {
    console.log("isAdmin:         "+req.user.isAdmin);
    console.log("isMember:        "+req.user.isMember);
    console.log("isAuthenticated: "+req.isAuthenticated());

    res.render('dashboard', {
        name:            req.user.name,
        isAdmin:         req.user.isAdmin,
        isMember:        req.user.isMember,
        isAuthenticated: req.isAuthenticated(),
    });
});

module.exports = router;