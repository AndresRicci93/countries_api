let request = require('supertest');
let User = require('./users.model');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let app = require('../../../index').app;
let server = require('../../../index').server;
let config = require('../../../config');
let mongoose = require('mongoose');

let dummyUsers = [
  {
    username: 'andres',
    email: 'andres@gmail.com',
    password: 'fdsafas542f',
  },
  {
    username: 'marco',
    email: 'marco@gmail.com',
    password: 'djsai32joia',
  },
  {
    username: 'diego',
    email: 'diego@gmail.com',
    password: 'un2r3rnibsiu',
  },
];

function userExistAndAttributesAreCorrect(user, done) {
  User.find({ username: user.username })
    .then((users) => {
      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual(user.username);
      expect(users[0].email).toEqual(user.email);

      let equals = bcrypt.compareSync(user.password, users[0].password);
      expect(equals).toBeTruthy();
      done();
    })
    .catch((err) => {
      done(err);
    });
}

async function userDoesntExist(user, done) {
  try {
    let users = await User.find().or([
      { username: user.username },
      { email: user.email },
    ]);
    expect(users).toHaveLength(0);
    done();
  } catch (err) {
    done(err);
  }
}

describe('Users', () => {
  beforeEach((done) => {
    User.deleteMany({}, (err) => {
      done();
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe('GET /users', () => {
    test('With no users, should return an empty array', (done) => {
      request(app)
        .get('/users')
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test('With users, it should return them in an array', (done) => {
      Promise.all(dummyUsers.map((user) => new User(user).save())).then(
        (user) => {
          request(app)
            .get('/users')
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(3);
              done();
            });
        }
      );
    });
  });

  describe('POST /users', () => {
    test('A user that satisfy all the requirements should be created', (done) => {
      request(app)
        .post('/users')
        .send(dummyUsers[0])
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe('string');
          expect(res.text).toEqual('User created successfully.');
          userExistAndAttributesAreCorrect(dummyUsers[0], done);
        });
    });

    test('Creating an account with an existing username should fail', (done) => {
      Promise.all(dummyUsers.map((user) => new User(user).save())).then(
        (users) => {
          request(app)
            .post('/users')
            .send({
              username: 'andres',
              email: 'andresnew@gmail.com',
              password: 'afsasasasfsa',
            })
            .end((err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe('string');
              done();
            });
        }
      );
    });

    test('Creating an account with an existing email should fail', (done) => {
      Promise.all(dummyUsers.map((user) => new User(user).save())).then(
        (users) => {
          request(app)
            .post('/users')
            .send({
              username: 'newandres',
              email: 'andres@gmail.com',
              password: 'dsadsadsadsaasd',
            })
            .end((err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe('string');
              done();
            });
        }
      );
    });

    test('An account without a username should not be created', (done) => {
      request(app)
        .post('/users')
        .send({
          email: 'andres@gmail.com',
          password: 'password',
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('An account without a password should not be created', (done) => {
      request(app)
        .post('/users')
        .send({
          username: 'andres',
          email: 'andres@gmail.com',
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('An account without an email should not be created', (done) => {
      request(app)
        .post('/users')
        .send({
          username: 'andres',
          password: 'passwordd',
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('An account with an invalid email should not be created', (done) => {
      let user = {
        username: 'andres',
        email: '@gmail.com',
        password: 'passsssssss',
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          userDoesntExist(user, done);
        });
    });

    test('An account with a username of less than 3 characters should not be created', (done) => {
      let user = {
        username: 'sa',
        email: 'sasasasa@gmail.com',
        password: 'sasasasasaasaa',
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          userDoesntExist(user, done);
        });
    });

    test('An account with a username of more than 30 characters should not be created', (done) => {
      let user = {
        username: 'andresss'.repeat(10),
        email: 'andres@gmail.com',
        password: 'passworddd',
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          userDoesntExist(user, done);
        });
    });

    test('An account with a password of less than 6 characteres should not be created', (done) => {
      let user = {
        username: 'andres',
        email: 'andres@gmail.com',
        password: 'abc',
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          userDoesntExist(user, done);
        });
    });

    test('An account with a password of more than 200 characters should not be created', (done) => {
      let user = {
        username: 'andres',
        email: 'andres@gmail.com',
        password: 'passworddddd'.repeat(40),
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          userDoesntExist(user, done);
        });
    });

    test('The username and password of a valid account should be saved in lowercase', (done) => {
      let user = {
        username: 'AnDrES',
        email: 'ANDRES@GMAIL.cOm',
        password: 'alaalalalalalala',
      };
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe('string');
          expect(res.text).toEqual('User created successfully.');
          userExistAndAttributesAreCorrect(
            {
              username: user.username.toLowerCase(),
              email: user.email.toLowerCase(),
              password: user.password,
            },
            done
          );
        });
    });
  });

  describe('POST /login', () => {
    test('Login should fail for a request that doesnt have the username', (done) => {
      let bodyLogin = {
        password: 'ciaociaociao',
      };
      request(app)
        .post('/users/login')
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('Login should fail for a request that doesnt have a password', (done) => {
      let bodyLogin = {
        username: 'nonesisto',
      };
      request(app)
        .post('/users/login')
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('Login should fail for a user that its not registered', (done) => {
      let bodyLogin = {
        username: 'nonesisto',
        password: 'holaholahola',
      };
      request(app)
        .post('/users/login')
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe('string');
          done();
        });
    });

    test('Login should fail for a registered user that provides a wrong password.', (done) => {
      let user = {
        username: 'dante',
        email: 'dante@gmail.com',
        password: 'acorrectpassword',
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post('/users/login')
            .send({
              username: user.username,
              password: 'awrongpassword',
            })
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(typeof res.text).toBe('string');
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test('A registered user should get a JWT token when login with correct credentials', (done) => {
      let user = {
        username: 'marco',
        email: 'marco@gmail.com',
        password: 'marcomarcomarcomaroco',
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post('/users/login')
            .send({
              username: user.username,
              password: user.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.time,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test('Capitalization of username should not matter', (done) => {
      let user = {
        username: 'daniele',
        email: 'daniel@gmail.com',
        password: 'danieledanieledaniele',
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post('/users/login')
            .send({
              username: 'DaNIELe',
              password: user.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.time,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
