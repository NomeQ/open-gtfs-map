var request = require('request');
var extract = require('extract-zip');
var csv = require('csv');
var fs = require('fs');
var route = require('./route.js');
var parse = require('csv-parse');
var svg = require('./svg.js');

var routes = {};
var stops = {};
var trips = {};
var lats = [];
var lons = [];
var feedname;

/**
 * @param {String} URL for zipped GTFS feed
 * @return {Object} name, map, errors
 **/
var mapFromGTFS = function(gtfs_url, callback) {
	feedname = gtfs_url.split("/").slice(-1)[0];
	var fname = './tmp/' + feedname;
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

// TODO: This gets repetitive. Refactor and stop repeating code.

function importRoutes(dirname, callback) {
	fs.readFile(dirname + 'routes.txt', function(err, data) {
		parse(data, {columns: true, trim: true}, function(err, rows) {
			if (err) {
				callback({name: 'Error', errors:[{msg: err.message}]});
			}
			for (var i = 0; i < rows.length; i++) {
				var route_id = rows[i]['route_id'];
				routes[route_id] = new route(rows[i]);
			}
			importStops(dirname, callback);
		});
	});
}

function importStops(dirname, callback) {
	fs.readFile(dirname + 'stops.txt', function(err, data) {
		parse(data, {columns: true, trim: true}, function(err, rows) {
			if (err) {
				callback({name: 'Error', errors:[{msg:err.message}]});
			}
			for (var i=0; i < rows.length; i++) {
				var stop_id = rows[i]['stop_id'];
				stops[stop_id] = rows[i];
				lats.push(rows[i]['stop_lat']);
				lons.push(rows[i]['stop_lon']);
			}
			importTrips(dirname, callback);
		});
	});
}

function importTrips(dirname, callback) {
	fs.readFile(dirname + 'trips.txt', function(err, data) {
		parse(data, {columns: true, trim: true}, function(err, rows) {
			if (err) {
				callback({name: 'Error', errors:[{msg: err.message}]});
			}
			for (var i = 0; i < rows.length; i++) {
				var route_id = rows[i]['route_id'];
				var shape_id = rows[i]['shape_id'];
				var trip_id = rows[i]['trip_id'];
				// Ignore trips with the same shape for this application
				if (routes[route_id].shapes[shape_id]) {
					continue;
				}
				routes[route_id].trips[trip_id] = [];
				routes[route_id].shapes[shape_id] = [];
				trips[trip_id] = route_id;
			}
			importStopTimes(dirname, callback);
		});
	});
}

function importStopTimes(dirname, callback) {
	fs.readFile(dirname + 'stop_times.txt', function(err, data) {
		parse(data, {columns: true, trim: true}, function(err, rows) {
			if (err) {
				callback({name: 'Error', errors:[{msg: err.message}]});
			}
			for (var i = 0; i < rows.length; i++) {
				var trip_id = rows[i]['trip_id'];
				var stop_id = rows[i]['stop_id'];
				var route_id = trips[trip_id];
				if (!route_id) {
					continue;
				}
				routes[route_id].trips[trip_id].push(stop_id);
			}
			drawShapes(callback);
		});
	});
}

function drawShapes(callback) {
	var map = new svg();
	map.setScale(lats, lons);
	for (var rte_id in routes) {
		// for each route
		var rte = routes[rte_id];
		map.addRouteGroup(rte.getIdName(), rte.getColor());
		var best_trip = rte.getBestTrip();	
		for (var i = 0; i < best_trip.length; i++) {
			var this_stop = stops[best_trip[i]];
			var lat = this_stop['stop_lat'];
			var lon = this_stop['stop_lon'];
			map.addPoint(lat, lon, best_trip[i]);
		}
	}
	map.simplifyPaths();
	// Find the stops the match the 
	map.stops = getBestStops(map.getTransitionCoords());
	
	callback({name: feedname, map: map.export()});
}

// Get stops after simplifying routes. 
function getBestStops(paths) {
	var bestStops = {};
	// Always grab the first and last stop on a path, 
	// also grab any that are significantly far from others
	for ( var i = 0; i < paths.length; i++) {
		var pt_1 = paths[i][0];
		var id_1 = pt_1.id;
		bestStops[id_1] = {'name' : stops[id_1].stop_name, 'x' : pt_1.x, 'y' : pt_1.y};
		var pt_2 = paths[i][paths[i].length - 1];
		var id_2 = pt_2.id;
		bestStops[id_2] = {'name' : stops[id_2].stop_name, 'x' : pt_2.x, 'y' : pt_2.y};
	}
	// TODO: Remove stops that are too close together
	
	return bestStops;
}

function getSqDist(p1, p2) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

module.exports = mapFromGTFS;