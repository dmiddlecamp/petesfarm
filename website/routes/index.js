var express = require('express');
var router = express.Router();

var Database = require('../lib/Database.js');
var DataLogic = require('../lib/DataLogic.js');
var Formatters = require('../lib/Formatters.js');
var when = require('when');
var pipeline = require('when/pipeline');

var settings = require('../settings.js');


///* GET home page. */
//router.get('/', function(req, res, next) {
//	res.render('index', { title: 'Express' });
//});

var renderDashboard = function(req, res) {
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
}

/* GET dash page. */
router.get('/', renderDashboard);
router.get('/dash', renderDashboard);

router.get('/health.json', function(req, res) {
	pipeline([
		function() {
			try {
				return Database.query("select count(*) as count from weather");
			} catch(ex) {
				return when.reject(ex);
			}
		},
		function(records) {
			console.log("health - query success");

			res.send({
				database: {
					weather_rows: records[0].count,
					user: settings.database_config.user,
					server: settings.database_config.server,
					database: settings.database_config.database
				}
			});
		}
	]).catch(function(err) {
		res.send(401, { msg: "something went wrong!", error: err});
	})


});

module.exports = router;
