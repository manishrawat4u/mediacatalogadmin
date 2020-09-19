const daddyLiveChannelsUrl = 'https://daddylive.live/24-hours-channels.php';
const axios = require('axios');
var cheerio = require('cheerio');
async function performDaddyLiveCrawling() {
    try {
        const apiResposne = await axios.get(daddyLiveChannelsUrl);
        const $ = cheerio.load(apiResposne.data);
        const links = $('a.btn-outline-primary');
        const elementsToREturn = [];
        $(links).each((_, x) => {
            if ($(x).attr('href') && $(x).attr('href').startsWith('/channels/')) {
                const absoluteUrlOfChannel = new URL($(x).attr('href'), daddyLiveChannelsUrl);
                elementsToREturn.push({
                    link: absoluteUrlOfChannel.href,
                    channelName: $(x).text() && $(x).text().trim()
                });
            }
        });
        return elementsToREturn;
    } catch (error) {
        console.log('Error occurred in performDaddyLiveCrawling');
        console.log(error);
    }
}

module.exports.extractLinks = performDaddyLiveCrawling;