const { redirect } = require('express/lib/response');

const
  cors = require('cors');
  express = require('express'),
  app = express(),
  formidable = require('formidable'),
  path = require('path'),
  fs = require('fs'),
  throttle = require('express-throttle-bandwidth')
  mime = require('mime');

const
  port = process.env.PORT || 4444



var safesitelist = ['https://nanoom.org', 'http://nanoom.org']

var corsOptions = {
    origin: function(origin, callback) {
        var issafesitelisted = safesitelist.indexOf(origin) !== -1;
        callback(null, issafesitelisted);
    },
    credentials: true
}

//cors설정
app.use(cors());

//cors에 옵션사용할경우
//app.use(cors(corsOptions));


app.set('port', port)
app.use(throttle(10 * 1024 * 1024)) // throttling bandwidth

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/upload', (req, res) => {

  const folder = path.join(__dirname, 'files')

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

app.post('/upload/:folder', (req, res) => {

  const folder = path.join(__dirname, 'files/' + req.params.folder )

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

var getDownloadFilename = require('./library/getDownloadFilename').getDownloadFilename;

app.get('/download/:folder/:file_name/:save_name', function(req, res, next) {

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

app.use('/files', express.static(__dirname + '/files'))

app.get('/', function(req, res) {
    res.send("<center><h1>나눔의교회 파일서버</h1></center>")
})

app.listen(port, () => {
  console.log('\nUpload server running on http://localhost:' + port)
})

