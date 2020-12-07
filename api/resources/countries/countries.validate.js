const Joi = require('joi');
const log = require('../../../utils/logger');

const blueprintCountry = Joi.object({
  name: Joi.string().max(56).required(),
  flag: Joi.string().required(),
  population: Joi.number().required(),
  region: Joi.string().required(),
  capital: Joi.string().required(),
  currency: Joi.string().max(20).required(),
  toplevel: Joi.string().max(10).required(),
  language1: Joi.string().max(15).required(),
  language2: Joi.string().max(15),
  language3: Joi.string().max(15),
});

module.exports = (req, res, next) => {
  let result = blueprintCountry.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  console.log(result);
  if (result.error === undefined) {
    next();
    return;
  } else {
    let validationError = result.error.details.reduce((acc, error) => {
      return acc + `[${error.message}]`;
    }, '');

    log.warn(
      `The selected Country didn't pass the validation: `,
      req.body,
      validationError
    );
    res.status(400).send(validationError);
  }
};
