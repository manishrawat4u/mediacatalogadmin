var express = require('express');
var router = express.Router();
var MEDIA_COLLECTION = "media_catalog";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var snoowrap = require('snoowrap');
const axios = require('axios');
const getUrls = require('get-urls');
const voca = require('voca');
const urlunshort = require('url-unshort')();
const url = require('url');
var nurlresolver = require('nurlresolver');

router.get("/", async function (req, res) {
    var dataToReturn = [{
        "id": "4k",
        "displayName": "4k Movies",
        "playlistType": "auto"
    }, {
        "id": "fhd",
        "displayName": "Full HD Movies (1080p)",
        "playlistType": "auto"
    }, {
        "id": "hd",
        "displayName": "HD Movies (720p)",
        "playlistType": "auto"
    }, {
        "id": "hdhub4u",
        "displayName": "HDHub4u",
        "playlistType": "auto"
    }, {
        "id": "extramovies",
        "displayName": "ExtraMovies",
        "playlistType": "auto"
    }, {
        "id": "livecricket",
        "displayName": "Live Cricket (Reddit)",
        "playlistType": "auto"
    }
        //, {
        //     "id": "hotstarsports",
        //     "displayName": "Hotstar Sports",
        //     "playlistType": "auto"
        // }, {
        //     "id": "hotstarhindimovies",
        //     "displayName": "Hotstar Hindi Movies",
        //     "playlistType": "auto"
        // }, {
        //     "id": "hotstarengmovies",
        //     "displayName": "Hotstar Egnlish Movies",
        //     "playlistType": "auto"
        // }
    ];
    res.send(dataToReturn || [], null, 4);
});

// router.get('/hdhub4u', async function (req, res) {
//     const sourceUrl = 'https://hdhub4u.live';
//     getUrlResolverPlaylistItem(sourceUrl, res);
// });

// router.get('/extramovies', async function (req, res) {
//     const sourceUrl = 'https://extramovies.pink/';
//     getUrlResolverPlaylistItem(sourceUrl, res);
// });

async function getUrlResolverPlaylistItem(sourceUrl, res) {
    var results = await nurlresolver.resolve(sourceUrl);
    var objImdbs = [];
    results.forEach(x => {
        {
            var imdbInfo = {};
            imdbInfo.id = x.link;
            imdbInfo.plot = x.title;
            imdbInfo.poster = x.poster;
            //imdbInfo.posterThumb = `/api/images/roku?u=${encodeURIComponent(x.poster)}&h=268`;
            imdbInfo.title = x.title;
            imdbInfo.year = "2019";
            var mediaSourceUrl = `/api/playlist/mediasource?u=${encodeURIComponent(x.link)}`
            var mediaItem = {
                imdbInfo,
                mediaSourceUrl
            }
            massageImdbPoster(mediaItem)
            objImdbs.push(mediaItem)
        }
    });
    var response = {};
    response.success = true;
    response.items = objImdbs;
    res.send(response, null, 4);
}

