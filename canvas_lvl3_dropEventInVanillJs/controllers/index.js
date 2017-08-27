
var User = require("../models/users.js");


module.exports = function(app) {
	app.get("/", function(req, res) {
	    res.redirect("/wall");
	});

	app.get("/wall", function(req, res) {
	  var user = req.user || null;

	  res.render("index", { user: user });
	});

	app.get("/code/:token", function(req, res) {

		User.findById(req.params.token, function(err, user) {

			if(user){
				user.confirmed = true;
				user.save();
			}
		});

	  var user = req.user || null;
	  res.render("index", { user: user });
	});
};
