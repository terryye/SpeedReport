/**
 * Created by yetengfei on 19/10/2016.
 */
module.exports = function (app, co) {
    app // 页面列表
        .route('/admin/pageList')
        //展示页面列表
        .get(function (req, res) {
            co(function *() {
                //获取所有的项目列表
                var projectInfo = yield M.project.find();
                projectInfo = F._.keyBy(projectInfo, '_id');
                console.log("projectInfo", projectInfo);


            })
        })
};