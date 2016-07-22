var
    path = require('path'),
    root = path.resolve(__dirname, '..'),
    config = {
        env : "prod",
        db: { // 数据库配置
            uri: 'mongodb://localhost:27017/speed',
            opts: {
                user: '',
                pass: ''
            }
        },
//        port: 3000, // 程序端口 在./bin/www中配置
        dir: { // 目录配置
            root: root,
            model: path.resolve(root, 'models'),
            controller: path.resolve(root, 'controllers'),
            resource: path.resolve(root, '../resource')
        },
        resourceFixUrl: '', // 静态资源web访问修正路径
        exceptFolder: 'except', // model 和 controller 中read dir排除的目录名称
        maxTimeMarks: 30,  // 最大的时间点个数
        timeMarkAlias:{
            "0": "起始点",
            "1": "首元素可见时间",
            "2": "首屏可见时间",
            "3": "首屏可交互时间",
            "4": "全部加载完成"
        },
        record:{
            chance: 0.1,    // 每一条记录数据入库的比例为 100%
            minTimeValue:0, //时间点最小值为0
            maxTimeValue : 600*1000 // 时间点最大值为10分钟
        },
        log:{
            "appenders":
                [
                    {
                        "type":"console",
                        "category":"console"
                    },
                    {
                        "category":"app",
                        "type": "file",
                        "filename": "./logs/app.log",
                        "maxLogSize": 104800,
                        "backups": 10
                    }
                ],
            "replaceConsole": true,
            "levels":{
                "app" : "ERROR"
            }
        }
    };
console.log("start in PROD env");
module.exports = config;