'use strict';

var express = require('express');
var hosts = require('./visualdevice.controller');

var router = express.Router();

router.get('/', hosts.list);
router.post('/', hosts.create);

module.exports = router;
