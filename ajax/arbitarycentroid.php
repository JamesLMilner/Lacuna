
<?php
		require('dbconnect.php');
		ini_set("memory_limit","40M");
		set_time_limit(0);
		$maxx = 0;
		$maxy = 0;
		$minx = 0;
		$miny = 0;
		$phpLayer = '"' . $_GET["layer"] . '"';
		$extentquery = "SELECT ST_XMax(ST_Extent(geom)), ST_YMax(ST_Extent(geom)), ST_XMin(ST_Extent(geom)), ST_YMin(ST_Extent(geom)) FROM $phpLayer ;";
		# echo $extentquery;
		$extent = pg_query($db, $extentquery);
		while ($geoms = pg_fetch_row($extent)) {
				#echo $geoms[0] , " ",  $geoms[1], " " ,$geoms[2], " ", $geoms[3], " END ";
				if ($geoms[0] > $maxx or $maxx == 0) { $maxx = $geoms[0];}
				if ($geoms[1] > $maxy or $maxy == 0) { $maxy = $geoms[1]; }
				if ($geoms[2] < $minx or $minx == 0 ) { $minx = $geoms[2]; }
				if ($geoms[3] < $miny or $miny == 0) { $miny = $geoms[3]; }
		}
		
		$centroidxy = array($maxx, $maxy, $minx, $miny);
		echo json_encode($centroidxy);
?>