const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const jwt      = require('jsonwebtoken');

// user model
const User = require('../models/user');

// log model
const Log = require('../models/log');

// email transporter
const transporter = require('../config/email'); 

// authentication middleware
const { ensureAuthenticated, ensureAccess } = require('../config/auth');
// const { ensureAccess }        = require('../config/accesslevel');
// const ensureAccess = (role) => {
//     return function (req, res, next) {
//         console.log("The role is:     "+role);
//         console.log("isAdmin:         "+req.user.isAdmin);
//         console.log("isMember:        "+req.user.isMember);
//         console.log("isAuthenticated: "+req.isAuthenticated());

//         if(role == 'admin' && req.user.isAdmin ) {
//             return next();
//         }
//         res.redirect('/dashboard');
        
//     }
// }

// login page
router.get('/login', (req, res) => res.render('login', {layout: 'landing'}));

// register page
router.get('/register', (req, res) => res.render('register', {layout: 'landing'}));

// modify user
router.get('/edituser/:id', ensureAuthenticated, (req,res) => {
    console.log(req.params.id);
});

// list users
router.get('/listusers', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    User.findAll()
        .then(users => res.render('./views_users/listusers', {
            users,
            name:            req.user.firstName,
            isAdmin:         req.user.isAdmin,
            isMember:        req.user.isMember,
            isAuthenticated: req.isAuthenticated(),
        }))
        .catch(err => console.log(err));
});

// handle register user post request
router.post('/register', (req, res) => {
    const { firstName, lastName, email, password, password2 } = req.body;
    let errors = [];

    // check required fields
    if (!firstName || !lastName || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    // check if passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    
    // determine if password meets length requirement
    if (password.length < 1) {
        errors.push({ msg: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        // validation fails
        res.render('register', {
            errors,
            firstName,
            lastName,
            email,
            password,
            password2,
            layout: 'landing'
        });
    } else {
        // validation passes, ie no errors

        // truncate user table -- DELETE THIS AFTER TESTING
        // User.truncate();


        // determine if user already exists
        User.findOne({
            where: {
                email
            }
        }).then((user) => {
            if (user) {
                //user exists
                errors.push({ msg: 'Email is already registered'});
                res.render('register', {
                    errors,
                    firstName,
                    lastName,
                    email,
                    password,
                    password2,
                    layout: 'landing'
                });
            } else {
                const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password
                });

                // hash password 
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {

                                // create JWT token and send email confirmation
                                jwt.sign({id: user.id}, process.env.PRIVATEKEY, { expiresIn: '1d', algorithm: 'HS256' }, async (err, token) => {
                                    const url = process.env.BASE_URL+token;

                                    // email text
                                    const output = `
                                        <h2 style="text-align:center;">Welcome to damwidi.com</h2>
                                        <p>Thank you for registering on <b>damwidi.com</b>. Please follow the link below to complete the registration process. This link will expire in 1 day.</p>
                                        <p>Please click here to confirm your email: <a href="${url}">${url}</a></p>`;

                                    let info = await transporter.sendMail({
                                        from:    'DAMWIDI Registrtion <test@damwidi.com>',
                                        to:      newUser.email,
                                        subject: 'Confirm Email',
                                        html:    output,
                                    });

                                    console.log("Message sent: %s", info.messageId);
                                });

                                req.flash('success_msg', 'You are now registered, please complete email verification');
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err));
                }));
            }
        });

        // res.send('pass')
    }
});

// handle login and write to log table
router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    (req, res, next) => {
        writeLogUpdate(req.user.id, 'I');
        res.redirect('/dashboard');
    });

// handle logout
router.get('/logout', (req, res) => {
    writeLogUpdate(req.user.id, 'O');
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// handle email confirmation link
router.get('/confirmation/:token', (req, res) => {

    jwt.verify(req.params.token, process.env.PRIVATEKEY, (err, authData) => {
        if(err) {
            switch (err.name) {
                case 'TokenExpiredError':
                    req.flash('error_msg', 'Verificaion link expired. Please enter email and password to resend');
                    res.redirect('/users/login');
                    break;
                case 'JsonWebTokenError':
                    req.flash('error_msg', 'Invalid Attempt!');
                    res.sendStatus(403);
                    break;
            } 
        } else {
            User.update({ isVerified: true }, { where: {id: authData.id} })
                .then(() => {
                    req.flash('success_msg', 'Thank you for verifing your email. Please login.');
                    res.redirect('/users/login');
                })
                .catch(err => console.log(err));
        }
    });
});

const writeLogUpdate = ((user, type)=> {
    const newLog = new Log({
        _user: user,
        type
    });

    newLog.save()
        .then( () => {
            console.log('log updated');
        })
        .catch(err => console.log(err));

    return;
});

module.exports = router;