const knex = require('knex')({
    client: 'mysql',
    connection: {
        host            : 'localhost',
        user            : 'root',
        port            : 3306,
        password        : '1q2w3e4r!',
        database        : 'iotdb',
    }
});

module.exports = knex;
