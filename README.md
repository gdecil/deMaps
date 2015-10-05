# deMaps
maps web app with 
  1. client: angularjs and leaflet 
  2. server 
    1. windows: node.js, express and mongoDb
    2. file mymaps.json

COSA FA
1. Coordinate
	1. insert manually latitude longitude and zoom parameters
	2. search address: geocoding with http://photon.komoot.de/

2. Direct Locations		
	1. View link to zoom coordinates
	2. Partenza (optional) open url
	3. Wikipedia (optional) open wikipedia url if exist or other if not exist wikipedia url
	4. Descrizione (optional) open workflowy url
	5. Photo (optional) open personal owncloud url
	6. GPS (optional) checkbox to visualazie track (format WKT,TopoJSON,KML,GPX,CSV,GEOJSON,POLYLINE) thank to omnivore
	
3. Layers
	1. OpenMapSurfer
	2. OpenTopoMap
	3. mapbox light
	4. mapbox terrain (need key)
	5. Open Street Map
	6. ESRI worl topo map
	7. Google Map (terrain, hybrid, street)
	8. others
	
4. Markers with hyperlink
	1. Red			Rifugi
	2. Blue			Alpeggi
	3. Purple		Cime
	4. Green 		Valli

5. Profile
	1. Add a chart from kml (GPS checkbox)

6. Photo
    1. visualize in tab photo (Photo checkbox)

7. Insert Data
    1. in file mymaps.json usando insert.html
    2. in mongoDb da fare