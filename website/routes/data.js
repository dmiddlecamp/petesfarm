var express = require('express');
var Database = require('../lib/Database.js');
var router = express.Router();



router.get('/', function(req, res, next) {
	res.send({
		routes: [
			{ url: "coop", desc: "chicken coop temperature / sound data" },
			{ url: "tub", desc: "hot tub temperature data" },
			{ url: "weather", desc: "weather station data" }
		]
	});
});

router.get('/coop', function(req, res, next) {

	Database.query("select * from coop").then(function(records) {
		res.send("got some records! ");
	}, function(err) {
		res.send("something went wrong!");
	});

  //res.send('respond with a resource coop');
});

router.get('/tub', function(req, res, next) {
  res.send('respond with a resource tub');
});

router.get('/weather', function(req, res, next) {
  res.send('respond with a resource weather');
});

module.exports = router;
