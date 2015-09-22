/**
 * Created by middleca on 9/22/15.
 */
var fs = require('fs');
var extend = require('xtend');

var settings = {

	// see overrides.js
	database_config: null,


	_: null
};


var overridesFile = "./overrides.js";
if (fs.existsSync(overridesFile)) {
	try{
		var overridesObj = require(overridesFile);
		settings = extend(settings, overridesObj);
	}
	catch(ex) {
		console.error("error opening overrides ", ex);
	}
}
module.exports = settings;
