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

      items = result.result.map((item) => this.formatItem(item))
      return {
        status: 200,
        result: items
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getRemaining() {
    try {
      const result = await items_db.getRemaining()
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      items = result.result.map((item) => this.formatItem(item))
      return {
        status: 200,
        result: items
      }
    } catch (error) {
      console.log(error)
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

      items = result.result.map((item) => this.formatItem(item))
      return {
        status: 200,
        result: items
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

      items = result.result.map((item) => this.formatItem(item))
      return {
        status: 200,
        result: items
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
  },

  toTitleCase(text) {
    function wordTitleCase(word) {
      firstLetterIdx = Array.from(word).findIndex((letter, idx) => letter.match(/[a-z]/i))
      if (firstLetterIdx < 0) {
        return word
      }

      word = String(word)

      prefix = word.slice(0, firstLetterIdx)
      firstLetter = word.charAt(firstLetterIdx).toUpperCase()
      suffix = word.slice(firstLetterIdx + 1)

      return prefix + firstLetter + suffix
    }

    words = text.split(" ")
    words = words.map((word, idx) => (idx == 0) || (word.length > 2) ? wordTitleCase(word) : word)

    return words.join(" ")
  },

  formatItem(item) {
    item.itemname = this.toTitleCase(item.itemname)
    item.description = this.toTitleCase(item.description)
    item.tags = item.tags.split(",")

    return item
  }
}

module.exports = items_model
