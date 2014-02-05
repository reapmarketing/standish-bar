# Standish Bar

This application is used to manage the promotional 'Hello Bar' content on StandishSalonGoods.com

At the very top of the page, the application will display a test bar. This is not shown on the live site and is there to help you test and develop new bar content. When you save a new bar it will automaticaly be tested in this location when you save your content.

Next the application displays "Published Spots". These are available for use on the site using the Custom Bar Tag method explained below. If tag is not present on the page, or if the bar the tag refers to is not published, the system will use the 'default' bar, which is always shown at the top of this list.

The "Spot Editor" allows you to edit and update, or even copy existing bars. You can duplicate an exiting bar by loading it into the editor with the 'edit' button, changing the title, and saving. Bars are automaticaly loaded for testing when they are saved.

"Available Spots" lists all the saved content in the app, including the test bar, published spots and unused spots. The buttons next to the title allow you to manage, edit, delete and publish spots to the site.

### Custom Bar Tag

To use a custom bar on a page, include the code below somewhere on the page. This will usually be in the description field of a product or category. This code will not display anything on the page. If the bar title is incorrect, the system will revert to the default bar. Only the first occurance of this tag on a given page will be detected by the system.

	<span class="custom_bar" data-bar="OverrideBarTitle"></span>

## Developers

You will need to set the following ENV vars (in your .bashrc or .bash_profile) to make the application work. The following is a set of defaults that should work well for local development work on this project.

	# Standish Hellobar app vars
	export STANDISH_USERNAME=user
	export STANDISH_PASSWORD=pass
	export STANDISH_PUBLIC_JSON_URL=/test_publish.json
	export STANDISH_PUBLIC_JSON_PATH=public/test_publish.json

If you are setting this app up in a new production enviornment the PUBLIC_JSON_URL should be a intenet accessable 'real' URL, preferably on a server with SSL (https) support. The production envoirnment assumes that you are using a static webserver (Nginx or Apache) on the same server where the Node app is hosted. The host envoirnment must allow the node process to read and write files. (No Heroku)

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

