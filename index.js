const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const usersRouter = require('./api/resources/users/users.routes');
const countriesRouter = require('./api/resources/countries/countries.routes');
const logger = require('./utils/logger');
const authJWT = require('./api/libs/auth');
const passport = require('passport');
const { log } = require('winston');
const errorHandler = require('./api/libs/errorHandler');
passport.use(authJWT);

const URI = '***connection string***';

mongoose.connect(URI, { useUnifiedTopology: true, useNewUrlParser: true });

mongoose.connection
  .once('open', function (client) {
    console.log('connection has been made');
    console.log('status:' + mongoose.connection.readyState);
  })
  .on('error', () => {
    logger.error('connection with mongodb failed');
    process.exit(1);
  });

const app = express();

app.use(bodyParser.json());
app.use(
  morgan('short', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use('/countries', countriesRouter);
app.use('/users', usersRouter);

app.use(errorHandler.processDBErrors);

if (config.environment === 'prod') {
  app.use(errorHandler.errorsProduction);
} else {
  app.use(errorHandler.errorsDevelopment);
}

const server = app.listen(3002, () => {
  logger.info('listening on port 3002');
});

module.exports = {
  app,
  server,
};
