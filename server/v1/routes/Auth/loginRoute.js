const express = require('express');
const loginRouter = express.Router();
const path = require('path');
const passport = require('passport');

loginRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }               
        if (!user) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json({ message: 'Logged in successfully' });
        });
      })(req, res, next);
});

loginRouter.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
          return res.status(500).json({
            message: 'Error logging out',
            error: err
          });
        }
        return res.status(200).json({
          message: 'Goodbye see you soon!'
        });
      });
});

module.exports = loginRouter;