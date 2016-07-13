// 加载依赖库，原来这个类库都封装在connect中，现在需地注单独加载
var
    express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    useragent = require('express-useragent'),
    app = express();




/**
 * 全局变量/ ThinkPHP?
 * C 配置
 * M 数据model
 * F 方法
 */
global.C = require('./config');
global.M = {};
global.F = require(path.join(C.dir.controller, C.exceptFolder, 'funcs'));


app.use(favicon(path.join(C.dir.root, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(useragent.express());
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 6000}));




require(path.join(C.dir.model, C.exceptFolder)); // model初始化入口
require(path.join(C.dir.controller, C.exceptFolder))(app); // router初始化入口

// 监听端口
app.listen(C.port);

var report = require('./routes/report');
var admin = require('./routes/admin');

var page = require("./routes/page");


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
