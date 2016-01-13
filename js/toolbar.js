		
		function deselect() {
			if (SELECTED.sceneobject.length != 0) {
				SELECTED.sceneobject.forEach( function(so, selectIndex) {
					if (so.hasOwnProperty('material')) {
							so.material.color.set(SELECTED.color[selectIndex])
							if (so.material.hasOwnProperty('ambient')) {
								so.material.ambient.set(SELECTED.color[selectIndex])
							}
						}
					else if (so.hasOwnProperty('children')) {
						so.children.forEach ( function(selectobjectchild) {
							if (selectobjectchild.hasOwnProperty('material')) {
								// console.log(SELECTED.color[selectIndex]);
								selectobjectchild.material.color.set( SELECTED.color[selectIndex] )
								if (selectobjectchild.material.hasOwnProperty('ambient')) {
									selectobjectchild.material.ambient.set(SELECTED.color[selectIndex])
								}
							}
						})
					}
				});
				SELECTED.sceneobject = [];
				SELECTED.color = [];
				SELECT = false;
				LASTHIGHLIGHTED = "";
				$( "#attributesholder" ).empty();
			}
		}


		$('#topbar').tooltip({ position: { my: "center bottom", at: "right+10 top+5" }, hide: 100, show: 500 });
		$('.layertext').tooltip({ position: { my: "center bottom", at: "right+10 top+5" }, hide: 100, show: 500 });

        helperswitch = true;
        axistoggle = true;
        wireframetoggle = false;
        buttons = ['#camera', '#helper', '#canvas', '#axis', '#wireframe', '#select', '#measure', '#objectedit', '#buffer', '#vertexedit']
        $.each(buttons, function(buttonindex, button) {  
            $(button).click(function(){
                // ON BUTTON CLICK FOR EACH BUTTON SLIDE IT UP
                var buttonPressed = this;
                $.each(buttons, function(optionindex, option){ 
                     if (button != option) { $(option + 'options').slideUp(800);  } 
                     else  if (button == option) { 
                        console.log(option, button, optionindex, buttonPressed)
                        $(button + 'options').slideToggle(700)
                     ;}
                });
            });	
        });
			
        $('#lookat').click( function() {
            console.log("Look At clicked")
            $("#dialogtext").html('<form> Look At X: <br> <input type="text" id="xcoordinate"><br>  Look At Y: <br> <input type="text" id="ycoordinate"><br>  Look At Z:<br>  <input type="text" id="zcoordinate"></form>' )
            $("#xcoordinate").val(controls.target.x)
            $("#ycoordinate").val(controls.target.y)
            $("#zcoordinate").val(controls.target.z)
            $("#dialog").dialog({ 
                resizable: false, 
                buttons: {
                    Look: function () {
                        x = document.getElementById("xcoordinate").value;
                        y = document.getElementById("ycoordinate").value;
                        z = document.getElementById("zcoordinate").value;
                        if (x != "" && y != "" && z != "") {
                            lookAtPosition(x, y, z);
                            $(this).dialog("close");
                        }
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                } 
            });
            $('#dialog').dialog('option', 'title', 'Look At');
        });
			
        $('#camerasettings').click( function() {
            console.log("Look At clicked")
            $("#dialogtext").html('<form> Max Distance (m): <br><input type="text" id="maxdist"><br> Min Distance (m): <br> <input type="text" id="mindist"><br>Pan Speed: <br><input type="text" id="panspeed"><br> Zoom Speed: <br><input type="text" id="zoomspeed"><br> Rotate Speed: <br><input type="text" id="rotatespeed"></form>' )
            document.getElementById("maxdist").value = controls.maxDistance
            document.getElementById("mindist").value = controls.minDistance
            document.getElementById("rotatespeed").value = controls.rotateSpeed 
            document.getElementById("zoomspeed").value = controls.zoomSpeed
            document.getElementById("panspeed").value = controls.panSpeed
            $("#dialog").dialog({ 
                resizable: false, 
                buttons: {
                    Update: function () {

                        if (document.getElementById("maxdist").value != "") {  controls.maxDistance = document.getElementById("maxdist").value }
                        if (document.getElementById("mindist").value != "") {  controls.minDistance = document.getElementById("mindist").value }
                        if (document.getElementById("rotatespeed").value != "") {  controls.rotateSpeed = document.getElementById("rotatespeed").value }
                        if (document.getElementById("zoomspeed").value != "") {  controls.zoomSpeed = document.getElementById("zoomspeed").value }
                        if (document.getElementById("panspeed").value != "") {  controls.panSpeed = document.getElementById("panspeed").value }
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                } 
            });
            $('#dialog').dialog('option', 'title', 'Camera Settings');

        });

        $('#axispos').click( function() {
            console.log("Look At clicked")
            $("#dialogtext").html('<form> X Position: <br> <input type="text" id="xcoordinate"><br> Y Position: <br> <input type="text" id="ycoordinate"><br> Z Position:<br>  <input type="text" id="zcoordinate"></form>' )
            $("#xcoordinate").val(axes.position.x)
            $("#ycoordinate").val(axes.position.y)
            $("#zcoordinate").val(axes.position.z)
            $("#dialog").dialog({ 
                resizable: false, 
                buttons: {
                    Position: function () {
                        x = document.getElementById("xcoordinate").value;
                        y = document.getElementById("ycoordinate").value;
                        z = document.getElementById("zcoordinate").value;
                        if (x != "" && y != "" && z != "") {
                            axes.position.x = x
                            axes.position.y = y
                            axes.position.z = z
                            $(this).dialog("close");
                        }
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                } 
            });
            $('#dialog').dialog('option', 'title', 'Reposition Axis');
        });

        $('#axissize').click( function() {
            console.log("Axis size clicked")
            $("#dialogtext").html('<form> Axis Size: <br> <input type="text" id="asize"><br>' )
            console.log(axes);
            $("#asize").val(axes.geometry.vertices[1].x )
            $("#dialog").dialog({ 
                resizable: false, 
                buttons: {
                    Resize: function () {
                        axisSize = document.getElementById("asize").value;

                        if (axisSize != "" ) {
                            axesPos = axes.position.clone()
                            scene.remove(axes)
                            axes = new THREE.AxisHelper(axisSize)
                            axes.position.x = axesPos.x
                            axes.position.y = axesPos.y
                            axes.position.z = axesPos.z
                            scene.add(axes);
                            $(this).dialog("close");
                        }
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                } 
            });
            $('#dialog').dialog('option', 'title', 'Resize Axis');
        });

        $("#helpercolour").spectrum({
            color: "#FF0000",
            containerClassName: 'colourpicker',
            change: function(color) {
                if (helper != null) {
                    $("#helpercolour").css("background-color", color.toHexString())

                    helper.material.color.setHex( color.toHexString().replace("#", "0x" ));
                    console.log(color.toHexString().replace("#", "0x" ))
                }
            }
        });

        $("#canvascolour").spectrum({
            color: "#262626",
            containerClassName: 'colourpicker',
            change: function(color) {
                $("#canvascolour").css("background-color", color.toHexString())
                renderer.setClearColor( color.toHexString(), 1 )
                console.log(color.toHexString())
            }
        });

        $('#helpertoggle').click( function() {
            if (helperswitch == true) {
                helperswitch = false;
                $('#helpertoggle').text("OFF");
                if (helper != null) {
                    console.log(helper.visible);

                    if (helper.visible == true) {
                        console.log("Disabling helper");
                        helper.visible = false
                    }
                }
            }
            else {
                helperswitch = true;
                $('#helpertoggle').text("ON");
                if (helper != null) {
                    if (helper.visible == false) {
                            helper.visible = true
                            console.log("Enabling helper");
                    }
                }
            }
        });

        $('#axistoggle').click( function() {
            if (axistoggle == true) {
                axistoggle = false;
                $('#axistoggle').text("OFF");
                if (axes != null) {
                    console.log(axes.visible);

                    if (axes.visible == true) {
                        console.log("Disabling axis");
                        axes.visible = false
                    }
                }
            }
            else {
                axistoggle = true;
                $('#axistoggle').text("ON");
                if (axes != null) {
                    if (axes.visible == false) {
                            axes.visible = true
                            console.log("Enabling axis");
                    }
                }
            }
        });

        function wireframe(wfbool) {
            scene.children.forEach( function(wireframechild) {
                        if (wireframechild.hasOwnProperty('material')) {
                            wireframechild.material.wireframe = wfbool;
                        }
                        else if (wireframechild.hasOwnProperty('children')) {
                            wireframechild.children.forEach ( function(objectchild) {
                                if (objectchild.hasOwnProperty('material')) {
                                    objectchild.material.wireframe = wfbool;
                                }
                            })
                        }
                    });
            };


        $('#wireframetoggle').click( function() {
            if (wireframetoggle == false) {
                wireframetoggle = true;
                $('#wireframetoggle').text("ON");
                wireframe(true)

            }
            else {
                wireframetoggle = false;
                $('#wireframetoggle').text("OFF");
                wireframe(false)
            }
        });


        //TOOLACTIVE = false;
        singleselect = false
        multiselect = false;


        $('#singleselect').click( function() {
            if (singleselect == false) {

                if (multiselect == true) { 
                    MULTISELECT = false;
                    multiselect = false;
                    $('#multiselectimage').attr("src", "imgs/multiselect.png");
                }
                $('#mode').text("Selection");
                $('#singleselectimage').attr("src", "imgs/singleselectenabled.png");
                SELECT = true;
                singleselect = true;

                 //$('#selectoptions').slideToggle(1000)
            }
            else if (singleselect == true) {

                $('#mode').text("Visualise");
                $('#singleselectimage').attr("src", "imgs/singleselect.png");
                deselect();
                //$('#selectoptions').slideToggle(1000)
                SELECT = false;
                singleselect = false;

            }
        });


        $('#multiselect').click( function() {
            if (singleselect == true) {
                SELECT = false;
                singleselect = false;
                $('#singleselectimage').attr("src", "imgs/singleselect.png");
            }
            if (multiselect == false) {

                $('#mode').text("Selection");
                $('#multiselectimage').attr("src", "imgs/multiselectenabled.png");
                MULTISELECT = true;
                multiselect = true;
                 //$('#selectoptions').slideToggle(1000)
            }
            else if (multiselect == true) {

                $('#mode').text("Visualise");
                $('#multiselectimage').attr("src", "imgs/multiselect.png");
                deselect();
                multiselect = false;
                MULTISELECT = false;
                //$('#selectoptions').slideToggle(1000)
            }
        });

        var clickdistance = false
        $('#clickdistance').click( function() {
            if ((clickdistance == false) && (ACTION === false)) {
                $('#mode').text("Measurement");
                $('#clickdistanceimage').attr("src", "imgs/clickdistanceenabled.png");
                clickdistance = true;
                CLICKDISTANCE = true;
                ACTION = true;
                 //$('#selectoptions').slideToggle(1000)
            }
            else if (clickdistance == true) {

                $('#mode').text("Visualise");
                $('#clickdistanceimage').attr("src", "imgs/clickdistance.png");
                clickdistance = false;
                CLICKDISTANCE = false;
                ACTION = false
                //$('#selectoptions').slideToggle(1000)
            }
        });

        var area = false
        $('#area').click( function() {
            if ((area == false ) && (ACTION === false)) {
                $('#mode').text("Measurement");
                $('#areaimage').attr("src", "imgs/areaenabled.png");
                area = true;
                AREA = true;
                ACTION = true;
                 //$('#selectoptions').slideToggle(1000)
            }
            else if (area == true) {

                $('#mode').text("Visualise");
                $('#areaimage').attr("src", "imgs/area.png");
                area = false;
                AREA = false;
                ACTION = false;
                //$('#selectoptions').slideToggle(1000)
            }
        });


        $('#delete').click( function() {
            console.log("Delete clicked");
            if ((ACTION === false) && ((SELECT) || (MULTISELECT)) && (SELECTED.sceneobject.length != 0)) {
                $("#dialogtext").text("Are you sure you want to delete selected objects?");
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Yes: function () {
                            edit_delete();
                            $(this).dialog("close");
                        },
                        No: function () {
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Delete');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#translate').click( function() {
            console.log("Translate clicked");
            if ((ACTION === false) && ((SELECT) || (MULTISELECT)) && (SELECTED.sceneobject.length != 0)) {
                $("#dialogtext").html('<form> X Translation: <input type="text" id="xtranslation"><br> Y Translation: <input type="text" id="ytranslation"><br> Z Translation: <input type="text" id="ztranslation"></form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Translate: function () {
                            x = document.getElementById("xtranslation").value;
                            y = document.getElementById("ytranslation").value;
                            z = document.getElementById("ztranslation").value;
                            edit_translate(x, y, z);
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Translate');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#copy').click( function() {
            console.log("Copy clicked");
            if ((ACTION === false) && ((SELECT) || (MULTISELECT)) && (SELECTED.sceneobject.length === 1)) {
                $("#dialogtext").html('<form> X Copy Location: <input type="text" id="xcoordinate"><br> Y Copy Location: <input type="text" id="ycoordinate"><br> Z Copy Location: <input type="text" id="zcoordinate"></form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Copy: function () {
                            x = document.getElementById("xcoordinate").value;
                            y = document.getElementById("ycoordinate").value;
                            z = document.getElementById("zcoordinate").value;
                            edit_copy(x, y, z);
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Copy');
            }
            else {
                $("#dialogtext").text("Other function in operation, nothing selected, or more than one object selected (illegal for copy)!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#rotate').click( function() {
            console.log("rotate clicked");
            if ((ACTION === false) && ((SELECT) || (MULTISELECT)) && (SELECTED.sceneobject.length != 0)) {
                var rotateAxis = ""
                $("#dialogtext").html('<input type="radio" name="rotate" id="xrotate">X  <input type="radio" name="rotate" id="yrotate">Y <input type="radio" name="rotate" id="zrotate">Z <form> Rotation (Degrees): <input type="text" id="degrees"><br> </form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Rotate: function () {
                            degrees = document.getElementById("degrees").value;
                            if (document.getElementById("xrotate").checked == true) { rotateAxis = "x"; console.log("rotating x") }
                            if (document.getElementById("yrotate").checked == true) { rotateAxis = "y"; console.log("rotating y") }
                            if (document.getElementById("zrotate").checked == true) { rotateAxis = "z"; console.log("rotating z")}
                            if (rotateAxis != "" &&  isNaN(degrees) === false ) { edit_rotate(degrees, rotateAxis) }
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Rotate');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#scale').click( function() {
            console.log("Scale clicked");
            if ((ACTION === false) && ((SELECT) || (MULTISELECT)) && (SELECTED.sceneobject.length != 0)) {
                $("#dialogtext").html('<form> X Scale: <br>  <input type="text" id="xscale"><br> Y Scale: <br>  <input type="text" id="yscale"><br> Z Scale: <br> <input type="text" id="zscale"></form>' )

                console.log(xscale)
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Scale: function () {
                            xscale = document.getElementById("xscale").value;
                            yscale = document.getElementById("yscale").value;
                            zscale = document.getElementById("zscale").value;
                            if (isNaN(xscale) === false && isNaN(yscale) === false && isNaN(zscale) === false ) { edit_scale(xscale, yscale, zscale) }
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Scale');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#sphere').click( function() {
            console.log("Sphere clicked");
            if (ACTION === false) {
                BUFFER = true;
                $("#dialogtext").html('<form> Buffer Radius (m): <br>  <input type="text" id="sphereradius"> <br> Opacity (0-1): <br>  <input type="text" id="sphereopacity"> <br> X Coordinate: <br>  <input type="text" id="xcoordinate"><br> Y Coordinate: <br>  <input type="text" id="ycoordinate"><br> Z Coordinate: <br> <input type="text" id="zcoordinate"></form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Buffer: function () {
                            opacity = document.getElementById("sphereopacity").value;
                            radius = document.getElementById("sphereradius").value;
                            x = document.getElementById("xcoordinate").value;
                            y = document.getElementById("ycoordinate").value;
                            z = document.getElementById("zcoordinate").value;
                            Buffer3D(radius, opacity, new THREE.Vector3(x, y, z));
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            BUFFER = false;
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Sphere Buffer');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#cylinder').click( function() {
            console.log("Sphere clicked");
            BUFFER = true;
            if (ACTION === false) {
                $("#dialogtext").html('<form> Top Radius (m): <br>  <input type="text" id="cylindertopradius"> <br> Bottom Radius: <br>  <input type="text" id="cylinderbotradius"><br> Height: <br> <input type="text" id="cylinderheight"> <br> Opacity (0-1): <br>  <input type="text" id="cylinderopacity"> <br> X Coordinate: <br> <input type="text" id="xcoordinate"><br> Y Coordinate: <br>  <input type="text" id="ycoordinate"><br> Z Coordinate: <br>  <input type="text" id="zcoordinate"></form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Buffer: function () {
                            opacity = document.getElementById("cylinderopacity").value;
                            topradius = document.getElementById("cylindertopradius").value;
                            botradius = document.getElementById("cylinderbotradius").value;
                            x = document.getElementById("xcoordinate").value;
                            y = document.getElementById("ycoordinate").value;
                            z = document.getElementById("zcoordinate").value;
                            height = document.getElementById("cylinderheight").value;
                            BufferCylinder3D(topradius, botradius, height, opacity, new THREE.Vector3(x, y, z));
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            BUFFER = false;
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Cylinder Buffer');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });

        $('#box').click( function() {
            console.log("Box buffer clicked");
            BUFFER = true;
            if (ACTION === false) {
                $("#dialogtext").html('<form> Box Width (m):<br> <input type="text" id="boxwidth"> <br> Box Height (m): <br> <input type="text" id="boxheight"><br> Box Depth (m): <br><input type="text" id="boxdepth"> <br> Opacity (0-1): <br><input type="text" id="boxopacity"> <br> X Coordinate:<br> <input type="text" id="xcoordinate"><br> Y Coordinate: <br><input type="text" id="ycoordinate"><br> Z Coordinate:<br> <input type="text" id="zcoordinate"><br></form>' )
                $("#dialog").dialog({ 
                    resizable: false, 
                    buttons: {
                        Buffer: function () {
                            opacity = document.getElementById("boxopacity").value;
                            height = document.getElementById("boxheight").value;
                            width = document.getElementById("boxwidth").value;
                            depth = document.getElementById("boxdepth").value;
                            x = document.getElementById("xcoordinate").value;
                            y = document.getElementById("ycoordinate").value;
                            z = document.getElementById("zcoordinate").value;

                            BufferBox3D(width, height, depth, opacity,  new THREE.Vector3(x, y, z));
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            BUFFER = false;
                            $(this).dialog("close");
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Box Buffer');
            }
            else {
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });
            }
        });


        $('#vertexedit').click( function() {
            console.log(VERTEX, ACTION, GEOMCLICKED)
            if (VERTEX == false && ACTION == false) {
                $('#verteximage').attr("src", "imgs/vertexedit.png");
                $('#mode').text("Edit");
                $('#verteximage').attr("src", "imgs/vertexeditenabled.png");
                //vertexModel = ""
                VERTEX = true;
                //vertexModel = ""
            }
            else if (VERTEX_EDIT == true && GEOMCLICKED == true) {
                console.log(GEOMCLICKED)
                console.log("vertexModel in toolbar", vertexModel)
                $("#dialogtext").html("What would you like to do with your edits?")
                $("#dialog").dialog({ 
                    resizable: false, 
                    closeOnEscape: false,
                    open: function(event, ui) {  $(".ui-dialog-titlebar-close", ui.dialog).hide();  },
                    buttons: {
                        Save: function () {
                            uploadEdits()
                            $(this).dialog("close");
                        },
                        Discard: function () {
                            // This needs to do something
                            $(this).dialog("close");
                            discardChanges();
                        }
                    } 
                });
                $('#dialog').dialog('option', 'title', 'Save Edits');

                $('#mode').text("Visualise");
                $('#verteximage').attr("src", "imgs/vertexedit.png");
                VERTEX = false;

                cancelVertexEditing()
            }
            else if (GEOMCLICKED == false) {
                cancelVertexEditing()
            }
            else {
                console.log(VERTEX)
                $("#dialogtext").text("Other function in operation, or nothing selected!");
                $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });

             }
        });
