module.exports = app => {
  var item = require("../controllers/item.controller.js")

  var router = require("express").Router()

  // Create a new item
  router.post("/", item.createNew)

  // Get all items
  router.get("/", item.getAll)
  // Remove all items
  router.delete("/", item.removeAll)

  // Get a single item by UID
  router.get("/:uid", item.getByUid)
  // Update a single item with UID
  router.put("/:uid", item.updateByUid)
  // Remove a single item with UID
  router.delete("/:uid", item.removeByUid)

  app.use("/items", router)
}