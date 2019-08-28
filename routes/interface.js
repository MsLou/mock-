var express = require('express');
const connection = require('./../sql');
var router = express.Router();

/**
 * mock get请求
 */
router.get('/mock/*', function(req, res, next) {
    let mockUrl = ''
    if (req.url.indexOf('?') > -1) {
      mockUrl = req.url.substring(0, req.url.indexOf('?')).replace('/mock', '')
    } else {
      mockUrl = req.url.replace('/mock', '')
    }
    connection.query(`SELECT * FROM mock_list where mock_url='${mockUrl}' and mock_method='get'`, (err, rows) => {
      if (err) {
        res.send(err);
        return
      };
      if (rows.length > 0) {
        res.send(rows[0].mock_response)
        // 调用次数更新
        requestCount(rows[0].mock_count, mockUrl)
      } else {
        res.send({
          errorCode: -1,
          errorMessage: '查询失败！'
        });
      }
    })
  });
  
  /**
   * mock post请求
   */
  router.post('/mock/*', function(req, res, next) {
    let mockUrl = ''
    if (req.url.indexOf('?') > -1) {
      mockUrl = req.url.substring(0, req.url.indexOf('?')).replace('/mock', '')
    } else {
      mockUrl = req.url.replace('/mock', '')
    }
    connection.query(`SELECT * FROM mock_list where mock_url='${mockUrl}' and mock_method='post'`, (err, rows) => {
      if (err) {
        res.send(err);
        return
      };
      if (rows.length > 0) {
        res.send(rows[0].mock_response)
        // 调用次数更新
        requestCount(rows[0].mock_count, mockUrl)
      } else {
        res.send({
          errorCode: -1,
          errorMessage: '查询失败！'
        });
      }
      
    })
  });
  
  /**
   * 查询mock分组
   */
  router.get('/getGroup', (req, res) => {
    connection.query(`SELECT * FROM mock_group order by id asc`, (err, rows) => {
      if (err) {
        res.send({
          data: [],
          errorCode: -1
        })
      }
      res.send({
        data: rows,
        errorCode: 0,
        errorMessage: ''
      })
    })
  })

  /**
   * 查询mock列表
   */
  router.get('/getList', (req, res) => {
    let groupId = req.query.groupId
    let sql = groupId > 0 ? `SELECT * FROM mock_list where mock_group_id = ${groupId} order by mock_createtime desc` : `SELECT * FROM mock_list order by mock_createtime desc`;
    connection.query(sql, (err, rows) => {
      if (err) {
        res.send({
          data: [],
          errorCode: -1
        })
      }
      res.send({
        data: rows,
        errorCode: 0,
        errorMessage: ''
      })
    })
  })
  
  /**
   * 查询单个mock
   */
  router.get('/getOnlyMock', (req, res) => {
    let mockId = req.query.mockId
    if (!mockId) {
      res.send({data: [], errorCode: -2})
      return
    }
    connection.query(`SELECT * FROM mock_list where mock_id='${mockId}'`, (err, rows) => {
      if (err) {
        res.send({
          data: [],
          errorCode: -1,
          errorMessage: '查询异常'
        })
      }
      res.send({
        data: rows[0] || {},
        errorCode: 0,
        errorMessage: ''
      })
    })
  })
  
  /**
   * 校验mockURL
   */
  router.get('/checkUrl', function (req, res, next) {
    let mockUrl = req.query.mock
    if (!mockUrl) {
      res.send({
        data: null,
        errorCode: -1,
        errorMessage: '参数不能为空！'
      });
      return
    }
    connection.query(`SELECT * FROM mock_list where mock_url='${mockUrl}'`, (err, rows) => {
      if (err) return err;
      if (rows.length > 0) {
        res.send({
          data: null,
          errorCode: -2,
          errorMessage: '已有重复URL，是否还继续添加？'
        });
        return
      }
      res.send({
        data: null,
        errorCode: 0,
        errorMessage: ''
      });
    })
  })
  
  /**
   * 添加mockURL
   */
  router.post('/addUrl', function (req, res) {
    let { mockUrl, responseData, mockMethod } = req.body
    if (!mockUrl) {
      res.send({
        data: null,
        errorCode: -1,
        errorMessage: '参数不能为空！'
      });
      return
    }
    let mockId = (Math.random() + '').replace('0.', '').substring(0, 7)
    let addMockFn = () => {
      connection.query(`INSERT into mock_list values('${mockUrl}', '${responseData}', '${mockMethod}', ${Date.now()}, '${mockId}', 0)`, (err, data) => {
        if (err) return err;
        res.send({
          data: null,
          errorCode: 0,
          errorMessage: ''
        });
      })
    }
    let updateMockFn = () => {
      connection.query(`UPDATE mock_list set mock_response='${responseData}', mock_method='${mockMethod}' where mock_url='${mockUrl}'`, (err, data) => {
        if (err) return err;
        res.send({
          data: null,
          errorCode: 0,
          errorMessage: ''
        });
      })
    }
    connection.query(`SELECT * FROM mock_list where mock_url='${mockUrl}'`, (err, rows) => {
      if (err) return err;
      if (rows.length == 0) {
        addMockFn()
      } else {
        updateMockFn()
      }
    })
    
  })
  
  function requestCount (mock_count, mockUrl) {
    connection.query(`UPDATE mock_list set mock_count='${mock_count + 1}' where mock_url='${mockUrl}'`, (err, data) => {
      if (err) return err;
    })
  }

  module.exports = router;
