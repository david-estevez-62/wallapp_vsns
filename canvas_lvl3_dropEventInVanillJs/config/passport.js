
var passport = require("passport"),
LocalStrategy = require("passport-local").Strategy;

var User = require("../models/users");


// SERIALIZATION:
//  This small subset of code will take a user object, used
//  in our JS, and convert it into a small, unique, string
//  which is represented by the id, and store it into the
//  session.
passport.serializeUser(function(user, done){
  done(null, user.id);
});

// DESERIALIZATION:
//  Essentially the inverse of above. This will take a user
//  id out of the session and convert it into an actual
//  user object.
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});



// LOCAL SIGNIN 
var localSignIn = new LocalStrategy({
  passReqToCallback: true
},
  function(req, username, password, next){
    
    // Check to see if user is in the database
    User.findOne({"username":username}, function(err, user){


      if (err) return next(err);

      // If user is not found...
      if (!user){
        return next(null, false, req.flash("info", "No user found"));
      }

      return next(null, user);

      user.comparePassword(password, function(err, isMatch){

        if (err) return next(err);

        // Passwords don't match...
        if(!isMatch){
          return next(null, false, req.flash("info", "Wrong password"));
        }

        // user found, password match. Check if confirmed email
        if(!user.confirmed){
          return next(null, false, req.flash("info", "Confirm the email verification"));
        }else{
          return next(null, user);
        }

      });
    });
  }
);

// Passport needs to know about our strategy definition above, so
// we hook that in here.
passport.use("localSignIn", localSignIn);


