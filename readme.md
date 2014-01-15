# Standish Bar

This application is used to manage the promotional 'Hello Bar' content on StandishSalonGoods.com

To use a custom bar on a page, include the code below. If the bar name is incorrect, the system will revert to the default bar. Only the first occurance of this tag on a given page will be detected by the system.

	<span class="custom_bar" data-bar="OverrideBarName"></span>

## Developers

You will need to set the following ENV vars (in your .bashrc or .bash_profile) to make the application work. The following is a set of defaults that should work well for local development work on this project.

	# Standish Hellobar app vars
	export STANDISH_USERNAME=user
	export STANDISH_PASSWORD=pass
	export STANDISH_PUBLIC_JSON_URL=/test_publish.json
	export STANDISH_PUBLIC_JSON_PATH=public/test_publish.json

If you are setting this app up in a new production enviornment the PUBLIC_JSON_URL should be a intenet accessable 'real' URL, preferably on a server with SSL (https) support. The production envoirnment assumes that you are using a static webserver (Nginx or Apache) on the same server where the Node app is hosted. The enviromnet must allow the node process to read a write files.

Here's the code that pulls the data from the app on the Store site. (frame.html)

	// Start of Hellobar code
	var hbar_slug = 'default';
	// This code will change the slug if it finds an override.
	// <span class="custom_bar" data-bar="OverrideBarName"></span>
	if( $('.custom_bar').length ) {
		hbar_slug = $('.custom_bar').first().data('bar');
	}
	// Hellobar code for getting external data
	$.getJSON( "http://example.com/data.json", function( data ) {
		if( hbar_slug in data ) {
			$('.hbar_content').html( data[hbar_slug] );
		} else {
			$('.hbar_content').html( data['default'] );
		}
	});

`http://example.com/data.json` should match STANDISH_PUBLIC_JSON_PATH.

