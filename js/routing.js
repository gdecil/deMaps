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
    //            var txt = "<p><strong>Rifugio Walter Bonatti: lng 7.0336398237254905 lat 45.8469128</strong></p><br>"
    //          $('#routeData').prepend(txt)

    //  var gpxData = togpx(geojson);
    //  out = calculateDataFromGpx(gpxData);
    //  the.editor.setValue(JSON.stringify(out))
    //  beautify();

    var waypointsArray = routing.getWaypoints();

    //  the.editor.setValue(JSON.stringify(waypointsArray))
    //  beautify();
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
            .always(function(data) {
                var txt = "<strong>" + data.features[0].properties.name + "</strong>" + "  Coord Lat Lng: <small>" + data.features[0].properties.coord.toString() + "</small><br>"
                $('#routeData').prepend(txt)
                percorso.waypointsInfo[index] = data.features[0].properties.name;
                //                percorso.waypointsInfo.push(data.features[0].properties.name);
                the.editor.setValue(JSON.stringify(tmp))
                beautify();
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

var testProfile = function() {
    var map = mapRouting;

    //  var geoJSON = routing.toGeoJSON(false);
    var geoJSON = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "properties": {
            "waypoints": [{
                "coordinates": [7.065773, 45.88461, 2039],
                "_index": 0
            }, {
                "coordinates": [7.065182, 45.883211, 2013],
                "_index": 3
            }]
        },
        "coordinates": [
            [7.065773, 45.88461, 2039],
            [7.065498, 45.884098, 2035],
            [7.065182, 45.883211, 2013]
        ]
    };

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
            "properties": {
                "waypoints": [{
                    "coordinates": [7.065773, 45.88461, 2039],
                    "_index": 0
                }, {
                    "coordinates": [7.065182, 45.883211, 2013],
                    "_index": 3
                }]
            }
        }]
    };
    var el = L.control.elevation();
    el.addTo(map);
    var gjl = L.geoJson(geojson, {
        onEachFeature: el.addData.bind(el)
    }).addTo(map);
}

