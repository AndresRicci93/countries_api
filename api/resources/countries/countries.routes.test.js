let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let request = require('supertest');
let mongoose = require('mongoose');
let config = require('../../../config');
let User = require('./../users/users.model');
let Country = require('./countries.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

let tokenInvalido =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk';

let countryAlreadyInTheDB = {
  name: 'Italy',
  flag: 'https://restcountries.eu/data/ita.svg',
  population: 60000000,
  region: 'Europe',
  capital: 'Rome',
  currency: 'Euro',
  toplevel: '.it',
  language1: 'Italian',
  owner: 'Andres',
};

let newCountry = {
  name: 'Argentina',
  flag: 'https://restcountries.eu/data/arg.svg',
  population: 45000000,
  region: 'South America',
  capital: 'Buenos Aires',
  currency: 'Peso Argentino',
  toplevel: '.com.ar',
  language1: 'Spanish',
};

let idInexistente = '5ab8dbcc6539f91c2288b0c1';

let UserTest = {
  username: 'andres',
  email: 'andres@gmail.com',
  password: 'ciaocomevaaaaa',
};

let authToken;

function obtainToken(done) {
  // Antes de este bloque de tests creamos un usuario y obtenemos
  // su JWT token. Esto nos permitirá testear rutas que requieren autenticación.

  User.deleteMany({}, (err) => {
    if (err) done(err);
    request(app)
      .post('/users')
      .send(UserTest)
      .end((err, res) => {
        expect(res.status).toBe(201);
        request(app)
          .post('/users/login')
          .send({
            username: UserTest.username,
            password: UserTest.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            done();
          });
      });
  });
}

describe('Countries', () => {
  beforeEach((done) => {
    Country.deleteMany({}, (err) => {
      done();
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe('GET /countries/:id', () => {
    it('Trying to obtain a country with an invalid id  should return 400', (done) => {
      request(app)
        .get('/countries/123')
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('Trying to obtain a country that doesnt exist should return 404', (done) => {
      request(app)
        .get(`/countries/${idInexistente}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          done();
        });
    });

    it('IT should return a country object', (done) => {
      Country(countryAlreadyInTheDB)
        .save()
        .then((country) => {
          request(app)
            .get(`/countries/${country._id}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Object);
              expect(res.body.name).toEqual(country.name);
              expect(res.body.flag).toEqual(country.flag);
              expect(res.body.population).toEqual(country.population);
              expect(res.body.region).toEqual(country.region);
              expect(res.body.capital).toEqual(country.capital);
              expect(res.body.currency).toEqual(country.currency);
              expect(res.body.toplevel).toEqual(country.toplevel);
              expect(res.body.language1).toEqual(country.language1);
              expect(res.body.owner).toEqual(country.owner);
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('POST /countries', () => {
    beforeAll(obtainToken);

    it('If the user provides a valid token and a valid country object it should be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCountry)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.name).toEqual(newCountry.name);
          expect(res.body.flag).toEqual(newCountry.flag);
          expect(res.body.population).toEqual(newCountry.population);
          expect(res.body.region).toEqual(newCountry.region);
          expect(res.body.capital).toEqual(newCountry.capital);
          expect(res.body.currency).toEqual(newCountry.currency);
          expect(res.body.toplevel).toEqual(newCountry.toplevel);
          expect(res.body.language1).toEqual(newCountry.language1);

          done();
        });
    });

    it('If the user does not provide a valid token it should return 401', (done) => {
      request(app)
        .post('/countries')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmY2RmODYyNTU4NjZjMTxNGQxNmM2OSIsImlhdCI6MTYwNzMzMzk5MSwiZXhwIjoxNjA3NDIwMzkxfQ.4DSsgfOiyCTF7m15x4BwIL7Vsh8U3PhjDYxs7uJF-H0`
        )
        .send(newCountry)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    it('If the country is missing the name field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flag: newCountry.flag,
          population: newCountry.population,
          region: newCountry.region,
          capital: newCountry.capital,
          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('If the country is missing the flag field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,

          population: newCountry.population,
          region: newCountry.region,
          capital: newCountry.capital,
          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('if the  country is missing the population field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,

          region: newCountry.region,
          capital: newCountry.capital,
          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('if the country is missing the region field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,
          population: newCountry.population,

          capital: newCountry.capital,
          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('If the country is missing the capital field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,
          population: newCountry.population,
          region: newCountry.region,

          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('If the country is missing the currency field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,
          population: newCountry.population,
          region: newCountry.region,
          capital: newCountry.capital,

          toplevel: newCountry.toplevel,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('If the country is missing the toplevel field, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,
          population: newCountry.population,
          region: newCountry.region,
          capital: newCountry.capital,
          currency: newCountry.currency,
          language1: newCountry.language1,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('If the country is missing language1, it should not be created', (done) => {
      request(app)
        .post('/countries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: newCountry.name,
          flag: newCountry.flag,
          population: newCountry.population,
          region: newCountry.region,
          capital: newCountry.capital,
          currency: newCountry.currency,
          toplevel: newCountry.toplevel,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });
  });

  describe('DELETE /countries/:id', () => {
    let ExistingCountryID;

    beforeAll(obtainToken);

    beforeEach((done) => {
      Country.deleteMany({}, (err) => {
        if (err) done(err);
        Country(countryAlreadyInTheDB)
          .save()
          .then((country) => {
            ExistingCountryID = country._id;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    it('Trying to obtain a country object with an invalid id should return 400', (done) => {
      request(app)
        .delete(`/countries/123`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it('Trying to delete a product that doesnt exist should return 404', (done) => {
      request(app)
        .delete(`/countries/dsa87d32adas`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          done();
        });
    });

    it('If the does not provide a valid token, should return 401', (done) => {
      request(app)
        .delete(`/countries/${ExistingCountryID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    it('Yore not the owner of the country object, should return 401', (done) => {
      Country({
        name: 'fdsfdsfds',
        flag: 'https://restcountries.eu/data/ita.svg',
        population: 60000000,
        region: 'Europe',
        capital: 'Rome',
        currency: 'Euro',
        toplevel: '.it',
        language1: 'Italian',
        owner: 'ricardo98',
      })
        .save()
        .then((country) => {
          request(app)
            .delete(`/countries/${country._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(401);
              expect(
                res.text.includes(
                  'You are not the creator of the country object.'
                )
              ).toBe(false);
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
