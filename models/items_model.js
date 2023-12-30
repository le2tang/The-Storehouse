const database = require("./database.js")

var items_model = {
  async create(item) {
    item.tags = item.tags.toLowerCase().replace(", ", ",")
    for (var field in item) {
      if (item[field] != null && item[field].length == 0) {
        item[field] = null
      }
    }

    var query = `UPDATE items SET quantity=quantity+${item.quantity} WHERE itemname='${item.itemname}' AND description='${item.description}';
    INSERT INTO items (itemname, quantity, description, tags) SELECT '${item.itemname}', ${item.quantity}, '${item.description}', '${item.tags}'
    WHERE NOT EXISTS (SELECT uid FROM items WHERE itemname='${item.itemname}' and description='${item.description}')`

    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating item with query ", query)
      console.log(err)
    }
  },

  async getAll() {
    var query = "SELECT * FROM items"
    try {
      var result = await database.query(query)
      return this.sortAlphabetical(result.rows)
    } catch (err) {
      console.log("Error fetching all items with query ", query)
      console.log(err)
    }
  },

  async removeAll() {
    var query = "DELETE FROM items"
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error deleting all items with query ", query)
      console.log(err)
    }
  },

  async getItemsByUids(uids) {
    var query = `SELECT * FROM items WHERE uid IN ('${uids.join("','")}')`
    try {
      var result = await database.query(query)
      return this.sortAlphabetical(result.rows)
    } catch (err) {
      console.log("Error selecting items with query ", query)
      console.log(err)
    }
  },

  async updateItemByUid(item) {
    for (elem in item) {
      if (item[elem] != null && item[elem].length == 0) {
        item[elem] = null
      }
    }
    var query = "UPDATE items SET itemname=$1, quantity=$2, description=$3, tags=$4 WHERE uid=$5"

    try {
      var result = await database.query(query, [item.itemname, item.quantity, item.description, item.tags, item.uid])
      return result
    } catch (err) {
      console.log("Error updating items with query ", query)
      console.log(err)
    }
  },

  async removeItemByUid(uid) {
    var query = `DELETE FROM items WHERE uid='${uid}'`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error removing items with query ", query)
      console.log(err)
    }
  },

  async setupItemsTable() {
    var query = `CREATE TABLE IF NOT EXISTS items (
      uid SERIAL PRIMARY KEY NOT NULL,
      itemname VARCHAR (20) NOT NULL,
      quantity INT NOT NULL CONSTRAINT nonnegative_quantity CHECK (quantity >= 0),
      description VARCHAR (32),
      tags VARCHAR (32))`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating items table ", query)
      console.log(err)
    }
  },

  async incrementQuantityByUid(increment, uid) {
    var query = `UPDATE items SET quantity=quantity+${increment} WHERE uid=${uid}`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error incrementing item quantity ", query)
      console.log(err)
    }
  },

  async decrementQuantityByUid(decrement, uid) {
    var query = `UPDATE items SET quantity=quantity-${decrement} WHERE uid=${uid}`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error decrementing item quantity ", query)
      console.log(err)
    }
  },

  sortAlphabetical(items) {
    items.forEach(function (item, idx, items) {
      if (item.description == "null") {
        items[idx].description = ""
      }
      if (item.tags == "null") {
        items[idx].tags = ""
      }
    })
    return items.sort((item1, item2) => {
      const itemname1 = item1.itemname.toLowerCase()
      const itemname2 = item2.itemname.toLowerCase()
      if (itemname1 < itemname2) {
        return -1
      }
      else if (itemname1 > itemname2) {
        return 1
      }

      if (item1.description.length > 0 && item2.description.length > 0) {
        const description1 = item1.description.toLowerCase()
        const description2 = item2.description.toLowerCase()
        if (description1 < description2) {
          return -1
        }
        else if (description1 > description2) {
          return 1
        }
      }
      else if (item1.description.length > 0) {
        return 1
      }
      else if (item2.description.length > 0) {
        return -1
      }

      return 0
    })
  }
}

items_model.setupItemsTable()

module.exports = items_model
