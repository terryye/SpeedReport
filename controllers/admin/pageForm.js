module.exports = function (app, co) {
    app // 某个页面的数据
        .route('/admin/pageForm')
        //展示页面表单
        .get(function (req, res) {
            co(function *() {
                var query = req.query;
                //获取所有的项目列表
                var projectInfo = yield M.project.find();
                projectInfo = F._.keyBy(projectInfo, '_id');
                var pageInfo = {};
                if(query._id){
                    pageInfo = yield M.page.findById(query._id);
                    pageInfo.timeMarkAlias = pageInfo.timeMarkAlias;
                }

                //获取页面的id
                res.render("pageForm",
                    {
                        _id : Number(query._id),
                        title: query._id?  "修改页面" : "新增页面",
                        pageInfo : pageInfo,
                        projectInfo: projectInfo,
                        query: req.query
                    }
                );

            }).catch(F.handleErr.bind(null, res))
        })

        //保存结果
        .post(function (req, res) {
            co(function *() {

                var data = req.body;
                try{
                    data.timeMarkAlias = JSON.parse(data.timeMarkAlias)
                }catch(e) {
                    data.timeMarkAlias = [];
                }

                try {
                    var result = yield M.page.create(data);
                    res.json({
                        code:0,
                        data:result
                    });
                } catch(e){

                    res.json({
                        code: -1002,
                        errors: e.errors
                    });

                }
            }).catch(F.handleErr.bind(null, res))
        })
        //修改结果
        .put(function(req,res){
            co(function *() {
                var data = req.body;
                var query = req.query;
                try {
                    var result = yield M.page.update({_id:query._id}, data);

                    res.json({
                        code:0,
                        data:result
                    });

                } catch(e){
                    res.json({
                        code: -1002,
                        errors: e.errors
                    });

                }
            }).catch(F.handleErr.bind(null, res))
        })
};
