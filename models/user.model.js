const db = require("./db.js")

var UserList = {
  create(user, callback) {
    var query = "INSERT INTO users (username, password, level) VALUES ($1, $2, $3)"
    db.query(query, [user.username, user.password, user.level], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Created new user: ${res.insertId} ${user}`)
        callback(null, {id: res.insertId, ...user})
      }
    })
  },

  getAll(callback) {
    var query = "SELECT * FROM users"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Found users: ${res}`)
        callback(null, res)
      }
    })
  },

  removeAll(callback) {
    var query = "DELETE FROM users"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Deleted users: ${res}`)
        callback(null, res)
      }
    })
  },

  getByUsername(username, callback) {
    var query = `SELECT * FROM users WHERE username='${username}'`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.length > 0) {
        console.log(`Found user: ${res[0]}`)
        callback(null, res[0])
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  updateByUsername(user, callback) {
    var query = "UPDATE users SET password=?, level=? WHERE username=?"
    db.query(query, [user.password, user.level, user.username], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Updated user: ${user}`)
        callback(null, user)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  removeByUsername(username, callback) {
    var query = `DELETE FROM users WHERE username=${username}`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Removed user: ${username}`)
        callback(null, res)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  }
}

module.exports = UserList
