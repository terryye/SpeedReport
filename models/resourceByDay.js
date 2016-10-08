module.exports = function (mongoose, modelName) {
    var schema = {
        pageId : Number,
        url  : Object,
        duration : Number,
        date : Date
    };
    var schemaObj = new mongoose.Schema(schema);


    return mongoose.model(modelName, schemaObj);
};
