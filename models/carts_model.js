const database = require("./database.js")

var carts_model = {
  async create(cart) {
    var query = "INSERT INTO carts (username, address, arrival, contact_method, contact_address, items, status, index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
    var result = await database.query(query, [cart.username, cart.address, cart.arrival, cart.contact_method, cart.contact_address, cart.items, cart.status, cart.index])
    return result
  },

  async getAll() {
    var query = "SELECT * FROM carts"
    var result = await database.query(query)
    return result.rows
  },

  async removeAll() {
    var query = "DELETE FROM carts"
    var result = await database.query(query)
    return result
  },

  async getCartsByUsername(username) {
    var query = `SELECT * FROM carts WHERE username='${username}'`
    var result = await database.query(query)
    return result.rows
  },
  
  async updateCartByUsername(cart, index) {
    var query = "UPDATE carts SET address=?, arrival=?, contact_method=?, contact_address=?, items=?, status=? WHERE username=? AND index=?"
    var result = await database.query(query, [cart.address, cart.arrival, cart.contact_method, cart.contact_address, cart.items, cart.status, cart.username, cart.index])
    return result
  },

  async updateCartStatusByUsername(username, index, status) {
    var query = `UPDATE carts SET status=${status} WHERE username='${username}' AND index=${index}`
    var result = await database.query(query)
    return result
  },

  async removeCartByUsername(username) {
    var query = `DELETE FROM carts WHERE username='${username}'`
    var result = await database.query(query)
    return result
  },

  status_msg: ["Pending", "Packed", "Delivered"],
  contact_method_msg: { "eml": "Email", "fcb": "Facebook", "txt": "Text", "wha": "WhatsApp" }
}

module.exports = carts_model
