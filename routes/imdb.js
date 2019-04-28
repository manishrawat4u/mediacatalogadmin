var express = require('express');
var router = express.Router();

const IMDBScraper = require('imdb-scraper')
const imdbScraper = new IMDBScraper()

router.get('/', async function (req, res, next) {
    var mediaTitle = req.query.q.replace(/[^0-9a-z ]/gi, '');  //try to normamlize the string
    // mediaTitle='thor'    
    var results = await imdbScraper.search(mediaTitle);    
    res.send(results.results, null, 4);
});

router.get('/:id', async function (req, res, next) {
    var id = req.params.id;
    // var mediaTitle = req.query.mediaTitle;
    // mediaTitle='thor'
    var results = await imdbScraper.getFull(id);
    res.send(results, null, 4);
})

module.exports = router;
