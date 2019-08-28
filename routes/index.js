var express = require('express');
const connection = require('./../sql');
var router = express.Router();

// 开始连接
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list', (req, res) => {
  res.render('list', { title: 'mock-列表'})
})

router.get('/test', (req, res) => {
  res.render('test', { title: 'mock-测试'})
})

module.exports = router;