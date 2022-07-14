const { Pool } = require("ps")
const db_onfig = require("../config/db.config.js")

// Connect to deployed database or test database
const dbConnection = (process.env.DATABASE_URL) ?
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  : new Pool({
    host: db_onfig.HOST,
    port: db_onfig.PORT,
    database: db_onfig.DATABASE,        
    user: db_onfig.USER,
    password: db_onfig.PASSWORD
  })

module.exports = db_connection
