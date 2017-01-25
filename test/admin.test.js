var app = require('../app');
var supertest = require('supertest');
var agent = supertest.agent(app);
var should = require('should');
var moment = require('moment');

describe('test/controllers/admin.test.js', function(){

	before(function(done){
		agent.post('/login')
			 .send({
			 	"username": "admin",
				"password": "123"
			 })
			 .end(function(err, res){
			 	done(err);
			 })
	})

	describe('#voter', function(){

		// var voter_name_repeat = 'voter-repeat'+moment().millisecond()+moment().second();
		// var voter_id = 0;
		// it('add voter success', function(done){
		// 	agent.post('/admin/addVoter')
		// 		 .send({
		// 		 	v_n: voter_name_repeat,
		// 		 	v_s_t: moment().subtract(1, 'day').format("YYYY.MM.D"),
		// 		 	v_e_t: moment().add(1, 'day').format("YYYY.MM.D"),
		// 		 	v_d: 'desc',
		// 		 	v_s: 1
		// 		 })
		// 		 .end(function(err, res){
		// 		 	res.text.should.containEql('添加投票成功');
		// 		 	voter_id = JSON.parse(res.text).id;
		// 		 	done(err);
		// 		 })
		// })

		// it('add voter success', function(done){
		// 	agent.post('/admin/addVoter')
		// 		 .send({
		// 		 	v_n: voter_name_repeat,
		// 		 	v_s_t: moment().subtract(1, 'day').format("YYYY.MM.D"),
		// 		 	v_e_t: moment().add(1, 'day').format("YYYY.MM.D"),
		// 		 	v_d: 'desc',
		// 		 	v_s: 1
		// 		 })
		// 		 .end(function(err, res){
		// 		 	res.text.should.containEql('已有该投票');
		// 		 	done(err);
		// 		 })
		// })

		// 查询所有投票
		it('#get voter', function(done){
			agent.get('/admin/getVoter')
				 .end(function(err, res){
				 	res.text.should.containEql('"code":0,');
				 	done(err);
				 })
		})

		// 切换投票状态
		// it('#switch voter', function(done){
		// 	agent.get('/admin/switchStatus')
		// 		 .query({
		// 		 	id: voter_id,
		// 		 	status: 0
		// 		 })
		// 		 .end(function(err, res){
		// 		 	res.text.should.containEql('切换成功');
		// 		 	done(err);
		// 		 })
		// })
		
	})

	describe('candidate', function(){
		
	})

	describe('voted', function(){
		
	})

	describe('user', function(){
		
	})

	after(function(done){
		agent.get('/logout')
			 .end(function(err, res){
			 	done(err);
			 })
	})
	
})