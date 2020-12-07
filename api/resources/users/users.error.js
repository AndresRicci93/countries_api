class UserDataAlreadyInUse extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || 'El email o usuario ya están asociados con una cuenta.';
    this.status = 409;
    this.name = 'DatosDeUsuarioYaEnUso';
  }
}

class IncorrectCredentials extends Error {
  constructor(message) {
    super(message);
    this.message =
      message ||
      'Incorrect credentials, please be sure that the username & password are correct.';
    this.status = 400;
    this.name = 'IncorrectCredentials';
  }
}

module.exports = {
  UserDataAlreadyInUse,
  IncorrectCredentials,
};
