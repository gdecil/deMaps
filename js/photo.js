var openPhoto = function (url, type) {
  if(mapPhoto==undefined){
    mapPhoto = L.map('map_canvas_photo', {
      maxZoom: 17
    });
  }
  else {
    mapPhoto.remove();
    mapPhoto = L.map('map_canvas_photo', {
      maxZoom: 17
    });
  }

  L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
  }).addTo(mapPhoto);
  var photoLayer = L.photo.cluster({ spiderfyDistanceMultiplier: 1.2 }).on('click', function (evt) {
    evt.layer.bindPopup(L.Util.template('<img src="{url}"/></a><p>{caption}</p>', evt.layer.photo), {
      className: 'leaflet-popup-photo',
      minWidth: 400
    }).openPopup();
  });
  if(type=="picasa"){
    reqwest({
      url: url,
      //		url: 'https://picasaweb.google.com/data/feed/api/user/102236928802705706168/albumid/6207433991476715777?alt=json-in-script',
      type: 'jsonp',
      success: function (data) {
        var photos = [];
        data = data.feed.entry;

        for (var i = 0; i < data.length; i++) {
          var photo = data[i];
          if (photo['georss$where']) {
            var pos = photo['georss$where']['gml$Point']['gml$pos']['$t'].split(' ');
            photos.push({
              lat: pos[0],
              lng: pos[1],
              url: photo['media$group']['media$content'][0].url,
              caption: photo['media$group']['media$description']['$t'],
              thumbnail: photo['media$group']['media$thumbnail'][0].url,
              video: (photo['media$group']['media$content'][1] ? photo['media$group']['media$content'][1].url : null) 
            });
          };
        }

        photoLayer.add(photos).addTo(mapPhoto);
        mapPhoto.fitBounds(photoLayer.getBounds());
      }

    })
  }
  else {
    reqwest({
      url: url,
      type: 'json',
      success: function (data) {
        var photos = data;								
        photoLayer.add(photos).addTo(mapPhoto);
        var bounds = photoLayer.getBounds()
        mapPhoto.fitBounds(bounds);
      }
    })
  }	
}
var closePhoto = function () {
  
}

//<!DOCTYPE html>
//<html>
//<head>
//	<title>Leaflet Picasa Web Albums</title>
//	<meta charset="utf-8" />
//	<meta name="viewport" content="width=device-width, initial-scale=1" />
//	<meta property="og:image" content="route.png" />
//	<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
//	<link rel="stylesheet" href="lib/cluster/MarkerCluster.css" />	
//	<link rel="stylesheet" href="../Leaflet.Photo.css" />	
//	<link rel="stylesheet" href="css/map.css" />
//</head>
//<body>
//	<div id="map"></div>
//	<script src="lib/reqwest.min.js"></script>
//	<script src="lib/leaflet/leaflet.js"></script>
//	<script src="lib/cluster/leaflet.markercluster.js"></script>	
//	<script src="../Leaflet.Photo.js"></script>	
//	<script>
//
//	var map = L.map('map', {
//		maxZoom: 14
//	});
//
//	L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
//		attribution: '&copy; <a href="http://kartverket.no/">Kartverket</a>'
//	}).addTo(map);
//
//	var photoLayer = L.photo.cluster().on('click', function (evt) {
//		var photo = evt.layer.photo,
//			template = '<img src="{url}"/></a><p>{caption}</p>';
//
//		if (photo.video && (!!document.createElement('video').canPlayType('video/mp4; codecs=avc1.42E01E,mp4a.40.2'))) {
//			template = '<video autoplay controls poster="{url}"><source src="{video}" type="video/mp4"/></video>';
//		}; 
//
//		evt.layer.bindPopup(L.Util.template(template, photo), {
//			className: 'leaflet-popup-photo',
//			minWidth: 400
//		}).openPopup();
//	});
//
//	reqwest({
//		url: 'https://picasaweb.google.com/data/feed/api/user/102236928802705706168/albumid/6207433991476715777?alt=json-in-script',
//		type: 'jsonp',
//		success: function (data) {
//			var photos = [];
//			data = data.feed.entry;
//
//			for (var i = 0; i < data.length; i++) {
//				var photo = data[i];
//				if (photo['georss$where']) {
//					var pos = photo['georss$where']['gml$Point']['gml$pos']['$t'].split(' ');
//					photos.push({
//						lat: pos[0],
//						lng: pos[1],
//						url: photo['media$group']['media$content'][0].url,
//						caption: photo['media$group']['media$description']['$t'],
//						thumbnail: photo['media$group']['media$thumbnail'][0].url,
//						video: (photo['media$group']['media$content'][1] ? photo['media$group']['media$content'][1].url : null) 
//					});
//				};
//			}
//			
//			photoLayer.add(photos).addTo(map);
//			map.fitBounds(photoLayer.getBounds());
//		}
//	});
//
//	</script>
//</body>
//</html>