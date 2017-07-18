/*
 * package: open-gtfs-map 
 * copyright nomeQ 2017
 * released under MIT license
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // Render the index template with feed URL form
    res.render('index', { title: 'Open GTFS Map' });
    
});

module.exports = router;
