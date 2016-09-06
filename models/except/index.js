var
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

mongoose.Promise = global.Promise;
mongoose.connect(C.db.uri, C.db.opts); // 创建链接
M.mongoose = mongoose;

autoIncrement.initialize(mongoose); //部分表_id采用了自增ID,而不是ObjectID的形式

fs.readdirSync(C.dir.model).forEach(function (name) { // 遍历所有model，目前暂时没有2级目录
    if (path.extname(name) !== '') {
        name = path.basename(name, '.js');
        M[name] = require(path.join(C.dir.model, name))(mongoose, name);
    }
});