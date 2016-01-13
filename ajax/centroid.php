
<?php

	require('dbconnect.php');
	$maxx = 0;
	$maxy = 0;
	$minx = 0;
	$miny = 0;
	$ignore = array("geometry_columns", "geography_columns", "raster_columns", "raster_overviews", "spatial_ref_sys");
	$result = pg_query($db, "SELECT table_name FROM information_schema.tables  WHERE table_schema = 'public'");
	while ($layer = pg_fetch_row($result)) {
		if (in_array($layer[0], $ignore)) {
			
		}
		else {
			//echo $layer[0];
			$thegeom = '"' . $layer[0] . '"';
			$extentquery = "SELECT ST_XMax(ST_Extent(geom)), ST_YMax(ST_Extent(geom)), ST_XMin(ST_Extent(geom)), ST_YMin(ST_Extent(geom)) FROM $thegeom ;";
			# echo $extentquery;
			$extent = pg_query($db, $extentquery);
			while ($geoms = pg_fetch_row($extent)) {
					//echo $geoms[0] , " ",  $geoms[1], " " ,$geoms[2], " ", $geoms[3], " END ";
					if ($geoms[0] > $maxx or $maxx == 0) { $maxx = $geoms[0];}
					if ($geoms[1] > $maxy or $maxy == 0) { $maxy = $geoms[1]; }
					if ($geoms[2] < $minx or $minx == 0 ) { $minx = $geoms[2]; }
					if ($geoms[3] < $miny or $miny == 0) { $miny = $geoms[3]; }
			}
		
		}
	}	
	$centroid = array($maxx, $maxy, $minx, $miny);
	echo json_encode($centroid);
	
?>