$.fn.dataTableExt.oApi.fnSelect = function (oSettings, obj){
	this.find("tr.selected_row").toggleClass('selected_row');
	$(obj).toggleClass('selected_row');
}

$.fn.dataTableExt.oApi.fnGetSelectedData = function (oSettings){
	var selection = this.find("tr.selected_row");
	if(selection.length){
		return this.fnGetData(selection[0]);
	}
	return null;
}

$.fn.dataTableExt.oApi.fnSelectRow = function (oSettings, iRow){
	this.find("tbody tr").eq(iRow).addClass("selected_row");
}

$.fn.dataTableExt.oApi.fnGetSelectedPosition = function (oSettings){
	var selection = this.find("tr.selected_row");
	if(selection.length){
		return this.fnGetPosition(selection[0]);
	}
	return null;
}

$.fn.dataTableExt.oApi.fnMoveSelectedUp = function (oSettings){
	/* the visual stuff that show which rows are selected */
	var oTable = this;
	function moveVisualSelectionUp(row, prevRow){
		row.removeClass("selected_row");
		prevRow.addClass("selected_row");
	}

	/* move the data in the internal datatable structure */
	function moveDataUp(row, prevRow){		
		var movedData = oTable.fnGetData(row[0]).slice(0); 	  // copy of row to move.
		var prevData = oTable.fnGetData(prevRow[0]).slice(0); // copy of old data to be overwritten by above data.
		
		// switch data around :)
		oTable.fnUpdate(prevData , row[0], 0, false, false);  
		oTable.fnUpdate(movedData , prevRow[0], 0, true, true);
	}		


	var arr = this.find("tr.selected_row");

	for(var i=0; i<arr.length; i++) {			
		var tr = arr[i];			
		var row = jQuery(tr); 				// row to move.
		var prevRow = jQuery(tr).prev();	// row to move should be moved up and replace this.

		/* already at the top? */
		if(prevRow.length==0){	break; }	
		
		moveDataUp(row, prevRow);
		moveVisualSelectionUp(row, prevRow);
	}	
}

$.fn.dataTableExt.oApi.fnMoveSelectedDown = function (oSettings){
	/* the visual stuff that show which rows are selected */
	var oTable = this;
	function moveVisualSelectionDown(row, prevRow){
		row.removeClass("selected_row");
		prevRow.addClass("selected_row");
	}

	/* move the data in the internal datatable structure */
	function moveDataDown(row, prevRow){		
		var movedData = oTable.fnGetData(row[0]).slice(0); 	  // copy of row to move.
		var prevData = oTable.fnGetData(prevRow[0]).slice(0); // copy of old data to be overwritten by above data.
		console.log(movedData)
		console.log(prevData)
		// switch data around :)
		oTable.fnUpdate(prevData , row[0], 0, false, false);  
		oTable.fnUpdate(movedData , prevRow[0], 0, true, true);
	}		


	var arr = this.find("tr.selected_row");

	for(var i=0; i<arr.length; i++) {			
		var tr = arr[i];			
		var row = jQuery(tr); 				// row to move.
		var prevRow = jQuery(tr).next();	// row to move should be moved up and replace this.

		/* already at the top? */
		if(prevRow.length==0){	break; }	
		
		moveDataDown(row, prevRow);
		moveVisualSelectionDown(row, prevRow);
	}	
}


$.fn.dataTableExt.oApi.fnDeleteSelected = function (oSettings){
	var arr = this.find("tr.selected_row");
	for(var i=0; i<arr.length; i++) {
		var next = $(arr[i]).next();
		this.fnDeleteRow(arr[i]);
		if(next)
			this.fnSelect(next);
	}	
}