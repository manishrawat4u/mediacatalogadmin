var crawlerIndexer = require('./crawler');
var imdbInfoProcessor = require('./processors/imdbInfoProcessor');


async function performStartUpOperations(db) {
    //let's process them in sequence
    await imdbInfoProcessor.process(db);
    await crawlerIndexer.initiateIndexing(db);
}

module.exports.process = performStartUpOperations;