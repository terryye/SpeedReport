var express = require('express');
var router = express.Router();
var db = require("../mod/db");
var date = require('datejs');
var co = require('co');
var biz = require("../mod/biz");
var page = require("../mod/page");
var config = require("../mod/config");


/* add new page. */
router.get('/add', function (req, res, next) {
    co(function*() {

        res.render("content",
            {
                content: "数据概要"
            }
        );
        
    }).catch(function (e) {
        console.log(e)
    })
});

module.exports = router;