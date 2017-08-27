
var User = require("../models/users.js");

module.exports = function(app){
	app.get("/", function(req, res) {
	    res.redirect("/wall");
	});

};