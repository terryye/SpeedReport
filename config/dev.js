var
    path = require('path'),
    root = path.resolve(__dirname, '..'),
    config = {
        db: { // 数据库配置
            uri: 'mongodb://localhost:27017/pagespeed',
            opts: {
                user: '',
                pass: ''
            }
        },
        port: 3000, // 程序端口
        dir: { // 目录配置
            root: root,
            model: path.resolve(root, 'models'),
            controller: path.resolve(root, 'controllers'),
            resource: path.resolve(root, '../resource')
        },
        resourceFixUrl: '', // 静态资源web访问修正路径
        exceptFolder: 'except' // model 和 controller 中read dir排除的目录名称
    };

module.exports = config;




