app
	.controller('MainController', ['$filter','$scope', 'places', '$location', 'leafletData', function($filter, $scope, places, $location, leafletData){
    //form
	$scope.master = {
        tipo:"Cime", 
        Nome:"Grignone", 
        Partenza: "Esino Lario m 1450", 
        Altezza: "m 2540", 
        Wikipedia: "https://it.wikipedia.org/wiki/Grigna_settentrionale",
        Descrizione: "https://workflowy.com/#/7c4964938b5b", 
        Photo:"https://2.own",
        Latitudine:"45.953333",
        Longitudine:"9.387509",
        Messaggio:"https://it.wikipedia.org/wiki/Grigna_settentrionale"
    };
    $scope.reset = function() {
        $scope.mymaps = angular.copy($scope.master);
    };
    $scope.clear = function() {
        $scope.master = {
            tipo:"", 
            Nome:"", 
            Partenza: "", 
            Altezza: "", 
            Wikipedia: "",
            Descrizione: "", 
            Photo:"",
            Photo:"",
            GPSinfo:"",
            GPSFile:"",
            Latitudine:"",
            Longitudine:"",
            Messaggio:""
        };
        $scope.reset();
    };
    //form end
        
	//tree filter
	$scope.treeFilter = $filter('uiTreeFilter');

	$scope.availableFields = ['title', 'description'];
	$scope.supportedFields = ['title', 'description'];
	$scope.toggleSupport = function (propertyName) {
			return $scope.supportedFields.indexOf(propertyName) > -1 ?
					$scope.supportedFields.splice($scope.supportedFields.indexOf(propertyName), 1) :
					$scope.supportedFields.push(propertyName);
	};
	
	/*places.success(function(data){
        $scope.geodata = data;
     $scope.mapMarkers = geodataToMarkers($scope.geodata);

  });*/
		
	//centratura mappa
	if($location.$$absUrl.indexOf("c=") > -1){
		var c = $location.$$absUrl.split("?")
		var coord = c[1].replace("c=", "").split(":")				
		$scope.mapCenter = 
			{
			lat: Number(coord[0]),
			lng: Number(coord[1]),
			zoom: Number(coord[2])
		}		
	}
	else {
		$scope.mapCenter = 
				{
				lat: 45.953333,
				lng: 9.387509,
				zoom: 8
			}		
	}
		 //form update   
	$scope.changeLocation = function(centerHash) {
        if(window.location.href.indexOf("insert.html")>0){   
            Partenza = "";
            Altezza = "";
            Wikipedia = "";
            Descrizione = "";
            PhotoUrl = "";
            PhotoFile = "";
            GPSinfo = "";
            GPSFile = "";

            var loc
            for (var i=0; i < $scope.list.length; i++) {
                var objf = $scope.list[i].items.filter(function ( obj ) {
                    if(obj.title == centerHash){
                        return obj;
                    }
                    
                });    
                if(objf.length>0){
                    loc = objf
                    tipo =$scope.list[i].title
                    $.each(objf[0].items, function( index, value ) {
                        switch (value.title) {
                                case "Partenza":
                                    Partenza = value.value;
                                        break;
                                case "Altezza":
                                    Altezza = value.value;
                                        break;
                                case "Wikipedia":
                                    Wikipedia = value.url;
                                        break;
                                case "Descrizione":
                                    Descrizione = value.url;
                                        break;
                                case "Photo":
                                    PhotoUrl = value.url;
                                    PhotoFile = value.gpsFile;
                                        break;
                                case "GPS":
                                    GPSinfo = value.info;
                                    GPSFile = value.gpsFile;
                                        break;
                        }
                    });                    
                }
            }
            $scope.clear();
            
            $scope.master = {
                tipo:tipo, 
                Nome:loc[0].title, 
                Partenza: Partenza, 
                Altezza: Altezza, 
                Wikipedia: Wikipedia,
                Descrizione: Descrizione, 
                Photo:PhotoUrl,
                Photo:PhotoFile,
                GPSinfo:GPSinfo,
                GPSFile:GPSFile,
                Latitudine:loc[0].lat,
                Longitudine:loc[0].lng,
                Messaggio:loc[0].message
            };
            $scope.reset();
        }
        else {
            var coord = centerHash.split(":")
            $scope.mapCenter = 
                {
                lat: Number(coord[0]),
                lng: Number(coord[1]),
                zoom: Number(coord[2])
            }	
        }
	};
	//end centratura mappa
        
	//geocoding
	$scope.address =
			{
				name: "Milano"
			}	
		
	// layer track e profile e photo		
	var addLayer = function(url){
        var type = url.split(".")
            leafletData.getMap().then(function(map) {
                switch (type[1]) {
                    case "kml":
                        $scope[type[0]] = omnivore.kml(url).addTo(map);
                        initialize(url,$scope.mapCenter); //view profile
                        break;
                    case "gpx":
                        $scope[type[0]] = omnivore.gpx(url).addTo(map);
                            break;
                    case "csv":
                        $scope[type[0]] = omnivore.csv(url).addTo(map);
                            break;
                    case "wkt":
                        $scope[type[0]] = omnivore.wkt(url).addTo(map);
                            break;
                    case "topojson":
                        $scope[type[0]] = omnivore.topojson(url).addTo(map);
                            break;
                    case "geojson":
                        $scope[type[0]] = omnivore.geojson(url).addTo(map);
                            break;
                    case "txt":
                        $scope[type[0]] = omnivore.polyline(url).addTo(map);
                            break;
                }
            });				
	}
	
	var removeLayer = function(url){
		var type = url.split(".")
		leafletData.getMap().then(function(map) {
			map.removeLayer($scope[type[0]]);
			$('#map_canvas').html("").removeAttr( "style" )
			$('#elevation_chart').html("")
			mousemarker = null
		});	
	}
		
	$scope.viewTrack = function(chkInfo) {		
        if(chkInfo.indexOf(":gps/")>0){
            var chk = chkInfo.split(":")
            if($('input#'+ chk[0] +'.showGps').is(':checked'))
            {
                addLayer(chk[1])
            }
            else {
                removeLayer(chk[1])			
            }            
        }
        else if(chkInfo.indexOf(":photo/")>0){
            var chk = chkInfo.split(":")
            if($('input#'+ chk[0] +'.showPhoto').is(':checked'))
            {
                openPhoto(chk[1])
            }
            else {
                closePhoto();	
            }
        }                
	}
	// layer track e profile
	
	//providers
	angular.extend($scope, {
                layers: {
                    baselayers: {
											OpenMapSurfer: {
												name: 'OpenMapSurfer',
												type: 'xyz',
												url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
												layerOptions: {
													maxZoom: 20,
													variant: 'roads',
													attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
												},
												variants: {
													Roads: 'roads',
													AdminBounds: {
														options: {
															variant: 'adminb',
															maxZoom: 19
														}
													},
													Grayscale: {
														options: {
															variant: 'roadsg',
															maxZoom: 19
														}
													}
												}
											},
											OpenTopoMap: {
													name: 'OpenTopoMap',
													url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
													type: 'xyz'
											},
											mapbox_light: {
													name: 'Mapbox Light',
													url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
													type: 'xyz',
													layerOptions: {
															apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
															mapid: 'bufanuvols.lia22g09'
													}
											},
											mapbox_terrain: {
													name: 'Mapbox Terrain',
													url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
													type: 'xyz',
												layerOptions: {
													apikey: '',
													mapid: 'gdecil.',													
													attribution:
														'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
														'Map data {attribution.OpenStreetMap}',
													subdomains: 'abcd'
												}
											},
											osm: {
													name: 'OpenStreetMap',
													url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
													type: 'xyz'
											},
											osmBlackAndWhite: {
												name: 'osmBlackAndWhite',
												url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
												type: 'xyz',
												options: {
													maxZoom: 18,
													attribution:
														'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
												}
											},											
											osmDE: {
												name: 'osmDE',
												url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
												type: 'xyz',
												options: {
													maxZoom: 18,
													attribution:
														'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
												}
											},											
											osmDE: {
												name: 'osmDE',
												url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
												type: 'xyz',
												options: {
													maxZoom: 18,
													attribution:
														'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
												}
											},
											EsriWorldTopoMap: {
												name: 'Esri WorldTopoMap',
												type: 'xyz',
												url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
												options: {
													attribution:
														'{attribution.Esri} &mdash; ' +
														'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
												}
											},
											googleTerrain: {
                            name: 'Google Terrain',
                            layerType: 'TERRAIN',
                            type: 'google'
                        },
                        googleHybrid: {
	                        name: 'Google Hybrid',
	                        layerType: 'HYBRID',
	                        type: 'google'
	                    },
											googleRoadmap: {
													name: 'Google Streets',
													layerType: 'ROADMAP',
													type: 'google'
											}
                    },
                    overlays: {
                        wms: {
                            name: 'EEUU States (WMS)',
                            type: 'wms',
                            visible: false,
                            url: 'http://suite.opengeo.org/geoserver/usa/wms',
                            layerParams: {
                                layers: 'usa:states',
                                format: 'image/png',
                                transparent: true
                            }
                        },
												OpenSeaMap: {
													name: 'OpenSeaMap',
													type: 'wms',
													url: 'http://tiles.openseamaOpenSeaMapp.org/seamark/{z}/{x}/{y}.png',
													options: {
														attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
													}
												},
												OpenTopoMap: {
													name: 'OpenTopoMap',
													type: 'wms',
													url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
													options: {
														maxZoom: 16,
														attribution: 'Map data: {attribution.OpenStreetMap}, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
													}
												}
		
                    }									
                }		
	});
			
	$scope.searchGoogle = function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( {'address': $scope.address.name}, function(results,status) {
				if (status == google.maps.GeocoderStatus.OK) {
						$scope.mapCenter = 
							{
							lat: results[0].geometry.location.G,
							lng: results[0].geometry.location.K,
							zoom: 10
						}							
						$scope.mapMarkers = 
							[
								{
									"lat" :  results[0].geometry.location.G,
									"lng":results[0].geometry.location.K,
									"message": $scope.address.name,				
								}
							]
				} else {
						alert("Problema nella ricerca dell'indirizzo: " + status);
				}
    });	
	};
		
	$scope.collapseAll = function() {
		var scope = getRootNodesScope();
		scope.collapseAll();
	};

	$scope.expandAll = function() {
		var scope = getRootNodesScope();
		scope.expandAll();
	};
		
	//markers
	$scope.mapMarkers = 
		[
			{
				"lat" : 45.953333,
				"lng": 9.387509,
				"message": "<a target='_blank' href='https://it.wikipedia.org/wiki/Grigna_settentrionale'>Grignone</a>",				
			}
		]
    
    //load and save
    $scope.saveDataLocal = function(){
        var loc =       {
            "title": $scope.mymaps.Nome,
            "coord": $scope.mymaps.Latitudine  + ":" + $scope.mymaps.Longitudine + ":15",
            "lat": $scope.mymaps.Latitudine,
            "lng": $scope.mymaps.Longitudine,
            "message": "<a target='_blank' href='" + $scope.mymaps.Messaggio + "'>" + $scope.mymaps.Nome +"</a>",
            "viewCoord": "showCoord",
            "viewGps": "hide",
            "items": [

            ]
          }
        
         var Partenza = {
            "title": "Partenza",
            "value": $scope.mymaps.Partenza,
            "description": $scope.mymaps.Nome,
            "viewCoord": "hide",
            "viewGps": "hide",
            "items": []
          }
          var Altezza ={
            "title": "Altezza",
            "value": $scope.mymaps.Altezza,
            "description": $scope.mymaps.Nome,
            "viewCoord": "hide",
            "viewGps": "hide",
            "items": []
          }
          var Wikipedia ={
            "title": "Wikipedia",
            "description": $scope.mymaps.Nome,
            "url": $scope.mymaps.Wikipedia,
            "viewCoord": "hide",
            "viewGps": "hide",
            "items": []
          }
          var Descrizione= {
            "title": "Descrizione",
            "description": $scope.mymaps.Nome,
            "url": $scope.mymaps.Descrizione,
            "viewCoord": "hide",
            "viewGps": "hide",
            "items": []
          }
          var Photo = {
            "title": "Photo",
            "description": $scope.mymaps.Nome,
            "url": $scope.mymaps.Photo,
            "gpsFile": "photo/" + $scope.mymaps.Nome + ".json",
            "viewCoord": "hide",
            "viewGps": "showPhoto",
            "items": []
          }
          var GPS={
            "title": "GPS",
            "description": $scope.mymaps.Nome,
            "info" : $scope.mymaps.GPSinfo,
            "url": "",
            "gpsFile": "gps/" + $scope.mymaps.Nome + ".kml",
            "viewCoord": "hide",
            "viewGps": "showGps",
            "items": []
          }
        if($scope.mymaps.Partenza!=""){
            loc.items.push(Partenza)
        }
        if($scope.mymaps.Altezza!=""){
            loc.items.push(Altezza)
        }
        if($scope.mymaps.Wikipedia!=""){
            loc.items.push(Wikipedia)
        }
        if($scope.mymaps.Descrizione!=""){
            loc.items.push(Descrizione)
        }
        if($scope.mymaps.Photo!=""){
            loc.items.push(Photo)
        }
        if($scope.mymaps.GPSinfo!=""){
            loc.items.push(GPS)
        }
        switch ($scope.mymaps.tipo) {
            case "Cime":
                $scope.list[0].items.push(loc)
                    break;
            case "Rifugi":
                $scope.list[1].items.push(loc)
                    break;
            case "Alpeggi":
                $scope.list[2].items.push(loc)
                    break;
            case "Valli":
                $scope.list[3].items.push(loc)
                    break;
        }

        //alert($scope.mymaps.Nome)
        $('#tabs-2').html(JSON.stringify($scope.list))
    }
    $scope.loadDataAjax = function() {
			var json = (function () {
					var json = null;
					$.ajax({
							'async': false,
							'global': false,
							'url': "mymaps.json",
							'dataType': "json",
							'success': function (data) {
								var markers = []
								$scope.list = data;
								$.each(data, function( index, value ) {
									var lat = value.items.map(function(a) {return a.lat;});
									var lng = value.items.map(function(a) {return a.lng;});
									var message = value.items.map(function(a) {return a.message;});
									var title = value.items.map(function(a) {return a.title;});
									switch (value.title) {
											case "1. Rifugi":
													icon = "home";
													color = "red";
													break;
											case "2. Cime":
													icon = "star";
													color = "purple";
													break;
											case "3. Alpeggi":
													icon = "heart";
													color = "blue"
													break;
											case "4. Valli":
													icon = "cog";
													color = "green"
													break;
									}
									
									if(lat.length>0){
										$.each(lat, function( index1, value1 ) {
											var mark = {}
											mark.lat = Number(lat[index1])
											mark.lng = Number(lng[index1])									
											mark.message = message[index1]
											mark.icon = {
												type: 'awesomeMarker',
												icon: icon,						//tag, home, star, heart
												markerColor: color												
											},
											markers.push(mark);
										});
									}
								});
								
								$scope.mapMarkers = markers;
								$scope.$apply
							}
					});
					return json;
			})(); 			
		}
    
	//treeview
    var getRootNodesScope = function() {
        return angular.element(document.getElementById("tree-root")).scope();
    };

    $scope.collapseAll = function() {
      var scope = getRootNodesScope();
      scope.collapseAll();
    };

    $scope.loadDataAjax()
}])
	.filter('trust', function ($sce) {
			return function (val) {
					return $sce.trustAsHtml(val);
			};
	});
;