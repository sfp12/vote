var express = require('express');
var router = express.Router();

var admin_c = require('../controllers/admin_c');
var voter_c = require('../controllers/voter_c');
var candidate_c = require('../controllers/candidate_c');
var user_c = require('../controllers/user_c');


router.use('/admin', function(req, res, next){

  if(!req.session.role){
    res.redirect('/login');
    return;
  }
  next();

});


router.get('/index', admin_c.getIndex);


router.post('/addVoter', voter_c.addVoter);

router.get('/getVoter', voter_c.getVoter);

router.get('/switchStatus', voter_c.switchStatus);


router.post('/addCandidate', candidate_c.addCandidate);

router.get('/getCandidate', candidate_c.getCandidate);

router.get('/getRanking', candidate_c.getRanking);


router.post('/uploadUser', user_c.uploadUser);

router.get('/getUser', user_c.getUser);


module.exports = router;
