var express = require('express');
var router = express.Router();
var async = require('async');
var dbConfig = require('../dbconfig');

// livepreview
router.get('/', function (req, res) {
    var selectStatement = `
SELECT 
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

//insert
router.post('/', function (req, res) {
    var selectStatement = `INSERT INTO TAG_TBL VALUES('${req.body.UUID }' , '${req.body.TYPE}', '${req.body.ITEM_ID}')`;
     getItems(selectStatement, req, res);
    var selectStatement = `INSERT INTO ITEM_TBL(ITEM_ID,ITEM_NAME,ITEM_CATEGORY,ITEM_TYPE,BASE_LOC_ID,LOC_ID,STATUS) VALUES('${req.body.ITEM_ID }' , '${req.body.ITEM_NAME}', '${req.body.ITEM_CATEGORY}', '${req.body.ITEM_TYPE}', '${req.body.BASE_LOC_ID}', '${req.body.BASE_LOC_ID}', 'Warehouse')`;
       getItems(selectStatement, req, res);
       res.send('ok');
});

//delete
router.delete('/', function (req, res) {
    var selectStatement = `DELETE FROM ITEM_TBL WHERE ITEM_NAME='${req.body.ITEM_NAME}'`;
    getItems(selectStatement,req, res);
     var selectStatement = `DELETE FROM TAG_TBL WHERE ITEM_ID='${req.body.ITEM_ID}'`;
    getItems(selectStatement,req, res);
    res.send('ok');
});
//update
router.put('/', function (req, res) {
   
  
    selectStatement = `
                UPDATE 
                    ITEM_TBL A
                SET 
                    A.ITEM_NAME='${req.body.ITEM_NAME}',
                    A.ITEM_CATEGORY='${req.body.ITEM_CATEGORY}',
                    A.ITEM_TYPE='${req.body.ITEM_TYPE}',
                    A.BASE_LOC_ID='${req.body.BASE_LOC_ID}',
                    A.LOC_ID='${req.body.LOC_ID}'
                WHERE EXISTS
                (SELECT * FROM TAG_TBL B WHERE B.UUID LIKE '${req.body.UUID}' AND A.ITEM_ID=B.ITEM_ID )`;
    
    getItems(selectStatement,req, res);
    selectStatement=`UPDATE 
                    ITEM_TBL A
                SET 
                    A.ITEM_ID='${req.body.ITEM_ID}'
                    
                WHERE EXISTS
                (SELECT * FROM TAG_TBL B WHERE B.UUID LIKE '${req.body.UUID}' AND A.ITEM_ID=B.ITEM_ID )`;
  getItems(selectStatement,req, res);
  selectStatement=`  UPDATE 
                    TAG_TBL B
                SET 
                    B.ITEM_ID='${req.body.ITEM_ID}'
                    
                WHERE  B.UUID LIKE '${req.body.UUID}' `;
  getItems(selectStatement,req, res);
    //console.log(item_id);

 res.send('ok');
});

module.exports = router;

function getItems(selectStatement, req, res) {

    var doConnect = function (cb) {
        dbConfig.doConnect(function (err, conn) {
            cb(null,conn);
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
