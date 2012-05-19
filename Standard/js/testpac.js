onmessage = function(script) {
    try{
	eval(script);
        postMessage(script);
    }
    catch (e) {
        postMessage(e);
    }
	
};