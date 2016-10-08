module.exports = function (mongoose, modelName) {

    var schema = {
        //_id 采用自增主键
        recordId:mongoose.Schema.Types.ObjectId,
        pageId: Number,
        url : String,
        duration : Number,
        ip:String
    };

    var schemaObj = new mongoose.Schema(schema);
    schemaObj.index({pageId: 1, date:-1});

    return mongoose.model(modelName, schemaObj)

}
