
(function($){$.fn.numeric=function(decimal,callback)
{decimal=(decimal===false)?"":decimal||".";callback=typeof callback=="function"?callback:function(){};return this.data("numeric.decimal",decimal).data("numeric.callback",callback).keypress($.fn.numeric.keypress).blur($.fn.numeric.blur);}
$.fn.numeric.keypress=function(e)
{var decimal=$.data(this,"numeric.decimal");var key=e.charCode?e.charCode:e.keyCode?e.keyCode:0;if(key==13&&this.nodeName.toLowerCase()=="input")
{return true;}
else if(key==13)
{return false;}
var allow=false;if((e.ctrlKey&&key==97)||(e.ctrlKey&&key==65))return true;if((e.ctrlKey&&key==120)||(e.ctrlKey&&key==88))return true;if((e.ctrlKey&&key==99)||(e.ctrlKey&&key==67))return true;if((e.ctrlKey&&key==122)||(e.ctrlKey&&key==90))return true;if((e.ctrlKey&&key==118)||(e.ctrlKey&&key==86)||(e.shiftKey&&key==45))return true;if(key<48||key>57)
{if(key==45&&this.value.length==0)return true;if(decimal&&key==decimal.charCodeAt(0)&&this.value.indexOf(decimal)!=-1)
{allow=false;}
if(key!=8&&key!=9&&key!=13&&key!=35&&key!=36&&key!=37&&key!=39&&key!=46)
{allow=false;}
else
{if(typeof e.charCode!="undefined")
{if(e.keyCode==e.which&&e.which!=0)
{allow=true;if(e.which==46)allow=false;}
else if(e.keyCode!=0&&e.charCode==0&&e.which==0)
{allow=true;}}}
if(decimal&&key==decimal.charCodeAt(0))
{if(this.value.indexOf(decimal)==-1)
{allow=true;}
else
{allow=false;}}}
else
{allow=true;}
return allow;}
$.fn.numeric.blur=function()
{var decimal=$.data(this,"numeric.decimal");var callback=$.data(this,"numeric.callback");var val=$(this).val();if(val!="")
{var re=new RegExp("^\\d+$|\\d*"+decimal+"\\d+");if(!re.exec(val))
{callback.apply(this);}}}
$.fn.removeNumeric=function()
{return this.data("numeric.decimal",null).data("numeric.callback",null).unbind("keypress",$.fn.numeric.keypress).unbind("blur",$.fn.numeric.blur);}})(jQuery);