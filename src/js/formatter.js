const format = () => {
  const date = new Date();

  const formatter = new Intl.DateTimeFormat('ru', {
   hour: 'numeric',
   minute: 'numeric',
  });

  return `${formatter.format(date)}`;
};

module.exports.format = format;