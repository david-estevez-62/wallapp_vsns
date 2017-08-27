
var User = require("../models/users.js");


var fs = require("fs"),
base64Img = require("base64-img");




module.exports = function(app) {

	app.get("/", function(req, res) {
	    res.redirect("/wall");
	});


	app.get("/wall", function(req, res) {

		fs.readdir("public/img/uploads", function(err, pics){
			var user = req.user || null;

			var imgs = [];

			if (err) {
		        throw err;
		    }

		    // do not use pics because could have hidden .files such as DS Store
		    for (var i = 0; i < pics.length; i++) {
		    	if(pics[i].substr(-4) === ".png"){
		    		imgs.push("/img/uploads/" + pics[i]);
		    	}
		    }

		    res.render("index", { user: user, imgs: imgs, info: req.flash("info") });


		});

	});


	app.get("/staticpics", function(req, res) {

		fs.readdir("public/img/uploads", function(err, pics){

			var imgs = [];

			if (err) {
		        throw err;
		    }

		    // do not use pics because could have hidden .files such as DS Store
		    for (var i = 0; i < pics.length; i++) {
		    	if(pics[i].substr(-4) === ".png"){
		    		imgs.push("/img/uploads/" + pics[i]);
		    	}
		    }

		    res.send(imgs);


		});

	});


	app.get("/code/:token", function(req, res) {

		User.findById(req.params.token, function(err, user) {

			var infoMsg;
			// there is no point in saving again if user clicks link again after already being verified
			// so check if user.confirmed is falsey
			if(user && !user.confirmed){
				user.confirmed = true;
				user.save();

				infoMsg = "Congratulations. Your account was verified. You may sign in.";
			} else if(user){
				infoMsg = "That account has already been verified.";
			} else {
				infoMsg = "That link is not for a valid account.";
			}

			req.flash("info", infoMsg);

		  	res.redirect("/wall")
		}); 

	});


	app.post("/url/action", function(req, res) {
	 	base64Img.img(req.body.dataUrl, "./public/img/uploads/", String(new Date().getTime()), function(err, filepath) {
			res.end();
		});
	});


};


