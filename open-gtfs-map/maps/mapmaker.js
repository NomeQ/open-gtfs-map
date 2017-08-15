/**
 * package: open-gtfs-map 
 * copyright (c) nomeQ 2017
 * Released under the MIT license, see
 * LICENSE for more details.
 *
 * Download and parse GTFS, create map
 **/

var request = require('request');
var extract = require('extract-zip');
var csv = require('csv');
var fs = require('fs');
var route = require('./route.js');
var parse = require('csv-parse');
var svg = require('./svg.js');

var routes;
var stops;
var trips;
var lats;
var lons;
var feedname;

/**
 * @param {String} URL for zipped GTFS feed
 * @return {Object} name, map, errors
 **/
var mapFromGTFS = function(gtfs_url, callback) {
	routes = {};
	stops = {};
	trips = {};
	lats = [];
	lons = [];
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
				var coords = toCartesian(rows[i]['stop_lat'],rows[i]['stop_lon']);
				rows[i].stop_lat = coords.lat;
				rows[i].stop_lon = coords.lon;
				stops[stop_id] = rows[i];
				lats.push(coords.lat);
				lons.push(coords.lon);
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
	map.addLegend(routes);
	
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
		
		if (paths[i].length > 4) {
			var midpoint = Math.floor(paths[i].length / 2);
			var pt_3 = paths[i][midpoint];
			var id_3 = pt_3.id;
			bestStops[id_3] = {'name' : stops[id_3].stop_name, 'x' : pt_3.x, 'y' : pt_3.y};
		}
	}
	// TODO: Remove stops that are too close together
	bestStops = filterStops(bestStops, 500);
	return bestStops;
}

function filterStops(stopList, threshold) {
	var keyList = Object.keys(stopList);
	var toDelete = [];
	for (var i = 0; i < keyList.length - 1; i++) {
		curr_stop = stopList[keyList[i]];
		for (var j = i + 1; j < keyList.length; j++) {
			next_stop = stopList[keyList[j]];
			if (getDist(curr_stop, next_stop) < threshold) {
				toDelete.push(keyList[j]);
			}
		}
	}
	toDelete.forEach(function(key) {
		delete stopList[key];
	});
	return stopList;
}

function getDist(p1, p2) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

// Convert WGS84 coordinates to conventional Cartesian 'North is up' plane
// Basic algorithm from https://gist.github.com/govert/1b373696c9a27ff4c72a
function toCartesian(lat, lon) {
	// const a = 6378137;           // WGS-84 Earth semimajor axis (m)
	//     const b = 6356752.3142;      // WGS-84 Earth semiminor axis (m)
	//     const f = (a-b)/a;           // Ellipsoid Flatness
	//     const e_sq = f * (2 - f);    // Square of Eccentricity
	//
	// var lambda = lat * Math.PI / 180;
	// var phi = lon * Math.PI / 180;
	//
	// var s = Math.sin(lambda);
	// var N = a / Math.sqrt(1 - e_sq * s * s);
	//
	// var x = N * Math.cos(lambda) * Math.cos(phi);
	// var y = N * Math.cos(lambda) * Math.sin(phi);
	// return({lat: x, lon: y});
	return({lat: lat, lon: lon});
}

module.exports = mapFromGTFS;