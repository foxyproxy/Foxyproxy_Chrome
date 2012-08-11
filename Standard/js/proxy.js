function Proxy(_data){
    this.className = "Proxy";
    this.data = {
	id: this.randomId(),
	readonly: false,
	enabled: true,
	color: "#0055E5", 
	name: "", 
	notes: "",
	host: "" , 
	port: 0, 
	isSocks: false, 
	socks: "", 
	pac: "", 
	//dns: "",
	type: "manual", // direct, manual, or "auto" for pac (TODO: change that)
	cycle: false,
	useDns: true,
	reloadPAC: false,
	bypassFPForPAC: true,
	reloadPACInterval: 60,
	configUrl: "",
	notifOnLoad: true,
	notifOnError: true,
	patterns: [],
	ipPatterns : []
    };

    if(_data && _data.data){
	$.extend(this.data, _data.data);
    }
    else{
	$.extend(this.data, _data);
    }
    if (this.data.patterns && this.data.patterns.length){
	this.data.patterns = $.map(this.data.patterns, function(obj){
	    return new ProxyPattern(obj);
	});
    }
    if (this.data.ipPatterns && this.data.ipPatterns.length){
	this.data.ipPatterns = $.map(this.data.ipPatterns, function(obj){
	    return new ProxyPattern(obj);
	});
    }
}

Proxy.prototype = {
    toArray: function(){
	return	[this.data.readonly, this.data.enabled, this.data.color, this.data.name, this.data.notes, this.data.host, this.data.port, this.data.isSocks, this.data.socks, this.data.configUrl, this.data.useDns];
    },
    randomId: function(){
	var chars = "0123456789";
	var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
	    var rnum = Math.floor(Math.random() * chars.length);
	    randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
    },
    updatePAC: function(){
	if(this.data.configUrl){
	    var xhr = $.ajax({
		url:this.data.configUrl, 
		async: false
	    });
	    if(xhr.status == 200)
		this.data.pac = xhr.responseText;
	    else
	    {
		alert(localize("Could not load:")+" "+this.data.configUrl);
		this.data.pac = "";
	    }
	} else {
	    this.data.pac = "";
	}
    }
};

function ProxyPattern(_data){
    this.className = "ProxyPattern";
    this.data = {
	enabled: true,
	temp: false,
	name: "Untitled pattern", 
	url: "", 
	whitelist: 'Inclusive', 
	type: "wildcard",
        regex: ""
    };

    if(_data && _data.data){
	$.extend(this.data, _data.data);
    }else{
	$.extend(this.data, _data);
    }
    this.data.regex = this.convertWildcardToRegexString();
}

ProxyPattern.prototype = {
    toArray: function(){
	return	[this.data.enabled, this.data.name, this.data.url, this.data.type, this.data.whitelist, this.data.temp];
    }
};


ProxyPattern.prototype.convertWildcardToRegexString = function(){
    var rx = null;
    if(this.data.type == "wildcard"){
	var result = this.data.url.replace(/([\/\(\)\[\]\.\?])/g,'\\$1');
	result = result.replace(/\*/g,'.*');
	rx = result;
    } else {
	rx = this.data.url;
    }
    return rx;
};

ProxyPattern.prototype.test = function(txt){
    var rx = RegExp(this.convertWildcardToRegexString());
    return rx.test(txt);
};