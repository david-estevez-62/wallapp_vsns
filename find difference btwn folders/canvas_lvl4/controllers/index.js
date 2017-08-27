
var User = require("../models/users.js");


var fs = require("fs");
var multer  = require("multer");



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/uploads/")
  },
  filename: function (req, file, cb) {
    var fileNameSpaceless = (file.originalname).replace(/\s/g, ");

    fs.exists("public/img/uploads/" + fileNameSpaceless, function(exists) {
    var uploadedFileName;

      if (exists) {
          uploadedFileName = (Date.now() + "_" + file.originalname).replace(/\s/g, ");
      } else {
          uploadedFileName = fileNameSpaceless;
      } 
      cb(null, uploadedFileName)

  });
    
  }
})

var upload = multer({ storage: storage });





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

	app.get("/url/action", function(req, res) {
		// console.log()
		console.log("11111", req.files)
	});
};
