var express = require('express');
var Database = require('../lib/Database.js');
var Formatters = require('../lib/Formatters.js');
var router = express.Router();


router.get('/', function(req, res, next) {
	res.send({
		routes: [
			{ url: "coop.json", desc: "chicken coop temperature / sound data" },
			{ url: "tub.json", desc: "hot tub temperature data" },
			{ url: "weather.json", desc: "weather station data" }
		]
	});
});

router.get('/coop.json', function(req, res, next) {
	var query = "select temp, published_at from coop order by published_at";
	Database.query(query).then(function(records) {
		records = Formatters.timeCop(records, "published_at");
		records = Formatters.bruteForceFilter(records, "temp", -100, 200);

		res.json(records);
	}, function(err) {
		res.send("something went wrong!");
	});
});

router.get('/tub.json', function(req, res, next) {
	var query = "select temp, published_at from tub order by published_at";
	Database.query(query).then(function(records) {
		records = Formatters.timeCop(records, "published_at");
		res.json(records);
	}, function(err) {
		res.send("something went wrong!");
	});
});

router.get('/weather.json', function(req, res, next) {
		var query = "select top 4320 temp1, temp2, humidity, pressure, altitude, wind_mph, soilTemp, published_at " +
			" from weather order by published_at";
	Database.query(query).then(function(records) {
		records = Formatters.timeCop(records, "published_at");
		records = Formatters.bruteForceSmooth(records, "soilTemp", -150, 150);

		res.json(records);
	}, function(err) {
		res.send("something went wrong!");
	});


});

module.exports = router;
