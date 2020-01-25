var express = require('express');
var router = express.Router();

const IMDBScraper = require('imdb-scrapper/index')


router.get('/', async function (req, res, next) {
    var mediaTitle = req.query.q.replace(/[^0-9a-z ]/gi, '');  //try to normamlize the string
    // mediaTitle='thor'    
    if (mediaTitle){
        var result = await IMDBScraper.simpleSearch(mediaTitle);
    
        // var results = await imdbScraper.search(mediaTitle);
        // var dataToReturn = results.results.map(x => {
        //     return {
        //         imdbId: x.imdbID,
        //         actors: x.actors,
        //         genre: x.genre,
        //         poster: x.poster,
        //         imdbRating: x.imdbRating,
        //         imdbVotes: x.imdbVotes,
        //         title: x.title,
        //         year: x.year,
        //         director: x.director,
        //         plot: x.plot
        //     };
        // });
        var dataToReturn = result && result.d && result.d.filter(x=>x.q === 'feature').map(x=>{
            return {
                imdbId: x.id,
                actors: x.s,
                genre: '',
                poster: x.i && IMDBScraper.changeQuality(x.i[0], 1),
                imdbRating: '',
                imdbVotes: '',
                title: x.l,
                year: x.y,
                director: '',
                plot: ''
            };
        });
    }
    
    res.send(dataToReturn || [], null, 4);
});

router.get('/:id', async function (req, res, next) {
    var id = req.params.id;
    // var mediaTitle = req.query.mediaTitle;
    // mediaTitle='thor'
    var results = await IMDBScraper.getFull(id);
    res.send(results, null, 4);
})

module.exports = router;
