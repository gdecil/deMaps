//"use strict";
app
    .controller('MainController', ['$filter', '$scope', 'places', '$location', 'leafletData', 'ngDialog', 'Upload', '$timeout', 'uiGridConstants', '$http', 'percorsiService', function($filter, $scope, places, $location, leafletData, ngDialog, Upload, $timeout, uiGridConstants, $http, percorsiService) {
        var markers = [];
        var markersSearch = [];
        var markersLocation = [];
        //tabs jquery-ui
        var $tabs = $('#tabs').tabs({
            selected: 0
        });
        var noConfirm = false;

        var definePercorso = function(){
          var percorso = {};
          percorso.waypointsInfo = [];
          percorso.waypointsGeo = [];      
          return percorso;    
        }
        //gestione routing
        elevationGain = 0;
        elevationLoss = 0;
        percorso = definePercorso();
        $scope.routingStart = function() {
            routingInit();
        };
        $scope.routingCalc = function() {
            routingCalc(routing);
        };
        waypointCount = 0;
        $scope.routingClear = function() {
          percorso = definePercorso();
          waypointCount = 0;
          $('#currentPercorso').html("");
          $("#routeData").html("");
          $scope.clearRoutData();
          mapRouting.remove();
          routingInit();
        };
        $scope.routingReport = function() {
            $scope.clearRoutData();
            routingReport();
        };
        $scope.routingDraw = function() {
            routing.draw(true);
        };
        $scope.routingDrawStop = function() {
            routing.draw(false);
        };
        $scope.routingEliminaPercorso = function() {
          $scope.currentPercorso = $('#currentPercorso')[0].innerText; 
          $scope.openDeletePercorso();
          $('#percorsoMod').html($('#currentPercorso')[0].innerText);         
        };
        $scope.routingSalvaPercorso = function(nameValue) {
          percorso.name = nameValue;
          percorsiService.addPercorso(percorso)
            .then(
              function( ret ) {
                if (ret.msg==="ok") {
                  angular.element($('#gridPercorsi')).scope().loadRemoteData();
                };
              }
            )
          ;
        };
        $scope.routingTest = function() {
            $scope.clearRoutData();
        };
        $scope.clearRoutData = function() {
            $('#ell').html("");
            $('#elg').html("");
            $('#eln').html("");
            $("#routeData ol li").remove();
        };
        $scope.toggleFiltering = function() {
            $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        };

        //gestione route dialog
        $scope.openDeletePercorso = function() {
            ngDialog.openConfirm({
                template: 'modalDialogDeletePercorso',
                className: 'ngdialog-theme-default'
            }).then(function() {
              angular.element($('#gridPercorsi')).scope().routingEliminaPercorso();
            }, function(reason) {
                console.log('Modal promise rejected. Reason: ', reason);
            });
        };

        $scope.openRouteName = function() {
            ngDialog.openConfirm({
                template: 'modalDialogNamePercorso',
                className: 'ngdialog-theme-default'
            }).then(function(nameValue) {
              $scope.routingSalvaPercorso(nameValue);
            }, function(reason) {
                console.log('Modal promise rejected. Reason: ', reason);
            });
        };
        //gestione authentication
        $scope.openConfirm = function() {
            ngDialog.openConfirm({
                template: 'modalDialogId',
                className: 'ngdialog-theme-default'
            }).then(function(userValue) {
                var chk = userValue.split(":");
                if (chk[0] == "1" && chk[1] == "1") {
                    $scope.statusManage.isManageDisabled = false;
                    //          $('#tabs').tabs({ enabled: [3,4] }); 
                    //          Sscope.apply;
                } else {
                    $scope.statusManage.isManageDisabled = true;
                }
                //        console.log('Modal promise resolved. Value: ', value);
            }, function(reason) {
                console.log('Modal promise rejected. Reason: ', reason);
            });
        };
        //dialog location
        $scope.openLocation = function() {
            ngDialog.openConfirm({
                template: 'modalDialogLocationId',
                className: 'ngdialog-theme-default'
            }).then(function(userValue) {}, 
              function(reason) {
                  console.log('Modal promise rejected. Reason: ', reason);
              }
            );
        };

        $scope.statusManage = {
            isManageDisabled: true
        };
        $("#tipoloc").prop('disabled', true);
        $("#nomeloc").prop('disabled', true);

        $scope.location_type = "";
        $scope.location = {
            type: '2. Cime'
        };

        //form
        $scope.master = {
            tipo: "Cime",
            Nome: "Grignone",
            Partenza: "Esino Lario m 1450",
            Altezza: "m 2540",
            Wikipedia: "https://it.wikipedia.org/wiki/Grigna_settentrionale",
            Descrizione: "https://workflowy.com/#/7c4964938b5b",
            Photo: "https://2.own",
            Latitudine: "45.953333",
            Longitudine: "9.387509",
            Messaggio: "https://it.wikipedia.org/wiki/Grigna_settentrionale"
        };
        $scope.reset = function() {
            $scope.mymaps = angular.copy($scope.master);
        };
        $scope.refreshTree = function() {
            $scope.loadDataAjax(mongoDbMaps);
        };
        $scope.refreshMap = function() {
            leafletData.getMap('mapMain').then(function(map) {
                map.invalidateSize();
            });
        };
        $scope.clear = function() {
            $scope.master = {
                tipo: "",
                Nome: "",
                Partenza: "",
                Altezza: "",
                Wikipedia: "",
                Descrizione: "",
                Photo: "",
                GPSinfo: "",
                GPSFile: "",
                Latitudine: "",
                Longitudine: "",
                Messaggio: ""
            };
            $scope.reset();
        };
        //form end

        //upload file
        $scope.uploadPic = function(file) {
            var locr = {
                "name": file.name
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/checkFile',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                if (response === true) {
                    alert("File already exists");
                } else {
                    file.upload = Upload.upload({
                        url: server + 'users/api/uploadFile',
                        data: {
                            file: file,
                            username: "test"
                        },
                    });

                    file.upload.then(function(response) {
                        $timeout(function() {
                            file.result = response.data;
                            $scope.master.GPS = "server/uploads/" + file.name;
                            $("#gpsloc").val("server/uploads/" + file.name);
                            $scope.apply;
                        });
                    }, function(response) {
                        if (response.status > 0)
                            $scope.errorMsg = response.status + ': ' + response.data;
                    }, function(evt) {
                        // Math.min is to fix IE which reports 200% sometimes
                        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                }
            });
        };
        var checkFile = function(fileName) {
            var locr = {
                "name": fileName
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/checkFile',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                alert(response);
            });
        };
        //upload file end

        //tree filter
        $scope.treeFilter = $filter('uiTreeFilter');

        $scope.availableFields = ['title', 'description'];
        $scope.supportedFields = ['title', 'description'];
        $scope.toggleSupport = function(propertyName) {
            return $scope.supportedFields.indexOf(propertyName) > -1 ?
                $scope.supportedFields.splice($scope.supportedFields.indexOf(propertyName), 1) :
                $scope.supportedFields.push(propertyName);
        };

        //centratura mappa form update
        if ($location.$$absUrl.indexOf("c=") > -1) {
            noConfirm = true;
            var c = $location.$$absUrl.split("?");
            var coord = c[1].replace("c=", "").split(":");
            $scope.mapCenter = {
                lat: Number(coord[0]),
                lng: Number(coord[1]),
                zoom: Number(coord[2])
            };
        } else {
            //Grigna parte tutto da lei
            $scope.mapCenter = {
                lat: 45.953333,
                lng: 9.387509,
                zoom: 8
            };
        }
        centerMap = function (lat,lng,zoom){
          mapRouting.setView(new L.LatLng(lat, lng), zoom);
        }
        //form update   
        $scope.changeLocation = function(centerHash) {
            if (centerHash.length == 2) {
                $scope.mapCenter = {
                    lat: Number(centerHash[1]),
                    lng: Number(centerHash[0]),
                    zoom: Number(14)
                };
                return;
            }


            var viewInfo = centerHash.split(",");
            Partenza = "";
            Altezza = "";
            Wikipedia = "";
            Descrizione = "";
            PhotoOwn = "";
            PhotoUrl = "";
            PhotoGeo = "";
            PhotoPicasa = "";
            PhotoFile = "";
            GPSinfo = "";
            GPSFile = "";

            var loc;
            for (var i = 0; i < $scope.list.length; i++) {
                var objf = $scope.list[i].items.filter(function(obj) {
                    if (obj.title == viewInfo[1]) {
                        return obj;
                    }

                });

                if (objf.length > 0) {
                    loc = objf;
                    tipo = $scope.list[i].title;
                    $.each(objf[0].items, function(index, value) {
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
                            case "PhotoOwncloud":
                                PhotoOwn = value.url;
                                break;
                            case "PhotoPicasa":
                                PhotoPicasa = value.url;
                                break;
                            case "PhotoGeoLocal":
                                if (value.viewGps != "showChk") {
                                    PhotoGeo = "N";
                                } else {
                                    PhotoGeo = "Y";
                                }
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
                tipo: tipo,
                Nome: loc[0].title,
                Partenza: Partenza,
                Altezza: Altezza,
                Wikipedia: Wikipedia,
                Descrizione: Descrizione,
                PhotoOwn: PhotoOwn,
                PhotoGeo: PhotoGeo,
                PhotoGeoPicasa: PhotoPicasa,
                GPSinfo: GPSinfo,
                GPS: GPSFile,
                Latitudine: loc[0].lat,
                Longitudine: loc[0].lng,
                Messaggio: loc[0].message
            };
            $scope.reset();
            var coord = viewInfo[0].split(":");
            $scope.mapCenter = {
                lat: Number(coord[0]),
                lng: Number(coord[1]),
                zoom: Number(coord[2])
            };
        };
        //end centratura mappa

        //geocoding
        $scope.address = {
            name: "Milano"
        };

        // layer track e profile e photo    
        var addLayer = function(url) {
            var type = url.split(".");
            //aggiunge il profilo in Profili
            addProfile(type[0] + ".gpx", $scope.mapCenter);

            //aggiunge il tracciato in Mappe
            leafletData.getMap('mapMain').then(function(map) {
                switch (type[1]) {
                    case "kml":
                        $scope[type[0]] = omnivore.kml(url).addTo(map);
                        //                        initialize(url,$scope.mapCenter); //view profile
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
        };

        var removeLayer = function(url) {
            var type = url.split(".");
            leafletData.getMap('mapMain').then(function(map) {
                //        var type1 = type[0].split("/")
                map.removeLayer($scope[type[0]]);
                mapProfile.remove();
                $('#map_profile').html("").removeAttr("style");
                $('#elevation_chart').html("");
                mousemarker = null;
            });
        };

        $scope.clearProfile = function() {
            $('input.showChk.GPS').prop('checked', false);
            $('#tabs-2 h3').html("");
            mapProfile.remove();
        };

        $scope.viewTrack = function(chkInfo) {
            var chk = chkInfo.split(":");
            if (chk[3] == "GPS") {
                if ($("input[id='" + chk[0] + "'].showChk.GPS").is(':checked')) {
                    $('input.showChk.GPS').prop('checked', false);
                    $("input[id='" + chk[0] + "'].showChk.GPS").prop('checked', true);
                    addLayer(chk[1]);
                } else {
                    //          $tabs.tabs( "option", "active", 0 ); 
                    removeLayer(chk[1]);
                }
            }
            if (chk.length == 5 && chk[4] == "PhotoPicasa") {
                if ($("input[id='" + chk[0] + "'].showChk.PhotoPicasa").is(':checked')) {
                    $tabs.tabs("option", "active", 2);
                    $('input.showChk.PhotoGeoLocal').prop('checked', false);
                    $('input.showChk.PhotoPicasa').prop('checked', false);
                    $("input[id='" + chk[0] + "'].showChk.PhotoPicasa").prop('checked', true);
                    openPhoto(chk[3], "picasa");
                } else {
                    $tabs.tabs("option", "active", 0);
                    closePhoto();
                }
            }
            if (chk.length == 4 && chk[3] == "PhotoGeoLocal") {
                if ($("input[id='" + chk[0] + "'].showChk.PhotoGeoLocal").is(':checked')) {
                    $tabs.tabs("option", "active", 2);
                    $('input.showChk.PhotoPicasa').prop('checked', false);
                    $('input.showChk.PhotoGeoLocal').prop('checked', false);
                    $("input[id='" + chk[0] + "'].showChk.PhotoGeoLocal").prop('checked', true);
                    openPhoto(chk[1], "local");
                } else {
                    $tabs.tabs("option", "active", 0);
                    closePhoto();
                }
            }
        };
        // end layer track e profile

        //providers
        angular.extend($scope, {
            events: {
                markers: {
                    enable: ['dragend']
                        //logic: 'emit'
                }
            },
            layers: {
                baselayers: {
                    OpenTopoMap: {
                        name: 'OpenTopoMap',
                        url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                        layerOptions: {
                            minZoom: 1,
                            maxZoom: 15,
                            detectRetina: true,
                            attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="https://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                        },
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
                    },
                    OpenMapSurfer: {
                        name: 'OpenMapSurfer',
                        type: 'xyz',
                        url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
                        layerOptions: {
                            maxZoom: 20,
                            variant: 'roads',
                            attribution: 'Imagery from <a href="https://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
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
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
                            mapid: 'bufanuvols.lia22g09',
                            attribution: 'Imagery from <a href="https://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
                                'Map data {attribution.OpenStreetMap}',
                        }
                    },
                    mapbox_terrain: {
                        name: 'Mapbox Terrain',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: '',
                            mapid: 'gdecil.',
                            attribution: 'Imagery from <a href="https://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
                                'Map data {attribution.OpenStreetMap}',
                            subdomains: 'abcd'
                        }
                    },
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        layerOptions: {
                            maxZoom: 18,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        },
                        type: 'xyz'
                    },
                    osmBlackAndWhite: {
                        name: 'osmBlackAndWhite',
                        url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 18,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        }
                    },
                    osmDE: {
                        name: 'osmDE',
                        url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 18,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        }
                    },
                    EsriWorldTopoMap: {
                        name: 'Esri WorldTopoMap',
                        type: 'xyz',
                        url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                        layerOptions: {
                            attribution: '{attribution.Esri} &mdash; ' +
                                'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                        }
                    }
                },
                overlays: {
                    wms: {
                        name: 'EEUU States (WMS)',
                        type: 'wms',
                        visible: false,
                        url: 'https://suite.opengeo.org/geoserver/usa/wms',
                        layerParams: {
                            layers: 'usa:states',
                            format: 'image/png',
                            transparent: true
                        }
                    },
                    OpenSeaMap: {
                        name: 'OpenSeaMap',
                        type: 'wms',
                        url: 'https://tiles.openseamaOpenSeaMapp.org/seamark/{z}/{x}/{y}.png',
                        layerOptions: {
                            attribution: 'Map data: &copy; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
                        }
                    },
                    OpenTopoMap: {
                        name: 'OpenTopoMap',
                        type: 'wms',
                        url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                        layerOptions: {
                            maxZoom: 16,
                            attribution: 'Map data: {attribution.OpenStreetMap}, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                        }
                    }

                }
            }
        });

        $scope.searchGoogle = function() {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': $scope.address.name
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $scope.mapCenter = {
                        lat: results[0].geometry.location.G,
                        lng: results[0].geometry.location.K,
                        zoom: 10
                    };
                    $scope.mapMarkers = [{
                        "lat": results[0].geometry.location.G,
                        "lng": results[0].geometry.location.K,
                        "message": $scope.address.name,
                    }];
                } else {
                    alert("Problema nella ricerca dell'indirizzo: " + status);
                }
            });
        };

        //photon name search
        $scope.search = function() {
            $("#tree-root-search .angular-ui-tree-handle").show();
            $scope.loadSearch('https://photon.komoot.de/api/?q=' + $scope.address.name);
            $scope.$apply;
        };

        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            $scope.mapCenter.lat = $scope.mapMarkers[args.markerName].lat;
            $scope.mapCenter.lng = $scope.mapMarkers[args.markerName].lng;
        });

        $scope.addMarker = function() {
            markersAdd = [];
            var mark = {};
            mark.lat = $scope.mapCenter.lat;
            mark.lng = $scope.mapCenter.lng;
            mark.message = "";
            mark.draggable = true;
            mark.icon = {
                    type: 'awesomeMarker',
                    icon: "default", //tag, home, star, heart
                    markerColor: "black"
                },
                markersAdd.push(mark);

            $scope.mapMarkers = markersLocation.concat(markersAdd);
            $scope.$apply;

        };

        $scope.remMarker = function() {};

        $scope.clearMarker = function() {
            //      angular-ui-tree-empty
            $scope.mapMarkers = markersLocation;
            $scope.listSearch = [{
                    "title": "",
                    "description": "",
                    "viewCoord": "hide",
                    "viewGps": "hide",
                    "items": []
                }

            ];
            //      $scope.listSearch = []
            $("#tree-root-search .angular-ui-tree-handle").hide();
            $scope.$apply;
        };

        $scope.collapseAll = function() {
            var scope = getRootNodesScope();
            scope.collapseAll();
        };

        $scope.expandAll = function() {
            var scope = getRootNodesScope();
            scope.expandAll();
        };
        $scope.viewDataMongo = function() {
            the.editor.setValue(JSON.stringify($scope.list, null, 2));
            beautify();
        };

        $scope.restoreBackup = function() {
            var backup = eval(the.editor.getValue());
            var locr = {
                "backup": backup
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/restore',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                // Check for successful (blank) response
                if (response.msg === 'File Restored') {
                    alert("Backup Restored");
                    $scope.loadDataAjax(mongoDbMaps);
                    $scope.collapseAll();
                    $scope.$apply;
                } else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        };

        $scope.createDbMongo = function() {
            users.insert({
                name: 'Tobi',
                bigdata: {}
            });

            collection.insert(document, {
                w: 1
            }, function(err, records) {
                console.log("Record added as " + records[0]._id);
            });
        };

        $scope.updateDataMongo = function() {
            var loc = getLocation();
            switch ($scope.mymaps.tipo) {
                case "2. Cime":
                    updateLocationMongo($scope.mymaps.Nome, 2, loc);
                    break;
                case "1. Rifugi":
                    updateLocationMongo($scope.mymaps.Nome, 1, loc);
                    break;
                case "3. Alpeggi":
                    updateLocationMongo($scope.mymaps.Nome, 3, loc);
                    break;
                case "4. Valli":
                    updateLocationMongo($scope.mymaps.Nome, 4, loc);
                    break;
            }
            $scope.collapseAll();
        };

        $scope.deleteDataMongo = function() {
            switch ($scope.mymaps.tipo) {
                case "2. Cime":
                    deleteLocationMongo($scope.mymaps.Nome, 2);
                    break;
                case "1. Rifugi":
                    deleteLocationMongo($scope.mymaps.Nome, 1);
                    break;
                case "3. Alpeggi":
                    deleteLocationMongo($scope.mymaps.Nome, 3);
                    break;
                case "4. Valli":
                    deleteLocationMongo($scope.mymaps.Nome, 4);
                    break;
            }

            $scope.loadDataAjax(mongoDbMaps);
        };

        var deleteLocationMongo = function(loc, root) {
            var locr = {
                "loc": loc,
                "root": root
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/removelocation',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    $scope.loadDataAjax(mongoDbMaps);
                    $scope.$apply;
                } else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        };

        var updateLocationMongo = function(loc, root, locObj) {
            var locr = {
                "loc": loc,
                "root": root
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/removelocation',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                saveToMongo(locObj, root);
                // Check for successful (blank) response
                if (response.msg === '') {

                } else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        };

        $scope.addToMongoDb = function() {
            var loc = getLocationMinimal();
            switch ($scope.location.type) {
                case "2. Cime":
                    saveToMongo(loc, 2, true);
                    break;
                case "1. Rifugi":
                    saveToMongo(loc, 1, true);
                    break;
                case "3. Alpeggi":
                    saveToMongo(loc, 3, true);
                    break;
                case "4. Valli":
                    saveToMongo(loc, 4, true);
                    break;
            }
            $scope.collapseAll();
        };

        $scope.saveDataMongo = function() {
            if (checkExistLocation($scope.mymaps.Nome)) {
                return;
            }
            var loc = getLocation();
            switch ($scope.mymaps.tipo) {
                case "2. Cime":
                    saveToMongo(loc, 2, true);
                    break;
                case "1. Rifugi":
                    saveToMongo(loc, 1, true);
                    break;
                case "3. Alpeggi":
                    saveToMongo(loc, 3, true);
                    break;
                case "4. Valli":
                    saveToMongo(loc, 4, true);
                    break;
            }
            $scope.collapseAll();
        };

        var saveToMongo = function(loc, root, flagIns) {
            var locr = {
                "loc": loc,
                "root": root
            };
            $.ajax({
                type: 'POST',
                data: JSON.stringify(locr),
                url: server + 'users/addlocation',
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function(response) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    if (flagIns) {
                        alert("Location added");
                    } else {
                        alert("Location updated");
                    }

                    $scope.loadDataAjax(mongoDbMaps);
                    $scope.collapseAll();
                    $scope.$apply;
                } else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        };

        $scope.saveDataLocal = function() {
            if (checkExistLocation($scope.mymaps.Nome)) {
                return;
            }
            var loc = getLocation();
            switch ($scope.mymaps.tipo) {
                case "2. Cime":
                    $scope.list[1].items.push(loc);
                    break;
                case "1. Rifugi":
                    $scope.list[0].items.push(loc);
                    break;
                case "3. Alpeggi":
                    $scope.list[2].items.push(loc);
                    break;
                case "4. Valli":
                    $scope.list[3].items.push(loc);
                    break;
            }

            //alert($scope.mymaps.Nome)
            $('#tabs-2').html(JSON.stringify($scope.list));
        };

        $scope.updateDataLocal = function() {
            deleteLocation($scope.mymaps.Nome);
            $scope.saveDataLocal();
        };

        $scope.deleteDataLocal = function() {
            deleteLocation($scope.mymaps.Nome);
            $('#tabs-2').html(JSON.stringify($scope.list));
        };

        $scope.openTree = function() {
            var usersid = $(this).attr("id");
            alert(userid);
            //post code
        };

        $scope.loadDataAjax = function(url) {
            var json = (function() {
                var json = null;
                $.ajax({
                    'async': false,
                    'global': false,
                    'url': url,
                    'dataType': "json",
                    'success': function(data) {
                        $scope.list = [];
                        markersLocation = [];
                        markerPopup = [];
                        $scope.$apply;
                        $scope.list = data;
                        $scope.$apply;
                        $.each(data, function(index, value) {

                            var lat = value.items.map(function(a) {
                                return a.lat;
                            });
                            var lng = value.items.map(function(a) {
                                return a.lng;
                            });
                            var message = value.items.map(function(a) {
                                return a.message;
                            });
                            var title = value.items.map(function(a) {
                                return a.title;
                            });
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
                                    color = "blue";
                                    break;
                                case "4. Valli":
                                    icon = "cog";
                                    color = "green";
                                    break;
                            }

                            if (lat.length > 0) {
                                $.each(lat, function(index1, value1) {
                                    var mark = {};
                                    //                  mark.group = 'italy' usato per clusterizzare
                                    mark.lat = Number(lat[index1]);
                                    mark.title = title[index1];
                                    mark.lng = Number(lng[index1]);
                                    mark.message = message[index1];
                                    mark.icon = {
                                            type: 'awesomeMarker',
                                            icon: icon, //tag, home, star, heart
                                            markerColor: color
                                        },
                                        markersLocation.push(mark);
                                    markerPopup.push(message[index1]);
                                });
                            }
                        });

                        //            $scope.mapMarkers = markersLocation;
                        $scope.$apply;
                        createPopup(markersLocation);
                    }
                });
                return json;
            })();
        };

        var createPopup = function(markerPopup) {
            $.each(markerPopup, function(index1, v) {
                //        showPopup(index1,v.message, v.lat, v.lng)
                leafletData.getMap('mapMain').then(function(map) {
                    var awMarker = L.AwesomeMarkers.icon({
                        icon: v.icon.icon,
                        markerColor: v.icon.markerColor
                    });
                    if (v.title !== undefined) {
                        var title = v.title.replace(/ /g, '').replace(/\'/g, '_');

                        var mess = v.message + '<br><a href="" onclick="selectTree(\'' + v.title.replace(/\'/g, '_') + '\')">select</a>';
                        mess = mess + '<br><a href="" onclick="openLocation(\'' + v.title.replace(/\'/g, '_') + '\')">open</a>';
                        //          var mess = v.message + '<br><a ng-click="openTree(\'' + title +'\')" href="javascript:void(0)" class="treeOpen" id="' + title + '">Open</a>'
                        //          var mess = v.message + '<br><a href="" class="btn btn-primary btn-xs ng-scope" ng-click="clearMarker()">open</a>'
                        L.marker([v.lat, v.lng], {
                            icon: awMarker
                        }).bindPopup(mess).addTo(map);
                    }
                    //        marker.bindPopup(content).openPopup();
                });

            });
        };

        $scope.loadSearch = function(url) {
            var json = (function() {
                var json = null;
                $.ajax({
                    'async': false,
                    'global': false,
                    'url': url,
                    'dataType': "json",
                    'success': function(data) {
                        markersSearch = [];
                        $scope.mapMarkers = [];
                        $.each(data.features, function(index1, value1) {
                            var mark = {};
                            mark.lat = Number(value1.geometry.coordinates[1]);
                            mark.lng = Number(value1.geometry.coordinates[0]);
                            mark.message = value1.properties.name + " " + value1.properties.osm_value;
                            mark.icon = {
                                    type: 'awesomeMarker',
                                    icon: "tag", //tag, home, star, heart
                                    markerColor: "blue"
                                },
                                markersSearch.push(mark);
                        });

                        $scope.listSearch = data.features;
                        $scope.mapMarkers = markersLocation.concat(markersSearch);
                        $scope.$apply;
                    }
                });
                return json;
            })();
        };

        $scope.loadTestAjax = function() {
            var json = (function() {
                var json = null;
                $.ajax({
                    'async': false,
                    'global': false,
                    'url': "mytest.json",
                    'dataType': "json",
                    'success': function(data) {
                        //var markers = []
                        $.each(data.features, function(index1, value1) {
                            var mark = {};
                            mark.lat = Number(value1.geometry.coordinates[1]);
                            mark.lng = Number(value1.geometry.coordinates[0]);
                            mark.message = value1.properties.name;
                            mark.icon = {
                                    type: 'awesomeMarker',
                                    icon: "tag", //tag, home, star, heart
                                    markerColor: "blue"
                                },
                                markers.push(mark);
                        });

                        $scope.listSearch = data.features;
                        $scope.mapMarkers = markers;
                        $scope.$apply;
                    }
                });
                return json;
            })();
        };

        //treeview
        var getRootNodesScope = function() {
            return angular.element(document.getElementById("tree-root")).scope();
        };

        $scope.collapseAll = function() {
            var scope = getRootNodesScope();
            scope.collapseAll();
        };

        $scope.loadDataAjax(mongoDbMaps);

        var getLocation = function() {
            var href;

            if ($scope.mymaps.Wikipedia !== "") {
                href = $scope.mymaps.Wikipedia;
            } else {
                href = $scope.mymaps.Descrizione;
            }
            var loc = {
                "title": $scope.mymaps.Nome,
                "coord": $scope.mymaps.Latitudine + ":" + $scope.mymaps.Longitudine + ":15",
                "lat": $scope.mymaps.Latitudine,
                "lng": $scope.mymaps.Longitudine,
                "message": "<a target='_blank' href='" + href + "'>" + $scope.mymaps.Nome + "</a>",
                "viewCoord": "showCoord",
                "viewGps": "hide",
                "items": [

                ]
            };

            var Partenza = {
                "title": "Partenza",
                "value": $scope.mymaps.Partenza,
                "description": $scope.mymaps.Nome,
                "viewCoord": "hide",
                "viewGps": "hide",
                "items": []
            };

            var Altezza = {
                "title": "Altezza",
                "value": $scope.mymaps.Altezza,
                "description": $scope.mymaps.Nome,
                "viewCoord": "hide",
                "viewGps": "hide",
                "items": []
            };

            var Wikipedia = {
                "title": "Wikipedia",
                "description": $scope.mymaps.Nome,
                "url": $scope.mymaps.Wikipedia,
                "viewCoord": "hide",
                "viewGps": "hide",
                "items": []
            };

            var Descrizione = {
                "title": "Descrizione",
                "description": $scope.mymaps.Nome,
                "url": $scope.mymaps.Descrizione,
                "viewCoord": "hide",
                "viewGps": "hide",
                "items": []
            };

            if ($scope.mymaps.PhotoOwn !== "") {
                var Photo = {
                    "title": "PhotoOwncloud",
                    "description": $scope.mymaps.Nome,
                    "url": $scope.mymaps.PhotoOwn,
                    "gpsFile": "",
                    "viewCoord": "hide",
                    "viewGps": "hide", //gestisce il check box
                    "items": []
                };
                loc.items.push(Photo);
            }
            if ($scope.mymaps.PhotoGeoPicasa !== "") {
                var Photo = {
                    "title": "PhotoPicasa",
                    "description": $scope.mymaps.Nome,
                    "url": $scope.mymaps.PhotoGeoPicasa,
                    "gpsFile": "",
                    "viewCoord": "hide",
                    "viewGps": "showChk", //gestisce il check box
                    "items": []
                };
                loc.items.push(Photo)
            }
            if ($scope.mymaps.PhotoGeo !== "") {
                var Photo = {
                    "title": "PhotoGeoLocal",
                    "description": $scope.mymaps.Nome,
                    "url": "",
                    "gpsFile": "photo/" + $scope.mymaps.Nome + ".json",
                    "viewCoord": "hide",
                    "viewGps": "showChk", //gestisce il check box
                    "items": []
                };
                loc.items.push(Photo);
            }


            var GPS = {
                "title": "GPS",
                "description": $scope.mymaps.Nome,
                "info": $scope.mymaps.GPSinfo,
                "url": "",
                "gpsFile": $scope.mymaps.GPS,
                "viewCoord": "hide",
                "viewGps": "hide",
                "items": []
            };

            if (typeof $scope.mymaps.Partenza !== "undefined" && $scope.mymaps.Partenza !== "") {
                loc.items.push(Partenza);
            }
            if (typeof $scope.mymaps.Altezza !== undefined && $scope.mymaps.Altezza !== "") {
                loc.items.push(Altezza);
            }
            if (typeof $scope.mymaps.Wikipedia !== undefined && $scope.mymaps.Wikipedia !== "") {
                loc.items.push(Wikipedia);
            }
            if (typeof $scope.mymaps.Descrizione !== undefined && $scope.mymaps.Descrizione !== "") {
                loc.items.push(Descrizione);
            }
            var addPhoto = "N";
            if (typeof $scope.mymaps.PhotoOwn !== undefined && $scope.mymaps.PhotoOwn !== "") {
                addPhoto = "Y";
            };

            if (typeof $scope.mymaps.GPS !== undefined && $scope.mymaps.GPS !== "") {
                GPS.viewGps = "showChk";
                loc.items.push(GPS);
            }

            return loc;
        };

        var getLocationMinimal = function() {
            var loc = {
                "title": $scope.address.name,
                "coord": $scope.mapCenter.lat + ":" + $scope.mapCenter.lng + ":15",
                "lat": $scope.mapCenter.lat,
                "lng": $scope.mapCenter.lng,
                "message": "<a target='_blank' href=''>" + $scope.address.name + "</a>",
                "viewCoord": "showCoord",
                "viewGps": "hide",
                "items": [

                ]
            };

            return loc;
        };

        var checkExistLocation = function(location) {
            for (var i = 0; i < $scope.list.length; i++) {
                var objf = $scope.list[i].items.filter(function(obj) {
                    if (obj.title == location) {
                        return obj;
                    }
                });
                if (objf.length > 0) {
                    alert(objf[0].title + " alredy exist");
                    return true;
                }
            }
            return false;
        };

        var deleteLocation = function(location) {
            for (var i = 0; i < $scope.list.length; i++) {
                var objf = $scope.list[i].items.filter(function(obj) {
                    if (obj.title == location) {
                        return obj;
                    }
                });
                if (objf.length > 0) {
                    var index = $scope.list[i].items.indexOf(objf[0]);
                    if (index > -1) {
                        $scope.list[i].items.splice(index, 1);
                        return
                    }
                }
            }
        };

        if (noConfirm == false) {
            $scope.openConfirm();
        } else {
            $scope.statusManage.isManageDisabled = true;
        }
    }])
    .controller('gridRoutCtrl', ['$scope', 'uiGridConstants', 'percorsiService' , function ($scope, uiGridConstants, percorsiService) {
      function rowTemplate() {
        return '<div ng-click="grid.appScope.rowDblClick(row)" >' +
                     '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                     '</div>';
      }

      $scope.rowDblClick = function( row) {
        $('#currentPercorso').html(row.entity.name)
        viewPercorso(row.entity);
      };    

      $scope.gridOptions = { 
        enableFiltering: true,
        rowTemplate: rowTemplate(),
        enableRowSelection: true, 
        enableRowHeaderSelection: false 
      };

      $scope.gridOptions.columnDefs = [
        { name: 'name'}
      ];

      $scope.gridOptions.multiSelect = false;
      $scope.gridOptions.modifierKeysToMultiSelect = false;
      $scope.gridOptions.noUnselect = true;
      $scope.gridOptions.onRegisterApi = function( gridApi ) {
        $scope.gridApi = gridApi;
      };
      function applyRemoteData( newPercorsi ) {
          $scope.gridOptions.data = newPercorsi;
      };
      $scope.loadRemoteData = function() {
        percorsiService.getPercorsi()
          .then(
            function( percorsi ) {
              percorsiFound = true;
              applyRemoteData( percorsi );
            }
          )
        ;
      };
      $scope.routingEliminaPercorso = function() {
        var selRow = $scope.gridApi.selection.getSelectedRows();
        percorsiService.delPercorso(selRow[0].name)
          .then(
            function( ret ) {
              if (ret==="ok") {
                $scope.loadRemoteData();
              };
            }
          )
        ;
      };
      $scope.loadRemoteData();
    }])
    .filter('trust', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })
    .filter('mapGender', function() {
        var genderHash = {
            1: 'male',
            2: 'female'
        };

        return function(input) {
            if (!input) {
                return '';
            } else {
                return genderHash[input];
            }
        };
    });