router.get('/mediasource/byimdb/:imdbid', async function (req, res) {
    var db = req.app.locals.db;
    var imdbid = req.params.imdbid;
    var response = {};
    try {

        if (imdbid) {
            var dbFilter = {
                "imdbInfo.id": imdbid
            };
            var dbresponse = await db.collection(MEDIA_COLLECTION).find(dbFilter)
                .sort({ "media_document.modifiedTime": -1 }).toArray();
            var promises = [];
            dbresponse.forEach(element => {
                var mediaLInk = element.media_document.webViewLink;
                var promise = nurlresolver.resolveRecursive(mediaLInk);
                promises.push(promise);
            });
            await Promise.all(promises);
            var mediaSources = [];
            for (const key in promises) {
                if (promises.hasOwnProperty(key)) {
                    const promise = promises[key];
                    var promiseValue = await promise;
                    promiseValue.forEach(x => {
                        var mediaSource = {
                            id: "",
                            streamUrl: x.link,
                            title: x.title || x.link,
                            mimeType: "mkv",
                            size: "0",
                            source: 'api',
                            live: 0 //can be determined by hls source
                        };
                        mediaSources.push(mediaSource)
                    })
                }
            }
            response.success = true;
            response.items = mediaSources;
        } else {
            response.success = false;
            response.items = [];
        }
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});

router.get('/mediasource', async function (req, res) {
    var u = req.query.u;
    var results = await nurlresolver.resolveRecursive(u);
    var mediaSources = [];
    results.forEach(x => {
        {
            var mediaSource = {
                id: "",
                streamUrl: x.link,
                title: x.title || x.link,
                mimeType: "mkv",
                size: "0",
                source: 'api',
                referer: x.referer,
                live: 0 //can be determined by hls source
            };
            mediaSources.push(mediaSource)
        }
    });
    var response = {};
    response.success = true;
    response.items = mediaSources;
    res.send(response, null, 4);
});

router.get('/redditsource/bycommentid/:commentid', async function (req, res) {
    var db = req.app.locals.db;
    var commentId = req.params.commentid;
    var response = {};
    try {
        if (commentId) {
            var pushshifturl = `https://api.pushshift.io/reddit/search/comment?sort=asc&link_id=${commentId}&limit=10000`;
            const pushshifturlresposne = await axios.get(pushshifturl);
            var data = pushshifturlresposne.data.data;
            var extractedUrls = [];
            for (let innerIndex = 0; innerIndex < data.length; innerIndex++) {
                const redditcomments = data[innerIndex];
                getUrls(redditcomments.body).forEach(someinput => {
                    extractedUrls.push(someinput);
                });
                response.success = true;
                response.items = extractedUrls;
            }
            var promises = [];
            extractedUrls.forEach(element => {
                var promise = nurlresolver.resolveRecursive(element);
                promises.push(promise);
            });
            await Promise.all(promises);
            var mediaSources = [];
            for (const key in promises) {
                if (promises.hasOwnProperty(key)) {
                    const promise = promises[key];
                    var promiseValue = await promise;
                    promiseValue.forEach(x => {
                        var mediaSource = {
                            id: "",
                            streamUrl: x.link,
                            title: x.title || x.link,
                            mimeType: "hls",
                            size: "0",
                            source: 'api',
                            referer: x.referer,
                            live: 1 //can be determined by hls source
                        };
                        mediaSources.push(mediaSource)
                    })
                }
            }
            response.success = true;
            response.items = mediaSources;
        }
    }
    catch (error){
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});

router.get('/livecricket', async function (req, res) {
    try {
        const otherRequester = new snoowrap({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            clientId: process.env.redditClientId,
            clientSecret: process.env.redditClientSecret,
            username: process.env.redditUserName,
            password: process.env.redditPassword,
        });

        var dateTill = new Date();
        dateTill.setDate(dateTill.getDate() - 1);

        var subReddit = await otherRequester.getSubreddit('InsectsEnthusiasts').getNew();
        var objImdbs = [];
        for (let index = 0; index < subReddit.length; index++) {
            const element = subReddit[index];
            if (new Date(element.created_utc * 1000) >= dateTill) {
                var imdbInfo = {};
                var allextractedurls = [];
                imdbInfo.id = "tt8710622";
                imdbInfo.plot = "Live Cricket Stream";
                imdbInfo.poster = "https://m.media-amazon.com/images/M/MV5BNzExOTdiZGQtNDc1OS00NTNhLWEyNDctMjU1MDRhZGQ1NmE2XkEyXkFqcGdeQXVyODAzNzAwOTU@._V1_QL50.jpg";
                imdbInfo.title = element.title;
                imdbInfo.year = "2020";
                var commentId = element.id;
                var mediaSourceUrl = `/api/playlist/redditsource/bycommentid/${encodeURIComponent(commentId)}`;
                existingElement = {
                    imdbInfo,
                    mediaSourceUrl
                }
                massageImdbPoster(existingElement);
                objImdbs.push(existingElement);
            }
        }
        var response = {};
        response.success = true;
        response.items = objImdbs;
        res.send(response, null, 4);
    } catch (error) {
        var response = {};
        response.success = false;
        response.items = [];
        res.send(response, null, 4);
    }
});

// router.get('/livecricket', async function (req, res) {
//     var objToReturn = {};
//     var all = req.query.all;

//     const otherRequester = new snoowrap({
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
//         clientId: process.env.redditClientId,
//         clientSecret: process.env.redditClientSecret,
//         username: process.env.redditUserName,
//         password: process.env.redditPassword,
//     });

//     var dateTill = new Date();
//     dateTill.setDate(dateTill.getDate() - 1);

//     var subReddit = await otherRequester.getSubreddit('InsectsEnthusiasts').getNew();
//     var objImdbs = [];
//     for (let index = 0; index < subReddit.length; index++) {
//         const element = subReddit[index];
//         if (new Date(element.created_utc * 1000) >= dateTill) {
//             var imdbInfo = {};
//             var allextractedurls = [];
//             imdbInfo.id = "tt8710622";
//             imdbInfo.plot = "Live Cricket Stream";
//             imdbInfo.poster = "https://m.media-amazon.com/images/M/MV5BNzExOTdiZGQtNDc1OS00NTNhLWEyNDctMjU1MDRhZGQ1NmE2XkEyXkFqcGdeQXVyODAzNzAwOTU@._V1_QL50.jpg";
//             imdbInfo.title = element.title;
//             imdbInfo.year = "2019";

//             var commentId = element.id;
//             var pushshifturl = `https://api.pushshift.io/reddit/search/comment?sort=asc&link_id=${commentId}&limit=10000`;
//             const pushshifturlresposne = await axios.get(pushshifturl);
//             var data = pushshifturlresposne.data.data;
//             for (let innerIndex = 0; innerIndex < data.length; innerIndex++) {
//                 const redditcomments = data[innerIndex];
//                 var extractedUrls = [];
//                 getUrls(redditcomments.body).forEach(someinput => {
//                     extractedUrls.push(someinput);
//                 });
//                 for (let innerInnerIndex = 0; innerInnerIndex < extractedUrls.length; innerInnerIndex++) {
//                     const extractedUrl = extractedUrls[innerInnerIndex];
//                     var normalizedUrl = voca.trim(extractedUrl, ")")
//                     if (normalizedUrl.includes("bit.ly")) {
//                         normalizedUrl = await urlunshort.expand(normalizedUrl);
//                     } else if (normalizedUrl.includes("cric8")) {
//                         var regex = /game[\d]/g;
//                         var found = normalizedUrl.match(regex);

//                         if (found) {
//                             normalizedUrl = `http://cdn1.cric8.cc/live/${found[0].replace("game", "cric")}/index.m3u8`;
//                             allextractedurls.push({ normalizedUrl, extractedUrl });

//                             normalizedUrl = `http://cdn2.cric8.cc/live/${found[0].replace("game", "cric")}/index.m3u8`;
//                             allextractedurls.push({ normalizedUrl, extractedUrl });

//                             normalizedUrl = `http://cdn3.cric8.cc/live/${found[0].replace("game", "cric")}/index.m3u8`;
//                         }
//                     }
//                     normalizedUrl && allextractedurls.push({ normalizedUrl, extractedUrl });
//                 }
//             }
//             var finalList = allextractedurls.filter(x => x.normalizedUrl.endsWith('m3u8') || all);
//             var mediaSources = finalList.map(x => {
//                 var u = url.parse(x.normalizedUrl);
//                 return {
//                     id: "",
//                     streamUrl: x.normalizedUrl,
//                     sourceUrl: x.extractedUrl,
//                     headers: x.normalizedUrl.includes("cric8") ? ["Referer: http://cric8.cc"] : null,
//                     mimeType: "hls",
//                     size: "0",
//                     source: u.hostname
//                 }
//             });
//             objImdbs.push({
//                 imdbInfo,
//                 mediaSources
//             })
//         }
//     }

//     var response = {};
//     response.success = true;
//     response.items = objImdbs;
//     res.send(response, null, 4);
// });

router.get('/hotstarsports', async function (req, res) {
    hotstarUrl = `https://api.hotstar.com/o/v1/page/1984?offset=0&size=20&tao=0&tas=20`
    getHS(hotstarUrl, res);
});


router.get('/hotstarhindimovies', async function (req, res) {
    hotstarUrl = `https://api.hotstar.com/o/v1/language/f_cr/asset?id=9&avsCategoryId=5631&offset=0&size=600&pageNo=1&perPage=600&ct=200`
    getHS(hotstarUrl, res);
});

router.get('/hotstarengmovies', async function (req, res) {
    hotstarUrl = `https://api.hotstar.com/o/v1/language/f_cr/asset?id=3&avsCategoryId=5630&offset=0&size=600&pageNo=1&perPage=600&ct=200`
    getHS(hotstarUrl, res);
});

async function getHS(hotstarUrl, res) {
    let config = {
        headers: {
            'x-platform-code': 'PCTV',
            'x-country-code': 'IN'
        }
    }
    var hotstarSportApiUrl = hotstarUrl;
    const apiResponse = await axios.get(hotstarSportApiUrl, config);
    var objImdbs = [];
    var iteratableResult = apiResponse.data.body.results.items || apiResponse.data.body.results.trays.items
    iteratableResult.forEach(el => {
        var assetItems = (el.assets && el.assets.items) || [el];
        assetItems && assetItems.forEach(as => {
            try {
                if (as.assetType == 'GAME' || as.premium || !as.contentId) return;
                var imdbInfo = {};
                imdbInfo.id = as.contentId;
                imdbInfo.plot = as.title;
                imdbInfo.poster = 'https://img1.hotstarext.com/image/upload/f_auto,t_web_vl_3x/' + (as.images && (as.images.v || as.images.h));
                imdbInfo.title = as.title;
                imdbInfo.year = "2019";

                var mediaSources = [{
                    id: "",
                    streamUrl: `http://mediacatalogadmin.herokuapp.com/api/playlist/hsdirect/${as.contentId}`,
                    sourceUrl: as.playbackUri,
                    //headers: x.normalizedUrl.includes("cric8") ? ["Referer: http://cric8.cc"] : null,
                    mimeType: "hls",
                    size: "0",
                    source: 'hotstar',
                    live: as.live
                }];

                if (objImdbs.findIndex(x => x.imdbInfo.id === imdbInfo.id) === -1) {
                    objImdbs.push({
                        imdbInfo,
                        mediaSources
                    })
                }
            } catch (error) {
                console.log('Error while parsing the api response');
                console.log(error);
            }

        });
    })

    var response = {};
    response.success = true;
    response.items = objImdbs;
    res.send(response, null, 4);
}


router.get('/hsdirect/:contentId', async function (req, res) {
    var contentId = req.params.contentId;
    var hotstarSportApiUrl = `https://api.hotstar.com/h/v2/play/in/contents/${contentId}?desiredConfig=ads:non_ssai;dvr:short;encryption:plain;ladder:tv;language:hin;package:hls&client=web&clientVersion=6.25.0&deviceId=e8848e56-998b-4ae2-a787-383f8dd00b99&osName=Windows&osVersion=10`
    const apiResponse = await axios.get(hotstarSportApiUrl);
    console.log(apiResponse.data);
    var playbackUrl = apiResponse.data.body.results.playBackSets[0].playbackUrl;
    res.redirect(playbackUrl);
})

router.get('/:paylistId', async function (req, res) {
    var db = req.app.locals.db;
    var playlistId = req.params.paylistId;

    if (playlistId === "4k") {
        dbFilter = {
            "imdbInfo": { $ne: null },
            "media_document.videoMediaMetadata.width": { $gt: 3000 }
        }
    }

    switch (playlistId) {
        case "4k":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 3000 }
            }
            break;
        case "fhd":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 1800, $lt: 3000 }
            }
            break;
        case "hd":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 1200, $lt: 1800 }
            }
            break;
        case "hdhub4u":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "source": "hdhub"
            }
            break;
        case "extramovies":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "source": "extramovies"
            }
            break;
        default:
            dbFilter = {
                "imdbInfo": { $ne: null },
                "playlistId": playlistId
            }
            break;
    }


    db.collection(MEDIA_COLLECTION).find(dbFilter).sort({ "media_document.modifiedTime": -1 }).toArray(function (err, doc) {
        var g = [];
        doc.forEach(element => {
            var imdbInfo = element.imdbInfo;
            var mediaInfo = element.media_document;

            //hacky way
            if (element.source === 'hdhub' || element.source === 'extramovies') {
                var existingElement = g.find(x => x.imdbInfo.id === imdbInfo.id);
                if (!existingElement) {
                    //imdbInfo.posterThumb = `/api/images/roku?u=${encodeURIComponent(imdbInfo.poster)}&h=268`;;
                    var mediaSourceUrl = `/api/playlist/mediasource/byimdb/${encodeURIComponent(imdbInfo.id)}`;
                    existingElement = {
                        imdbInfo,
                        mediaSourceUrl
                    }
                    massageImdbPoster(existingElement);
                    g.push(existingElement);
                }
            } else {
                var existingElement = g.find(x => x.imdbInfo.id === imdbInfo.id);
                if (!existingElement) {
                    existingElement = {
                        imdbInfo: imdbInfo,
                        mediaSources: []
                    }
                    massageImdbPoster(existingElement);
                    g.push(existingElement);
                }
                var mediaSource = {
                    id: mediaInfo.id,
                    source: element.source,
                    mimeType: mediaInfo.mimeType,
                    size: mediaInfo.size,
                    videoMediaMetadata: mediaInfo.videoMediaMetadata
                };
                existingElement.mediaSources.push(mediaSource);
            }
        });

        // var itemsToReturn = doc.map(element => {
        //     element.source
        //     element.imdbInfo.id,
        //         element.imdbInfo.title,
        //         element.imdbInfo.plot,
        //         element.imdbInfo.year,
        //         element.imdbInfo.poster,
        //         element.media_document.id,
        //         element.media_document.mimeType,
        //         element.media_document.size,
        //         element.media_document.videoMediaMetadata.width,
        //         element.media_document.videoMediaMetadata.height,
        //         element.media_document.videoMediaMetadata.durationMillis
        // });

        var response = {};
        if (g) {
            response.success = true;
            response.items = g;
        }
        else {
            response.success = false;
            response.items = null;
        }
        res.send(response || [], null, 4);
    });
});

