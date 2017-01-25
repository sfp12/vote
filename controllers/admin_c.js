

exports.getLogin = function(req, res){

	res.render('admin-login');

}

exports.postLogin = function(req, res){

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

}

exports.logout = function(req, res){

	req.session.destroy(function(){
	  res.redirect('/login');
	});

}

exports.getIndex = function(req, res){

	res.render('admin');  
	
}

