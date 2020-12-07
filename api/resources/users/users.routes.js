const express = require('express');

const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger');
const config = require('../../../config');
const userController = require('./users.controller');
const validateUser = require('./users.validate').validateUser;
const validateLogin = require('./users.validate').validateLogin;
const processErrors = require('../../libs/errorHandler').processErrors;
const UserDataAlreadyInUse = require('./users.error').UserDataAlreadyInUse;
const IncorrectCredentials = require('./users.error').IncorrectCredentials;
const usersRouter = express.Router();

function bodyToLowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
}

usersRouter.get(
  '/',
  processErrors((req, res) => {
    return userController.getUsers().then((users) => {
      res.json(users);
    });
  })
);

usersRouter.post(
  '/',
  [validateUser, bodyToLowerCase],
  processErrors((req, res) => {
    let newUser = req.body;

    return userController
      .userExist(newUser.username, newUser.email)
      .then((userExist) => {
        if (userExist) {
          log.warn(
            `Email [${newUser.email}] or username [${newUser.username}] already exist in the db.`
          );
          throw new UserDataAlreadyInUse();
        }

        return bcrypt.hash(newUser.password, 10);
      })
      .then((hash) => {
        return userController.createUser(newUser, hash).then((newUser) => {
          res.status(201).send(`User created successfully.`);
        });
      });
  })
);

usersRouter.post(
  '/login',
  [validateLogin, bodyToLowerCase],
  processErrors(async (req, res) => {
    let userNoAuth = req.body;

    let regUser;

    regUser = await userController.getUser({
      username: userNoAuth.username,
    });

    if (!regUser) {
      log.info(
        `User [${userNoAuth.username}] doesn't exist. Can't authenticate.`
      );
      throw new IncorrectCredentials();
    }

    let correctPass;

    correctPass = await bcrypt.compare(userNoAuth.password, regUser.password);

    if (correctPass) {
      let token = jwt.sign({ id: regUser.id }, config.jwt.secret, {
        expiresIn: config.jwt.time,
      });

      log.info(`User ${userNoAuth.username} completed authentication.`);
      res.status(200).json({ token });
    } else {
      log.info(
        `User ${userNoAuth.username} didn't complete the authentication. Wrong password.`
      );
      throw new IncorrectCredentials();
    }
  })
);

module.exports = usersRouter;
