module.exports = function () {
    var maxTimeMarks = 30,
        recordSchema = {
            pageId: Number,
            timeMarks: {
                //to be defined below  #maxTimeMarks
            },
            timings: {
                'navigationStart': Number,
                'unloadEventStart': Number,
                'unloadEventEnd': Number,
                'redirectStart': Number,
                'redirectEnd': Number,
                'fetchStart': Number,
                'domainLookupStart': Number,
                'domainLookupEnd': Number,
                'connectStart': Number,
                'connectEnd': Number,
                'secureConnectionStart': Number,
                'requestStart': Number,
                'responseStart': Number,
                'responseEnd': Number,
                'domLoading': Number,
                'domInteractive': Number,
                'domContentLoadedEventStart': Number,
                'domContentLoadedEventEnd': Number,
                'domComplete': Number,
                'loadEventStart': Number,
                'loadEventEnd': Number
            },
            ua: {
                browser: String,
                version: String,
                os: String,
                platform: String
            },
            createTime: {
                type: Date,
                default: Date.now
            }
        };

    //defeine #maxTimeMarks
    for(var i=0; i<maxTimeMarks; i++){
        recordSchema.timeMarks[i] = Number;
    }

    return recordSchema;
};