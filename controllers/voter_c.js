
var Voter = require('../bookshelf').Voter;

exports.addVoter = function(req, res){

	var v_n = req.body.v_n;

	var v_s = 0;
	if(req.body.v_s){
		v_s = req.body.v_s;
	}

	// 先查询 是否有重复的
	Voter.where('voter_name', v_n).fetch().then(function(data){

	  if(data){
	    res.send({
	      code: 1,
	      msg: '已有该投票'
	    });
	    return;
	  }

	  // insert
	  new Voter({
	    'voter_name': v_n,
	    'voter_start_time': req.body.v_s_t,
	    'voter_end_time': req.body.v_e_t,
	    'voter_desc': req.body.v_d,
	    'voter_status': v_s
	  }).save().then(function(model){
	      res.send({
	        code: 0,
	        msg: '添加投票成功',
	        id: model.id
	      });

	  }).catch(function(err){
	      console.log(err);
	      res.send({
	        code: 1,
	        msg: '添加投票失败'
	      });
	  });

	}).catch(function(err){
	  console.log(err);
	  res.send({
	    code: 1,
	    msg: '查询投票（是否重复）失败'
	  });
	});

}

exports.getVoter = function(req, res){

	Voter.forge().fetchAll().then(function(data){
	  res.json({
	    code: 0,
	    result: data.toJSON(),
	    msg: '查询所有投票成功'
	  })
	}).catch(function(err){
	  console.log(err);
	  res.json({
	    code: 1,
	    msg: '查询所有投票失败'
	  })
	})

}

exports.switchStatus = function(req, res){

	var id = req.query.id;
	var status = req.query.status;

	Voter.where(
	  "id", '=', id)
	.save({
	  "voter_status": status
	}, {patch: true}).then(function(data){
	  res.json({
	    code: 0,
	    msg: '切换成功'
	  })
	}).catch(function(err){
	  console.log(err);
	  res.json({
	    code: 1,
	    msg: '切换失败'
	  })
	})

}

