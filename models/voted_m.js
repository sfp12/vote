var Voter = require('../bookshelf').Voter;
var pool=require("../db").mysqlpool;

var _ = require('lodash');

var Voted = require('../bookshelf').Voted;

exports.getVoted = function(req, cb){

	pool.getConnection(function(err, conn) {
	  if(err){
	    console.log(err);
	    console.log('查询投票结果失败');
	    cb(err, false);
	    return;
	  }

	  // 查询投票结果
	  var sql = 'SELECT candidate.id, candidate.candidate_name, count(voted.candidate_id) FROM candidate left join voted on candidate.id = voted.candidate_id where candidate.voter = '+req.session.voter_id+' group by candidate.candidate_name,candidate.id,voted.candidate_id order by count(voted.candidate_id) desc';

	  conn.query(sql, function(err, result) {
	    if(err){
	      console.log(err);
	      console.log('查询投票结果失败');
	    	cb(err, false);
	      return;
	    }

	    cb(null, result);
	    conn.release();
	  });
	});

}

exports.getVotedOne = function(req, cb){

	new Voted({
	  'voter': req.session.voter_id,
	  'user_id': req.session.user_id
	}).fetch().then(function(data){
		cb(null, data);
	}).catch(function(err){
		console.log(err);
		cb(null, false);
	})

}

exports.vote = function(req, cb){

	pool.getConnection(function(err, conn) {
		if(err){
			console.log(err);
			console.log('查询投票结果失败');
			cb(err, false);
			return;
		}

	    var candidates_a = [];

		_.each(req.session.candidates_id, function(d, i){
			candidates_a.push([req.session.user_id, d+'', req.session.voter_id]);
		})

	  var sql = "INSERT INTO voted (user_id, candidate_id, voter) VALUES ?";

	  conn.query(sql, [candidates_a], function(err, result) {
	    if(err){
	      console.log(err);
	      console.log('投票失败');
	      cb(err, false);
	      return;
	    }

	    cb(null, true);
	    conn.release();
	  });
	}); 

}