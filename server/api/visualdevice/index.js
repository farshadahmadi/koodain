'use strict';

var express = require('express');
var controller = require('./visualdevice.controller');

var router = express.Router();

router.get('/', controller.index);

module.exports = router;
