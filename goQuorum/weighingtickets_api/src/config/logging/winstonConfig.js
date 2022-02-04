const winstonConfig = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const { logging } = require('../app/appConfig');

const winstonOptions = {
  levels: winstonConfig.config.syslog.levels,
  format: winstonConfig.format.combine(
    winstonConfig.format.colorize(),
    winstonConfig.format.timestamp(),
    winstonConfig.format.align(),
    winstonConfig.format.printf(
      info => `[${info.level} ${info.timestamp}]: ${info.message}`)
  ),
  transports: [
    new winstonDailyRotateFile({
      maxSize: '10M',
      frequency: '1h',
      utc: true,
      dirname: logging.apiLogPath,
      filename: logging.apiLogFilename,
      datePattern: 'YYYY-MM-DD',
      level: 'info'
    }),
    new winstonConfig.transports.Console({
      level: 'info'
    })
  ]
};

module.exports = winstonOptions;