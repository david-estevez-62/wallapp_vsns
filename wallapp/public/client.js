

var smallerScreenDimen;



function resizeCanvas(){
	smallerScreenDimen = window.innerHeight < window.innerWidth ? { height: window.innerHeight } : {width: window.innerWidth};

	if(smallerScreenDimen.height){
		$("#map").css({ width: smallerScreenDimen.height, height: smallerScreenDimen.height * 0.6 });
	} else {
		$("#map").css({ width: smallerScreenDimen.width, height: smallerScreenDimen.width * 0.6 });
	}
}



function processAuthLink(e) {
	e.preventDefault();

	var authLink = document.getElementById("authLink");

	if(authLink.textContent === "Login/Signup" && $("#loginForm").hasClass("hide")){
		$("#loginForm").removeClass("hide")
						.append("<input name='username' placeholder='username'></input><input name='password' placeholder='password'></input>")
		$("body").append("<div id='overlay'></div>")
	} else if($("#loginForm").hasClass("hide")) {
		$("#loginForm").removeClass("hide").append("<a href='/signout'>sign out</a>")
		$("body").append("<div id='overlay'></div>")
	}
}


$("#nav span").on("click", function(){
	if($(this).text() === "Wall" && !($(this).hasClass("active"))){
		$(".active").removeClass("active");
		$(this).addClass("active");

		$("#toolBar").addClass("hide");
	}else if($(this).text() === "edit Wall" && !($(this).hasClass("active")) ) {
		$(".active").removeClass("active");
		$(this).addClass("active");

		$("#toolBar").removeClass("hide");
	}
});

$("#colInp").on("change", function(){
	$("canvas").css("color", $(this).val());
})


$("body").on("click", "#overlay", function(e){
	$(this).remove();
	$("#loginForm").addClass("hide").html("")
})


window.addEventListener("resize", function() {
	resizeCanvas();
});

resizeCanvas();