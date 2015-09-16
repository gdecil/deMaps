app
	.controller('MainController', ['$filter','$scope', 'places', '$location', function($filter, $scope, places, $location){
	
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
				lat: 45.953333,
				lng: 9.387509,
				zoom: 8
/*
				lat: 40.741934,
				lng: -74.004897,
				zoom: 17
*/
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
                            visible: false,
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
		$scope.loadDataAjax = function() {
			var json = (function () {
					var json = null;
					$.ajax({
							'async': false,
							'global': false,
							'url': "mymaps.txt",
							'dataType': "json",
							'success': function (data) {
								var markers = []
								$scope.list = data;
								$.each(data, function( index, value ) {
									var lat = value.items.map(function(a) {return a.lat;});
									var lng = value.items.map(function(a) {return a.lng;});
									var message = value.items.map(function(a) {return a.message;});
									var title = value.items.map(function(a) {return a.title;});
									
									if(lat.length>0){
										$.each(lat, function( index, value ) {
											var mark = {}
											mark.lat = Number(lat[index])
											mark.lng = Number(lng[index])
											mark.message = message[index]
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
/*
	$scope.list0 = 
			[
				{
					"id": 1,
					"title": "1. Rifugi",
					"class": "hide",
					"items": []
    		}, 
				{
					"id": 2,
					"title": "2. Cime",
					"class": "hide",
					"items": [
										{
											"id": 21,
											"title": "Grignone",											
											"coord" : "45.953333:9.387509:15",
											"lat" : 45.953333,
											"lng": 9.387509,
											"message": "<a target='_blank' href='https://it.wikipedia.org/wiki/Grigna_settentrionale'>Grignone</a>",
											"class": "showCoord",
											"items": 
												[
													{
														"id": 211,
														"title": "Partenza",
														"description": 'Grignone',
														"class": "hide",
														"items": []
													}, 
													{
														"id": 212,
														"title": "Altezza",
														"description": 'Grignone',
														"class": "hide",
														"items": []
													},
													{
														"id": 213,
														"title": "Wikipedia",
														"description": 'Grignone',
														"url": "https://it.wikipedia.org/wiki/Grigna_settentrionale",
														"class": "hide",
														"items": []
													}, 
													{
														"id": 213,
														"title": "Descrizione",
														"description": 'Grignone',
														"url": "https://workflowy.com/#/7c4964938b5b",
														"class": "hide",
														"items": []
													}, 
													{
														"id": 214,
														"title": "Photo",
														"description": 'Grignone',
														"url": "https://2.own",
														"class": "hide",
														"items": []
													}
												],
      							}, 
										{
											"id": 22,
											"title": "Monte Cazzola",
											"class": "hide",
											"items": []
										}
									],
    		}, 
				{
					"id": 3,
					"title": "3. Altopiani",
					"class": "hide",
					"items": []
				}, 
				{
					"id": 4,
					"title": "4. Valli",
					"class": "hide",
					"items": []
				}
			];

    $scope.selectedItem = {};

    $scope.options = {
    };

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function(scope) {
      scope.toggle();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.items.push({
        id: nodeData.id * 10 + nodeData.items.length,
        title: nodeData.title + '.' + (nodeData.items.length + 1),
        items: []
      });
    };


		
	var retrievedObject = localStorage.getItem('mymaps');
	$scope.list =	eval(retrievedObject)
*/
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
