$(document.body).keydown(function (e) {

	if((e.altKey && e.keyCode == 113 && !e.ctrlKey) 
           || (e.shiftKey && e.ctrlKey && e.keyCode && String.fromCharCode(e.keyCode).toUpperCase() == 'A')){

	    chrome.extension.sendRequest({
		action:'addpattern', 
		url: location.href
	    });


	} 

});

