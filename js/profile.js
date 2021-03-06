// Load the Visualization API and the piechart package.
google.load("visualization", "1", {packages: ["columnchart"]});
// Set a callback to run when the Google Visualization API is loaded.
//google.setOnLoadCallback(initialize);
var elevations = null;
var mousemarker = null;
var mm_infowindow_open = false;
var polyline = null;
var SAMPLES = 200;
var elevationService = null;
var chart = null;
var elevationReqActive = false;
var path;
var geoXml = null;
var geoXmlDoc = null;
var mapProfile = null;
var myLatLng = null;
var myGeoXml3Zoom = true;
var sidebarHtml = "";
var infowindow = null;
var kmlLayer = null;
var filename = "FlightAware_JBU670_KLAX_KJFK_20120229_kml.xml";
var filename = "track/pippo.xml";
	
function MapTypeId2UrlValue(maptype) {
    var urlValue = 'm';
    switch(maptype){
      case google.maps.MapTypeId.HYBRID:    urlValue='h';
                        break;
      case google.maps.MapTypeId.SATELLITE: urlValue='k';
                        break;
      case google.maps.MapTypeId.TERRAIN:   urlValue='t';
                        break;
      default:
      case google.maps.MapTypeId.ROADMAP:   urlValue='m';
                        break;
    }
    return urlValue;
  }

      // ========== This function will create the "link to this page"
function makeLink() {
//        var a="http://www.geocodezip.com/v3_MW_example_linktothis.html"
/*
        var url = window.location.pathname;
        var a = url.substring(url.lastIndexOf('/')+1)
           + "?lat=" + mapProfile.getCenter().lat().toFixed(6)
           + "&lng=" + mapProfile.getCenter().lng().toFixed(6)
           + "&zoom=" + mapProfile.getZoom()
           + "&type=" + MapTypeId2UrlValue(mapProfile.getMapTypeId());
        if (filename != "FlightAware_JBU670_KLAX_KJFK_20120229_kml.xml") a += "&filename="+filename;
        document.getElementById("link").innerHTML = '<a href="' +a+ '">Link to this page<\/a>';
*/
      }
    
function initialize(url, mapcenter) {
	filename = url
	myLatLng = new google.maps.LatLng(mapcenter.lat ,mapcenter.lng);
	// these set the initial center, zoom and maptype for the map 
	// if it is not specified in the query string
	var lat = mapcenter.lat;
	var lng = mapcenter.lng;
	var zoom = 10;
	var maptype = google.maps.MapTypeId.ROADMAP;

	// If there are any parameters at eh end of the URL, they will be in  location.search
	// looking something like  "?marker=3"

	// skip the first character, we are not interested in the "?"
	var query = location.search.substring(1);

	// split the rest at each "&" character to give a list of  "argname=value"  pairs
	var pairs = query.split("&");
	for (var i=0; i<pairs.length; i++) {
        // break each pair at the first "=" to obtain the argname and value
		var pos = pairs[i].indexOf("=");
		var argname = pairs[i].substring(0,pos).toLowerCase();
		var value = pairs[i].substring(pos+1).toLowerCase();

			// process each possible argname  -  use unescape() if theres any chance of spaces
		if (argname == "id") {id = unescape(value);}
		if (argname == "filename") {filename = unescape(value);}
		if (argname == "marker") {index = parseFloat(value);}
		if (argname == "lat") {lat = parseFloat(value);}
		if (argname == "lng") {lng = parseFloat(value);}
		if (argname == "zoom") {
			zoom = parseInt(value);
			myGeoXml3Zoom = false;
		}
		if (argname == "type") {
	// from the v3 documentation 8/24/2010
	// HYBRID This map type displays a transparent layer of major streets on satellite images. 
	// ROADMAP This map type displays a normal street map. 
	// SATELLITE This map type displays satellite images. 
	// TERRAIN This map type displays maps with physical features such as terrain and vegetation. 
				if (value == "m") {maptype = google.maps.MapTypeId.ROADMAP;}
				if (value == "k") {maptype = google.maps.MapTypeId.SATELLITE;}
				if (value == "h") {maptype = google.maps.MapTypeId.HYBRID;}
				if (value == "t") {maptype = google.maps.MapTypeId.TERRAIN;}

			}
	}
	
	if (!isNaN(lat) && !isNaN(lng)) {
		myLatLng = new google.maps.LatLng(lat, lng);
	}
	var myOptions = {
			zoom: zoom,
			center: myLatLng,
			// zoom: 5,
			// center: myLatlng,
			mapTypeId: maptype
	};
	
	mapProfile = new google.maps.Map(document.getElementById("map_canvas"),
				myOptions);
			// Create a new chart in the elevation_chart DIV.
	chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));
			// Create an ElevationService.
	elevationService = new google.maps.ElevationService();
							infowindow = new google.maps.InfoWindow({});
	google.visualization.events.addListener(chart, 'onmouseover', function(e) {
		if (mousemarker == null) {
			mousemarker = new google.maps.Marker({
				position: elevations[e.row].location,
				map: mapProfile,
				icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
			});
			var contentStr = "elevation="+elevations[e.row].elevation+"<br>location="+elevations[e.row].location.toUrlValue(6);
			mousemarker.contentStr = contentStr;
			google.maps.event.addListener(mousemarker, 'click', function(evt) {
				mm_infowindow_open = true;
				infowindow.setContent(this.contentStr);
				infowindow.open(mapProfile,mousemarker);
			});
		} 
		else 
		{
			var contentStr = "elevation="+elevations[e.row].elevation+"<br>location="+elevations[e.row].location.toUrlValue(6);
			mousemarker.contentStr = contentStr;
			infowindow.setContent(contentStr);
			mousemarker.setPosition(elevations[e.row].location);
			// if (mm_infowindow_open) infowindow.open(mapProfile,mousemarker);
		}
	});


 geoXml = new geoXML3.parser({
									map: mapProfile,
									infoWindow: infowindow,
									singleInfoWindow: true,
			zoom: myGeoXml3Zoom,
									afterParse: useTheData
							});
							geoXml.parse(filename);
		// Make the link the first time when the page opens
