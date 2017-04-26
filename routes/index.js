/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.status(200).send('Allow');
    } else {
        next();
    }
});


router.use('/items/', require('./items'));
router.use('/locations/', require('./location'));
router.use('/crud_assets/', require('./crud_assets'));
router.use('/crud_location/', require('./crud_location'));
router.use('/assetdistribution/', require('./assetdistribution'));

router.get('/', function (req, res) {
    res.send('Welcome to  Retail App Apis!');
});

router.get('/about', function (req, res) {
    res.send('Learn about us');
});

module.exports = router;