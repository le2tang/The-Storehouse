const database = require("./database.js")

var carts_model = {
  async getCartItems(cart) {
    item_uids = Object.keys(cart.items)

    var query = `SELECT * FROM items WHERE uid IN ('${item_uids.join("','")}')`
    var result = await database.query(query)

    stock_items = result.rows

    cart_items = stock_items.map((item) => {
      item.quantity = cart.items[item.uid]
      return item
    })

    return cart_items
  },

  async formatCarts(query_result) {
    carts = await Promise.all(query_result.map(async (cart) => {
      cart.items = await this.getCartItems(cart)
      cart.status = this.status_msg[cart.status]
      return cart
    }))
    return carts
  },

  async create(cart) {
    var query = "INSERT INTO carts (username, address, arrival, contact_method, contact_address, items, status, index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
    var result = await database.query(query, [cart.username, cart.address, cart.arrival, cart.contact_method, cart.contact_address, cart.items, cart.status, cart.index])
    return result
  },

  async getAll() {
    var query = "SELECT * FROM carts"
    var result = await database.query(query)
    return await this.formatCarts(result.rows) 
  },

  async removeAll() {
    var query = "DELETE FROM carts"
    var result = await database.query(query)
    return result
  },

  async getCartsByUsername(username) {
    var query = `SELECT * FROM carts WHERE username='${username}'`
    var result = await database.query(query)
    return await this.formatCarts(result.rows) 
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

  async setupCartsTable() {
    var query = `CREATE TABLE IF NOT EXISTS carts (
      username VARCHAR(32) PRIMARY KEY NOT NULL,
      address VARCHAR(32) NOT NULL,
      arrival DATE,
      contact_method CHAR(3) NOT NULL,
      contact_address VARCHAR (32) NOT NULL,
      items JSON,
      status VARCHAR (9) DEFAULT 'Pending' NOT NULL,
      index serial)`
    var result = await database.query(query)
    return result
  },

  groupCartsByUsername(carts) {
    unique_usernames = {}

    for (var cart of carts) {
      if (unique_usernames[cart.username] == "undefined") {
        unique_usernames[cart.username] = [cart]
      }
      else {
        unique_usernames[cart.username].push(cart)
      }
    }

    for (var username of unique_usernames) {
      username = this.sortCarts(username)
    }

    return unique_usernames
  },

  sortCarts(carts) {
    return carts.sort((cart1, cart2) => cart1.index > cart2.index)
  },

  getSummary(carts) {
    var counts = {
      "pending": 0,
      "packed": 0,
      "delivered": 0,
      "total": 0
    }
    
    for (var cart of carts) {
      switch(cart.status) {
        case "Pending":
          counts.pending += 1
          break
        case "Packed":
          counts.packed += 1
          break
        case "Delivered":
          counts.delivered += 1
          break
      }
      counts.total += 1
    }
    return counts
  },

  status_msg: ["Pending", "Packed", "Delivered"],
  contact_method_msg: { "eml": "Email", "fcb": "Facebook", "txt": "Text", "wha": "WhatsApp" }
}

carts_model.setupCartsTable()

module.exports = carts_model
