/*
 * package: open-gtfs-map 
 * copyright nomeQ 2017
 * released under MIT license
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    
    res.render('index', { title: 'Open GTFS Map' });
    
});

module.exports = router;
