const items_db = require("../database/items_db.js")

const items_model = {
  async create(item) {
    try {
      item = this.cleanItem(item)

      const result = await items_db.create(item)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 201,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getAll() {
    try {
      const result = await items_db.getAll()
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async removeAll() {
    try {
      const result = await items_db.removeAll()
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getItemsByUids(uids) {
    try {
      const result = await items_db.getItemsByUids(
        uids
      )
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async updateItemByUid(item) {
    try {
      item = this.cleanItem(item)

      const result = await items_db.updateItemByUid(item)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async removeItemByUid(uid) {
    try {
      const result = await items_db.removeItemByUid(uid)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  cleanItem(item) {
    if (!("itemname" in item)) {
      item.itemname = ""
    } else {
      item.itemname = item.itemname.trim().toLowerCase()
      if (item.itemname.length > 0) {
        item.itemname[0] = item.itemname[0].toUpperCase()
      }
    }

    if (!("description" in item) || item.description.length == 0) {
      item.description = ""
    } else {
      item.description = item.description.trim().toLowerCase()
    }

    if (!("tags" in item) || item.tags.length == 0) {
      item.tags = ""
    } else {
      item.tags = item.tags.trim().toLowerCase().replace("\r", "").replace("\n", "")
    }

    return item
  }
}

module.exports = items_model
