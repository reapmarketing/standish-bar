
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.basicAuth(process.env.STANDISH_USERNAME, process.env.STANDISH_PASSWORD));
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
// app.get('/users', user.list);

app.get('/current.json', function(req, res) {
	res.sendfile('current.json');
});

// Redirect request to assets folder to standish live site.
app.get(/\/assets.*/, function(req, res) {
	res.redirect( 'http://standishsalongoods.com' + req.originalUrl );
});

// Write selected bar into live JSON file 'current.json'
app.post('/use', function(req, res) {
	var output = {};
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	output.content = data[req.body.bar];
	// WRITE THE FILE TO A DIFFERENT SERVER. THIS ONE IS AUTH PROTECTED
	fs.writeFile( 'current.json', JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("JSON file saved"); }
	});
	res.redirect(303, '/');
});

// Remove selected bar from bars.json
app.post('/remove', function(req, res) {
	var data = JSON.parse( fs.readFileSync('bars.json').toString() );
	delete data[req.body.bar];
	fs.writeFile( 'bars.json', JSON.stringify( data , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("JSON file saved"); }
	});
	res.redirect(303, '/');
});

// Write form content into bars.json
app.post('/', function(req, res) {
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	data[req.body.name] = req.body.markup;
	fs.writeFile( 'bars.json', JSON.stringify( data , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("JSON file saved"); }
	});
	res.redirect(303, '/');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
