var express = require('express');
var router = express.Router();
var async = require('async');
var dbConfig = require('../dbconfig');


/*ASSET DISTRIBUTION*/
router.get('/', function (req, res) {
    var selectStatement = `select item_name,loc_id,count(*) as count from ITEM_TBL GROUP BY item_name,loc_id ORDER by ITEM_NAME`;
    getItems(selectStatement, req, res);
});



module.exports = router;

function getItems(selectStatement, req, res) {

    var doConnect = function (cb) {
        dbConfig.doConnect(function (err, conn) {
            cb(null, conn);
        });
    };

    var doSelect = function (conn, cb) {
        dbConfig.doSelect(conn, selectStatement, function (err, result) {
            if (err) {
                console.log('Error in execution of select statement' + err.message);
                return cb(err, conn);
            } else {
                var json_arg = {};
                var data = [];
                var ref_value = result.rows[0]["ITEM_NAME"];
                json_arg["ITEM_NAME"] = ref_value;
                for (var i in result.rows) {
                    if (result.rows[i]['ITEM_NAME'] == ref_value)
                    {
                        loc = result.rows[i]['LOC_ID'];
                        count = result.rows[i]["COUNT"];
                        json_arg[loc] = count;
                    } else
                    {
                        data.push(json_arg);
                        json_arg = {};
                        ref_value = result.rows[i]["ITEM_NAME"];
                        json_arg["ITEM_NAME"] = ref_value;
                        loc = result.rows[i]["LOC_ID"];
                        json_arg[loc] = count;
                    }

                }

            }

            console.log(data);
            res.status(200).json(data);
            return cb(null, conn);

        });

    };

    async.waterfall(
            [
                doConnect,
                doSelect
            ],
            function (err, conn) {
                if (err) {
                    console.error("In waterfall error cb: ==>", err, "<==");
                    res.status(500).json({message: err});
                }
                if (conn)
                    dbConfig.dorelease(conn);
            });

}
