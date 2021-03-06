var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var db = require("../models");

//INDEX GET /api/hotels/
router.get('/',function(req,res){
  db.Hotel.find(
        { $text : { $search : req.query.destination } }, //http://stackoverflow.com/questions/24714166/full-text-search-with-weight-in-mongoose
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, hotels) {
        console.log(hotels);
        res.status(200).send(hotels);
    });
});
// router.post('/',function(req,res){
//   db.Hotel.create(req.body,function(error){
//     if (error) return res.json({error:error.message});
//     res.json({ message: 'Hotel created!' });
//   });
// });

//CREATE POST /api/hotels/
router.post('/',function(req,res){
  console.log("REQUEST HEADERS", req.headers);
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
      console.log('DECODED SUBJECT', decoded.sub);
      db.User.findById(decoded.sub, function(err, user) {
        console.log('THIS IS THE USER!', user);
        console.log("THIS IS REQ BODY!", req.body);
        console.log("ALL THE PHOTOS!", req.body.photos);
        console.log("DO WE HAVE AN ARRAY????", Array.isArray(req.body.photos));
        var hotel = new db.Hotel(req.body);
        hotel.user = user;
        // hotel.photos = req.body.photos.split(',');
        hotel.save(function(error,hotel){
          if (error) return res.status(400).send({error:error});
          //201 statu crated
          console.log('IT WORKS!');
          res.status(201).send(hotel);
        });
      });      
    });
  }
});

//GET SHOW /api/hotels/:id
router.get('/:id', function(req,res){
  db.Hotel.findById(req.params.id, function(err, hotel){
    res.send(hotel);
  });
});
//UPDATE PUT /api/hotels/:id
router.put('/:id', function(req,res){
  db.Hotel.findByIdAndUpdate(req.params.id, req.body, function(err,hotel){
    //200 status is ok
    res.status(200).send(hotel);
  });
});
router.delete('/:id', function(req,res){
  db.Hotel.findByIdAndRemove(req.params.id, function(err,hotel){
    res.status(200).send(hotel);
  });
});
module.exports = router;