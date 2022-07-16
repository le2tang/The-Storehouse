var cart = require("../controllers/cart.controller.js")

var router = require("express").Router()

// Create a new cart
router.post("/", cart.createNew)

// Get all carts
router.get("/", cart.getAll)
// Remove all carts
router.delete("/", cart.removeAll)

// Get a single cart by username
router.get("/:username", cart.getByUsername)
// Update a single cart with username
router.put("/:username", cart.updateByUsername)
// Remove a single cart with username
router.delete("/:username", cart.removeByUsername)

module.exports = router
