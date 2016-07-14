
var config = {
    maxTimeMarks : 30,  // 最大的时间点个数
    recordChance: 0.1,  // 每一条记录数据入库的比例为 10%

}


module.exports = {
    get : function(_var ){
        return config[_var];
    }
};
