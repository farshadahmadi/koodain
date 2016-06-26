/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/visualdevices              ->  index
 */

'use strict';
var fs = require("fs");

// Gets a list of Visualdevices
exports.index = function (req, res) {
  var visualDevs = fs.readFileSync("./visualdevices/visualdevices.json");
  //res.json([]);
  res.status(200).send(visualDevs);
}
