/**
 * Created by yetengfei on 6/12/16.
 */
/**
 * 测速上报
 * 使用方式：
 * 设置上报起始点 var _timemarks = [ new Date]; //通常置于页面的 head 中
 * 设置首屏可见的时间  _timemarks['onshow']=  new Date; // _timemarks['onshow'] == _timemarks[1];
 * 设置首屏可交互  _timemarks['onactive']= new Date; // _timemarks['onactive'] == _timemarks[2];
 *
 * _timemarks[5] ... _timemarks[20] 这16个时间点为业务可以用于业务自定义上报的时间点。
 *
 * 例如你可以上报 _timemarks[5] ＝ new Date; //ajax 开始请求
 *              _timemarks[6] ＝ new Date; //ajax 完成请求
 * 然后在测速系统的后台配置ajax耗时为 (时间点6-时间点5) 即可。
 *
 */

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            module.exports = factory(root, {});
        });
    } else {
        root.Speed = factory(root, {});
    }

})(window, function (root, param) {

    var _reportUrl = "http://127.0.0.1:3000/report";
    var _keyMax = 20;//时间点个数.(20相当于 0...20)

    var _keyName = {//测速系统公共的上报点的键名称
        0: 0,			//起始时间点
        1: 'firstElement',	    //首屏可见时间  可以选择上报domready时间或者ajax填充首屏后的时间。
        2: 'firstScreen',	//首屏可交互的时间＊ 考核点 *。
        3: 'active',	//首屏可交互的时间＊ 考核点 *。
        4: 'finish'         //页面完全加载时间
    };

    function _log() {
        if (window.console) {
            console.log.apply(console,arguments);
        }
    }

    function _toHash(obj) {
        var tmp = [];
        for (var k in obj) {
            tmp.push(k + "=" + obj[k]);
        }
        return tmp.join("&");
    }

    function _sendSpeed(querystring) {

        var url = _reportUrl + "?" + querystring;

        try {
            var obj = new Image();
            obj.src = url;
            obj.onload = obj.onerror = function () {
            };

        } catch (e) {

        }
    };


    //配置上报测速点的名称
    function configName(conf) {
        for (var k in conf) {
            if (k < 5) {
                _log("warning: you just overwrites the default keyname of page speed report");
            }
            _keyName[k] = conf[k];
        }
        ;
    }

    //处理时间点
    function _processtimemarks(timemarks) {

        var result = {};
        var kname;
        //处理key的映射关系
        for (var k = 0; k <= _keyMax; k++) {
            kname = _keyName[k] || k;
            if (typeof timemarks[kname] == "undefined") {
                continue;
            }

            if (timemarks[kname] instanceof Date) {
                result[k] = timemarks[kname].getTime();

                if (k != 0) {
                    result[k] = result[k] - result[0];
                }
            } else {
                _log('timemarks ' + kname + ' is not a Date object');
            }

        }
        return result;
    }

    //兼容没有JSON.stringify的情况。简单对上报的数值对象输出json
    function _buildTimeJsonString(obj) {
        var tmp_arr = [];
        for (var k in obj) {
            var time = obj[k];
            if (!isNaN(time)) {
                tmp_arr.push('"' + k + '":' + time);
            }
        }
        return '{' + tmp_arr.join(',') + '}';
    }

    //传入上报参数
    function report(pageid, timemarks) {

        if (!pageid) {
            _log("pageid invalid");
            return false;
        }

        //将时间对象转换为时间差值(ms)。
        timemarks = _processtimemarks(timemarks);

        _log('timemarks:', timemarks);
        var pageurl = location.href.replace(location.search, "").replace(location.hash, "");
        //拼接字符串
        var url = encodeURIComponent(pageurl);

        var result = {
            pageid: pageid,
            timemarks: _buildTimeJsonString(timemarks),
            url: url
        };

        if (window.performance && window.performance.timing) {
            result.timing = _buildTimeJsonString(window.performance.timing);
        }

        //拼接请求参数
        var query = _toHash(result) + "&r=" + Math.random();
        _sendSpeed(query);
    };


    return {
        report: report,
        configName: configName
    };


});


/* window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
 _log("错误信息：" , errorMessage);
 _log("出错文件：" , scriptURI);
 _log("出错行号：" , lineNumber);
 _log("出错列号：" , columnNumber);
 _log("错误详情：" , errorObj);
 }*/