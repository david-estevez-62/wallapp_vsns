

var smallerScreenDimen,
	loginModel,
	leftButtonDown,
	lastWidthDimen,
	scaleClose;
	



$("#nav span").on("click", function(){

	if(!($(this).hasClass("active"))){
		$(this).siblings().removeClass("active");
		$(this).addClass("active");


		if($(this)[0] === $("#nav span")[0]){
			if($("#draftLayer")[0].firstChild && confirm("You have unsaved work. Click the Ok button to keep your work.\n" + 
														 "Or cancel to continue anyway and lose your unsaved work")){
				$(this).siblings().addClass("active");
				$(this).removeClass("active");
				return
			}

			$("#draftLayer").remove();
			$("#toolBar").addClass("hide");

			$(document).off("mousedown");
			$(document).off("mouseup");
		}else{

			$("#backSetting").after("<div id='draftLayer'>");

			$("#draftLayer").css({ 
								width: $("#backSetting").width(),
								height: $("#backSetting").height()
							});

			$("#toolBar").removeClass("hide");

			addEditStateEvents();

		 	$(document).on("mousedown", function(event){
		 		if(event.which === 1){
		 			leftButtonDown = true;
		 		}else if(event.button === 0){
		 			leftButtonDown = true;
		 		}
			});
			$(document).on("mouseup", function(event){
			    	if(event.which === 1){
		 			leftButtonDown = false;
		 		}else if(event.button === 0){
		 			leftButtonDown = false;
		 		}
			});

		}

	}
});



$("#loginBlock").delegate("span", "click", function(){
	if(!($(this).hasClass("active"))) {

		$("#loginBlock .active").removeClass("active");
		$(this).addClass("active");
		($(this)[0] === $("#loginBlock span")[0]) ? $("#loginBlock").html(loginModel) : 
						$("#loginForm").prepend("<input type='email' name='email' placeholder='email'>");			
	}
});




$("#toolBar #refreshBtn").on("click", function(){
	var frameLayer = document.getElementById("draftLayer");
	if(frameLayer.firstChild && confirm("Are you sure you wish to refresh, you have unsaved work")){
		frameLayer.parentNode.removeChild(frameLayer);
		$("#backSetting").after("<div id='draftLayer'>");
		$("#draftLayer").css({ 
								width: $("#backSetting").width(),
								height: $("#backSetting").height()
							});
		addEditStateEvents();
	}
})


$("#toolBar select").on("change", function(){
	if($(this).val() === "draw"){
		$(this).closest("div").prev().remove();
	}else{
		$(this).closest("div").before("<div><input type='text' id='addTextBox' draggable='true' /></div>")
	}
});

$("#toolBar").delegate("#addTextBox", "dragstart", function(event){
	event.originalEvent.dataTransfer.setData("text", event.target.getAttribute("id"));
	event.originalEvent.dataTransfer.dropEffect = "move";
});


$("#loginBlock").delegate("#loginForm", "submit", function(event) {
	event.preventDefault();

	var state = $(this).closest("#loginBlock").find(".active");

	var formdata = $(this).serializeArray();
	var data = {};
	$(formdata).each(function(index, obj){
	    data[obj.name] = obj.value;
	});


	if(state[0] === $("#loginBlock span")[0]){
		$.post("/signin", data, function(doc) {
			location.reload(false);
		});
	}else{
		$.post("/signup", data, function(doc) {
			location.reload(false)
		});
	}
});

$("#authLink").on("click", function(event){
	event.preventDefault();

	if($(this).text() === "Login/Signup") {
		if(!loginModel){
		   loginModel = $("#loginModel").text();
		   $("#loginBlock").html(loginModel);
		}

		$("#loginBlock").removeClass("hide");
		$("#overlay").removeClass("hide");
	} else {
		if(!loginModel){
		   loginModel = $("#loginModel").text();
		   $("#loginBlock").html(loginModel);
		}

		$("#loginBlock").html("<a href='/signout'>signout</a>");
		$("#loginBlock").removeClass("hide");
		$("#overlay").removeClass("hide");
	}
});



