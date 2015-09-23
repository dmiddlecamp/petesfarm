var express = require('express');
var Database = require('../lib/Database.js');
var Formatters = require('../lib/Formatters.js');
var utilities = require('../lib/Utilities.js');
var DataLogic = require('../lib/DataLogic.js');

var router = express.Router();
var when = require('when');


router.get('/', function(req, res, next) {
	res.send({
		routes: [
			{ url: "coop.json", desc: "chicken coop temperature / sound data" },
			{ url: "tub.json", desc: "hot tub temperature data" },
			{ url: "weather.json", desc: "weather station data" },
			{ url: "latest.json", desc: "most recent update from all sensors" }
		]
	});
});



router.get('/coop.json', function(req, res, next) {
	DataLogic.coopQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);

			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/coop.csv', function(req, res, next) {
	DataLogic.coopQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);
			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});


router.get('/tub.json', function(req, res, next) {
	DataLogic.tubQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);
			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/tub.csv', function(req, res, next) {
	DataLogic.tubQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);

			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});


router.get('/weather.json', function(req, res, next) {
	DataLogic.weatherQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);
			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/weather.csv', function(req, res, next) {
	DataLogic.weatherQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);

			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});

router.get('/latest.json', function(req, res, next) {
	DataLogic.getLatest(req).then(
		function(records) {
			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
module.exports = router;
