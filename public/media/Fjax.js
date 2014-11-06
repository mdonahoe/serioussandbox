//	:: 	FJax Software Development Kit
//		Author: Stephen & Jay McDonald
//		Date:	Monday, April 17, 2006
	function GetXML(ThisXMLFile, ThisOutputDivID,ThisFjaxEngineID){
		var objFjax = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
						+ 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" '
						+ 'width="1" height="1" id="'+ ThisFjaxEngineID +'" align="middle">'
						+ '<param name="allowScriptAccess" value="always" />'
						+ '<param name="movie" value="/media/Fjax.swf?sXML=' + ThisXMLFile 
						+ '&sOutputDivID=' + ThisOutputDivID + '&sFjaxEngine=' + ThisFjaxEngineID + '" />'
						+ '<param name="wmode" value="transparent" />'
						+ '<param name="bgcolor" value="#ffffff" />'
						+ '<embed src="/media/Fjax.swf?sXML=' + ThisXMLFile 
						+ '&sOutputDivID=' + ThisOutputDivID + '&sFjaxEngine=' + ThisFjaxEngineID + '" '
						+ 'wmode="transparent" bgcolor="#ffffff" width="1" height="1"'
						+ 'align="middle" allowScriptAccess="sameDomain" '
						+ 'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" '
						+ 'name="'+ ThisFjaxEngineID +'" swLiveConnect="true" />'
						+ '</object>'
			if(document.all){
				//isIE
					document.all[ThisOutputDivID].innerHTML = objFjax;
				}else{
				//isNotIE
					document.getElementById(ThisOutputDivID).innerHTML = objFjax;
				}
			}
	function ShowFjaxContent(ThisOutputDivID,ThisFjaxEngineID){
		var ThisContent = "";
		if(document.all){
		//isIE
			if(document.all[ThisFjaxEngineID].getVariable("sContent") == ''){
				ThisContent = "There was an error retrieving content for this page.";
			}else{
				ThisContent = document.all[ThisFjaxEngineID].getVariable("sContent");
			}
			document.all[ThisOutputDivID].innerHTML = ThisContent;
		}else{
		//isNotIE
			if(document[ThisFjaxEngineID].GetVariable('sContent') == ''){
				ThisContent = "There was an error retrieving content for this page.";
			}else{
				ThisContent = document[ThisFjaxEngineID].GetVariable('sContent');
			}
			document.getElementById(ThisOutputDivID).innerHTML = ThisContent;
		}
	}