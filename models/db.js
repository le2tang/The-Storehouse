const { Pool } = require("pg")
const db_config = require("../config/db.config.js")

// Connect to deployed database or test database
const db_connection = (process.env.DATABASE_URL) ?
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  : new Pool({
    host: db_config.HOST,
    port: db_config.PORT,
    database: db_config.DATABASE,        
    user: db_config.USER,
    password: db_config.PASSWORD
  })

module.exports = db_connection
