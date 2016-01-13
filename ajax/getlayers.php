<?php 
    $query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT IN ('raster_columns', 'raster_overviews', 'spatial_ref_sys', 'geometry_columns',
    'geography_columns') ORDER BY table_name ASC";
    $result = pg_query($db, $query);
    if (!$result) {
      echo "An error occurred.\n";
      exit;
    }
    else {
        $layerList = array();
        while ($layer = pg_fetch_row($result)) {
            $divCol = $layer[0] . "col";
            $divZoom = $layer[0] . "zoom";
            $divAtt = $layer[0] . "attributes";

            if ( strlen($layer[0]) > 15 )  { $layerAlias = substr($layer[0] , 0, 14) . "...";	}
            else { $layerAlias = $layer[0]; } 
            echo "<br>";
            echo "<input type='checkbox' id='$layer[0]' style='vertical-align: middle; float:left; width:30px' />";
            echo "<span title='$layer[0]' class='layertext'> $layerAlias </span> <div style='display: inline-block;'> <div id='$divCol' title='Layer Colour' style='width: 11px; height:11px; display: inline-block; margin-left: 5px; border: black; border-style: solid; vertical-align: middle; margin-bottom: 2px; cursor: pointer' /> </div>";
            echo "<div id='$divZoom' title='Zoom to Layer' style='width: 11px; height:11px; display: inline-block; margin-left: 5px; border: black; border-style: solid; vertical-align: middle; margin-bottom: 2px; cursor: pointer' /><img src='imgs/zoom.png' style='float: left'> </div>";
            echo "<div class='allattributes' title='Attributes' style=' background-color: #080808; width: 11px; height:11px; display: inline-block; margin-left: 5px; border: black; border-style: solid; vertical-align: middle; margin-bottom: 2px; cursor: pointer; line-height: 1em; text-align: center; text-indent:0px;' />a</div></div>";
            array_push($layerList, $layer[0]);
            echo "<br>";
        }
        echo "<br><br><br>";
    }
?>