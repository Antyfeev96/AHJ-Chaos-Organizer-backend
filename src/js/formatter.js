const moment = require('moment');

const format = () => {
  const date = new Date();

  // const formatter = new Intl.DateTimeFormat('ru', {
  //  hour: 'numeric',
  //  minute: 'numeric',
  //  seconds: 'numeric',
  // });
  const ms = date.getMilliseconds();
  console.log(moment(ms));

  return ms.toString();
};

module.exports.format = format;