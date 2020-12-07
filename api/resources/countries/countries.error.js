class CountryDoesntExist extends Error {
  constructor(message) {
    super(message);
    this.message = message || 'Country doesnt exist. Nothing here...';
    this.status = 404;
    this.name = 'CountryDoesntExist';
  }
}

class UserIsNotOwner extends Error {
  constructor(message) {
    super(message);
    this.message = message || 'You are not the creator of the country object.';
    this.status = 401;
    this.name = 'UserIsNotOwner';
  }
}

module.exports = {
  CountryDoesntExist,
  UserIsNotOwner,
};
