	// 与光标操作有关，还需完善

	var get_selection = function(){
	    var range;
		if($.support.msie){
	       range = document.selection.createRange();
		   if (range.htmlText && range.text){return range.htmlText;}
	    }else{
		   	if(window.getSelection) {
		       var selection = window.getSelection();
		       if(selection.rangeCount>0&&window.XMLSerializer){
                   range=selection.getRangeAt(0);
                   var html=new XMLSerializer().serializeToString(range.cloneContents());
			       return html;
               }
               if(selection.rangeCount > 0) {
		           range = selection.getRangeAt(0);
			       var clonedSelection = range.cloneContents();
			       var div = document.createElement('div');
			       div.appendChild(clonedSelection);
			       return div.innerHTML;
		       }
			}
		}
	};