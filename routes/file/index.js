const 
  express = require('express');
  router = express.Router();
  formidable = require('formidable');
  path = require('path');
  fs = require('fs');
  mime = require('mime');

  /* GET home page. */
router.get('/', function(req, res) {
    res.send("<center><h1>나눔의교회 파일서버</h1></center>")
})


router.post('/upload', (req, res) => {

  const folder = path.join(__dirname, '../../files')

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  const form = new formidable.IncomingForm()
  form.uploadDir = folder

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json'  });
    res.end(JSON.stringify(files , null, 2));

    console.log('\n-----------')
    console.log('Fields', fields)
    console.log('Received:', Object.keys(files))
    console.log()
  });
})

router.post('/upload/:folder', (req, res) => {

  const folder = path.join(__dirname, '../../files/' + req.params.folder )

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  const form = new formidable.IncomingForm()
  form.uploadDir = folder

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json'  });
    res.end(JSON.stringify(files , null, 2));

    console.log('\n-----------')
    console.log('Fields', fields)
    console.log('Received:', Object.keys(files))
    console.log()
  });
})

var getDownloadFilename = require('../../library/getDownloadFilename').getDownloadFilename;

router.get('/download/:folder/:file_name/:save_name', function(req, res, next) {

  var download_folder = 'files/' + req.params.folder + '/';
  var file = download_folder + req.params.file_name; // ex) /upload/files/sample.txt

  console.log('req :', req, ', res :', res, )
  console.log(req.params.file_name)
  console.log(req.params.save_name)

  try {
    if (fs.existsSync(file)) { // 파일이 존재하는지 체크
      var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
      var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴
      
      res.setHeader('Content-disposition', 'attachment; filename=' + getDownloadFilename(req, req.params.save_name)); // 다운받아질 파일명 설정
      
      res.setHeader('Content-type', mimetype); // 파일 형식 지정
    
      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
    } 
    else {
      res.send(file);  
      res.send('해당 파일이 없습니다.');  
      return;
    }
  } catch (e) { // 에러 발생시
    console.log(e);
    res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    return;
  }
});

module.exports = router;