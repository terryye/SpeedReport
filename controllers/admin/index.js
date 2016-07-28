module.exports = function (app, co) {
    app // 文章列表
        .route('/admin/')
        .get(function (req, res) {
            co(function *() {

                var query = req.query;

                query.date = query.date || F.moment().format("YYYY-MM-DD");
                var strDate =F.escapeHTML(query.date);
                
                var projectId = Number(query.projectId);

                var timeMarkAlias = C.timeMarkAlias;

                //获取结果中的所有页面id的业务名称和页面名称
                var defaultPageIds = [101];
                var arrPageIds;
                var pageCond = projectId > 0 ? {projectId: projectId} :  {_id:{$in:defaultPageIds}};
                var pageInfo = yield M.page.find(pageCond);
                pageInfo = F._.keyBy(pageInfo, '_id');
                //console.log("pageInfo", pageInfo);

                arrPageIds = Object.keys(pageInfo);
                //console.log("arrPageIds", arrPageIds);

                //获取所有的项目列表
                var projectInfo = yield M.project.find();
                projectInfo = F._.keyBy(projectInfo, '_id');
                //console.log("projectInfo", projectInfo);


                //获取所有的测速记录
                var speedResult = yield findByDate(strDate, arrPageIds);
                //console.log("speedResult", speedResult);


                //补充记录所需的页面和项目信息。
                speedResult.forEach(function(_el){
                    //补充页面名称
                    _el.pageInfo = pageInfo[_el.pageId] ? pageInfo[_el.pageId] : {};

                    _el.projectId = pageInfo[_el.pageId] ? pageInfo[_el.pageId].projectId : 0;

                    _el.timeMarksWithAlias = [];
                    _el.timeMarksWithAliasCount = [];
                    timeMarkAlias.forEach(function(_item){
                        var _start = _item.start > 0 ? _el.timeMarks[_item.start] : 0;
                        var _end = _el.timeMarks[_item.end];

                        _el.timeMarksWithAlias.push( _end - _start );
                        _el.timeMarksWithAliasCount.push(_el.timeMarksCount[_item.end]);

                    });

                    //补充项目信息
                    _el.projectInfo = projectInfo[_el.projectId] ? projectInfo[_el.projectId] : {};

                });

                //console.log(speedResult);

                res.render("admin",
                    {
                        title: "数据概要",
                        speedResult: speedResult,
                        timeMarkAlias: timeMarkAlias,
                        pageInfo: pageInfo,
                        projectInfo: projectInfo,
                        query: req.query
                    }
                );

            }).catch(F.handleErr.bind(null, res))
        })
};


function * findByDate(_strDate, _arrPageId) {

    var _date = _strDate ? F.moment(_strDate) : F.moment();

    var _dateMin = parseInt(_date.format("YYYYMMDD00"));
    var _dateMax = parseInt(_date.format("YYYYMMDD24"));

    var _keys = {
        pageId: true
    };

    var _condition = {
             createHour: {$gte: _dateMin, $lte: _dateMax}
    };

    if (_arrPageId.length > 0) {
        _arrPageId = _arrPageId.map(Number)
        _condition.pageId = {$in: _arrPageId}
    }


    var _initial = {
        timeMarks: {},
        timeMarksCount: {},
        timings: {},
        timingsCount: {},
        createdate: _date.format("YYYY-MM-DD")
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