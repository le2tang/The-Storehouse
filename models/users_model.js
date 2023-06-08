const database = require("./database.js")

var users_model = {
  async getUserByUsername(username) {
    var query = `SELECT * FROM users WHERE username='${username}'`
    var result = await database.query(query)

    console.log(result)

    return result.rows[0]
  },

  async setupUsersTable(admin_username, admin_password) {
    var query = `CREATE TABLE IF NOT EXISTS users (
      username VARCHAR (32) PRIMARY KEY NOT NULL UNIQUE,
      password VARCHAR (32) NOT NULL)`
    var result = await database.query(query)

    console.log(result)

    return result
  }
}

users_model.setupUsersTable()

module.exports = users_model
