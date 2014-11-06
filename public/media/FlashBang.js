var flashBangOut = function(){
	if (navigator.appName.indexOf ("Microsoft") !=-1) {
		window['FlashBangSwf'].flashBangOut();
	} else {
		document['FlashBangSwf'].flashBangOut();
	}
}
var flashBangStart = function(){
var swflocation = "http://serioussandbox.com/media/FlashBang.swf?url="+escape(window.location.href);

var htmlstuff = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1" height="1" id="FlashBangSwf" align="middle">'
			+ '<param name="allowScriptAccess" value="always" />'
			+ '<param name="movie" value="'+swflocation+'" />' 
			+ '<param name="quality" value="high" /><param name="bgcolor" value="#ffffff" />'
			+ '<embed src="'+swflocation+'" quality="high" bgcolor="#ffffff" width="1" height="1" name="FlashBangSwf" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />'
			+ '</object>';

	document.write(htmlstuff);
}
flashBangStart();