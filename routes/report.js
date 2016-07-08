var express = require('express');
var router = express.Router();
var db = require("../mod/db");
var co = require('co');
var date = require('datejs');
var fs = require('fs');


/* GET home page. */
router.get('/', function (req, res, next) {
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

        for (var i = 0; i <= 20; i++) {
            fields.timemarks.push(i + "");
        }

        //通用参数 sid 业务id   pageid= 页面id , 容器版本(手雷V1/V2)， 页面版本(1,2,3)
        var record = processData(req.query, fields);

        console.log(record);
        yield db.insert('rawdata', record);

    }).catch(function () {
    });

    var emptybmp = 'Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wCAAAAA';
    var img =new Buffer(emptybmp, 'base64');;
    res.writeHead(200, {'Content-Type': 'image/x-ms-bmp' });
    res.end(img, 'binary');

});

function processData(query, fields) {

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
