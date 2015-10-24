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
