var user = require("../controllers/user.controller.js")

var router = require("express").Router()

// Create a new user
router.post("/", user.createNew)

// Get all users
router.get("/", user.getAll)
// Remove all users
router.delete("/", user.removeAll)

// Get a single user by username
router.get("/:username", user.getByUsername)
// Update a single user with username
router.put("/:username", user.updateByUsername)
// Remove a single user with username
router.delete("/:username", user.removeByUsername)

module.exports = router
