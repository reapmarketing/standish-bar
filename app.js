// Globals
editor_name = '';
editor_code = '<p></p>';

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// export STANDISH_USERNAME=exampleuser
// export STANDISH_PASSWORD=examplepass
// export STANDISH_PUBLIC_JSON_URL=//:hyprtxt.com/standish/data.json
// export STANDISH_PUBLIC_JSON_PATH=/var/www/hyprtxt.com/public_html/standish/data.json
// app.use(express.basicAuth(process.env.STANDISH_USERNAME, process.env.STANDISH_PASSWORD));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
// create bars.json file if it does not exist
fs.exists('bars.json', function (exists) {
	if( !exists ) {
		fs.writeFile( 'bars.json', JSON.stringify( {} , null, 4 ), function( err ) {
			if(err) { console.log(err); } else { console.log("JSON file initialized"); }
		});
	}
});

app.get('/', routes.index);

app.get('/test_bar.json', function(req, res) {
	res.sendfile('test_bar.json');
});

// Redirect request to assets folder to standish live site.
app.get(/\/assets.*/, function(req, res) {
	res.redirect( 'http://standishsalongoods.com' + req.originalUrl );
});

// Write selected bar into test JSON file 'test_bar.json'
app.post('/test', function(req, res) {
	var output = {};
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	output.content = data[req.body.bar];
	fs.writeFile( 'test_bar.json', JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote test_bar.json"); }
	});
	res.redirect(303, '/');
});

// Write selected bar into live JSON file 'data.json'
app.post('/publish', function(req, res) {
	var output = {};
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	output.content = data[req.body.bar];
	// WRITES THE FILE TO A DIFFERENT SERVER, one with SSL for https://
	// @todo process.env.STANDISH_PUBLIC_JSON_PATH
	fs.writeFile( '/var/www/hyprtxt.com/public_html/standish/data.json', JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote /var/www/hyprtxt.com/public_html/standish/data.json"); }
	});
	res.redirect(303, '/');
});

// Remove selected bar from bars.json
app.post('/delete', function(req, res) {
	var data = JSON.parse( fs.readFileSync('bars.json').toString() );
	delete data[req.body.bar];
	fs.writeFile( 'bars.json', JSON.stringify( data , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote bars.json"); }
	});
	res.redirect(303, '/');
});

// Write form content into bars.json
app.post('/', function(req, res) {
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	editor_name = req.body.name
	editor_code = req.body.markup;
	data[editor_name] = editor_code;
	fs.writeFile( 'bars.json', JSON.stringify( data , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote bars.json"); }
	});
	// Test the new bar
	var output = {};
	output.content = data[editor_name];
	fs.writeFile( 'test_bar.json', JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote test_bar.json"); }
	});
	res.redirect(303, '/');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
