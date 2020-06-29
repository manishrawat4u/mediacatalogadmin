var crawlerIndexer = require('./crawler');
var imdbInfoProcessor = require('./processors/imdbInfoProcessor');
var tmdbInfoProcessor = require('./processors/tmdbInfoProcessor');

async function performStartUpOperations(db) {
    //let's process them in sequence
    await tmdbInfoProcessor.process(db);
    await crawlerIndexer.initiateIndexing(db);
    await imdbInfoProcessor.process(db);
}

module.exports.process = performStartUpOperations;