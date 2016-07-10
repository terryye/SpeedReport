var express = require('express');
var router = express.Router();
var db = require("../mod/db");
var date = require('datejs');
var co = require('co');
var biz = require("../mod/biz");
var page = require("../mod/page");
var config = require("../mod/config");
var speed = require("../mod/speed");
var escapeHtml = require("escape-html");


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
        var query = req.query;

        var strDate =  query.date ? escapeHtml(query.date) : false;

        var pageIds = false;
        if(query.bizid > 0){
            var pageforbiz = yield page.$fetchByBizId( query.bizid );
            console.log("pageforbiz",pageforbiz);
            pageIds = Object.keys(pageforbiz);
        }

        var result = yield speed.$fetchByDate(strDate, pageIds );


        console.log("resilt", result);


        var timemarkAlias = conf_timemark;

//获取结果中的所有页面id的业务名称和页面名称
        var pageIds = [];
        result.forEach(function (el) {
            pageIds.push(el.pageid);
        })

        var pageinfo = yield page.$fetchByIds(pageIds);
        var bizinfo = yield biz.$fetchAll();

        result.forEach(function (item) {
            var pageid = item.pageid;
            item.pageInfo = pageinfo[pageid] == undefined ? {"name": pageid, bizid: 0} : pageinfo[pageid];

            var bizid = item.pageInfo.bizid;
            item.bizInfo = bizinfo[bizid] == undefined ? {"name": bizid} : bizinfo[bizid];
        })


        res.render("admin",
            {
                title: "数据概要",
                speedData: result,
                tbHeader: timemarkAlias,
                pageInfo: pageinfo,
                bizInfo: bizinfo,
                query:req.query
            }
        );


//

    }).catch(function (e) {

        console.log(e)
    })
})
;

module.exports = router;