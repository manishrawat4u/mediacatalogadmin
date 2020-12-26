const EXTRAMOVIES_API_BASE_URI = 'https://extramovies.world';
const MEDIA_COLLECTION = "media_catalog";
const axios = require('axios');
const IMDBScraper = require('imdb-scrapper/index')

async function performExtramoviesCrawling(db) {
    try {
        var extramoviesLinks = await crawlExtramovieslinks();
        for (const key in extramoviesLinks) {
            if (extramoviesLinks.hasOwnProperty(key)) {
                const element = extramoviesLinks[key];
                await saveMediaItem(db, element);
            }
        }
    } catch (error) {
        console.log('Error occurred in performExtramoviesCrawling');
        console.log(error);
    }
}

async function crawlExtramovieslinks() {
    pageNo = 1
    var response = [];
    while (true) {
        const apiUrl = `${EXTRAMOVIES_API_BASE_URI}/wp-json/wp/v2/posts?orderby=modified&order=asc&per_page=100&page=${pageNo}`;
        var apiResposne = null;
        try {
            console.log(`Crawling extramovieslink: ${apiUrl}`);
            apiResposne = await axios.get(apiUrl);
        } catch (error) {
            //End of paging...
            console.log(`Error while retrieving extramovies page ${apiUrl}`)
            console.log(error);
        }

        if (apiResposne && apiResposne.status == 200) {
            pageNo = pageNo + 1;
            apiResposne.data.forEach(element => {
                var renderedContent = element.content.rendered;
                var createdTime = new Date(element.date);
                var modifiedTime = new Date(element.modified);
                var name = element.title.rendered;
                var slugName = element.slug;
                var mediaSources = [];  //lets reserve it and use it in future
                var webViewLink = element.link;
                var categories = element.categories;
                var o = {
                    kind: 'extramovies#folder',
                    id: element.id,
                    renderedContent,
                    createdTime,
                    modifiedTime,
                    name,
                    slugName,
                    mediaSources,
                    webViewLink,
                    categories
                };
                response.push(o);
            });
        }
        else {
            break;
        }
    }
    return response;
}

async function saveMediaItem(db, mediaItem) {
    var instance = {
        source: 'extramovies',
        ts: new Date(),
        media_document: mediaItem
    }

    var itemExists = await db.collection(MEDIA_COLLECTION).findOne({
        "source": "extramovies",
        "media_document.id": mediaItem.id
    })

    if (itemExists) {
        if (itemExists.media_document.modifiedTime < mediaItem.modifiedTime) {
            await db.collection(MEDIA_COLLECTION).updateOne({
                _id: itemExists._id
            }, {
                $set: {
                    media_document: mediaItem
                }
            });
        }else{
            console.log(`Media Item modified time doesn't have any change. Media Id: ${mediaItem.id}, Last Modified Time: ${mediaItem.modifiedTime}`);
        }
    } else {
        imdbInfo = await fetchImdbInfo(mediaItem.webViewLink);
        imdbInfo && (instance.imdbInfo = imdbInfo);
        await db.collection(MEDIA_COLLECTION).insertOne(instance);
    }
}

async function fetchImdbInfo(extramoviesLink){
    try {
        pageResponse = await axios.get(extramoviesLink);
        if(pageResponse.status == 200){
            const regex = /https:\/\/www\.imdb\.com\/title\/([^\/]*)/g
            const imdbId = regex.exec(pageResponse.data)[1];
            var result = await IMDBScraper.scrapper(imdbId);
            var imdbObject = {
              id: imdbId,
              title: result.title,
              plot: result.story,
              year: result.year,
              poster: result.poster
            }
            return imdbObject;
        }
    } catch (error) {
        return null;
    }
}

module.exports.crawl = performExtramoviesCrawling;
