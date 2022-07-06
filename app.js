const { redirect } = require('express/lib/response');

const
  cors = require('cors');
  express = require('express');
  app = express();
  throttle = require('express-throttle-bandwidth');
  bodyParser = require('body-parser')
  cookieParser = require('cookie-parser');
  logger = require('morgan');
  path = require('path');

const
  port = process.env.PORT || 4444
 
  
var corsOptions = {
  origin: 'https://nanoom.org',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use(logger('dev'));
app.set('port', port)
app.use(throttle(10 * 1024 * 1024)) // throttling bandwidth
app.use(bodyParser.json({limit: 5000000}));
app.use(bodyParser.urlencoded({limit: 5000000, extended: true, parameterLimit:50000}));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set the secret key variable for jwt
const { jwt } = require('./nanoomDBConfig')
app.set('jwt-secret', jwt.secret)

const whitelist = ["http://nanoom.org", "https://nanoom.org", "https://localhost", "http://localhost:8080"];
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

const indexRouter = require('./routes/index')

app.use('/', indexRouter)
app.use('/files', express.static(__dirname + '/files'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

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

// Connect Maria DB
const { maria } = require('./nanoomDBConfig');
maria.connect();

// Connect Mongo DB
const mongoose = require('mongoose')
const { mongo } = require('./nanoomDBConfig')
mongoose.connect(mongo.Uri)
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error)
db.once('open', ()=>{
    console.log('connected to mongodb server')
})

