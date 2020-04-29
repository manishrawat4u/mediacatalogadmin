const MEDIA_COLLECTION = "media_catalog";
const axios = require('axios');
const IMDBScraper = require('imdb-scrapper/index')
const parser = require('@ctrl/video-filename-parser');

async function performImdbProcessing(db) {
    console.log('IMDB PROCESSING INITIATED...')
    try {
        var itemsToProcess = await getNextItems(db);
        for (const key in itemsToProcess) {
            if (itemsToProcess.hasOwnProperty(key)) {
                const element = itemsToProcess[key];
                await processImdbInfoOnThisItem(db, element);
            }
        }
    } catch (error) {
        console.log('Error occurred in processing imdb');
        console.log(error);
    }
    console.log('IMDB PROCESSING COMPLETED!!!')
}

async function getNextItems(db) {
    var dbFilter = {
        "imdbInfo": { $eq: null },
        "imdbAnalyzed": { $eq: null }
    }
    return await db.collection(MEDIA_COLLECTION)
        .find(dbFilter)
        .sort({ "media_document.modifiedTime": -1 })
        //.limit(1000)
        .toArray();
}

async function processImdbInfoOnThisItem(db, item) {
    try {
        var mediaTitle = item;
        var title = mediaTitle.media_document.name;
        parsedInfo = parser.filenameParse(title);
        console.log(`Analyzing media item for auto imdb: ${title}`);

        if (parsedInfo) {
            parsedInfo.title = parsedInfo.title.replace(/[^0-9a-z ]/gi, ' ').replace(/\s\s+/g, ' ');    //normalize it.. unicode issue in imdbscrapper
            var imdbInfo = await IMDBScraper.simpleSearch(parsedInfo.title);
            if (imdbInfo && imdbInfo.d) {
                const mediaTypes = ['TV SERIES', 'FEATURE'];
                var potentialMediaItem = imdbInfo.d.find(x =>
                    x.l.toUpperCase() === parsedInfo.title.toUpperCase()
                    && parsedInfo.year
                    && x.y == parsedInfo.year
                    && mediaTypes.includes(x.q.toUpperCase()));
                if (potentialMediaItem) {
                    //we have found it
                    await updateImdbInfo(db, potentialMediaItem.id, item._id)
                    console.log(potentialMediaItem);
                    return;
                }
            }
        }
        await markMediaItemAsAnalyzed(db, item._id);
    } catch (error) {
        console.log('Error occurred while setting the imdb information automatically.');
        console.log(error);
    }
}

async function updateImdbInfo(db, imdbId, mediaId) {
    var result = await IMDBScraper.scrapper(imdbId);
    var imdbObject = {
        id: imdbId,
        title: result.title,
        plot: result.story,
        year: result.year,
        poster: result.poster
    }
    await db.collection(MEDIA_COLLECTION).updateOne({ _id: mediaId }, { $set: { imdbInfo: imdbObject } });
}

async function markMediaItemAsAnalyzed(db, mediaId) {
    await db.collection(MEDIA_COLLECTION).updateOne({ _id: mediaId }, { $set: { imdbAnalyzed: true } });
}

module.exports.process = performImdbProcessing;