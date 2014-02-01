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
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var connect = require('connect');

var app = express();

// API Access link for creating consumer key and secret:
// https://developers.google.com/accounts/docs/RegistrationForWebAppsAuto
// https://accounts.google.com/ManageDomains
var GOOGLE_CONSUMER_KEY = process.env.GOOGLE_CONSUMER_KEY;
var GOOGLE_CONSUMER_SECRET = process.env.GOOGLE_CONSUMER_SECRET;
var GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(
	new GoogleStrategy({
		clientID: GOOGLE_CONSUMER_KEY,
		clientSecret: GOOGLE_CONSUMER_SECRET,
		callbackURL: GOOGLE_CALLBACK_URL
	},
	function(token, tokenSecret, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

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

// app.use(connect.cookieSession({ secret: '@todo new one this secure later make randoms kasd;lkfja;lskdjf1239478gbj,vd>ALkf;ahsd', cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(express.cookieParser('your secret here for nother one'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(connect.cookieSession({ secret: 'new one this secure later', cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(express.session({ secret: 'keyboard cat likes tuna' }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
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

app.get('/auth/google',
	passport.authenticate('google', { scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email']
	}),
	function(req, res){});

app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.get('/', ensureReapAuthenticated, routes.index);

app.get('/login', function(req, res){
	res.render('login');
});

app.get('/test_bar.json', ensureReapAuthenticated, function(req, res) {
	res.sendfile('test_bar.json');
});

// Redirect request to assets folder to standish live site.
app.get(/\/assets.*/, function(req, res) {
	res.redirect( 'http://standishsalongoods.com' + req.originalUrl );
});

// Write selected bar into test JSON file 'test_bar.json'
app.post('/test', ensureReapAuthenticated, function(req, res) {
	var output = {};
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	output.content = data[req.body.bar];
	fs.writeFile( 'test_bar.json', JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote test_bar.json"); }
	});
	res.redirect(303, '/');
});

// Write selected bar into live JSON file as Default
app.post('/publish_default', ensureReapAuthenticated, function(req, res) {
	var output = {};
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	output['default'] = data[req.body.bar];
	// WRITES THE FILE TO A DIFFERENT SERVER, one with SSL for https://
	// @todo 
	fs.writeFile( process.env.STANDISH_PUBLIC_JSON_PATH, JSON.stringify( output , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote "+process.env.STANDISH_PUBLIC_JSON_PATH); }
	});
	res.redirect(303, '/');
});

// Write selected bar into live JSON file
app.post('/publish', ensureReapAuthenticated, function(req, res) {
	data = JSON.parse( fs.readFileSync('bars.json').toString() );
	published = JSON.parse( fs.readFileSync(process.env.STANDISH_PUBLIC_JSON_PATH).toString() );
	published[req.body.bar] = data[req.body.bar];
	// WRITES THE FILE TO A DIFFERENT SERVER, one with SSL for https://
	fs.writeFile( process.env.STANDISH_PUBLIC_JSON_PATH, JSON.stringify( published , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote "+process.env.STANDISH_PUBLIC_JSON_PATH); }
	});
	res.redirect(303, '/');
});

// Remove selected bar from live JSON file
app.post('/unpublish', ensureReapAuthenticated, function(req, res) {
	published = JSON.parse( fs.readFileSync(process.env.STANDISH_PUBLIC_JSON_PATH).toString() );
	delete published[req.body.bar];
	// WRITES THE FILE TO A DIFFERENT SERVER, one with SSL for https://
	fs.writeFile( process.env.STANDISH_PUBLIC_JSON_PATH, JSON.stringify( published , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote "+process.env.STANDISH_PUBLIC_JSON_PATH); }
	});
	res.redirect(303, '/');
});

// Remove selected bar from bars.json
app.post('/delete', ensureReapAuthenticated, function(req, res) {
	var data = JSON.parse( fs.readFileSync('bars.json').toString() );
	delete data[req.body.bar];
	fs.writeFile( 'bars.json', JSON.stringify( data , null, 4 ), function( err ) {
		if(err) { console.log(err); } else { console.log("wrote bars.json"); }
	});
	res.redirect(303, '/');
});

// Write form content into bars.json
app.post('/', ensureReapAuthenticated, function(req, res) {
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

// Authentication Middleware
function ensureReapAuthenticated(req, res, next) {
	if ( req.isAuthenticated() && req.user._json.email.split('@')[1] === 'reapmarketing.com' ) { return next(); }
	res.redirect('/login');
}
