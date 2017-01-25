
var Candidate = require('../bookshelf').Candidate;

var pool=require("../db").mysqlpool;

exports.addCandidate = function(req, res){

	// insert candidate
	new Candidate({
	  'candidate_name': req.body.candidate_name,
	  'voter': req.body.v_id,
	  'candidate_desc': req.body.candidate_desc,
	  'candidate_image': ''
	}).save().then(function(model){

	    res.json({
	      code: 0,
	      msg: '添加候选人成功'
	    });

	}).catch(function(err){
	    console.log(err);
	    res.json({
	      code: 1,
	      msg: '添加候选人失败'
	    });
	}); 


	// var form = new multiparty.Form();
	// form.uploadDir = "./public/images/";
	// form.parse(req, function(err, fields, files){
	   
	//   if(err){
	//     console.log('parse error:'+err);
	//     res.send(JSON.stringify({
	//       code: 1,
	//       msg: '添加失败'
	//     }));
	//     return;
	//   }else{

	//     var image =  files.candidate_pic[0];
	//     var image_name = (new Date().getTime() - 3214) +'.' + image.originalFilename.substr(image.originalFilename.indexOf('.'));
	//     // insert candidate
	//     new Candidate({
	//       'candidate_name': fields.candidate_name,
	//       'voter': fields.v_id,
	//       'candidate_desc': fields.candidate_desc,
	//       'candidate_image': image_name
	//     }).save().then(function(model){

	//         fs.renameSync(image.path, 'public/images/'+image_name);

	//         res.send(JSON.stringify({
	//           code: 0,
	//           msg: '添加成功'
	//         }));

	//     }).catch(function(err){
	//         console.log(err);
	//         res.send(JSON.stringify({
	//           code: 1,
	//           msg: '添加失败'
	//         }));
	//     });    
	//   }
	// });

}

exports.getCandidate = function(req, res){

	Candidate.where('voter', req.query.v_id).fetchAll().then(function(data){
	  res.json({
	    code: 0,
	    msg: '获取候选人成功',
	    result: data.toJSON()
	  })
	}).catch(function(err){
	  console.log(err);
	  res.json({
	    code: 1,
	    msg: '获取候选人失败',
	    result: {}
	  })
	})

}

exports.getRanking = function(req, res){

	pool.getConnection(function(err, conn) {
	  if(err){
	    console.log(err);
	    res.send(JSON.stringify({
	        code: 1,
	        msg: '查找排名失败'
	      }));
	    return; 
	  }

	  // 检查有无重复
	  var sql = "SELECT candidate.id, candidate.candidate_name, count(voted.candidate_id) FROM candidate left join voted on candidate.id = voted.candidate_id where candidate.voter = "+req.query.v_id+" group by candidate.candidate_name order by count(voted.candidate_id) desc";
	  conn.query(sql, function(err, result) {
	    if(err){
	      console.log(err);
	      res.send(JSON.stringify({
	        code: 1,
	        msg: '查找排名失败'
	      }));
	      return;
	    }
	    conn.release();
	    res.json({
	      code: 0,
	      result: result
	    });
	  });
	}); 

}
