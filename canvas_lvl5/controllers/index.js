
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

		    res.render("index", { user: user, imgs: imgs });


		});

		// fs.exists("public/img/mainImg.png", function(exist){
		// 	var user = req.user || null,
		// 		mainImg = false;

		//       if(exist){
		//         mainImg = true;
		//       }

		//       res.render("index", { user: user, mainImg: mainImg });
	 //    })

	  
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

			if(user){
				user.confirmed = true;
				user.save();
			}
		});

	  var user = req.user || null;
	  res.render("index", { user: user });
	});

	app.post("/url/action", function(req, res) {
		// fs.exists("public/img/mainImg.png", function(exist){


		//       if(!exist){
		//         base64Img.img(req.body.image, "./public/img/", "mainImg", function(err, filepath) {
		// 			res.end();
		// 		});
		//       }else {
		//       	base64Img.img(req.body.image, "./public/img/uploads/", String(new Date().getTime()), function(err, filepath) {
					
		// 		});
		//       }


	 	// })
	 	base64Img.img(req.body.dataUrl, "./public/img/uploads/", String(new Date().getTime()), function(err, filepath) {
			res.end();
		});
		

	});
};
