module.exports = function (app, co) {
    app
        .route('/report')
        .get(function (req, res) {
            co(function *() {
                //组织数据
                var record = {
                        pageId: req.query.pageid,
                        timings: JSON.parse(req.query.timing),
                        timeMarks: JSON.parse(req.query.timemarks),
                        ua: {
                            browser: req.useragent.browser,
                            version: req.useragent.version,
                            os: req.useragent.os,
                            platform: req.useragent.platform
                        }
                    };

                //计算统计数据
                var resultHour = calculateResultByHour(record);
                var insertObj = resultHour.insertObj;
                var updateObj = resultHour.updateObj;


                //入库统计数据
                var updateResult = yield M.resultByHour.update({
                        pageId: insertObj.pageId,
                        createHour: insertObj.createHour
                    }
                    , updateObj);
                if (updateResult.nModified == 0) {
                    yield M.resultByHour.create(insertObj);
                }

                //入库流水数据
                if(Math.random() < C.record.chance ){
                    M.record.create(record);
                }

                var emptyImg = 'Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wCAAAAA';

                res.writeHead(200, {'Content-Type': 'image/x-ms-bmp'});
                res.end(new Buffer(emptyImg, 'base64'), 'binary');

            }).catch(F.handleErr.bind(null, res))
        })
};

function calculateResultByHour(record) {

    var
        insertObj = {
            createHour:  F.moment().format("YYYYMMDDHH"),
            timeMarksCount: {},
            timingsCount: {}
        },
        updateObj = {
            $inc: {} //init $inc field.
        };
    insertObj = _.merge(insertObj, record); //插入数据时, 部分数据采用record的数据。

    console.log(record);
    ['timeMarks', 'timings'].forEach(function (dataType) {
        var
            countSuffix = "Count",
            tms = insertObj[dataType];

        if (dataType == "timeMarks") {
            if (tms["0"]) {
                delete(tms["0"]);  //timeMarks[0]为上报的时间点起始点,没有统计意义。
            }
            console.log(record);
            //判断数据是否合法,不合法则抛弃
            Object.keys(tms).forEach(function (_key) {
                if (tms[_key] >C.record.maxTimeValue  || tms[_key] < C.record.minTimeValue) {
                    throw new Error("Invalid timeMark Value ");
                }
            })
        }

        if (!tms) {
            throw new Error(`Invalid  ${dataType} Value`);
        }

        Object.keys(tms).forEach(function (_key) {
            updateObj.$inc[`${dataType}.${_key}`] = tms[_key];
            updateObj.$inc[`${dataType}${countSuffix}.${_key}`] = 1;
            insertObj[`${dataType}${countSuffix}`][_key] = 1;
        })

    });


    return {insertObj: insertObj, updateObj: updateObj};
}
