var express = require('express');
var router = express.Router();

var hblinkCrawler = require('../services/crawlers/hblink');

router.get('/hblinks', async function (req, res) {
    var db = req.app.locals.db;
    hblinkCrawler.crawl(db)
    res.send('Indexing initiated...');
});

module.exports = router;
