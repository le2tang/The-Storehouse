const database = require("../database/database.js")

const items_db = {
  async create(item) {
    try {
      const result = await database.query(
        `UPDATE items SET quantity=quantity+${item.quantity}
        WHERE itemname='${item.itemname}' AND description='${item.description}';
        INSERT INTO items (itemname, quantity, description, tags)
        SELECT '${item.itemname}', ${item.quantity}, '${item.description}', '${item.tags}'
        WHERE NOT EXISTS (SELECT uid FROM items WHERE itemname='${item.itemname}' and description='${item.description}')`
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "ITEM_NOT_CREATED"
        }
      }

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
        `SELECT * FROM items ORDER BY tags ASC, itemname ASC, description ASC`
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

  async setupItemsTable() {
    try {
      const result = await database.query(
        `CREATE TABLE IF NOT EXISTS items (
          uid SERIAL PRIMARY KEY NOT NULL,
          itemname VARCHAR(64) NOT NULL,
          quantity INT NOT NULL CONSTRAINT nonnegative_quantity CHECK (quantity >= 0),
          description VARCHAR(64),
          tags VARCHAR(64)
        )`
      )
    } catch (error) {
      console.log("ERROR setting up ITEMS table", error)
    }
  }
}

items_db.setupItemsTable()

module.exports = items_db
