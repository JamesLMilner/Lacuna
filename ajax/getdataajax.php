<?php 
	//error_reporting(E_ALL);
	//ini_set('display_errors', 'On');
	
	ini_set("memory_limit","300M");
	set_time_limit(0);
	$phpModelName = $_GET["layer"];

	function getModel($modelname) {
		
		include "dbconnect.php";

		
            $modelquery = pg_query($db, "SELECT ST_AsText(geom), \"ID\" FROM  public.\"$modelname\"; ");
        
		
		$polygonString = "";
		$polyhedralString = "";
		$tinzString = "";
		$lineString = "";
		$pointString = "";
		
		$polyhedralsurfaceID = array();
		$tinzID = array();
		$linestringID = array();
		$pointID = array();
		$polygonID = array();
		
		function PolygonZM($pzmModel) {
			// Unfortunately nearly unreadable, however a lot more efficent than the original code. It essentially a series of string replacements.
			return str_replace(" nan", "", str_replace(")", "", str_replace("(", "", str_replace(")", "", str_replace("),", " &&& ", $aModel = str_replace("POLYGON ZM (", "", str_replace(" -999999", "", $pzmModel)))))));
		}
		
		function PolyhedralSurfaceZ($pszModel) {
			return str_replace(")", "", str_replace("(", "", str_replace("POLYHEDRALSURFACE Z (", "", str_replace(" nan", "", $pszModel))));
		}
		
		function TINZ($tinzModel) {
			return str_replace(")", "", str_replace("(", " ||| ", str_replace("TIN Z (", "", str_replace(" nan", "", $tinzModel))));
		}
		
		function LineStringZ($lineString) {
			return str_replace(")", "", str_replace("(", "", str_replace("LINESTRING ZM", "", str_replace(" -999999", "", str_replace(" nan", "", $lineString)))));
		}
		
		function PointZ($pointString) {
			return str_replace(")", "", str_replace("(", "", str_replace("POINT ZM", "", str_replace(" -999999", "",  str_replace(" nan", "", $pointString)))));
		}
		
		function checkGeometryType($aGeometry) {

			if (substr( $aGeometry, 0, 10  ) === "POLYGON ZM")  { 
				return array("POLYGON ZM", PolygonZM($aGeometry) . " ::: ");
			}
			if (substr( $aGeometry, 0, 19  ) === "POLYHEDRALSURFACE Z") { 
				return array("POLYHEDRALSURFACE Z", PolyhedralSurfaceZ($aGeometry) . " ::: ");
			}
			if (substr( $aGeometry, 0, 5  ) === "TIN Z") {  
				return array("TIN Z", TINZ($aGeometry));
			}
			if (substr( $aGeometry, 0, 12  ) === "LINESTRING Z") {  
				return array("LINESTRING Z", LineStringZ($aGeometry));
			}
			if (substr( $aGeometry, 0, 7  ) === "POINT Z") { 
				return array("POINT Z", PointZ($aGeometry));
			}
		}
		
		while ($model = pg_fetch_row($modelquery)) {

			if (substr( $model[0], 0, 18  ) === "GEOMETRYCOLLECTION") { 

				$cleanedCollection = str_replace("GEOMETRYCOLLECTION Z (", "", $model[0]);
				if  (substr( $cleanedCollection, 0, 5  ) === "TIN Z") {
					$TINZgeom = checkGeometryType($cleanedCollection);
					$tinzString .= $TINZgeom[1] . " %%% ";
					array_push( $tinzID, $model[1] );
				}
				else {
					$splitCollection = explode("),", $cleanedCollection);
					foreach($splitCollection as $collection){
						$geomtype = checkGeometryType($collection);
						if ($geomtype[0] == "POLYHEDRALSURFACE Z") {  $polyhedralString .= $geomtype[1]; }
						if ($geomtype[0] == "POLYGON ZM") {  $polygonString .= $geomtype[1];  }
					}
					if ($polyhedralString != "") { $polyhedralString .= " %%% "; array_push($polyhedralsurfaceID, $model[1]); }
					if ($polygonString != "") { $polygonString .= " %%% "; array_push($polygonID, $model[1]); }
					
				}
			}
			else {
				$geomtype = checkGeometryType($model[0]);
				if ($geomtype[0] == "POLYHEDRALSURFACE Z") {  $polyhedralString .=  $geomtype[1] . " %%% "; array_push($polyhedralsurfaceID, $model[1]); continue; }
				if ($geomtype[0] == "POLYGON ZM") {  $polygonString .=  $geomtype[1] . " %%% "; array_push($polygonID, $model[1]); continue; }
				if ($geomtype[0] == "LINESTRING Z") {  $lineString .=  $geomtype[1] . " %%% "; array_push($linestringID, $model[1]); continue; }
				if ($geomtype[0] == "TIN Z") {  $tinzString .= $geomtype[1] . " %%% "; array_push($tinzID, $model[1]); continue; }
				if ($geomtype[0] == "POINT Z") {  $pointString .=  $geomtype[1] . " %%% "; array_push($pointID, $model[1]);  }
			}
		}
		
		return json_encode( array(	array("POLYGON ZM", $polygonString, $polygonID),
									array("POLYHEDRALSURFACE Z", $polyhedralString, $polyhedralsurfaceID),
									array("TIN Z", $tinzString, $tinzID), 
									array("LINESTRING Z", $lineString, $linestringID), 
									array("POINT Z", $pointString, $pointID)
								 )
							);
	}
	
	echo getModel($phpModelName);
	

?> 