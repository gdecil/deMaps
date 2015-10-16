app
  .controller('MainController', ['$filter','$scope','places', '$location', 'leafletData' , function($filter, $scope,  places, $location, leafletData, $uibModal, $log){
    var server = "http://127.0.0.1:3000/"
    var mongoDbMaps = "http://127.0.0.1:3000/users/maps"
    var markers = []
    var markersSearch = []
    var markersLocation = []


    $scope.animationsEnabled = true;
    $scope.open = function (size) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        keyboard: false,
        backdrop: false,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };    


    $("#tipoloc").prop('disabled', true);
    $("#nomeloc").prop('disabled', true);

    $scope.location_type= "";
    $scope.location = {
      type: '2. Cime'
    };      
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
    $scope.refreshTree = function() {
      $scope.loadDataAjax(mongoDbMaps)
    }

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

    //centratura mappa form update
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
      //Grigna parte tutto da lei
      $scope.mapCenter = 
        {
        lat: 45.953333,
        lng: 9.387509,
        zoom: 8
      }		
    }
    //form update   
    $scope.changeLocation = function(centerHash) {
      if(centerHash.length == 2){
        $scope.mapCenter = 
          {
          lat: Number(centerHash[1]),
          lng: Number(centerHash[0]),
          zoom: Number(14)
        }	 
        return
      }


      var viewInfo = centerHash.split(",")
      Partenza = "";
      Altezza = "";
      Wikipedia = "";
      Descrizione = "";
      PhotoOwn = "";
      PhotoUrl = "";
      PhotoGeo = "";
      PhotoFile = "";
      GPSinfo = "";
      GPSFile = "";

      var loc
      for (var i=0; i < $scope.list.length; i++) {
        var objf = $scope.list[i].items.filter(function ( obj ) {
          if(obj.title == viewInfo[1]){
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
                PhotoOwn = value.url;
                if(value.viewGps=="noshowGps"){
                  PhotoGeo = "N";                                      
                }
                else
                {
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
        tipo:tipo, 
        Nome:loc[0].title, 
        Partenza: Partenza, 
        Altezza: Altezza, 
        Wikipedia: Wikipedia,
        Descrizione: Descrizione, 
        PhotoOwn:PhotoOwn,
        PhotoGeo:PhotoGeo,
        GPSinfo:GPSinfo,
        GPS:GPSFile,
        Latitudine:loc[0].lat,
        Longitudine:loc[0].lng,
        Messaggio:loc[0].message
      };
      $scope.reset();      
      var coord = viewInfo[0].split(":")
      $scope.mapCenter = 
        {
        lat: Number(coord[0]),
        lng: Number(coord[1]),
        zoom: Number(coord[2])
      }	                
    }
    //end centratura mappa

    //geocoding
    $scope.address =
      {
      name: "Milano"
    }	

    // layer track e profile e photo		
    var addLayer = function(url){
      var type = url.split(".")
      addProfile(type[0] + ".gpx",$scope.mapCenter);
      leafletData.getMap().then(function(map) {
        switch (type[1]) {
          case "kml":
            $scope[type[0]] = omnivore.kml("gps\\" + url).addTo(map);
            //                        initialize(url,$scope.mapCenter); //view profile
            break;
          case "gpx":
            $scope[type[0]] = omnivore.gpx("gps\\"+url).addTo(map);
            break;
          case "csv":
            $scope[type[0]] = omnivore.csv("gps\\"+url).addTo(map);
            break;
          case "wkt":
            $scope[type[0]] = omnivore.wkt("gps\\"+url).addTo(map);
            break;
          case "topojson":
            $scope[type[0]] = omnivore.topojson("gps\\"+url).addTo(map);
            break;
          case "geojson":
            $scope[type[0]] = omnivore.geojson("gps\\"+url).addTo(map);
            break;
          case "txt":
            $scope[type[0]] = omnivore.polyline("gps\\"+url).addTo(map);
            break;
        }
      });				
    }

    var removeLayer = function(url){
      var type = url.split(".")
      leafletData.getMap().then(function(map) {
        map.removeLayer($scope[type[0]]);
        mapProfile.remove()
        $('#map_profile').html("").removeAttr( "style" )
        $('#elevation_chart').html("")
        mousemarker = null
      });	
    }

    $scope.viewTrack = function(chkInfo) {		
      var chk = chkInfo.split(":")
      if(chk[2]=="GPS"){
        if($('input#'+ chk[0] +'.showChk.GPS').is(':checked'))
        {
          addLayer( chk[1])
        }
        else {
          removeLayer(chk[1])			
        }                          
      }
      if(chk[2]=="Photo"){
        if($('input#'+ chk[0] +'.showChk.Photo').is(':checked'))
        {
          openPhoto("photo\\" + chk[1])
        }
        else {
          closePhoto();	
        }              
      }

      //      if(chkInfo.indexOf(":gps/")>0){
      //        }
      //        else if(chkInfo.indexOf(":photo/")>0){
      //            var chk = chkInfo.split(":")
      //        }                
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

    $scope.search = function(){
      $scope.loadSearch('http://photon.komoot.de/api/?q=' + $scope.address.name)        
    }

    $scope.clearMarker = function(){
      $scope.mapMarkers = markersLocation
      $scope.listSearch = [
        {
          "title": "",
          "description": "",
          "viewCoord": "hide",
          "viewGps": "hide",
          "items": []
        }

      ]
    }

    $scope.collapseAll = function() {
      var scope = getRootNodesScope();
      scope.collapseAll();
    };

    $scope.expandAll = function() {
      var scope = getRootNodesScope();
      scope.expandAll();
    };

    //load and save
    $scope.viewDataMongo = function(){
      //      $('#tabs-5').html(JSON.stringify($scope.list,null,2))
      the.editor.setValue(JSON.stringify($scope.list,null,2))
      //$('#source').val($scope.list)
      beautify();
    }

    $scope.createDbMongo = function(){
      users.insert({ name: 'Tobi', bigdata: {} });

      collection.insert(document, {w: 1}, function(err, records){
        console.log("Record added as "+records[0]._id);
      });
    }

    $scope.updateDataMongo = function(){
      var loc = getLocation();
      switch ($scope.mymaps.tipo) {
        case "2. Cime":
          deleteLocationMongo($scope.mymaps.Nome, 2)
          saveToMongo(loc, 2)
          break;
        case "1. Rifugi":
          deleteLocationMongo($scope.mymaps.Nome, 1)
          saveToMongo(loc, 1)
          break;
        case "3. Alpeggi":
          deleteLocationMongo($scope.mymaps.Nome, 3)
          saveToMongo(loc, 3)
          break;
        case "4. Valli":
          deleteLocationMongo($scope.mymaps.Nome, 4)
          saveToMongo(loc, 4)
          break;
      }
      $scope.collapseAll()
    }

    $scope.deleteDataMongo = function(){
      switch ($scope.mymaps.tipo) {
        case "2. Cime":
          deleteLocationMongo($scope.mymaps.Nome, 2)
          break;
        case "1. Rifugi":
          deleteLocationMongo($scope.mymaps.Nome, 1)
          break;
        case "3. Alpeggi":
          deleteLocationMongo($scope.mymaps.Nome, 3)
          break;
        case "4. Valli":
          deleteLocationMongo($scope.mymaps.Nome, 4)
          break;
      }

      $scope.loadDataAjax(mongoDbMaps)
    }

    var deleteLocationMongo = function(loc, root){
      var locr = {
        "loc" : loc,
        "root" : root
      }
      $.ajax({
        type: 'POST',
        data: JSON.stringify(locr),
        url: server + 'users/removelocation',
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
          $scope.loadDataAjax(mongoDbMaps)
          $scope.$apply
        }
        else {
          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);

        }
      });      
    }

    $scope.addToMongoDb= function(){
      var loc = getLocationMinimal();
      switch ($scope.location.type) {
        case "2. Cime":
          saveToMongo(loc, 2,true)
          break;
        case "1. Rifugi":
          saveToMongo(loc, 1,true)
          break;
        case "3. Alpeggi":
          saveToMongo(loc, 3,true)
          break;
        case "4. Valli":
          saveToMongo(loc, 4,true)
          break;
      }
      $scope.collapseAll()      
    }

    $scope.saveDataMongo = function(){
      if (checkExistLocation($scope.mymaps.Nome)){return}
      var loc = getLocation();
      switch ($scope.mymaps.tipo) {
        case "2. Cime":
          saveToMongo(loc, 2,true)
          break;
        case "1. Rifugi":
          saveToMongo(loc, 1,true)
          break;
        case "3. Alpeggi":
          saveToMongo(loc, 3,true)
          break;
        case "4. Valli":
          saveToMongo(loc, 4,true)
          break;
      }
      $scope.collapseAll()
    }

    var saveToMongo = function(loc, root, flagIns){
      var locr = {
        "loc" : loc,
        "root" : root
      }
      $.ajax({
        type: 'POST',
        data: JSON.stringify(locr),
        url: server + 'users/addlocation',
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
          if(flagIns){alert("Location added")}
          else{alert("Location updated")}

          $scope.loadDataAjax(mongoDbMaps)
          $scope.collapseAll()
          $scope.$apply
        }
        else {
          // If something goes wrong, alert the error message that our service returned
          alert('Error: ' + response.msg);

        }
      });      
    }

    $scope.saveDataLocal = function(){
      if (checkExistLocation($scope.mymaps.Nome)){return}
      var loc = getLocation();
      switch ($scope.mymaps.tipo) {
        case "2. Cime":
          $scope.list[1].items.push(loc)
          break;
        case "1. Rifugi":
          $scope.list[0].items.push(loc)
          break;
        case "3. Alpeggi":
          $scope.list[2].items.push(loc)
          break;
        case "4. Valli":
          $scope.list[3].items.push(loc)
          break;
      }

      //alert($scope.mymaps.Nome)
      $('#tabs-2').html(JSON.stringify($scope.list))
    }

    $scope.updateDataLocal = function(){
      deleteLocation($scope.mymaps.Nome);     
      $scope.saveDataLocal()
    }

    $scope.deleteDataLocal = function(){
      deleteLocation($scope.mymaps.Nome)
      $('#tabs-2').html(JSON.stringify($scope.list))
    }

    $scope.loadDataAjax = function(url) {
      var json = (function () {
        var json = null;
        $.ajax({
          'async': false,
          'global': false,
          'url': url,
          'dataType': "json",
          'success': function (data) {
            $scope.list = []
            markersLocation = []
            $scope.$apply ;
            $scope.list = data;
            $scope.$apply ;
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
                  mark.group = 'italy'
                  mark.lat = Number(lat[index1])
                  mark.lng = Number(lng[index1])									
                  mark.message = message[index1]
                  mark.icon = {
                    type: 'awesomeMarker',
                    icon: icon,						//tag, home, star, heart
                    markerColor: color												
                  },
                    markersLocation.push(mark);
                });
              }
            });

            $scope.mapMarkers = markersLocation;
            $scope.$apply
          }
        });
        return json;
      })(); 			
    }

    $scope.loadSearch = function(url) {
      var json = (function () {
        var json = null;
        $.ajax({
          'async': false,
          'global': false,
          'url': url,
          'dataType': "json",
          'success': function (data) {
            markersSearch = []
            $scope.mapMarkers = []
            $.each(data.features, function( index1, value1 ) {
              var mark = {}
              mark.lat = Number(value1.geometry.coordinates[1])
              mark.lng = Number(value1.geometry.coordinates[0])									
              mark.message = value1.properties.name + " " + value1.properties.osm_value
              mark.icon = {
                type: 'awesomeMarker',
                icon: "tag",						//tag, home, star, heart
                markerColor: "blue"												
              },
                markersSearch.push(mark);
            });

            $scope.listSearch = data.features;
            $scope.mapMarkers = markersLocation.concat(markersSearch);
            $scope.$apply
          }
        });
        return json;
      })(); 			
    }

    $scope.loadTestAjax = function() {
      var json = (function () {
        var json = null;
        $.ajax({
          'async': false,
          'global': false,
          'url': "mytest.json",
          'dataType': "json",
          'success': function (data) {
            //var markers = []
            $.each(data.features, function( index1, value1 ) {
              var mark = {}
              mark.lat = Number(value1.geometry.coordinates[1])
              mark.lng = Number(value1.geometry.coordinates[0])									
              mark.message = value1.properties.name 
              mark.icon = {
                type: 'awesomeMarker',
                icon: "tag",						//tag, home, star, heart
                markerColor: "blue"												
              },
                markers.push(mark);
            });

            $scope.listSearch = data.features;
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

    //file
    //    $scope.loadDataAjax("mymaps.json")
    //mongoDb
    //    $scope.loadDataAjax("http://localhost:3000/users/maps")
    $scope.loadDataAjax(mongoDbMaps)    
    //    $scope.loadTestAjax()

    var getLocation = function(){
      var href
      if($scope.mymaps.Wikipedia!=""){
        href=$scope.mymaps.Wikipedia
      }
      else {
        href=$scope.mymaps.Descrizione
      }
      var loc =       {
        "title": $scope.mymaps.Nome,
        "coord": $scope.mymaps.Latitudine  + ":" + $scope.mymaps.Longitudine + ":15",
        "lat": $scope.mymaps.Latitudine,
        "lng": $scope.mymaps.Longitudine,
        "message": "<a target='_blank' href='" + href + "'>" + $scope.mymaps.Nome +"</a>",
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
        "url": $scope.mymaps.PhotoOwn,
        "gpsFile": "photo/" + $scope.mymaps.Nome + ".json",
        "viewCoord": "hide",
        "viewGps": "hide",   //gestisce il check box
        "items": []
      }
      var GPS={
        "title": "GPS",
        "description": $scope.mymaps.Nome,
        "info" : $scope.mymaps.GPSinfo,
        "url": "",
        "gpsFile": $scope.mymaps.GPS,
        "viewCoord": "hide",
        "viewGps": "hide",
        "items": []
      }

      if(typeof $scope.mymaps.Partenza != "undefined" & $scope.mymaps.Partenza != "" ){
        loc.items.push(Partenza)
      }
      if(typeof $scope.mymaps.Altezza!=undefined  & $scope.mymaps.Altezza != "" ){
        loc.items.push(Altezza)
      }
      if(typeof $scope.mymaps.Wikipedia!=undefined  & $scope.mymaps.Wikipedia != "" ){
        loc.items.push(Wikipedia)
      }
      if(typeof $scope.mymaps.Descrizione!=undefined  & $scope.mymaps.Descrizione != "" ){
        loc.items.push(Descrizione)
      }
      var addPhoto="N"
      if(typeof $scope.mymaps.PhotoOwn!=undefined  & $scope.mymaps.PhotoOwn != "" ){
        addPhoto="Y"
      }
      if( $scope.mymaps.PhotoGeo.toUpperCase() =="Y" ){
        addPhoto="Y"
        Photo.viewGps="showChk"
      }
      if(addPhoto=="Y"){
        loc.items.push(Photo) 
      }

      if(typeof $scope.mymaps.GPS!=undefined  & $scope.mymaps.GPS != "" ){
        GPS.viewGps="showChk"
        loc.items.push(GPS)
      }    

      return loc
    }

    var getLocationMinimal = function(){
      var loc =       {
        "title": $scope.address.name,
        "coord": $scope.mapCenter.lat  + ":" + $scope.mapCenter.lng + ":15",
        "lat": $scope.mapCenter.lat,
        "lng": $scope.mapCenter.lng,
        "message": "<a target='_blank' href=''>" + $scope.address.name +"</a>",
        "viewCoord": "showCoord",
        "viewGps": "hide",
        "items": [

        ]
      }          

      return loc
    }

    var checkExistLocation = function(location) {
      for (var i=0; i < $scope.list.length; i++) {
        var objf = $scope.list[i].items.filter(function ( obj ) {
          if(obj.title == location){
            return obj;
          }

        });    
        if(objf.length>0){
          alert(objf[0].title + " alredy exist")
          return true
        }
      }    
      return false
    };   

    var deleteLocation = function(location) {
      for (var i=0; i < $scope.list.length; i++) {
        var objf = $scope.list[i].items.filter(function ( obj ) {
          if(obj.title == location){
            return obj;
          }
        });    
        if(objf.length>0){
          var index = $scope.list[i].items.indexOf(objf[0]);
          if (index > -1) {
            $scope.list[i].items.splice(index, 1);
            return
          }                
        }
      }    
    };    
    //$scope.open()
  }])
  .filter('trust', function ($sce) {
  return function (val) {
    return $sce.trustAsHtml(val);
  };
});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});