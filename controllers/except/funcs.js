var
    funcs = {
//        date: require('datejs'),
        _: require("lodash"),
        moment: require('moment'),
        escapeHTML : require("escape-html"),

        // 统一服务错误处理
        handleErr: function (res, err) {
            console.log();
            res.status(500);
            if (C.env == "dev"){
                res.json({
                    error: err,
                    message: err.message,
                    errorStack: err.stack
                })
            }else{
                res.json({
                    error: "System Busy"
                })
            }
        }

    };

module.exports = funcs;