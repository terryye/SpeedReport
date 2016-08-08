var autoIncrement = require('mongoose-auto-increment');

module.exports = function (mongoose, modelName) {

    var schema = {
        //_id 采用自增主键
        "name": {
            type: String,
            required:true,
            msg: '请输入页面名称'
        },
        "projectId": {
            type: Number,
            min: 1,
            msg: '请选择所属项目'
        },
        "owner": String,
        "pdm": String,
        "timeMarkAlias" : {
            type: Array,
            validate : validateTimeMarkAlias()
        }
    };

    var schemaObj = new mongoose.Schema(schema);

    //采用自增加主键
    schemaObj.plugin(autoIncrement.plugin, modelName);

    return mongoose.model(modelName, schemaObj);

}

function validateTimeMarkAlias(timeMarkAlias){
    return [
        function(timeMarkAlias){
            return true
        },
        "格式不正确"
    ]
}