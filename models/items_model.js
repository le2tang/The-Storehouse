const database = require("./database.js")

var items_model = {
  async create(item) {
    for (elem in item) {
      if (item[elem] != null && item[elem].length == 0) {
        item[elem] = null
      }
    }
    var query = "INSERT INTO items (itemname, quantity, description, tags) VALUES ($1, $2, $3, $4)"
    var result = await database.query(query, [item.itemname, item.quantity, item.description, item.tags])
    return result
  },

  async getAll() {
    var query = "SELECT * FROM items"
    var result = await database.query(query)
    return result.rows
  },

  async removeAll() {
    var query = "DELETE FROM items"
    var result = await database.query(query)
    return result
  },

  async getItemsByUids(uids) {
    var query = `SELECT * FROM items WHERE uid IN ('${uids.join("','")}')`
    var result = await database.query(query)
    return result.rows
  },

  async updateItemByUid(item) {
    for (elem in item) {
      if (item[elem] != null && item[elem].length == 0) {
        item[elem] = null
      }
    }
    var query = "UPDATE items SET itemname=$1, quantity=$2, description=$3, tags=$4 WHERE uid=$5"
    var result = await database.query(query, [item.itemname, item.quantity, item.description, item.tags, item.uid])
    return result
  },

  async removeItemByUid(uid) {
    var query = `DELETE FROM items WHERE uid='${uid}'`
    var result = await database.query(query)
    return result
  },

  async setupItemsTable() {
    var query = `CREATE TABLE IF NOT EXISTS items (
      uid SERIAL PRIMARY KEY NOT NULL,
      itemname VARCHAR (20) NOT NULL,
      quantity INT NOT NULL,
      description VARCHAR (32),
      tags VARCHAR (32))`
    var result = await database.query(query)

    console.log(result)

    return result
  }
}

items_model.setupItemsTable()

module.exports = items_model
