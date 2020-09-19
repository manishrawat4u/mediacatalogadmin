function getChannelLogo(channelName) {
    try {
        if (channelName) {
            const normalizedChannelName = channelName.toLowerCase();
            if (/bt sport/.exec(normalizedChannelName)) {
                return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/BT_Sport_logo_2019.svg/640px-BT_Sport_logo_2019.svg.png';
            } else if (/sky/.exec(normalizedChannelName)) {
                return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Sky_Sports_logo_2017.svg/640px-Sky_Sports_logo_2017.svg.png';
            } else if (/fox/.exec(normalizedChannelName)) {
                return 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Fox_Sports_Logo.svg/640px-Fox_Sports_Logo.svg.png';
            } else if (/eurosport/.exec(normalizedChannelName)) {
                return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Eurosport_Logo_2015.svg/640px-Eurosport_Logo_2015.svg.png';
            } else if (/espn/.exec(normalizedChannelName)) {
                return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/640px-ESPN_wordmark.svg.png';
            }
        }
    } catch (e) {
        console.log(e.message);
    }
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';
}

module.exports.getChannelLogo = getChannelLogo;