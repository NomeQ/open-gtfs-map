var request = require('request');
var extract = require('extract-zip');
var csv = require('csv');
var fs = require('fs');
var route = require('./route.js');
var parse = require('csv-parse');

var routes = [];

/**
 * @param {String} URL for zipped GTFS feed
 * @return {Object} name, map, errors
 **/
var mapFromGTFS = function(gtfs_url, callback) {
	var fname = './tmp/' + gtfs_url.split("/").slice(-1)[0];
	// TODO: check to see if feed has already been downloaded
	
	request(gtfs_url)
	  .pipe(fs.createWriteStream(fname))
	  .on('close', function() {
		  extractFeed(fname, callback);
	  });
};

function extractFeed(feed_zip, callback) {
	var extract_dir = process.cwd() + '/tmp/';	
	extract(feed_zip, {dir: extract_dir}, function(err) {
		if (err) {
			callback({name: 'Error', errors:[{msg: err.message}]});
		}
		importRoutes(extract_dir, callback);
	});
}

function importRoutes(dirname, callback) {
	fs.readFile(dirname, function(err, data) {
		parse(data, {columns: false, trim: true}, function(err, rows) {
			
		});
	});
	callback({name: 'Success'});
}

module.exports = mapFromGTFS;