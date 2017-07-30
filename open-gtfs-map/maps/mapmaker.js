var request = require('request');
var extract = require('extract-zip');
var csv = require('csv');
var fs = require('fs');

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
	extract(fname, function(err) {
		if (err) {
			callback({name: 'Error', errors:[{msg: "Error unzipping feed"}]});
		}
		
	});
}

module.exports = mapFromGTFS;