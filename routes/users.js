const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const jwt      = require('jsonwebtoken');
const moment   = require('moment');

// user model
const User = require('../models/user');

// log model
const Log = require('../models/log');

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
        return User.findOne({ where : {email} }).then(newuser => {
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
        return User.findOne({ where : {email} }).then(user => {
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
                newUser.save()
                    .then(user => {

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
                    })
                    .catch(err => console.log(err));
            }));
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
    User.findOne({ where: { id: req.params.id } })
        .then((user) => {
            res.render('./views_users/edituser', {
                user,
                createdAt:       moment(user.createdAt).format('YYYY-MM-DD'),
                updatedAt:       moment(user.updatedAt).format('YYYY-MM-DD'),
                name:            req.user.firstName,
                isAdmin:         req.user.isAdmin,
                isMember:        req.user.isMember,
                isAuthenticated: req.isAuthenticated(),
            });
        })
        .catch(err => console.log(err));
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
            createdAt:       moment(req.body.createdAt).format('YYYY-MM-DD'),
            updatedAt:       moment(req.body.updatedAt).format('YYYY-MM-DD'),
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
        User.update({ firstName, lastName, email, isMember, isAdmin, isVerified }, { where: { id: req.body.id } })
            .then(res.redirect('/users/listusers'))
            .catch(err => console.log(err));
    }
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

// delete user
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    // console.log('ID to be removed: ' + _id);

    User.destroy({ where: { id }})
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            console.log('Error in employee delete :' + err);
            res.sendStatus(500);
        })
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

// process validation errors, store to body
const handleValidationError = (errors, body) => {
    errors.forEach(error => {
        body[error.param+'Error'] = error.msg;
    });
}

const writeLogUpdate = ((user, type)=> {
    const newLog = new Log({
        _user: user,
        type
    });

    newLog.save()
        .then( () => {
            // console.log('log updated');
        })
        .catch(err => console.log(err));

    return;
});

module.exports = router;