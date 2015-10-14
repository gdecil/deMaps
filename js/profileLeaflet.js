var addProfile = function(urlFile, center){
  
 // mapProfile = L.map('map_profile', center);
  
//  mapProfile = L.map('map_profile', {
//    center: [lat, lng],
//    zoom: zoom
//  });
  mapProfile = L.map('map_profile', {
    center: [center.lat, center.lng],
    zoom: 15
  });
  
  //map = new L.Map('map_profile');

  var url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
      attr ='Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      service = new L.TileLayer(url, {subdomains:"1234",attribution: attr});

  $.ajax({
          'async': false,
          'global': false,
          'url': "gps/" + urlFile,            //"gps/Grignone.gpx",
          'success': function (data) {
            var geojson = toGeoJSON.gpx(data)
            var el = L.control.elevation();
            el.addTo(mapProfile);
            var gjl = L.geoJson(geojson,{
                onEachFeature: el.addData.bind(el)
            }).addTo(mapProfile);

            mapProfile.addLayer(service)      
            display_gpx(document.getElementById('tabs-2'), "gps/" + urlFile)

          }
  });
  
}

var display_gpx = function (elt, url) {
  if (!elt) return;

//  var url = elt.getAttribute('data-gpx-source');
//  var mapid = elt.getAttribute('data-map-target');
//  if (!url || !mapid) return;

  function _t(t) { return elt.getElementsByTagName(t)[0]; }
  function _c(c) { return elt.getElementsByClassName(c)[0]; }

//  var map = L.map(mapid);
//  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
//  }).addTo(map);

  new L.GPX(url, {
    async: true,
    marker_options: {
      startIconUrl: 'https://gdecil.mooo.com/deMaps/css/images/pin-icon-start.png',
      endIconUrl:   'https://gdecil.mooo.com/deMaps/css/images/pin-icon-end.png',
      shadowUrl:    'https://gdecil.mooo.com/deMaps/css/images/pin-shadow.png',
    },
  }).on('loaded', function(e) {
    var gpx = e.target;
//    mapProfile.fitBounds(gpx.getBounds());

    _t('h3').textContent = gpx.get_name();
//          _c('start').textContent = gpx.get_start_time().toDateString() + ', '
//            + gpx.get_start_time().toLocaleTimeString();
    _c('distance').textContent = gpx.get_distance().toFixed(2);
//          _c('distance').textContent = gpx.get_distance_imp().toFixed(2);
    _c('duration').textContent = gpx.get_duration_string(gpx.get_moving_time());
    _c('pace').textContent     = gpx.get_duration_string(gpx.get_moving_pace_imp(), true);
    _c('avghr').textContent    = gpx.get_average_hr();
    _c('elevation-gain').textContent = gpx.get_elevation_gain().toFixed(0);
    _c('elevation-loss').textContent = gpx.get_elevation_loss().toFixed(0);
    _c('elevation-net').textContent  = (gpx.get_elevation_gain()
//          _c('elevation-gain').textContent = gpx.to_ft(gpx.get_elevation_gain()).toFixed(0);
//          _c('elevation-loss').textContent = gpx.to_ft(gpx.get_elevation_loss()).toFixed(0);
//          _c('elevation-net').textContent  = gpx.to_ft(gpx.get_elevation_gain()
      - gpx.get_elevation_loss()).toFixed(0);
  })
    .addTo(mapProfile);
}
