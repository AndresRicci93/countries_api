const environment = process.env.NODE_ENV || 'development';

const basicConf = {
  jwt: {},
  port: 3001,
  suprimirLogs: false,
};

let environmentConf = {};

switch (environment) {
  case 'development':
    environmentConf = require('./dev');
    break;
  case 'prod':
    environmentConf = require('./prod');
    break;
  default:
    environmentConf = require('./dev');
}

module.exports = {
  ...basicConf,
  ...environmentConf,
};
