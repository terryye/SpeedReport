var app = require('../app');
var supertest = require('supertest');
var should = require('should');

var request = supertest(app);

describe('test/app.test.js', function () {

    // 我们的第一个测试用例，好好理解一下
    it('should return 200 ', function (done) {
        // 之所以这个测试的 function 要接受一个 done 函数，是因为我们的测试内容
        // 涉及了异步调用，而 mocha 是无法感知异步调用完成的。所以我们主动接受它提供
        // 的 done 函数，在测试完毕时，自行调用一下，以示结束。
        // mocha 可以感到到我们的测试函数是否接受 done 参数。js 中，function
        // 对象是有长度的，它的长度由它的参数数量决定
        // (function (a, b, c, d) {}).length === 4
        // 所以 mocha 通过我们测试函数的长度就可以确定我们是否是异步测试。

        request.get('/admin/page')
        // .query 方法用来传 querystring，.send 方法用来传 body。
        // 它们都可以传 Object 对象进去。
        // 在这里，我们等于访问的是 /fib?n=10
            .query({pageId: 101, format: 'json'})
            .expect(200)
            .end(function (err, res) {
                // 由于 http 返回的是 String，所以我要传入 '55'。
                // res.text.should.equal('55');
                // done(err) 这种用法写起来很鸡肋，是因为偷懒不想测 err 的值
                // 如果勤快点，这里应该写成
                /*
                 should.not.exist(err);
                 res.text.should.equal('55');
                 */
                done(err);
            });
    });


    // 我们的第一个测试用例，好好理解一下
    it('should return 200 ', function (done) {
        // 之所以这个测试的 function 要接受一个 done 函数，是因为我们的测试内容
        // 涉及了异步调用，而 mocha 是无法感知异步调用完成的。所以我们主动接受它提供
        // 的 done 函数，在测试完毕时，自行调用一下，以示结束。
        // mocha 可以感到到我们的测试函数是否接受 done 参数。js 中，function
        // 对象是有长度的，它的长度由它的参数数量决定
        // (function (a, b, c, d) {}).length === 4
        // 所以 mocha 通过我们测试函数的长度就可以确定我们是否是异步测试。

        request.get('/admin/pageForm')
        // .query 方法用来传 querystring，.send 方法用来传 body。
        // 它们都可以传 Object 对象进去。
        // 在这里，我们等于访问的是 /fib?n=10
            .query()
            .expect(200)
            .end(function (err, res) {
                // 由于 http 返回的是 String，所以我要传入 '55'。
                // res.text.should.equal('55');
                // done(err) 这种用法写起来很鸡肋，是因为偷懒不想测 err 的值
                // 如果勤快点，这里应该写成
                /*
                 should.not.exist(err);
                 res.text.should.equal('55');
                 */
                done(err);
            });
    });

    it('Create one page ok', function (done) {

        var _create = {
            projectId: 1, name: "测试页面", owner: "jack", timeMarkAlias: "{}"
        };

        request.post('/admin/pageForm')
        // .query 方法用来传 querystring，.send 方法用来传 body。
        // 它们都可以传 Object 对象进去。
        // 在这里，我们等于访问的是 /fib?n=10
            .query()
            .send(_create)
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

/*
    it('Create one page error', function (done) {

        var _create = {
            projectId: 1, name: "", owner: "jack", timeMarkAlias: "{}"
        };

        request.post('/admin/pageForm')
        // .query 方法用来传 querystring，.send 方法用来传 body。
        // 它们都可以传 Object 对象进去。
        // 在这里，我们等于访问的是 /fib?n=10
            .query()
            .send(_create)
            .expect(500)
            .end(function (err, res) {
                console.log(res.text);
                done(err);
            });
    });
*/

    it('update by hour', function (done) {

        request.get('/script/updateByHour')
        // .query 方法用来传 querystring，.send 方法用来传 body。
        // 它们都可以传 Object 对象进去。
        // 在这里，我们等于访问的是 /fib?n=10
            .query()
            .expect(200)
            .end(function (err, res) {
                console.log(res.text);
                done(err);
            });
    });



});

