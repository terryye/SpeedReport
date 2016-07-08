var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var mongoDSN = 'mongodb://localhost:27017/pagespeed';



function* insert (tbname, record ){
        var db = yield conn();
        var r = yield db.collection(tbname).insertOne(record);
        assert.equal(1, r.insertedCount);
        db.close();
}

function* mapReduce(tbname,map,reduce,option){
    var db = yield conn();
    var col = db.collection(tbname);

    var r= yield col.mapReduce(map,reduce,option);
    db.close();
    return r
}

function* find(tbname,query){
    var db = yield conn();
    var col = db.collection(tbname);

    var r= yield col.find(query).toArray();
    db.close();
    return r;
}

function* conn (){
    var _conn = yield MongoClient.connect(mongoDSN);
    return _conn;
}


module.exports = {
    insert : insert,
    mapReduce:mapReduce,
    find:find,
    conn:conn,
    update : function(){}
};
