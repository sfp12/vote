var multiparty = require('multiparty');
var xlsx=require('node-xlsx');
var _ = require('lodash');

var pool=require("../db").mysqlpool;

var Users = require('../bookshelf').Users;

exports.uploadUser = function(req, res){

	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
	   
	  if(err){
	    console.log('parse error:'+err);
	  }else{
	    var input_file = files.file[0];
	    var uploaded_path = input_file.path;
	    var v_id = fields.v_id[0];

	    
	    var obj = xlsx.parse(uploaded_path);
	    
	    // 二维数组
	    var data = obj[0].data;

	    // 导入 候选人
	    // _.map(data, function(d, i){
	    //   return d.push(v_id, '');
	    // })

	    // pool.getConnection(function(err, conn) {
	    //   if(err){
	    //     console.log(err);
	    //     res.send(JSON.stringify({
	    //         code: 1,
	    //         msg: '导入投票者失败'
	    //       }));
	    //     return; 
	    //   }

	    //   // 检查有无重复
	    //   var sql = "INSERT INTO candidate (candidate_name, candidate_title, candidate_institution, candidate_course, candidate_desc, voter, candidate_image) VALUES ?";

	    //   conn.query(sql, [data], function(err, result) {
	    //     if(err){
	    //       console.log(err);
	    //       res.send(JSON.stringify({
	    //         code: 1,
	    //         msg: '导入投票者失败'
	    //       }));
	    //       return;
	    //     }
	    //     res.send(JSON.stringify({
	    //       code: 0,
	    //       msg: '导入投票者成功'
	    //     }));
	    //   });
	    // });    


	    _.map(data, function(d, i){
	      return d.push('', 0, v_id, 1);
	    })

	    pool.getConnection(function(err, conn) {
	      if(err){
	        console.log(err);
	        res.send(JSON.stringify({
	            code: 1,
	            msg: '导入投票者失败'
	          }));
	        return; 
	      }

	      // 检查有无重复
	      var sql = "INSERT INTO users (username, usernumber, count, voter, role) VALUES ?";

	      conn.query(sql, [data], function(err, result) {
	        if(err){
	          console.log(err);
	          res.send(JSON.stringify({
	            code: 1,
	            msg: '导入投票者失败'
	          }));
	          return;
	        }
	        conn.release();
	        res.send(JSON.stringify({
	          code: 0,
	          msg: '导入投票者成功'
	        }));
	      });
	    });      
	  }
	})

}

exports.getUser = function(req, res){

	Users.where('voter', req.query.v_id).fetchAll().then(function(data){
	  res.json({
	    code: 0,
	    result: data.toJSON()
	  })
	}).catch(function(err){
	  console.log(err);
	  res.json({
	    code: 1,
	    msg: '查找投票者失败',
	    result: {}
	  })
	})

}

