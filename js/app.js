    var urlLayer = 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attrLayer ='Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    
var app = angular.module("NearMeApp", ['leaflet-directive', 'ui.layout','ngAnimate', 'ui.bootstrap', 'ui.tree', 'ui.tree-filter', 'ui.highlight', 'ngDialog', 'ngFileUpload']);

app.config(['ngDialogProvider', function (ngDialogProvider) {
  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default',
    plain: false,
    showClose: true,
    closeByDocument: true,
    closeByEscape: true,
    appendTo: false,
    preCloseCallback: function () {
      console.log('default pre-close callback');
    }
  });
}]);

var mapPhoto;
var mapProfile;

$(function() {
  $( "#tabs" ).tabs();
});
