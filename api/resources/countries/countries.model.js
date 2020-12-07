const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Country must have a name'],
  },
  flag: {
    type: String,
    min: 0,
    required: [true, 'Country must have a flag'],
  },
  population: {
    type: Number,
    min: 0,
    required: [true, 'Country must have the population value'],
  },
  region: {
    type: String,
    min: 0,
    required: [true, 'Country must have a region'],
  },
  capital: {
    type: String,
    min: 0,
    required: [true, 'Country must have a capital'],
  },
  currency: {
    type: String,
    min: 0,
    required: [true, 'Country must have a currency'],
  },
  toplevel: {
    type: String,
    min: 0,
    required: [true, 'Country must have a toplevel domain'],
  },
  language1: {
    type: String,
    min: 0,
    required: [true, 'Country must have a language'],
  },
  language2: {
    type: String,
    min: 0,
  },
  language3: {
    type: String,
    min: 0,
  },

  owner: {
    type: String,
    required: [true, 'Country object must be associated with an account.'],
  },
});

module.exports = mongoose.model('country', countrySchema);
