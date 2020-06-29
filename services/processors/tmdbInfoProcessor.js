const MEDIA_COLLECTION = "media_catalog";
const axios = require('axios');

async function performTmdbProcessing(db) {
    console.log('TVDB PROCESSING INITIATED...')
    try {
        var itemsToProcess = await getNextItems(db);
        for (const key in itemsToProcess) {
            if (itemsToProcess.hasOwnProperty(key)) {
                const element = itemsToProcess[key];
                await processTmdbInfoOnThisItem(db, element);
            }
        }
    } catch (error) {
        console.log('Error occurred in processing imdb');
        console.log(error);
    }
    console.log('IMDB PROCESSING COMPLETED!!!')
}

async function getNextItems(db) {
    return await db.collection(MEDIA_COLLECTION)
        .aggregate([
            {
                $match: {
                    "tmdbInfo": { $eq: null },
                    "imdbInfo": { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$imdbInfo.id"
                }
            }
        ])
        .toArray();
}

async function processTmdbInfoOnThisItem(db, item) {
    try {
        const apiUrl = `https://api.themoviedb.org/3/find/${item._id}?api_key=${process.env.tmdbapikey}&language=en-US&external_source=imdb_id`;
        const apiResposne = await axios.get(apiUrl);

        if (apiResposne && apiResposne.status == 200) {
            var tmdbInfo = {};
            if (apiResposne.data.movie_results && apiResposne.data.movie_results.length > 0) {
                tmdbInfo.title = apiResposne.data.movie_results[0].title;
                tmdbInfo.media = 'Movie';
            }
            else if (apiResposne.data.tv_results && apiResposne.data.tv_results.length > 0) {
                tmdbInfo.title = apiResposne.data.tv_results[0].name;
                tmdbInfo.media = 'TV'
            } else {
                console.log(`Following imdb item ${item._id} is not either movie or tv.`);
                return;
            }
            await updateTmdbInfo(db, item._id, tmdbInfo);
        } else {
            console.log(`Response code of ${apiResposne.status} recieved while calling tmdbapi`);
        }
    } catch (error) {
        console.log('Error occurred while setting the tmdb information.');
        console.log(error);
    }
}

async function updateTmdbInfo(db, imdbId, tmdbObject) {
    await db.collection(MEDIA_COLLECTION).updateMany({ "imdbInfo.id": imdbId }, { $set: { tmdbInfo: tmdbObject } });
}

module.exports.process = performTmdbProcessing;