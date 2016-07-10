var db = require("./db");


/**
 * 获取给定id的页面信息列表。
 * @param pageIds
 * @returns {Array}
 */
function * $fectchByIds(pageIds) {

    var pageList = [];
    if (pageIds.length > 0) {
        pageList = yield db.$find('page', {
            id: {$in: pageIds}
        });
    }

    var result = {};
    pageList.forEach(function (page) {
        result[page.id] = page;

    });

    return result;
}


function * $fetchByBizId(bizid) {

    bizid = parseInt(bizid);

    var pageList = yield db.$find('page', {
        bizid: {$eq: bizid}
    });
    
    var result = {};
    pageList.forEach(function (page) {
        result[page.id] = page;

    });

    return result;
}

module.exports = {
    $fetchByIds: $fectchByIds,
    $fetchByBizId: $fetchByBizId
};



