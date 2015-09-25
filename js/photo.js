var openPhoto = function (url) {
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
	L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
		attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
	}).addTo(mapPhoto);
	var photoLayer = L.photo.cluster({ spiderfyDistanceMultiplier: 1.2 }).on('click', function (evt) {
		evt.layer.bindPopup(L.Util.template('<img src="{url}"/></a><p>{caption}</p>', evt.layer.photo), {
			className: 'leaflet-popup-photo',
			minWidth: 400
		}).openPopup();
	});
	reqwest({
		url: url,
		type: 'json',
		success: function (data) {
			var photos = data;								
			photoLayer.add(photos).addTo(mapPhoto);
            var bounds = photoLayer.getBounds()
			mapPhoto.fitBounds(bounds);
		}
	});
}	