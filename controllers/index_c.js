var async = require('async');
var crypto = require('crypto');

var Users = require('../bookshelf').Users;

var voter_m = require('../models/voter_m');
var candidate_m = require('../models/candidate_m');
var voted_m = require('../models/voted_m');

exports.getIndex = function(req, res){
	
	req.session.voter_id = req.query.voter_id;

	var u_number = req.query.user_id;
	// 是否为学生或教职工
	var is_user = false;

	if(!u_number){
	  res.render('index', {
	    err: true,
	    msg: '链接错误',
	    voter: {},
	    candidates: [],
	    list: [],
	    is_user: is_user
	  });
	  return;
	}  

	// 是否在表中
	Users.where({
	  'usernumber': u_number,
	  'voter': req.session.voter_id
	}).fetch().then(function(data){

	  if(!data){
	    req.session.user_id = 'guest';
	  }else{
	    data = data.toJSON();
	    req.session.user_id = data.id;

	    // 验证 usernumber and code
	    var md5 = crypto.createHash('md5');
	    var code = md5.update(u_number+'20161229').digest('hex');
	    var password = code === req.query.code;
	    if(password){
	      is_user = true;
	    }
	  }

	  req.session.is_user = is_user;
	  res.redirect('/vote');
	}).catch(function(err){
	  console.log(err);
	  res.render('index', {
	    err: true,
	    msg: '学工号认证出错',
	    voter: {},
	    candidates: {},
	    list: [],
	    is_user: is_user
	  })
	}) 

};

exports.getVote = function(req, res){

	if(!req.session.user_id){
	  res.redirect('https://schedule.bnu.edu.cn/redirect/redirecturl/2');
	  return;
	}  

	async.parallel([
	  function(cb){

	      voter_m.getVoter(req, function(err, rs){
	        if(err){
	          cb(null, false);
	        }else{
	          cb(null, rs);
	        }
	      })
	      
	  },
	  function(cb){

	      candidate_m.getCandidate(req, function(err, rs){
	        if(err){
	          cb(null, false);
	        }else{
	          cb(null, rs);
	        }
	      })

	  },
	  function(cb){

	      voted_m.getVoted(req, function(err, rs){
	        if(err){
	          cb(null, false);
	        }else{
	          cb(null, rs);
	        }
	      })

	  },
	  function(cb){

	      voted_m.getVotedOne(req, function(err, rs){
	        if(err){
	          cb(null, false);
	        }else{
	          cb(null, rs);
	        }
	      })

	  }
	], function(err, results){

	    if(!results){
	      res.render('index', {
	        err: true,
	        msg: '查询失败',
	        voter: {},
	        candidates: [],
	        list: [],
	        is_user: req.session.is_user
	      })
	      return;
	    }

	    var voter = results[0];
	    var candidates = results[1];
	    var list = results[2];
	    var list_one = results[3];

	    if(!voter){
	      res.render('index', {
	        err: true,
	        msg: '没有该投票',
	        voter: {},
	        candidates: [],
	        list: [],
	        is_user: req.session.is_user
	      })
	      return;
	    }

	    voter = voter.toJSON();

	    if(voter.voter_status === 0){
	      res.render('index', {
	        err: true,
	        msg: '投票被停用',
	        voter: {},
	        candidates: {},
	        list: [],
	        is_user: req.session.is_user
	      })
	      return;
	    }

	    if(!candidates){
	      console.log('没有候选人');
	      candidates = [];
	    }

	    candidates = candidates.toJSON();

	    if(!req.session.is_user){
	      res.render('index', {
	        err: false,
	        msg: '学工号错误',
	        voter: voter,
	        candidates: candidates,
	        list: [],
	        is_user: req.session.is_user
	      })
	      return;
	    }


	    if(!list_one){
	      req.session.voted = false;
	      res.render('index', {
	        err: false,
	        msg: '查询成功',
	        voter: voter,
	        candidates: candidates,
	        list: [],
	        is_user: req.session.is_user
	      });
	      return;
	    }else{
	      req.session.voted = true;
	    }

	    res.render('index', {
	      err: false,
	      msg: '查询成功',
	      voter: voter,
	      candidates: candidates,
	      list: list,
	      is_user: req.session.is_user
	    });

	})

}

exports.postVote = function(req, res){
	
	// 判断是否 已投票, 投票总数是否大于10
	// 插入投票

	var candidates_id =JSON.parse(req.body.candidates);
	var len = candidates_id.length;
	req.session.candidates_id = candidates_id;

	if(len > 10){
	  res.json({
	    code:1,
	    msg: '投票总数大于10'
	  });
	  return;
	}

	if(req.session.voted){
	  res.json({
	    code:1,
	    msg: '不能重复投票'
	  });
	  return;
	}  

	async.waterfall([
	  function(cb){
	      
	    voter_m.getVoter(req, function(err, rs){
	      if(err){
	        cb(null, false);
	      }else{

	        var voter = rs.toJSON();
	        if(new Date(voter.voter_start_time.split('.')).getTime() > new Date().getTime()){
	          cb(null, false);
	        }
	        if((new Date(voter.voter_end_time.split('.')).getTime()+24*60*60*1000) < new Date().getTime()){
	          cb(null, false);
	        }
	        cb(null, true);
	      }
	    })

	  },
	  function(results, cb){

	      if(results){
	        voted_m.vote(req, function(err, rs){
	          if(err){
	            cb(null, false);
	          }else{
	            cb(null, true);
	          }
	        })
	      }else{
	        cb(null, results);
	      }        

	  },
	  function(results, cb){

	    if(results){
	      voted_m.getVoted(req, function(err, rs){
	        if(err){
	          cb(null, false);
	        }
	        res.json({
	          code: 0,
	          msg: '投票成功',
	          result: rs
	        })
	      })
	    }else{
	      res.json({
	        code: 1,
	        msg: '投票失败',
	        result: ''
	      })
	    }
	      
	  }
	], function(err, result){
	    console.log('err:'+err);
	    console.log('value:'+value);
	    res.json({
	      code: 1,
	      msg: '投票失败'
	    })
	})

}