const express = require('express');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const cors = require('cors');
const path = require('path');
const status = require('http-status');

/* --------- APP SETTINGS ------------- */
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { serverSettings, databaseSettings } = require('./config/app/appConfig');

/* --------- APP LOGGING -------------- */
const morganLogger = require('./config/logging/morganConfig');
const winstonOptions = require('./config/logging/winstonConfig');
winston.loggers.add('apiLogger', winstonOptions);
const logger = winston.loggers.get('apiLogger');

/* --------- APP ROUTERS -------------- */
const indexRouter = require('./routes/index');
const ticketsRouter = require('./routes/tickets');

/* ---------- CONNECT DB -------------- */
const MongooseConnector = require('./helpers/mongoose');
MongooseConnector.connect(
  () => {
    logger.info(`Mongo connected as read-only (${databaseSettings.host}:${databaseSettings.port} - ${databaseSettings.name})`);
  },
  error => {
    logger.error(`Mongo connection error: ${error}`);
  }
);

logger.info(`Server started listening at port ${serverSettings.port}`);
const app = express();
app.use(morganLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('', indexRouter);
app.use('/tickets', ticketsRouter);

app.get('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Page not found'
  });
});

app.post('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Page not found'
  });
});

app.put('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Page not found'
  });
});

app.delete('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Page not found'
  });
});
module.exports = app;
