var util = require("util"),
    funcs = {
//        date: require('datejs'),
        _: require("lodash"),
        moment: require('moment'),
        escapeHTML : require("escape-html"),

        // 统一服务错误处理
        handleErr: function (res, err) {
            res.status(500);
            if (C.env == "dev"){
                res.json({
                    code:-1,
                    error: err,
                    message: err.message,
                    errorStack: err.stack
                })
            }else{
                res.json({
                    code:-1,
                    error: "System Busy"
                })
            }
        },
        dump : function(obj){
            console.log(util.inspect(obj,{colors:true }));
        }
    };

module.exports = funcs;