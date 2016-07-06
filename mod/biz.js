var db  = require("./db");



/**
 * 获取所有的业务列表
 *
 * 因为业务的数量不会太多(<1000),因此一次全量获取。
 *
 * @returns {Array}
 */

function * fetchAll(){
    var bizList = yield db.find('biz');

    var result = {};

    bizList.forEach(function(item){
        result[item.bizid] = item;
    });

    return result;
}

module.exports = {
    fetchAll : fetchAll
};
