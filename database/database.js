const { Pool } = require("pg")
const database_config = require("../config/database_config.js")

const database = (process.env.DATABASE_URL) ?
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  : new Pool({
    host: database_config.HOST,
    port: database_config.PORT,
    database: database_config.DATABASE,
    user: database_config.USER,
  })

module.exports = database
