/**
 * package: open-gtfs-map 
 * copyright (c) nomeQ 2017
 * Released under the MIT license, see
 * LICENSE for more details.
 *
 * Express App and middleware setup
 **/

// Required packages
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validUrl = require('valid-url');

// Routes for the two possible pages
var index = require('./routes/index');
var mapPage = require('./routes/map');

var app = express();

// View engine setup, use Jade for html templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware for logging, parsing, validation
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator({
    customValidators: {
        isUrl: function(url_string) {
            return validUrl.isUri(url_string);
		},
		isZip: function(url_string) {
			return url_string.slice(-3) === 'zip';
		}
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Route paths for homepage and map page
app.use('/', index);
app.use('/map', mapPage);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
