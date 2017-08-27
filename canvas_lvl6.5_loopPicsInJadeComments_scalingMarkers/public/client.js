var smallerScreenDimen,
	loginModel,
	strokeSize,
	leftButtonDown,
	lastWidthDimen,
	scaleClose;
	



$("#nav span").on("click", function(){

	// Check to see if the span that was clicked does not currently have the active class in #nav otherwise do 
	// nothing because that is already the current state
	if(!($(this).hasClass("active"))){

		$(this).siblings().removeClass("active");
		$(this).addClass("active");

		if($(this)[0] === $("#nav span")[0]){
			// If the element with id draftLayer (the editable layer) has any children elements, then trap user 
			// and tell them they have unsaved work and ask if they still wish to continue anyway to the non-edit state
			if($("#draftLayer")[0].firstChild && confirm("You have unsaved work. Click the Ok button to keep your work.\n" + 
														 "Or cancel to continue anyway and lose your unsaved work")){
				$(this).siblings().addClass("active");
				$(this).removeClass("active");
				return;
			}

			if(document.getElementById("backgroundTog").checked){
				$("#backgroundTog").trigger("click");
			}
			// Remove elements as well as event listeners that are only needed while in "Edit" state. Not necessary to keep
			// listening for events when not in "Edit" state. Removing the editable div will remove all of its listeners
			$("#draftLayer").remove();
			$("#toolBar").addClass("hide");

			$(document).off("mousedown");
			$(document).off("mouseup");

			// Request new pictures from backend to add to the canvas
			getPictures();

		}else{

			// ReCreate the editable div and show toolbar because the span corresponding with the edit state was clicked
			$("#backSetting").after("<div id='draftLayer'>");

			$("#toolBar").removeClass("hide");


			// Set the dimensions of the newly created div to be the same dimensions of the #backSetting div that holds 
			// the static canvas so it is essentially an identical div stacked above
			$("#draftLayer").css({ width: $("#backSetting").width(), height: $("#backSetting").height() });

			// get stroke size at moment when switched to "Edit" mode
			brushSize();
			
			// Add the listeners, including the mousemove and drag listeners on the draftLayer (editable layer) itself
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
	// Either of two elements will come back from the selector as being spans in the loginBlock we only want the span 
	// to be the opposite of the one that currently has the active class or else do nothing because that means the span 
	// that was clicked is the one that corresponds to the already the current state
	if(!($(this).hasClass("active"))) {
		// switch the active class to the opposite span within the loginBlock
		$("#loginBlock .active").removeClass("active");
		$(this).addClass("active");
		// if clicked on the first span use the default login template, otherwise you clicked on the second span and for 
		// case customize the login template by adding a field for the signup form
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

$("#toolBar #backgroundTog").on("click", function(){
	if($(this)[0].checked){
		$("#backSetting img").hide();
	}else{
		$("#backSetting img").show();
	}
});


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

$("#toolBar [type=button]").on("click", function(event){
	if($("#draftLayer")[0].firstChild && confirm("Are you sure you are finished? If so we will upload your work and provide you with a blank slate")){
		var node = document.getElementById("draftLayer");

		$("#draftLayer").css({
					left: "0",
					top: "0",
					marginTop:"0",
					transform: "translate(0,0)"
				});

		domtoimage.toPng(node)
		    .then(function (dataUrl) {

		        $("#draftLayer").css({
					left: "50%",
					top: "",
					marginTop: "40px",
					transform: "translate(-50%)"
				});

				$.post({
				    url: "/url/action",
				    data: { dataUrl: dataUrl }
				}).done(function(e){
		            location.reload(false)
		        });
		        
		    })
		    .catch(function (error) {
		        console.error("oops, something went wrong!", error);
		    });
	}
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
				  width: strokeSize,
				  height: strokeSize,
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
		for (var i = 0; i < dotElems.length; i++) {
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

		brushSize();

		lastWidthDimen = parseInt($("#draftLayer").width());
	}
	
}


function brushSize() {
	var smallerDimen = smallerScreenDimen.height ? smallerScreenDimen.height : smallerScreenDimen.width;
	strokeSize = Math.ceil((smallerDimen/900) * 4);

	$("#draftLayer .dot").css({ width: strokeSize, height: strokeSize });
}

// function getPictures(){
// 	$.get({
// 		url: "/pictures",
// 	})
// 	.done(function(imgs){
// 		var currLastImg = $("#backSetting")[0].lastChild.getAttribute("src");
// 		var domFrag = document.createDocumentFragment();
//         for(var i = 0; img; i < imgs.length; i++){
//         	if(currLastImg < imgs[i]){
//         		img = document.createElement("img");
//         		img.src = imgs[i];

//         		domFrag.appendChild(img);
//         	}
//         }

//         document.getElementById("backSetting").appendChild(domFrag);

//     });
// }





$("body").delegate("#overlay", "click", function(){
	$("#overlay").addClass("hide");
	$("#loginBlock").html(loginModel).addClass("hide");
});


// window.setInterval(getPictures, 20000);

// resize event handler will also be fired on any orientation changes that typically
// occur on mobile (touch screens) so no need to listen for orientation change events
$(window).on("resize", function(){ clearTimeout(scaleClose); scaleClose = setTimeout(tailorCanvas, 500); })


tailorCanvas();
lastWidthDimen = smallerScreenDimen.height ? smallerScreenDimen.height : smallerScreenDimen.width;


