
/*
 * GET home page.
 */

var fs = require('fs');

exports.index = function(req, res) {
	// console.log( req );
	file = fs.readFileSync('bars.json').toString();
	data = JSON.parse( file );
	res.render('index', { 'title': 'Standish Bar', 'bars': data });
};