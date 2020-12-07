const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const log = require('../../utils/logger');
const config = require('../../config');
const usersController = require('../resources/users/users.controller');

let jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
};

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  usersController
    .getUser({ id: jwtPayload.id })
    .then((user) => {
      if (!user) {
        log.info(
          `JWT token not valid. User with id ${jwtPayload.id} doesn't exist.`
        );
        next(null, false);
        return;
      }

      log.info(
        `User ${user.username} submit a valid token. Authentication completed.`
      );
      next(null, {
        username: user.username,
        id: user.id,
      });
    })
    .catch((err) => {
      log.error('Error occurred trying to validate a token.', err);
      next(err);
    });
});
