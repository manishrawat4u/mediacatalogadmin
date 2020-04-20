var crawlerIndexer = require('./crawler');
var imdbInfoProcessor = require('./processors/imdbInfoProcessor');


async function performStartUpOperations(db) {
    //let's process them in sequence
    await crawlerIndexer.initiateIndexing(db);
    await imdbInfoProcessor.process(db);
}

module.exports.process = performStartUpOperations;