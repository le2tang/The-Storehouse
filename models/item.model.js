const db = require("./db.js")

var ItemList = {
  create(item, callback) {
    var query = "INSERT INTO items (uid, itemname, quantity, description, tags) VALUES ($1, $2, $3, $4, $5)"
    db.query(query, [item.uid, item.name, item.quantity, item.description, item.tags], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Created new item: ${res.insertId} ${item}`)
        callback(null, {id: res.insertId, ...item})
      }
    })
  },

  getAll(callback) {
    var query = "SELECT * FROM items"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Found items: ${res}`)
        callback(null, res)
      }
    })
  },

  removeAll(callback) {
    var query = "DELETE FROM items"
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else {
        console.log(`Deleted items: ${res}`)
        callback(null, res)
      }
    })
  },

  getByUid(uid, callback) {
    var query = `SELECT * FROM items WHERE uid=${uid}`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.length > 0) {
        console.log(`Found item: ${res[0]}`)
        callback(null, res[0])
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  updateByUid(item, callback) {
    var query = "UPDATE items SET name=?, quantity=?, description=?, tags=? WHERE uid=?"
    db.query(query, [item.name, item.quantity, item.description, item.tags, item.uid], (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Updated item: ${item}`)
        callback(null, item)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  },

  removeByUid(uid, callback) {
    var query = `DELETE FROM items WHERE uid=${uid}`
    db.query(query, (err, res) => {
      if (err) {
        console.log(`Error: ${err}`)
        callback(err, null)
      }
      else if (res.affectedRows > 0) {
        console.log(`Removed item: ${uid}`)
        callback(null, res)
      }
      else {
        callback({kind: "not_found"}, null)
      }
    })
  }
}

module.exports = ItemList
