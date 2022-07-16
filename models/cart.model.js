const db = require("./db.js")

var CartList = {
  create(cart, callback) {
    var query = "INSERT INTO carts (username, address, arrival, contact_method, contact_address, items, status) VALUES ($1, $2, $3, $4, $5, $6)"
    db.query(query, [cart.username, cart.address, cart.arrival, cart.contact_method, cart.contact_address, cart.items, cart.status], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Created new cart: ${res.insertId} ${user}`)
        callback(null, {id: res.insertId, ...cart})
      }
    })
  },

  getAll(callback) {
    var query = "SELECT * FROM carts"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Found carts: ${res}`)
        callback(null, res)
      }
    })
  },

  removeAll(callback) {
    var query = "DELETE FROM carts"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Deleted carts: ${res}`)
        callback(null, res)
      }
    })
  },

  getByUsername(username, callback) {
    var query = `SELECT * FROM carts WHERE username='${username}'`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.length > 0) {
        console.log(`Found cart: ${res[0]}`)
        callback(null, res[0])
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  updateByUsername(cart, callback) {
    var query = "UPDATE carts SET address=?, arrival=?, contact_method=?, contact_address=?, items=?, status=? WHERE username=?"
    db.query(query, [cart.address, cart.arrival, cart.contact_method, cart.contact_address, cart.items, cart.status, cart.username], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Updated cart: ${cart}`)
        callback(null, cart)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  removeByUsername(username, callback) {
    var query = `DELETE FROM carts WHERE username=${username}`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Removed cart: ${username}`)
        callback(null, res)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  }
}

module.exports = CartList
