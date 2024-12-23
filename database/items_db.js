const database = require("../database/database.js")

var items_db = {
  async create(item) {
    item = this.cleanItem(item)

    try {
      var result = await database.query(
        `UPDATE items SET quantity=quantity+${item.quantity} WHERE itemname='${item.itemname}' AND description='${item.description}';
        INSERT INTO items (itemname, quantity, description, tags) SELECT '${item.itemname}', ${item.quantity}, '${item.description}', '${item.tags}'
        WHERE NOT EXISTS (SELECT uid FROM items WHERE itemname='${item.itemname}' and description='${item.description}')`
      )

      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getAll() {
    try {
      const result = await database.query(
        `SELECT * FROM items SORT BY tags ASC, itemname ASC, description ASC`
      )
      return {
        status: "OK",
        result: result.rows
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async removeAll() {
    try {
      const result = await database.query(
        `DELETE FROM items`
      )
      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getItemsByUids(uids) {
    try {
      var result = await database.query(
        `SELECT * FROM items WHERE uid IN ('${uids.join("','")}')  SORT BY tags ASC, itemname ASC, description ASC`
      )
      return {
        status: "OK",
        result: result.rows
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async updateItemByUid(item) {
    item = this.cleanItem(item)
    try {
      var result = await database.query(
        `UPDATE items SET itemname=$1, quantity=$2, description=$3, tags=$4 WHERE uid=$5`,
        [item.itemname, item.quantity, item.description, item.tags, item.uid]
      )
      return result
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async removeItemByUid(uid) {
    try {
      var result = await database.query(
        `DELETE FROM items WHERE uid='${uid}'`
      )
      return result
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  cleanItem(item) {
    if (!("itemname" in item)) {
      item.itemname = ""
    } else {
      item.itemname = item.itemname.trim().toLowerCase()
    }

    if (!("description" in item) || item.description.length == 0) {
      item.description = ""
    } else {
      item.description = item.description.trim().toLowerCase()
    }

    if (!("tags" in item) || item.tags.length == 0) {
      item.tags = ""
    } else {
      item.tags = item.tages.trim().toLowerCase()
    }

    return item
  }
}

items_model.setupItemsTable()

module.exports = items_model
