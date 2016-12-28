var mysqlconfig = {
  host: 'localhost',
  // user: 'vstocks',
  // password: 'vstocks',
  user: 'root',
  password: 'root',
  database:'vote',
};

var mysql = require('mysql');
module.exports.mysqlpool  = mysql.createPool(mysqlconfig);