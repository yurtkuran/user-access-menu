const express = require('express');
const router  = express.Router();

// login page
router.get('/login', (req, res) => res.render('login'));

// register page
router.get('/register', (req, res) => res.render('register'));

// handle register user post request
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    // check if passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    
    // determine if password meets length requirement
    if (password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        res.send('pass')
    }
});

module.exports = router;