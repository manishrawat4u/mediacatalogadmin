var hblink = require('./crawlers/hblink');
var extramoviesCrawler = require('./crawlers/extramovies');
async function initiateIndexing(db){
    console.log('Indexing initiated...')
    await hblink.crawl(db);
    await extramoviesCrawler.crawl(db);
}

module.exports.initiateIndexing = initiateIndexing;