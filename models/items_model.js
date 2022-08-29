const database = require("./database.js")

var items_model = {
  async create(item) {
    for (elem in item) {
      if (item[elem].length == 0) {
        item[elem] = null
      }
    }
    console.log(item)
    var query = "INSERT INTO items (uid, itemname, quantity, description, tags) VALUES ($1, $2, $3, $4, $5)"
    var result = await database.query(query, [item.uid, item.itemname, item.quantity, item.description, item.tags])
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
      if (item[elem].length == 0) {
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
  }
}

module.exports = items_model
