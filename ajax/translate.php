<?php
	
	set_time_limit(0);
	include "dbconnect.php";
	
	$tables = $_POST["translateTables"];
	$attributesToTranslate = $_POST["attributesToTranslate"];
	$xyz = $_POST["xyz"];
	$x = $xyz[0];
	$y = $xyz[1];
	$z = $xyz[2];
	
	$counter = 0; 
	foreach($tables as $table) {
		$attributeTable = '"' . $table . '"';
		$thisTablesIDs = $attributesToTranslate[$counter];
		$ids = ""; 
		foreach($thisTablesIDs as $id) {
			$ids = $ids . $id . ",";
		}
		$ids = rtrim($ids, ",");

		$translateSQL = "UPDATE $attributeTable SET geom = ST_Translate(geom, $x , $y , $z )  WHERE \"ID\" IN ( $ids ) ;";
		$attributeQuery = pg_query($db, $translateSQL);
		$counter = $counter + 1;
	}
	
?>
