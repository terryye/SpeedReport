var
    path = require('path'),
    root = path.resolve(__dirname, '..'),
    config = {
        env : "dev",
        db: { // 数据库配置
            uri: 'mongodb://localhost:27017/speed',
            opts: {
                user: '',
                pass: '',
                replset: {
                    socketOptions: {
                        connectTimeoutMS : 5000
                    }
                }
            }
            // reportTimeOutMs:2000,
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
        timeMarkAlias:[
            {
                "name": "首元素可见",
                "end" : 1
            }, {
                "name": "首屏可见",
                "end" : 2
            }, {
                "name": "首屏可交互",
                "end" : 3
            }, {
                "name": "全部完成",
                "end" : 4
            }
        ],
        record:{
            chance: 1,    // 每一条记录数据入库的比例为 100%
            minTimeValue:0, //时间点最小值为0
            maxTimeValue : 600*1000 // 时间点最大值为10分钟
        },
        updatePerRecords: 50,
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
                        "filename": path.join(root, 'logs' ,"app.log"),
                        "maxLogSize": 104800,
                        "backups": 10
                    }
                ],
            "replaceConsole": true,
            "levels":{
                "app" : "INFO"
            }
        }
    };

console.log("start in DEV env");
module.exports = config;