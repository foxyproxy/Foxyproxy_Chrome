function getSelectedText(){
	var w = window,d = document, s = '', u;
	if (w.getSelection != u) { s = w.getSelection();}
	else if (d.getSelection != u) { s = d.getSelection(); }
	else if (d.selection) { s = d.selection.createRange().text; }
	else { return ''; }
	s = String(s).trim();
	return (escape(s));
}

$(document.body).keydown(function (e) {
	if(e.altKey && e.keyCode == 114 && !e.ctrlKey){
		var selection = getSelectedText();
		if(selection){
			chrome.extension.sendRequest({
					action:'quickadd', 
					data: selection
				}
			);
		}
	} else if(!e.altKey && e.keyCode == 113 && e.ctrlKey){
			chrome.extension.sendRequest({
					action:'proxylist'
				}
			);
	}

	
});

