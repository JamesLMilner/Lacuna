
	console.log("Layers and Attribute divs positioned");
	$("#layerscontainer").resizable({ });
	$("#layerscontainer").bind("resize", function () {
		var infoHeight = $('#info').height()
		var layersHeight = $("#layerscontainer").height()
		var newHeight = infoHeight - layersHeight;
		$("#attributes").height( newHeight );
		$("#attributes").css("position", "absolute");
		$("#attributes").css("bottom", 0);
		$("#layers").scrollTop(0);
		$("#layers").perfectScrollbar('update');
		$("#attributes").scrollTop(0);
		$("#attributes").perfectScrollbar('update');
		});

		