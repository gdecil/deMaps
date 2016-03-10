//error cors http://a.tile.opentopomap.org/#map=5/49.023/10.020

var mapImage = function (map) {
	leafletImage(map, doImage);
}

function doImage(err, canvas) {
    var img = document.createElement('img');
    var dimensions = map.getSize();
    img.width = dimensions.x;
    img.height = dimensions.y;
    img.src = canvas.toDataURL();
    document.getElementById('mapImage').innerHTML = '';
    document.getElementById('mapImage').appendChild(img);
}