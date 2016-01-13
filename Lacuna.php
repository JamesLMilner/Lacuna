<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Lacuna - 3D Web GIS using HTML5</title>
		<meta charset="utf-8">
		
		<link rel="stylesheet" href="css/Lacuna.css">
		<link rel="stylesheet" href="css/perfect-scrollbar-0.4.10.min.css">
		<link rel='stylesheet' href='css/spectrum.css' />
		<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
        <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
		<!-- <script src="poly2tri.js"></script> -->
		<script src="js/three70.js"></script>
		<script src="js/TrackballControls.js"></script>
		<script src="js/stats.min.js"></script>
		<script src="js/jquery-1.11.0.min.js"></script> <!-- jQuery must be defined first! -->
		<script src="js/jquery-ui.js"></script>
		<script src="js/perfect-scrollbar-0.4.10.with-mousewheel.min.js"></script>
		<script src='js/spectrum.js'></script>
		<script src='js/getrandomcolor.js'></script>
		<!-- <script src='js/pnltri.min.js'></script> -->
		<?php include 'ajax/dbconnect.php'; ?>
		
	</head>

	<body>
		<div id="topbar"> 
			<div id="logoholder"> 
                <img id="logo" src="imgs/LacunaLogo2.png">
			</div>
			<div id="buttons">
				<div id="camera" title="Camera Options" ><img src="imgs/camera.png"><div id="cameraoptions"  class="topbarbuttons"> 
					<div id="lookat" title="Look At"><img id="lookatimage" src="imgs/lookat.png" ></div> 
					<div id="camerasettings" title="Camera Settings"><img id="camerasettingsimage"src="imgs/camerasettings.png" > </div>
				</div></div>
				<div id="helper" title="Helper" ><img src="imgs/helper.png"><div id="helperoptions" class="topbarbuttons"> 
					<div id="helpertoggle"> ON </div> 
					<div id="helpercolour"> </div>
				</div></div>
				<div id="canvas" title="Canvas Colour" ><img src="imgs/canvas.png"><div id="canvasoptions" class="topbarbuttons"> 
					<div id="canvascolour"> </div> 
				</div></div> 
				<div id="axis" title="Axis Options"><img src="imgs/axis.png" ><div id="axisoptions"  class="topbarbuttons" >
					<div id="axistoggle">ON </div>
					<div id="axispos" title="Axis Position"><img id="axisposimage" src="imgs/axispos.png" ></div>
					<div id="axissize" title="Axis Size"><img id="axissizeimage" src="imgs/axissize.png" ></div>
				</div></div> 
				<div id="wireframe" title="Wireframe Mode"><img src="imgs/wireframe.png" ><div id="wireframeoptions"  class="topbarbuttons" >
					<div id="wireframetoggle"> OFF </div> 
				</div></div> 
				<div id="measure" title="Measure"><img src="imgs/measure.png"><div class="topbarbuttons" id="measureoptions"  class="topbarbuttons" >
					<div id="clickdistance" title="Distance by Click"><img id="clickdistanceimage" src="imgs/clickdistance.png" > </div> 
					<div id="area" title="Surface Area"><img id="areaimage" src="imgs/area.png" ></div> 
				</div></div> 
				<div id="buffer" title="Buffers"><img  src="imgs/buffer.png" ><div id="bufferoptions"  class="topbarbuttons" >
					<div id="sphere" title="Sphere Buffer"><img id="sphereimage" src="imgs/sphere.png" ></div>
					<div id="cylinder" title="Cylinder Buffer"><img id="cylinderimage" src="imgs/cylinder.png"></div> 
					<div id="box" title="Cube Buffer"><img id="boximage" src="imgs/box.png"></div>		
				</div></div> 
				<div id="select" title="Select" ><img src="imgs/select.png" ><div id="selectoptions" class="topbarbuttons" >
					<div id="singleselect" title="Pointer Select"><img id="singleselectimage" src="imgs/singleselect.png"> </div>
					<div id="multiselect" title="Marquee Select"><img id="multiselectimage" src="imgs/multiselect.png"> </div>
				</div></div> 
				<div id="objectedit" title="Object Edit"><img  src="imgs/objectedit.png"><div id="objecteditoptions"  class="topbarbuttons" >
					<div id="delete" title="Delete Selected"><img id="deleteimage" src="imgs/delete.png"></div>
					<div id="copy" title="Copy Selected"><img id="copyimage" src="imgs/copy.png"> </div>
					<div id="translate" title="Translate Selected"><img id="translateimage"  class="topbarbuttons"  src="imgs/translate.png" > </div> 
					<div id="rotate" title="Rotate Selected"><img id="rotateimage" src="imgs/rotate.png"> </div>
					<div id="scale" title="Scale Selected"><img id="scaleimage" src="imgs/scale.png"></div>					
				</div></div> 
				
				<div id="vertexedit" title="Vertex Level Editing"><img id="verteximage"  class="topbarbuttons"  src="imgs/vertexedit.png" > </div>
				<div id="mode" title="GIS Mode"> Visualise </div>
			</div>
		</div>

		<div id="main">
				<div id="info">
					<div id="layerscontainer">
						<div id="layers"> 
							<p class="titles">Layers</p>
							<?php include("ajax/getlayers.php") ?>
							<script> var jsLayerList = <?php echo json_encode($layerList); ?> </script>
							
						</div>
					</div>
					<div id="attributes"> 
						<div id="attributestop">
							<p class="titles"> Attributes </p>  <div id="loadselected"> </div>
						</div>
						 <div id="attributesholder"> </div>
					</div>
				</div>
				<div id="container">
				</div>
		</div>
		<div id="bottombar"> 
            <div id="system">Coordinate System: British National Grid (SRID: 27700)</div>
			<div id="coords">
				X <div id="xcoord"> </div> 
				Y <div id="ycoord"> </div> 
				Z <div id="zcoord"> </div>
			</div>
		</div>
		<div id="select-marquee"></div>
		<div id="dialog"><div id="dialogtext"></div></div>
		
		<script src="js/lacuna.js"></script>
		<script src="js/toolbar.js"></script>
		<script src="js/layersattributes.js"></script> <!-- Page needs to have loaded first to run this script successfully! KEEP AT THE END -->
		<script src="js/layerbuttons.js"></script>
		
	</body>
</html>