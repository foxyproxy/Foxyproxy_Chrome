onmessage = function(script) {	
	eval(script);
	postMessage("ok");
};