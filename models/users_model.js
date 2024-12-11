const database = require("../database/database.js")

var users_model = {
  async createUser(username, password_hash) {
    var query = `INSERT INTO users (username, password_hash) VALUES ('${username}', '${password_hash}')`
    var result = await database.query(query)
    return result
  },

  async getUserByUsername(username) {
    var query = `SELECT * FROM users WHERE username='${username}'`
    var result = await database.query(query)
    return result.rows[0]
  },

  async getPasswordHashByUsername(username) {
    var query = `SELECT password_hash FROM users WHERE username='${username}'`
    var result = await database.query(query)
    return result.rows[0]
  },

  async getRoleByUsername(username) {
    var query = `SELECT role FROM users WHERE username='${username}'`
    var result = await database.query(query)
    return result.rows[0]
  },

  async setupUsersTable(admin_username, admin_password) {
    var query = `CREATE TABLE IF NOT EXISTS users (
      username VARCHAR (32) PRIMARY KEY NOT NULL UNIQUE,
      password VARCHAR (32) NOT NULL
    )`
    var result = await database.query(query)
    return result
  }
}

users_model.setupUsersTable()

module.exports = users_model
