/*
 * package: open-gtfs-map 
 * copyright nomeQ 2017
 * released under MIT license
 */

var express = require('express');
var mapFromGTFS = require('../mapmaker.js');
var router = express.Router();

/* GET map page */
router.get('/', function(req, res, next) {
    // Check that the input is formatted as a valid URL
    req.checkQuery('gtfs_url', 'Valid URL Required').notEmpty().isUrl();
    req.sanitize('gtfs_url').trim();
    var errors = req.validationErrors();
    var gtfs_url = req.query.gtfs_url;
    // If errors, URL is empty or invalid. Don't echo out form field; 
    // invalid URL format could include XSS. Re-displays form.
    if (errors) {
        res.render('map', {title: 'Open GTFS Map', errors: errors});
        return;
    }
    // Download and process feed on server 
    // TODO: Move CPU-bound computation to separate server/consider moving to
    // client-side
    var map = mapFromGTFS(gtfs_url);
    
    // Render the SVG map, or any processing errors
    res.render('map', {title: 'Map for ' + gtfs_url, map: map.map, errors: map.errors});
});

module.exports = router;