var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '나눔의교회 파일서버' });
})


module.exports = router;
