const
 express = require('express');
 router = express.Router();
 maria = require('../../nanoomDBConfig')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', function(req, res, next) {
  const sqlQuery = 'SELECT * FROM `nanoom`.`xe_documents` WHERE module_srl IN (3812) ORDER BY `regdate` DESC LIMIT 1000'; // 쿼리 설정
  maria.query(sqlQuery, function(err, rows, fields) { // DB에서 데이터 가져옴
    if(!err) { // 정상이면 데이터 전송
      res.send({
        total: rows.length,
        data: rows
      }); 
    } else { // Error 발생 시 콘솔창에 표시하고 전송
      console.log("Error : ", err);
      res.send(err);
    }
  });
});

module.exports = router;
