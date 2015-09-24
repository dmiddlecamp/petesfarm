/**
 * Created by middleca on 9/22/15.
 */
var fs = require('fs');
var extend = require('xtend');

var settings = {

	// see overrides.js
	database_config: {
		user: null,
		password: null,
		server: null,
		database: 'farm-db',
		driver: "tedious",
		options: {
			encrypt: true
		}
	},
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
else {
	var env_vars = {
		database_config: {
			user: process.env["database_user"],
			password: process.env["database_password"],
			server: process.env["database_server"],
			database: process.env["database_name"],
			driver: process.env["database_driver"]
		}
	};

	settings = extend(settings, env_vars);
}
module.exports = settings;
