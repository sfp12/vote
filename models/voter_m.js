var Voter = require('../bookshelf').Voter;
var pool=require("../db").mysqlpool;

var Voter = require('../bookshelf').Voter;

exports.getVoter = function(req, cb){

	Voter.where('id', req.session.voter_id).fetch().then(function(data){
		cb(null, data);
	}).catch(function(err){
		console.log(err);
		cb(null, false);
	})

}
