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
    "t4": "全部加载完成"
};

/* GET users listing. */
router.get('/', function (req, res, next) {
    co(function*() {

        //默认显示今天所有业务的数据
        var timestamp_start = new Date().at("0:0").getTime();
        //var timestamp_start = 0;
        var map = function () {
            emit({
                    pageid: this.pageid,
                    createdate: this.createdate
                },
                {
                    timemarks: this.timemarks,
                    counts:{}
                });
        }

        var reduce = function (key, values) {
            var res = {
                timemarks: {},
                counts: {}
            };

            values.forEach(function (val) {

                for (var k in val.timemarks) {
                    if (res.timemarks[k] == undefined) {
                        res.timemarks[k] = 0;
                        res.counts[k] = 0;
                    }

                    res.timemarks[k] += val.timemarks[k];
                    res.counts[k] += 1
                }
            });

            return res;
        }

        var finalizeFun = function (key, reduceResult) {

            var res = {timemarks:[],counts:[]};

            for (var k in reduceResult.timemarks) {

                if(reduceResult.counts[k] == undefined){
                    reduceResult.counts[k] = 1;
                }

                res.timemarks[k] = (reduceResult.timemarks[k] / reduceResult.counts[k]).toFixed(2);
                res.counts[k] = reduceResult.counts[k];
            }

            res.createtime = new Date().getTime();

            return res;
        }

        yield db.$mapReduce('rawdata', map, reduce, {
                    "finalize": finalizeFun,
            "out": "SpeedTodayByPage",
        });

        var result = yield db.$find('SpeedTodayByPage');


        var timemarkAlias = conf_timemark;

//获取结果中的所有页面id的业务名称和页面名称
        var pageIds = [];
        result.forEach(function (el) {
            pageIds.push(el._id.pageid);
        })

        var bizinfo = yield biz.$fetchAll();
        var pageinfo = yield page.$fetchByIds(pageIds);


        result.forEach(function (item) {
            var pageid = item._id.pageid;
            item.pageInfo = pageinfo[pageid] == undefined ? {"name": pageid, bizid: 0} : pageinfo[pageid];

            var bizid = item.pageInfo.bizid;
            item.bizInfo = bizinfo[bizid] == undefined ? {"name": bizid} : bizinfo[bizid];
        })

        console.log(result);


        res.render("admin",
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