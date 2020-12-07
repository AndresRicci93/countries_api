const express = require('express');

const { uuid } = require('uuidv4');
const Joi = require('joi');

const log = require('../../../utils/logger');
const validateCountry = require('./countries.validate');
const passport = require('passport');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const countriesRouter = express.Router();
const countryController = require('./countries.controller');
const countriesController = require('./countries.controller');
const processErrors = require('../../libs/errorHandler').processErrors;
const UserIsNotOwner = require('./countries.error').UserIsNotOwner;
const CountryDoesntExist = require('./countries.error').CountryDoesntExist;

function validateId(req, res, next) {
  let id = req.params.id;
  // regex
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`The id [${id}] supplied is not valid`);
    return;
  }
  next();
}

countriesRouter.get(
  '/',
  processErrors((req, res) => {
    return countryController.getCountries().then((countries) => {
      res.json(countries);
    });
  })
);

countriesRouter.post(
  '/',
  [jwtAuthenticate, validateCountry],
  processErrors((req, res) => {
    return countryController
      .createCountry(req.body, req.user.username)
      .then((country) => {
        log.info('Country added...', country.toObject());
        res.status(201).json(country);
      });
  })
);

countriesRouter.get(
  '/:id',
  validateId,
  processErrors((req, res) => {
    let id = req.params.id;
    return countryController.getCountry(id).then((country) => {
      if (!country)
        throw new CountryDoesntExist(`Country with id [${id}] does not exist.`);

      res.json(country);
    });
  })
);

countriesRouter.put(
  '/:id',
  [jwtAuthenticate, validateCountry],
  processErrors(async (req, res) => {
    let id = req.params.id;
    let requestUser = req.user.username;
    let replaceCountry;

    replaceCountry = await countryController.getCountry(id);

    if (!replaceCountry) {
      throw new CountryDoesntExist(
        `The country with id [${id}] doesn't exist. `
      );
    }

    if (replaceCountry.owner !== requestUser) {
      log.warn(
        `User [${requestUser}] is not the owner of the country object with id [${id}]. The real owner is [${replaceCountry.owner}]. Request will not be processed`
      );
      throw new UserIsNotOwner(
        `You are not the owner of the country object with id [${id}]. You can only modify country object that you have created.`
      );
    }

    countryController
      .modifyCountry(id, req.body, requestUser)
      .then((country) => {
        res.json(country);
        log.info(
          `Country object data with id [${id}] has been replaced with new data`,
          country.toObject()
        );
      });
  })
);

countriesRouter.delete(
  '/:id',
  [jwtAuthenticate, validateId],
  processErrors(async (req, res) => {
    let id = req.params.id;
    let countryToDelete;

    countryToDelete = await countryController.getCountry(id);

    if (!countryToDelete) {
      log.info(
        `Country with id [${id}] doesn't exist. Nothing to delete here...`
      );
      throw new CountryDoesntExist(
        `Country with id [${id}] doesn't exist. Nothing to delete.`
      );
    }

    let userNoAuth = req.user.username;

    if (countryToDelete.owner !== userNoAuth) {
      log.info(
        `Usuario [${userNoAuth}] no es dueño de producto con id [${id}]. Dueño real es [${countryToDelete.owner}]. Request no será procesado`
      );
      throw new UserIsNotOwner(
        `You're not the creator of the country object with id ${id}. You can only delete the country objects  that you have created.`
      );
    }

    let deletedCountry = await countriesController.deleteCountry(id);
    log.info(`Country with id [${id}] deleted.`);
    res.json(deletedCountry);
  })
);

module.exports = countriesRouter;
