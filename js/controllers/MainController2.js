app.controller('MainController', ['$scope', 'places', '$location', function($scope, places, $location){
	
	places.success(function(data){
        $scope.geodata = data;
     $scope.mapMarkers = geodataToMarkers($scope.geodata);

  });
	
	if($location.$$url!=""){
		var coord = $location.$$url.replace("?c=", "").split(":")
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
				lat: 40.741934,
				lng: -74.004897,
				zoom: 17
			}		
	}
	
	$scope.changeLocation = function(centerHash) {
		var coord = centerHash.split(":")
		$scope.mapCenter = 
			{
			lat: Number(coord[0]),
			lng: Number(coord[1]),
			zoom: Number(coord[2])
		}		
	}

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
                            visible: true,
                            url: 'http://suite.opengeo.org/geoserver/usa/wms',
                            layerParams: {
                                layers: 'usa:states',
                                format: 'image/png',
                                transparent: true
                            }
                        }
                    }									
                }		
	});

}]);
