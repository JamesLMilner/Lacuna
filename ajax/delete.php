<?php
	
	set_time_limit(0);
	include "dbconnect.php";
	
	$tables = $_POST["deleteTables"];
	$attributesToDelete = $_POST["attributesToDelete"];
	
	$counter = 0; 
	foreach($tables as $table) {
		$attributeTable = '"' . $table . '"';
		$thisTablesIDs = $attributesToDelete[$counter];
		$ids = ""; 
		foreach($thisTablesIDs as $id) {
			$ids = $ids . $id . ",";
		}
		$ids = rtrim($ids, ",");
		
		
		$deleteSQL = "DELETE FROM $attributeTable WHERE \"ID\" IN ( $ids ) ;";
		$attributeQuery = pg_query($db, $deleteSQL);
		$counter = $counter + 1;
	}
	
?>
