var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.checkQuery('gtfs_url', 'Valid URL Required').notEmpty().isUrl();
    req.sanitize('gtfs_url').trim();
    var errors = req.validationErrors();
    var gtfs_url = req.query.gtfs_url;
    if (errors) {
        res.render('map', {title: 'Open GTFS Map', errors: errors});
        return;
    }
    res.render('map', {title: 'Map for ' + gtfs_url});
});

module.exports = router;