
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "Aol",
  auth: {
      user: "canvastestprogram@aol.com",
      pass: "secret27-"
  }
});



var mailOptions = {
  from: "Eric <canvastestprogram@aol.com>",
  subject: "Canvas App - Email verification"
}



var User = require("../models/users");




var performLogin = function (req, res, next, user) {
  // Passport injects functionality into the express ecosystem,
  // so we are able to call req.login and pass the user we want
  // logged in.
  
  req.login(user, function (err) {

    // If there was an error, allow execution to move to the next middleware
    if (err) return next(err);

    // Just end the response here we are going to refresh the page on client
    // at which point it will get the cookie that authorizes the session
    return res.end();
  });
};


module.exports = function(app, passport){

  app.post("/signin", function (req, res, next) {
    // Passport's "authenticate" method returns a method, so we store it
    // in a variable and call it with the proper arguments afterwards.
    // We are using the "local" strategy defined (and used) in the
    // config/passport.js file

    var authFunction = passport.authenticate("localSignIn", function(err, user, info){

      // If there was an error, allow execution to move to the next middleware
      if(err) return next(err);

      // If the user was not successfully logged in due to not being in the
      // database or a password mismatch, set a flash variable to show the error
      // which will be read and used in the "login" handler above and then redirect
      // to that handler.
      if(!user) {
        return res.redirect("/wall");
      }

      // If we make it this far, the user has correctly authenticated with passport
      // so now, we'll just log the user in to the system.
      performLogin(req, res, next, user);
    });

    // Now that we have the authentication method created, we'll call it here.
    authFunction(req, res, next);
  });



  app.post("/signup", function(req, res, next){

    User.find({email: req.body.email}, function(err, user){
      if(err) return next(err);

      if(user.length > 0) {
          // That email is already in the system
      } else {
          var user = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
          });

          user.save(function(err, user){

            if(err) {}

            mailOptions.to = req.body.email;
            mailOptions.text = "Verify your Canvas account by going to this link" + req.body.email;
            

            transporter.sendMail(mailOptions, function(err, res) {
              if(err){
                console.log("Error");
              }else{
                console.log("Email sent");
                return res.redirect("/wall");
              }
            })
            
          });


      }
    })

  
  }),


  app.get("/signout", function(req, res){
    req.logout();

    res.redirect("/wall");
  });

};
