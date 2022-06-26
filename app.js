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
  bodyParser = require('body-parser')

const
  port = process.env.PORT || 4444



const whitelist = ["http://nanoom.org", "https://nanoom.org", "https://localhost", "http://localhost:8080"];
//const corsOptions = {
//  origin: function (origin, callback) {
//    if (whitelist.indexOf(origin) !== -1) {
//      callback(null, true);
//    } else {
//      callback(new Error("Not Allowed Origin!"));
//    }
//  },
//};

var corsOptions = {
  origin: 'http://nanoom.org',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//cors설정
//app.use(cors());

//cors에 옵션사용할경우
app.use(cors(corsOptions));


app.set('port', port)
app.use(throttle(10 * 1024 * 1024)) // throttling bandwidth
app.use(bodyParser.json({limit: 5000000}));
app.use(bodyParser.urlencoded({limit: 5000000, extended: true, parameterLimit:50000}));

//* cors 전용 라우터
app.use(async (req, res, next) => {
  // api서버로부터 발급받은 허용된 사용자인지 체크
  var domain = false
  const origin = req.get('origin')
  if (whitelist.indexOf(origin) !== -1) {
    domain = true
  }

  if (domain) {
    // 만약 api서버로부터 발급받은 허용된 사용자라면, cors 설정해주기
    cors({
      origin: req.get('origin'), // origin : true 모두 허용하면 보안상 위험하니까
      credentials: true, // 쿠키 통신 설정 : 인증된 요청
    })(req, res, next); //? 미들웨어 확장 패턴 : 그냥 router.use(cors()) 이렇게 쓰지말고 조건에 따라 미들웨어가 실행괴게 할 수 있다.
  } else {
    next(); // 만일 등록된 도메인이 아니라면 그대로 보내줘서 cors 에러뜨게 놔둔다.
  }
});


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

//app.listen(port, () => {
//  console.log('\nUpload server running on http://localhost:' + port)
//})


const
  http = require('http');
  https = require('https');
  HTTP_PORT = port;
  HTTPS_PORT = 443;
  options = {
    key: fs.readFileSync('./certs/default.key'),
    cert: fs.readFileSync('./certs/default.crt')
  };

// Create an HTTP server.
http.createServer(app).listen(HTTP_PORT, () => {
  console.log('\nUpload server running on http://localhost:' + HTTP_PORT)
})

// Create an HTTPS server.
https.createServer(options, app).listen(HTTPS_PORT, () => {
  console.log('\nUpload server running on https://localhost:' + HTTPS_PORT)
})

