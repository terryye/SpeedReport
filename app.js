// @flow

// 加载依赖库，原来这个类库都封装在connect中，现在需地注单独加载
"use strict";

var
    express = require('express'),
    path = require('path'),
    log4js = require('log4js'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    useragent = require('express-useragent'),
    cors = require('cors'),
    app = express();

/**
 * 全局变量/ ThinkPHP?
 * C 配置
 * M 数据model
 * F 方法
 * _ lodash  JS基本操作的扩展
 */
global.C = require('./config');
global.M = {};
global.F = require(path.join(C.dir.controller, C.exceptFolder, 'funcs'));

log4js.configure(C.log);
app.use(log4js.connectLogger(log4js.getLogger("app"), {level: 'auto'}));
app.use(favicon(path.join(C.dir.root, 'public', 'favicon.ico')));

app.use(cors({
    origin:[/\.xunlei\.com$/]
}));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(useragent.express());
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 6000}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

require(path.join(C.dir.model, C.exceptFolder)); // model初始化入口
require(path.join(C.dir.controller, C.exceptFolder))(app); // router初始化入口

module.exports = app;