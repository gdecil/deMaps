var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/maps', function(req, res) {
    var db = req.db;
    var collection = db.get('maps');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.post('/createNewDb', function(req, res) {
  var db = req.db;
  var collection = db.get('maps');
  var locr = req.body;
  
  collection.update(
    { "id" : parseInt(locr.root) }, 
    { 
      $push: { items: locr.loc}
    },
    { upsert : true },
     function(error, result) {
         if(error) { 
             console.error(error); return; 
         }
        res.send(
            (error === null) ? { msg: '' } : { msg: error }
        );
     }
  );  
});

//https://mongodb.github.io/node-mongodb-native/api-generated/collection.html#update
router.post('/addlocation', function(req, res) {
  var db = req.db;
  var collection = db.get('maps');
  var locr = req.body;
  
collection.update(
    { "id" : parseInt(locr.root) }, 
    { 
      $push: { items: locr.loc}
    },
    { upsert : true },
     function(error, result) {
         if(error) { 
             console.error(error); return; 
         }
        res.send(
            (error === null) ? { msg: '' } : { msg: error }
        );
     }
  );  
});

//https://mongodb.github.io/node-mongodb-native/api-generated/collection.html#update
router.post('/removelocation', function(req, res) {
  var db = req.db;
  var col = db.get('maps');
  var locr = req.body;
    
  col.update(
    { "id" : parseInt(locr.root) }, 
    { 
      $pull: { items: { title: locr.loc }}
    },
    { remove : true },
    function(error, result) {
         if(error) { 
             console.error(error); return; 
         }
        res.send(
            (error === null) ? { msg: '' } : { msg: error }
        );
     }
  );  
});

module.exports = router;