//	makeLink();

      // Make the link again whenever the map changes
/*
	google.maps.event.addListener(mapProfile, 'maptypeid_changed', makeLink);
	google.maps.event.addListener(mapProfile, 'center_changed', makeLink);
	google.maps.event.addListener(mapProfile, 'bounds_changed', makeLink);
	google.maps.event.addListener(mapProfile, 'zoom_changed', makeLink);
*/
};

function drawPath(path) {
        if (elevationReqActive || !path) return;


        // Create a PathElevationRequest object using this array.
        // Ask for 100 samples along that path.
        var pathRequest = {
          path: path,
          samples: SAMPLES
        }
        elevationReqActive = true;

        // Initiate the path request.
        elevationService.getElevationAlongPath(pathRequest, plotElevation);
      }

      // Takes an array of ElevationResult objects, draws the path on the map
      // and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(results, status) {
        elevationReqActive = false;
        if (status == google.maps.ElevationStatus.OK) {
          elevations = results;

          // Extract the elevation samples from the returned results
          // and store them in an array of LatLngs.

          // Extract the data from which to populate the chart.
          // Because the samples are equidistant, the 'Sample'
          // column here does double duty as distance along the
          // X axis.
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'Sample');
          data.addColumn('number', 'Elevation');
          for (var i = 0; i < results.length; i++) {
            data.addRow(['', elevations[i].elevation]);
          }

          // Draw the chart using the data within its DIV.
          document.getElementById('elevation_chart').style.display = 'block';
          chart.draw(data, {
            width: 800,
            height: 200,
            legend: 'none',
            titleY: 'Elevation (m)'
          });
        }
      }

function useTheData(doc){
  geoXmlDoc = doc[0];
  for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
    // console.log(doc[0].markers[i].title);
    var placemark = geoXmlDoc.placemarks[i];
    if (placemark.polyline) {
      if (!path) {
        path = [];
        var samples = placemark.polyline.getPath().getLength();
        var incr = samples/SAMPLES;
        if (incr < 1) incr = 1;
        for (var i=0;i<samples; i+=incr)
        {
          path.push(placemark.polyline.getPath().getAt(parseInt(i)));
        }
      }								 
    }
  }
  drawPath(path);
};
