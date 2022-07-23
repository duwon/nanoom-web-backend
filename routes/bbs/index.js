const router = require('express').Router()
const post = require('./post.controller')
const authMiddleware = require('../../middlewares/auth')

router.get('/list', post.GetAllList) // 전체 게시글 목록 조회
router.get('/list/:category', post.GetList) // 카테고리 게시글 목록 조회
router.get('/detail/:id', post.DetailDocuments) // 게시글 상세 조회

router.use('/insert/:category', authMiddleware)
router.post('/insert/:category', post.Create) // 카테고리 게시물 쓰기
router.use('/:_id', authMiddleware)
router.put('/:_id', post.Modify)


module.exports = router