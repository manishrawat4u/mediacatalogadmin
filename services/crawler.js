var hblink = require('./crawlers/hblink');
var extramoviesCrawler = require('./crawlers/extramovies');
async function initiateIndexing(db){
    console.log('Indexing initiated...')
    hblink.crawl(db);
    extramoviesCrawler.crawl(db);
}

module.exports.initiateIndexing = initiateIndexing;