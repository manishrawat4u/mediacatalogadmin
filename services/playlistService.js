var nurlresolver = require('nurlresolver');

async function generateItems(sourceUrlList) {
    var promises = [];
    sourceUrlList.forEach(element => {
        var mediaLInk = element;
        var promise = nurlresolver.resolveRecursive(mediaLInk, {
            timeout: 20
        });
        promises.push(promise);
    });
    await Promise.all(promises);
    var mediaSources = [];

    for (const promise of promises) {
        var promiseValue = await promise;
        promiseValue.forEach(x => {
            var hostName;
            try {
                hostName = new URL(x.parent).hostname;
            } catch (error) {
                hostName = 'NONE';
            }

            var mediaSource = {
                id: "",
                streamUrl: x.link,
                title: x.title || x.link,
                mimeType: "mkv",
                size: "0",
                source: 'api',
                hostName: hostName,
                headers: x.headers,
                live: 0 //can be determined by hls source
            };
            mediaSources.push(mediaSource)
        })
    }
    return mediaSources;
}

module.exports.generateItems = generateItems;