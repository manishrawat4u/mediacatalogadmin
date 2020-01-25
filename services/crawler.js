var hblink = require('./crawlers/hblink');
async function initiateIndexing(db){
    console.log('Indexing initiated...')
    hblink.crawl(db);
}

module.exports.initiateIndexing = initiateIndexing;