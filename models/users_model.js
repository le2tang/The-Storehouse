const database = require("./database.js")

var users_model = {
  async getUserByUsername(username) {
    var query = `SELECT * FROM users WHERE username='${username}'`
    var result = await database.query(query)
    return result.rows[0]
  }
}

module.exports = users_model
