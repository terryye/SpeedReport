var co = require("co");
var app = require("../app");

var schedule = require('node-schedule');

M.mongoose.connection.once("open", function () {
    updateByHour(F.moment());


    schedule.scheduleJob('0 0 * * *', function () {
        updateByHour(F.moment());
    });

    schedule.scheduleJob('0 */10 * * *', function () {
        updateByHour(F.moment().subtract(1, "hours"));
    });

});


function updateByHour(_time) {
    co(function *() {
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