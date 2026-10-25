const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const user = require('../models/user.js');
const { saveRedirectUrl } = require('../middleware.js');

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// Register form
router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                console.error('Login error after registration:', err);
                req.flash('error', 'Registration successful, but automatic login failed. Please log in manually.');
                return res.redirect('/login');
            }
            req.flash('success', 'Welcome to AIRBNB!');
            res.redirect('/listings');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/signup');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', saveRedirectUrl, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}),
async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.redirectUrl || '/listings');
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been logged out!');
        res.redirect('/listings');
    });
});

module.exports = router;