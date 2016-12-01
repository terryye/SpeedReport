module.exports = function (app, co) {
    app // 文章列表
        .route('/admin/perfTiming')
        .get(function (req, res) {
            co(function *() {
/*
                var query = req.query;

                query.date = query.date || F.moment().format("YYYY-MM-DD");
                var strDate =F.escapeHTML(query.date);
                
                var projectId = Number(query.projectId);

                var timeMarkAlias = C.timeMarkAlias;

                //获取结果中的所有页面id的业务名称和页面名称
                var defaultPageIds = [1,2,3,4,5,6,102,103,104];
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
                        var _tm =  (_end - _start )  ? Math.ceil(_end - _start ) : "";

                        _el.timeMarksWithAlias.push( _tm );
                        _el.timeMarksWithAliasCount.push(_el.timeMarksCount[_item.end]);

                    });

                    //补充项目信息
                    _el.projectInfo = projectInfo[_el.projectId] ? projectInfo[_el.projectId] : {};

                });

                //console.log(speedResult);
*/
                res.render("perfTiming",{
                        title: "统一测速"
                    }
                );

            }).catch(F.handleErr.bind(null, res))
        })
};