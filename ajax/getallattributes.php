<?php
	
	// GET ATTRIBUTE DATA AND RETURN TO AJAX CALL
	
	$ajaxTables = $_GET["tables"];
	
	//$fakeData  = array(array("Bridges", "BuildingRoofs"), array(array(1, 2, 3, 4), array(8 , 9 , 12)));
	
	function attributes($tables, $attributesToGet) {
		set_time_limit(0);
		include "dbconnect.php";
	
		$returnedData = array(); // Create empty array to store returning data
		$counter = 0; //Increment to get appropriate IDs on each table 
		 
		//echo $tables;
		//echo $attributesToGet;
		
		foreach($tables as $table) {
			//echo $table;
			$attributesToReturn = array($table); // For this table define an array so that we can return [Table Name, Column Names, Queried Rows]
			$columnTable = "'" . $table . "'"; 
			$attributeTable = '"' . $table . '"';
			
			
			$columnSQL  = "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $columnTable ;";
			//echo $columnQuery; 
			
			
			$tableColumnQuery = pg_query($db, $columnSQL);
										
			$columns = array();
			while ($column = pg_fetch_row($tableColumnQuery)) {
				array_push($columns, $column[0]);
			}
			
			//echo $columns[0];
			
			//echo $columns[0];
			
			//Push column headings into the array 
			array_push($attributesToReturn, $columns);

			
			$attributesSQL = "SELECT * FROM $attributeTable ;";
			$attributeQuery = pg_query($db, $attributesSQL);
			
			$rows = array();
			while ($row = pg_fetch_array($attributeQuery,NULL, PGSQL_ASSOC)) {
					//echo $row[1];
				array_push($rows, $row);
			}
			
			array_push($attributesToReturn, $rows);
			
			array_push($returnedData, $attributesToReturn);
			
			
		}
		
		return json_encode($returnedData);
	}
	
	echo attributes($ajaxTables, $ajaxAttributes);
		
		
		
			
		
?>