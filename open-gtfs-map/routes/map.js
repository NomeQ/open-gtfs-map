/*
 * package: open-gtfs-map 
 * copyright nomeQ 2017
 * released under MIT license
 */

var express = require('express');
var mapFromGTFS = require('../maps/mapmaker.js');
var router = express.Router();

/* GET map page */
router.get('/', async (req, res, next) => {
    // Check that the input is formatted as a valid URL
    req.checkQuery('gtfs_url', 'Valid URL Required').notEmpty().isUrl().isZip();
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
    // TODO: Move CPU-bound computation to separate server
    mapFromGTFS(gtfs_url, function(result) {
    	res.render('map', {title: 'Map for ' + result.name, map: result.map, errors: result.errors});
    });
});

module.exports = router;