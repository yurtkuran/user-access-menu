const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcryptjs');

// user model
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
            // match user
            User.findOne({ where: { email } })
                .then((user) => { 

                    // user does not exist in database
                    if(!user) {
                        return done(null, false, {message : 'That email is not registered'});
                    }

                    // match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;

                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message : 'Password incorrect'});
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
        User.findByPk(id)
            .then(user => done(null, user))
            .catch(err => console.log(err));
    });
}