function massageImdbPoster(mediaItem) {
    //if poster is from amazon
    if (mediaItem.imdbInfo.poster.indexOf('blogspot.com') >= 0) {
        mediaItem.imdbInfo.posterThumb = mediaItem.imdbInfo.poster.replace('s200', 's182')
        mediaItem.imdbInfo.posterHD = mediaItem.imdbInfo.poster.replace('s200', 's776');
        mediaItem.imdbInfo.posterFHD = mediaItem.imdbInfo.poster.replace('s200', 's1552');
    }
    else if (mediaItem.imdbInfo.poster.indexOf('amazon.com') >= 0) {
        var basePoster = mediaItem.imdbInfo.poster.substring(0, (mediaItem.imdbInfo.poster.indexOf('.', 30)));
        mediaItem.imdbInfo.posterThumb = basePoster + "._V1_UX182_CR0,0,182,268_AL_.jpg";
        mediaItem.imdbInfo.posterHD = basePoster + "._V1_UX776_CR0,0,776,1024_AL_.jpg";
        mediaItem.imdbInfo.posterFHD = basePoster + "._V1_UX1552_CR0,0,1552,2048_AL_.jpg";
    }
    else {
        //need to change it to something better
        mediaItem.imdbInfo.posterThumb = mediaItem.imdbInfo.poster;
        mediaItem.imdbInfo.posterHD = mediaItem.imdbInfo.poster;
        mediaItem.imdbInfo.posterFHD = mediaItem.imdbInfo.poster;
    }
}

module.exports = router;

