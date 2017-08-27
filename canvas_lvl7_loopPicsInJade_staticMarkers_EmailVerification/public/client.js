var smallerScreenDimen,
	loginModel,
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
			getNewCanvas()

		}else{

			// Re-create the editable div and show toolbar because the span corresponding with the edit state was clicked
			$("#backSetting").after("<div id='draftLayer'>");

			$("#toolBar").removeClass("hide");


			// Set the dimensions of the newly created div to be the same dimensions of the #backSetting div that holds 
			// the static canvas so it is essentially an identical div stacked above
			$("#draftLayer").css({ width: $("#backSetting").width(), height: $("#backSetting").height() });

			
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
	// If the element with id draftLayer (the editable layer) has any children elements, then trap user and inform that 
	// there is unsaved work and the work is at risk of being lost if they still wish to refresh anyway
	if(frameLayer.firstChild && confirm("Are you sure you wish to refresh, you have unsaved work. Click Ok to refresh anyway")){
		// remove the editable div and add it right back instead of looping through and having to remove all child elements
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
	// Only handle the submit button click if work has been done on the editable div (#draftLayer), if it has any children
	// work has been done 
	if($("#draftLayer")[0].firstChild && confirm("Are you sure you are finished? If so we will upload your work and provide you with a blank slate")){

		var node = document.getElementById("draftLayer");

		
		$("#draftLayer").css({
					left: "0",
					top: "0",
					marginTop:"0",
					transform: "translate(0,0)"
				});
		// Copy the dom node (#draftLayer) as a base64 data url
	    domtoimage.toPng(node)
		    .then(function (dataUrl) {

				$.post({
				    url: "/url/action",
				    data: { dataUrl: dataUrl }
				}).done(function(e){
		            location.reload(true)
		        });

		    })
		    .catch(function (error) {
		    	// Refreshing the page will delete the draft layer essentially because it 
		    	// starts not there on pg reload
		        location.reload(true)
		        console.error("oops, something went wrong!", error);
		    });

	}

});


$("#loginBlock").delegate("#loginForm", "submit", function(event) {
	event.preventDefault();

	// clear img interval no point in asking for images from backend when submitting form and 
	// going to reload page anyway
	clearInterval(getPrintInterval)
	// get the state that has the current active class
	var state = $(this).closest("#loginBlock").find(".active");
	// serialize form fields
	var formdata = $(this).serializeArray();
	var data = {};
	$(formdata).each(function(index, obj){
	    data[obj.name] = obj.value;
	});

	$("#loginBlock").addClass("hide");
	$("#overlay").addClass("hide");


	var url = state[0] === $("#loginBlock span")[0] ? "/signin" : "/signup";


	$.post(url, data, function(){
			location.reload(true);
		});


});




$("#authLink").on("click", function(event){
	event.preventDefault();

	// See if loginModel already exists if not create it. Will use the loginModel variable to reset 
	// back to default state
	if(!loginModel){
	   loginModel = $("#loginModel").text();
	   $("#loginBlock").html(loginModel);

	   $("#overlay").on("click", function(){
			$("#overlay").addClass("hide");
			$("#loginBlock").html(loginModel).addClass("hide");
		});
	}

	// If the #authLink element does not have the text Login/Signup within it then it has a username, 
	// of the signed in user. Then customize the html of the #loginBlock with a signout link
	if($(this).text().indexOf("Login/Signup") === -1) {
		$("#loginBlock").html("<a href='/signout'>signout</a>");
	}

	$("#loginBlock").removeClass("hide");
	$("#overlay").removeClass("hide");

});




// Add the event listeners that will be added and removed as the editable layer is deleted and added
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



function tailorCanvas(){
	// Find the smaller dimension of the clients screen
	smallerScreenDimen = window.innerHeight < window.innerWidth ? { height: window.innerHeight } : {width: window.innerWidth};
	// Use the smaller dimension between the height and width attained above and make canvas width 
	// the length of the smaller dimension and the height of the 60% of the same length
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



// Scale the position of the child elements of the #draftLayer div as the draftLayer is scaled
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

		lastWidthDimen = parseInt($("#draftLayer").width());
	}
	
}




function getNewCanvas() {

	$.get({
		url: "/staticpics",
	})
	.done(function(imgs){
		var currLastImg = parseInt($("#backSetting")[0].lastChild.getAttribute("src").substr(13));

		var domFrag = document.createDocumentFragment();

        for(var i = 0, img; i < imgs.length; i++){

        	if(currLastImg < parseInt(imgs[i].substr(13))){
        		img = document.createElement("img");
        		img.src = imgs[i];

        		domFrag.appendChild(img);
        	}
        }

        document.getElementById("backSetting").appendChild(domFrag);

    });
}



tailorCanvas();
lastWidthDimen = smallerScreenDimen.height ? smallerScreenDimen.height : smallerScreenDimen.width;






// resize event handler will also be fired on any orientation changes that typically
// occur on mobile (touch screens) so no need to listen for orientation change events
$(window).on("resize", function(){ clearTimeout(scaleClose); scaleClose = setTimeout(tailorCanvas, 500); })


getPrintInterval = window.setInterval(getNewCanvas, 20000);




