/**
 * Created by yetengfei on 07/10/2016.
 */
module.exports = function (app, co) {
    app // 某个页面，某天的资源耗时展示
        .route('/admin/resource')
        .get(function (req, res) {
            var pageId = req.pageId;
            //找出该页面下，当天资源加载的情况，统计访问数量前100的，并按加载时延倒序排列

        })
};