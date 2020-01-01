const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const jwt      = require('jsonwebtoken');
const moment   = require('moment');

// bring in helper functions
const handleValidationError = require('../lib/validationError');

// user model
const User = require('../models/User.model');

// log model
const Log = require('../models/Log.model');

// email transporter
const transporter = require('../config/email'); 

// authentication middleware
const { ensureAuthenticated, ensureAccess } = require('../config/auth');

// express validator middleware
const { check, validationResult } = require('express-validator');

// validation - new user
const newUserValidation = [
    check('firstName').not().isEmpty().withMessage('This is a required field.'),
    check('lastName').not().isEmpty().withMessage('This is a required field.'),
    check('email').isEmail().withMessage('Invalid e-mail address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            return Promise.reject('Passwords do not match');
        } else {
            return true;
        }
    }),
    check('email').custom((email, { req }) => {
        // check if email exists in database
        return User.findOne({ email }).then(newuser => {
            if (newuser) {
                // email exists
                return Promise.reject('E-mail already in use');
            }
        });
    }),
];

// validation - existing user
const existingUserValidation = [
    check('firstName').not().isEmpty().withMessage('This is a required field.'),
    check('lastName').not().isEmpty().withMessage('This is a required field.'),
    check('email').isEmail().withMessage('Invalid e-mail address'),
    check('email').custom((email, { req }) => {
        // check if email exists in database
        return User.findOne({ email }).then(user => {
            if (user) {                                                         // email exists
                if (user.id != req.body.id) {                                   // check if different or same user
                    return Promise.reject('E-mail already in use');
                } else {
                    return true;
                }
            }
        });
    }),
];

// login page
router.get('/login', (req, res) => res.render('./views_users/login', {layout: 'landing'}));

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

// register page
router.get('/register', (req, res) => res.render('./views_users/register', {layout: 'landing'}));

// handle register user post request
router.post('/register', [newUserValidation] ,(req, res) => {

    // process validation errors, if any
    const errors = validationResult(req).errors;

    if (errors.length > 0) {
        // validation fails
        handleValidationError(errors, req.body);
        
        res.render('./views_users/register', {
            register: req.body,
            layout:  'landing'
        });

    } else {
        // validation passes, ie no errors

        const {firstName, lastName, email, password} = req.body;
        const newUser = new User({
            firstName,
            lastName,
            email,
            password
        });

        // hash password 
        bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save( (err, newUser) => {
                    if (!err) {
                        // create JWT token and send email confirmation
                        jwt.sign({ id: user.id }, process.env.PRIVATEKEY, { expiresIn: '1d', algorithm: 'HS256' }, async (err, token) => {
                            const url = process.env.BASE_URL + token;

                            // email text
                            const output = `
                             <h2 style="text-align:center;">Welcome to damwidi.com</h2>
                             <p>Thank you for registering on <b>damwidi.com</b>. Please follow the link below to complete the registration process. This link will expire in 1 day.</p>
                             <p>Please click here to confirm your email: <a href="${url}">${url}</a></p>`;

                            let info = await transporter.sendMail({
                                from: 'DAMWIDI Registrtion <test@damwidi.com>',
                                to: newUser.email,
                                subject: 'Confirm Email',
                                html: output,
                            });

                            // console.log("Message sent: %s", info.messageId);
                        });

                        req.flash('success_msg', 'You are now registered, please complete email verification');
                        res.redirect('/users/login');
                    } else {
                        console.log('Error during new user save: ' + err);
                    }
                });
            })
        );
    }
});

// handle logout
router.get('/logout', (req, res) => {
    writeLogUpdate(req.user.id, 'O');
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// modify user
router.get('/modifyuser/:id', ensureAuthenticated, ensureAccess("admin"), (req,res) => {
    User.findById(req.params.id, (err, user) => {
        if (!err) {
            res.render('./views_users/edituser', {
                user,
                createdAt:       moment(user.createdAt).format('YYYY-MM-DD'),
                updatedAt:       moment(user.updatedAt).format('YYYY-MM-DD'),
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            });
        } else {
            console.log('Error during record find: ' + err);
        }
    });
});

// modify user - submit changes
router.post('/modifyuser', ensureAuthenticated, ensureAccess("admin"), [existingUserValidation], (req,res) => {
        
    // process validation errors, if any
    const errors = validationResult(req).errors;

    if (errors.length > 0) {
        // validation fails

        // sanatize checkbox fields
        req.body.isMember   = typeof req.body.isMember   == 'undefined' ? 0 : 1;
        req.body.isAdmin    = typeof req.body.isAdmin    == 'undefined' ? 0 : 1;
        req.body.isVerified = typeof req.body.isVerified == 'undefined' ? 0 : 1;

        handleValidationError(errors, req.body);
        res.render('./views_users/edituser', {
            user:            req.body,
            createdAt:       moment(req.body.createdAt, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            updatedAt:       moment(req.body.updatedAt, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            name:            req.user.firstName,
            isAdmin:         req.user.isAdmin,
            isMember:        req.user.isMember,
            isAuthenticated: req.isAuthenticated(),
        });
    } else {
        // validation passes, update database

        // sanatize checkbox fields
        const isMember   = typeof req.body.isMember   == 'undefined' ? 0 : 1;
        const isAdmin    = typeof req.body.isAdmin    == 'undefined' ? 0 : 1;
        const isVerified = typeof req.body.isVerified == 'undefined' ? 0 : 1;

        const {firstName, lastName, email} = req.body;
        User.findByIdAndUpdate(req.body.id,{ firstName, lastName, email, isMember, isAdmin, isVerified }, (err, doc) => {
            if (!err) {
                res.redirect('/users/listusers');
            } else {
                console.log('Error during record update: ' + err);
            }
        }); 
    }
});

// list users
router.get('/listusers', ensureAuthenticated, ensureAccess("admin"), (req, res) => {
    // load client script files
    const scripts = [
        { script: '/js/main.js' },
    ];

    User.find({}, (err, users) => {
        if(!err) {
            res.render('./views_users/listusers', {
                scripts,
                users,
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            })
        } else {
            console.log('Error during users find: ' + err);
        }
    });
});

// delete user
router.delete('/:id', (req, res) => {
    // console.log('ID to be removed: ' + req.params.id);

    // prevent user from deleting themself 
    if ( req.params.id == req.user.id ) {
        res.send('sameUser');
    } else {
        User.findByIdAndDelete(req.params.id, (err, user) => {
            if (!err) {
                res.sendStatus(200);
            } else {
                console.log('Error in employee delete :' + err);
                res.sendStatus(500);
            }
        });
    }
 
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
            User.findByIdAndUpdate((authData.id), { "isVerified": true }, (err, user) => {
                if(!err) {
                    req.flash('success_msg', 'Thank you for verifing your email. Please login.');
                    res.redirect('/users/login');
                } else {
                    console.log('Error during email confirmation: ' + err);
                }
            });
        }
    });
});

// process validation errors, store to body
// const handleValidationError = (errors, body) => {
//     errors.forEach(error => {
//         body[error.param+'Error'] = error.msg;
//     });
// }

const writeLogUpdate = ((user, type)=> {
    const newLog = new Log({
        _user:  user,
        userID: user.toString(),
        type
    });

    newLog.save( (err, log) => {
        if (err) {
            console.log('Error during log save: ' + err);
        }
    });
    return;
});

module.exports = router;