module.exports = function () {
    var maxTimeMarks = 30,
        recordSchema = {
            pageId: Number,
            createHour : Number,
            timeMarks: {
                 //to be defined below #timeMarks
            },

            timeMarksCount: {
                //to be defined below #timeMarkCounts
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
            timingsCount : {
                //to be defined below #timingCounts
            }
        };

    for(var i=1; i<maxTimeMarks; i++){
        //define #timeMarks
        recordSchema.timeMarks[i] = Number;
        //define #timeMarkCounts
        recordSchema.timeMarksCount[i] = Number;
    }

    //define  #timingCounts
    Object.assign(recordSchema.timingsCount,recordSchema.timings);

    return recordSchema;
};