function tailorCanvas(){

	smallerScreenDimen = window.innerHeight < window.innerWidth ? { height: window.innerHeight } : {width: window.innerWidth};

	if(smallerScreenDimen.height){
		if($("#draftLayer").length){
			$("#draftLayer").width(smallerScreenDimen.height + "px");
			$("#draftLayer").height( (smallerScreenDimen.height * 0.6) + "px");
		}
		
		$("#backSetting").width(smallerScreenDimen.height + "px");
		$("#backSetting").height( (smallerScreenDimen.height * 0.6) + "px");
	} else {
		if($("#draftLayer").length){
			$("#draftLayer").width(smallerScreenDimen.width + "px");
			$("#draftLayer").height( (smallerScreenDimen.width * 0.6) + "px");
		}
		
		$("#backSetting").width(smallerScreenDimen.width + "px");
		$("#backSetting").height( (smallerScreenDimen.width * 0.6) + "px");
	}

	if($("#draftLayer .dot").length){ scaleSketch(); }
}


function addEditStateEvents() {

	$("#draftLayer").on("mousemove", function(event){
	  	if(leftButtonDown && $("#toolBar select").val() === "draw"){

  		   $("<div class='dot'>")
  			   .appendTo(this)
  			   .css({
				  top: (event.clientY-event.target.offsetTop) + "px", 
				  left: (event.clientX-(event.target.offsetLeft - (parseInt(event.target.style.width)/2))) + "px",
				  background: $("#toolBar [type=color]").val()
			   });
  		}
	});

	$("#draftLayer").on("drop", function(event){
		event.preventDefault();

		var textValue = event.originalEvent.dataTransfer.getData("text");
		var inpObjRef = document.getElementById(textValue);

		event.target.appendChild(inpObjRef);

		inpObjRef.removeAttribute("id");
		inpObjRef.removeAttribute("draggable");
		$(inpObjRef).css({
			position: "absolute",
			top: (event.clientY-event.target.offsetTop) + "px",
			left: (event.clientX-(event.target.offsetLeft - (parseInt(event.target.style.width)/2))) + "px",
			color: $("#toolBar [type=color]").val(),
			width: $(this).width - 
				   (event.clientX-(event.target.offsetLeft - (parseInt(event.target.style.width)/2))) + "px",
			outline: "none",
			border: "none"
		});

		$("#toolBar div:nth-child(3)").append("<input type='text' id='addTextBox' draggable='true' />");
	});

	$("#draftLayer").on("dragover", function(event){
		return false;
	});

}


function scaleSketch(){
	var dotElems = $("#draftLayer .dot");
	var textElems = $("#draftLayer [type=text]");

	if(lastWidthDimen !== parseInt($("#draftLayer").width())){
		for (var i = 0, dotTop, dotLeft; i < dotElems.length; i++) {
			dotElems[i].style.left = (parseInt(dotElems[i].style.left)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
			dotElems[i].style.top = (parseInt(dotElems[i].style.top)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
		}

		for (var i = 0; i < textElems.length; i++) {
			textElems[i].style.left = (parseInt(textElems[i].style.left)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
			textElems[i].style.top = (parseInt(textElems[i].style.top)) * 
									 ((parseInt($("#draftLayer").width()))/lastWidthDimen) + "px";
		}

		lastWidthDimen = parseInt($("#draftLayer").width());
	}
	
}






$("body").delegate("#overlay", "click", function(){
	$("#overlay").addClass("hide");
	$("#loginBlock").html(loginModel).addClass("hide");
});



// resize event handler will also be fired on any orientation changes that typically
// occur on mobile (touch screens) so no need to listen for orientation change events
$(window).on("resize", function(){ clearTimeout(scaleClose); scaleClose = setTimeout(tailorCanvas, 500); })


tailorCanvas();
lastWidthDimen = smallerScreenDimen.height ? smallerScreenDimen.height : smallerScreenDimen.width;