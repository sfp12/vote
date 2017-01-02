var Voter = require('../bookshelf').Voter;
var pool=require("../db").mysqlpool;
var util = require('util');

var Candidate = require('../bookshelf').Candidate;

exports.getCandidate = function(req, cb){

	Candidate.where('voter', req.session.voter_id).fetchAll().then(function(data){
		cb(null, data);
	}).catch(function(err){
		console.log(err);
		cb(null, false);
	})

}