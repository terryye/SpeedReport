var express = require('express');
var router = express.Router();
var db = require("../mod/db");
var co = require('co');
var date = require('datejs');
var fs = require('fs');
var config = require("../mod/config");


/* GET home page. */
router.get('/', function (req, res, next) {

    var ua = req.useragent
    var uaNeed = {
        browser: ua.browser,
        version: ua.version,
        os: ua.os,
        platform: ua.platform
    };

    co(function*() {
        //请求需要的字段
        var fields = {
            "required": [
//      'bizid',  //业务id
                'pageid',    //页面id
            ],
            extra: [
//      'client_ver', //客户端版本
//      'page_ver'    //页面版本
            ],
            timing: [
                'navigationStart',
                'unloadEventStart',
                'unloadEventEnd',
                'redirectStart',
                'redirectEnd',
                'fetchStart',
                'domainLookupStart',
                'domainLookupEnd',
                'connectStart',
                'connectEnd',
                'secureConnectionStart',
                'requestStart',
                'responseStart',
                'responseEnd',
                'domLoading',
                'domInteractive',
                'domContentLoadedEventStart',
                'domContentLoadedEventEnd',
                'domComplete',
                'loadEventStart',
                'loadEventEnd'
            ],
            timemarks: [],
        };

        for (var i = 0; i < 30; i++) {
            fields.timemarks.push(i + "");
        }

        var record = _processData(req.query, fields);
        record.ua = uaNeed;

        if (Math.random() < config.get("recordChance")) {
            yield db.$insert('rawdata', record);
        }
        yield _$updateByHours(record);

    }).catch(function (err) {

        //todo: 错误处理
        console.log(err)
    });

    var emptybmp = 'Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wCAAAAA';
    var img = new Buffer(emptybmp, 'base64');
    res.writeHead(200, {'Content-Type': 'image/x-ms-bmp'});
    res.end(img, 'binary');

});

function * _$updateByHours(record) {
    var hour = parseInt(new Date().toString("yyyyMMddHH"));
    var filter = {
        pageid: {$eq: record.pageid},
        hour: {$eq: hour},
    }
    var tbname = "speedByHours";

    var update = {

        $inc: {
//        timing : {},
//        timingCounts  : {},
//        timemarksCounts : {},
//        timemarks: {}
        }
    }

    var insert = {
        pageid: record.pageid,
        hour: hour,
        timemarks: record.timemarks,
        timemarksCounts: {},
        timing: record.timing,
        timingCounts: {}
    }

    var _dealTime = function (_type, _insert, _update) {
        if (_type == "timemarks") {
            var tms = record.timemarks;
            delete(tms[0]);
            for(var k in tms){
                var gt = k == 1 ? 10000 : 600000;
                if( tms[k] > gt || tms[k] < 0){
                    return false;
                }
            }
        } else if (_type == "timing") {
            var tms = record.timing;
        } else {
            return false;
        }

        if (!tms) {
            return false;
        }

        for (var k in tms) {
            _update.$inc[_type + '.' + k] = tms[k];
            _update.$inc[_type + 'Counts.' + k] = 1;
            _insert[_type + "Counts"][k] = 1;
        }
        return true;
    }

    var r1 = _dealTime("timemarks", insert, update);
    var r2 = _dealTime("timing", insert, update);

    if (r1 && r2) {
        var r = yield db.$updateOne(tbname, filter, update);
        //如果还没有该条纪录,则创建纪录。
        if (r.matchedCount == 0) {
            yield db.$insert(tbname, insert);
        }
    }
}


function _processData(query, fields) {

    var record = {};

    fields.required.forEach(function (k) {
        if (!query.hasOwnProperty(k)) {
            throw new Error("required query var " + k);
        } else {
            record[k] = parseInt(query[k]);
        }

    });

    fields.extra.forEach(function (k) {
        if (query.hasOwnProperty(k)) {
            record[k] = query[k].substr(0, 20);
        }
    });

    function _parsingTimeJson(keyname, fields) {
        if (query[keyname]) {
            try {
                var timejson = JSON.parse(query[keyname]);
                var tmp_time = {};
                fields.forEach(function (k) {
                    if (timejson.hasOwnProperty(k)) {
                        tmp_time[k] = parseInt(timejson[k]);
                    }
                });

                return tmp_time;
            } catch (e) {
                console.log("error parsing timing json")
            }
        }
        return null;
    }

    var timemarks = _parsingTimeJson('timemarks', fields.timemarks);

    if (timemarks != null) {
        record['timemarks'] = timemarks;
    }


    var timing = _parsingTimeJson('timing', fields.timing);
    if (timing != null) {
        record['timing'] = timing;
    }

    record.createtime = (new Date()).getTime();
    record.createdate = (new Date()).toString('yyyy-MM-dd');

    return record;
}


module.exports = router;
