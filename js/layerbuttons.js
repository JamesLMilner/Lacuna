

	$(document).ready(function(){
			var attributeClicked = false;
			jsLayerList.forEach( function(l) {
				col = getRandomColor();
				$("#" + l + "col").css("background-color", col)
				$("#" + l + "col").spectrum({
					color: col,
					containerClassName: 'colourpicker',
					change: function(color) {
						if (addedToScene.indexOf(l) != -1) {
							$("#" + l + "col").css("background-color", color.toHexString())
							changeLayerColour(l)
						}
						//renderer.setClearColor( color.toHexString(), 1 )
						//console.log(color.toHexString())
					}
				});
				
				// ZOOM
				$("#" + l + "zoom").click( function() {
					centroid = $.ajax({
									  url: '/lacuna/ajax/arbitarycentroid.php',
									  type: 'get',
									  dataType: "json",
									  timeout: 1200000,
									  data: {'layer': l},
									  async: false,
									  success: function(data) {

										}
									 }).responseJSON;
									 
					// var maxxextent = parseFloat("<?php echo str_replace('"', "", json_encode($centroid[0])); ?>")
					// var maxyextent = parseFloat("<?php echo str_replace('"', "", json_encode($centroid[1])); ?>")
					// var minxextent = parseFloat("<?php echo str_replace('"', "", json_encode($centroid[2])); ?>")
					// var minyextent = parseFloat("<?php echo str_replace('"', "", json_encode($centroid[3])); ?>")
					// X = ((maxxextent - minxextent) / 2) + minxextent
					// Y = ((maxyextent - minyextent) / 2) + minyextent
					// Max X [0] Max Y [1] Min X [2] Min Y[3]
					console.log(centroid)
					layerX = ((parseFloat(centroid[0]) - parseFloat(centroid[2])) / 2) + parseFloat(centroid[2])
					layerY = ((parseFloat(centroid[1]) - parseFloat(centroid[3])) / 2) + parseFloat(centroid[3])
					console.log(layerX, layerY);
					lookAtPosition(layerX, layerY, 0)
				});
				
				clickedLayer = ""
				// ATTRIBUTES
				$("#" + l + "attributes").click( function() {
					
					originalCol = $("#" + l + "attributes").css("background-color")
					deselect()
					jsLayerList.forEach( function(L) {
						$("#" + L + "attributes").css("background-color", "#080808")
						$("#" + L + "attributes").css("color", "#FFFFFF") 
					});

					if ($.inArray(l, addedToScene) === -1 ) { 
						$("#dialogtext").html('Layer must be loaded from database to see attributes and highlight objects')
						$("#dialog").dialog({ 
								resizable: false, 
								buttons: {
									OK: function () {
										$(this).dialog("close");
									}
								} 
							});
						$('#dialog').dialog('option', 'title', 'Layer Not Loaded');	
					}
					
					if ($.inArray(l, addedToScene) != -1 && originalCol === "rgb(8, 8, 8)" ) {
						console.log(originalCol)
						scene.children.forEach( function(c) {
							if (c.hasOwnProperty("name") && c.name.split(" ")[0] === l) {
								SELECTED.sceneobject.push(c)
								SELECTED.color.push(c.children[0].material.color.clone())
							}
							getattributes()
							$("#" + l + "attributes").css("background-color", "#CCCCCC")
							$("#" + l + "attributes").css("color", "#000000")
							
							
						});
					}
				});
				
			});
		});