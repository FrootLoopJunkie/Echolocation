const {Pool} = require('pg');

const pool = new Pool({
    user: 'Kolby',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'tempdb'
    // connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false
    // }
})

module.exports = pool;