<?php
	
	require('dbconnect.php');
	ini_set("memory_limit","40M");
	set_time_limit(0);
	
	$phpLayer = '"' . $_POST["layer"] . '"';
	$phpGeom = "'" . $_POST["geom"] . "'";
	$phpID = $_POST["id"];
	
	$addGeomSQL = "UPDATE {$phpLayer} SET geom = ST_GeomFromText({$phpGeom}) WHERE \"ID\" = {$phpID} ;";
	echo $addGeomSQL;
	$copyQuery = pg_query($db, $addGeomSQL);
	
?>