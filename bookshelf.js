var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root',
    database : 'vote',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

exports.Candidate = bookshelf.Model.extend({
  tableName: 'candidate'
});

exports.Voted = bookshelf.Model.extend({
  tableName: 'voted'
});

exports.Users = bookshelf.Model.extend({
  tableName: 'users'
});

exports.Voter = bookshelf.Model.extend({
  tableName: 'voter'
});