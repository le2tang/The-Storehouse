const db = require("./db.js")

var UserList = {
  create(user, callback) {
    var query = "INSERT INTO users (name, password, level) VALUES ($1, $2, $3)"
    db.query(query, [user.name, user.password, user.level], (err, res) => {
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

  getByName(name, callback) {
    var query = `SELECT * FROM users WHERE name='${name}'`
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

  updateByName(user, callback) {
    var query = "UPDATE users SET password=?, level=? WHERE name=?"
    db.query(query, [user.password, user.level, user.name], (err, res) => {
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

  removeByName(name, callback) {
    var query = `DELETE FROM users WHERE name=${name}`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Removed user: ${name}`)
        callback(null, res)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  }
}

module.exports = UserList
