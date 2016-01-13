    // Disable highlighting for certain elements
    $(document).ready(function() {	
        $(document).bind("contextmenu",function(e){ 
            //console.log(e.target.nodeName) 
            //console.log($(e.target.id).closest(".attributetables").length > 0)
            if ((e.target.nodeName == "TR" ) || (e.target.nodeName == "TH" ) || (e.target.nodeName == "TABLE" ) || (e.target.nodeName == "TD" ) || (e.target.nodeName == "CAPTION" )) { return true } 
            else { return false } 
        }); 
        $( "#loadselected" ).button( {label: "Get Selected", text: true} );
        $('#layers').perfectScrollbar({suppressScrollX: true, scrollYMarginOffset: 3});
        $('#attributes').perfectScrollbar({scrollXMarginOffset: 10});
    }); 

    // Init key variables
    var camera, scene, renderer;
    var helper;
    var intersectedPoint = "" 
    var ACTION = false;
    var SELECT = false;
    var MULTISELECT = false
    var SELECTED = { sceneobject : [ ], color: [ ] };
    var LASTHIGHLIGHTED = ""
    var CLICKDISTANCE = false ;
    var OBJECTDISTANCE = false;
    var AREA = false ;
    var BUFFER = false ;
    var VERTEX = false ;
    var VERTEX_EDIT = false ;
    var vertexModel
    var vertexMesh = ""
    var vertexObject = ""
    var vertexHelperGeometry = new THREE.SphereGeometry( 1, 16, 16 );
    var vertexHelperMaterial = new THREE.MeshLambertMaterial( {color: 0xCCCCCC, ambient: 0xCCCCCC} );
    var vertexHelper = new THREE.Mesh( vertexHelperGeometry, vertexHelper  );
    vertexHelper.name = "Helper"
    var SELECTED_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xCCCCCC, ambient: 0xCCCCCC, reflectivity: 0});
    var EDGE = false
    var EDGE_EDIT = false
    var edgeHelperOne = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 16, 16 ), new THREE.MeshBasicMaterial( {color: 0xCCCCCC, ambient: 0xCCCCCC} )  );
    var edgeHelperTwo = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 16, 16 ), new THREE.MeshBasicMaterial( {color: 0xCCCCCC, ambient: 0xCCCCCC} ) );
    //We need to use an Epsilon to stop the triangulator from believeing there are duplicate points
    var EPSILON = 0.001 // 1 meter - 0.1 decimeter 0.01 - centimeter 0.001 milimeter
    var ORIGIN = new THREE.Vector3(0, 0, 0)
    var editingInProgress = false
    var GEOMCLICKED = false
    var CENTROID 
    var LAYEREXTENTS 


    // Mouse and Intersection variables
    var mouseVector = new THREE.Vector3(0,0,0);
    var raycaster = new THREE.Raycaster();
    raycaster.precision = 25
    raycaster.linePrecision = 15

    // Global Functions 

    // MEASUREMENT

    function get_area(a, b, c) {
        p = (a + b + c) / 2
        A = Math.sqrt( p * (p - a) * (p - b) * (p - c) )
        surfacearea = parseFloat(A.toFixed(4))
        return surfacearea
    }

    function distance(x1, y1, z1, x2, y2, z2) {
        d = Math.sqrt(Math.pow((x2 - x1), 2) +
            Math.pow((y2 - y1), 2) +
            Math.pow((z2 - z1), 2))

        return parseFloat(d.toFixed(3)) 
    }

    function get_point_distance(p1, p2) {
        x1 = p1[0]
        y1 = p1[1]
        z1 = p1[2]
        x2 = p2[0]
        y2 = p2[1] 
        z2 = p2[2]

        d = Math.sqrt(Math.pow((x2 - x1), 2) +
            Math.pow((y2 - y1), 2) +
            Math.pow((z2 - z1), 2))

        return d 
    }

    function get_object_layer_id(object) {
        if (( object.hasOwnProperty("name")) && (object.name != "")) {
            layer = object.name.split(" ")
            layerName = layer[0]
            layerID = layer[1]
            return [layerName, layerID]
        }
    }

    function getLayerColour (layername) { 
        l = layername.replace('"', '')
        l = l.replace('"', '')
        return $("#" + l + "col").css("background-color") 
    }

    // Get Centroid First
    $.ajax({
        url:"./ajax/centroid.php",
        type:"GET",
        dataType:"json",
        async: "true",
        success: function(returnedCentroid) {
            
            console.log(returnedCentroid)
            var maxX = +returnedCentroid[0]
            var maxY = +returnedCentroid[1]
            var minX = +returnedCentroid[2]
            var minY = +returnedCentroid[3]
            LAYEREXTENTS = [maxX, maxY, minX, minY]
            // X , Y
            X = ((maxX - minX) / 2) + minX
            Y = ((maxY - minY) / 2) + minY
            CENTROID = [X, Y]
            initiateLacuna();
        }
    });


    function initiateLacuna() {
        
        init();
        animate();

        function init() {

            // Create document container
            container = document.getElementById("container")

            //Create the width and heights using some jQuery magic
            canvasheight = $( "#container" ).height()  
            canvaswidth = $( "#container" ).width()
            console.log("Canvas Width: ", canvaswidth)
            console.log("Canvas Height: ", canvasheight)

            // Load Stats
            stats = new Stats();
            stats.setMode(0);
            container.appendChild( stats.domElement ); 

            // Create Renderer, set antialiasing (smoother graphically, worse performance)
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize( canvaswidth, canvasheight );
            renderer.setClearColor( '#262626', 1 ) // SETS BACKGROUND COLOR
            renderingInfo = renderer.info.render;
            container.appendChild( renderer.domElement );

            //Scene
            scene = new THREE.Scene();

            //Centroid
            console.log("Max X: ", LAYEREXTENTS[0], "Max Y: ", LAYEREXTENTS[1], "Min X: ", LAYEREXTENTS[2], "Min Y: ", LAYEREXTENTS[3]) ;
            console.log("Centroid: ", CENTROID[0], CENTROID[1]);

            //var baseGeometry = new THREE.PlaneGeometry( maxxextent - minxextent, maxyextent - minyextent );
            //baseGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(centroid[0], centroid[1], 0) );
            //var baseMesh = new THREE.Mesh(baseGeometry, new THREE.MeshLambertMaterial({ color: 0x262626, reflectivity: 0, wireframe: false }));
            //baseMesh.name = "0 Height"


            // Add base geometry
            //scene.add(baseMesh);

            // Scene Objects (3D Data)

            // SEE EPSILON !

            // http://threejs.org/examples/webgl_geometry_terrain_raycast.html
            // Raycast Helper
            var helpergeometry = new THREE.CylinderGeometry( 0, 2, 4, 3 ); // radius at top, radius at bottom, height, segments
            helpergeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
            //helpergeometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
            helper = new THREE.Mesh( helpergeometry, new THREE.MeshBasicMaterial({ color: 0xEB1515, reflectivity: 0, wireframe: false }) );
            helper.name = "Helper"
            helpertoggle = true;

            // Axis Helper -- red = X - green = Y  - blue = Z
            axes = new THREE.AxisHelper(400);
            scene.add( axes );
            console.log(CENTROID[0], CENTROID[1])
            axes.position.x = CENTROID[0]
            axes.position.y = CENTROID[1]
            //axes.position = new THREE.Vector3(CENTROID[0], CENTROID[1], 0);
            console.log("Helper Axes Position : " , axes.position);

            // Lighting
            var ambientLight = new THREE.AmbientLight(0xE0E0E0, 0.05);
            var directionalLight1 = new THREE.DirectionalLight( 0xfffaad, 0.6);
            directionalLight1.shadowDarkness = 1
            directionalLight1.position.set( 0, 1, 0 );
            // var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.6);
            // directionalLight2.shadowDarkness = 1
            // directionalLight2.position.set( 0, 1, 0 );

            //hemi = new THREE.HemisphereLight(0x94E1FF, 0x852D10, 0.7)
            //hemi.position.set( 0, 1, 0 );

            // Detect Mouse Movement
            container.addEventListener( 'mousemove', onMouseMove, false );
            container.addEventListener( 'click', onMouseMove, false );

            // Resize detector	
            window.addEventListener( 'resize', onWindowResize, false );

            //Camera 
            camera = new THREE.PerspectiveCamera(65, canvaswidth / canvasheight , 1, 80000 );
            camera.position = new THREE.Vector3(CENTROID[0], CENTROID[1], 200);

            //Controls
            controls = new THREE.TrackballControls( camera, renderer.domElement );
            controls.rotateSpeed = 0.5;
            controls.zoomSpeed = 1.0;
            controls.panSpeed = 1.0;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            controls.minDistance = 50;
            controls.maxDistance = 8000;
            controls.keys = [ 65, 83, 68 ];
            lookAtPosition(CENTROID[0], CENTROID[1], 0);
            controls.target = new THREE.Vector3(CENTROID[0], CENTROID[1], 0);
            console.log("target", controls.target);
            controls.addEventListener( 'change', render );
            camera.updateProjectionMatrix();
            scene.add( directionalLight1 );
            //Create Scene
            scene.add( ambientLight );
            scene.add( helper );
            
            // Get the layer from the database, and get from getdataajax.php via AJAX
            function getLayer (layername) {

                // Set load cursor
                $("html").css("cursor", "wait");
        
                // Get layer
                $.ajax({
                    url: './ajax/getdataajax.php',
                    type: 'get',
                    dataType: "json",
                    timeout: 1200000,
                    data: {'layer': layername},
                    async: true,
                    success: function(layer) {
                            
                        var aLayer = layer;
                        var layerColour = getLayerColour(layername);
                        
                        console.log("Loading... ", layername, aLayer);
                        console.log("Layer Colour", layerColour);
                        
                        if ((aLayer[1][0] == "POLYHEDRALSURFACE Z") && (aLayer[1][1] != "")) {
                            console.log(layername, "is a PolyhedralSurface");
                            aLayerArray = aLayer[1][1].slice(0, - 5).split(" %%% "); //  Remove final %%%
                            var ids = aLayer[1][2];
                            var modelVertices = [];

                            for (var i = 0; i < aLayerArray.length; i++) {

                                var aFeature = aLayerArray[i];
                                polyhedralzGroup = new THREE.Object3D();
                                aFeature = aFeature.slice(0, - 5); // Remove final ::: 
                                var material = new THREE.MeshLambertMaterial( {color: layerColour, ambient: layerColour} );
                                var aObjectArray = aFeature.split(" ::: ");

                                // For each object
                                aObjectArray.forEach( function(arrayModel) {

                                    var uniqueCoords = [];
                                    arrayModelSplit = arrayModel.split(",");

                                    for (var k = 0; k < arrayModelSplit.length; k++) {
                                        var modelUnformattedCoords = arrayModelSplit[k];
                                        if ($.inArray(modelUnformattedCoords, uniqueCoords) === -1) {
                                            modelCoords = modelUnformattedCoords.split(" ");
                                            modelVertices.push(modelCoords);
                                            uniqueCoords.push(modelUnformattedCoords);
                                            }
                                        else { //console.log("Duplicate found: ", modelUnformattedCoords)
                                        }
                                    }

                                    var polyholes = [];
                                    var triangles;
                                    var modelGeometry = new THREE.Geometry();
                                    var uniqueVertices = [];
                                    var epsilonCheck = [];

                                    for ( var v = 0; v < modelVertices.length; v++ ) {
                                        var part = modelVertices[v];

                                        if (part.length < 3 && part[0] != "" ) { 
                                            console.log("Vertex list length is ", part.length, "needs to be three to convertto Three.js vertex", part) 
                                        }

                                        else {
                                            // The triangulator doesn't appear to take into account 
                                            // the fact that some points may share X Y coordinates, to overcome this we add an epsilon
                                            // so Three.js thinks they're different coordinates
                                            //console.log(part);d

                                            for (var p = 0; p < part.length; p++) {

                                                var coord = parseFloat(part[p]);
                                                if ($.inArray(coord, epsilonCheck) != -1) {
                                                    part[p] = coord + EPSILON 
                                                    };
                                            }

                                            // Change the vertices from str/float to Three.js vertexs 
                                            modelVertices[v] = new THREE.Vector3( parseFloat(part[0]), parseFloat(part[1]) , parseFloat(part[2]));

                                            //Push all the parts into the checklist to make sure there is no recurrence
                                            epsilonCheck.push(parseFloat(part[0]), parseFloat(part[1]) , parseFloat(part[2]))
                                        }

                                    }

                                    //console.log(modelVertices);
                                    //modelVertices.reverse();
                                    modelGeometry.vertices = modelVertices;

                                    // If the list isn't null or less than 3 triangulate it!
                                    if (modelVertices != null && modelVertices.length >= 3) {
                                        triangles = THREE.Shape.Utils.triangulateShape ( modelVertices, polyholes );

                                        for( var t = 0; t < triangles.length; t++ ){
                                            modelGeometry.faces.push( new THREE.Face3( triangles[t][0], triangles[t][1], triangles[t][2] ));
                                        }

                                        modelGeometry.computeFaceNormals();
                                        var modelMesh = new THREE.Mesh(modelGeometry, material);
                                        modelMesh.material.side = THREE.DoubleSide;
                                        polyhedralzGroup.add(modelMesh);

                                    }
                                    modelVertices = [];
                                    modelCoords = [];

                                });

                                //Replace double quotations from both sides, add a space, then add the geometry ID
                                polyhedralzGroup.name = layername.replace('"', '').replace('"', '') + " " + ids[i].toString()

                                // Add group to scene
                                //polyhedralzGroup.castShadow = false;
                                scene.add(polyhedralzGroup);
                            }

                        }

                        if ((aLayer[0][0] == "POLYGON ZM") && (aLayer[0][1] != "")) {
                            aLayerFormatted = aLayer[0][1].slice(0, - 5); //  Remove final %%%
                            var aLayerArray = aLayerFormatted.split(" %%% ");
                            //console.log(aLayer[0][0], aLayer[0][1]);
                            var ids = aLayer[0][2]
                            var id = 0
                            var modelVertices = []

                            //ranCol = getRandomColor();
                            aLayerArray.forEach( function(aFeature) {

                                aFeature = aFeature.slice(0, - 5); // Remove final ::: 

                                material = new THREE.MeshLambertMaterial({color: layerColour, ambient: layerColour})
                                material.side = THREE.DoubleSide;
                                var aObjectArray = aFeature.split(" ::: ");

                                aObjectArray.forEach( function(arrayModel) {
                                    uniqueCoords = [];
                                    polygon = [];
                                    polyholes = [];
                                    holesBool = (arrayModel.indexOf(" &&& ") > -1)


                                    if (holesBool === true) {
                                        arrayModelSplit = arrayModel.split(" &&& ");
                                        polygon = arrayModelSplit[0].split(",") // Polygon is the first part, split into series of x y z string
                                        arrayModelSplit.shift() // polyholes is the rest
                                        polyholes = arrayModelSplit
                                        //console.log("Length: ", polyholes.length)
                                    }

                                    if (holesBool === false) { 
                                        polygon = arrayModel.split(",");
                                    }

                                    polygon.forEach( function(modelUnformattedCoords) {
                                        if ($.inArray(modelUnformattedCoords, uniqueCoords) === -1) {
                                            modelCoords = modelUnformattedCoords.split(" ");
                                            modelVertices.push(modelCoords);
                                            uniqueCoords.push(modelUnformattedCoords);

                                            //console.log(modelCoords);
                                            }
                                        else { //console.log("Duplicate found: ", modelUnformattedCoords)
                                        }
                                    })

                                    //List
                                    //console.log(polyholes)
                                    if (holesBool === true) {
                                        polyholes.forEach( function(polygonHole, polygonHoleIndex, polygonHoles) {
                                            splitVertexHole = polygonHole.split(",")
                                            splitVertexHole.pop();
                                            //console.log(splitVertexHole);
                                            splitVertexHole.forEach( function(vertex, vindex){ 
                                                vertexArray = splitVertexHole[vindex].split(" ") 
                                                //console.log(vertexArray)
                                                splitVertexHole[vindex] = new THREE.Vector3( parseFloat(vertexArray[0]), parseFloat(vertexArray[1]), parseFloat(vertexArray[2]) )
                                                //console.log(splitVertexHole[vertex]);
                                            })
                                        polygonHoles[polygonHoleIndex] = splitVertexHole ;
                                        });
                                        //console.log("holes bro", polyholes)
                                    }

                                    //triangles;
                                    modelGeometry = new THREE.Geometry();
                                    uniqueVertices = [];
                                    epsilonCheck = [];

                                    modelVertices.forEach(function(part, index, theVertices) {
                                    //console.log(part);
                                        if (part.length < 3 && part[0] != "" ) { console.log("Vertex list length is ", part.length, "needs to be three to convertto Three.js vertex", part) }
                                        else {
                                            // The triangulator doesn't appear to take into account the fact that some points may share X Y coordinates, to overcome this we add an epsilon
                                            // so Three.js thinks they're different coordinates
                                            part.forEach(function(coord, i) {
                                                if ($.inArray(parseFloat(coord), epsilonCheck) != -1) {
                                                    part[i] = parseFloat(coord) + EPSILON 
                                                    };
                                            })

                                            // Change the vertices from str/float to Three.js vertexs 
                                            theVertices[index] = new THREE.Vector3( parseFloat(part[0]), parseFloat(part[1]) , parseFloat(part[2]) );

                                            //Push all the parts into the checklist to make sure there is no recur
                                            epsilonCheck.push(parseFloat(part[0]), parseFloat(part[1]), parseFloat(part[2]))
                                        }
                                    });

                                    modelGeometry.vertices = modelVertices

                                    // If the list isn't null or less than 3 triangulate it!
                                    if (modelVertices != null && modelVertices.length >= 3) {
                                        if (polyholes.length != 0) { 
                                            //console.log("holes", polyholes); 
                                        }

                                        triangles = THREE.Shape.Utils.triangulateShape ( modelVertices, polyholes.reverse() );
                                        for( var i = 0; i < triangles.length; i++ ){
                                            //console.log(triangles[i][0], triangles[i][1], triangles[i][2]);
                                            modelGeometry.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
                                        }
                                        modelGeometry.verticesNeedUpdate = true
                                        modelGeometry.normalsNeedUpdate = true
                                        //modelGeometry.computeFaceNormals();
                                        try {
                                            modelGeometry.computeFaceNormals();
                                            var modelMesh = new THREE.Mesh(modelGeometry, material);
                                            modelMesh.material.side = THREE.DoubleSide;

                                            modelMesh.name =  layername.replace('"', '').replace('"', '') + " " + ids[id].toString();
                                            scene.add(modelMesh);
                                        }
                                        catch(err) {
                                            //console.log(err)
                                            //console.log(modelVertices, polyholes, triangles)
                                            //console.log(modelGeometry)									
                                        }			
                                    }
                                    modelVertices = [];
                                    modelCoords = [];

                                });

                                id += 1
                            });

                        }

                        if ((aLayer[2][0] == "TIN Z") && (aLayer[2][1] != "")) {

                            var aLayerArray = aLayer[2][1].slice(0, - 5).split(" %%% ");; // Remove final %%%
                            var ids = aLayer[2][2];
                            var id = 0;
                            var modelVertices = [];

                            aLayerArray.forEach( function(aFeature) {

                                tinzGroup = new THREE.Object3D();
                                //console.log((aFeature == ""));
                                var aFeatureArray = aFeature.split(" |||  ||| ");

                                aFeatureArray.forEach( function(arrayModel) {
                                    if (arrayModel.length > 0) {

                                        arrayModel.slice(0, - 1); //Remove final comma
                                        arrayModelSplit = arrayModel.split(",");
                                        arrayModelSplit.pop(); //Remove full circle point (not necessary)
                                        arrayModelSplit.forEach( function(modelUnformattedCoords) {

                                            modelCoords = modelUnformattedCoords.split(" ");
                                            modelVertices.push(modelCoords);

                                        })

                                        var modelGeometry = new THREE.Geometry();

                                        modelVertices.forEach(function(part, index, theVertices) {

                                            if ( part.length != 3) { 
                                                console.log("Vertex list length not eqaul to 3: can't convert to Three.js vertex") 
                                            }
                                            else {
                                                theVertices[index] = new THREE.Vector3( parseFloat(part[0]), parseFloat(part[1]) , parseFloat(part[2]));
                                            }
                                        });

                                        modelGeometry.vertices = modelVertices;

                                        // If the list isn't null or less than 3 triangulate it!
                                        if (modelVertices != null && modelVertices.length >= 3) {
                                            modelGeometry.faces.push( new THREE.Face3( 0, 1, 2 ));
                                            modelGeometry.computeFaceNormals();
                                            var modelMesh = new THREE.Mesh(modelGeometry, new THREE.MeshLambertMaterial( {color: layerColour, ambient: layerColour} ));
                                            modelMesh.material.side = THREE.DoubleSide;  //SET DOUBLE SIDED
                                            tinzGroup.add(modelMesh); //Add mesh to group
                                        }

                                        modelVertices = [];
                                        modelCoords = [];
                                    }
                                })

                                tinzGroup.name = layername.replace(/"/gi, '') + " " + ids[id]; // Remove quotation strings & append space & ID            
                                //console.log("Adding", tinzGroup)
                                scene.add(tinzGroup);
                                id += 1
                            });

                        }

                        if ((aLayer[3][0] == "LINESTRING Z") && (aLayer[3][1] != "")) {
                            var lineArray = aLayer[3][1].slice(0, - 5).split(" %%% ");; //  Remove final %%%
                            var ids = aLayer[3][2];

                            for (var l = 0; l < lineArray.length; l++) {

                                var line = lineArray[l]; 
                                var lineGeometry = new THREE.Geometry();
                                var lineVertices = line.split(",");
                                aLine.forEach( function(aLineVertex) {
                                    v = aLineVertex.split(" ");
                                    if (v[0] == "") { v.shift() } // Sometimes the first value is "" which causes the lines to fire off into space!
                                    lineGeometry.vertices.push( new THREE.Vector3(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2])))
                                });

                                var lineMesh = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({color: layerColour, linewidth: 10}) );
                                var idname = layername.replace(/"/gi, '') + " " + ids[l]; // Remove quotation strings & append space & ID 
                                lineMesh.name = idname;
                                scene.add(lineMesh);

                            };

                        }


                        if ((aLayer[4][0] == "POINT Z") && (aLayer[4][1] != "")) {
                            console.log("Point geometry");
                            var pointArray = aLayer[4][1].slice(0, - 5).split(" %%% ");; //  Remove final %%% and split by %%%
                            var ids = aLayer[4][2]; // Attach ids to variable

                            for (var p = 0; p < pointArray.length; p++) {

                                var pPoint = pointArray[p].split(" ");
                                if (pPoint[0] == "") { pPoint.shift() }
                                var point = new THREE.Mesh( new THREE.SphereGeometry( 3, 12, 12 ),  new THREE.MeshBasicMaterial({color: layerColour, ambient: layerColour})  );
                                point.applyMatrix( new THREE.Matrix4().makeTranslation(pPoint[0], pPoint[1], pPoint[2]) );

                                var idname = layername.replace(/"/gi, '') + " " + ids[p]; // Remove quotation strings & append space & ID 
                                point.name =  idname;
                                scene.add(point);
                            };
                        }
                        
                        $("html").css("cursor", "auto");
                        console.log($("html").css("cursor"));
                    }
                });
                
            } // End of getLayer()

            addedToScene = []
            visibleBools = []

            jsLayerList.forEach( function(jsLayer) {

                visibleBools.push(false);

                $("#" + jsLayer).on('click', function() { 
                    
                    if (visibleBools[jsLayerList.indexOf(jsLayer)] == false) {
                        var layerName = jsLayer;
                        if ($.inArray(jsLayer, addedToScene) === -1) { 
                            console.log("Loading from PG")
                            getLayer(layerName); 
                            addedToScene.push(jsLayer);

                        }

                        else { 
                            scene.children.forEach( function(childLayer) { 
                                if (childLayer.name != undefined || childLayer.name === "") {
                                    if (childLayer.name.lastIndexOf(jsLayer, 0) === 0) {
                                        console.log("Loading from geometry")
                                        childLayer.traverse( function ( object ) { object.visible = true; } );
                                    }
                                }
                            });
                        }
                        visibleBools[jsLayerList.indexOf(jsLayer)] = true; 
                    }

                    else if (visibleBools[jsLayerList.indexOf(jsLayer)] == true) {
                        scene.children.forEach( function(childLayer) { 
                            if (childLayer.name != undefined || childLayer.name === "") {
                                if (childLayer.name.lastIndexOf(jsLayer, 0) === 0) {
                                    console.log("Disabling geometry")
                                    childLayer.traverse( function ( object ) { object.visible = false; } );
                                }
                            }
                        });
                        visibleBools[jsLayerList.indexOf(jsLayer)] = false;
                    }
                })
            });	
        }


        function onWindowResize() {

            //Create the width and heights using some jQuery magic
            canvasheight = $( "#container" ).height() // Adjust for the bottom bar
            canvaswidth = $( "#container" ).width() 
            camera.aspect = canvaswidth / canvasheight ;
            camera.updateProjectionMatrix();

            renderer.setSize( canvaswidth , canvasheight   );
            stats.update();

            //Fix attributes window on resize
            var infoHeight = $('#info').height()
            var layersHeight = $("#layers").height()
            var newHeight = infoHeight - layersHeight;
            $("#attributes").height( newHeight );

        }

        function animate() {

            requestAnimationFrame( animate );
            controls.update();

            stats.update();
            render();

        }

        function render() {

            renderer.render( scene, camera );
            stats.update();

        }


        function onMouseMove( event ) {

            //scene.updateMatrixWorld();
            cX = (event.clientX - $( "#info" ).width());  //+ 2;
            cY = (event.clientY - $( "#topbar").height()); // + 2 ;
            //console.log(cX, cY);

            var mouseX = ( cX  / canvaswidth  ) * 2 - 1;
            var mouseY = -( cY / canvasheight ) * 2 + 1;
            //console.log("mouse", mouseX, mouseY)

            mouseVector.set(mouseX, mouseY, camera.near);

            // Convert the [-1, 1] screen coordinate into a world coordinate on the near plane
            mouseVector.unproject( camera );

            //console.log(raycaster);
            raycaster.set( camera.position, mouseVector.sub( camera.position ).normalize() );


            // I turned this off try turning it back on if something breaks.
            //scene.updateMatrixWorld();

            var intersects = raycaster.intersectObjects( scene.children, true );

            //console.log(intersects)
            helper.position.set( 0, 0, 0 );
            if ( intersects.length > 0 ) {
                //console.log(intersects[0].object instanceof THREE.Line)
                if (((intersects[0].face != null) || (intersects[0].object instanceof THREE.Line)) && (intersects[0].object.name != "Helper") && (intersects[0].object.parent.name != "Helper") && (intersects[0].object.visible === true)) {
                    //console.log("Intersection ", intersects.length, intersects[0]);
                        intersectedObject = intersects[0].object.parent
                        intersectedMesh = intersects[0].object
                        intersectedPoint = intersects[ 0 ].point
                        //console.log(intersectedMesh, intersectedObject);
                        if (intersects[ 0 ].face != null) {
                            if ( helpertoggle == true ) {
                            helper.lookAt( intersects[ 0 ].face.normal );
                            helper.position.copy( intersects[ 0 ].point );
                            }
                        }
                        //console.log(String(intersects[ 0 ].point.x));
                        $('#xcoord').html(String(intersects[ 0 ].point.x.toFixed(5)));
                        $('#ycoord').html(String(intersects[ 0 ].point.y.toFixed(5)));
                        $('#zcoord').html(String(intersects[ 0 ].point.z.toFixed(5)));

                }
                // If first object is axishelper, and the multiple objects are intersected 
                if ((intersects[0].object instanceof THREE.AxisHelper === true) && (intersects.length > 1) && (intersects[1].face != null) && (intersects[1].object.visible === true)) {
                        //console.log("Axis is first object");
                        if ( helpertoggle == true ) {
                            helper.lookAt( intersects[ 1 ].face.normal );
                            helper.position.copy( intersects[ 1 ].point );
                        }
                        //console.log(String(intersects[ 0 ].point.x));
                        $('#xcoord').html(String(intersects[ 1 ].point.x.toFixed(5)));
                        $('#ycoord').html(String(intersects[ 1 ].point.y.toFixed(5)));
                        $('#zcoord').html(String(intersects[ 1 ].point.z.toFixed(5)));
                }
            }
            else {
                intersectedObject = "";
                intersectedMesh = "";
                intersectedPoint = "";
                $('#xcoord').html("Unknown");
                $('#ycoord').html("Unknown");
                $('#zcoord').html("Unknown");
            }


        } // END OF ON MOUSE MOVE

        // CLICK HANDLER
        var firstClick = true;
        var objectFirstClick = true;
        var p1;
        var p2;
        var l1;
        var l2;

        $('#container').click( function() {
            console.log("click");
            if (CLICKDISTANCE === true) {
                //console.log(intersectedPoint);
                if ((firstClick === true) && (intersectedPoint != "")) {
                    p1 = [intersectedPoint.x, intersectedPoint.y, intersectedPoint.z]
                    //console.log(p1)
                    firstClick = false
                }
                else if ((firstClick === false) && (intersectedPoint != null)) {
                    p2 = [intersectedPoint.x, intersectedPoint.y, intersectedPoint.z]
                    //console.log(p2)
                    pointDistance = get_point_distance(p1, p2).toFixed(5)

                    $("#dialogtext").text("The distance is " +  String(pointDistance) + "m");
                    $("#dialog").dialog({ resizable: false,
                                buttons: {
                                        Close: function () {
                                            $(this).dialog("close");
                                        }
                            } });
                    $('#dialog').dialog('option', 'title', 'Distance');
                    firstClick = true
                }
            }

            if (AREA) {

                if (OBJECTDISTANCE === true)  {
                    console.log("objectdistance false");
                    if ((objectFirstClick === true) && ((intersectedObject != "") || (intersectedMesh != ""))) {
                        if (intersectedObject instanceof THREE.Scene === false) {
                            l1 = get_object_layer_id(intersectedObject)
                            objectFirstClick = false
                        }
                        if (intersectedMesh instanceof THREE.Line === true) {
                            l1 = get_object_layer_id(intersectedMesh)
                            objectFirstClick = false
                        }
                        console.log(l1)
                    }

                    else if ((objectFirstClick === false) && ((intersectedObject != "") || (intersectedMesh != ""))) {
                        if (intersectedObject instanceof THREE.Scene === false) {
                            l2 = get_object_layer_id(intersectedObject)
                            if ((l1[0] != l2[0]) && (l1[0] != l2[0])) {
                                objectFirstClick = true
                            }
                        }
                        if (intersectedMesh instanceof THREE.Line === true) {
                            l2 = get_object_layer_id(intersectedMesh)
                            if ((l1[0] != l2[0]) && (l1[0] != l2[0])) {
                                objectFirstClick = true
                            }
                        }
                    }
                }

                if (AREA == true)  {	

                    if ((intersectedObject != "") || (intersectedMesh != "")) {
                        a = 0
                        if (intersectedObject instanceof THREE.Scene === false) {
                            intersectedObject.children.forEach( function(child) {
                                vertices = child.geometry.vertices 
                                faces = child.geometry.faces 	
                                console.log(vertices, faces);
                                faces.forEach( function(triangle) {
                                    //console.log(vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z)
                                    d1 = distance(vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z, vertices[triangle.b].x, vertices[triangle.b].y, vertices[triangle.b].z )
                                    d2 = distance(vertices[triangle.b].x, vertices[triangle.b].y, vertices[triangle.b].z, vertices[triangle.c].x, vertices[triangle.c].y, vertices[triangle.c].z )
                                    d3 = distance(vertices[triangle.c].x, vertices[triangle.c].y, vertices[triangle.c].z, vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z )
                                    //console.log(area(d1, d2, d3));
                                    //console.log(a)
                                    console.log(a)
                                    console.log(a, d1, d2, d3)
                                    console.log(typeof(a), typeof(d1), typeof(d2), typeof(d3))

                                    a += get_area(d1, d2, d3)
                                });	
                            });

                            $("#dialogtext").text("Area: " + a + "m2");
                            $("#dialog").dialog({ resizable: false,
                                buttons: {
                                        Close: function () {
                                            $(this).dialog("close");
                                        }
                            } });
                            $('#dialog').dialog('option', 'title', 'Area');
                        }

                        else if (intersectedMesh instanceof THREE.Line === false && intersectedObject instanceof THREE.Scene === true) {
                            vertices = intersectedMesh.geometry.vertices 
                            faces = intersectedMesh.geometry.faces 

                            faces.forEach( function(triangle) {
                                //console.log(triangle)
                                d1 = distance(vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z, vertices[triangle.b].x, vertices[triangle.b].y, vertices[triangle.b].z )
                                d2 = distance(vertices[triangle.b].x, vertices[triangle.b].y, vertices[triangle.b].z, vertices[triangle.c].x, vertices[triangle.c].y, vertices[triangle.c].z )
                                d3 = distance(vertices[triangle.c].x, vertices[triangle.c].y, vertices[triangle.c].z, vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z )

                                a += get_area(d1, d2, d3)
                            });

                            $("#dialogtext").text("Area: " + a + "meters squared");
                            $("#dialog").dialog({ resizable: false,
                                buttons: {
                                        Close: function () {
                                            $(this).dialog("close");
                                        }
                            } });
                            $('#dialog').dialog('option', 'title', 'Area');

                        }

                    }

                }
            }

            if (intersectedPoint != "") {
                    $("#xcoordinate").val( intersectedPoint.x )
                    $("#ycoordinate").val( intersectedPoint.y )
                    $("#zcoordinate").val( intersectedPoint.z )
            }

            // VERTEX EDITING 
            if (VERTEX || VERTEX_EDIT) {
                console.log("Vertex or Vertex edit true");
                // IF VERTEX BUTTON CLICKED OR VERTEX EDITING ENABLED
                 vertexObject = intersectedObject 
                 vertexMesh = intersectedMesh 
                 vertexPoint = intersectedPoint 

                if (VERTEX_EDIT === false) { vertexEditing() }
                if (VERTEX_EDIT === true) { vertexPicking() }
            }

        });

        // MULTISELECT

        var marquee = $("#select-marquee")
        var offset = {};
        var keyIsPressed = false
        var firstKeyPress = false
        var keyPressedCoords = {x: 0, y: 0};
        var canvasLeftOffset = $( "#info" ).width();
        var canvasTopOffset = $( "#topbar").height();
        var canvasWidth = window.innerWidth -  canvasLeftOffset;
        var	canvasHeight = window.innerHeight - canvasTopOffset;
        console.log("Multiselect linked")

        $(document).keydown( function(event) { 
            if ((MULTISELECT == true) && (SELECT == false)) {

                code = event.keyCode || event.which;
                keyIsA = ((String.fromCharCode(code) == "a") ||  (String.fromCharCode(code) == "A" ))  
                if (keyIsA === true) {
                    if ((keyPressedCoords.x === 0) && (keyPressedCoords.y === 0))  {
                        firstKeyPress = true
                        marquee.fadeIn();
                    }
                    keyIsPressed = true
                }	
            }
        });

        $("#container").mousemove(function(event){

            if ((keyIsPressed === true) && ((MULTISELECT === true) && (SELECT === false)) ) {

                if ((keyPressedCoords.x === 0) && (keyPressedCoords.y === 0)) {
                    //console.log("setting initial coords");
                    keyPressedCoords.x = event.clientX;
                    keyPressedCoords.y = event.clientY;
                    firstKeyPress = false
                }
                //console.log(mousedowncoords.x, mousedowncoords.y);

                //console.log("mouseover");
                var pos = {};
                //console.log(keyPressedCoords.x);
                pos.x = event.clientX - keyPressedCoords.x;
                pos.y = event.clientY - keyPressedCoords.y;
                //console.log(pos.x, pos.y);
                // square variations
                // (0,0) origin is the TOP LEFT pixel of the canvas.
                //
                //  1 | 2
                // ---.---
                //  4 | 3
                // there are 4 ways a square can be gestured onto the screen.  the following detects these four variations
                // and creates/updates the CSS to draw the square on the screen
                if (pos.x < 0 && pos.y < 0) {
                    marquee.css({left: event.clientX + 'px', width: -pos.x + 'px', top: event.clientY + 'px', height: -pos.y + 'px'});
                } else if ( pos.x >= 0 && pos.y <= 0) {
                    marquee.css({left: keyPressedCoords.x + 'px',width: pos.x + 'px', top: event.clientY, height: -pos.y + 'px'});
                } else if (pos.x >= 0 && pos.y >= 0) {
                    marquee.css({left: keyPressedCoords.x + 'px', width: pos.x + 'px', height: pos.y + 'px', top: keyPressedCoords.y + 'px'});
                } else if (pos.x < 0 && pos.y >= 0) {
                    marquee.css({left: event.clientX + 'px', width: -pos.x + 'px', height: pos.y + 'px', top: keyPressedCoords.y + 'px'});
                }



            }
        });

        $(document).on('keyup', function(e) { 
            //close marquee
            if (MULTISELECT === true) {
                make_multi_selection();
                //console.log("key let go");
                keyIsPressed = false
                keyPressedCoords = {x: 0, y: 0};
                marquee.fadeOut();
                marquee.css({width: 0, height: 0});
                selectcoords = {};
            }
        }); // END OF MULTI SELECTION KEYUP

        function is_inside_marquee(vector) {

            widthHalf = canvasWidth / 2
            heightHalf = canvasHeight / 2
            x2D = ( vector.x * widthHalf ) + widthHalf;
            y2D = - ( vector.y * heightHalf ) + heightHalf;

            marqueeMinY = marquee.position().top - canvasTopOffset
            marqueeMinX = marquee.position().left - canvasLeftOffset
            marqueeMaxX = marqueeMinX + marquee.width(); 
            marqueeMaxY = marqueeMinY + marquee.height();

            if ( ((x2D > marqueeMinX) && (x2D < marqueeMaxX)) && 
                 ((y2D > marqueeMinY) && (y2D < marqueeMaxY)) ) {
                return true;
                }
            else {
                return false 
            }
        }


        function make_multi_selection() {

            var insideMarquee = false;
            //var multiProjector = new THREE.Projector(); DEPRECATED
            var frustum = new THREE.Frustum(); // Create Frustrum 
            frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) ); //Get frustum of current camera shot
            var position = new THREE.Vector3();

            scene.children.forEach( function(o) {
                //console.log("Scene object", o);
                isMesh = (o instanceof THREE.Mesh)
                isObject3D = (o instanceof THREE.Object3D)
                isLine = (o instanceof THREE.Line)
                isAxis = (o instanceof THREE.AxisHelper)
                isHelper = ((o.hasOwnProperty('name')) && (o.name === "Helper"))

                if ((isMesh || isLine) && ((isHelper === false) && (isAxis === false))) { 
                    if (frustum.intersectsObject(o)) {
                        //console.log("intersected node");
                        oGeom = o.geometry
                        isPoint = (oGeom instanceof THREE.SphereGeometry)
                        if (isPoint) {
                            position.setFromMatrixPosition( o.matrixWorld );
                            v = position						
                            if (frustum.containsPoint(v)) {
                                var projectedVector = v.clone()
                                projectedVector.project( camera ); //Project the point into 2D
                                 
                                insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
                                if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
                                    SELECTED.sceneobject.push(o);
                                    SELECTED.color.push(o.material.color.clone())
                                    o.material.color.setHex( 0xCCCCCC )
                                    if (o.material.hasOwnProperty("ambient")) {
                                        o.material.ambient.setHex ( 0xCCCCCC )
                                    }
                                }
                            }
                        }
                        else if (isPoint === false) {
                            for (i = 0; i < o.geometry.vertices.length; i++) {
                                v = o.geometry.vertices[i] 
                                //console.log(v);
                                if (frustum.containsPoint(v)) {
                                    var projectedVector = v.clone()
                                    projectedVector.project( camera ); //Project the point into 2D
                                    
                                    insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
                                    if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
                                        SELECTED.sceneobject.push(o);
                                        SELECTED.color.push(o.material.color.clone())
                                        o.material.color.setHex( 0xCCCCCC )
                                        if (o.material.hasOwnProperty("ambient")) {
                                            o.material.ambient.setHex ( 0xCCCCCC )
                                        }
                                        break;
                                    } // Push object to SELECTED array if it's not already in there
                                }
                            }
                        }
                    }
                }

                if ((isObject3D) && ((isHelper === false) && (isAxis === false))) {
                    childBreak = false
                    //console.log("Object3D in scene", o);
                    for (i = 0; i < o.children.length; i++) {
                        m  = o.children[i]
                        // If Mesh intersects frustum
                        if (frustum.intersectsObject(m)) {
                            for (j = 0; j < m.geometry.vertices.length; j++) {
                                v =  m.geometry.vertices[j]
                                // If vertex intersects frustum
                                if (frustum.containsPoint(v)) {
                                    var projectedVector = v.clone()
                                    projectedVector.project( camera ); //Project the point into 2D
                                    
                                    insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
                                    if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) { 
                                        SELECTED.sceneobject.push(o)
                                        SELECTED.color.push(m.material.color.clone());
                                        o.children.forEach( function (c) {
                                            c.material.color.setHex( 0xCCCCCC )
                                            c.material.ambient.setHex ( 0xCCCCCC )
                                        });
                                        childBreak = true;
                                        break;
                                    } // Push object to SELECTED array if it's not already in there
                                }
                            };
                            if (childBreak) { break; }
                        }
                    };
                }
            });
        } // END OF MAKE MULTI SELECTION
    }; // END OF INITATELACUNA

    var intersectedObject = ""
    var intersectedMesh = ""

    //SELECTION
    $(document).on('keypress', function (e) {
        //console.log(e);
        var code = e.keyCode || e.which;
        //console.log(code);
        keyIsA = ((String.fromCharCode(code) == "a") ||  (String.fromCharCode(code) == "A" )) 
        objectIsIntersected = ((intersectedObject !== "" ) || ( intersectedMesh !== "" ))

        if ( SELECT && keyIsA && objectIsIntersected ){

            aObject3D = ((intersectedObject instanceof THREE.Object3D === true ) && intersectedObject instanceof THREE.Scene === false && intersectedMesh instanceof THREE.AxisHelper === false );
            aMeshObject = ((intersectedMesh instanceof THREE.Mesh === true ) && (intersectedObject instanceof THREE.Scene === true ));
            aLineObject = (intersectedMesh instanceof THREE.Line === true && intersectedMesh instanceof THREE.AxisHelper === false );
            //console.log(aObject3D, aMeshObject, aLineObject);
            if ( aObject3D || aMeshObject || aLineObject ) {
                //console.log($.inArray(intersectedObject, SELECTED), SELECTED)
                //console.log(aObject3D);
                //console.log();
                if (aObject3D === true) { inSelected = SELECTED.sceneobject.indexOf(intersectedObject) }
                else if (aLineObject === true || aMeshObject === true ) { inSelected = SELECTED.sceneobject.indexOf(intersectedMesh) } 
                //console.log(inSelected)

                // If object hasn't been selected
                if (inSelected  === -1) {	

                    //console.log(intersectedObject)
                     if (aObject3D === true) {
                        //console.log(intersectedObject)
                        console.log(intersectedObject);
                        colorArray = [];

                        intersectedObject.children.forEach( function(child, childIndex) {
                            if (childIndex === 0) {
                                objectColour = child.material.color.clone();
                            }
                            
                            child.material.color.setHex( 0xCCCCCC )
                            if (child.material.hasOwnProperty("ambient")) { child.material.ambient.setHex( 0xCCCCCC ) }
                        });
                        console.log("adding ", intersectedObject, " to SELECTED");
                        SELECTED.sceneobject.push(intersectedObject)
                        SELECTED.color.push(objectColour)
                        console.log(SELECTED);

                    }

                    else if ((aLineObject === true || aMeshObject === true) && (intersectedMesh.name != "Helper")) {
                        console.log("adding ", intersectedMesh, " to SELECTED");
                        SELECTED.sceneobject.push(intersectedMesh)
                        SELECTED.color.push(intersectedMesh.material.color.clone())
                        intersectedMesh.material.color.setHex( 0xCCCCCC )
                        if (intersectedMesh.material.hasOwnProperty("ambient")) { intersectedMesh.material.ambient.setHex( 0xCCCCCC ) }

                    }
                }

                // If object has been selected before
                if (inSelected  != -1) {

                    if (aObject3D === true) {
                        intersectedObject.children.forEach( function(child, colIndex) {
                            //console.log(SELECTED.color[inSelected])
                            child.material.color.set( SELECTED.color[inSelected] )
                            if (child.material.hasOwnProperty("ambient")) { child.material.ambient.set( SELECTED.color[inSelected] ) }  
                        });
                        //console.log("removing ", intersectedObject, " to SELECTED");
                        SELECTED.sceneobject.splice(inSelected, 1);
                        //console.log(SELECTED.sceneobject);
                        SELECTED.color.splice(inSelected, 1);
                    }

                    else if ((aLineObject === true || aMeshObject === true) && (intersectedMesh.name != "Helper")) {

                        //console.log("remove color", 
                        intersectedMesh.material.color.set( SELECTED.color[inSelected] )
                        if (intersectedMesh.material.hasOwnProperty("ambient")) { intersectedMesh.material.ambient = SELECTED.color[inSelected] }
                        SELECTED.sceneobject.splice(inSelected, 1);
                        SELECTED.color.splice(inSelected, 1);

                    }
                }
            }
        }
    });	// END OF A SELECTION

    function hoverrows() {	
        $('tr').click(function () {
            $('tr').removeClass('selected');
            $(this).addClass('selected');
            selectedRow = $(this);
            tableName = selectedRow.closest('table').find("caption").first()[0].innerHTML ;
            td = $(selectedRow).children('td');
            trID = td[0].innerText;
            selectedObjectToGet = tableName + " " + trID
            if (LASTHIGHLIGHTED != "") {
                if (LASTHIGHLIGHTED.hasOwnProperty('material')) {
                        LASTHIGHLIGHTED.material.color.setHex( 0xCCCCCC )
                        if ( LASTHIGHLIGHTED.material.hasOwnProperty("ambient") ) { LASTHIGHLIGHTED.material.ambient.setHex ( 0xCCCCCC ) }
                    }
                else if (LASTHIGHLIGHTED.hasOwnProperty('children')) {
                    LASTHIGHLIGHTED.children.forEach( function( highlightmesh ) {
                        highlightmesh.material.color.setHex( 0xCCCCCC );
                        if ( highlightmesh.material.hasOwnProperty("ambient") ) { highlightmesh.material.ambient.setHex ( 0xCCCCCC ) }
                    });
                }
            }
            SELECTED.sceneobject.forEach( function(selectedObject) {
                if (selectedObject.name === selectedObjectToGet) {
                    if (selectedObject.hasOwnProperty('material')) {
                        selectedObject.material.color.setHex( 0xFFCC00 )
                        if (selectedObject.material.hasOwnProperty("ambient") ) { selectedObject.material.ambient.setHex ( 0xFFCC00 ) }
                        LASTHIGHLIGHTED = selectedObject
                    }
                    else if (selectedObject.hasOwnProperty('children')) {
                        selectedObject.children.forEach( function( highlightmesh ) {
                            highlightmesh.material.color.setHex( 0xFFCC00 );
                            if (highlightmesh.material.hasOwnProperty("ambient") ) { highlightmesh.material.ambient.setHex ( 0xFFCC00 ) }
                            LASTHIGHLIGHTED = selectedObject
                        });
                    }
                }
            });
        });
    } // END OF ROW HOVERING LOGIC


    function getattributes () {
        $( "#attributesholder" ).empty();
        SELECTED.sceneobject.forEach( function(selectedObject) {
            if (selectedObject.hasOwnProperty('material')) {
                selectedObject.material.color.setHex( 0xCCCCCC )
                if (selectedObject.material.hasOwnProperty("ambient")) { selectedObject.material.ambient.setHex ( 0xCCCCCC ) }
            }
            else if (selectedObject.hasOwnProperty('children')) {
                selectedObject.children.forEach( function( highlightmesh ) {
                    highlightmesh.material.color.setHex( 0xCCCCCC );
                    if (highlightmesh.material.hasOwnProperty("ambient")) { highlightmesh.material.ambient.setHex ( 0xCCCCCC ) }
                });
            }
        });
        tables = [] ;
        objectsToGet = [] ;
        ajaxAttributes = false
        SELECTED.sceneobject.forEach( function(so, selectIndex) {
            if ((so.hasOwnProperty('name')) && ((so.name != "") || (so.name != "Helper"))) {
                objectName = so.name
                objectParts = objectName.split(" "); // Split name into TABLE and ID NUMBER [ 'Bridges', '2' ]
                if (tables.indexOf(objectParts[0]) === -1) {
                    tables.push(objectParts[0])
                    objectsToGet.push([])
                }
                    //console.log(tables.indexOf(objectParts[0]));
                tableNum = tables.indexOf(objectParts[0])
                objectsToGet[tableNum].push(objectParts[1])
            }
        });

        //console.log(tablesAndObjectsToGet)
        var attributeresponse = $.ajax({
                  url: './ajax/getattributes.php',
                  type: 'post',
                  dataType: "json",
                  timeout: 60000,
                  data: {'tables': tables, 'attributesToGet': objectsToGet},
                  async: false,
                  success: function(data) {
                    //alert( "Layer loaded into Lacuna" )
                    }
        }).responseJSON;


                //console.log(attributeresponse);

        function responseToTable(response) {
            response.forEach( function(tableToDisplay, tableIndex) {
                tableString = "";
                //tableToDisplay[1].unshift("Select")
                // Remove ID, put it back in at the begging
                temporaryColumns = tableToDisplay[1]
                //console.log(temporaryColumns);
                idPos = temporaryColumns.indexOf("ID")
                temporaryColumns.splice(idPos, 1)
                //console.log(temporaryColumns)
                temporaryColumns.unshift("ID")
                columnNames = temporaryColumns
                //console.log(columnNames);
                rows = tableToDisplay[2]

                tableString += "<tr>";

                columnNames.forEach( function(columnHeading) {
                    if ((columnHeading != "geom")) {
                        tableString = tableString + "<th>"
                        tableString = tableString + columnHeading 
                        tableString = tableString + "</th>"
                    }
                });

                //console.log(tableString);
                tableString = tableString + "</tr>";

                //tr = new row td = new cell
                // For each row

                rows.forEach( function(attributeRow) {
                    tableString += "<tr>";
                        //Create all the row cells
                        columnNames.forEach( function( colHeader, colIndex) {
                            if (colHeader != "geom") {
                                tableString += "<td>" + attributeRow[colHeader] + "</td>";
                            }
                        });
                    tableString += "</tr>";
                });

                finalString = ["<div>", "<br>",'<table class="attributetables" >', "<caption style='text-align: left;'>",
                               attributeresponse[tableIndex][0],  "</caption>", tableString, "</table>", "</div>", "<br>"].join("");
                $("#attributesholder").append(finalString);
                hoverrows();
            });

        }
                responseToTable(attributeresponse)
    } //END OF GET attribute function


    $('#loadselected').click( function() {
        if ((SELECT === true || MULTISELECT === true) && (SELECTED.sceneobject.length != 0)) {
            getattributes()
        }
    });

    //CHANGE LAYER COLOUR
    function changeLayerColour(layername) {
        scene.children.forEach( function(o) {
            colPos = SELECTED.sceneobject.indexOf(o)
            if ( colPos != -1) { SELECTED.color[colPos] = new THREE.Color(getLayerColour(layername)) }
            if ( colPos === -1 && o.hasOwnProperty("children") && o.children.length != 0 && o.name.substring(0, layername.length) === layername ) {
                o.children.forEach( function(c) {
                    c.material.color = new THREE.Color(getLayerColour(layername))
                    if (c.material.hasOwnProperty("ambient")) { c.material.ambient = new THREE.Color(getLayerColour(layername)) }
                });
            }
            if ( colPos === -1 && o.hasOwnProperty("material") && o.name.substring(0, layername.length) === layername ) {
                o.material.color = new THREE.Color(getLayerColour(layername))
                if (o.material.hasOwnProperty("ambient")) { o.material.ambient = new THREE.Color(getLayerColour(layername)) }
            }
        });
    }


    //CAMERA
    function lookAtPosition(x, y, z) {

        var lookAtVector = new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z))
        camera.position.x = lookAtVector.x
        camera.position.y = lookAtVector.y
        camera.position.z = lookAtVector.z + 100 // Add 50 meters above position so you can actually see it?
        console.log(lookAtVector);
        controls.target = lookAtVector
        controls.update();
    }

    //OBJECT LEVEL EDITING	

    function getObjectCenter(o) {  return new THREE.Box3().setFromObject(o).center() }

    function replaceGeomPG(name, id, geom) {
        //console.log("replacing geom")
        //console.log(name, id, geom);
        $.ajax({
            url: './ajax/updategeom.php',
            type: 'post',
            dataType: "json",
            timeout: 1200000,
            data: {'layer': name, 'id': id, 'geom': geom },
            async: false,
            success: function(data) {
                console.log("update geom php working")
            }
        });
    }

    function resetAdjustments(o) { 
        o.position.x = 0 
        o.position.y = 0
        o.position.z = 0
        o.rotation.x = 0 
        o.rotation.y = 0
        o.rotation.z = 0
        o.scale.x = 1
        o.scale.y = 1
        o.scale.z = 1
        o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0) )
    }

    function nudgeToCenter(obj) {
        var c = getObjectCenter(obj)
        console.log(c)
        obj.geometry.vertices.forEach( function(v) {
            if (c.x > 0) { v.x -= c.x }
            else if (c.x < 0) { v.x += Math.abs(c.x)}
            if (c.y > 0) { v.y -= c.y }
            else if (c.y < 0) { v.y += Math.abs(c.y)}
            if (c.z > 0) { v.z -= c.z }
            else if (c.z < 0) { v.z += Math.abs(c.z)}
            obj.geometry.verticesNeedUpdate = true
        });
    }

    function objectToWorld(obj) {
        obj.geometry.vertices.forEach( function(v) {
            var vector = v.clone();
            vector = obj.localToWorld(vector)
            v.x = vector.x
            v.y = vector.y
            v.z = vector.z
        })
        obj.geometry.verticesNeedUpdate = true
        obj.updateMatrixWorld();
    }

    var rotObjectMatrix;

    function rotateAroundObjectAxis(object, axis, radians) {
        var rotObjectMatrix = new THREE.Matrix4();
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
        object.matrix.multiply(rotObjectMatrix);
        object.rotation.setFromRotationMatrix(object.matrix)
    }

    var rotWorldMatrix;
    // Rotate an object around an arbitrary axis in world space       
    function rotateAroundWorldAxis(object, axis, radians) {
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
        rotWorldMatrix.multiply(object.matrix);                // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setFromRotationMatrix(object.matrix);
    }



    function edit_delete() {
        objectsToDelete = [];
        deleteTables = [];
        SELECTED.sceneobject.forEach( function(so, selectIndex) {
            if ((so.hasOwnProperty('name')) && ((so.name != "") || (so.name != "Helper"))) {
                objectName = so.name
                objectParts = objectName.split(" "); // Split name into TABLE and ID NUMBER [ 'Bridges', '2' ]
                if (deleteTables.indexOf(objectParts[0]) === -1) {
                    deleteTables.push(objectParts[0])
                    objectsToDelete.push([])
                }
                    //console.log(deleteTables.indexOf(objectParts[0]));
                tableNum = deleteTables.indexOf(objectParts[0])
                objectsToDelete[tableNum].push(objectParts[1])
            }
        });

        // Remove from three.js
        SELECTED.sceneobject.forEach( function(s, i) {
            scene.remove(s)
        });

        SELECTED.sceneobject = [];
        SELECTED.colors = [];

        $.ajax({
          url: './ajax/delete.php',
          type: 'POST',
          timeout: 60000,
          data: {'deleteTables': deleteTables, 'attributesToDelete': objectsToDelete},
          async: false,
          success: function(data) {
            //alert( "Selection deleted!" )
            }
        })		 
    }

    function edit_translate(x, y, z) {

        objectsToTranslate = [];
        translateTables = [];
        SELECTED.sceneobject.forEach( function(so, selectIndex) {
            if ((so.hasOwnProperty('name')) && ((so.name != "") || (so.name != "Helper"))) {
                objectName = so.name
                objectParts = objectName.split(" "); // Split name into TABLE and ID NUMBER [ 'Bridges', '2' ]
                if (translateTables.indexOf(objectParts[0]) === -1) {
                    translateTables.push(objectParts[0])
                    objectsToTranslate.push([])
                }
                    //console.log(deleteTables.indexOf(objectParts[0]));
                tableNum = translateTables.indexOf(objectParts[0])
                objectsToTranslate[tableNum].push(objectParts[1])
            }
        });

        SELECTED.sceneobject.forEach( function(s, i) {
            if (s.hasOwnProperty("children") && s.children.length != 0 ) {
                s.children.forEach( function(o) { 
                    if ( typeof(o.geometry) != "undefined" ) { 
                        o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z) )
                        o.geometry.verticesNeedUpdate = true;
                        o.geometry.elementsNeedUpdate = true;
                    }
                });
            }
            else {
                s.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z) )
                s.geometry.verticesNeedUpdate = true;
                s.geometry.elementsNeedUpdate = true;
            }
        });

        $.ajax({
          url: './ajax/translate.php',
          type: 'POST',
          timeout: 60000,
          data: { 'translateTables': translateTables, 'attributesToTranslate': objectsToTranslate, 'xyz': [x, y, z] },
          async: false,
          success: function(data) {
            alert( "Selection translated!" )
            }
        })
    } // END OF EDIT TRANSLATE


    // GEOMETRY MIGRATION 
    //

    function line_to_pg(l) {
        lg = ""
        vertices = l.geometry.vertices
        vertices.forEach( function(v, i) {
            if (i + 1 == vertices.length) { lg = lg + v.x + " " + v.y + " " + v.z + " -999999" } 
            else { lg = lg + v.x + " " + v.y + " " + v.z + " -999999," }
        });

        return "LINESTRING ZM (" + lg + ")"

    }

    function point_to_pg(p) {
        pos = p.position
        x = String(pos.x)
        y = String(pos.y)
        z = String(pos.z)

        return "POINT ZM (" + x + " " + y + " " + z + " -999999)"
    }

    function polygon_to_pg(p) {
        pg = ""
        vertices = p.geometry.vertices
        vertices.forEach ( function(v, i) {
            if (i == 0) { 
                fv = v.x + " " + v.y + " " + v.z + " -999999"
                pg = fv + "," 
            }

            else if (i + 1 == vertices.length) { pg += fv } 
            else { pg = pg + v.x + " " + v.y + " " + v.z + " -999999," }

        });
        return "POLYGON ZM ((" + pg  + "))"
    }

    // POLYGON ZM ((425727.27 564743.289999999 41.6263000000035 nan,425725.7 564743.1 41.6811000000016 nan,
    // 425725.8 564741.85 41.656799999997 nan,425723.4287 564741.6129 41.7403000000049 nan,425708.8 564740.15 41.7562999999936 nan,
    // 425711.4 564714.449999999 41.2596999999951 nan,425709.88 564714.24 41.2602000000043 nan,425706.9 564743 41.8162000000011 nan,
    // 425723.1825 564744.890900001 41.8032999999996 nan,425727.05 564745.34 41.6682000000001 nan,425727.27 564743.289999999 41.6263000000035 nan))

    function object_to_tin(o) {
        tinGeometry = ""
        vertices = o.geometry.vertices 
        faces = o.geometry.faces
        //console.log(vertices, faces);
        faces.forEach( function(triangle, i) {
            //console.log(vertices[triangle.a].x, vertices[triangle.a].y, vertices[triangle.a].z)
            firstvertex = String(vertices[triangle.a].x) + " " + String(vertices[triangle.a].y) + " " + String(vertices[triangle.a].z)  
            allVertexs = "((" + firstvertex + "," + 
                         String(vertices[triangle.b].x) + " " + String(vertices[triangle.b].y) + " " + String(vertices[triangle.b].z) + "," +  
                         String(vertices[triangle.c].x) + " " + String(vertices[triangle.c].y) + " " + String(vertices[triangle.c].z) + "," +
                         firstvertex + "))"

            // If last triangle 
            //console.log(faces.length , i);
            if (faces.length - 1 === i) {
                tinGeometry = tinGeometry + allVertexs 
            }
            else if (faces.length - 1 != i){
                tinGeometry = tinGeometry + allVertexs + ","
            }			
        });	
        return "TIN Z(" + tinGeometry + ")"
    }


    function threejs_to_tin(obj) {

        // If Object3D
        if ( (obj) && (obj.hasOwnProperty("children")) && (obj.children) && (obj.children.length) ) {
            //If object has children, turn it into a geometry collection

            geomstring = "GEOMETRYCOLLECTION(" 
            obj.children.forEach( function(child, childIndex) {
                tin = object_to_tin(child)
                if (childIndex === obj.children.length - 1) {
                    geomstring = geomstring + tin + ")"
                }
                else if (childIndex != obj.children.length - 1) {
                    geomstring = geomstring + tin + ","
                }
            });
            return geomstring 
        }

        //If Mesh
        else { 
            return object_to_tin(obj)
        }
    }


    //  OBJECT LEVEL EDITING

    function edit_rotate(degrees, axis) {
        radians = degrees * (Math.PI / 180)

        SELECTED.sceneobject.forEach( function(o, i) {
            var name = o.name.split(" ")[0]
            var id = o.name.split(" ")[1]
            if ( o.hasOwnProperty("geometry") && o.geometry instanceof THREE.SphereGeometry === true ) { return }
            if ( o instanceof THREE.Line == true || ( o instanceof THREE.Mesh && o.geometry instanceof THREE.SphereGeometry === false )) {
                originalCenter = getObjectCenter(o)
                console.log("Original Center", originalCenter)
                cl = o.clone()
                cl.geometry.vertices.forEach( function(v) {
                    v.x -= originalCenter.x
                    v.y -= originalCenter.y
                    v.z -= originalCenter.z
                    cl.geometry.verticesNeedUpdate = true
                });
                console.log("new center", getObjectCenter(cl))
                nudgeToCenter(cl)

                console.log("post adjustment center", getObjectCenter(cl))
                if (axis == "x") { cl.rotateX( radians ) }
                if (axis == "y") { cl.rotateY( radians ) }
                if (axis == "z") { cl.rotateZ( radians ) }
                cl.position = originalCenter
                cl.geometry.vertices.forEach( function(v) {
                    cl.updateMatrixWorld();
                    vector = v.clone();
                    vector = cl.localToWorld(vector)
                    v.x = vector.x
                    v.y = vector.y
                    v.z = vector.z
                })

                resetAdjustments(cl)
                scene.add(cl)
                scene.remove(o)

                if (o instanceof THREE.Line == true) { geom = line_to_pg(cl) }
                else if (o instanceof THREE.Mesh && o.geometry instanceof THREE.SphereGeometry === false) { geom = polygon_to_pg(cl) }
                replaceGeomPG(name, id, geom)

                selectedPos = SELECTED.sceneobject.indexOf(o)
                if (selectedPos !== -1) {
                    SELECTED.sceneobject[selectedPos] = cl;
                }

            }

            else {
                console.log("Rotation : ", o.rotation)
                console.log("The scale is", o.scale)
                originalRotation = o.rotation
                originalCenter = getObjectCenter(o)
                console.log("Center", originalCenter)

                holderGeometry = new THREE.Geometry() ;
                o.children.forEach( function(m, i) { 
                    THREE.GeometryUtils.merge(holderGeometry, m);
                    if ( i === 1 ) {
                        rotateMaterial = m.material
                        objectColour = m.material.color.clone();
                    }
                });

                THREE.GeometryUtils.center(holderGeometry)

                holderMesh = new THREE.Mesh(holderGeometry, rotateMaterial)
                nudgeToCenter(holderMesh)
                movedCenter = getObjectCenter(holderMesh)

                console.log("0,0,0 center: ", movedCenter)
                if (axis == "x") { holderMesh.rotateX( originalRotation.x + radians ) }
                if (axis == "y") { holderMesh.rotateY( originalRotation.y + radians ) }
                if (axis == "z") { holderMesh.rotateZ( originalRotation.z + radians ) }
                holderMesh.position = originalCenter

                finalMesh = holderMesh.clone() ;

                finalMesh.geometry.vertices.forEach( function(v) {
                    finalMesh.updateMatrixWorld();
                    vector = v.clone();
                    vector = finalMesh.localToWorld(vector)
                    //vector.localToWorld(localToWorld)
                    //vector.applyMatrix4( finalMesh.matrixWorld );
                    //console.log(vector)
                    v.x = vector.x
                    v.y = vector.y
                    v.z = vector.z
                    finalMesh.geometry.verticesNeedUpdate = true;
                    //console.log(v)
                })

                resetAdjustments(finalMesh)
                geom = threejs_to_tin(finalMesh)
                holderObject = new THREE.Object3D();
                holderObject.add(finalMesh)
                holderObject.name = o.name
                scene.add(holderObject)
                scene.remove(o)
                replaceGeomPG(name, id, geom)

                selectedPos = SELECTED.sceneobject.indexOf(o)

                if (selectedPos !== -1) {
                    SELECTED.sceneobject[selectedPos] = holderObject;
                }
            }
        });

    }

    function edit_scale(xs, ys, zs) {

        SELECTED.sceneobject.forEach( function(o, i) {
            var name = o.name.split(" ")[0]
            var id = o.name.split(" ")[1]

            if ( o.hasOwnProperty("geometry") && o.geometry instanceof THREE.SphereGeometry === true) { return }
            else if  ( o instanceof THREE.Line == true || (o instanceof THREE.Mesh && o.geometry instanceof THREE.SphereGeometry === false)) {
                console.log("is mesh or line")
                originalCenter = getObjectCenter(o)
                console.log("Original Center", originalCenter)
                cl = o.clone()
                cl.geometry.vertices.forEach( function(v) {
                    v.x -= originalCenter.x
                    v.y -= originalCenter.y
                    v.z -= originalCenter.z
                    cl.geometry.verticesNeedUpdate = true
                });
                //console.log("new center", getObjectCenter(cl))
                nudgeToCenter(cl)

                //console.log("post adjustment center", getObjectCenter(cl))
                cl.scale.x = xs
                cl.scale.y = ys
                cl.scale.z = zs
                cl.position = originalCenter
                cl.geometry.vertices.forEach( function(v) {
                    cl.updateMatrixWorld();
                    vector = v.clone();
                    vector = cl.localToWorld(vector)
                    v.x = vector.x
                    v.y = vector.y
                    v.z = vector.z
                })

                resetAdjustments(cl)
                cl.name = name
                scene.add(cl)
                scene.remove(o)

                if (o instanceof THREE.Line == true) { geom = line_to_pg(cl) }
                else if (o instanceof THREE.Mesh && o.geometry instanceof THREE.SphereGeometry === false) { geom = polygon_to_pg(cl) }
                replaceGeomPG(name, id, geom)

                selectedPos = SELECTED.sceneobject.indexOf(o)
                if (selectedPos !== -1) {
                    SELECTED.sceneobject[selectedPos] = cl;
                }
            }

            else {
                console.log("Rotation : ", o.rotation)
                console.log("The scale is", o.scale)
                originalRotation = o.rotation
                originalCenter = getObjectCenter(o)
                console.log("Center", originalCenter)

                holderGeometry = new THREE.Geometry() ;

                o.children.forEach( function(m, i) { 
                    THREE.GeometryUtils.merge(holderGeometry, m);
                    if ( i === 1 ) {
                        rotateMaterial = m.material
                        objectColour = m.material.color.clone();
                    }
                });

                THREE.GeometryUtils.center(holderGeometry)

                holderMesh = new THREE.Mesh(holderGeometry, rotateMaterial)

                movedCenter = getObjectCenter(holderMesh)

                console.log("0,0,0 center: ", movedCenter)
                holderMesh.scale.x = parseFloat(xs)
                holderMesh.scale.y = parseFloat(ys)
                holderMesh.scale.z = parseFloat(zs)
                holderMesh.position = originalCenter
                finalMesh = holderMesh.clone() ;

                finalMesh.geometry.vertices.forEach( function(v) {
                    finalMesh.updateMatrixWorld();
                    vector = v.clone();
                    vector = finalMesh.localToWorld(vector)
                    //vector.localToWorld(localToWorld)
                    //vector.applyMatrix4( finalMesh.matrixWorld );
                    console.log(vector)
                    v.x = vector.x
                    v.y = vector.y
                    v.z = vector.z
                    finalMesh.geometry.verticesNeedUpdate = true;
                    console.log(v)
                });
                finalMesh.updateMatrixWorld();
                finalMesh.geometry.verticesNeedUpdate = true;
                finalMesh.geometry.elementsNeedUpdate = true;

                resetAdjustments(finalMesh)
                geom = threejs_to_tin(holderMesh)
                holderObject = new THREE.Object3D();
                holderObject.add(finalMesh)
                holderObject.name = name

                console.log("new object scale", holderObject.scale)
                scene.add(holderObject)

                if (holderObject.hasOwnProperty("children")) { holderObject.children.forEach( function(o) { 
                        if ( typeof(o.geometry) != "undefined" ) { 
                            o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0) )
                            o.geometry.verticesNeedUpdate = true;
                            //o.geometry.elementsNeedUpdate = true;
                        }
                    });
                }

                scene.remove(o)

                replaceGeomPG(name, id, geom)

                selectedPos = SELECTED.sceneobject.indexOf(o)
                if (selectedPos !== -1) {
                    SELECTED.sceneobject[selectedPos] = holderObject;
                }
            }
        });

    } //Edit Scale

    function edit_copy(x, y, z) {

        copyObject = SELECTED.sceneobject[0] 
        copyColor = SELECTED.color[0]
        // IF LINE
        if ( copyObject instanceof THREE.Line == true ) { 
            copy = new THREE.Line( copyObject.geometry.clone(), new THREE.LineBasicMaterial() ) 
            copy.material.color = copyColor
            originalCenter = getObjectCenter(copyObject)
            copy.geometry.vertices.forEach( function(v) {
                v.x -= originalCenter.x
                v.y -= originalCenter.y
                v.z -= originalCenter.z
            });
            copy.geometry.verticesNeedUpdate = true
            nudgeToCenter(copy)
            copy.position.x = x
            copy.position.y = y
            copy.position.z = z
            console.log("After positioning", getObjectCenter(copy))
            objectToWorld(copy)
            resetAdjustments(copy)
            scene.add(copy)
            console.log("end of copy", copy)
            // USE PHP TO ADD TO DATABASE
        } 

        // IF POINT OR 3D
        else if ( copyObject.hasOwnProperty("geometry") && copyObject.geometry instanceof THREE.SphereGeometry === true && copyObject.name != "Helper") { 
            copy = new THREE.Mesh( pointGeometry = new THREE.SphereGeometry( 3, 12, 12 ),  new THREE.MeshBasicMaterial({color: copyColor, ambient: copyColor})  );
            copy.position.x = x 
            copy.position.y = y
            copy.position.z = z
            scene.add(copy)
        }

        // Mesh (POLYGON)
        else if ( copyObject instanceof THREE.Mesh && copyObject.geometry instanceof THREE.SphereGeometry === false ) { 

            console.log("object is Polygon ZM")
            originalCenter = getObjectCenter(copyObject)
            copy = new THREE.Mesh( copyObject.geometry.clone(), new THREE.MeshBasicMaterial() ) 
            copy.material.color = copyColor
            copy.material.ambient = copyColor
            copy.geometry.vertices.forEach( function(v) {
                v.x -= originalCenter.x
                v.y -= originalCenter.y
                v.z -= originalCenter.z
            });
            copy.geometry.verticesNeedUpdate = true
            nudgeToCenter(copy)
            copy.position.x = x
            copy.position.y = y
            copy.position.z = z
            console.log("After positioning", getObjectCenter(copy))
            objectToWorld(copy)
            resetAdjustments(copy)
            scene.add(copy)
            console.log("end of copy", copy)

        }

        else {
            copy = copyObject.clone()
            console.log(" Other stuff happening!")
            holderGeometry = new THREE.Geometry() ;
            copy.children.forEach( function(m, i) { 
                THREE.GeometryUtils.merge(holderGeometry, m);
                if ( i === 1 ) {
                    copyMaterial = m.material
                    objectColour = m.material.color.clone();
                    }
            });

            THREE.GeometryUtils.center(holderGeometry)
            holderGeometry.dynamic = true;
            holderGeometry.vertices.forEach( function(v) {
                v.x = v.x + parseFloat(x)
                v.y = v.y + parseFloat(y)
                v.z = v.z + parseFloat(z)
                holderGeometry.verticesNeedUpdate = true
                console.log(v)
            });
            holderGeometry.verticesNeedUpdate = true
            holderMesh = new THREE.Mesh(holderGeometry, new THREE.MeshBasicMaterial( { color: copyColor, ambient: copyColor }) )
            copy = new THREE.Object3D();
            copy.add(holderMesh)
            copy.updateMatrixWorld();
            scene.add(copy)
        }

        console.log("Layer name", copyObject.name);
        console.log("copy", copy);
        layerName = copyObject.name.split(" ")[0]

        // PHP - IF A POINT
        if 	( copyObject.hasOwnProperty("geometry") && copyObject.geometry instanceof THREE.SphereGeometry === true && copyObject.name != "Helper") { 
            copyGeom = point_to_pg(copy)
        }
        // PHP - IF LINE
        else if ( copyObject instanceof THREE.Line == true ) {
            copyGeom = line_to_pg(copy)
        }

        else if ( copyObject instanceof THREE.Mesh && copyObject instanceof THREE.SphereGeometry === false ) {
            copyGeom = polygon_to_pg(copy)
        }
        // PHP - ELSE IF A 3D OBJECT
        else {
            copyGeom = threejs_to_tin(copy)
        }

        //console.log(layerName, copyGeom)
        copyresponse = $.ajax({
                              url: './ajax/copy.php',
                              type: 'post',
                              dataType: "json",
                              timeout: 1200000,
                              data: {'layer': layerName, 'geom': copyGeom },
                              async: false,
                              success: function(data) {
                                console.log("copy php working")
                                }
                             }).responseJSON;

        copy.name = layerName + " " + String(copyresponse) 
        // GET LARGEST ID NUMBER
        // SET ID number
        if (copy.hasOwnProperty("children") && copy.children.length != 0 ) { copy.children.forEach( function(o) { 
            if ( typeof(o.geometry) != "undefined" ) { 
                o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0) )
                o.geometry.verticesNeedUpdate = true;
                //o.geometry.elementsNeedUpdate = true;
            }
        });
        }
    } // END OF COPY FUNCTION


    // VERTEX LEVEL EDITING 

    //
    var originalModel

    function wireframeObject(o, wfbool) {
        if (o.hasOwnProperty('material')) {
            o.material.wireframe = wfbool;
        }
        else if (o.hasOwnProperty('children') && o.children.length != 0) {
            o.children.forEach ( function(objectchild) {
                if (objectchild.hasOwnProperty('material')) {
                    objectchild.material.wireframe = wfbool;
                }
            });
        }
    }

    function closestVertex(point, object) {
        //console.log(point);
        // Point is Vector3
        var dist = -1
        var closest
        var vertexmesh

        // Object3D
        if (object.hasOwnProperty("children") && object.children.length != 0 ) {
            object.children.forEach( function(child) {
                child.geometry.vertices.forEach( function(v) {
                    //console.log(point.distanceTo(v))
                    if (dist === -1) {
                        dist = point.distanceTo(v)
                        closest = v
                        vertexmesh = child
                    }
                    else if (point.distanceTo(v) < dist) {
                        dist = point.distanceTo(v)
                        closest = v
                        vertexmesh = child
                    }
                });
            });

            //return [closest, vertexmesh]
        }

        // Line or Mesh
        else if (object.hasOwnProperty("children") == false || (object.hasOwnProperty("children") && object.children.length == 0)) {
            console.log("Its a line?")
            object.geometry.vertices.forEach( function(v) {
                if (dist === -1) {
                    dist = point.distanceTo(v)
                    closest = v
                    vertexmesh = object
                }
                else if (point.distanceTo(v) < dist) {
                    dist = point.distanceTo(v)
                    closest = v
                    vertexmesh = object
                }
            });
        }

        moveVertexs = []
        vertexMeshs = []
        if (object.hasOwnProperty("children") && object.children.length != 0 ) {
            object.children.forEach( function(child) {
                //console.log(child)
                child.geometry.vertices.forEach( function(v) { 
                    //console.log(v, closest)
                    if ( closest.distanceTo(v) <= (EPSILON * 3) ) { 
                        moveVertexs.push(v)
                        console.log("ADDED", v);
                        if (vertexMeshs.indexOf(child) === -1) { vertexMeshs.push(child) }
                    }
                });
            });
        }
        else if (object.hasOwnProperty("children") == false || (object.hasOwnProperty("children") && object.children.length == 0)) {
            object.geometry.vertices.forEach( function(v) { 
                if ( closest.distanceTo(v) <= (EPSILON * 3) ) { 
                    moveVertexs.push(v)
                    console.log("ADDED", v);
                    if (vertexMeshs.indexOf(object) === -1) { vertexMeshs.push(object) }
                }
            });
        }


        console.log("vertexs", moveVertexs, "meshes", vertexMeshs)
        return [moveVertexs, vertexMeshs]
    }

    function vertexEditing() {

        if ( VERTEX && (VERTEX_EDIT == false)) {
            console.log("Vertex Editing Running")
            console.log("vertexMesh", vertexMesh)
            console.log("vertexObject", vertexObject)
            editedPoint = ""
            editedModel = ""
            originalMeshPos = ""
            vPoint = (vertexMesh.hasOwnProperty("geometry") && vertexMesh.geometry instanceof THREE.SphereGeometry && vertexMesh.name != "Helper" )
            vObject3D = ( vertexObject instanceof THREE.Object3D === true  && vertexObject instanceof THREE.Scene === false && vertexMesh instanceof THREE.Line == false )
            vLine = ( vertexMesh instanceof THREE.Line === true && vertexMesh.parent instanceof THREE.Scene === true  );
            vPolygon = ( vertexMesh instanceof THREE.Mesh && vertexMesh.parent instanceof THREE.Scene === true && vertexMesh.geometry instanceof THREE.SphereGeometry === false && vertexMesh.name != "Helper" ) 

            if (vPoint) { vertexModel = vertexMesh }
            else if (vObject3D) { vertexModel = vertexObject  }
            else if (vLine) { vertexModel = vertexMesh }
            else if (vPolygon) { vertexModel = vertexMesh  }
            ACTION = true;

            if ( vertexModel != "" && (vPoint || vObject3D || vLine || vPolygon) && vertexModel instanceof THREE.AxisHelper === false)  {
                GEOMCLICKED = true
                console.log("Vertexmodel not equal to empty string", vertexModel);
                cloneGeometry = []

                VERTEX = false;
                wireframeObject(vertexModel, true)
                lookAtPosition(getObjectCenter(vertexModel).x , getObjectCenter(vertexModel).y, getObjectCenter(vertexModel).z  )
                controls.panSpeed = 0.0
                helper.visible = false; 
                if (scene.children.indexOf(vertexHelper) === -1) {
                    scene.add(vertexHelper)
                }
                VERTEX_EDIT = true 
            }
        }
        else {
            $("#dialogtext").text("Other function in operation, or nothing selected!");
            $("#dialog").dialog({ resizable: false, buttons: { OK: function () { $(this).dialog("close") } } });

        }
    }

    //vertButtons = ['#xvertplus', '#xvertminus', '#yvertplus', '#yvertminus', '#zvertplus', '#zvertminus']

    function vertexPicking() {
        console.log("Vertex Picking Running")

        if ( VERTEX_EDIT && vertexPoint && vPoint && (editedPoint == "" || vertexMesh == editedPoint) ) { 
            // IS A POINT
            editingInProgress = true
            originalMeshPos = vertexMesh.position.clone() 
            console.log("original mesh", originalMeshPos)
            pointMesh = vertexMesh
            $("#dialogtext").html('X: <div id="xvertplus" ></div> <input id="xvert" style="width: 100px; text-align: center; "> <div id="xvertminus" style="width: 36px"></div> <br><br> Y: <div id="yvertplus"></div> <input id="yvert" style="width: 100px; text-align: center;"> <div id="yvertminus" style="width: 36px "></div><br><br> Z: <div id="zvertplus"></div> <input id="zvert" style="width: 100px; text-align: center;"> <div id="zvertminus" style="width: 36px "></div>'  )
            $( "#xvertplus" ).button( {label: "+", text: true} )
            $( "#xvertminus" ).button( {label: "-", text: true} )
            $( "#yvertplus" ).button( {label: "+", text: true} )
            $( "#yvertminus" ).button( {label: "-", text: true} )
            $( "#zvertplus" ).button( {label: "+", text: true} )
            $( "#zvertminus" ).button( {label: "-", text: true} )

            $("#xvert").val(parseFloat(pointMesh.position.x))
            $("#yvert").val(parseFloat(pointMesh.position.y))
            $("#zvert").val(parseFloat(pointMesh.position.z))
            dims = ["x", "y", "z"]

            dims.forEach( function(d) {
                //console.log(vertexMesh.position, vertexMesh.position.x)
                $("#" + d + "vertplus").click( function() {
                    if (d == "x") { pointMesh.position.x = parseFloat(pointMesh.position.x) + 1; $("#xvert").val(parseFloat(pointMesh.position.x)) }
                    if (d == "y") { pointMesh.position.y = parseFloat(pointMesh.position.y) + 1; $("#yvert").val(parseFloat(pointMesh.position.y)) }
                    if (d == "z") { pointMesh.position.z = parseFloat(pointMesh.position.z) + 1; $("#zvert").val(parseFloat(pointMesh.position.z)) }
                    lookAtPosition(pointMesh.position.x, pointMesh.position.y, pointMesh.position.z )
                });

                $("#" + d + "vertminus").click( function(){
                    if (d == "x") { pointMesh.position.x = parseFloat(pointMesh.position.x) - 1; $("#xvert").val(parseFloat(pointMesh.position.x)) }
                    if (d == "y") { pointMesh.position.y = parseFloat(pointMesh.position.y) - 1; $("#yvert").val(parseFloat(pointMesh.position.y)) }
                    if (d == "z") { pointMesh.position.z = parseFloat(pointMesh.position.z) - 1; $("#zvert").val(parseFloat(pointMesh.position.z)) }
                    lookAtPosition(pointMesh.position.x, pointMesh.position.y, pointMesh.position.z )
                });
            });

            editedPoint = vertexMesh
        }

        else if ( VERTEX_EDIT && vertexPoint && 
                 ( vObject3D || vLine || vPolygon ) && 
                 ( editedModel == "" || ( vertexMesh == editedModel || vertexObject == editedModel ) ) 
                ) 
            {
            // A 3D Object
            if (vObject3D) {
                picked = closestVertex(vertexPoint, vertexObject)
                if (vertexObject.hasOwnProperty("children") && vertexObject.children.length != 0) {
                    vertexObject.children.forEach( function(m) {
                        cloneGeometry.push(m.geometry.clone())
                    });
                }
            }

            else if (vLine || vPolygon) { 
                picked = closestVertex(vertexPoint, vertexMesh)
                cloneGeometry = [vertexMesh.geometry.clone()]
            }

            console.log(picked)
            pickedVertices = picked[0] 
            representVertex = pickedVertices[0] 
            pickedMesh = picked[1]

            vertexHelper.position = representVertex.clone(); 
            originalPos = representVertex.clone(); 

            $("#dialogtext").html('X: <div id="xvertplus" ></div> <input id="xvert" style="width: 100px; text-align: center; "> <div id="xvertminus" style="width: 36px"></div> <br><br> Y: <div id="yvertplus"></div> <input id="yvert" style="width: 100px; text-align: center;"> <div id="yvertminus" style="width: 36px "></div><br><br> Z: <div id="zvertplus"></div> <input id="zvert" style="width: 100px; text-align: center;"> <div id="zvertminus" style="width: 36px "></div>'  )
            $( "#xvertplus" ).button( {label: "+", text: true} )
            $( "#xvertminus" ).button( {label: "-", text: true} )
            $( "#yvertplus" ).button( {label: "+", text: true} )
            $( "#yvertminus" ).button( {label: "-", text: true} )
            $( "#zvertplus" ).button( {label: "+", text: true} )
            $( "#zvertminus" ).button( {label: "-", text: true} )
            $("#xvert").val(representVertex.x)
            $("#yvert").val(representVertex.y)
            $("#zvert").val(representVertex.z)

            dims = ["x", "y", "z"]
            dims.forEach( function(d) {
                $("#" + d + "vertplus").click( function() {
                    dim = $("#" + d + "vert")
                    dim.val( parseFloat( dim.val() ) + 1 );
                    pickedVertices.forEach( function(v) {
                        if (d == "x") { v.x = parseFloat(dim.val()) }
                        if (d == "y") { v.y = parseFloat(dim.val()) }
                        if (d == "z") { v.z = parseFloat(dim.val()) }
                    });

                    if (vObject3D) {
                        vertexObject.children.forEach( function(m) {
                            m.geometry.dynamic = true;
                            m.geometry.verticesNeedUpdate = true;
                            m.geometry.elementsNeedUpdate = true;
                            m.geometry.computeFaceNormals()

                        });
                    }
                    else { vertexMesh.geometry.verticesNeedUpdate = true }
                    //vertexObject.material = new THREE.MeshBasicMaterial( {color: 0xCCCCCC, ambient: 0xCCCCCC} );

                    vertexHelper.position.copy(pickedVertices[0].clone())

                    if (vertexObject.hasOwnProperty("children")) {
                        vertexObject.children.forEach( function(o) { 
                            if ( typeof(o.geometry) != "undefined" ) { 
                                o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0) )
                                o.geometry.verticesNeedUpdate = true;
                            }
                        });
                    }
                    vertexObject.matrixWorldNeedsUpdate = true
                });

                $("#" + d + "vertminus").click( function(){
                    dim = $("#" + d + "vert")
                    dim.val( parseFloat( dim.val()) - 1 );
                    pickedVertices.forEach( function(v) {
                        if (d == "x") { v.x = parseFloat(dim.val()) }
                        if (d == "y") { v.y = parseFloat(dim.val()) }
                        if (d == "z") { v.z = parseFloat(dim.val()) }
                    });

                    if (vObject3D) {
                        vertexObject.children.forEach( function(m) {
                            m.geometry.dynamic = true;
                            m.geometry.verticesNeedUpdate = true;
                            m.geometry.elementsNeedUpdate = true;
                            m.geometry.computeFaceNormals()
                        });
                    }
                    else { vertexMesh.geometry.verticesNeedUpdate = true }

                    scene.updateMatrixWorld();
                    vertexHelper.position.copy(pickedVertices[0].clone())
                    if (vertexObject.hasOwnProperty("children")) {
                        vertexObject.children.forEach( function(o) { 
                            if ( typeof(o.geometry) != "undefined" ) { 
                                o.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0) )
                                o.geometry.verticesNeedUpdate = true;
                                //o.geometry.elementsNeedUpdate = true;
                            }
                        });
                    }
                    vertexObject.matrixWorldNeedsUpdate = true				
                });
            });

            if (vObject3D) { editedModel = vertexObject }
            if (vPolygon) { editedModel = vertexMesh }
            if (vLine) { editedModel = vertexMesh }
        }
        
        
        //DIALOG BOX
        $("#dialog").dialog({ 
            resizable: false, 
            buttons: {
                Accept: function () {
                    //console.log("Commiting Edit!");
                    if (vPoint && originalMeshPos != "") { cancelVertexEditing() }
                    $(this).dialog("close");
                },
                Cancel: function () {

                    if (vPoint && originalMeshPos != "") { pointMesh.position = originalMeshPos; cancelVertexEditing() }
                    if ((vObject3D || vLine || vPolygon) && originalPos != "") {
                        console.log("being called")
                        console.log(pickedVertices);
                        pickedVertices.forEach( function(v) { 
                            v.x = originalPos.x
                            v.y = originalPos.y
                            v.z = originalPos.z

                        }); 
                        if (vObject3D) {
                            vertexObject.children.forEach( function(m) {
                                m.geometry.verticesNeedUpdate = true;
                                m.geometry.elementsNeedUpdate = true;
                                m.geometry.computeFaceNormals()
                            });
                        }
                        else { vertexMesh.geometry.verticesNeedUpdate = true }
                        vertexHelper.position = originalPos

                    }
                    $(this).dialog("close");
                }
            } 
        });
        $('#dialog').dialog('option', 'title', 'Vertex Editing');

    } // END OF VERTEX PICKING

    function cancelVertexEditing() {
        GEOMCLICKED = false
        VERTEX = false
        VERTEX_EDIT = false
        ACTION = false
        editInProgress = false
        if (typeof vLine != 'undefined') {
            if (vertexModel != "" && vLine == false ) { wireframeObject(vertexModel, false) }
        }
        vertexHelper.position.x = 0
        vertexHelper.position.y = 0
        vertexHelper.position.z = 0
        $('#mode').text("Visualise");
        $('#verteximage').attr("src", "imgs/vertexedit.png");
        helper.visible = true;
        controls.panSpeed = 1.0;

    } // END OF CANCEL VERTEX PICKING

    function uploadEdits() {
        console.log(vertexModel)
        var aPoint = (vertexMesh.hasOwnProperty("geometry") && vertexMesh.geometry instanceof THREE.SphereGeometry && vertexMesh.name != "Helper" )
        var aObject3D = ( vertexObject instanceof THREE.Object3D === true  && vertexObject instanceof THREE.Scene === false && vertexMesh instanceof THREE.Line == false )
        var aLine = ( vertexMesh instanceof THREE.Line === true && vertexMesh.parent instanceof THREE.Scene === true  );
        var aPolygon = ( vertexMesh instanceof THREE.Mesh && vertexMesh.parent instanceof THREE.Scene === true && vertexMesh.geometry instanceof THREE.SphereGeometry === false && vertexMesh.name != "Helper" ) 
        var name = vertexModel.name.split(" ")[0] 
        var id = vertexModel.name.split(" ")[1]

        if (aPoint) { console.log("A point is being saved"); geom = point_to_pg(vertexModel) }
        else if (aObject3D) { geom = threejs_to_tin(vertexModel) }
        else if (aLine 	) { geom = line_to_pg(vertexModel) }
        else if (aPolygon) { geom = polygon_to_pg(vertexModel) }

        replaceGeomPG(name, id, geom)
    } // END OF UPLOAD EDITS


    function discardChanges() {
        console.log (cloneGeometry)
        if (vObject3D) {	
            //console.log(vertexObject)
            oObject = new THREE.Object3D
            oObject.name = vertexObject.name
            oColor = vertexObject.children[0].material.color.clone() 
            cloneGeometry.forEach( function(m, i) { 
                oObject.add(new THREE.Mesh( cloneGeometry[i], new THREE.MeshLambertMaterial( { color: oColor.clone(), ambient: oColor.clone() } )))
            })
            scene.remove(vertexObject)
            scene.add(oObject)
        }
        else if (vPolygon) {
            oMesh = new THREE.Mesh( cloneGeometry[0], new THREE.MeshLambertMaterial( { color: oColor.clone(), ambient: oColor.clone() } ))
            oMesh.name = vertexMesh.name
            scene.remove(vertexMesh)
            scene.add(oMesh)
        }
        else if (vLine) {
            oLine = new THREE.Line( cloneGeometry[0], new THREE.LineBasicMaterial( { color: oColor.clone(), ambient: oColor.clone() } ))
            oLine.name = vertexMesh.name 
            scene.remove(vertexMesh)
            scene.add(oLine)
        }

        vLine = false
        vPoint = false
        vPolygon = false
        vObject3D = false

    } // END OF DISCARD CHANGES


    // 3D BUFFERING

    function Buffer3D(radius, opa, center) {
        console.log("Buffering using a Sphere");
        var geometry = new THREE.SphereGeometry( radius, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, opacity: opa });
        var sphere = new THREE.Mesh( geometry, material );
        sphere.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z) );
        sphere.name = "Buffer Sphere"
        console.log(scene, sphere, center);
        scene.add( sphere );
    }

    function BufferCylinder3D(radiustop, radiusbottom, height, opa, center ) {
        // (radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
        console.log("Buffering using a Cylinder");
        var geometry = new THREE.CylinderGeometry( radiustop, radiusbottom, height, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, opacity: opa });
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z) );
        radians = 90 * (Math.PI / 180)
        cylinder.rotation.x = radians
        cylinder.name = "Buffer Cylinder"
        //rotateAroundObjectAxis(cylinder, new THREE.Vector3(0, 1, 0), radians);
        scene.add( cylinder );
    }


    function BufferBox3D(width, height, depth, opa, center ) {
        // width, height, depth, widthSegments, heightSegments, depthSegments
        console.log("Buffering using a Box");
        var geometry = new THREE.BoxGeometry( width, height, depth );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, opacity: opa });
        var box = new THREE.Mesh( geometry, material );
        box.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z) );
        box.name = "Buffer Box"

        scene.add( box );
    }