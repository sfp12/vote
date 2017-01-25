var express = require('express');
var router = express.Router();

var index_c = require('../controllers/index_c');
var admin_c = require('../controllers/admin_c');

router.get('/', index_c.getIndex);

router.get('/vote', index_c.getVote);

router.post('/vote', index_c.postVote);

router.get('/login', admin_c.getLogin);

router.post('/login', admin_c.postLogin);

router.get('/logout', admin_c.logout);

// 展示
router.get('/show', function(req, res){
	res.render('show.html');
});


module.exports = router;
