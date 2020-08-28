var ua = require('universal-analytics');
var visitor = ua(process.env.GA || 'UA-176119048-3');

module.exports.log = function (message) {
    visitor.event('SystemLogs', message).send();
};

module.exports.logEvent = function (category, action, label, value) {
    visitor.event(category, action, label).send();
}

module.exports.logError = function (errorMessage) {
    visitor.exception(errorMessage).send();
}

module.exports.logPageView = function (path, title, host, uip) {
    visitor.pageview({ dp: path, dt: title, dh: host, uip: uip }).send();
}

module.exports.logPageTiming = function (path, timing, uip) {
    visitor.timing({ utc: "User interaction", utv: path, utt: timing, uip: uip }).send();
}