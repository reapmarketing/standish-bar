/*
 * GET home page.
 */

var fs = require('fs');

exports.index = function(req, res) {
	// console.log( req );
	file = fs.readFileSync('bars.json').toString();
	data = JSON.parse( file );
	res.render('index', { 
		'title': 'Standish Bar',
		'bars': data,
		'production_url': process.env.STANDISH_PUBLIC_JSON_URL,
		'editor_name': editor_name,
		'editor_code': editor_code
	});
};