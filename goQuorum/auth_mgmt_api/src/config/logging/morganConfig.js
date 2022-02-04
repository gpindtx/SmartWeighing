const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const { logging } = require('../app/appConfig');

const accessLogStream = rfs.createStream(logging.accessLogFilename, {
  size: '10M',
  interval: '1d',
  path: logging.accessLogPath
});

module.exports = morgan(logging.accessLogFormat, { stream: accessLogStream });