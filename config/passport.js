const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcryptjs');

// user model
const User = require('../models/User.model');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
            // match user
            User.findOne({ email })
                .then((user) => { 

                    // user does not exist in database
                    if(!user) {
                        return done(null, false, {message : 'Authentication Failed'});
                    }

                    // check if verifiation is completed
                    if(!user.isVerified) {
                        return done(null, false, {message : 'Verification Not Complete'});
                    }

                    // match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;

                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message : 'Authentication Failed'});
                        }
                    });
                })
                .catch(err => console.log(err))
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => console.log(err));
    });
}



