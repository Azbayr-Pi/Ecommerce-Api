const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./usersSchema');


const verifyCallBack = async (username, password, done) => {
  User.findOne({ username: username })
    .then(async (user) => { 
      if (!user) return done(null, false);
      const isvalid = await user.isValidPassword(password);
      if (isvalid) {
        return done(null, user); 
      } else {
        return done(null, false);
      }
    }).catch(err => {
      done(err);
    }); 
}

const strategy = new LocalStrategy(verifyCallBack);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })  
    .catch(err => done(err));
})