var testProfileOld = function() {
    var map = new L.Map('mapRouting');

    var url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
        attr = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        service = new L.TileLayer(url, {
            subdomains: "1234",
            attribution: attr
        });

    var bounds = new L.LatLngBounds(new L.LatLng(-44.6, 170), new L.LatLng(-45, 168));

    var geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [169.13693, -44.696476, 296],
                    [169.134602, -44.69764, 295],
                    [169.129983, -44.701164, 299],
                    [169.131292, -44.702382, 303],
                    [169.13376, -44.704533, 315],
                    [169.135568, -44.705574, 336],
                    [169.136179, -44.70934, 338],
                    [169.137011, -44.714066, 344],
                    [169.136984, -44.719489, 342],
                    [169.136898, -44.725235, 350],
                    [169.136801, -44.730143, 353],
                    [169.135632, -44.734853, 354],
                    [169.131882, -44.738989, 363],
                    [169.129688, -44.744241, 363],
                    [169.123937, -44.746982, 361],
                    [169.118509, -44.750286, 371],
                    [169.112763, -44.753113, 374],
                    [169.107807, -44.755356, 378],
                    [169.103467, -44.758086, 386],
                    [169.098902, -44.760956, 388],
                    [169.096429, -44.764642, 397],
                    [169.094197, -44.768246, 401],
                    [169.091955, -44.773037, 402],
                    [169.089251, -44.777194, 408],
                    [169.086215, -44.780939, 410],
                    [169.083227, -44.785498, 412],
                    [169.079778, -44.788926, 423],
                    [169.076913, -44.7923, 429],
                    [169.074059, -44.795938, 429],
                    [169.071495, -44.800213, 435],
                    [169.069505, -44.804263, 442],
                    [169.067574, -44.809322, 436],
                    [169.065508, -44.812728, 450],
                    [169.063277, -44.817299, 451],
                    [169.062, -44.822073, 447],
                    [169.06023, -44.826622, 464],
                    [169.058905, -44.831729, 459],
                    [169.05553, -44.835645, 460],
                    [169.051888, -44.83933, 467],
                    [169.048626, -44.842817, 476],
                    [169.045467, -44.846106, 480],
                    [169.042028, -44.849287, 485],
                    [169.037672, -44.851776, 493],
                    [169.033477, -44.854367, 495],
                    [169.029974, -44.856373, 502],
                    [169.027324, -44.857559, 514],
                    [169.023832, -44.859275, 518],
                    [169.020587, -44.861743, 524],
                    [169.017615, -44.864414, 526],
                    [169.015748, -44.868888, 520],
                    [169.013119, -44.872059, 529],
                    [169.009879, -44.874521, 536],
                    [169.00798, -44.87598, 553],
                    [169.005073, -44.878158, 556],
                    [169.00452, -44.878609, 557],
                    [169.004488, -44.878619, 554],
                    [169.004477, -44.878619, 553],
                    [169.004483, -44.878619, 552],
                    [169.004477, -44.878619, 551],
                    [169.004477, -44.878619, 550],
                    [169.004477, -44.878619, 551],
                    [169.004483, -44.878614, 551],
                    [169.004488, -44.878614, 551],
                    [169.004488, -44.878614, 552],
                    [169.004558, -44.878598, 556],
                    [169.004011, -44.880808, 556],
                    [169.002584, -44.884032, 570],
                    [169.001033, -44.886172, 583],
                    [168.999703, -44.887546, 600],
                    [168.998732, -44.889235, 606],
                    [168.996801, -44.890893, 609],
                    [168.992279, -44.893452, 608],
                    [168.988915, -44.895941, 613],
                    [168.987783, -44.899117, 616],
                    [168.985283, -44.901563, 625],
                    [168.9834, -44.904835, 629],
                    [168.981164, -44.90755, 639],
                    [168.978138, -44.910441, 647],
                    [168.976008, -44.913166, 649],
                    [168.973165, -44.915371, 656],
                    [168.973358, -44.918332, 657],
                    [168.971502, -44.921905, 670],
                    [168.971454, -44.925504, 676],
                    [168.970628, -44.929104, 687],
                    [168.969887, -44.931856, 701],
                    [168.969448, -44.934672, 710],
                    [168.968155, -44.938567, 713],
                    [168.967575, -44.939463, 731],
                    [168.963912, -44.941855, 726],
                    [168.962141, -44.944918, 738],
                    [168.960376, -44.948287, 746],
                    [168.959813, -44.951527, 757],
                    [168.956793, -44.954156, 766],
                    [168.957008, -44.957117, 782],
                    [168.957351, -44.960684, 791],
                    [168.959025, -44.963624, 805],
                    [168.958794, -44.966269, 815],
                    [168.957614, -44.968683, 832],
                    [168.957571, -44.968801, 833],
                    [168.955221, -44.971097, 839],
                    [168.953274, -44.972958, 863],
                    [168.949771, -44.974363, 877],
                    [168.946869, -44.975699, 888],
                    [168.944911, -44.977614, 911],
                    [168.944825, -44.978489, 928],
                    [168.943709, -44.979846, 951],
                    [168.942373, -44.980634, 964],
                    [168.942277, -44.982217, 978],
                    [168.942153, -44.98329, 993],
                    [168.941799, -44.984363, 1002],
                    [168.941145, -44.985479, 1021],
                    [168.94115, -44.986535, 1037],
                    [168.940818, -44.987656, 1054],
                    [168.940104, -44.98889, 1064],
                    [168.939959, -44.990816, 1082],
                    [168.938634, -44.992345, 1093],
                    [168.938618, -44.992361, 1087],
                    [168.938608, -44.992361, 1088],
                    [168.938608, -44.992356, 1090],
                    [168.938608, -44.992345, 1091],
                    [168.938602, -44.992345, 1091],
                    [168.938608, -44.99235, 1090],
                    [168.938608, -44.992345, 1090],
                    [168.938742, -44.992179, 1085],
                    [168.920138, -44.995102, 931],
                    [168.908068, -44.99175, 765],
                    [168.903127, -44.985961, 734],
                    [168.903149, -44.985945, 740],
                    [168.903143, -44.98594, 741],
                    [168.903224, -44.985666, 739],
                    [168.899914, -44.981938, 735],
                    [168.892221, -44.976783, 722],
                    [168.876933, -44.976574, 638],
                    [168.869138, -44.976069, 643],
                    [168.865807, -44.975469, 636],
                    [168.864428, -44.975587, 609],
                    [168.860834, -44.977625, 500],
                    [168.85555, -44.981305, 397],
                    [168.853887, -44.978537, 385],
                    [168.84899, -44.976853, 391],
                    [168.848882, -44.972261, 393],
                    [168.850347, -44.96791, 399],
                    [168.851135, -44.962733, 396],
                    [168.848512, -44.959386, 407],
                    [168.845739, -44.956039, 408],
                    [168.843641, -44.952756, 413],
                    [168.841109, -44.948915, 420],
                    [168.840503, -44.947439, 422],
                    [168.839752, -44.944929, 418],
                    [168.835986, -44.939516, 415],
                    [168.833127, -44.938626, 415],
                    [168.832639, -44.938856, 421],
                    [168.832628, -44.93884, 423],
                    [168.832639, -44.938835, 425],
                    [168.832639, -44.93883, 424],
                    [168.832644, -44.938819, 424],
                    [168.832644, -44.938813, 424],
                    [168.832644, -44.938808, 424],
                    [168.832644, -44.938797, 424],
                    [168.832644, -44.938792, 424],
                    [168.832655, -44.938808, 424],
                    [168.83265, -44.938797, 424],
                    [168.832655, -44.938803, 424],
                    [168.83265, -44.938803, 424],
                    [168.83265, -44.938797, 424],
                    [168.83265, -44.938803, 424],
                    [168.83265, -44.938797, 425],
                    [168.833336, -44.93832, 414],
                    [168.833132, -44.93854, 409],
                    [168.834484, -44.938481, 414],
                    [168.834554, -44.93847, 414],
                    [168.83457, -44.938513, 420],
                    [168.834473, -44.938449, 420],
                    [168.834479, -44.938449, 419],
                    [168.83449, -44.938454, 419],
                    [168.834495, -44.938459, 418],
                    [168.834495, -44.938465, 417],
                    [168.834495, -44.938459, 417]
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

    map.addLayer(service).fitBounds(bounds);
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
        for (i = percorso.waypointsInfo.length-1; i > -1; i--) {
            var txt = "<strong>" + percorso.waypointsInfo[i] + "</strong>" + "     Lat: <small>" + percorso.waypoints[i][0].toFixed(5) + "</small>  Lng: <small>" + percorso.waypoints[i][1].toFixed(5) + "</small><br>"
            $('#routeData').prepend(txt)
        }
        // $.each(percorso.waypointsInfo, function(index, value) {
        //     var txt = "<strong>" + value + "</strong>" + "     Lat: <small>" + percorso.waypoints[i][0].toFixed(5) + "</small>  Lng: <small>" + percorso.waypoints[i][1].toFixed(5) + "</small><br>"
        //     $('#routeData').prepend(txt)
        // }); // body...
    }

    /*            $.ajax({
                    'async': false,
                    'global': false,
                    'url': mongoDbPercorsi,
                    'dataType': "json",
                    'success': function(percorsi) {
                        percorso = percorsi[0];
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
                        $.each(percorso.waypointsInfo, function(index, value) {
                            var txt = "<strong>" + value + "</strong>" + "  Coord Lng Lat: <strong>" + percorso.waypoints[index] + "</strong><br>"
                            $('#routeData').prepend(txt)
                        });
                        var p = [percorso];
                        $scope.gridOptions.data = p;

                    }
                });*/
