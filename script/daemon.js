#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
// Connection url
var url = 'mongodb://localhost:27017/speed';

var co = require("co");
var app = require("../app");
var schedule = require('node-schedule');


var conn = yield MongoClient.connect(url,null);

M.mongoose.connection.once("open", function () {
    updateByHour(F.moment());
    //deleteRecord();

    //每小时更新一下上一个小时的测速的数据 runs every hours
    schedule.scheduleJob({minute: 1}, function () {
        updateByHour(F.moment().subtract(1, "hours"));
    });

    //每15分钟更新一下当前小时的数据 run at 15 ,30, 45
    schedule.scheduleJob({minute: [15, 30, 45]}, function () {
        updateByHour(F.moment());
    });

    //每天凌晨删除一月前的数据
    schedule.scheduleJob({minute: 0, hour: 3}, function () {
    //    deleteRecord();
    });

});


//10天前的数据,仅保留20%
function deleteRecord() {

    console.log(F.moment().format("YYYY-MM-DD HH:mm:ss"), " Start Delete ");

    var time = F.moment().subtract(1, "days").toDate();
    M.record.collection.remove({
//        createTime: {$lte: time},
        $where: function () {
            return this.createTime % 100 != 0
        }
    }, function () {
        console.log(F.moment().format("YYYY-MM-DD HH:mm:ss"), " End Delete ");
    });


}


function updateByHour(_time) {
    co(function *() {
        console.log(F.moment().format("YYYY-MM-DD HH:mm:ss"), " Start calculate ", _time.format("YYYY-MM-DD HH"));

        var result = yield grouyByHour(_time);

        for (var k in result) {
            var el = result[k];

            //删除数据
            yield M.resultByHour.findOneAndRemove({
                pageId: el.pageId,
                createHour: el.createHour
            });

            //插入数据
            yield M.resultByHour.create(el);
        }

        console.log(F.moment().format("YYYY-MM-DD HH:mm:ss"), result);
    }).catch(function (err) {
        console.log("err", err);
    })
}

function * grouyByHour(_hour) {
    var _time = _hour ? F.moment(_hour) : F.moment();

    var _timeStart = _time.startOf('hour').toDate();
    var _timeEnd = _time.endOf("hour").toDate();

    var _keys = {
        pageId: true
    };

    var _condition = {
        createTime: {$gte: _timeStart, $lte: _timeEnd}
    };

    var _initial = {
        timeMarks: {},
        timeMarksCount: {},
        timings: {},
        timingsCount: {},
        createHour: _time.format("YYYYMMDDHH")
    };

    var _reduce = function (doc, prev) {
        ['timeMarks', 'timings'].forEach(function (ns) {
            var tms = doc[ns];
            var prevTms = prev[ns];
            var prevTmsCounts = prev[ns + 'Count'];

            for (var k in tms) {

                //timeMarks[0]为上报的时间点起始点,没有统计意义。
                if(k === "0"){
                    continue;
                }
                //判断数据是否合法,不合法则抛弃
                if (tms[k] > this.maxTimeValue || tms[k] < this.minTimeValue) {
                    continue;
                }

                if (prevTms[k] == undefined) {
                    prevTms[k] = tms[k];
                    prevTmsCounts[k] = 1;
                } else {
                    prevTms[k] += tms[k];
                    prevTmsCounts[k] += 1;
                }
            }
        })
    };

    _reduce.scope = {
        maxTimeValue: C.record.maxTimeValue,
        minTimeValue: C.record.minTimeValue
    };

    var _finalize = function (doc) {
        /*
         ['timeMarks', 'timings'].forEach(function (ns) {
         var tms = doc[ns];
         var cnts = doc[ns + 'Count'];
         for (var k in tms) {
         tms[k] = (tms[k] / cnts[k]).toFixed(1);
         }
         })
         */
    };

    var col = M.record.collection;

    var result = yield col.group(_keys, _condition, _initial, _reduce, _finalize, true);

    return result;
}