var
    funcs = {
        // 格式化日期
//        date: require('datejs'),
        moment: require('moment'),
        // 统一服务错误处理
        handleErr: function (res, err) {
            console.log();
            res.status(500);
            res.json({
                error: err,
                message: err.message,
                errorStack: err.stack
            })
        },
        extend: require('util')._extend
    };

module.exports = funcs;