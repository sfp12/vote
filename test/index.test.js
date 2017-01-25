var app = require('../app');
var supertest = require('supertest');
var agent = supertest.agent(app);
var should = require('should');

describe('test/controllers/index.test.js', function(){

	describe('get / and get /vote', function(){

		var testIndex = function(argu, expect, done){
			agent.get('/')
			     .query(argu)
			     .end(function(err, res){
				   	if(err){
				   		return done(err);
				   	}
			   	    res.text.should.containEql(expect);
			   	    done();
			     })
		}

		var testVote = function(argu, expect, done){
			agent.get('/vote')
			     .query(argu)
			     .end(function(err, res){
				   	if(err){
				   		return done(err);
				   	}
			   	    res.text.should.containEql(expect);
			   	    done();
			     })
		}

		// 没有参数 链接错误
		it('should 200 when get /', function(done){
			testIndex({

			}, '链接错误', done);
		})

		// /vote没有session
		describe('get /vote without session.id', function(){

			it('should ** when get /vote', function(done){
				testVote({
					
				}, "https://schedule.bnu.edu.cn/", done);
			})

		})

		// user表中没有user_id
		describe('user table without user_id', function(){

			it('should redirect to /vote when get /', function(done){
				testIndex({
					user_id: '98018a',
					voter_id: 11
				}, '/vote', done);
			})

			it('should have false when get /vote', function(done){
				testVote({
					user_id: '98018a',
					voter_id: 11
				}, "<input id='is_user' type='hidden' value='false' >", done);
			})
		})

		// user_id 跟 code不匹配
		describe('user_id not match code', function(){

			it('should redirect to /vote when get /', function(done){
				testIndex({
					user_id: '98018',
					voter_id: 11,
					code: '4cf5b6782e4920de51a805a7bb775f4f1'
				}, '/vote', done);
			})

			it('should have false when get /vote', function(done){
				testVote({
					user_id: '98018a',
					voter_id: 11,
					code: '4cf5b6782e4920de51a805a7bb775f4f1',
				}, "<input id='is_user' type='hidden' value='false' >", done);
			})
		})

		// voter 不存在
		describe('user_id not match code', function(){

			it('should redirect to /vote when get /', function(done){
				testIndex({
					user_id: '98018',
					voter_id: -1,
					code: '98018&code=4cf5b6782e4920de51a805a7bb775f4f'
				}, '/vote', done);
			})

			it('should have false when get /vote', function(done){
				testVote({
					user_id: '98018a',
					voter_id: -1,
					code: '4cf5b6782e4920de51a805a7bb775f4f',
				}, "没有该投票", done);
			})
		})

		// 投票停用

		// 候选人不存在

		// 查询成功
		describe('get /vote success', function(){

			it('should redirect to /vote when get /', function(done){
				testIndex({
					user_id: '98018',
					voter_id: 11,
					code: '4cf5b6782e4920de51a805a7bb775f4f'
				}, '/vote', done);
			})

			it('should have false when get /vote', function(done){
				testVote({
					user_id: '98018',
					voter_id: 11,
					code: '4cf5b6782e4920de51a805a7bb775f4f',
				}, '<ul class="candidate-list">', done);
			})
		})

		

		
		
	})

	describe('post /vote', function(){

		// 候选人超过10
		it('candidates more than 10', function(){

		})

		// 重复投票
		it('could not vote repeatly', function(){

		})

		// 投票未开始
		it('voter not start', function(){

		})

		// 投票超过结束时间
		it('voter already end', function(){

		})

	})

	describe('login and logout', function(){

		// get /login
		it('admin get login', function(done){
			agent.get('/login')
				 .end(function(err, res){
				 	res.text.should.containEql('登录');
				 	done(err);
				 })
		})

		// post login success
		it('#admin post login', function(done){
			agent.post('/login')
				 .send({
				 	"username": "admin",
				 	"password": "123"
				 })
				 .end(function(err, res){
				 	res.text.should.containEql('成功');
				 	done(err);
				 })
		})

		it('#admin post login', function(done){
			agent.post('/login')
				 .send({
				 	"username": "admin",
				 	"password": "1233"
				 })
				 .end(function(err, res){
				 	res.text.should.containEql('失败');
				 	done(err);
				 })
		})

		// logout
		it('admin logout', function(done){
			agent.get('/logout')
				 .end(function(err, res){
				 	res.text.should.containEql('/login');
				 	done(err);
				 })
		})
	})

	// {
 //     	voter_id: 11,
 //     	user_id: 98018,
 //     	code: '98018&code=4cf5b6782e4920de51a805a7bb775f4f'
 //     }

	
})