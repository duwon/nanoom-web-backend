var express = require('express');
var router = express.Router();

const authMiddleware = require('../middlewares/auth')
const authRouter = require('./auth')
const userRouter = require('./user')
const fileRouter = require('./file')
const boardRouter = require('./board')

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '나눔의교회 파일서버' });
})




router.use('/auth', authRouter)
router.use('/user', authMiddleware)
router.use('/user', userRouter)
router.use('/file', fileRouter)
router.use('/board', boardRouter)

module.exports = router;
