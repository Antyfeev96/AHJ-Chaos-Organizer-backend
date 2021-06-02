const moment = require('moment');

const format = () => {
  return {
    date: +moment().valueOf(),
    timestamp: moment().format('HH:mm:ss')
  }
};

module.exports.format = format;