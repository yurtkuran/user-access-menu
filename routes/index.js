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
    console.log(req.user.isAdmin);
    console.log(req.isAuthenticated());
    res.render('dashboard', {
        name:      req.user.name,
        isEnabled: req.user.isAdmin
    });
    
});

module.exports = router;