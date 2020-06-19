const fs = require('fs');

const commonConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: 'wintc.top',
  dialect: 'mysql',
  port: 3306,
}


module.exports = {
  development: Object.assign({}, commonConfig, {
    database: process.env.DB_NAME_DEV
  }),
  production: Object.assign({}, commonConfig, {
    database: process.env.DB_NAME
  })
};
