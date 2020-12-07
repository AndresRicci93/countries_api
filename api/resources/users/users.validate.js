const Joi = require('joi');
const log = require('../../../utils/logger');

const bluePrintUser = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required(),
});

let validateUser = (req, res, next) => {
  const result = bluePrintUser.validate(req.body, {
    abortEarly: false,
    convert: false,
  });

  if (result.error === undefined) {
    next();
  } else {
    log.info(
      'User failed registration',
      result.error.details.map((error) => error.message)
    );
    res
      .status(400)
      .send(
        'Información del usuario no cumple los requisitos. El nombre del usuario debe ser alafanúmerico y tener entre 3 y 30 carácteres. La contraseña debe tener entre 6 y 200 carácteres. Asegúrate de que el email sea válido.'
      );
  }
};

const blueprintLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

let validateLogin = (req, res, next) => {
  const result = blueprintLogin.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (result.error === undefined) {
    next();
  } else {
    res
      .status(400)
      .send('Login failed, you must specificy username and password.');
  }
};

module.exports = {
  validateUser,
  validateLogin,
};
