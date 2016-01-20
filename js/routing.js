var routingInit = function() {
    var gk, topo, thunderforest, osm, waymarkedtrails;

    gk = 'http://opencache.statkart.no/gatekeeper/gk';
    topo = L.tileLayer(gk + '/gk.open_gmaps?layers=topo2&zoom={z}&x={x}&y={y}', {
        maxZoom: 16,
        attribution: 'tiles &copy; <a href="http://www.statkart.no/">Statens kartverk</a>'
    });

    thunderforest = new L.TileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'tiles &copy; <a target="_blank" href="http://www.thunderforest.com">Thunderforest</a> ' + '(<a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a>)'
    });

    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'tiles &copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    osmTopo = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="https://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    waymarkedtrails = L.tileLayer('http://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxZoom: 19,
        opacity: 0.5,
        attribution: 'overlay &copy; <a target="_blank" href="http://hiking.waymarkedtrails.org">Waymarked Trails</a> ' + '(<a target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0/de/deed.en">CC-BY-SA 3.0 DE</a>)'
    });

    mapRouting = new L.Map('mapRouting', {
        layers: [osm],
        center: new L.LatLng(45.87330792115715, 7.061719894409179),
        zoom: 13
    });

    L.control.layers({
        //        'Topo (Kartverket)': topo,
        'Landscape (Thunderforest)': thunderforest,
        'OpenTopoMap': osmTopo,
        'OpenStreetMap': osm
    }, {
        'Hiking (Waymarked Trails)': waymarkedtrails
    }).addTo(mapRouting);

    mapRouting.attributionControl.addAttribution('data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors');

    // Snapping Layer
    snapping = new L.geoJson(null, {
        style: {
            opacity: 0,
            clickable: false
        }
    }).addTo(mapRouting);
    mapRouting.on('moveend', function() {
        if (mapRouting.getZoom() > 12) {
            var proxy = 'http://www2.turistforeningen.no/routing.php?url=';
            var route = 'http://www.openstreetmap.org/api/0.6/map';
            var params = '&bbox=' + mapRouting.getBounds().toBBoxString() + '&1=2';
            $.get(proxy + route + params).always(function(osm, status) {
                if (status === 'success' && typeof osm === 'object') {
                    var geojson = osmtogeojson(osm);

                    snapping.clearLayers();
                    for (var i = 0; i < geojson.features.length; i++) {
                        var feat = geojson.features[i];
                        if (feat.geometry.type === 'LineString' && feat.properties.tags.highway) {
                            snapping.addData(geojson.features[i]);
                        }
                    }
                } else {
                    console.log('Could not load snapping data');
                }
            });
        } else {
            snapping.clearLayers();
        }
    });
    mapRouting.fire('moveend');

    // OSM Router
    router = function(m1, m2, cb) {
        var proxy = 'http://www2.turistforeningen.no/routing.php?url=';
        var route = 'http://www.yournavigation.org/api/1.0/gosmore.php&format=geojson&v=foot&fast=1&layer=mapnik';
        var params = '&flat=' + m1.lat + '&flon=' + m1.lng + '&tlat=' + m2.lat + '&tlon=' + m2.lng;
        $.getJSON(proxy + route + params, function(geojson, status) {
            if (!geojson || !geojson.coordinates || geojson.coordinates.length === 0) {
                if (typeof console.log === 'function') {
                    console.log('OSM router failed', geojson);
                }
                return cb(new Error());
            }
            geoRoutingLayer = L.GeoJSON.geometryToLayer(geojson)
            return cb(null, geoRoutingLayer);
        });
    }

    routing = new L.Routing({
        position: 'topleft',
        routing: {
            router: router
        },
        snapping: {
            layers: []
        },
        snapping: {
            layers: [snapping],
            sensitivity: 15,
            vertexonly: false
        }
    });
    mapRouting.addControl(routing);
    routing.draw()
}

var reduceHalfSize = function(a) {
    var b = []

    for (var i = 0; i < a.length; i = i + 2) {
        b.push(a[i]);
    };
    return b;
}

