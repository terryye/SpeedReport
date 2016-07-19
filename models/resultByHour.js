module.exports = function (mongoose, modelName) {
    var schema = getSchema();
    return mongoose.model(modelName, new mongoose.Schema(schema))
};

function getSchema() {
    var recordSchema = {
        pageId: Number,
        createHour: Number,
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
        timingsCount: {
            //to be defined below #timingCounts
        }
    };
    //define  #timingCounts
    recordSchema.timingsCount = recordSchema.timings;


    var maxTimeMarks = C.record.maxTimeMarks;
    for (var i = 1; i < maxTimeMarks; i++) {
        //define #timeMarks
        recordSchema.timeMarks[i] = Number;
        //define #timeMarkCounts
        recordSchema.timeMarksCount[i] = Number;
    }


    return recordSchema;
};