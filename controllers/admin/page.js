module.exports = function (app, co) {
    app // 某个页面的数据
        .route('/admin/page')
        .get(function (req, res) {
            co(function *() {

                var query = req.query;
                query.dateStart  = query.dateStart ||  F.moment().subtract(15, "days").format("YYYY-MM-DD");
                query.dateEnd  = query.dateEnd ||  F.moment().format("YYYY-MM-DD");

                var strDateStart = F.escapeHTML(query.dateStart);
                var strDateEnd = F.escapeHTML(query.dateEnd);

                var pageId = Number(query.pageId);
                var timeMarkAlias = C.timeMarkAlias;

                //获取结果中的所有页面id的业务名称和页面名称
                var thisPageInfo = yield M.page.findOne({_id: pageId});
                var projectId = thisPageInfo['projectId'];
                //console.log("thisPageInfo", thisPageInfo);

                //获取最近10天的测速记录
                var speedResult = yield findByDate(strDateStart, strDateEnd, pageId);
                speedResult = F._.orderBy(speedResult,['createDate'],['desc']);
                //console.log("speedResult", speedResult);

                //获取所有的项目列表
                var projectInfo = yield M.project.find();
                projectInfo = F._.keyBy(projectInfo, '_id');

                var thisProjectInfo = projectInfo[projectId];

                //获取该项目下的所有页面的列表
                var pageInfo = yield M.page.find({projectId: projectId});
                pageInfo = F._.keyBy(pageInfo, '_id');

                var timeMarkAliasPage = thisPageInfo.timeMarkAlias || [];

                timeMarkAlias = timeMarkAlias.concat(timeMarkAliasPage);

                console.log(timeMarkAlias);

                //补充记录所需的页面和项目信息。
                speedResult.forEach(function (_el) {
                    //补充页面名称
                    _el.pageInfo = thisPageInfo;
                    //补充项目信息
                    _el.projectId = thisPageInfo.projectId;
                    _el.projectInfo = thisProjectInfo;

                    _el.timeMarksWithAlias = [];
                    _el.timeMarksWithAliasCount = [];
                    timeMarkAlias.forEach(function(_item){

                        var _start = _item.start > 0 ? _el.timeMarks[_item.start] : 0;
                        var _end = _el.timeMarks[_item.end];

                        var _tm =  (_end - _start )  ? Math.ceil(_end - _start ) : "";

                        _el.timeMarksWithAlias.push( _tm);
                        _el.timeMarksWithAliasCount.push(_el.timeMarksCount[_item.end]);

                    });

                });


                res.render("page",
                    {
                        title: "数据详情",
                        speedResult: speedResult,
                        timeMarkAlias: timeMarkAlias,
                        pageInfo: pageInfo,
                        thisPageInfo: thisPageInfo,
                        thisProjectInfo: thisProjectInfo,
                        query: req.query

                    }
                );

            }).catch(F.handleErr.bind(null, res))
        })
};


function * findByDate(_strDateStart, _strDateEnd, _pageId) {

    var _dateStart = _strDateStart === null ? F.moment().subtract(10, "days") : F.moment(_strDateStart);
    var _dateEnd = _strDateEnd === null ? F.moment() : F.moment(_strDateEnd);

    var _dateMin = Number(_dateStart.format("YYYYMMDD00"));
    var _dateMax = Number(_dateEnd.format("YYYYMMDD24"));
    var _keys = function (doc) {
        return {
            pageId: doc.pageId,
            createDate: Math.floor(doc.createHour / 100)
        };
    };

    var _condition = {
        createHour: {$gte: _dateMin, $lte: _dateMax}
    };

    if (_pageId) {
        _condition.pageId = _pageId;
    }

    var _initial = {
        timeMarks: {},
        timeMarksCount: {},
        timings: {},
        timingsCount: {}
    };

    var _reduce = function (doc, prev) {
        ['timeMarks', 'timings'].forEach(function (ns) {
            var tms = doc[ns];
            var cnts = doc[ns + 'Count'];
            var prevTms = prev[ns];
            var prevTmsCounts = prev[ns + 'Count'];
            for (var k in tms) {
                if (prevTms[k] == undefined) {
                    prevTms[k] = tms[k];
                    prevTmsCounts[k] = cnts[k];
                } else {
                    prevTms[k] += tms[k];
                    prevTmsCounts[k] += cnts[k];
                }
            }
        })
    };

    var _finalize = function (doc) {
        ['timeMarks', 'timings'].forEach(function (ns) {
            var tms = doc[ns];
            var cnts = doc[ns + 'Count'];
            for (var k in tms) {
                tms[k] = (tms[k] / cnts[k]).toFixed(1);
            }
        })
    };
    var col = M.resultByHour.collection;

    var result = yield col.group(_keys, _condition, _initial, _reduce, _finalize, true);


    return result;
}