# deMaps
maps web app with 
  1. client: angularjs and leaflet 
  2. server 
    1. windows: node.js, express and mongoDb with monk
    2. file mymaps.json

COSA FA

1. Coordinate
	1. insert manually latitude longitude and zoom parameters
	2. search address: geocoding with http://photon.komoot.de/
    3. add a draggable marker
    4. clear: all added markers
    
2. Manage
    1. data in mongoDb as administrator

3. Direct Locations		
	1. View link to zoom coordinates
	2. Partenza (optional) open url
	3. Wikipedia (optional) open wikipedia url if exist or other if not exist wikipedia url
	4. Descrizione (optional) open workflowy url
	5. Photo (optional) open personal owncloud url and geolocalized
	6. GPS (optional) checkbox to visualazie track (format WKT,TopoJSON,KML,GPX,CSV,GEOJSON,POLYLINE) thank to omnivore
	
4. Layers
	1. OpenMapSurfer
	2. OpenTopoMap
	3. mapbox light
	4. mapbox terrain (need key)
	5. Open Street Map
	6. ESRI worl topo map
	7. Google Map (terrain, hybrid, street)
	8. others
	
5. Markers with hyperlink
	1. Red			Rifugi
	2. Blue			Alpeggi
	3. Purple		Cime
	4. Green 		Valli

6. Profile
	1. Add a chart from kml (GPS checkbox)
      1. upload file nodejs server (multer)

7. Photo
    1. link ad un album su internet (only photo)
    2. visualize in tab photos (Photo checkbox)        
      1. link to Picasa album with geotag 
      2. local repository (imagine + thumbnail + file with geotag)
          
