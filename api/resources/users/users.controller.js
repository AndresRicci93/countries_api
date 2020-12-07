const User = require('./users.model');

function getUsers() {
  return User.find({});
}

function createUser(user, hashedPassword) {
  return new User({
    ...user,
    password: hashedPassword,
  }).save();
}

function userExist(username, email) {
  return new Promise((resolve, reject) => {
    User.find()
      .or([{ username: username }, { email: email }])
      .then((users) => {
        resolve(users.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getUser({ username: username, id: id }) {
  if (username) return User.findOne({ username: username });
  if (id) return User.findById(id);
  throw new Error(
    'Function getUser of the controller has been called without specify username or id. '
  );
}

module.exports = {
  getUsers,
  createUser,
  userExist,
  getUser,
};