var routingCalc = function(routing) {
    //var map = mapRouting;

    //  viewProfile(map);
    //  return;

    var geoJSON2D = routing.toGeoJSON(false);
    var coord = []

    for (var i = 0; i < geoJSON2D.coordinates.length; i++) {
        coord.push(geoJSON2D.coordinates[i]);
    };

    do {
        coord = reduceHalfSize(coord);
        var a = coord.length;
    }
    while (a > 300);
    //    return;

    //  var geoJSON3D = routing.toGeoJSON();
    try {
        //prende l'altitudine da servizio mapquest
        var dataGeo = "";
        $.each(coord, function(index, value) {
            dataGeo = dataGeo + coord[index]["1"];
            dataGeo = dataGeo + ","
            dataGeo = dataGeo + coord[index]["0"];
            dataGeo = dataGeo + ","
        });
        dataGeo = dataGeo.slice(0, -1);
        var url = "http://open.mapquestapi.com/elevation/v1/profile?key=KP6AQVWl7OJwI2ZGxDMWNnlwebWYXADC&shapeFormat=raw&latLngCollection=" + dataGeo;
        var jqxhr = $.ajax({
                url: url,
                dataType: "json"
            })
            .done(function(data) {
                geojson = createGeoJSON(data, coord)

                var el = L.control.elevation();
                el.addTo(mapRouting);
                var gjl = L.geoJson(geojson, {
                    onEachFeature: el.addData.bind(el)
                }).addTo(mapRouting);
            })
            .fail(function(err, x) {
                alert("error");
            })
            .always(function(data) {
                //      alert( "complete" );
            });

    } catch (err) {
        throw err;
    }
}

var routingReport = function() {
    var waypointsArray = routing.getWaypoints();
    var elev = {}
    elev.Elevation_Gain = elevationGain;
    elev.Elevation_Loss = elevationLoss;
    elev.Elevation_Net = elevationGain + elevationLoss

    $('#ell').html(elevationLoss.toString());
    $('#elg').html(elevationGain.toString());
    $('#eln').html(elev.Elevation_Net.toString());
    percorso.elevationLoss = elev.Elevation_Gain;
    percorso.elevationGain = elev.Elevation_Loss;
    percorso.elevationNet = elev.Elevation_Net;
    var tmp = [];
    tmp.push(elev);
    percorso.waypoints = [];
    $("#routeData ol li").remove();

    $.each(waypointsArray, function(index, value) {
        percorso.waypoints[index] = [value.lat, value.lng];
        var url = "http://photon.komoot.de/reverse?lon=" + value.lng + "&lat=" + value.lat
        var jqxhr = $.ajax({
                url: url,
                dataType: "json"
            })
            .done(function(data) {
                //          tmp = tmp.concat(eval(the.editor.getValue()));           
                data.features[0].properties.coord = data.features[0].geometry.coordinates;
                tmp = tmp.concat(data.features[0].properties);
                //          tmp= tmp.concat(data.features[0].properties).concat(data.features[0].geometry.coordinates)
            })
            .fail(function(err, x) {
                alert("error");
            })
            .always(function(data) {data.features[0].properties.coord[1]
              $("#routeData ol").prepend('<li> <button onclick="centerMap(' + data.features[0].properties.coord[1] + ',' + data.features[0].properties.coord[0] + ',15)"> <strong>' + data.features[0].properties.name + '</strong></button>' + '     Lat: <small>' + data.features[0].properties.coord[1].toFixed(5) + '</small>  Lng: <small>' + data.features[0].properties.coord[0].toFixed(5) + '</small></li>');

                // var txt = "<strong>" + data.features[0].properties.name + "</strong>" + "  Coord Lat Lng: <small>" + data.features[0].properties.coord.toString() + "</small><br>"
                // $('#routeData').prepend(txt)
                // percorso.waypointsInfo[index] = data.features[0].properties.name;
                // //                percorso.waypointsInfo.push(data.features[0].properties.name);
                // the.editor.setValue(JSON.stringify(tmp))
                // beautify();
                //      alert( "complete" );
            });
    });
}

