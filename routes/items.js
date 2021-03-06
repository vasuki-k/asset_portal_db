var express = require('express');
var router = express.Router();
var async = require('async');
var dbConfig = require('../dbconfig');

// Items Information
router.get('/', function (req, res) {
    var selectStatement = `SELECT * FROM ITEM_TBL`;
    getItems(selectStatement, req, res);
});

/*ASSET UTILISATION*/
router.get('/assetUtilisation', function (req, res) {

    var selectStatement = `SELECT D.ITEM_NAME,
  C.SUM
FROM
  (SELECT A.UUID,
    SUM((A.READ_TIME - A.PREV_READ_TIME) / 60000) AS SUM
  FROM AT_EVENT_TBL A
  WHERE A.STATUS LIKE 'Exit'
  GROUP BY A.UUID
  ORDER BY SUM DESC
  ) C,
  TAG_TBL B,ITEM_TBL D
WHERE  C.UUID = B.UUID AND D.ITEM_ID=B.ITEM_ID
AND RowNum  <= 5`;
    getItems(selectStatement, req, res);
});
/*ASSET STATUS*/
router.get('/statusCount', function (req, res) {
    var selectStatement = `SELECT STATUS,COUNT(*) AS COUNT FROM ITEM_TBL GROUP BY STATUS`;
    getItems(selectStatement, req, res);
});
//TRANSIT AGING
router.get('/transitAging', function (req, res) {
    var selectStatement = `select t.range as transit_time, count(*) as number_of_assets
from (
  select case  
    when value1 between 0 and 5 then '0-5'
    when value1 between 6 and 15 then '5-15'
    when value1 between 16 and 45 then '15-45'
    when value1 between 46 and 120 then '45-120'
    when value1 between 121 and 380 then '120-380'
    else '380+' end as range
  from (SELECT 
  ITEM_NAME,((SELECT (SYSDATE - TO_DATE('01-01-1970 00:00:00', 'DD-MM-YYYY HH24:MI:SS')) * 24 * 60 * 60 * 1000-(19800000) FROM DUAL)-READ_TIME)/(60*1000) as value1
FROM 
  ITEM_TBL
WHERE 
  STATUS LIKE 'Transit' )) t
group by t.range
ORDER BY t.range ASC`;
    getItems(selectStatement, req, res);
});
/*lacation asset count for heat map*/
router.get('/locationCount', function (req, res) {
    var selectStatement = `select item_name,loc_id,count(*) as count from ITEM_TBL GROUP BY item_name,loc_id ORDER by ITEM_NAME`;
    var c = getItems(selectStatement, req, res);
    //console.log(c);
    
});


router.get('/:id', function (req, res) {
    var selectStatement = `SELECT * FROM ITEM_TBL WHERE ITEM_ID='${req.params.id}'`;
    getItems(selectStatement, req, res);
});
/*Asset updation-CRUD*/
router.get('/assetUpdation', function (req, res) {
    var selectStatement = `SELECT 
  B.UUID,
  A.ITEM_NAME,
  B.ITEM_ID,
  A.ITEM_CATEGORY,
  A.ITEM_TYPE,
  A.BASE_LOC_ID,
  B.TYPE
FROM 
  ITEM_TBL A,
  TAG_TBL B
WHERE
  A.ITEM_ID=B.ITEM_ID`;
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
                res.status(200).json(result.rows);
                return cb(null, conn);
            }
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
