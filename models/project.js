var autoIncrement = require('mongoose-auto-increment');

module.exports = function (mongoose, modelName) {

    var schema = {
        //_id 采用自增主键
        name: String
    };

    var schemaObj = new mongoose.Schema(schema);

    //采用自增加主键
    schemaObj.plugin(autoIncrement.plugin, modelName);

    return mongoose.model(modelName, schemaObj)

}