var calculateDataFromGpx = function(gpxData) {
    var outGpxData = {};

    new L.GPX(gpxData, {
        async: true
    }).on('loaded', function(e) {
        var gpx = e.target;

        outData.name = gpx.get_name();
        outData.start = gpx.get_start_time().toDateString() + ', ' + gpx.get_start_time().toLocaleTimeString();
        outData.distance = gpx.get_distance().toFixed(2);
        //          _c('distance').textContent = gpx.get_distance_imp().toFixed(2);
        outData.duration = gpx.get_duration_string(gpx.get_moving_time());
        outData.pace = gpx.get_duration_string(gpx.get_moving_pace_imp(), true);
        outData.avghr = gpx.get_average_hr();
        outData.elevation_gain = gpx.get_elevation_gain().toFixed(0);
        outData.elevation_loss = gpx.get_elevation_loss().toFixed(0);
        outData.elevation_net = (gpx.get_elevation_gain() - gpx.get_elevation_loss()).toFixed(0);
        //          _c('elevation-gain').textContent = gpx.to_ft(gpx.get_elevation_gain()).toFixed(0);
        //          _c('elevation-loss').textContent = gpx.to_ft(gpx.get_elevation_loss()).toFixed(0);
        //          _c('elevation-net').textContent  = gpx.to_ft(gpx.get_elevation_gain()

    })
    return outGpxData;
}

var createGeoJSON = function(dataElevation, dataCoord) {
    var geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": []
            },
            "properties": "gpdc"
        }]
    };
    elevationGain = 0;
    elevationLoss = 0;
    $.each(dataCoord, function(index, value) {
        if (dataElevation.elevationProfile[index].height > 0) {
            var a = [dataCoord[index]["0"], dataCoord[index]["1"], dataElevation.elevationProfile[index].height];
            var currentElev = dataElevation.elevationProfile[index].height;
            if (index > 0) {
                var oldElev = dataElevation.elevationProfile[index - 1].height;
                if (currentElev > 0 && oldElev > 0) {
                    var delta = currentElev - oldElev;
                    if (delta > 0) {
                        elevationGain = elevationGain + delta;
                    } else {
                        elevationLoss = elevationLoss + delta;
                    }
                }
            }
            geojson.features[0].geometry.coordinates.push(a);
        }
    });
    percorso.geojson = geojson;
    return geojson;
}
var viewProfile = function(map) {

    //  geoJSON2D = eval({'type':'LineString','properties':{'waypoints':[{'coordinates':[7.065773,45.88461,2039],'_index':0},{'coordinates':[7.065182,45.883211,2013],'_index':3}]},'coordinates':[[7.065773,45.88461,2039],[7.065498,45.884098,2035],[7.065182,45.883211,2013]]})

    var geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [7.065773, 45.88461, 2039],
                    [7.065498, 45.884098, 2035],
                    [7.065182, 45.883211, 2013]
                ]
            },
            "properties": null
        }]
    };
    var el = L.control.elevation();
    el.addTo(map);
    var gjl = L.geoJson(geojson, {
        onEachFeature: el.addData.bind(el)
    }).addTo(map);

    //aggiunge i dati alla base della finestra
    //  display_gpx(document.getElementById('tabs-6'), togpx(geoJSON2D), mapRouting)
}
var viewPercorso = function(percorso) {
        var prev = null;
        for (var i = 0; i < percorso.waypoints.length; i++) {
            var marker = new L.Marker(percorso.waypoints[i]);
            routing.addWaypoint(marker, prev, null, function() {});
            prev = marker;
        }
        routing.rerouteAllSegments();
        routing.draw(false);
        mapRouting.panTo(new L.LatLng(percorso.waypoints[0][0], percorso.waypoints[0][1]));
        var el = L.control.elevation();
        el.addTo(mapRouting);
        var gjl = L.geoJson(percorso.geojson, {
            onEachFeature: el.addData.bind(el)
        }).addTo(mapRouting);
        $('#ell').html(percorso.elevationLoss.toString());
        $('#elg').html(percorso.elevationGain.toString());
        $('#eln').html(percorso.elevationNet.toString());
        $("#routeData ol li").remove();
        for (i = percorso.waypointsInfo.length-1; i > -1; i--) {          
          $("#routeData ol").prepend('<li> <button onclick="centerMap(' + percorso.waypoints[i][0] + ',' + percorso.waypoints[i][1] + ',15)"> <strong>' + percorso.waypointsInfo[i] + '</strong></button>' + '     Lat: <small>' + percorso.waypoints[i][0].toFixed(5) + '</small>  Lng: <small>' + percorso.waypoints[i][1].toFixed(5) + '</small></li>');
        }
    }