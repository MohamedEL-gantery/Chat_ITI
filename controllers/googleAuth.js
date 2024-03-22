const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/userModel');
const SendToken = require('../utils/createToken');
require('dotenv').config({ path: './config.env' });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL_GOOGLE,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      // 1) find if user exist with this email or not
      const user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        // 2) create new user
        const newUser = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          photo: profile.photos[0].value,
          password: process.env.PASSWORD_GOOGLE,
          passwordConfirm: process.env.PASSWORD_GOOGLE,
          accessToken,
          refreshToken,
        });
        // 3) If everything is ok, generate token
        SendToken.createToken(newUser, 201, request, request.res);
        console.log('user saved successfully to DB');
      } else {
        console.log('user already exists');
        // 3) If everything is ok, generate token
        SendToken.createToken(user, 200, request, request.res);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
