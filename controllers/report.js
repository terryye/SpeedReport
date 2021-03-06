module.exports = function (app, co) {
    app
        .route('/report')
        .all(function (req, res) {
            co(function *() {
                //先响应用户，再进行数据入库。
                //输出一个0大小的图片,避免部分浏览器产生两次请求。
                var emptyImg = 'Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wCAAAAA';
                res.writeHead(200, {'Content-Type': 'image/x-ms-bmp'});
                res.end(new Buffer(emptyImg, 'base64'), 'binary');
                // res.status(204).end(); //暂无环境验证该方式的正确性。

                //组织数据
                var record = {
                    pageId: Number(req.query.pageid),
                    timings: req.query.timing ? JSON.parse(req.query.timing) : null,
                    timeMarks: JSON.parse(req.query.timemarks),
                    ua: {
                        browser: req.useragent.browser,
                        version: req.useragent.version,
                        os: req.useragent.os,
                        platform: req.useragent.platform
                    },
                    ip: req.ip
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
                if (Math.random() < C.record.chance) {
                    var recordResult = yield M.record.create(record);

                    //入库resource数据
                    if (req.body && req.body.constructor == String ) {
                        if (Math.random() < C.record.resourceChance) {
                            var post = {};
                            try {
                                post = JSON.parse(req.body);
                            } catch (e) {
                                console.log(req.body)
                            }
                            var resource = [];
                            if (post.resource) {
                                for (var url in post.resource) {
                                    resource.push({
                                        recordId: recordResult._id,
                                        pageId: recordResult.pageId,
                                        url: url,
                                        duration: post.resource[url],
                                        ip: req.ip
                                    });
                                }
                                yield M.resource.create(resource);
                            }
                        }
                    }
                }

            }).catch(F.handleErr.bind(null, res));
        })
};


function calculateResultByHour(record) {

    var
        insertObj = {
            createHour: F.moment().format("YYYYMMDDHH"),
            timeMarksCount: {},
            timingsCount: {}
        },
        updateObj = {
            $inc: {} //init $inc field.
        };
    insertObj = F._.merge(insertObj, record); //插入数据时, 部分数据采用record的数据。

    //timeMarks 必须存在, timings可以不存在。
    ['timeMarks', 'timings'].forEach(function (dataType) {
        var
            countSuffix = "Count",
            tms = insertObj[dataType];

        if (dataType == "timeMarks") {

            if (!tms) {
                throw new Error(`Invalid timeMarks Value`);
            }

            if (tms["0"]) {
                delete(tms["0"]);  //timeMarks[0]为上报的时间点起始点,没有统计意义。
            }
            //判断数据是否合法,不合法则抛弃
            Object.keys(tms).forEach(function (_key) {
                if (tms[_key] > C.record.maxTimeValue || tms[_key] < C.record.minTimeValue) {
                    throw new Error("Invalid timeMark Value ");
                }
            })
        }

        if (tms) {
            Object.keys(tms).forEach(function (_key) {
                updateObj.$inc[`${dataType}.${_key}`] = tms[_key];
                updateObj.$inc[`${dataType}${countSuffix}.${_key}`] = 1;
                insertObj[`${dataType}${countSuffix}`][_key] = 1;
            })
        }

    });


    return {insertObj: insertObj, updateObj: updateObj};
}
