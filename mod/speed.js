var db = require("./db");

/*
 speedByHours  schema
 {
 pageid:101
 hour:2016050601
 timemarks:{
 0: 0
 1: 594,
 2: 1001,
 ...
 },
 timemarksCounts:{
 0:100
 1:100
 2:039
 .....
 },
 timing:{

 },
 timingCounts:{
 }
 */
var tbname = "speedByHours";


/**
 * 获取当日按小时的测速数据
 *
 * @param dateStr 日期的字符串, 例如 2016-07-01  默认为今天
 * @param pageid  页面的id列表,默认为全部页面
 *
 * @returns {Array}
 */

function * $fetchByDate(_strDate, _arrPageId) {

    var _date = _strDate? new Date(_strDate) : new Date();


    var conn = yield db.$conn();
    var col = conn.collection(tbname)

    var _dateMin = parseInt(_date.toString("yyyyMMdd00"));
    var _dateMax = parseInt(_date.toString("yyyyMMdd24"));


    var _keys = {
        pageid: true,
    };

    var _condition = {
        hour: {$gte: _dateMin, $lte: _dateMax}
    };

    if(_arrPageId){

        //
        _arrPageId = _arrPageId.map(function(item){
            return parseInt(item);
        })

        _condition.pageid = {$in:_arrPageId}
    }


    var _initial = {
        timemarks: {},
        timemarksCounts: {},
        timing: {},
        timingCounts: {},
        createdate: _date.toString("yyyy-MM-dd")
    };



    var _reduce = function (doc, prev) {
        ['timemarks','timing'].forEach(function(ns){
            var tms = doc[ns];
            var cnts = doc[ns+'Counts'];
            var prevTms = prev[ns];
            var prevTmsCounts = prev[ns+'Counts'];
            for(var k in tms){
                if(prevTms[k] == undefined){
                    prevTms[k] = tms[k] * cnts[k];
                    prevTmsCounts[k] = cnts[k];
                }else{
                    prevTms[k] += tms[k];
                    prevTmsCounts[k] += cnts[k];
                }
            }
        })
    };

    var _finalize = function ( doc ) {
        ['timemarks','timing'].forEach(function(ns){
            var tms = doc[ns];
            var cnts = doc[ns+'Counts'];
            for(var k in tms){
                tms[k] = (tms[k]/cnts[k]).toFixed(1);
            }
        })
    };


    var result = yield col.group(_keys, _condition, _initial, _reduce, _finalize, true);

    return result;
}

module.exports = {
    $fetchByDate : $fetchByDate
};
