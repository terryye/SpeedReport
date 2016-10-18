/**
 * Created by yetengfei on 6/12/16.
 */
/**
 * 测速上报
 * 使用方式：
 * 设置上报起始点 var _timemarks = [ new Date]; //通常置于页面的 head 中
 * 设置首屏可见的时间  _timemarks['firstElement']=  new Date; // _timemarks['firstElement'] == _timemarks[1];
 * 设置首屏可交互  _timemarks['firstScreen']= new Date; // _timemarks['firstScreen'] == _timemarks[2];
 *
 * _timemarks[10] ... _timemarks[99] 这90个时间点为业务可以用于业务自定义上报的时间点。
 *
 * 例如你可以上报 _timemarks[10] ＝ new Date; //ajax 开始请求
 *              _timemarks[29] ＝ new Date; //ajax 完成请求
 * 然后在测速系统的后台配置ajax耗时为 (时间点6-时间点5) 即可。
 *
 * 上报接口 Speed.report(pageid, _timemarks); //pageid为页面的id,可在管理后台自行申请。
 * 可以配置自定义名称的上报点
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
       var _reportUrl = "http://speed.showapp.xunlei.com/report/";
//    var _reportUrl = "http://localhost:3000/report";
//    _reportUrl ="http://localhost/dashboard/images/bitnami-xampp.png";
//    var _reportUrl = "../report";

    var _keyMax = 100;//时间点个数.()

    var _keyName = {//测速系统公共的上报点的键名称
        0: 0,			//起始时间点
        1: 'firstElement',	    //首元素可见时间
        2: 'firstScreen',	//首屏可见的时间
        3: 'active',	//首屏可交互的时间＊ 考核点 *。
        4: 'finish'         //页面完全加载时间
    };

    function _log() {
        if (window.console) {
            console.log.apply(console, arguments);
        }
    }

    function _toHash(obj) {
        var tmp = [];
        for (var k in obj) {
            tmp.push(k + "=" + obj[k]);
        }
        return tmp.join("&");
    }

    // 采用imgBeacon在跨域,浏览器兼容性上会有更好的支持。 但是上报的数据量较小
    function _sendImage(querystring) {
        var url = _reportUrl + "?" + querystring;
        try {
            var obj = new Image();
            obj.src = url;
            obj.onload = obj.onerror = function () {
            };
        } catch (e) {
        }
    }

    // 发送beacon
    function _sendBeacon(reportUrl, dataString) {
        if (navigator && navigator.sendBeacon) {
            navigator.sendBeacon(reportUrl, dataString);
            return true;
        } else if (XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) { //不支持CORS无法上报。
                xhr.withCredentials = true;
                xhr.open("post", reportUrl, true);
                //xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"); // 和sendBeacon采用同样的头
                xhr.send(dataString);
                return true;
            }
            return true;
        }
        return false;
    }


    //发送采集请求
    function _send(url, query, post) {
        var _queryString = _toHash(query);
        var _url = url + "?" + _queryString;

        //不支持JSON
        if (!JSON || !_sendBeacon(_url, JSON.stringify(post))) {
            _sendImage(_url, _queryString);
        }
    }

//配置上报测速点的名称
    function configName(conf) {
        for (var k in conf) {
            if (k < 10) {
                _log("warning: you just overwrites the default keyname of page speed report");
            }
            _keyName[k] = conf[k];
        }
    }

//处理时间点
    function _processtimemarks(timemarks) {

        var result = {};
        var kname;
        //处理key的映射关系
        for (var k = 0; k < _keyMax; k++) {
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


        //对支持window.performance.getEntries的,采集相关信息
        var resource = {};
        if (window.performance && window.performance.getEntries) {
            // 获取当前页面所有请求对应的PerformanceResourceTiming对象进行分析
            window.performance.getEntries().forEach(function (perf) {
                resource[perf.name] = Math.ceil(perf.duration);
            });

            //将测速的数据和资源的数据一起上报,方便数据分析。
            result.resource = resource;
        }

        //发送上报请求
        _send(_reportUrl, {
            pageid: result.pageid,
            url: result.url,
            timemarks: result.timemarks || {},
            timing: result.timing || {}
        }, {
            resource: result.resource || {}
        });
    }

    return {
        report: report,
        configName: configName
    };

});