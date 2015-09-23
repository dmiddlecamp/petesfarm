var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* GET dash page. */
router.get('/dash', function(req, res, next) {
	res.render('dash', {  });
});

module.exports = router;
