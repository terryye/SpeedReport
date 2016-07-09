
var config = {
    maxTimeMarks : 20,  //最大的时间点个数
    timingChance: 0.1


}


module.exports = {
    get : function(_var ){
        return config[_var];
    }
};
