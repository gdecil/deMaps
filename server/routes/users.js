var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

var upload 	= multer({ 
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename;
    //		return filename+Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...');
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
  }
});

/*
 * GET userlist.
 */
router.get('/maps', function(req, res) {
  var db = req.db;
  var collection = db.get('maps');
  collection.find({},{sort: {title: 1, "items.title": 1}},function(e,docs){
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
router.post('/restore', function(req, res) {
  var db = req.db;
  var collection = db.get('maps');
  var locr = req.body;

  collection.remove();
  collection.insert(locr.backup)
  res.end("File Restored");
});

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

router.post('/checkFile', function(req, res) {
  var locr = req.body;
  fs.stat("./uploads/" + locr.name, function(err, stat) {
    if(err == null) {
      return res.end("true");
    } else if(err.code == 'ENOENT') {
      return res.end("false");
    } else {
      console.log('Some other error: ', err.code);
      return res.end(err.code);
    }
  });
});

router.post('/api/uploadFile',function(req,res){  
      upload(req,res,function(err) {
        if(err) {
          return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
      });
  
//  var name = req.file.upload.name;
//  var path = req.file.upload.path;
//  console.log(path)
//  console.log(name)
//  fs.stat(name, function(err, stat) {
//    if(err == null) {
//      return res.end("File already exist");
//    } else if(err.code == 'ENOENT') {
//      upload(req,res,function(err) {
//        if(err) {
//          return res.end("Error uploading file.");
//        }
//        res.end("File is uploaded");
//      });
//    } else {
//      console.log('Some other error: ', err.code);
//      return res.end(err.code);
//    }
//  });
});

module.exports = router;
