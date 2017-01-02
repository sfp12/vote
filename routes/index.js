var express = require('express');
var router = express.Router();

var multiparty = require('multiparty');
var fs = require('fs');
var util = require('util');
var xlsx=require('node-xlsx');
var _ = require('lodash');
var crypto = require('crypto');
var async = require('async');

var Candidate = require('../bookshelf').Candidate;
var Voted = require('../bookshelf').Voted;
var Users = require('../bookshelf').Users;
var Voter = require('../bookshelf').Voter;

var pool=require("../db").mysqlpool;

var voter_m = require('../models/voter_m');
var candidate_m = require('../models/candidate_m');
var voted_m = require('../models/voted_m');

router.use('/admin', function(req, res, next){

  if(!req.session.role){
    res.redirect('/login');
    return;
  }
  next();

});

router.get('/', function(req, res){

  req.session.voter_id = 11;

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
  

})


router.get('/vote', function(req, res, next) {

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
      console.log('err:'+err);

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
  
});


router.post('/vote', function(req, res, next){

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
        voted_m.vote(req, function(err, rs){
          if(err){
            cb(null, false);
          }else{
            cb(null, true);
          }
        })
    },
    function(results, cb){

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
    }
  ], function(err, result){
      console.log('err:'+err);
      console.log('value:'+value);
      res.json({
        code: 1,
        msg: '投票失败'
      })
  })

    

})

// FE end

// admin start

router.get('/login', function(req, res, next){
  res.render('admin-login');
})

router.post('/login', function(req, res, next){

  var u = req.body.username;
  var p = req.body.password;

  if(u === 'admin' && p === '123'){
    req.session.role = 'admin';
    res.json({
      code: 0,
      msg: '登录成功'
    })
  }else{
    res.json({
      code: 1,
      msg: '登录失败'
    })
  }
})

router.get('/admin/index', function(req, res, next) {

  res.render('admin');
  
});

router.post('/admin/addVoter', function(req, res, next){

  var v_n = req.body.v_n;

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
      'voter_status': 0
    }).save().then(function(model){

        res.send({
          code: 0,
          msg: '添加投票成功'
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

})

router.get('/admin/getVoter', function(req, res, next){

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

})

router.get('/admin/switchStatus', function(req, res, next){

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

})

router.post('/admin/addCandidate', function(req, res, next){

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
})

router.get('/admin/getCandidate', function(req, res, next){

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

})

router.get('/admin/getRanking', function(req, res, next) {

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
  
});

router.post('/admin/uploadUser', function(req, res, next){

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
})

router.get('/admin/getUser', function(req, res, next){

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

})

router.get('/admin/logout', function(req, res, next){

  req.session.destroy(function(){
    res.redirect('/login');
  });

})



//admin end


module.exports = router;
