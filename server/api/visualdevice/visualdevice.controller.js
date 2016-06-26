/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/visualdevices              ->  index
 */

'use strict';
var fs = require("fs");
var path = require("path");

// Gets a list of Visualdevices
exports.index = function (req, res) {
  //var visualDevs = fs.readFileSync(__dirname + "../../../visualdevices/visualdevices.json");
  var visualDevs = fs.readFileSync(__dirname + "/visualdevices.json");
  //res.json([]);
  res.status(200).send(visualDevs);
}
