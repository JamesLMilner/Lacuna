<?php 
	include "dbconnect.php";
	
	$layer = $_GET["layer"] ;
	$id = $_GET["id"] ;
	$layer = '"' . $layer . '"' ;
	
	//Area
	$query = " SELECT ST_Area(geom) FROM {$layer} WHERE \"ID\" = {$id} ; " ;
	$measurementQuery = pg_query($db, $query);
	
	while ($row = pg_fetch_row($measurementQuery)) {
		$result = $row[0];
	}
	
	
	echo json_encode($result);
	
?>
