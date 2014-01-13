/*
 * GET home page.
 */

var fs = require('fs');

exports.index = function(req, res) {
	// console.log( req );
	res.render('index', { 
		'title': 'Standish Bar',
		'bars': JSON.parse( fs.readFileSync('bars.json').toString() ),
		'published_bars': JSON.parse( fs.readFileSync( process.env.STANDISH_PUBLIC_JSON_PATH ).toString() ),
		'production_url': process.env.STANDISH_PUBLIC_JSON_URL,
		'editor_name': editor_name,
		'editor_code': editor_code
	});
};