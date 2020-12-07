const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    required: [true, 'User must have a username'],
  },
  password: {
    type: String,
    minlength: 1,
    required: [true, 'User must have a password'],
  },
  email: {
    type: String,
    minlength: 1,
    required: [true, 'User must have an email'],
  },
});

module.exports = mongoose.model('users', usersSchema);
