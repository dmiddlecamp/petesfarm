var express = require('express');
var router = express.Router();

var DataLogic = require('../lib/DataLogic.js');
var Formatters = require('../lib/Formatters.js');
var when = require('when');
var pipeline = require('when/pipeline');


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* GET dash page. */
router.get('/dash', function(req, res, next) {
	pipeline([
		function() {
			return DataLogic.getLatest();
		},
		function(latest) {
			return Formatters.formatLatest(latest);
		},
		function(latestData) {
			res.render('dash', { latest: latestData });
		}
	]);
});

module.exports = router;
