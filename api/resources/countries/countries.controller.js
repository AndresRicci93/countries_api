const Country = require('./countries.model');

function createCountry(country, owner) {
  return new Country({
    ...country,
    owner,
  }).save();
}

function getCountries() {
  return Country.find({});
}

function getCountry(id) {
  return Country.findById(id);
}

function deleteCountry(id) {
  return Country.findByIdAndRemove(id);
}

function modifyCountry(id, country, owner) {
  return Country.findOneAndUpdate(
    { _id: id },
    {
      ...country,
      owner,
    },
    {
      new: true,
    }
  );
}

module.exports = {
  createCountry,
  getCountries,
  getCountry,
  deleteCountry,
  modifyCountry,
};
