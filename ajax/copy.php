<?php
	
	require('dbconnect.php');
	ini_set("memory_limit","40M");
	set_time_limit(0);
	
	$phpLayer = '"' . $_POST["layer"] . '"';
	$phpGeom = "'" . $_POST["geom"] . "'";
	
	$addGeomSQL = "INSERT INTO {$phpLayer} (geom) VALUES 
				  (ST_GeomFromText({$phpGeom})) RETURNING \"ID\" ; " ;
				  
	$copyQuery = pg_query($db, $addGeomSQL);
	
	while ($copy = pg_fetch_row($copyQuery)) {
		  echo $copy[0];
	}

?>

