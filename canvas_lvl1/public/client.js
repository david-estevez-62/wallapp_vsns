


var smallerScreenDimen;


// intializeHeader: {

// 	let headerTitle = '<a href="/wall"><span id="title">canvas</span></a>';

// 	if(user){
// 		$("#header").html(headerTitle + '<a href="#!" id="authLink" onclick="processAuthLink()">' + 
// 																						   user.username + '</a>');
// 		$("body").html('<div><a href="/wall">wall</a><button>edit wall</button></div><div id="editSidebar"><div>')
// 	}
// 	else {
// 		$("#header").html(headerTitle + '<a href="#!" id="authLink" onclick="processAuthLink()">Login/Signup</a>');
// 	}

// }


function tailorCanvas(){
	smallerScreenDimen = window.innerHeight < window.innerWidth ? { height: window.innerHeight } : {width: window.innerWidth};

	if(smallerScreenDimen.height){
		$("#map").css({ width: smallerScreenDimen.height, height: smallerScreenDimen.height * 0.6 });
	} else {
		$("#map").css({ width: smallerScreenDimen.width, height: smallerScreenDimen.width * 0.6 });
	}
}





window.addEventListener("resize", function() {
	tailorCanvas();
});

tailorCanvas();