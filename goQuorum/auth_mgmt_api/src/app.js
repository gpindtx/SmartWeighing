const express = require('express');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const cors = require('cors');
const path = require('path');
const status = require('http-status');

/* -------------- APP SETTINGS ---------------- */
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { serverSettings, databaseSettings } = require('./config/app/appConfig');

/* -------------- LOGGING --------------------- */
const morganLogger = require('./config/logging/morganConfig');
const winstonOptions = require('./config/logging/winstonConfig');
winston.loggers.add('apiLogger', winstonOptions);
const logger = winston.loggers.get('apiLogger');

/* ------------- APP ROUTES ------------------- */
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const customersRouter = require('./routes/customers');
const stationsRouter = require('./routes/stations');
const authorizationRouter = require('./routes/authorization');
const blacklistedTokensRouter = require('./routes/blacklistedTokens');

/* --------------- CONNECT DB ----------------- */
const MongooseConnector = require('./helpers/mongoose');
MongooseConnector.connect(
  () => {
    logger.info(`Mongo connected (${databaseSettings.host}:${databaseSettings.port} - ${databaseSettings.name})`);
  },
  error => {
    logger.error(`Mongo connection error - ${error}`);
  }
);

logger.info(`Server started listening at port ${serverSettings.port}`);
const app = express();
app.use(cors());
app.use(morganLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/stations', stationsRouter);
app.use('/blacklisted_tokens', blacklistedTokensRouter);
app.use('/authorization', authorizationRouter);

app.get('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Route NOT FOUND'
  });
});

app.post('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Route NOT FOUND'
  });
});

app.put('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Route NOT FOUND'
  });
});

app.delete('*', (req, res) => {
  res.status(status.NOT_FOUND).json({
    message: 'Route NOT FOUND'
  });
});

module.exports = app;
