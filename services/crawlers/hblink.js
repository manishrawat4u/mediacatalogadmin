const HBLINKS_API_BASE_URI = 'https://hblinks.pw';
const MEDIA_COLLECTION = "media_catalog";
const axios = require('axios');

async function performHblinksCrawling(db) {
    try {
        var hblinks = await crawlHblinks();
        for (const key in hblinks) {
            if (hblinks.hasOwnProperty(key)) {
                const element = hblinks[key];
                await saveMediaItem(db, element);
            }
        }
    } catch (error) {
        console.log('Error occurred in performHblinksCrawling');
        console.log(error);
    }
}

async function crawlHblinks() {
    pageNo = 1
    var response = [];
    while (true) {
        const apiUrl = `${HBLINKS_API_BASE_URI}/wp-json/wp/v2/posts?orderby=modified&order=asc&per_page=100&page=${pageNo}`;
        var apiResposne = null;
        try {
            console.log(`Crawling hblink: ${apiUrl}`);
            apiResposne = await axios.get(apiUrl);
        } catch (error) {
            //End of paging...
            console.log(`Error while retrieving hblink page ${apiUrl}`)
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
                    kind: 'hdhub#folder',
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
        source: 'hdhub',
        ts: new Date(),
        media_document: mediaItem
    }

    var itemExists = await db.collection(MEDIA_COLLECTION).findOne({
        "source": "hdhub",
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
        await db.collection(MEDIA_COLLECTION).insertOne(instance);
    }
}

module.exports.crawl = performHblinksCrawling;