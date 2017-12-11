/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */


function errorHandler(res) {
  return function(err) {
    console.log(err);
    if (typeof err === 'number') {
      res.status(err).json({"error": err});
    }
    else if (err.name === 'MongoError' && err.code === 11000) {
      res.status(400).json({error: "Already exists"});
    }
    else if (err.name === 'RequestError') {
      //console.log(err);
      res.status(500).json(err);
      //res.status(500).json({error: "Request error"});
    }
    else if(err.name === 'StatusCodeError') {
      //console.log(err);
      res.status(err.statusCode).json(err);
    } else {
      //console.log(err.toString());
      res.status(500).json({error: 'Uknown Error'});
    }
  };
}

exports.errorHandler = errorHandler;
