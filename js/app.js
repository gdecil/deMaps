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

//$('.treeOpen').on("click",function(){
//  alert('rrrrr')
//  var usersid =  $(this).attr("id");
//  //post code
//})

var selectTree = function(id){
  document.getElementById("treeFilter").focus();
  $('#treeFilter').val(id.replace(/_/g,'\''))
}

var openLocation = function(id){
  var scope = angular.element($("#modalDialogId")).scope();
  scope.$apply(function(){
    scope.openLocation();
    var locr = {
      "query" : {"items.title":id.replace(/_/g,'\'')},
      "limit" : "subd"
    }
    $.ajax({
      type: 'POST',
      data: JSON.stringify(locr),
      url: server + 'users/find',
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }).done(function( response ) {
      $('#nomelocMod').text(response[0].items[0].title)
      $('#latlocMod').text(response[0].items[0].lat)
      $('#lnglocMod').text(response[0].items[0].lng)
      $('#linklocMod').text("https://gdecil.mooo.com/deMaps/?c=" + response[0].items[0].lat + ":" + response[0].items[0].lng + ":15")
      $('#altezzalocMod1').hide()                
      $('#wikilocMod1').hide()                
      $('#desclocMod1').hide()                
      $('#ownlocMod1').hide()                
      if(response[0].items[0].items.length>0){
        $.each(response[0].items[0].items, function( index, value ) {
          switch (value.title) {
            case "Altezza":
              if(value.value!=""){
                $('#altezzalocMod1').show()
                $('#altezzalocMod').text(value.value)
              }
              break;
            case "Wikipedia":
              if(value.url!=""){
                $('#wikilocMod1').show()
                $('#wikilocMod').attr("href", value.url)
              }
              break;
            case "Descrizione":
              if(value.url!=""){
                $('#desclocMod1').show()
                $('#desclocMod').attr("href", value.url)
              }
              break;
            case "PhotoOwncloud":
              if(value.url!=""){
                $('#ownlocMod1').show()
                $('#ownlocMod').attr("href", value.url)
              }
              break;
          }
        })
      }
    });      

  })
  //  $scope.openConfirm();
}