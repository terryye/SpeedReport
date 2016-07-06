var express = require('express');
var router = express.Router();
var db = require("../mod/db");
var date = require('datejs');
var co = require('co');
var biz = require("../mod/biz");
var page = require("../mod/page");
var config = require("../mod/config");

var conf_timemark = {
    "t0": "起始点",
    "t1": "首元素可见时间",
    "t2": "首屏可见时间",
    "t3": "首屏可交互时间",
    "t4": "首屏加载完成",
    "t5": "全部加载完成"
};

/* GET users listing. */
router.get('/', function (req, res, next) {
    co(function*() {

        //默认显示今天所有业务的数据
        //var timestamp_start = new Date().at("0:0").getTime();
        var timestamp_start = 0;
        var map = function () {
            emit({
                    pageid: this.pageid,
                    createdate: (new Date(this.createtime).getFullYear() +"-"+ (new Date(this.createtime).getMonth() + 1) +"-" + new Date(this.createtime).getDate())
//                    createdate: getDateStr(this.createtime)
                },
                {
                    pageid: this.pageid, t1: this.timemarks[1], t2: this.timemarks[2]
                });
        }

        var reduce = function (key, values) {

            var res = {t1: 0, t2: 0, count: 0};

            for(var i=0; i< config.maxTimePoint; i++){
                res['t'+i] = 0;
            }

            values.forEach(function (val) {
                res.t1 += val.t1;
                res.t2 += val.t2
                res.count_t1 += 1
            });

            return res;
        }

        var finalizeFun = function (key, reduceResult) {
            var res = {t1: 0, t2: 0, count: 0}
            res.t1 = (reduceResult.t1 / reduceResult.count).toFixed(2);
            res.t2 = (reduceResult.t2 / reduceResult.count).toFixed(2);
            res.createtime = new Date().getTime();
            return reduceResult;
        }

        yield db.mapReduce('rawdata', map, reduce, {
            "finalize": finalizeFun,
            "out": "SpeedTodayByPage",
            "query": {
                "createtime": {
                    "$gt": timestamp_start
                }
            }
        });

        var result = yield db.find('SpeedTodayByPage');


        var timemarkAlias = conf_timemark;

//获取结果中的所有页面id的业务名称和页面名称
        var pageIds = [];
        result.forEach(function (el) {
            pageIds.push(el._id.pageid);
        })
        var bizinfo = yield biz.fetchAll();
        var pageinfo = yield page.fetchByIds(pageIds);


        result.forEach(function (item) {
            var pageid = item._id.pageid;
            item.pageInfo = pageinfo[pageid] == undefined ? {"name": pageid, bizid: 0} : pageinfo[pageid];

            var bizid = item.pageInfo.bizid;
            item.bizInfo = bizinfo[bizid] == undefined ? {"name": bizid} : bizinfo[bizid];
        })

        console.log(result);


        res.render("pages",
            {
                title: "数据概要",
                speedData: result,
                tbHeader: timemarkAlias,
                pageInfo: pageinfo,
                bizInfo: bizinfo
            }
        );


//

    }).catch(function (e) {

        console.log(e)
    })
})
;

module.exports = router;